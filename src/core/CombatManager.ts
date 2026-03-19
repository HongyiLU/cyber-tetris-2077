// ==================== CombatManager - 战斗管理器 ====================
// v2.0.0 Day 3 - 战斗系统核心类

import { HandManager } from './HandManager';
import { CardDatabase } from './CardDatabase';
import type { Card } from '../types/card.v2';
import { GAME_CONFIG } from '../config/game-config';

/**
 * 战斗状态枚举
 */
export enum CombatState {
  IDLE = 'idle',
  PLAYER_TURN = 'player_turn',
  ENEMY_TURN = 'enemy_turn',
  RESOLVING = 'resolving',
  VICTORY = 'victory',
  DEFEAT = 'defeat',
}

/**
 * 战斗结果接口
 */
export interface CombatResult {
  damageDealt: number;
  damageTaken: number;
  cardsPlayed: number;
  energySpent: number;
  turnsElapsed: number;
  victory: boolean;
}

/**
 * 战斗管理器（单例模式）
 * 负责管理战斗流程、伤害计算、状态转换
 */
export class CombatManager {
  private static instance: CombatManager;

  private handManager: HandManager;
  private cardDatabase: CardDatabase;

  // 玩家属性
  private playerHP: number;
  private playerMaxHP: number;

  // 敌人属性
  private enemyHP: number;
  private enemyMaxHP: number;

  // 战斗状态
  private state: CombatState;
  private combatResult: CombatResult | null;

  // 战斗统计
  private totalDamageDealt: number;
  private totalDamageTaken: number;
  private totalCardsPlayed: number;
  private totalEnergySpent: number;
  private turnsElapsed: number;

  // 玩家防御值（临时）
  private playerBlock: number;

  // 敌人攻击力
  private enemyAttackPower: number;

  /**
   * 私有构造函数（单例模式）
   */
  private constructor() {
    this.handManager = HandManager.getInstance();
    this.cardDatabase = CardDatabase.getInstance();
    this.playerHP = 50;
    this.playerMaxHP = 50;
    this.enemyHP = 0;
    this.enemyMaxHP = 0;
    this.state = CombatState.IDLE;
    this.combatResult = null;
    this.totalDamageDealt = 0;
    this.totalDamageTaken = 0;
    this.totalCardsPlayed = 0;
    this.totalEnergySpent = 0;
    this.turnsElapsed = 0;
    this.playerBlock = 0;
    this.enemyAttackPower = 5; // 默认敌人攻击力
  }

  /**
   * 获取单例实例
   */
  static getInstance(): CombatManager {
    if (!CombatManager.instance) {
      CombatManager.instance = new CombatManager();
    }
    return CombatManager.instance;
  }

  /**
   * 重置单例实例（用于测试或重新开始）
   */
  static resetInstance(): void {
    CombatManager.instance = undefined as unknown as CombatManager;
  }

  // ==================== 战斗流程控制 ====================

  /**
   * 开始战斗
   * @param enemyHP 敌人血量
   * @param enemyAttack 敌人攻击力（可选，默认 5）
   */
  startCombat(enemyHP: number, enemyAttack: number = 5): void {
    if (enemyHP <= 0) {
      throw new Error('敌人血量必须大于 0');
    }

    // 重置战斗状态
    this.enemyHP = enemyHP;
    this.enemyMaxHP = enemyHP;
    this.enemyAttackPower = enemyAttack;
    this.playerHP = this.playerMaxHP;
    this.playerBlock = 0;

    // 重置统计
    this.totalDamageDealt = 0;
    this.totalDamageTaken = 0;
    this.totalCardsPlayed = 0;
    this.totalEnergySpent = 0;
    this.turnsElapsed = 0;
    this.combatResult = null;

    // 重置手牌
    this.handManager.reset();
    this.handManager.initializeWithDefaultDeck();

    // 开始玩家回合
    this.state = CombatState.PLAYER_TURN;
    this.startPlayerTurn();
  }

  /**
   * 玩家回合开始
   * 重置能量和防御，抽牌
   */
  startPlayerTurn(): void {
    // 重置防御
    this.playerBlock = 0;

    // 恢复能量
    this.handManager.refillEnergy();

    // 抽牌
    this.handManager.draw(5);

    // 更新状态
    this.state = CombatState.PLAYER_TURN;
  }

  /**
   * 出牌
   * @param handIndex 手牌索引
   * @returns 是否出牌成功
   */
  playCard(handIndex: number): boolean {
    // 只能在玩家回合出牌
    if (this.state !== CombatState.PLAYER_TURN) {
      return false;
    }

    const hand = this.handManager.getHand();
    const card = hand[handIndex];

    // 检查手牌索引是否有效
    if (!card) {
      return false;
    }

    // 检查能量
    if (this.handManager.getEnergy() < card.cost) {
      return false;
    }

    // 消耗能量
    const energyResult = this.handManager.spendEnergy(card.cost);
    if (!energyResult.success) {
      return false;
    }

    this.totalEnergySpent += card.cost;

    // 打出卡牌（从手牌移到弃牌堆）
    const playResult = this.handManager.playCard(handIndex, card.cost);
    if (!playResult.success) {
      // 如果出牌失败，返还能量
      this.handManager.refundEnergy(card.cost);
      return false;
    }

    // 增加出牌计数
    this.totalCardsPlayed++;

    // 应用卡牌效果
    this.applyCardEffect(card);

    return true;
  }

  /**
   * 应用卡牌效果
   * @param card 使用的卡牌
   */
  applyCardEffect(card: Card): void {
    // 获取实际伤害和防御值（考虑升级）
    const actualDamage = card.upgradeDamage ?? card.damage;
    const actualBlock = card.upgradeBlock ?? card.block;

    // 处理伤害
    if (actualDamage > 0) {
      this.dealDamage(actualDamage);
    }

    // 处理防御
    if (actualBlock > 0) {
      this.playerBlock += actualBlock;
    }

    // 处理特殊效果（暂时简化处理）
    if (card.special) {
      this.handleSpecialEffect(card.special);
    }

    // 检查战斗是否结束
    this.checkCombatEnd();
  }

  /**
   * 处理特殊效果
   * @param specialEffect 特殊效果 ID
   */
  private handleSpecialEffect(specialEffect: string): void {
    // 根据特殊效果类型处理
    switch (specialEffect) {
      case 'heal_3hp':
        this.heal(3);
        break;
      case 'shield_5':
        // 护盾效果：增加 5 点防御
        this.playerBlock += 5;
        break;
      case 'pause_enemy_10s':
      case 'freeze_enemy_3s':
        // 暂时简化处理，不实现具体逻辑
        break;
      case 'lightning_chain':
        // 连锁伤害暂时简化处理
        this.dealDamage(3);
        break;
      case 'burn_10_5s':
        // 持续伤害暂时简化处理
        this.dealDamage(2);
        break;
      default:
        // 其他特殊效果暂不处理
        break;
    }
  }

  /**
   * 结束玩家回合
   */
  endPlayerTurn(): void {
    if (this.state !== CombatState.PLAYER_TURN) {
      return;
    }

    // 进入结算阶段
    this.state = CombatState.RESOLVING;

    // 敌人回合
    this.enemyTurn();
  }

  /**
   * 敌人回合
   */
  enemyTurn(): void {
    if (this.state !== CombatState.RESOLVING && this.state !== CombatState.PLAYER_TURN) {
      return;
    }

    this.state = CombatState.ENEMY_TURN;

    // 敌人攻击
    const damage = this.enemyAttackPower;
    this.takeDamage(damage);

    // 检查战斗是否结束
    const endState = this.checkCombatEnd();
    if (endState !== CombatState.VICTORY && endState !== CombatState.DEFEAT) {
      // 战斗继续，开始新的玩家回合
      this.turnsElapsed++;
      this.startPlayerTurn();
    }
  }

  /**
   * 造成伤害（对敌人）
   * @param damage 伤害值
   */
  dealDamage(damage: number): void {
    if (damage <= 0) return;

    const actualDamage = Math.max(0, damage);
    this.enemyHP = Math.max(0, this.enemyHP - actualDamage);
    this.totalDamageDealt += actualDamage;

    // 检查战斗是否结束
    this.checkCombatEnd();
  }

  /**
   * 受到伤害（玩家）
   * @param damage 伤害值
   */
  takeDamage(damage: number): void {
    if (damage <= 0) return;

    let remainingDamage = damage;

    // 先扣除防御
    if (this.playerBlock > 0) {
      if (this.playerBlock >= remainingDamage) {
        this.playerBlock -= remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= this.playerBlock;
        this.playerBlock = 0;
      }
    }

    // 剩余伤害扣除生命值
    if (remainingDamage > 0) {
      this.playerHP = Math.max(0, this.playerHP - remainingDamage);
      this.totalDamageTaken += remainingDamage;
    }

    // 检查战斗是否结束
    this.checkCombatEnd();
  }

  /**
   * 治疗
   * @param amount 治疗量
   */
  heal(amount: number): void {
    if (amount <= 0) return;
    this.playerHP = Math.min(this.playerMaxHP, this.playerHP + amount);
  }

  /**
   * 检查战斗是否结束
   * @returns 当前战斗状态
   */
  checkCombatEnd(): CombatState {
    // 敌人死亡
    if (this.enemyHP <= 0) {
      this.state = CombatState.VICTORY;
      this.combatResult = {
        damageDealt: this.totalDamageDealt,
        damageTaken: this.totalDamageTaken,
        cardsPlayed: this.totalCardsPlayed,
        energySpent: this.totalEnergySpent,
        turnsElapsed: this.turnsElapsed,
        victory: true,
      };
    }
    // 玩家死亡
    else if (this.playerHP <= 0) {
      this.state = CombatState.DEFEAT;
      this.combatResult = {
        damageDealt: this.totalDamageDealt,
        damageTaken: this.totalDamageTaken,
        cardsPlayed: this.totalCardsPlayed,
        energySpent: this.totalEnergySpent,
        turnsElapsed: this.turnsElapsed,
        victory: false,
      };
    }

    return this.state;
  }

  // ==================== Getter 方法 ====================

  /**
   * 获取当前战斗状态
   */
  getState(): CombatState {
    return this.state;
  }

  /**
   * 获取玩家血量
   */
  getPlayerHP(): { current: number; max: number } {
    return {
      current: this.playerHP,
      max: this.playerMaxHP,
    };
  }

  /**
   * 获取敌人血量
   */
  getEnemyHP(): { current: number; max: number } {
    return {
      current: this.enemyHP,
      max: this.enemyMaxHP,
    };
  }

  /**
   * 获取当前手牌
   */
  getHand(): Card[] {
    return this.handManager.getHand() as Card[];
  }

  /**
   * 获取当前能量
   */
  getEnergy(): number {
    return this.handManager.getEnergy();
  }

  /**
   * 获取当前防御值
   */
  getPlayerBlock(): number {
    return this.playerBlock;
  }

  /**
   * 获取战斗结果
   */
  getCombatResult(): CombatResult | null {
    return this.combatResult;
  }

  /**
   * 获取总伤害
   */
  getTotalDamageDealt(): number {
    return this.totalDamageDealt;
  }

  /**
   * 获取总受到伤害
   */
  getTotalDamageTaken(): number {
    return this.totalDamageTaken;
  }

  /**
   * 获取总出牌数
   */
  getTotalCardsPlayed(): number {
    return this.totalCardsPlayed;
  }

  /**
   * 获取总消耗能量
   */
  getTotalEnergySpent(): number {
    return this.totalEnergySpent;
  }

  /**
   * 获取回合数
   */
  getTurnsElapsed(): number {
    return this.turnsElapsed;
  }

  /**
   * 检查战斗是否结束
   */
  isCombatOver(): boolean {
    return this.state === CombatState.VICTORY || this.state === CombatState.DEFEAT;
  }

  /**
   * 检查是否胜利
   */
  isVictory(): boolean {
    return this.state === CombatState.VICTORY;
  }

  /**
   * 检查是否失败
   */
  isDefeat(): boolean {
    return this.state === CombatState.DEFEAT;
  }

  /**
   * 设置玩家最大血量
   * @param maxHP 最大血量
   */
  setPlayerMaxHP(maxHP: number): void {
    if (maxHP <= 0) return;
    this.playerMaxHP = maxHP;
    this.playerHP = Math.min(this.playerHP, this.playerMaxHP);
  }

  /**
   * 设置玩家当前血量
   * @param hp 血量值
   */
  setPlayerHP(hp: number): void {
    this.playerHP = Math.max(0, Math.min(hp, this.playerMaxHP));
  }
}

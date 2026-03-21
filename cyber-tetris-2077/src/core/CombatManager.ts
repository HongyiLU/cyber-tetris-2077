/**
 * @fileoverview 战斗管理 v2.0.0
 * 管理战斗流程、敌人、AI和战斗状态
 */

import { Card, CardSpecialEffect } from '../types/card.v2';
import { HandManager } from './HandManager';

/**
 * 敌人类型枚举
 */
export enum EnemyType {
  /** 普通敌人 */
  NORMAL = 'normal',
  /** 精英敌人 */
  ELITE = 'elite',
  /** BOSS */
  BOSS = 'boss',
}

/**
 * 敌人配置接口
 */
export interface EnemyConfig {
  /** 敌人名称 */
  name: string;
  /** 敌人类型 */
  type: EnemyType;
  /** 最大生命值 */
  maxHealth: number;
  /** 当前生命值 */
  health: number;
  /** 攻击力 */
  attack: number;
  /** 防御力（减伤） */
  defense: number;
  /** 攻击间隔（毫秒） */
  attackInterval: number;
  /** 稀有度权重 */
  rarityWeight: number;
}

/**
 * 敌人状态接口
 */
export interface EnemyState extends EnemyConfig {
  /** 是否有暂停效果 */
  isStunned: boolean;
  /** 暂停剩余时间 */
  stunRemaining: number;
  /** 中毒层数 */
  poisonStacks: number;
  /** 中毒剩余回合 */
  poisonDuration: number;
  /** 是否正在攻击 */
  isAttacking: boolean;
}

/**
 * 战斗阶段枚举
 */
export enum CombatPhase {
  /** 玩家回合开始 */
  PLAYER_TURN_START = 'player_turn_start',
  /** 玩家行动中 */
  PLAYER_ACTION = 'player_action',
  /** 玩家回合结束 */
  PLAYER_TURN_END = 'player_turn_end',
  /** 敌人回合 */
  ENEMY_TURN = 'enemy_turn',
  /** 战斗胜利 */
  VICTORY = 'victory',
  /** 战斗失败 */
  DEFEAT = 'defeat',
}

/**
 * 战斗状态接口
 */
export interface CombatState {
  /** 当前阶段 */
  phase: CombatPhase;
  /** 玩家生命值 */
  playerHealth: number;
  /** 玩家最大生命值 */
  playerMaxHealth: number;
  /** 玩家护盾 */
  playerShield: number;
  /** 当前能量 */
  energy: number;
  /** 最大能量 */
  maxEnergy: number;
  /** 敌人状态 */
  enemy: EnemyState | null;
  /** 消行数（本回合） */
  linesCleared: number;
  /** 总伤害（本回合） */
  totalDamage: number;
  /** 当前连击数 */
  comboCount: number;
  /** 回合数 */
  turnCount: number;
}

/**
 * 战斗管理类
 */
export class CombatManager {
  private state: CombatState;
  private handManager: HandManager;
  private lastEnemyAttackTime: number = 0;
  private stateChangeCallback?: (state: CombatState) => void;

  /** 基础能量 */
  private readonly BASE_ENERGY = 3;

  constructor() {
    this.handManager = new HandManager();
    this.state = this.createInitialState();
  }

  /**
   * 创建初始战斗状态
   */
  private createInitialState(): CombatState {
    return {
      phase: CombatPhase.PLAYER_TURN_START,
      playerHealth: 100,
      playerMaxHealth: 100,
      playerShield: 0,
      energy: this.BASE_ENERGY,
      maxEnergy: this.BASE_ENERGY,
      enemy: null,
      linesCleared: 0,
      totalDamage: 0,
      comboCount: 0,
      turnCount: 0,
    };
  }

  /**
   * 开始战斗
   * @param deck 玩家卡组
   * @param enemyConfig 敌人配置
   */
  startCombat(deck: Card[], enemyConfig: EnemyConfig): void {
    this.state = this.createInitialState();
    this.state.enemy = {
      ...enemyConfig,
      isStunned: false,
      stunRemaining: 0,
      poisonStacks: 0,
      poisonDuration: 0,
      isAttacking: false,
    };

    // 初始化手牌
    this.handManager.initializeHand(deck);

    // 第一回合
    this.startPlayerTurn();
  }

  /**
   * 开始玩家回合
   */
  startPlayerTurn(): void {
    this.state.phase = CombatPhase.PLAYER_TURN_START;
    this.state.turnCount++;
    this.state.linesCleared = 0;
    this.state.totalDamage = 0;
    this.state.comboCount = 0;
    this.state.energy = this.state.maxEnergy;

    // 抽牌
    this.handManager.drawCards(1);

    this.state.phase = CombatPhase.PLAYER_ACTION;
    this.notifyStateChange();
  }

  /**
   * 使用卡牌
   * @param cardId 卡牌ID
   * @param linesCleared 本次消除行数
   * @returns 卡牌效果结果
   */
  playCard(cardId: string, linesCleared: number): {
    success: boolean;
    damage: number;
    shield: number;
    heal: number;
    poison: number;
    message: string;
  } {
    if (this.state.phase !== CombatPhase.PLAYER_ACTION) {
      return { success: false, damage: 0, shield: 0, heal: 0, poison: 0, message: '不是行动阶段' };
    }

    const hand = this.handManager.getHand();
    const card = hand.find((c) => c.id === cardId);

    if (!card) {
      return { success: false, damage: 0, shield: 0, heal: 0, poison: 0, message: '手牌中没有这张卡' };
    }

    // 检查能量
    if (this.state.energy < card.cost) {
      return { success: false, damage: 0, shield: 0, heal: 0, poison: 0, message: '能量不足' };
    }

    // 消耗能量
    this.state.energy -= card.cost;

    // 使用卡牌
    this.handManager.playCard(cardId);

    // 计算效果
    let damage = 0;
    let shield = 0;
    let heal = 0;
    let poison = 0;
    let message = '';

    // 基础伤害
    if (card.damage !== undefined) {
      damage = card.damage;
    }

    // 连击伤害特殊处理
    if (card.specialEffect === CardSpecialEffect.COMBO_DAMAGE) {
      damage = linesCleared * (card.specialValue || 2);
    }

    // 护盾
    if (card.block !== undefined) {
      shield = card.block;
      this.state.playerShield += shield;
    }

    // 治疗
    if (card.heal !== undefined) {
      heal = card.heal;
      this.state.playerHealth = Math.min(
        this.state.playerMaxHealth,
        this.state.playerHealth + heal
      );
    }

    // 中毒
    if (card.specialEffect === CardSpecialEffect.POISON && card.specialValue !== undefined) {
      poison = card.specialValue;
      if (this.state.enemy) {
        this.state.enemy.poisonStacks += poison;
        this.state.enemy.poisonDuration = 3; // 默认3回合
      }
    }

    // 暂停敌人
    if (card.specialEffect === CardSpecialEffect.STUN && card.specialValue !== undefined) {
      if (this.state.enemy) {
        this.state.enemy.isStunned = true;
        this.state.enemy.stunRemaining = card.specialValue;
      }
    }

    // 应用伤害到敌人
    if (damage > 0 && this.state.enemy) {
      const actualDamage = Math.max(0, damage - this.state.enemy.defense);
      this.state.enemy.health -= actualDamage;
      this.state.totalDamage += actualDamage;

      // 更新连击
      if (linesCleared > 0) {
        this.state.comboCount += linesCleared;
      }

      // 检查敌人是否死亡
      if (this.state.enemy.health <= 0) {
        this.state.enemy.health = 0;
        this.state.phase = CombatPhase.VICTORY;
      }
    }

    // 更新本回合消行数
    this.state.linesCleared += linesCleared;

    message = `${card.name}！`;
    if (damage > 0) message += `造成 ${damage} 伤害`;
    if (shield > 0) message += `获得 ${shield} 护盾`;
    if (heal > 0) message += `恢复 ${heal} HP`;
    if (poison > 0) message += `敌人中毒 ${poison} 层`;

    this.notifyStateChange();

    return { success: true, damage, shield, heal, poison, message };
  }

  /**
   * 结束玩家回合
   */
  endTurn(): void {
    if (this.state.phase !== CombatPhase.PLAYER_ACTION) {
      return;
    }

    this.state.phase = CombatPhase.PLAYER_TURN_END;

    // 弃掉手牌
    this.handManager.discardHand();

    // 中毒效果
    if (this.state.enemy && this.state.enemy.poisonStacks > 0) {
      this.state.enemy.health -= this.state.enemy.poisonStacks;
      this.state.enemy.poisonDuration--;

      if (this.state.enemy.poisonDuration <= 0) {
        this.state.enemy.poisonStacks = 0;
      }

      if (this.state.enemy.health <= 0) {
        this.state.enemy.health = 0;
        this.state.phase = CombatPhase.VICTORY;
        this.notifyStateChange();
        return;
      }
    }

    // 敌人回合
    this.startEnemyTurn();
  }

  /**
   * 开始敌人回合
   */
  private startEnemyTurn(): void {
    this.state.phase = CombatPhase.ENEMY_TURN;

    // 如果敌人被暂停，跳过攻击
    if (this.state.enemy?.isStunned) {
      if (this.state.enemy.stunRemaining > 0) {
        this.state.enemy.stunRemaining--;
      }
      if (this.state.enemy.stunRemaining <= 0) {
        this.state.enemy.isStunned = false;
      }
      this.startPlayerTurn();
      return;
    }

    // 敌人攻击
    if (this.state.enemy) {
      const attackDamage = this.state.enemy.attack;

      // 护盾先抵消伤害
      if (this.state.playerShield > 0) {
        const shieldUsed = Math.min(this.state.playerShield, attackDamage);
        this.state.playerShield -= shieldUsed;
        this.state.playerHealth -= (attackDamage - shieldUsed);
      } else {
        this.state.playerHealth -= attackDamage;
      }

      // 检查玩家是否死亡
      if (this.state.playerHealth <= 0) {
        this.state.playerHealth = 0;
        this.state.phase = CombatPhase.DEFEAT;
      }
    }

    this.notifyStateChange();

    // 玩家回合开始
    if (this.state.phase !== CombatPhase.DEFEAT) {
      this.startPlayerTurn();
    }
  }

  /**
   * 应用敌人伤害到玩家（供外部系统如EnemyAI调用）
   * 确保伤害应用到CombatManager的实际状态而非副本
   * @param damage 伤害值
   */
  applyPlayerDamage(damage: number): void {
    if (!this.state.enemy) return;

    // 护盾先抵消伤害
    if (this.state.playerShield > 0) {
      const shieldUsed = Math.min(this.state.playerShield, damage);
      this.state.playerShield -= shieldUsed;
      this.state.playerHealth -= (damage - shieldUsed);
    } else {
      this.state.playerHealth -= damage;
    }

    // 限制最小值
    this.state.playerHealth = Math.max(0, this.state.playerHealth);

    // 检查玩家是否死亡
    if (this.state.playerHealth <= 0) {
      this.state.playerHealth = 0;
      this.state.phase = CombatPhase.DEFEAT;
      this.notifyStateChange();
    }
  }

  /**
   * 获取当前手牌
   */
  getHand(): Card[] {
    return this.handManager.getHand();
  }

  /**
   * 获取当前状态
   */
  getState(): CombatState {
    return { ...this.state };
  }

  /**
   * 获取抽牌堆/弃牌堆数量
   */
  getPileCounts(): { draw: number; discard: number } {
    return {
      draw: this.handManager.getDrawPileCount(),
      discard: this.handManager.getDiscardPileCount(),
    };
  }

  /**
   * 注册状态变化回调
   */
  registerStateChangeCallback(callback: (state: CombatState) => void): void {
    this.stateChangeCallback = callback;
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange(): void {
    this.stateChangeCallback?.(this.state);
  }

  /**
   * 生成随机敌人配置
   * @param stage 当前关卡
   */
  static generateEnemy(stage: number): EnemyConfig {
    const enemies: EnemyConfig[] = [
      {
        name: '街头混混',
        type: EnemyType.NORMAL,
        maxHealth: 30 + stage * 10,
        health: 30 + stage * 10,
        attack: 5 + stage * 2,
        defense: 0,
        attackInterval: 3000,
        rarityWeight: 60,
      },
      {
        name: '企业安保',
        type: EnemyType.NORMAL,
        maxHealth: 40 + stage * 10,
        health: 40 + stage * 10,
        attack: 8 + stage * 2,
        defense: 2,
        attackInterval: 2500,
        rarityWeight: 30,
      },
      {
        name: '精英雇佣兵',
        type: EnemyType.ELITE,
        maxHealth: 60 + stage * 15,
        health: 60 + stage * 15,
        attack: 12 + stage * 3,
        defense: 5,
        attackInterval: 2000,
        rarityWeight: 10,
      },
    ];

    // 根据权重随机选择
    const totalWeight = enemies.reduce((sum, e) => sum + e.rarityWeight, 0);
    let random = Math.random() * totalWeight;

    for (const enemy of enemies) {
      random -= enemy.rarityWeight;
      if (random <= 0) {
        return { ...enemy, health: enemy.maxHealth };
      }
    }

    return { ...enemies[0], health: enemies[0].maxHealth };
  }
}

/** 单例导出 */
export const combatManager = new CombatManager();

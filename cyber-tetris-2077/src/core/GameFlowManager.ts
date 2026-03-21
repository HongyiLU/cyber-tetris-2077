/**
 * @fileoverview 游戏流程管理 v2.0.0
 * 整合所有系统，实现完整游戏流程：
 * 主菜单 → 选择卡组 → 第1关战斗 → 奖励选择 → 第2关战斗 → ... → Boss战 → 胜利/失败
 */

import { Card } from '../types/card.v2';
import {
  GameStage,
  RewardOption,
  DeckBuilderState,
} from '../types/deck-builder';
import { CombatManager, CombatState, CombatPhase, EnemyConfig, EnemyType, combatManager } from './CombatManager';
import { DeckBuilder, deckBuilder } from './DeckBuilder';
import { RewardManager, rewardManager } from './RewardManager';
import { HandManager } from './HandManager';
import { StageManager } from './StageManager';
import { EnemyAI, EnemyAIType } from './EnemyAI';

/**
 * 游戏流程状态
 */
export interface GameFlowState {
  /** 当前游戏阶段 */
  gameStage: GameStage;
  /** 当前关卡 */
  currentStage: number;
  /** 当前卡组 */
  currentDeck: Card[];
  /** 战斗状态 */
  combatState: CombatState | null;
  /** 当前手牌 */
  hand: Card[];
  /** 奖励选项 */
  rewardOptions: RewardOption[];
  /** 敌人配置 */
  enemyConfig: EnemyConfig | null;
  /** 抽牌堆数量 */
  drawPileCount: number;
  /** 弃牌堆数量 */
  discardPileCount: number;
}

/**
 * 游戏流程事件回调
 */
export interface GameFlowCallbacks {
  /** 状态变化回调 */
  onStateChange?: (state: GameFlowState) => void;
  /** 战斗胜利回调 */
  onVictory?: () => void;
  /** 战斗失败回调 */
  onDefeat?: () => void;
  /** 游戏通关回调 */
  onGameComplete?: () => void;
  /** 伤害数字显示回调 */
  onDamageNumber?: (value: number, isPlayer: boolean) => void;
}

/**
 * 游戏流程管理类
 * 负责整合所有系统并管理完整游戏流程
 */
export class GameFlowManager {
  private state: GameFlowState;
  private callbacks: GameFlowCallbacks = {};
  private combatManager: CombatManager;
  private handManager: HandManager;
  private enemyAI: EnemyAI | null = null;
  private enemyAttackTimer: number | null = null;

  constructor() {
    this.state = this.createInitialState();
    this.combatManager = combatManager; // 使用单例
    this.handManager = new HandManager();
  }

  /**
   * 创建初始状态
   */
  private createInitialState(): GameFlowState {
    return {
      gameStage: GameStage.MENU,
      currentStage: 1,
      currentDeck: [],
      combatState: null,
      hand: [],
      rewardOptions: [],
      enemyConfig: null,
      drawPileCount: 0,
      discardPileCount: 0,
    };
  }

  /**
   * 注册回调
   */
  setCallbacks(callbacks: GameFlowCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange(): void {
    this.callbacks.onStateChange?.(this.getState());
  }

  /**
   * 开始新游戏
   */
  startNewGame(): void {
    // 重置状态
    this.state = this.createInitialState();

    // 使用DeckBuilder的起始卡组
    deckBuilder.startNewGame();
    const dbState = deckBuilder.getState();
    this.state.currentDeck = dbState.currentDeck;
    this.state.currentStage = dbState.currentStage;
    this.state.gameStage = GameStage.MENU;

    this.notifyStateChange();
  }

  /**
   * 开始战斗
   */
  startBattle(): void {
    const deck = this.state.currentDeck;
    if (deck.length === 0) {
      console.warn('[GameFlowManager] 卡组为空，无法开始战斗');
      return;
    }

    // 获取敌人配置
    const enemyConfig = this.generateEnemyForStage(this.state.currentStage);
    if (!enemyConfig) {
      console.error('[GameFlowManager] 无法生成敌人配置');
      return;
    }

    // 更新状态
    this.state.gameStage = GameStage.BATTLE;
    this.state.enemyConfig = enemyConfig;

    // 初始化战斗（使用单例CombatManager）
    this.combatManager.startCombat(deck, enemyConfig);
    this.state.combatState = this.combatManager.getState();
    this.state.hand = this.combatManager.getHand();

    // 注册战斗状态变化回调
    this.combatManager.registerStateChangeCallback((newState) => {
      this.state.combatState = newState;
      this.state.hand = this.combatManager.getHand();
      this.state.drawPileCount = this.combatManager.getPileCounts().draw;
      this.state.discardPileCount = this.combatManager.getPileCounts().discard;

      // 检查战斗结束
      if (newState.phase === CombatPhase.VICTORY) {
        this.handleVictory();
      } else if (newState.phase === CombatPhase.DEFEAT) {
        this.handleDefeat();
      }

      this.notifyStateChange();
    });

    // 初始化敌人AI
    this.initEnemyAI(enemyConfig);

    // 更新牌堆数量
    const pileCounts = this.combatManager.getPileCounts();
    this.state.drawPileCount = pileCounts.draw;
    this.state.discardPileCount = pileCounts.discard;

    this.notifyStateChange();
  }

  /**
   * 初始化敌人AI
   */
  private initEnemyAI(enemyConfig: EnemyConfig): void {
    if (!this.state.combatState?.enemy) return;

    const aiType = EnemyAI.getAITypeForEnemy(enemyConfig.type);
    this.enemyAI = new EnemyAI({
      aiType,
      baseAttackInterval: enemyConfig.attackInterval,
    });

    // 创建敌人状态的AI包装
    const enemyState = this.state.combatState.enemy;
    this.enemyAI.initialize(enemyState);

    // 注册敌人攻击回调
    this.enemyAI.onAttack((damage) => {
      this.applyEnemyDamage(damage);
    });

    // 启动敌人攻击定时器
    this.startEnemyAttackTimer();
  }

  /**
   * 启动敌人攻击定时器
   */
  private startEnemyAttackTimer(): void {
    if (this.enemyAttackTimer !== null) {
      clearInterval(this.enemyAttackTimer);
    }

    this.enemyAttackTimer = window.setInterval(() => {
      if (!this.enemyAI) return;
      if (!this.state.combatState) return;
      if (this.state.combatState.phase !== CombatPhase.PLAYER_ACTION) return;

      this.enemyAI.update(Date.now());
    }, 100); // 每100ms检查一次
  }

  /**
   * 停止敌人攻击定时器
   */
  private stopEnemyAttackTimer(): void {
    if (this.enemyAttackTimer !== null) {
      clearInterval(this.enemyAttackTimer);
      this.enemyAttackTimer = null;
    }
    // 取消EnemyAI中待处理的攻击回调，防止战斗结束后攻击仍触发
    if (this.enemyAI) {
      this.enemyAI.cancelPendingAttack();
    }
  }

  /**
   * 应用敌人伤害
   * 通过CombatManager的方法直接修改实际状态，避免副本不同步问题
   */
  private applyEnemyDamage(damage: number): void {
    // 通过CombatManager的方法应用伤害，确保状态一致性
    this.combatManager.applyPlayerDamage(damage);

    // 显示伤害数字
    this.callbacks.onDamageNumber?.(damage, true);

    // 触发状态更新（CombatManager的notifyStateChange会被调用）
    this.notifyStateChange();
  }

  /**
   * 生成指定关卡的敌人
   */
  private generateEnemyForStage(stage: number): EnemyConfig | null {
    const stageInfo = StageManager.getStageInfo(stage);
    if (!stageInfo) return null;

    // 使用StageManager生成敌人配置
    const baseConfig = StageManager.getEnemyConfig(stage);
    if (!baseConfig) return null;

    return {
      name: baseConfig.name,
      type: baseConfig.type,
      maxHealth: baseConfig.maxHealth,
      health: baseConfig.health,
      attack: baseConfig.attack,
      defense: baseConfig.defense,
      attackInterval: baseConfig.attackInterval,
      rarityWeight: stageInfo.isBoss ? 100 : 50,
    };
  }

  /**
   * 使用卡牌
   * @param cardId 卡牌ID
   * @param linesCleared 本次消除行数
   */
  playCard(cardId: string, linesCleared: number): {
    success: boolean;
    damage: number;
    shield: number;
    heal: number;
    poison: number;
    message: string;
  } {
    if (this.state.gameStage !== GameStage.BATTLE) {
      return { success: false, damage: 0, shield: 0, heal: 0, poison: 0, message: '不在战斗中' };
    }

    const result = this.combatManager.playCard(cardId, linesCleared);

    if (result.success) {
      // 更新手牌
      this.state.hand = this.combatManager.getHand();

      // 显示玩家造成的伤害
      if (result.damage > 0) {
        this.callbacks.onDamageNumber?.(result.damage, false);
      }

      // 更新状态
      this.state.combatState = this.combatManager.getState();
    }

    this.notifyStateChange();
    return result;
  }

  /**
   * 结束回合
   */
  endTurn(): void {
    if (this.state.gameStage !== GameStage.BATTLE) return;
    this.combatManager.endTurn();
    this.state.combatState = this.combatManager.getState();
    this.notifyStateChange();
  }

  /**
   * 处理战斗胜利
   */
  private handleVictory(): void {
    this.stopEnemyAttackTimer();

    // 如果是最后一关（BOSS），标记游戏通关
    if (StageManager.isBossStage(this.state.currentStage)) {
      this.state.gameStage = GameStage.VICTORY;
      this.callbacks.onGameComplete?.();
    } else {
      // 显示奖励选择
      this.showRewards();
      this.callbacks.onVictory?.();
    }

    this.notifyStateChange();
  }

  /**
   * 处理战斗失败
   */
  private handleDefeat(): void {
    this.stopEnemyAttackTimer();
    this.state.gameStage = GameStage.DEFEAT;
    this.callbacks.onDefeat?.();
    this.notifyStateChange();
  }

  /**
   * 显示奖励选择
   */
  showRewards(): void {
    // 初始化奖励管理器
    rewardManager.initialize(this.state.currentDeck, this.state.currentStage);

    // 生成奖励选项
    const options = rewardManager.generateRewards();
    this.state.rewardOptions = options;
    this.state.gameStage = GameStage.REWARD_SELECT;

    this.notifyStateChange();
  }

  /**
   * 选择奖励
   * @param optionIndex 选项索引
   */
  selectReward(optionIndex: number): void {
    const card = rewardManager.selectReward(optionIndex);
    if (card) {
      // 更新卡组
      this.state.currentDeck = rewardManager.getDeck();
    }

    // 返回主菜单
    this.state.gameStage = GameStage.MENU;
    this.notifyStateChange();
  }

  /**
   * 跳过奖励
   */
  skipReward(): void {
    rewardManager.skipReward();
    this.state.gameStage = GameStage.MENU;
    this.notifyStateChange();
  }

  /**
   * 进入下一关
   */
  nextStage(): void {
    const nextStage = StageManager.getNextStage(this.state.currentStage);
    if (nextStage === null) {
      // 已通关所有关卡
      this.state.gameStage = GameStage.VICTORY;
      this.callbacks.onGameComplete?.();
    } else {
      this.state.currentStage = nextStage;
      this.state.gameStage = GameStage.MENU;
    }
    this.notifyStateChange();
  }

  /**
   * 返回主菜单
   */
  returnToMenu(): void {
    this.stopEnemyAttackTimer();
    this.state.gameStage = GameStage.MENU;
    this.notifyStateChange();
  }

  /**
   * 重新开始战斗
   */
  restartBattle(): void {
    this.startBattle();
  }

  /**
   * 获取当前状态
   */
  getState(): GameFlowState {
    return { ...this.state };
  }

  /**
   * 获取当前游戏阶段
   */
  getGameStage(): GameStage {
    return this.state.gameStage;
  }

  /**
   * 获取当前关卡
   */
  getCurrentStage(): number {
    return this.state.currentStage;
  }

  /**
   * 获取奖励选项
   */
  getRewardOptions(): RewardOption[] {
    return [...this.state.rewardOptions];
  }

  /**
   * 获取当前卡组
   */
  getDeck(): Card[] {
    return [...this.state.currentDeck];
  }

  /**
   * 添加卡牌到卡组
   * @param card 要添加的卡牌
   */
  addCardToDeck(card: Card): void {
    this.state.currentDeck.push(card);
    this.notifyStateChange();
  }

  /**
   * 移除卡牌
   * @param cardId 卡牌ID
   */
  removeCardFromDeck(cardId: string): boolean {
    const index = this.state.currentDeck.findIndex((c) => c.id === cardId);
    if (index === -1) return false;
    this.state.currentDeck.splice(index, 1);
    this.notifyStateChange();
    return true;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.stopEnemyAttackTimer();
    this.enemyAI = null;
  }
}

/** 单例导出 */
export const gameFlowManager = new GameFlowManager();

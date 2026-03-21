/**
 * @fileoverview 卡组构筑管理 v2.0.0
 * 管理整个rogue-like流程的状态和流程控制
 */

import { Card, CardRarity } from '../types/card.v2';
import {
  DeckBuilderState,
  GameStage,
  RewardOption,
  createDefaultDeckBuilderState,
} from '../types/deck-builder';
import { cardDatabase } from './CardDatabase';
import { CombatManager, combatManager } from './CombatManager';
import { RewardManager } from './RewardManager';

/**
 * 卡组构筑管理类
 * 管理整个游戏流程：主菜单 -> 战斗 -> 奖励 -> 下一关/胜利/失败
 */
export class DeckBuilder {
  private state: DeckBuilderState;
  private combatManager: CombatManager;
  private rewardManager: RewardManager;
  private stateChangeCallback?: (state: DeckBuilderState) => void;

  /** 默认起始卡组 */
  private readonly STARTER_DECK: Card[];

  constructor() {
    this.state = createDefaultDeckBuilderState();
    this.combatManager = combatManager; // 使用单例
    this.rewardManager = new RewardManager();

    // 创建起始卡组
    this.STARTER_DECK = this.createStarterDeck();

    // 注册奖励回调
    this.rewardManager.onSelect((card) => {
      console.log(`[DeckBuilder] 获得卡牌: ${card.name}`);
    });

    this.rewardManager.onSkip((gold) => {
      console.log(`[DeckBuilder] 跳过奖励，获得 ${gold} 金币`);
    });
  }

  /**
   * 创建起始卡组
   */
  private createStarterDeck(): Card[] {
    const deck: Card[] = [];

    // 2张 I 方块
    for (let i = 0; i < 2; i++) {
      const card = cardDatabase.getCardById('i_block');
      if (card) {
        deck.push({ ...card, id: `i_block_${i}` });
      }
    }

    // 2张 O 方块
    for (let i = 0; i < 2; i++) {
      const card = cardDatabase.getCardById('o_block');
      if (card) {
        deck.push({ ...card, id: `o_block_${i}` });
      }
    }

    // 2张 L 方块
    for (let i = 0; i < 2; i++) {
      const card = cardDatabase.getCardById('l_block');
      if (card) {
        deck.push({ ...card, id: `l_block_${i}` });
      }
    }

    // 2张 J 方块
    for (let i = 0; i < 2; i++) {
      const card = cardDatabase.getCardById('j_block');
      if (card) {
        deck.push({ ...card, id: `j_block_${i}` });
      }
    }

    // 2张 T 方块
    for (let i = 0; i < 2; i++) {
      const card = cardDatabase.getCardById('t_block');
      if (card) {
        deck.push({ ...card, id: `t_block_${i}` });
      }
    }

    return deck;
  }

  /**
   * 开始新游戏
   */
  startNewGame(): void {
    this.state = createDefaultDeckBuilderState();
    this.state.currentDeck = this.STARTER_DECK.map((c) => ({ ...c }));
    this.state.gameStage = GameStage.MENU;
    this.notifyStateChange();
  }

  /**
   * 开始战斗
   */
  startBattle(): void {
    if (this.state.currentDeck.length === 0) {
      console.warn('[DeckBuilder] 卡组为空，无法开始战斗');
      return;
    }

    this.state.gameStage = GameStage.BATTLE;
    this.notifyStateChange();

    // 生成敌人
    const enemy = CombatManager.generateEnemy(this.state.currentStage);

    // 开始战斗
    this.combatManager.startCombat(this.state.currentDeck, enemy);
  }

  /**
   * 进入奖励选择阶段
   */
  showRewards(): void {
    this.state.gameStage = GameStage.REWARD_SELECT;
    this.rewardManager.initialize(this.state.currentDeck, this.state.currentStage);
    this.state.currentRewardOptions = this.rewardManager.generateRewards();
    this.notifyStateChange();
  }

  /**
   * 选择奖励
   * @param optionIndex 选项索引
   */
  selectReward(optionIndex: number): void {
    const card = this.rewardManager.selectReward(optionIndex);
    if (card) {
      this.state.currentDeck = this.rewardManager.getDeck();
    }
    this.state.gameStage = GameStage.MENU;
    this.notifyStateChange();
  }

  /**
   * 跳过奖励
   */
  skipReward(): void {
    this.rewardManager.skipReward();
    this.state.gameStage = GameStage.MENU;
    this.notifyStateChange();
  }

  /**
   * 进入下一关
   */
  nextStage(): void {
    this.state.currentStage++;
    this.state.gameStage = GameStage.MENU;
    this.notifyStateChange();
  }

  /**
   * 返回主菜单
   */
  returnToMenu(): void {
    this.state.gameStage = GameStage.MENU;
    this.notifyStateChange();
  }

  /**
   * 标记胜利
   */
  markVictory(): void {
    this.state.gameStage = GameStage.VICTORY;
    this.notifyStateChange();
  }

  /**
   * 标记失败
   */
  markDefeat(): void {
    this.state.gameStage = GameStage.DEFEAT;
    this.notifyStateChange();
  }

  /**
   * 获取当前状态
   */
  getState(): DeckBuilderState {
    return { ...this.state };
  }

  /**
   * 获取游戏阶段
   */
  getGameStage(): GameStage {
    return this.state.gameStage;
  }

  /**
   * 获取当前卡组
   */
  getDeck(): Card[] {
    return [...this.state.currentDeck];
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
    return [...this.state.currentRewardOptions];
  }

  /**
   * 移除卡牌
   * @param cardId 卡牌ID
   */
  removeCard(cardId: string): boolean {
    const index = this.state.currentDeck.findIndex((c) => c.id === cardId);
    if (index === -1) {
      return false;
    }
    this.state.currentDeck.splice(index, 1);
    this.notifyStateChange();
    return true;
  }

  /**
   * 获取卡组统计信息
   */
  getDeckStats(): {
    totalCards: number;
    byRarity: Record<CardRarity, number>;
    avgCost: number;
  } {
    const byRarity: Record<CardRarity, number> = {
      [CardRarity.COMMON]: 0,
      [CardRarity.UNCOMMON]: 0,
      [CardRarity.RARE]: 0,
      [CardRarity.EPIC]: 0,
      [CardRarity.LEGENDARY]: 0,
    };

    let totalCost = 0;

    for (const card of this.state.currentDeck) {
      byRarity[card.rarity]++;
      totalCost += card.cost;
    }

    return {
      totalCards: this.state.currentDeck.length,
      byRarity,
      avgCost: this.state.currentDeck.length > 0
        ? totalCost / this.state.currentDeck.length
        : 0,
    };
  }

  /**
   * 注册状态变化回调
   */
  registerStateChangeCallback(callback: (state: DeckBuilderState) => void): void {
    this.stateChangeCallback = callback;
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange(): void {
    this.stateChangeCallback?.(this.state);
  }
}

/** 单例导出 */
export const deckBuilder = new DeckBuilder();

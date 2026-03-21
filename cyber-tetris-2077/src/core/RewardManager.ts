/**
 * @fileoverview 奖励管理 v2.0.0
 * 管理战斗后奖励选择和卡组更新
 */

import { Card } from '../types/card.v2';
import { RewardOption } from '../types/deck-builder';
import { cardDatabase } from './CardDatabase';

/**
 * 奖励管理状态
 */
export interface RewardState {
  /** 当前可选择的奖励 */
  options: RewardOption[];
  /** 是否正在显示奖励选择 */
  isSelecting: boolean;
  /** 是否已完成选择 */
  isComplete: boolean;
}

/**
 * 奖励管理类
 */
export class RewardManager {
  private state: RewardState;
  private currentDeck: Card[];
  private currentStage: number;
  private onRewardSelected?: (card: Card) => void;
  private onRewardSkipped?: (goldAmount: number) => void;

  constructor() {
    this.state = {
      options: [],
      isSelecting: false,
      isComplete: false,
    };
    this.currentDeck = [];
    this.currentStage = 1;
  }

  /**
   * 初始化奖励管理器
   * @param deck 当前卡组
   * @param stage 当前关卡
   */
  initialize(deck: Card[], stage: number): void {
    this.currentDeck = [...deck];
    this.currentStage = stage;
    this.state.isComplete = false;
  }

  /**
   * 生成奖励选项
   * @returns 奖励选项数组
   */
  generateRewards(): RewardOption[] {
    const rawOptions = cardDatabase.generateRewardOptions(
      this.currentDeck,
      this.currentStage
    );
    // 为每个选项添加唯一ID，用于可靠查找
    this.state.options = rawOptions.map((option, index) => ({
      ...option,
      id: `reward_${Date.now()}_${index}`,
    }));
    this.state.isSelecting = true;
    this.state.isComplete = false;
    return this.state.options;
  }

  /**
   * 选择奖励卡牌
   * @param optionIndex 选项索引
   * @returns 选中的卡牌
   */
  selectReward(optionIndex: number): Card | null {
    if (optionIndex < 0 || optionIndex >= this.state.options.length) {
      return null;
    }

    const option = this.state.options[optionIndex];
    if (!option || option.cards.length === 0) {
      return null;
    }

    const selectedCard = option.cards[0];

    // 添加到卡组
    this.addCardToDeck(selectedCard);

    this.state.isSelecting = false;
    this.state.isComplete = true;
    this.onRewardSelected?.(selectedCard);

    return selectedCard;
  }

  /**
   * 跳过奖励（获得金币）
   * @returns 获得的金币数
   */
  skipReward(): number {
    const goldAmount = 10; // 跳过奖励获得10金币
    this.state.isSelecting = false;
    this.state.isComplete = true;
    this.onRewardSkipped?.(goldAmount);
    return goldAmount;
  }

  /**
   * 添加卡牌到卡组
   * @param card 要添加的卡牌
   */
  private addCardToDeck(card: Card): void {
    // 检查卡组是否已满（最大30张）
    if (this.currentDeck.length >= 30) {
      console.warn('[RewardManager] 卡组已满（30张），无法添加更多卡牌');
      return;
    }

    // 检查是否已满3张同名卡
    const sameCardCount = this.currentDeck.filter(
      (c) => c.id === card.id
    ).length;
    if (sameCardCount >= 3) {
      console.warn(`[RewardManager] ${card.name} 已达到最大数量（3张）`);
      return;
    }

    // 添加到卡组（克隆以避免引用问题）
    this.currentDeck.push({
      ...card,
      id: `${card.id}_${Date.now()}`, // 生成新ID
    });
  }

  /**
   * 获取当前卡组
   */
  getDeck(): Card[] {
    return [...this.currentDeck];
  }

  /**
   * 获取奖励选项
   */
  getOptions(): RewardOption[] {
    return [...this.state.options];
  }

  /**
   * 获取状态
   */
  getState(): RewardState {
    return { ...this.state };
  }

  /**
   * 是否正在选择
   */
  isSelecting(): boolean {
    return this.state.isSelecting;
  }

  /**
   * 注册奖励选择回调
   */
  onSelect(callback: (card: Card) => void): void {
    this.onRewardSelected = callback;
  }

  /**
   * 注册跳过奖励回调
   */
  onSkip(callback: (goldAmount: number) => void): void {
    this.onRewardSkipped = callback;
  }

  /**
   * 重置奖励状态
   */
  reset(): void {
    this.state = {
      options: [],
      isSelecting: false,
      isComplete: false,
    };
  }

  /**
   * 移除卡牌（升级用）
   * @param cardId 要移除的卡牌ID
   */
  removeCard(cardId: string): boolean {
    const index = this.currentDeck.findIndex((c) => c.id === cardId);
    if (index === -1) {
      return false;
    }
    this.currentDeck.splice(index, 1);
    return true;
  }

  /**
   * 升级卡牌
   * @param cardId 要升级的卡牌ID
   * @returns 升级后的卡牌
   */
  upgradeCard(cardId: string): Card | null {
    const card = this.currentDeck.find((c) => c.id === cardId);
    if (!card) {
      return null;
    }

    // 应用升级效果
    const upgradedCard = cardDatabase.getUpgradeEffect(card);
    const index = this.currentDeck.findIndex((c) => c.id === cardId);
    this.currentDeck[index] = upgradedCard;

    return upgradedCard;
  }

  /**
   * 获取卡组中同名卡的数量
   * @param cardId 卡牌ID
   */
  getSameCardCount(cardId: string): number {
    return this.currentDeck.filter((c) => c.id === cardId).length;
  }
}

/** 单例导出 */
export const rewardManager = new RewardManager();

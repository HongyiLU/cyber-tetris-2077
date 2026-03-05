// ==================== 卡组管理器 ====================

import { GAME_CONFIG } from '../config/game-config';
import type { CardData, PieceType } from '../types';

/**
 * 卡牌稀有度权重
 */
const RARITY_WEIGHTS: Record<string, number> = {
  common: 50,
  uncommon: 30,
  rare: 15,
  epic: 4,
  legendary: 1,
};

/**
 * 卡组管理器类
 * 负责卡牌的收集、抽卡、卡组构建等功能
 */
export class DeckManager {
  private collectedCards: Set<string>;
  private currentDeck: string[];
  private readonly maxDeckSize: number;

  constructor(maxDeckSize: number = 10) {
    this.collectedCards = new Set();
    this.currentDeck = [];
    this.maxDeckSize = maxDeckSize;
    
    // 初始化时解锁所有基础方块
    this.initializeBasicCards();
  }

  /**
   * 初始化基础卡牌（解锁所有基础方块）
   */
  private initializeBasicCards(): void {
    const basicCards = GAME_CONFIG.CARDS.filter(card => card.type === 'basic');
    basicCards.forEach(card => {
      this.collectedCards.add(card.id);
    });
  }

  /**
   * 获取所有卡牌数据
   */
  public getAllCards(): CardData[] {
    return GAME_CONFIG.CARDS as CardData[];
  }

  /**
   * 获取已收集的卡牌
   */
  public getCollectedCards(): CardData[] {
    const collectedIds = Array.from(this.collectedCards);
    return GAME_CONFIG.CARDS.filter(card => collectedIds.includes(card.id)) as CardData[];
  }

  /**
   * 获取未收集的卡牌
   */
  public getUncollectedCards(): CardData[] {
    const collectedIds = Array.from(this.collectedCards);
    return GAME_CONFIG.CARDS.filter(card => !collectedIds.includes(card.id)) as CardData[];
  }

  /**
   * 检查是否已收集某张卡牌
   */
  public hasCard(cardId: string): boolean {
    return this.collectedCards.has(cardId);
  }

  /**
   * 解锁新卡牌
   */
  public unlockCard(cardId: string): boolean {
    if (this.collectedCards.has(cardId)) {
      return false; // 已经拥有
    }
    
    this.collectedCards.add(cardId);
    return true;
  }

  /**
   * 获取当前卡组
   */
  public getCurrentDeck(): string[] {
    return [...this.currentDeck];
  }

  /**
   * 向卡组添加卡牌
   */
  public addToDeck(cardId: string): boolean {
    // 检查是否已收集
    if (!this.collectedCards.has(cardId)) {
      console.warn(`卡牌 ${cardId} 未收集，无法添加到卡组`);
      return false;
    }

    // 检查是否已在卡组中
    if (this.currentDeck.includes(cardId)) {
      console.warn(`卡牌 ${cardId} 已在卡组中`);
      return false;
    }

    // 检查卡组大小
    if (this.currentDeck.length >= this.maxDeckSize) {
      console.warn(`卡组已达上限 (${this.maxDeckSize})`);
      return false;
    }

    this.currentDeck.push(cardId);
    return true;
  }

  /**
   * 从卡组移除卡牌
   */
  public removeFromDeck(cardId: string): boolean {
    const index = this.currentDeck.indexOf(cardId);
    if (index === -1) {
      return false;
    }
    
    this.currentDeck.splice(index, 1);
    return true;
  }

  /**
   * 清空卡组
   */
  public clearDeck(): void {
    this.currentDeck = [];
  }

  /**
   * 自动填充卡组（使用所有已收集的基础方块）
   */
  public autoFillDeck(): void {
    this.clearDeck();
    
    const basicCards = GAME_CONFIG.CARDS.filter(
      card => card.type === 'basic' && this.collectedCards.has(card.id)
    );
    
    // 按稀有度排序
    basicCards.sort((a, b) => {
      const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
    });
    
    // 填充到卡组上限
    for (const card of basicCards) {
      if (this.currentDeck.length >= this.maxDeckSize) break;
      this.currentDeck.push(card.id);
    }
  }

  /**
   * 抽卡（从当前卡组中随机选择一张）
   */
  public drawCard(): CardData | null {
    if (this.currentDeck.length === 0) {
      // 如果卡组为空，自动填充
      this.autoFillDeck();
    }

    if (this.currentDeck.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * this.currentDeck.length);
    const cardId = this.currentDeck[randomIndex];
    
    return (GAME_CONFIG.CARDS.find(card => card.id === cardId) as CardData) || null;
  }

  /**
   * 根据稀有度抽卡（用于奖励系统）
   */
  public drawByRarity(targetRarity?: string): CardData | null {
    const cards = GAME_CONFIG.CARDS.filter(card => {
      if (targetRarity) {
        return card.rarity === targetRarity && !this.collectedCards.has(card.id);
      }
      return !this.collectedCards.has(card.id);
    }) as CardData[];

    if (cards.length === 0) {
      return null; // 所有卡牌都已收集
    }

    // 如果没有指定稀有度，根据权重随机选择
    if (!targetRarity) {
      const totalWeight = cards.reduce((sum, card) => {
        return sum + (RARITY_WEIGHTS[card.rarity] || 1);
      }, 0);

      let random = Math.random() * totalWeight;
      
      for (const card of cards) {
        const weight = RARITY_WEIGHTS[card.rarity] || 1;
        random -= weight;
        
        if (random <= 0) {
          return card;
        }
      }
      
      return cards[0];
    }

    // 指定稀有度，随机选择一张
    const randomIndex = Math.floor(Math.random() * cards.length);
    return cards[randomIndex];
  }

  /**
   * 获取卡组统计信息
   */
  public getDeckStats(): {
    totalCards: number;
    collectedCount: number;
    totalCollected: number;
    deckSize: number;
  } {
    return {
      totalCards: GAME_CONFIG.CARDS.length,
      collectedCount: this.collectedCards.size,
      totalCollected: GAME_CONFIG.CARDS.length,
      deckSize: this.currentDeck.length,
    };
  }

  /**
   * 导出卡组配置
   */
  public exportDeck(): string {
    return JSON.stringify({
      collected: Array.from(this.collectedCards),
      deck: [...this.currentDeck],
    });
  }

  /**
   * 导入卡组配置
   */
  public importDeck(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.collected && Array.isArray(parsed.collected)) {
        this.collectedCards = new Set(parsed.collected);
      }
      
      if (parsed.deck && Array.isArray(parsed.deck)) {
        this.currentDeck = parsed.deck.slice(0, this.maxDeckSize);
      }
      
      return true;
    } catch (error) {
      console.error('导入卡组失败:', error);
      return false;
    }
  }

  /**
   * 重置进度（用于测试）
   */
  public reset(): void {
    this.collectedCards.clear();
    this.currentDeck = [];
    this.initializeBasicCards();
  }
}

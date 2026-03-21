/**
 * @fileoverview 手牌管理 v2.0.0
 * 管理战斗中的手牌、抽牌、弃牌逻辑
 */

import { Card } from '../types/card.v2';

/**
 * 手牌状态接口
 */
export interface HandState {
  /** 当前手牌 */
  cards: Card[];
  /** 抽牌堆 */
  drawPile: Card[];
  /** 弃牌堆 */
  discardPile: Card[];
  /** 牌堆是否已用完需要洗牌 */
  isDeckExhausted: boolean;
}

/**
 * 手牌管理类
 */
export class HandManager {
  private state: HandState;

  /** 最大手牌数 */
  private readonly MAX_HAND_SIZE = 5;

  constructor() {
    this.state = {
      cards: [],
      drawPile: [],
      discardPile: [],
      isDeckExhausted: false,
    };
  }

  /**
   * 初始化手牌（从卡组抽牌开始战斗）
   * @param deck 玩家卡组
   */
  initializeHand(deck: Card[]): void {
    // 将卡组复制到抽牌堆（洗牌）
    this.state.drawPile = this.shuffle([...deck]);
    this.state.discardPile = [];
    this.state.cards = [];
    this.state.isDeckExhausted = false;

    // 抽初始手牌
    this.drawCards(this.MAX_HAND_SIZE);
  }

  /**
   * 抽牌
   * @param count 抽牌数量
   */
  drawCards(count: number): Card[] {
    const drawnCards: Card[] = [];

    for (let i = 0; i < count; i++) {
      // 如果抽牌堆为空，洗牌弃牌堆
      if (this.state.drawPile.length === 0) {
        if (this.state.discardPile.length === 0) {
          this.state.isDeckExhausted = true;
          break;
        }
        this.state.drawPile = this.shuffle([...this.state.discardPile]);
        this.state.discardPile = [];
      }

      const card = this.state.drawPile.pop();
      if (card && this.state.cards.length < this.MAX_HAND_SIZE) {
        this.state.cards.push(card);
        drawnCards.push(card);
      }
    }

    return drawnCards;
  }

  /**
   * 使用手牌
   * @param cardId 要使用的卡牌ID
   * @returns 是否成功使用
   */
  playCard(cardId: string): boolean {
    const cardIndex = this.state.cards.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) {
      return false;
    }

    // 将卡牌移到弃牌堆
    const [card] = this.state.cards.splice(cardIndex, 1);
    this.state.discardPile.push(card);

    return true;
  }

  /**
   * 弃掉所有手牌
   */
  discardHand(): void {
    this.state.discardPile.push(...this.state.cards);
    this.state.cards = [];
  }

  /**
   * 获取当前手牌
   */
  getHand(): Card[] {
    return [...this.state.cards];
  }

  /**
   * 获取抽牌堆数量
   */
  getDrawPileCount(): number {
    return this.state.drawPile.length;
  }

  /**
   * 获取弃牌堆数量
   */
  getDiscardPileCount(): number {
    return this.state.discardPile.length;
  }

  /**
   * 获取状态
   */
  getState(): HandState {
    return { ...this.state };
  }

  /**
   * Fisher-Yates 洗牌
   */
  private shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/** 单例导出 */
export const handManager = new HandManager();

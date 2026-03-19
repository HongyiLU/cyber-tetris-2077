// ==================== HandManager - 手牌管理类 ====================
// v2.0.0 Day 2 - 手牌管理核心类

import type { Card } from '../types/card.v2';
import { CardDatabase } from './CardDatabase';
import type {
  HandConfig,
  HandState,
  EnergyResult,
  PlayCardResult,
  DrawResult,
  DiscardResult,
  HandSnapshot,
} from '../types/hand';
import { HandState as HandStateEnum } from '../types/hand';

/**
 * 默认手牌配置
 */
const DEFAULT_HAND_CONFIG: HandConfig = {
  maxHandSize: 7,
  initialDraw: 5,
  energyPerTurn: 3,
  maxEnergy: 3,
};

/**
 * 手牌管理类
 * 负责管理玩家的手牌、抽牌堆、弃牌堆和能量系统
 */
export class HandManager {
  private static instance: HandManager;

  private hand: Card[];           // 当前手牌
  private drawPile: Card[];       // 抽牌堆
  private discardPile: Card[];    // 弃牌堆
  private energy: number;              // 当前能量
  private maxEnergy: number;           // 最大能量
  private state: HandState;           // 手牌状态
  private config: HandConfig;         // 配置
  private cardDatabase: CardDatabase; // 卡牌数据库

  /**
   * 私有构造函数（单例模式）
   */
  private constructor(config?: Partial<HandConfig>) {
    this.config = {
      maxHandSize: config?.maxHandSize ?? DEFAULT_HAND_CONFIG.maxHandSize,
      initialDraw: config?.initialDraw ?? DEFAULT_HAND_CONFIG.initialDraw,
      energyPerTurn: config?.energyPerTurn ?? DEFAULT_HAND_CONFIG.energyPerTurn,
      maxEnergy: config?.maxEnergy ?? DEFAULT_HAND_CONFIG.maxEnergy,
    };
    this.hand = [];
    this.drawPile = [];
    this.discardPile = [];
    this.energy = this.config.energyPerTurn;
    this.maxEnergy = this.config.maxEnergy;
    this.state = HandStateEnum.IDLE;
    this.cardDatabase = CardDatabase.getInstance();
  }

  /**
   * 获取单例实例
   * @param config 可选配置（首次创建时生效）
   */
  static getInstance(config?: Partial<HandConfig>): HandManager {
    if (!HandManager.instance) {
      HandManager.instance = new HandManager(config);
    }
    return HandManager.instance;
  }

  /**
   * 重置单例实例（用于测试或重新开始）
   */
  static resetInstance(): void {
    HandManager.instance = undefined as unknown as HandManager;
  }

  // ==================== 核心操作 ====================

  /**
   * 重置手牌（游戏开始/重新开始）
   * 清空手牌和弃牌堆，恢复初始能量
   */
  reset(): void {
    this.hand = [];
    this.drawPile = [];
    this.discardPile = [];
    this.energy = this.config.energyPerTurn;
    this.maxEnergy = this.config.maxEnergy;
    this.state = HandStateEnum.IDLE;
  }

  /**
   * 抽牌
   * @param count 抽牌数量
   * @returns 抽牌结果
   */
  draw(count: number): DrawResult {
    if (count <= 0) {
      return { cards: [], reshuffled: false, actualCount: 0 };
    }

    this.state = HandStateEnum.DRAWING;
    let reshuffled = false;
    const drawnCards: Card[] = [];

    for (let i = 0; i < count; i++) {
      // 如果抽牌堆为空，尝试洗牌
      if (this.drawPile.length === 0) {
        if (this.discardPile.length === 0) {
          // 抽牌堆和弃牌堆都为空，无法继续抽牌
          break;
        }
        this.shuffleDiscardIntoDraw();
        reshuffled = true;
      }

      // 从抽牌堆抽取
      const card = this.drawPile.pop();
      if (card) {
        drawnCards.push(card);
      }
    }

    // 将抽到的牌加入手牌
    this.hand.push(...drawnCards);

    // 如果手牌超过上限，自动弃牌
    while (this.hand.length > this.config.maxHandSize) {
      const excessCard = this.hand.shift();
      if (excessCard) {
        this.discardPile.push(excessCard);
      }
    }

    this.state = HandStateEnum.IDLE;

    return {
      cards: drawnCards,
      reshuffled,
      actualCount: drawnCards.length,
    };
  }

  /**
   * 出牌
   * @param cardIndex 手牌索引
   * @param energyCost 能量消耗（默认 0）
   * @returns 出牌结果
   */
  playCard(cardIndex: number, energyCost: number = 0): PlayCardResult {
    // 验证索引
    if (cardIndex < 0 || cardIndex >= this.hand.length) {
      return {
        success: false,
        message: `无效的手牌索引: ${cardIndex}`,
      };
    }

    // 能量检查
    if (energyCost > this.energy) {
      return {
        success: false,
        message: `能量不足: 需要 ${energyCost}，当前 ${this.energy}`,
      };
    }

    this.state = HandStateEnum.PLAYING;

    // 注意：能量消耗由调用方在游戏逻辑层处理（通过 spendEnergy）
    // playCard 只负责打出卡牌和移出手牌

    // 移除手牌
    const card = this.hand.splice(cardIndex, 1)[0];

    // 加入弃牌堆
    this.discardPile.push(card);

    this.state = HandStateEnum.IDLE;

    return {
      success: true,
      card,
      energyCost: energyCost > 0 ? energyCost : undefined,
      message: `成功出牌: ${card.name}`,
    };
  }

  /**
   * 弃牌
   * @param count 弃牌数量
   * @returns 弃牌结果
   */
  discard(count: number): DiscardResult {
    if (count <= 0 || this.hand.length === 0) {
      return { cards: [], actualCount: 0 };
    }

    this.state = HandStateEnum.DISCARDING;

    const discardedCards: Card[] = [];
    const actualCount = Math.min(count, this.hand.length);

    for (let i = 0; i < actualCount; i++) {
      // 移除第一张手牌（也可以改成随机弃牌）
      const card = this.hand.shift();
      if (card) {
        discardedCards.push(card);
        this.discardPile.push(card);
      }
    }

    this.state = HandStateEnum.IDLE;

    return {
      cards: discardedCards,
      actualCount: discardedCards.length,
    };
  }

  /**
   * 随机弃牌
   * @param count 弃牌数量
   * @returns 弃牌结果
   */
  discardRandom(count: number): DiscardResult {
    if (count <= 0 || this.hand.length === 0) {
      return { cards: [], actualCount: 0 };
    }

    this.state = HandStateEnum.DISCARDING;

    const discardedCards: Card[] = [];
    const actualCount = Math.min(count, this.hand.length);

    for (let i = 0; i < actualCount; i++) {
      const randomIndex = Math.floor(Math.random() * this.hand.length);
      const removed = this.hand.splice(randomIndex, 1)[0];
      discardedCards.push(removed);
      this.discardPile.push(removed);
    }

    this.state = HandStateEnum.IDLE;

    return {
      cards: discardedCards,
      actualCount: discardedCards.length,
    };
  }

  // ==================== 能量系统 ====================

  /**
   * 恢复能量（每回合开始时调用）
   */
  refillEnergy(): void {
    this.energy = this.maxEnergy;
  }

  /**
   * 退还能量（用于出牌失败时返还能量）
   * @param amount 退还能量
   */
  refundEnergy(amount: number): void {
    if (amount < 0) return;
    this.energy = Math.min(this.energy + amount, this.maxEnergy);
  }

  /**
   * 消耗能量
   * @param amount 消耗能量
   * @returns 能量消耗结果
   */
  spendEnergy(amount: number): EnergyResult {
    if (amount < 0) {
      return {
        success: false,
        remainingEnergy: this.energy,
        message: '无效的能量消耗: 负数不被允许',
      };
    }

    if (amount > this.energy) {
      return {
        success: false,
        remainingEnergy: this.energy,
        message: `能量不足: 需要 ${amount}，当前 ${this.energy}`,
      };
    }

    this.energy -= amount;

    return {
      success: true,
      remainingEnergy: this.energy,
    };
  }

  // ==================== v2.0.0 Day 8: 事件驱动能量/抽牌 ====================

  /**
   * 增加能量（由方块消除等事件触发）
   * v2.0.0 Day 8: 用于卡牌战斗模式的能量获取
   * @param amount 能量增量
   */
  gainEnergy(amount: number): void {
    if (amount < 0) return;
    this.energy = Math.min(this.energy + amount, this.maxEnergy + 10); // 允许临时超出上限
  }

  /**
   * 抽额外卡牌（由方块消除等事件触发）
   * v2.0.0 Day 8: 用于卡牌战斗模式的额外抽牌
   * @param count 抽牌数量
   */
  drawCards(count: number): void {
    if (count <= 0) return;
    this.draw(count);
  }

  // ==================== Getter 方法 ====================

  /**
   * 获取当前手牌
   */
  getHand(): Card[] {
    return [...this.hand];
  }

  /**
   * 获取抽牌堆数量
   */
  getDrawPileCount(): number {
    return this.drawPile.length;
  }

  /**
   * 获取弃牌堆数量
   */
  getDiscardPileCount(): number {
    return this.discardPile.length;
  }

  /**
   * 获取当前能量
   */
  getEnergy(): number {
    return this.energy;
  }

  /**
   * 获取最大能量
   */
  getMaxEnergy(): number {
    return this.maxEnergy;
  }

  /**
   * 获取手牌状态
   */
  getState(): HandState {
    return this.state;
  }

  /**
   * 获取当前配置
   */
  getConfig(): HandConfig {
    return { ...this.config };
  }

  /**
   * 获取快照（用于调试/存档）
   */
  getSnapshot(): HandSnapshot {
    return {
      hand: [...this.hand],
      drawPile: [...this.drawPile],
      discardPile: [...this.discardPile],
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      state: this.state,
    };
  }

  // ==================== 私有方法 ====================

  /**
   * 将弃牌堆洗入抽牌堆
   */
  private shuffleDiscardIntoDraw(): void {
    if (this.discardPile.length === 0) return;

    // 将弃牌堆转移到抽牌堆
    this.drawPile.push(...this.discardPile);
    this.discardPile = [];

    // Fisher-Yates 洗牌
    for (let i = this.drawPile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
    }
  }

  /**
   * 初始化抽牌堆（从卡牌数据库填充）
   * @param cardIds 要添加的卡牌 ID 列表
   */
  initializeDrawPile(cardIds: string[]): void {
    this.drawPile = this.cardDatabase.getCardsByIds(cardIds);
    // 洗牌
    for (let i = this.drawPile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
    }
  }

  /**
   * 初始化抽牌堆（使用默认卡组）
   * 从卡牌数据库获取所有基础卡牌
   */
  initializeWithDefaultDeck(): void {
    const allCards = this.cardDatabase.getAllCards();
    this.drawPile = [...allCards];
    // 洗牌
    for (let i = this.drawPile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
    }
  }
}

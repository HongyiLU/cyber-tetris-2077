// ==================== 手牌系统类型定义 ====================
// v2.0.0 Day 2 - 手牌管理类型

import type { CardData } from './index';

/**
 * 手牌状态枚举
 */
export enum HandState {
  IDLE = 'idle',           // 空闲
  DRAWING = 'drawing',     // 抽牌中
  PLAYING = 'playing',     // 出牌中
  DISCARDING = 'discarding', // 弃牌中
}

/**
 * 手牌配置接口
 */
export interface HandConfig {
  /** 手牌上限（默认 7） */
  maxHandSize: number;
  /** 初始抽牌数（默认 5） */
  initialDraw: number;
  /** 每回合能量（默认 3） */
  energyPerTurn: number;
  /** 能量上限（默认 3） */
  maxEnergy: number;
}

/**
 * 能量消耗结果
 */
export interface EnergyResult {
  /** 是否成功 */
  success: boolean;
  /** 剩余能量 */
  remainingEnergy: number;
  /** 消息（可选） */
  message?: string;
}

/**
 * 出牌结果
 */
export interface PlayCardResult {
  /** 是否成功 */
  success: boolean;
  /** 出出的卡牌（成功时） */
  card?: CardData;
  /** 能量消耗（成功时） */
  energyCost?: number;
  /** 消息（可选） */
  message?: string;
}

/**
 * 抽牌结果
 */
export interface DrawResult {
  /** 抽取的卡牌列表 */
  cards: CardData[];
  /** 是否触发了洗牌 */
  reshuffled: boolean;
  /** 实际抽牌数 */
  actualCount: number;
}

/**
 * 弃牌结果
 */
export interface DiscardResult {
  /** 弃掉的卡牌列表 */
  cards: CardData[];
  /** 实际弃牌数 */
  actualCount: number;
}

/**
 * 手牌状态快照（用于调试/存档）
 */
export interface HandSnapshot {
  hand: CardData[];
  drawPile: CardData[];
  discardPile: CardData[];
  energy: number;
  maxEnergy: number;
  state: HandState;
}

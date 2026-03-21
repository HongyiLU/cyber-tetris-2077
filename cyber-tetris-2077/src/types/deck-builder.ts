/**
 * @fileoverview 卡组构筑系统类型定义 v2.0.0
 * 包含卡组状态、奖励选择、游戏阶段等核心类型
 */

import type { Card } from './card.v2';

/**
 * 游戏阶段枚举
 */
export enum GameStage {
  /** 主菜单 */
  MENU = 'menu',
  /** 战斗中 */
  BATTLE = 'battle',
  /** 奖励选择阶段 */
  REWARD_SELECT = 'reward_select',
  /** 胜利 */
  VICTORY = 'victory',
  /** 失败 */
  DEFEAT = 'defeat',
}

/**
 * 卡组构筑状态接口
 * 管理整个卡组构筑 rogue-like 流程的核心状态
 */
export interface DeckBuilderState {
  /** 当前卡组 */
  currentDeck: Card[];
  /** 当前手牌 */
  hand: Card[];
  /** 当前能量 */
  energy: number;
  /** 最大能量 */
  maxEnergy: number;
  /** 抽牌堆 */
  drawPile: Card[];
  /** 弃牌堆 */
  discardPile: Card[];
  /** 当前可选择的奖励选项 */
  currentRewardOptions: RewardOption[];
  /** 卡组升级记录 Map<cardId, upgradeLevel> */
  deckUpgrades: Map<string, number>;
  /** 当前游戏阶段 */
  gameStage: GameStage;
  /** 当前关卡数 */
  currentStage: number;
  /** 跳过奖励的金币数 */
  skipBonus: number;
}

/**
 * 奖励选项接口
 */
export interface RewardOption {
  /** 唯一标识符（用于查找） */
  id: string;
  /** 可选择的卡牌列表 */
  cards: Card[];
  /** 跳过奖励获得的金币数 */
  skipBonus: number;
}

/**
 * 创建默认的卡组构筑状态
 * @returns 初始化的卡组构筑状态
 */
export function createDefaultDeckBuilderState(): DeckBuilderState {
  return {
    currentDeck: [],
    hand: [],
    energy: 3,
    maxEnergy: 3,
    drawPile: [],
    discardPile: [],
    currentRewardOptions: [],
    deckUpgrades: new Map<string, number>(),
    gameStage: GameStage.MENU,
    currentStage: 1,
    skipBonus: 10,
  };
}

/**
 * 卡组状态导出类型（用于序列化/保存）
 */
export interface DeckBuilderSaveData {
  currentDeck: Card[];
  deckUpgrades: [string, number][]; // Map 序列化为数组
  currentStage: number;
  skipBonus: number;
}

/**
 * 将 DeckBuilderState 转换为可序列化的 SaveData
 * @param state 卡组构筑状态
 * @returns 可序列化的保存数据
 */
export function deckBuilderStateToSaveData(
  state: DeckBuilderState
): DeckBuilderSaveData {
  return {
    currentDeck: state.currentDeck,
    deckUpgrades: Array.from(state.deckUpgrades.entries()),
    currentStage: state.currentStage,
    skipBonus: state.skipBonus,
  };
}

/**
 * 从 SaveData 恢复 DeckBuilderState
 * @param data 保存数据
 * @returns 恢复后的卡组构筑状态
 */
export function deckBuilderStateFromSaveData(
  data: DeckBuilderSaveData
): DeckBuilderState {
  const state = createDefaultDeckBuilderState();
  state.currentDeck = data.currentDeck;
  state.deckUpgrades = new Map(data.deckUpgrades);
  state.currentStage = data.currentStage;
  state.skipBonus = data.skipBonus;
  return state;
}

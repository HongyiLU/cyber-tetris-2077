/**
 * @fileoverview 奖励配置 v2.0.0
 * 定义卡组构筑模式中各关卡的奖励池和稀有度权重
 */

import { CardRarity } from '../types/card.v2';

/**
 * 各稀有度的权重配置
 */
export interface RarityWeights {
  [CardRarity.COMMON]?: number;
  [CardRarity.UNCOMMON]?: number;
  [CardRarity.RARE]?: number;
  [CardRarity.EPIC]?: number;
  [CardRarity.LEGENDARY]?: number;
}

/**
 * 关卡奖励配置
 */
export interface StageRewardConfig {
  /** 稀有度权重 */
  rarityWeights: RarityWeights;
}

/**
 * 奖励配置
 */
export const REWARD_CONFIG = {
  /** 每次奖励选项数量 */
  optionsCount: 3,
  /** 跳过奖励获得的金币数 */
  skipBonus: 10,
  /** 各关卡奖励配置 */
  stageRewards: {
    1: {
      rarityWeights: {
        [CardRarity.COMMON]: 70,
        [CardRarity.UNCOMMON]: 25,
        [CardRarity.RARE]: 5,
      } as RarityWeights,
    } as StageRewardConfig,
    2: {
      rarityWeights: {
        [CardRarity.COMMON]: 50,
        [CardRarity.UNCOMMON]: 35,
        [CardRarity.RARE]: 15,
      } as RarityWeights,
    } as StageRewardConfig,
    3: {
      rarityWeights: {
        [CardRarity.COMMON]: 30,
        [CardRarity.UNCOMMON]: 40,
        [CardRarity.RARE]: 25,
        [CardRarity.EPIC]: 5,
      } as RarityWeights,
    } as StageRewardConfig,
    4: {
      rarityWeights: {
        [CardRarity.UNCOMMON]: 30,
        [CardRarity.RARE]: 40,
        [CardRarity.EPIC]: 25,
        [CardRarity.LEGENDARY]: 5,
      } as RarityWeights,
    } as StageRewardConfig,
  } as Record<number, StageRewardConfig>,
} as const;

/**
 * 获取指定关卡的稀有度权重配置
 * @param stage 关卡数 (1-4)
 * @returns 稀有度权重配置，如果关卡不存在则返回默认配置
 */
export function getStageRewardConfig(stage: number): StageRewardConfig {
  return REWARD_CONFIG.stageRewards[stage] ?? REWARD_CONFIG.stageRewards[1]!;
}

/**
 * 根据稀有度权重随机选择稀有度
 * @param weights 稀有度权重配置
 * @returns 随机选择的稀有度
 */
export function rollRarity(weights: RarityWeights): CardRarity {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + (w ?? 0), 0);
  let random = Math.random() * totalWeight;

  for (const [rarity, weight] of Object.entries(weights)) {
    if (weight === undefined || weight <= 0) continue;
    random -= weight;
    // P1-2: 修复浮点精度问题，使用 random < 0 替代 random <= 0
    if (random < 0) {
      return rarity as CardRarity;
    }
  }

  // Fallback to common
  return CardRarity.COMMON;
}

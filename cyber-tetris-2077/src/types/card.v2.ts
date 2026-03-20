/**
 * @fileoverview 扩展卡牌类型定义 v2.0.0
 * 新增升级系统相关字段
 */

/**
 * 稀有度枚举（扩展版）
 */
export enum CardRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

/**
 * 卡牌稀有度权重配置
 */
export const CARD_RARITY_WEIGHTS: Record<CardRarity, number> = {
  [CardRarity.COMMON]: 60,
  [CardRarity.UNCOMMON]: 25,
  [CardRarity.RARE]: 12,
  [CardRarity.EPIC]: 2.5,
  [CardRarity.LEGENDARY]: 0.5,
};

/**
 * 升级效果接口 - 定义卡牌升级后的效果变化
 */
export interface CardUpgradeEffect {
  /** 升级后伤害变化值 */
  damage?: number;
  /** 升级后护盾变化值 */
  block?: number;
  /** 升级后中毒层数变化值 */
  poison?: number;
  /** 升级后治疗量变化值 */
  heal?: number;
  /** 升级后特殊效果值（如暂停回合数、范围等） */
  specialValue?: number;
}

/**
 * 卡牌形状定义 - 使用数字矩阵表示
 * 1 = 该位置有方块, 0 = 空
 */
export type CardShape = number[][];

/**
 * 扩展卡牌接口 v2.0.0
 * 包含升级系统相关字段
 */
export interface Card {
  /** 卡牌唯一标识 */
  id: string;
  /** 卡牌名称 */
  name: string;
  /** 能量消耗 */
  cost: number;
  /** 卡牌形状矩阵 */
  shape: CardShape;
  /** 稀有度 */
  rarity: CardRarity;
  /** 基础伤害值 */
  damage?: number;
  /** 基础护盾值 */
  block?: number;
  /** 基础中毒层数 */
  poison?: number;
  /** 基础治疗量 */
  heal?: number;
  /** 特殊效果描述 */
  description?: string;
  /** 特殊效果类型 */
  specialEffect?: CardSpecialEffect;
  /** 特殊效果值（如暂停回合数、范围等） */
  specialValue?: number;
  /** 升级效果定义 */
  upgrade?: CardUpgradeEffect;
  /** 当前升级等级 (0=基础, 1=+, 2=++) */
  upgradeLevel: number;
}

/**
 * 卡牌特殊效果类型
 */
export enum CardSpecialEffect {
  /** 消除n行 */
  CLEAR_LINES = 'clear_lines',
  /** 范围伤害 */
  AREA_DAMAGE = 'area_damage',
  /** 敌人中毒 */
  POISON = 'poison',
  /** 恢复生命 */
  HEAL = 'heal',
  /** 获得护盾 */
  SHIELD = 'shield',
  /** 敌人暂停 */
  STUN = 'stun',
  /** 连击伤害 */
  COMBO_DAMAGE = 'combo_damage',
  /** 清除所有垃圾行 */
  CLEAR_GARBAGE = 'clear_garbage',
}

/**
 * 升级倍率常量
 * 基础 -> + : +50%
 * + -> ++ : +100%（相比基础）
 */
export const UPGRADE_MULTIPLIERS = {
  /** 基础卡牌 (level 0) */
  BASE: 1.0,
  /** +级卡牌 (level 1) */
  PLUS: 1.5,
  /** ++级卡牌 (level 2) */
  PLUS_PLUS: 2.0,
} as const;

/**
 * 获取指定升级等级的应用倍率
 * @param upgradeLevel 升级等级 (0=基础, 1=+, 2=++)
 * @returns 应用倍率
 */
export function getUpgradeMultiplier(upgradeLevel: number): number {
  switch (upgradeLevel) {
    case 2:
      return UPGRADE_MULTIPLIERS.PLUS_PLUS;
    case 1:
      return UPGRADE_MULTIPLIERS.PLUS;
    default:
      return UPGRADE_MULTIPLIERS.BASE;
  }
}

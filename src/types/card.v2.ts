// ==================== 卡牌类型定义 v2.0.0 ====================
// 尖塔方块 2077 手牌系统 - 新版卡牌类型

/**
 * 卡牌类型枚举
 */
export enum CardType {
  /** 攻击卡 - 红色边框 */
  ATTACK = 'attack',
  /** 技能卡 - 绿色边框 */
  SKILL = 'skill',
  /** 能力卡 - 紫色边框 */
  POWER = 'power',
}

/**
 * 卡牌稀有度枚举
 */
export enum CardRarity {
  /** 普通 - 白色 */
  COMMON = 'common',
  /** 罕见 - 蓝色 */
  UNCOMMON = 'uncommon',
  /** 稀有 - 金色 */
  RARE = 'rare',
  /** 史诗 - 紫色 */
  EPIC = 'epic',
  /** 传说 - 橙色 */
  LEGENDARY = 'legendary',
}

/**
 * 方块类型（支持基础 7 种 + 特殊 10 种）
 */
export type BlockType =
  | 'I'
  | 'O'
  | 'T'
  | 'S'
  | 'Z'
  | 'L'
  | 'J' // 基础 7 种
  | 'bomb_block'
  | 'time_stop'
  | 'heal_block'
  | 'shield_block'
  | 'combo_block'
  | 'clear_block'
  | 'lucky_block'
  | 'freeze_block'
  | 'fire_block'
  | 'lightning_block'; // 特殊 10 种

/**
 * 卡牌接口
 */
export interface Card {
  // 基础信息
  /** 卡牌 ID */
  id: string;
  /** 卡牌名称 */
  name: string;
  /** 卡牌描述 */
  description: string;
  /** 卡牌类型 */
  type: CardType;
  /** 卡牌稀有度 */
  rarity: CardRarity;
  /** 能量消耗 (0-3) */
  cost: number;

  // 方块映射
  /** 方块类型 */
  blockType: BlockType;
  /** 方块形状 */
  shape: number[][];
  /** 方块颜色 */
  color: string;

  // 战斗效果
  /** 基础伤害 */
  damage: number;
  /** 基础防御 */
  block: number;
  /** 特殊效果 ID */
  special?: string;

  // 升级
  /** 升级后伤害 */
  upgradeDamage?: number;
  /** 升级后防御 */
  upgradeBlock?: number;
  /** 升级后消耗 */
  upgradeCost?: number;

  // 元数据
  /** 标签（用于检索） */
  tags: string[];
  /** 背景描述 */
  flavor: string;
}

/**
 * 升级后卡牌接口
 */
export interface UpgradedCard extends Card {
  /** 是否已升级 */
  isUpgraded: true;
  /** 升级后名称 */
  upgradedName: string;
}

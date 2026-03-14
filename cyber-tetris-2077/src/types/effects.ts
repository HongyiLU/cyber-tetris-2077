/**
 * 特殊效果方块卡牌类型定义
 */

/**
 * 效果类型枚举
 */
export enum EffectType {
  /** 进攻型效果 */
  OFFENSE = 'offense',
  /** 防御型效果 */
  DEFENSE = 'defense',
  /** 辅助型效果 */
  SUPPORT = 'support',
  /** 特殊效果 */
  SPECIAL = 'special',
}

/**
 * 效果触发时机枚举
 */
export enum EffectTrigger {
  /** 放置方块时触发 */
  ON_PLACE = 'onPlace',
  /** 消除方块时触发 */
  ON_CLEAR = 'onClear',
  /** 被动触发 */
  PASSIVE = 'passive',
  /** 连击时触发 */
  ON_COMBO = 'onCombo',
}

/**
 * 稀有度枚举
 */
export enum Rarity {
  /** 常见 */
  COMMON = 'common',
  /** 罕见 */
  UNCOMMON = 'uncommon',
  /** 稀有 */
  RARE = 'rare',
  /** 史诗 */
  EPIC = 'epic',
  /** 传说 */
  LEGENDARY = 'legendary',
}

/**
 * 效果配置接口
 */
export interface EffectConfig {
  /** 效果唯一标识 */
  id: string;
  /** 效果名称 */
  name: string;
  /** 效果图标/表情符号 */
  icon: string;
  /** 稀有度 */
  rarity: Rarity;
  /** 效果类型 */
  effectType: EffectType;
  /** 触发时机 */
  trigger: EffectTrigger;
  /** 效果描述 */
  description: string;
  /** 冷却时间（秒） */
  cooldown?: number;
  /** 持续时间（秒） */
  duration?: number;
  /** 效果数值 */
  value?: number;
  /** 效果范围 */
  range?: number;
}

/**
 * 激活的效果实例接口
 */
export interface ActiveEffect {
  /** 效果配置 */
  config: EffectConfig;
  /** 激活时间戳 */
  activatedAt: number;
  /** 过期时间戳 */
  expiresAt?: number;
  /** 剩余冷却时间（秒） */
  remainingCooldown?: number;
  /** 效果层数（用于可叠加效果） */
  stacks?: number;
}

/**
 * 效果触发结果接口
 */
export interface EffectResult {
  /** 是否成功触发 */
  success: boolean;
  /** 效果 ID */
  effectId: string;
  /** 效果消息 */
  message: string;
  /** 效果数据 */
  data?: Record<string, unknown>;
}

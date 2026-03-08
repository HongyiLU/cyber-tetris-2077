/**
 * 装备系统类型定义
 */

/** 装备稀有度 */
export type EquipmentRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

/** 装备类型 */
export type EquipmentType = 'Head' | 'Body' | 'Accessory';

/** 装备效果类型 */
export type EquipmentEffectType = 
  | 'damageBoost'      // 伤害强化
  | 'damageReduction'  // 伤害减免
  | 'healthBoost'      // 生命强化
  | 'comboBoost'       // 连击强化
  | 'comboTimeBoost'   // 连击时间强化
  | 'healAura';        // 治疗光环

/** 装备效果 */
export interface EquipmentEffect {
  type: EquipmentEffectType;
  value: number;  // 效果值（百分比或固定值）
  unit?: '%' | 'flat' | 'seconds';  // 单位
}

/** 装备数据 */
export interface Equipment {
  id: string;
  name: string;
  description: string;
  icon: string;  // emoji 图标
  type: EquipmentType;
  rarity: EquipmentRarity;
  effects: EquipmentEffect[];
  unlockCondition?: string;  // 解锁条件（可选，用于成就解锁）
}

/** 玩家装备槽 */
export interface EquipmentSlot {
  slot: EquipmentType;
  equipment: Equipment | null;
}

/** 装备状态 */
export interface EquipmentState {
  slots: {
    head: Equipment | null;
    body: Equipment | null;
    accessory: Equipment | null;
  };
  unlockedEquipment: string[];  // 已解锁的装备 ID 列表
}

/** 装备效果应用结果 */
export interface AppliedEquipmentEffects {
  damageMultiplier: number;      // 伤害倍率 (1.0 = 100%)
  damageReductionMultiplier: number; // 伤害减免倍率 (0.8 = 减免 20%)
  healthBonus: number;           // 生命加成
  comboDamageBonus: number;      // 连击伤害加成 (0.05 = +5%)
  comboTimeBonus: number;        // 连击时间加成（秒）
  healPerTick: number;           // 每次治疗量
  healInterval: number;          // 治疗间隔（毫秒）
}

/** 装备稀有度颜色 */
export const RARITY_COLORS: Record<EquipmentRarity, string> = {
  Common: '#9CA3AF',      // 灰色
  Uncommon: '#10B981',    // 绿色
  Rare: '#3B82F6',        // 蓝色
  Epic: '#8B5CF6',        // 紫色
  Legendary: '#F97316',   // 橙色
};

/** 装备稀有度权重（用于掉落） */
export const RARITY_WEIGHTS: Record<EquipmentRarity, number> = {
  Common: 50,
  Uncommon: 30,
  Rare: 15,
  Epic: 4,
  Legendary: 1,
};

/**
 * 特殊效果方块卡牌配置
 * 定义 10 种特殊效果的完整配置
 */

import { EffectConfig, EffectType, EffectTrigger, Rarity } from '../types/effects';

/**
 * 10 种特殊效果配置
 */
export const BLOCK_EFFECTS: EffectConfig[] = [
  {
    id: 'bomb_block',
    name: '💣 炸弹方块',
    icon: '💣',
    rarity: Rarity.EPIC,
    effectType: EffectType.OFFENSE,
    trigger: EffectTrigger.ON_PLACE,
    description: '消除 3x3 区域',
    cooldown: 15,
    value: 3, // 3x3 范围
    range: 3,
  },
  {
    id: 'time_stop',
    name: '⏰ 时间停止',
    icon: '⏰',
    rarity: Rarity.LEGENDARY,
    effectType: EffectType.SPECIAL,
    trigger: EffectTrigger.ON_CLEAR,
    description: '暂停敌人攻击 10 秒',
    cooldown: 60,
    duration: 10,
    value: 10,
  },
  {
    id: 'life_steal',
    name: '💖 生命偷取',
    icon: '💖',
    rarity: Rarity.RARE,
    effectType: EffectType.SUPPORT,
    trigger: EffectTrigger.ON_CLEAR,
    description: '恢复 5 点生命值',
    cooldown: 20,
    value: 5,
  },
  {
    id: 'defense_shield',
    name: '🛡️ 防御护盾',
    icon: '🛡️',
    rarity: Rarity.UNCOMMON,
    effectType: EffectType.DEFENSE,
    trigger: EffectTrigger.PASSIVE,
    description: '抵挡下一次垃圾行攻击',
    cooldown: 30,
    duration: 60, // 护盾持续 60 秒
  },
  {
    id: 'combo_boost',
    name: '📈 连击增幅',
    icon: '📈',
    rarity: Rarity.EPIC,
    effectType: EffectType.SUPPORT,
    trigger: EffectTrigger.ON_COMBO,
    description: '连击伤害 +50%',
    cooldown: 0, // 无冷却，每次连击都触发
    value: 0.5, // 50% 增幅
  },
  {
    id: 'full_clear',
    name: '🌟 全屏清除',
    icon: '🌟',
    rarity: Rarity.LEGENDARY,
    effectType: EffectType.SPECIAL,
    trigger: EffectTrigger.ON_CLEAR,
    description: '清除所有垃圾行',
    cooldown: 60,
  },
  {
    id: 'lucky_seven',
    name: '7️⃣ 幸运七',
    icon: '7️⃣',
    rarity: Rarity.UNCOMMON,
    effectType: EffectType.SUPPORT,
    trigger: EffectTrigger.PASSIVE,
    description: '第 7 次消除 2x 伤害',
    value: 2, // 2 倍伤害
    range: 7, // 第 7 次触发
  },
  {
    id: 'ice_freeze',
    name: '❄️ 寒冰冻结',
    icon: '❄️',
    rarity: Rarity.RARE,
    effectType: EffectType.SPECIAL,
    trigger: EffectTrigger.ON_PLACE,
    description: '冻结敌人 3 秒',
    cooldown: 25,
    duration: 3,
    value: 3,
  },
  {
    id: 'fire_burn',
    name: '🔥 火焰燃烧',
    icon: '🔥',
    rarity: Rarity.UNCOMMON,
    effectType: EffectType.OFFENSE,
    trigger: EffectTrigger.ON_CLEAR,
    description: '持续伤害 10 点（5 秒）',
    cooldown: 15,
    duration: 5,
    value: 10, // 每秒伤害
  },
  {
    id: 'lightning_chain',
    name: '⚡ 雷电连锁',
    icon: '⚡',
    rarity: Rarity.EPIC,
    effectType: EffectType.OFFENSE,
    trigger: EffectTrigger.ON_CLEAR,
    description: '连锁消除相邻方块',
    cooldown: 20,
    range: 2, // 连锁范围
  },
];

/**
 * 按稀有度获取效果
 */
export const getEffectsByRarity = (rarity: Rarity): EffectConfig[] => {
  return BLOCK_EFFECTS.filter((effect) => effect.rarity === rarity);
};

/**
 * 按效果类型获取效果
 */
export const getEffectsByType = (effectType: EffectType): EffectConfig[] => {
  return BLOCK_EFFECTS.filter((effect) => effect.effectType === effectType);
};

/**
 * 根据 ID 获取效果配置
 */
export const getEffectById = (id: string): EffectConfig | undefined => {
  return BLOCK_EFFECTS.find((effect) => effect.id === id);
};

/**
 * 获取所有可用效果 ID 列表
 */
export const getAllEffectIds = (): string[] => {
  return BLOCK_EFFECTS.map((effect) => effect.id);
};

// Game Configuration
import { EffectTrigger } from '../types/effects';

export const GAME_CONFIG = {
  // 方块形状定义
  SHAPES: {
    'I': [[1, 1, 1, 1]],
    'O': [[1, 1], [1, 1]],
    'T': [[0, 1, 0], [1, 1, 1]],
    'S': [[0, 1, 1], [1, 1, 0]],
    'Z': [[1, 1, 0], [0, 1, 1]],
    'L': [[0, 0, 1], [1, 1, 1]],
    'J': [[1, 0, 0], [1, 1, 1]],
  },

  // 方块颜色
  COLORS: {
    'I': '#00ffff',
    'O': '#ffff00',
    'T': '#da70d6',
    'S': '#00ff00',
    'Z': '#ff4444',
    'L': '#ff8c00',
    'J': '#4169e1',
  },

  // 方块名称
  BLOCK_NAMES: {
    'I': 'I-Block',
    'O': 'O-Block',
    'T': 'T-Block',
    'S': 'S-Block',
    'Z': 'Z-Block',
    'L': 'L-Block',
    'J': 'J-Block',
  },

  // 方块特殊效果卡牌配置
  // 为 7 种基础方块各分配一种特殊效果
  BLOCK_EFFECTS: {
    'I': {
      effectId: 'time_stop',
      effectName: '⏰ 时间停止',
      trigger: EffectTrigger.ON_CLEAR,
      description: '消除 I 方块时，有几率触发时间停止',
    },
    'O': {
      effectId: 'defense_shield',
      effectName: '🛡️ 防御护盾',
      trigger: EffectTrigger.PASSIVE,
      description: 'O 方块提供被动防御护盾效果',
    },
    'T': {
      effectId: 'bomb_block',
      effectName: '💣 炸弹方块',
      trigger: EffectTrigger.ON_PLACE,
      description: '放置 T 方块时，可触发炸弹效果',
    },
    'S': {
      effectId: 'ice_freeze',
      effectName: '❄️ 寒冰冻结',
      trigger: EffectTrigger.ON_PLACE,
      description: '放置 S 方块时，可触发寒冰冻结',
    },
    'Z': {
      effectId: 'fire_burn',
      effectName: '🔥 火焰燃烧',
      trigger: EffectTrigger.ON_CLEAR,
      description: '消除 Z 方块时，可触发火焰燃烧',
    },
    'L': {
      effectId: 'lightning_chain',
      effectName: '⚡ 雷电连锁',
      trigger: EffectTrigger.ON_CLEAR,
      description: '消除 L 方块时，可触发雷电连锁',
    },
    'J': {
      effectId: 'life_steal',
      effectName: '💖 生命偷取',
      trigger: EffectTrigger.ON_CLEAR,
      description: '消除 J 方块时，可触发生命偷取',
    },
  },
};

export type BlockId = keyof typeof GAME_CONFIG.SHAPES;

/**
 * 获取方块的特殊效果配置
 * @param blockId 方块 ID
 * @returns 效果配置
 */
export const getBlockEffect = (blockId: BlockId) => {
  return GAME_CONFIG.BLOCK_EFFECTS[blockId];
};

/**
 * 获取所有方块的特殊效果 ID 列表
 * @returns 效果 ID 列表
 */
export const getAllBlockEffectIds = (): string[] => {
  return Object.values(GAME_CONFIG.BLOCK_EFFECTS).map((effect) => effect.effectId);
};

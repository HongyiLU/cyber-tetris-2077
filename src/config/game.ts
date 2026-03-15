// Game Configuration
import { EffectTrigger } from '../types/effects';
import { PieceType } from '../types/block-types';

export const GAME_CONFIG = {
  // 方块形状定义
  SHAPES: {
    // 基础方块（7 种经典俄罗斯方块）
    'I': [[1, 1, 1, 1]],
    'O': [[1, 1], [1, 1]],
    'T': [[0, 1, 0], [1, 1, 1]],
    'S': [[0, 1, 1], [1, 1, 0]],
    'Z': [[1, 1, 0], [0, 1, 1]],
    'L': [[0, 0, 1], [1, 1, 1]],
    'J': [[1, 0, 0], [1, 1, 1]],
    // 特殊效果方块（10 种）
    'BOMB': [[1, 1, 1], [1, 1, 1], [1, 1, 1]],  // 3x3 炸弹
    'TIME': [[1, 0, 1], [0, 1, 0], [1, 0, 1]],  // 时钟形状
    'HEAL': [[0, 1, 0], [1, 1, 1], [0, 1, 0]],  // 十字形
    'SHIELD': [[1, 1], [1, 1]],  // 2x2 护盾
    'COMBO': [[1, 0, 1], [1, 1, 1]],  // 箭头向上
    'CLEAR': [[1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1]],  // 星形外框
    'LUCKY': [[1, 1, 1], [1, 0, 1], [1, 1, 1]],  // 数字 7 形状
    'FREEZE': [[1, 0, 1], [0, 1, 0], [1, 0, 1]],  // 雪花状
    'FIRE': [[1, 1, 1], [0, 1, 0], [0, 1, 0]],  // 火焰向上
    'LIGHTNING': [[1, 0, 0], [1, 1, 0], [0, 1, 0]],  // 闪电状
  },

  // 方块颜色
  COLORS: {
    // 基础方块
    'I': '#00ffff',
    'O': '#ffff00',
    'T': '#da70d6',
    'S': '#00ff00',
    'Z': '#ff4444',
    'L': '#ff8c00',
    'J': '#4169e1',
    // 特殊效果方块
    'BOMB': '#ff6600',
    'TIME': '#00ccff',
    'HEAL': '#ff69b4',
    'SHIELD': '#cccccc',
    'COMBO': '#9932cc',
    'CLEAR': '#ffd700',
    'LUCKY': '#32cd32',
    'FREEZE': '#87ceeb',
    'FIRE': '#ff4500',
    'LIGHTNING': '#ffff00',
  },

  // 方块名称
  BLOCK_NAMES: {
    // 基础方块
    'I': 'I-Block',
    'O': 'O-Block',
    'T': 'T-Block',
    'S': 'S-Block',
    'Z': 'Z-Block',
    'L': 'L-Block',
    'J': 'J-Block',
    // 特殊效果方块
    'BOMB': '💣 炸弹方块',
    'TIME': '⏰ 时间停止',
    'HEAL': '💖 生命偷取',
    'SHIELD': '🛡️ 防御护盾',
    'COMBO': '📈 连击增幅',
    'CLEAR': '🌟 全屏清除',
    'LUCKY': '7️⃣ 幸运七',
    'FREEZE': '❄️ 寒冰冻结',
    'FIRE': '🔥 火焰燃烧',
    'LIGHTNING': '⚡ 雷电连锁',
  },

  // 方块类型（基础/特殊）
  BLOCK_TYPES: {
    // 基础方块
    'I': PieceType.BASIC,
    'O': PieceType.BASIC,
    'T': PieceType.BASIC,
    'S': PieceType.BASIC,
    'Z': PieceType.BASIC,
    'L': PieceType.BASIC,
    'J': PieceType.BASIC,
    // 特殊效果方块
    'BOMB': PieceType.SPECIAL,
    'TIME': PieceType.SPECIAL,
    'HEAL': PieceType.SPECIAL,
    'SHIELD': PieceType.SPECIAL,
    'COMBO': PieceType.SPECIAL,
    'CLEAR': PieceType.SPECIAL,
    'LUCKY': PieceType.SPECIAL,
    'FREEZE': PieceType.SPECIAL,
    'FIRE': PieceType.SPECIAL,
    'LIGHTNING': PieceType.SPECIAL,
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
 * 基础方块 ID 类型（7 种经典俄罗斯方块）
 */
export type BasicBlockId = 'I' | 'O' | 'T' | 'S' | 'Z' | 'L' | 'J';

/**
 * 特殊方块 ID 类型（10 种特殊效果方块）
 */
export type SpecialBlockId = 'BOMB' | 'TIME' | 'HEAL' | 'SHIELD' | 'COMBO' | 'CLEAR' | 'LUCKY' | 'FREEZE' | 'FIRE' | 'LIGHTNING';

/**
 * 获取方块的特殊效果配置
 * @param blockId 基础方块 ID
 * @returns 效果配置
 */
export const getBlockEffect = (blockId: BasicBlockId) => {
  return GAME_CONFIG.BLOCK_EFFECTS[blockId];
};

/**
 * 获取所有方块的特殊效果 ID 列表
 * @returns 效果 ID 列表
 */
export const getAllBlockEffectIds = (): string[] => {
  return Object.values(GAME_CONFIG.BLOCK_EFFECTS).map((effect) => effect.effectId);
};

/**
 * 获取方块的类型（基础/特殊）
 * @param blockId 方块 ID
 * @returns 方块类型
 */
export const getBlockType = (blockId: BlockId): PieceType => {
  return GAME_CONFIG.BLOCK_TYPES[blockId] || PieceType.BASIC;
};

/**
 * 获取所有基础方块 ID 列表
 * @returns 基础方块 ID 列表
 */
export const getBasicBlockIds = (): BlockId[] => {
  return Object.keys(GAME_CONFIG.SHAPES).filter(
    (id) => GAME_CONFIG.BLOCK_TYPES[id as BlockId] === PieceType.BASIC
  ) as BlockId[];
};

/**
 * 获取所有特殊方块 ID 列表
 * @returns 特殊方块 ID 列表
 */
export const getSpecialBlockIds = (): BlockId[] => {
  return Object.keys(GAME_CONFIG.SHAPES).filter(
    (id) => GAME_CONFIG.BLOCK_TYPES[id as BlockId] === PieceType.SPECIAL
  ) as BlockId[];
};

/**
 * 获取所有可用方块 ID 列表（包含基础和特殊）
 * @returns 所有方块 ID 列表
 */
export const getAllBlockIds = (): BlockId[] => {
  return Object.keys(GAME_CONFIG.SHAPES) as BlockId[];
};

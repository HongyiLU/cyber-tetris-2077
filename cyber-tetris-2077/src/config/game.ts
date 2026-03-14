// Game Configuration
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
};

export type BlockId = keyof typeof GAME_CONFIG.SHAPES;

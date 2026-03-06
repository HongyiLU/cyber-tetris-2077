// ==================== 赛博方块 2077 - 游戏配置 ====================

export const GAME_CONFIG = {
  // ==================== 基础游戏设置 ====================
  GAME: {
    COLS: 10,
    ROWS: 20,
    BLOCK_SIZE: 30,
    FPS: 60,
  },
  
  // ==================== 游戏速度 ====================
  SPEED: {
    BASE_SPEED: 1000,
    MIN_SPEED: 80,
    SPEED_FACTOR: 900,
    SPEED_THRESHOLD: 8000,
  },
  
  // ==================== 难度曲线 ====================
  DIFFICULTY: {
    LINES_PER_PUSHUP: 10,
    MAX_PUSHUP_INTERVAL: 30000,
    MIN_PUSHUP_INTERVAL: 10000,
    PUSHUP_THRESHOLD: 8000,
    GARBAGE_FILL_RATE: 0.7,
  },
  
  // ==================== 特殊方块系统 ====================
  // 已移除：游戏现在只使用经典 7 种方块
  SPECIAL: {
    // 特殊方块系统已禁用
  },
  
  // ==================== 分数系统 ====================
  SCORE: {
    LINES: [0, 150, 450, 750, 1200],
    SCORE_ANIM_DECAY: 0.9,
    SCORE_ANIM_THRESHOLD: 0.1,
  },
  
  // ==================== 方块形状 ====================
  SHAPES: {
    // 经典 7 种（已移除所有特殊方块）
    I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1],[0,0,0]],
    S: [[0,1,1],[1,1,0],[0,0,0]],
    Z: [[1,1,0],[0,1,1],[0,0,0]],
    L: [[0,0,1],[1,1,1],[0,0,0]],
    J: [[1,0,0],[1,1,1],[0,0,0]],
  },
  
  // ==================== 方块颜色 ====================
  COLORS: {
    // 经典 7 块 - 使用高对比度颜色
    I: '#00ffff',    // 青色
    O: '#ffff00',    // 黄色
    T: '#da70d6',    // 兰花紫
    S: '#00ff00',    // 绿色
    Z: '#ff4444',    // 红色
    L: '#ff8c00',    // 深橙色
    J: '#4169e1',    // 宝蓝色
  },
  
  // ==================== 方块类型映射 ====================
  PIECE_TYPE_MAP: {
    I: 1, O: 2, T: 3, S: 4, Z: 5, L: 6, J: 7,
  },
  
  // ==================== 卡牌数据 ====================
  CARDS: [
    { id: 'I', name: 'I-方块', type: 'basic', rarity: 'common', desc: '直线方块' },
    { id: 'O', name: 'O-方块', type: 'basic', rarity: 'common', desc: '方形方块' },
    { id: 'T', name: 'T-方块', type: 'basic', rarity: 'common', desc: 'T 型方块' },
    { id: 'S', name: 'S-方块', type: 'basic', rarity: 'common', desc: 'S 型方块' },
    { id: 'Z', name: 'Z-方块', type: 'basic', rarity: 'common', desc: 'Z 型方块' },
    { id: 'L', name: 'L-方块', type: 'basic', rarity: 'common', desc: 'L 型方块' },
    { id: 'J', name: 'J-方块', type: 'basic', rarity: 'common', desc: 'J 型方块' },
  ],
  
  // ==================== 卡组系统配置 ====================
  DECK: {
    GARBAGE_PENALTY_ROWS: 2,    // 抽空惩罚行数
    // GARBAGE_GAP_CHANCE: 0.1,  // 预留未来实现多缺口功能
  },
};

// 分数倍率（根据方块大小）
// 经典 7 种方块都是 4 格
export const PIECE_SIZE_MULTIPLIER: Record<number, number> = {
  4: 1.0,   // 4 格方块（经典 7 种）
};

export default GAME_CONFIG;

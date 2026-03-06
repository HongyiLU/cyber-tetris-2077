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
    SLOWMO_MULTIPLIER: 3,
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
  SPECIAL: {
    MIN_PIECES_BETWEEN: 3,
    MAX_PIECES_BETWEEN: 10,
    BASE_CHANCE: 0.2,
    LINES_BONUS: 0.01,
    
    WEIGHTS: {
      BOMB: 15,
      ROW: 20,
      COL: 20,
      RAINBOW: 10,
      GRAVITY: 25,
      SLOWMO: 15,
      STAR: 5,
      VORTEX: 3,
    },
  },
  
  // ==================== 分数系统 ====================
  SCORE: {
    LINES: [0, 150, 450, 750, 1200],
    SPECIAL_BASE: 100,
    SPECIAL_BOMB: 100,
    SPECIAL_ROW: 200,
    SPECIAL_COL: 200,
    SPECIAL_RAINBOW: 20,
    SPECIAL_STAR: 500,
    SCORE_ANIM_DECAY: 0.9,
    SCORE_ANIM_THRESHOLD: 0.1,
  },
  
  // ==================== 方块形状 ====================
  SHAPES: {
    // 经典 7 种
    I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1],[0,0,0]],
    S: [[0,1,1],[1,1,0],[0,0,0]],
    Z: [[1,1,0],[0,1,1],[0,0,0]],
    L: [[0,0,1],[1,1,1],[0,0,0]],
    J: [[1,0,0],[1,1,1],[0,0,0]],
    
    // 特殊方块（默认解锁）
    BOMB: [[1]],
    ROW: [[1,1,1]],
    COL: [[1],[1],[1]],
    RAINBOW: [[1,0,1],[0,1,0],[1,0,1]],
    GRAVITY: [[1],[1],[1],[1]],
    SLOWMO: [[1,1],[1,1]],
    STAR: [[0,1,0],[1,1,1],[0,1,0]],
    VORTEX: [[1,0],[0,1]],
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
    
    // 特殊方块 - 使用更醒目的颜色
    BOMB: '#dc143c', // 深红色
    ROW: '#32cd32',  // 酸橙色
    COL: '#6495ed',  // 矢车菊蓝
    RAINBOW: '#ff1493', // 深粉色
    GRAVITY: '#ffa500', // 橙色
    SLOWMO: '#00ced1',  // 深青色
    STAR: '#ffd700',    // 金色
    VORTEX: '#8a2be2',  // 蓝紫色
  },
  
  // ==================== 方块类型映射 ====================
  PIECE_TYPE_MAP: {
    I: 1, O: 2, T: 3, S: 4, Z: 5, L: 6, J: 7,
    BOMB: 8, ROW: 9, COL: 10, RAINBOW: 11, GRAVITY: 12,
    SLOWMO: 13, STAR: 14, VORTEX: 15,
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
    { id: 'BOMB', name: '炸弹方块', type: 'special', rarity: 'rare', desc: '炸 3×3 范围' },
    { id: 'SLOWMO', name: '减速方块', type: 'special', rarity: 'rare', desc: '减速 10 秒' },
    { id: 'ROW', name: '消行方块', type: 'special', rarity: 'rare', desc: '消除整行' },
    { id: 'COL', name: '消列方块', type: 'special', rarity: 'rare', desc: '消除整列' },
    { id: 'GRAVITY', name: '重力方块', type: 'special', rarity: 'rare', desc: '全场落下' },
    { id: 'RAINBOW', name: '彩虹方块', type: 'special', rarity: 'epic', desc: '消相邻同色' },
    { id: 'STAR', name: '万能方块', type: 'special', rarity: 'legendary', desc: '消除整行 +500 分' },
    { id: 'VORTEX', name: '漩涡方块', type: 'special', rarity: 'epic', desc: '随机打乱' },
  ],
  
  // ==================== 卡组系统配置 ====================
  DECK: {
    GARBAGE_PENALTY_ROWS: 2,    // 抽空惩罚行数
    // GARBAGE_GAP_CHANCE: 0.1,  // 预留未来实现多缺口功能
  },
};

// 分数倍率（根据方块大小）
export const PIECE_SIZE_MULTIPLIER: Record<number, number> = {
  1: 1.0,   // 1 格方块（BOMB）
  2: 0.5,   // 2 格方块（VORTEX）
  3: 0.8,   // 3 格方块（ROW, COL）
  4: 1.0,   // 4 格方块（经典 7 种 + GRAVITY + SLOWMO）
  5: 1.5,   // 5 格方块（RAINBOW, STAR）
};

export default GAME_CONFIG;

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
    // 经典 7 种
    I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1],[0,0,0]],
    S: [[0,1,1],[1,1,0],[0,0,0]],
    Z: [[1,1,0],[0,1,1],[0,0,0]],
    L: [[0,0,1],[1,1,1],[0,0,0]],
    J: [[1,0,0],[1,1,1],[0,0,0]],
    // v1.9.17 特殊效果方块（单格）
    BOMB: [[1]],
    TIME: [[1]],
    HEAL: [[1]],
    SHIELD: [[1]],
    COMBO: [[1]],
    CLEAR: [[1]],
    LUCKY: [[1]],
    FREEZE: [[1]],
    FIRE: [[1]],
    LIGHTNING: [[1]],
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
    // v1.9.16 特殊效果方块颜色
    BOMB: '#ff6600',
    TIME: '#00ccff',
    HEAL: '#ff69b4',
    SHIELD: '#cccccc',
    COMBO: '#9932cc',
    CLEAR: '#ffd700',
    LUCKY: '#32cd32',
    FREEZE: '#87ceeb',
    FIRE: '#ff4500',
    LIGHTNING: '#ffff00',
  },
  
  // ==================== 方块类型映射 ====================
  PIECE_TYPE_MAP: {
    I: 1, O: 2, T: 3, S: 4, Z: 5, L: 6, J: 7,
  },
  
  // ==================== 卡牌数据 ====================
  // v1.9.14 - 完整卡牌系统（卡名、效果、稀有度）
  CARDS: [
    { 
      id: 'I', 
      name: '直线冲击', 
      type: 'basic', 
      rarity: 'epic', 
      desc: '消除整行，造成穿透伤害',
      color: '#00ffff',
    },
    { 
      id: 'O', 
      name: '坚固壁垒', 
      type: 'basic', 
      rarity: 'common', 
      desc: '稳定下落，不易被打断',
      color: '#ffff00',
    },
    { 
      id: 'T', 
      name: '旋转突击', 
      type: 'basic', 
      rarity: 'uncommon', 
      desc: '可旋转，灵活应对各种局面',
      color: '#da70d6',
    },
    { 
      id: 'S', 
      name: '曲折前进', 
      type: 'basic', 
      rarity: 'rare', 
      desc: '连续消除获得连击加成',
      color: '#00ff00',
    },
    { 
      id: 'Z', 
      name: '反向突袭', 
      type: 'basic', 
      rarity: 'rare', 
      desc: '反向移动时速度提升',
      color: '#ff4444',
    },
    { 
      id: 'L', 
      name: '角落专家', 
      type: 'basic', 
      rarity: 'uncommon', 
      desc: '擅长填充角落空隙',
      color: '#ff8c00',
    },
    { 
      id: 'J', 
      name: '镜像战士', 
      type: 'basic', 
      rarity: 'uncommon', 
      desc: '与 L 方块对称，效果相同',
      color: '#4169e1',
    },
    // v1.9.16 特殊效果方块卡牌（独立的方块类型）
    { 
      id: 'BOMB', 
      name: '💣 炸弹方块', 
      type: 'special', 
      rarity: 'epic', 
      desc: '消除 3x3 区域',
      color: '#ff6600',
    },
    { 
      id: 'TIME', 
      name: '⏰ 时间停止', 
      type: 'special', 
      rarity: 'legendary', 
      desc: '暂停敌人攻击 10 秒',
      color: '#00ccff',
    },
    { 
      id: 'HEAL', 
      name: '💖 生命偷取', 
      type: 'special', 
      rarity: 'rare', 
      desc: '恢复 5 点生命值',
      color: '#ff69b4',
    },
    { 
      id: 'SHIELD', 
      name: '🛡️ 防御护盾', 
      type: 'special', 
      rarity: 'uncommon', 
      desc: '抵挡下一次攻击',
      color: '#cccccc',
    },
    { 
      id: 'COMBO', 
      name: '📈 连击增幅', 
      type: 'special', 
      rarity: 'epic', 
      desc: '连击伤害 +50%',
      color: '#9932cc',
    },
    { 
      id: 'CLEAR', 
      name: '🌟 全屏清除', 
      type: 'special', 
      rarity: 'legendary', 
      desc: '清除所有垃圾行',
      color: '#ffd700',
    },
    { 
      id: 'LUCKY', 
      name: '7️⃣ 幸运七', 
      type: 'special', 
      rarity: 'uncommon', 
      desc: '第 7 次消除 2x 伤害',
      color: '#32cd32',
    },
    { 
      id: 'FREEZE', 
      name: '❄️ 寒冰冻结', 
      type: 'special', 
      rarity: 'rare', 
      desc: '冻结敌人 3 秒',
      color: '#87ceeb',
    },
    { 
      id: 'FIRE', 
      name: '🔥 火焰燃烧', 
      type: 'special', 
      rarity: 'uncommon', 
      desc: '持续伤害 10 点（5 秒）',
      color: '#ff4500',
    },
    { 
      id: 'LIGHTNING', 
      name: '⚡ 雷电连锁', 
      type: 'special', 
      rarity: 'epic', 
      desc: '连锁消除相邻方块',
      color: '#ffff00',
    },
  ],
  
  // ==================== 卡组系统配置 ====================
  DECK: {
    GARBAGE_PENALTY_ROWS: 2,    // 抽空惩罚行数
    // GARBAGE_GAP_CHANCE: 0.1,  // 预留未来实现多缺口功能
  },
};

// 分数倍率（根据方块大小）
// 经典 7 种方块都是 4 格，特殊方块是 1 格
export const PIECE_SIZE_MULTIPLIER: Record<number, number> = {
  4: 1.0,   // 4 格方块（经典 7 种）
  1: 0.5,   // 1 格方块（特殊效果方块）
};

// 方块名称映射
export const BLOCK_NAMES: Record<string, string> = {
  I: 'I-Block',
  O: 'O-Block',
  T: 'T-Block',
  S: 'S-Block',
  Z: 'Z-Block',
  L: 'L-Block',
  J: 'J-Block',
  BOMB: '💣 炸弹方块',
  TIME: '⏰ 时间停止',
  HEAL: '💖 生命偷取',
  SHIELD: '🛡️ 防御护盾',
  COMBO: '📈 连击增幅',
  CLEAR: '🌟 全屏清除',
  LUCKY: '7️⃣ 幸运七',
  FREEZE: '❄️ 寒冰冻结',
  FIRE: '🔥 火焰燃烧',
  LIGHTNING: '⚡ 雷电连锁',
};

export default GAME_CONFIG;

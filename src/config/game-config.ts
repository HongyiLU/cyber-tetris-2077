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
  // 注意：特殊方块已在 SHAPES 和 COLORS 中定义（bomb_block, time_stop 等）
  // 此处用于配置特殊方块的全局开关和行为
  SPECIAL: {
    ENABLED: true,
    SPAWN_CHANCE: 0.1, // 特殊方块生成概率
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
    // 注意：键名必须与卡牌 ID 一致（小写 + 下划线）
    bomb_block: [[1]],
    time_stop: [[1]],
    heal_block: [[1]],
    shield_block: [[1]],
    combo_block: [[1]],
    clear_block: [[1]],
    lucky_block: [[1]],
    freeze_block: [[1]],
    fire_block: [[1]],
    lightning_block: [[1]],
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
    // 注意：键名必须与卡牌 ID 一致（小写 + 下划线）
    bomb_block: '#ff6600',
    time_stop: '#00ccff',
    heal_block: '#ff69b4',
    shield_block: '#cccccc',
    combo_block: '#9932cc',
    clear_block: '#ffd700',
    lucky_block: '#32cd32',
    freeze_block: '#87ceeb',
    fire_block: '#ff4500',
    lightning_block: '#ffff00',
  },
  
  // ==================== 方块类型映射 ====================
  PIECE_TYPE_MAP: {
    I: 1, O: 2, T: 3, S: 4, Z: 5, L: 6, J: 7,
    // v1.9.21 新增：特殊方块（8-17）
    bomb_block: 8, time_stop: 9, heal_block: 10,
    shield_block: 11, combo_block: 12, clear_block: 13,
    lucky_block: 14, freeze_block: 15, fire_block: 16, lightning_block: 17,
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
    // 注意：id 必须与 CardDatabase 中的卡牌 ID 一致（小写 + 下划线格式）
    { 
      id: 'bomb_block', 
      name: '💣 炸弹方块', 
      type: 'special', 
      rarity: 'epic', 
      desc: '消除 3x3 区域',
      color: '#ff6600',
    },
    { 
      id: 'time_stop', 
      name: '⏰ 时间停止', 
      type: 'special', 
      rarity: 'legendary', 
      desc: '暂停敌人攻击 10 秒',
      color: '#00ccff',
    },
    { 
      id: 'heal_block', 
      name: '💖 生命偷取', 
      type: 'special', 
      rarity: 'rare', 
      desc: '恢复 5 点生命值',
      color: '#ff69b4',
    },
    { 
      id: 'shield_block', 
      name: '🛡️ 防御护盾', 
      type: 'special', 
      rarity: 'uncommon', 
      desc: '抵挡下一次攻击',
      color: '#cccccc',
    },
    { 
      id: 'combo_block', 
      name: '📈 连击增幅', 
      type: 'special', 
      rarity: 'epic', 
      desc: '连击伤害 +50%',
      color: '#9932cc',
    },
    { 
      id: 'clear_block', 
      name: '🌟 全屏清除', 
      type: 'special', 
      rarity: 'legendary', 
      desc: '清除所有垃圾行',
      color: '#ffd700',
    },
    { 
      id: 'lucky_block', 
      name: '7️⃣ 幸运七', 
      type: 'special', 
      rarity: 'uncommon', 
      desc: '第 7 次消除 2x 伤害',
      color: '#32cd32',
    },
    { 
      id: 'freeze_block', 
      name: '❄️ 寒冰冻结', 
      type: 'special', 
      rarity: 'rare', 
      desc: '冻结敌人 3 秒',
      color: '#87ceeb',
    },
    { 
      id: 'fire_block', 
      name: '🔥 火焰燃烧', 
      type: 'special', 
      rarity: 'uncommon', 
      desc: '持续伤害 10 点（5 秒）',
      color: '#ff4500',
    },
    { 
      id: 'lightning_block', 
      name: '⚡ 雷电连锁', 
      type: 'special', 
      rarity: 'rare', 
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
  bomb_block: '💣 炸弹方块',
  time_stop: '⏰ 时间停止',
  heal_block: '💖 生命偷取',
  shield_block: '🛡️ 防御护盾',
  combo_block: '📈 连击增幅',
  clear_block: '🌟 全屏清除',
  lucky_block: '7️⃣ 幸运七',
  freeze_block: '❄️ 寒冰冻结',
  fire_block: '🔥 火焰燃烧',
  lightning_block: '⚡ 雷电连锁',
};

export default GAME_CONFIG;

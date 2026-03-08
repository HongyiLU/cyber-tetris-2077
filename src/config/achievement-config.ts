/**
 * 成就配置表
 * 包含 20+ 个成就，分布在 4 个类别
 */

import { Achievement, AchievementReward } from '../types/achievement';

export const ACHIEVEMENT_CONFIG: Achievement[] = [
  // ==================== 战斗成就 ====================
  {
    id: 'battle_001',
    name: '初出茅庐',
    description: '首次击败敌人',
    icon: '⚔️',
    category: 'battle',
    difficulty: '⭐',
    condition: {
      type: 'killCount',
      target: 1,
      description: '击败 1 个敌人',
    },
    reward: {
      type: 'gold',
      value: 100,
      description: '100 金币',
    },
  },
  {
    id: 'battle_002',
    name: '百战百胜',
    description: '累计击败 10 个敌人',
    icon: '🏆',
    category: 'battle',
    difficulty: '⭐⭐',
    condition: {
      type: 'killCount',
      target: 10,
      description: '击败 10 个敌人',
    },
    reward: {
      type: 'gold',
      value: 500,
      description: '500 金币',
    },
  },
  {
    id: 'battle_003',
    name: '传奇战士',
    description: '累计击败 100 个敌人',
    icon: '👑',
    category: 'battle',
    difficulty: '⭐⭐⭐⭐',
    condition: {
      type: 'killCount',
      target: 100,
      description: '击败 100 个敌人',
    },
    reward: {
      type: 'gold',
      value: 5000,
      description: '5000 金币',
    },
  },
  {
    id: 'battle_004',
    name: '无伤通关',
    description: '不受到伤害击败敌人',
    icon: '🛡️',
    category: 'battle',
    difficulty: '⭐⭐⭐⭐⭐',
    condition: {
      type: 'perfectWin',
      target: 1,
      description: '无伤胜利 1 次',
    },
    reward: {
      type: 'gold',
      value: 1000,
      description: '1000 金币',
    },
  },
  {
    id: 'battle_005',
    name: '伤害大师',
    description: '累计造成 10000 点伤害',
    icon: '💥',
    category: 'battle',
    difficulty: '⭐⭐⭐',
    condition: {
      type: 'damageDealt',
      target: 10000,
      description: '造成 10000 点伤害',
    },
    reward: {
      type: 'gold',
      value: 800,
      description: '800 金币',
    },
  },
  {
    id: 'battle_006',
    name: '连胜之王',
    description: '达成 5 连胜',
    icon: '🔥',
    category: 'battle',
    difficulty: '⭐⭐⭐',
    condition: {
      type: 'winStreak',
      target: 5,
      description: '连胜 5 场',
    },
    reward: {
      type: 'gold',
      value: 600,
      description: '600 金币',
    },
  },

  // ==================== 连击成就 ====================
  {
    id: 'combo_001',
    name: '连击新手',
    description: '达成 5 连击',
    icon: '🎯',
    category: 'combo',
    difficulty: '⭐',
    condition: {
      type: 'maxCombo',
      target: 5,
      description: '最大连击达到 5',
    },
    reward: {
      type: 'gold',
      value: 50,
      description: '50 金币',
    },
  },
  {
    id: 'combo_002',
    name: '连击大师',
    description: '达成 20 连击',
    icon: '⭐',
    category: 'combo',
    difficulty: '⭐⭐⭐',
    condition: {
      type: 'maxCombo',
      target: 20,
      description: '最大连击达到 20',
    },
    reward: {
      type: 'gold',
      value: 500,
      description: '500 金币',
    },
  },
  {
    id: 'combo_003',
    name: '连击之神',
    description: '达成 50 连击',
    icon: '✨',
    category: 'combo',
    difficulty: '⭐⭐⭐⭐⭐',
    condition: {
      type: 'maxCombo',
      target: 50,
      description: '最大连击达到 50',
    },
    reward: {
      type: 'gold',
      value: 2000,
      description: '2000 金币',
    },
  },

  // ==================== 消除成就 ====================
  {
    id: 'clear_001',
    name: '一次消除',
    description: '单次消除 4 行 (Tetris)',
    icon: '📦',
    category: 'clear',
    difficulty: '⭐',
    condition: {
      type: 'tetrisCount',
      target: 1,
      description: '完成 1 次 Tetris',
    },
    reward: {
      type: 'gold',
      value: 100,
      description: '100 金币',
    },
  },
  {
    id: 'clear_002',
    name: '完美大师',
    description: '累计 100 次 Tetris',
    icon: '💎',
    category: 'clear',
    difficulty: '⭐⭐⭐',
    condition: {
      type: 'tetrisCount',
      target: 100,
      description: '完成 100 次 Tetris',
    },
    reward: {
      type: 'gold',
      value: 1000,
      description: '1000 金币',
    },
  },
  {
    id: 'clear_003',
    name: '极速消除',
    description: '10 秒内完成 10 次消除',
    icon: '⚡',
    category: 'clear',
    difficulty: '⭐⭐⭐⭐',
    condition: {
      type: 'speedClear',
      target: 10,
      description: '10 秒内消除 10 次',
    },
    reward: {
      type: 'gold',
      value: 800,
      description: '800 金币',
    },
  },
  {
    id: 'clear_004',
    name: '千行突破',
    description: '累计消除 1000 行',
    icon: '🎊',
    category: 'clear',
    difficulty: '⭐⭐⭐⭐',
    condition: {
      type: 'linesCleared',
      target: 1000,
      description: '消除 1000 行',
    },
    reward: {
      type: 'gold',
      value: 1500,
      description: '1500 金币',
    },
  },

  // ==================== 特殊成就 ====================
  {
    id: 'special_001',
    name: '收藏家',
    description: '解锁 10 种装备',
    icon: '🎒',
    category: 'special',
    difficulty: '⭐⭐',
    condition: {
      type: 'equipmentUnlock',
      target: 10,
      description: '解锁 10 种装备',
    },
    reward: {
      type: 'gold',
      value: 300,
      description: '300 金币',
    },
  },
  {
    id: 'special_002',
    name: '装备大师',
    description: '解锁所有装备',
    icon: '👑',
    category: 'special',
    difficulty: '⭐⭐⭐⭐⭐',
    condition: {
      type: 'equipmentUnlock',
      target: 18,
      description: '解锁所有 18 种装备',
    },
    reward: {
      type: 'gold',
      value: 3000,
      description: '3000 金币',
    },
  },
  {
    id: 'special_003',
    name: '高分王者',
    description: '单局得分达到 10000 分',
    icon: '🎮',
    category: 'special',
    difficulty: '⭐⭐⭐',
    condition: {
      type: 'totalScore',
      target: 10000,
      description: '单局 10000 分',
    },
    reward: {
      type: 'gold',
      value: 700,
      description: '700 金币',
    },
  },
  {
    id: 'special_004',
    name: '治疗专家',
    description: '累计治疗 1000 点生命值',
    icon: '💖',
    category: 'special',
    difficulty: '⭐⭐',
    condition: {
      type: 'healAmount',
      target: 1000,
      description: '治疗 1000 点生命',
    },
    reward: {
      type: 'gold',
      value: 400,
      description: '400 金币',
    },
  },
];

/**
 * 按类别获取成就
 */
export function getAchievementsByCategory(category: string): Achievement[] {
  return ACHIEVEMENT_CONFIG.filter(a => a.category === category);
}

/**
 * 按难度获取成就
 */
export function getAchievementsByDifficulty(difficulty: string): Achievement[] {
  return ACHIEVEMENT_CONFIG.filter(a => a.difficulty === difficulty);
}

/**
 * 根据 ID 获取成就
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENT_CONFIG.find(a => a.id === id);
}

/**
 * 获取所有成就
 */
export function getAllAchievements(): Achievement[] {
  return ACHIEVEMENT_CONFIG;
}

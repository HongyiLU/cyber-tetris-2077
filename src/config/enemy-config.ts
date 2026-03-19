// ==================== 敌人配置 ====================

import type { EnemyType } from '../types/enemy';
import { EnemyConfig, AILevel } from '../core/EnemyAI';

/**
 * 所有敌人类型配置
 */
export const ENEMY_TYPES: EnemyType[] = [
  {
    id: 'slime',
    name: '史莱姆',
    emoji: '🦠',
    hp: 200,
    attackInterval: 10000, // 10 秒
    attackDamage: 10,
    garbageRows: 1,
    description: '最基础的敌人，行动缓慢',
    rarity: 'common',
  },
  {
    id: 'goblin',
    name: '哥布林',
    emoji: '👺',
    hp: 150,
    attackInterval: 8000, // 8 秒
    attackDamage: 15,
    garbageRows: 2,
    description: '敏捷但脆弱的敌人',
    rarity: 'common',
  },
  {
    id: 'orc',
    name: '兽人',
    emoji: '👹',
    hp: 300,
    attackInterval: 12000, // 12 秒
    attackDamage: 20,
    garbageRows: 2,
    description: '强大但缓慢的敌人',
    rarity: 'uncommon',
  },
  {
    id: 'ghost',
    name: '幽灵',
    emoji: '👻',
    hp: 180,
    attackInterval: 6000, // 6 秒
    attackDamage: 8,
    garbageRows: 1,
    description: '快速攻击的幽灵',
    rarity: 'uncommon',
  },
  {
    id: 'dragon',
    name: '巨龙',
    emoji: '🐉',
    hp: 500,
    attackInterval: 15000, // 15 秒
    attackDamage: 25,
    garbageRows: 3,
    description: '强大的 Boss 级敌人',
    rarity: 'legendary',
    isFinalBoss: true,
  },
];

/**
 * 根据 ID 获取敌人类型
 */
export function getEnemyType(enemyId: string): EnemyType | undefined {
  return ENEMY_TYPES.find(enemy => enemy.id === enemyId);
}

/**
 * 获取所有可用敌人（按稀有度排序）
 */
export function getAllEnemies(): EnemyType[] {
  const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  return [...ENEMY_TYPES].sort((a, b) => {
    return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
  });
}

/**
 * 根据稀有度筛选敌人
 */
export function getEnemiesByRarity(rarity: string): EnemyType[] {
  return ENEMY_TYPES.filter(enemy => enemy.rarity === rarity);
}

// ==================== Day 4 扩展：EnemyConfig 用于 AI 系统 ====================
// 以下为 EnemyAI 系统提供的配置，与上面的 EnemyType（GameEngine 战斗系统）不同

/**
 * 预设敌人配置（用于 EnemyAI 系统）
 */
export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  slime: {
    name: '史莱姆',
    maxHP: 20,
    attack: 3,
    defense: 0,
    aiLevel: AILevel.EASY,
    skills: [
      {
        id: 'slime_attack',
        name: '撞击',
        damage: 3,
        cooldown: 0,
        currentCooldown: 0,
      },
    ],
  },
  goblin: {
    name: '哥布林',
    maxHP: 35,
    attack: 5,
    defense: 2,
    aiLevel: AILevel.NORMAL,
    skills: [
      {
        id: 'goblin_strike',
        name: '猛击',
        damage: 8,
        cooldown: 2,
        currentCooldown: 0,
      },
      {
        id: 'goblin_defend',
        name: '格挡',
        block: 5,
        cooldown: 3,
        currentCooldown: 0,
      },
    ],
  },
  skeleton: {
    name: '骷髅战士',
    maxHP: 50,
    attack: 7,
    defense: 3,
    aiLevel: AILevel.NORMAL,
    skills: [
      {
        id: 'bone_slash',
        name: '骨刃',
        damage: 10,
        cooldown: 2,
        currentCooldown: 0,
      },
      {
        id: 'bone_shield',
        name: '骨盾',
        block: 8,
        cooldown: 3,
        currentCooldown: 0,
      },
    ],
  },
  demon: {
    name: '恶魔',
    maxHP: 80,
    attack: 12,
    defense: 5,
    aiLevel: AILevel.HARD,
    skills: [
      {
        id: 'infernal_strike',
        name: '地狱打击',
        damage: 18,
        cooldown: 2,
        currentCooldown: 0,
      },
      {
        id: 'flame_shield',
        name: '火焰护盾',
        block: 12,
        cooldown: 3,
        currentCooldown: 0,
      },
      {
        id: 'life_drain',
        name: '生命吸取',
        damage: 8,
        heal: 8,
        cooldown: 4,
        currentCooldown: 0,
      },
    ],
  },
};

/**
 * 根据 ID 获取敌人配置
 */
export function getEnemyConfig(enemyId: string): EnemyConfig | undefined {
  return ENEMY_CONFIGS[enemyId];
}

/**
 * 获取所有敌人配置
 */
export function getAllEnemyConfigs(): EnemyConfig[] {
  return Object.values(ENEMY_CONFIGS);
}

/**
 * 按 AI 难度获取敌人
 */
export function getEnemiesByAILevel(aiLevel: AILevel): EnemyConfig[] {
  return Object.values(ENEMY_CONFIGS).filter(
    enemy => enemy.aiLevel === aiLevel
  );
}

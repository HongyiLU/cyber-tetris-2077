// ==================== 游戏核心类型定义 ====================

/**
 * 方块位置接口
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 方块接口
 */
export interface Piece {
  type: string;
  shape: number[][];
  position: Position;
  color: string;
}

/**
 * 战斗状态枚举
 */
export enum BattleState {
  IDLE = 'idle',
  FIGHTING = 'fighting',
  WON = 'won',
  LOST = 'lost',
}

/**
 * 游戏状态接口
 */
export interface GameState {
  board: number[][];
  currentPiece: Piece | null;
  nextPiece: Piece | null;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  paused: boolean;
  // 战斗系统血量
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  battleState: BattleState;
  // 连击系统
  combo: number;
  maxCombo: number;
}

/**
 * 方块类型枚举
 * 注意：只包含 GAME_CONFIG.CARDS 中定义的方块类型
 */
export enum PieceType {
  // 经典 7 种
  I = 'I',
  O = 'O',
  T = 'T',
  S = 'S',
  Z = 'Z',
  L = 'L',
  J = 'J',
  // v1.9.16 特殊效果方块
  BOMB = 'BOMB',
  TIME = 'TIME',
  HEAL = 'HEAL',
  SHIELD = 'SHIELD',
  COMBO = 'COMBO',
  CLEAR = 'CLEAR',
  LUCKY = 'LUCKY',
  FREEZE = 'FREEZE',
  FIRE = 'FIRE',
  LIGHTNING = 'LIGHTNING',
  // 特殊方块（默认解锁）
  BOMB_OLD = 'BOMB',
  ROW = 'ROW',
  COL = 'COL',
  RAINBOW = 'RAINBOW',
  GRAVITY = 'GRAVITY',
  SLOWMO = 'SLOWMO',
  STAR = 'STAR',
  VORTEX = 'VORTEX',
}

/**
 * 方块形状类型
 */
export type PieceShape = number[][];

/**
 * 卡牌数据接口
 */
export interface CardData {
  id: string;
  name: string;
  type: 'basic' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  desc: string;
  color?: string;
}

/**
 * 分数倍率类型
 */
export type PieceSizeMultiplier = Record<number, number>;

// 导出卡组系统类型
export type { Deck, DeckConfig, DeckValidationResult, PresetDeck } from './deck';
export { DEFAULT_DECK_CONFIG } from './deck';

// 导出 DeckManager 类
export { DeckManager } from '../engine/DeckManager';

// 导出敌人系统类型
export type { EnemyType, EnemyInstance } from './enemy';

// 导出装备系统类型
export type {
  Equipment,
  EquipmentRarity,
  EquipmentType,
  EquipmentEffect,
  EquipmentEffectType,
  EquipmentSlot,
  EquipmentState,
  AppliedEquipmentEffects,
} from './equipment';
export { RARITY_COLORS, RARITY_WEIGHTS } from './equipment';

// 导出成就系统类型
export type {
  Achievement,
  AchievementDifficulty,
  AchievementCategory,
  AchievementCondition,
  AchievementConditionType,
  AchievementReward,
  AchievementProgress,
  AchievementState,
} from './achievement';
export { DIFFICULTY_WEIGHTS, CATEGORY_NAMES } from './achievement';

// 导出排行榜系统类型
export type {
  Leaderboard,
  LeaderboardEntry,
  LeaderboardType,
  LeaderboardState,
  LeaderboardConfig,
} from './leaderboard';
export { LEADERBOARD_NAMES, LEADERBOARD_ICONS, DEFAULT_LEADERBOARD_CONFIG } from './leaderboard';

// 导出方块类型定义（v1.9.16）
export type { BasicBlockId, SpecialBlockId } from './block-types';
export { PieceType as BlockType } from './block-types';

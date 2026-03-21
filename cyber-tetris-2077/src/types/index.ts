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

// 导出 v2.0.0 卡牌系统类型
export type {
  Card,
  CardShape,
  CardUpgradeEffect,
  CardSpecialEffect,
} from './card.v2';
export {
  CardRarity,
  CARD_RARITY_WEIGHTS,
  UPGRADE_MULTIPLIERS,
  getUpgradeMultiplier,
} from './card.v2';

// 导出 v2.0.0 卡组构筑系统类型
export type {
  DeckBuilderState,
  RewardOption,
  DeckBuilderSaveData,
} from './deck-builder';
export {
  GameStage,
  createDefaultDeckBuilderState,
} from './deck-builder';

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
  // 特殊方块（默认解锁）
  BOMB = 'BOMB',
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
 * 游戏配置接口
 */
export interface GameConfig {
  GAME: {
    COLS: number;
    ROWS: number;
    BLOCK_SIZE: number;
    FPS: number;
  };
  SPEED: {
    BASE_SPEED: number;
    MIN_SPEED: number;
    SPEED_FACTOR: number;
    SPEED_THRESHOLD: number;
    SLOWMO_MULTIPLIER: number;
  };
  DIFFICULTY: {
    LINES_PER_PUSHUP: number;
    MAX_PUSHUP_INTERVAL: number;
    MIN_PUSHUP_INTERVAL: number;
    PUSHUP_THRESHOLD: number;
    GARBAGE_FILL_RATE: number;
  };
  SPECIAL: {
    MIN_PIECES_BETWEEN: number;
    MAX_PIECES_BETWEEN: number;
    BASE_CHANCE: number;
    LINES_BONUS: number;
    WEIGHTS: Record<string, number>;
  };
  SCORE: {
    LINES: number[];
    SPECIAL_BASE: number;
    SPECIAL_BOMB: number;
    SPECIAL_ROW: number;
    SPECIAL_COL: number;
    SPECIAL_RAINBOW: number;
    SPECIAL_STAR: number;
    SCORE_ANIM_DECAY: number;
    SCORE_ANIM_THRESHOLD: number;
  };
  SHAPES: Record<string, PieceShape>;
  COLORS: Record<string, string>;
  PIECE_TYPE_MAP: Record<string, number>;
  CARDS: CardData[];
}

/**
 * 卡牌数据接口
 */
export interface CardData {
  id: string;
  name: string;
  type: 'basic' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  desc: string;
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

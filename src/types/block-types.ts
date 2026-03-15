/**
 * 方块类型定义（v1.9.16）
 */

/**
 * 方块类型枚举
 * 用于区分基础方块和特殊效果方块
 */
export enum PieceType {
  /** 基础方块（7 种经典俄罗斯方块） */
  BASIC = 'basic',
  /** 特殊效果方块（10 种特殊效果方块） */
  SPECIAL = 'special',
}

/**
 * 所有方块类型联合类型
 */
export type BlockType = PieceType.BASIC | PieceType.SPECIAL;

/**
 * 基础方块 ID 联合类型
 */
export type BasicBlockId = 'I' | 'O' | 'T' | 'S' | 'Z' | 'L' | 'J';

/**
 * 特殊效果方块 ID 联合类型
 */
export type SpecialBlockId = 
  | 'BOMB'
  | 'TIME'
  | 'HEAL'
  | 'SHIELD'
  | 'COMBO'
  | 'CLEAR'
  | 'LUCKY'
  | 'FREEZE'
  | 'FIRE'
  | 'LIGHTNING';

// ==================== 游戏工具函数 ====================

import type { PieceShape, Position } from '../types';

/**
 * 旋转方块形状
 * @param shape - 方块形状
 * @returns 旋转后的形状
 */
export const rotateShape = (shape: PieceShape): PieceShape => {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: PieceShape = [];

  for (let col = 0; col < cols; col++) {
    rotated[col] = [];
    for (let row = rows - 1; row >= 0; row--) {
      rotated[col].push(shape[row][col]);
    }
  }
  return rotated;
};

/**
 * 创建空棋盘
 * @param cols - 列数
 * @param rows - 行数
 * @returns 空棋盘
 */
export const createEmptyBoard = (cols: number, rows: number): number[][] => {
  return Array(rows).fill(null).map(() => Array(cols).fill(0));
};

/**
 * 检查碰撞
 * @param shape - 方块形状
 * @param position - 位置
 * @param board - 棋盘
 * @param cols - 列数
 * @param rows - 行数
 * @returns 是否碰撞
 * 
 * 修复说明：
 * 1. 完善碰撞检测边界：处理 newY < 0 的情况（方块在棋盘上方）
 * 2. 修复类型安全问题：显式检查 cell !== 0 和 cell !== undefined
 */
export const checkCollision = (
  shape: PieceShape,
  position: Position,
  board: number[][],
  cols: number,
  rows: number
): boolean => {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      // 类型安全修复：显式检查 cell 是否为非零值
      const cell = shape[row][col];
      if (cell !== 0 && cell !== undefined) {
        const newX = position.x + col;
        const newY = position.y + row;

        // 检查左右边界
        if (newX < 0 || newX >= cols) {
          return true;
        }
        
        // 检查底部边界
        if (newY >= rows) {
          return true;
        }
        
        // 完善碰撞检测边界：处理 newY < 0 的情况
        // 当 newY < 0 时，方块还在棋盘上方，不会与棋盘上的方块碰撞
        if (newY < 0) {
          continue; // 跳过检查，允许方块在棋盘上方
        }
        
        // 检查是否与已固定的方块碰撞
        // 类型安全：确保 board 访问安全
        if (board[newY] && board[newY][newX] !== 0) {
          return true;
        }
      }
    }
  }
  return false;
};

/**
 * 计算方块大小（方块中的块数）
 * @param shape - 方块形状
 * @returns 块数
 * 
 * 修复说明：修复类型安全问题，使用 cell !== 0 替代 cell === 1
 */
export const getPieceSize = (shape: PieceShape): number => {
  // 类型安全修复：检查非零值而非固定值 1
  return shape.flat().filter(cell => cell !== 0 && cell !== undefined).length;
};

/**
 * 深拷贝游戏状态中的棋盘
 * @param board - 棋盘
 * @returns 深拷贝的棋盘
 */
export const copyBoard = (board: number[][]): number[][] => {
  return board.map(row => [...row]);
};

/**
 * 深拷贝方块形状
 * @param shape - 形状
 * @returns 深拷贝的形状
 */
export const copyShape = (shape: PieceShape): PieceShape => {
  return shape.map(row => [...row]);
};

/**
 * 检查虚影方块碰撞（简化版，只检测底部和已固定方块）
 * @param shape - 方块形状
 * @param position - 位置
 * @param board - 棋盘
 * @param cols - 列数
 * @param rows - 行数
 * @returns 是否碰撞
 */
export const checkCollisionGhost = (
  shape: PieceShape,
  position: Position,
  board: number[][],
  cols: number,
  rows: number
): boolean => {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      const cell = shape[row][col];
      if (cell !== 0 && cell !== undefined) {
        const newX = position.x + col;
        const newY = position.y + row;

        // 检查左右边界
        if (newX < 0 || newX >= cols) {
          return true;
        }
        
        // 检查底部边界
        if (newY >= rows) {
          return true;
        }
        
        // 检查是否与已固定的方块碰撞
        if (board[newY] && board[newY][newX] !== 0) {
          return true;
        }
      }
    }
  }
  return false;
};

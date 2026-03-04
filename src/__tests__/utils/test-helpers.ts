// ==================== 测试辅助函数 ====================

import { GameEngine } from '../../engine/GameEngine';
import type { GameState, Piece } from '../../types';

/**
 * 创建初始化的游戏引擎实例
 */
export function createInitializedEngine(): GameEngine {
  const engine = new GameEngine();
  engine.init();
  return engine;
}

/**
 * 获取游戏状态的安全副本
 */
export function getGameState(engine: GameEngine): GameState {
  return engine.getGameState();
}

/**
 * 模拟方块下落到底部并锁定
 */
export function dropPieceToBottom(engine: GameEngine): void {
  const state = engine.getGameState();
  if (!state.currentPiece) return;

  while (engine.movePiece(0, 1)) {
    // 持续下落
  }
  engine.lockPiece();
}

/**
 * 填充棋盘指定行
 */
export function fillRow(engine: GameEngine, rowIndex: number): void {
  const state = engine.getGameState();
  const board = state.board;
  
  const testEngine = new GameEngine();
  (testEngine as any).board = board.map((row: number[], idx: number) => 
    idx === rowIndex ? Array(10).fill(1) : [...row]
  );
}

/**
 * 验证方块类型
 */
export function expectPieceType(piece: Piece | null, expectedType: string): void {
  if (!piece) {
    throw new Error(`Expected piece type ${expectedType}, but got null`);
  }
  if (piece.type !== expectedType) {
    throw new Error(`Expected piece type ${expectedType}, but got ${piece.type}`);
  }
}

/**
 * 验证位置
 */
export function expectPosition(
  piece: Piece | null,
  expectedX: number,
  expectedY: number
): void {
  if (!piece) {
    throw new Error(`Expected position (${expectedX}, ${expectedY}), but got null piece`);
  }
  if (piece.position.x !== expectedX || piece.position.y !== expectedY) {
    throw new Error(
      `Expected position (${expectedX}, ${expectedY}), but got (${piece.position.x}, ${piece.position.y})`
    );
  }
}

/**
 * 验证棋盘状态
 */
export function expectBoardCell(
  state: GameState,
  row: number,
  col: number,
  expectedValue: number
): void {
  const actualValue = state.board[row][col];
  if (actualValue !== expectedValue) {
    throw new Error(
      `Expected board[${row}][${col}] to be ${expectedValue}, but got ${actualValue}`
    );
  }
}

/**
 * 验证计分
 */
export function expectScore(state: GameState, expectedScore: number): void {
  if (state.score !== expectedScore) {
    throw new Error(`Expected score ${expectedScore}, but got ${state.score}`);
  }
}

/**
 * 验证消除行数
 */
export function expectLines(state: GameState, expectedLines: number): void {
  if (state.lines !== expectedLines) {
    throw new Error(`Expected lines ${expectedLines}, but got ${state.lines}`);
  }
}

/**
 * 验证等级
 */
export function expectLevel(state: GameState, expectedLevel: number): void {
  if (state.level !== expectedLevel) {
    throw new Error(`Expected level ${expectedLevel}, but got ${state.level}`);
  }
}

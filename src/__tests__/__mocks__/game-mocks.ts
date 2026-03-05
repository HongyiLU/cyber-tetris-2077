// ==================== 游戏模拟数据 ====================

import { GAME_CONFIG } from '../../config/game-config';

/**
 * 模拟方块形状数据
 */
export const mockPieceShapes = {
  I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
  L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
  J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
};

/**
 * 创建模拟方块
 */
export function createMockPiece(
  type: string = 'T',
  x: number = 3,
  y: number = 0
): {
  type: string;
  shape: number[][];
  position: { x: number; y: number };
  color: string;
} {
  return {
    type,
    shape: mockPieceShapes[type as keyof typeof mockPieceShapes] || mockPieceShapes.T,
    position: { x, y },
    color: GAME_CONFIG.COLORS[type as keyof typeof GAME_CONFIG.COLORS] || '#ffffff',
  };
}

/**
 * 创建空的棋盘
 */
export function createEmptyBoard(rows: number = 20, cols: number = 10): number[][] {
  return Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0));
}

/**
 * 创建填充的棋盘（指定行被填充）
 */
export function createFilledBoard(rows: number = 20, cols: number = 10, filledRows: number[] = []): number[][] {
  return Array(rows)
    .fill(null)
    .map((_, rowIdx) =>
      filledRows.includes(rowIdx) ? Array(cols).fill(1) : Array(cols).fill(0)
    );
}

/**
 * 模拟游戏状态
 */
export function createMockGameState(overrides: Partial<any> = {}): any {
  return {
    board: createEmptyBoard(),
    currentPiece: createMockPiece(),
    nextPiece: createMockPiece('I'),
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    paused: false,
    ...overrides,
  };
}

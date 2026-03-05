// ==================== 游戏引擎 ====================

import { GAME_CONFIG, PIECE_SIZE_MULTIPLIER } from '../config/game-config';
import { DeckSystem } from './DeckSystem';
import type { Piece, Position, GameState } from '../types';
import { createEmptyBoard, checkCollision, rotateShape, copyBoard, copyShape } from '../utils/game-utils';

export class GameEngine {
  private cols: number;
  private rows: number;
  private board: number[][];
  private currentPiece: Piece | null = null;
  private nextPiece: Piece | null = null;
  private score: number = 0;
  private lines: number = 0;
  private level: number = 1;
  private gameOver: boolean = false;
  private paused: boolean = false;
  private deckSystem: DeckSystem;
  private pieceLocked: boolean = false; // 标记方块是否已锁定

  constructor(cols: number = GAME_CONFIG.GAME.COLS, rows: number = GAME_CONFIG.GAME.ROWS) {
    this.cols = cols;
    this.rows = rows;
    this.board = createEmptyBoard(cols, rows);
    this.deckSystem = new DeckSystem();
    this.pieceLocked = false;
  }

  private createPiece(type?: string): Piece {
    // 从卡组系统抽取方块类型
    const pieceType = type || this.deckSystem.drawPiece();
    const shape = GAME_CONFIG.SHAPES[pieceType as keyof typeof GAME_CONFIG.SHAPES];
    const color = GAME_CONFIG.COLORS[pieceType as keyof typeof GAME_CONFIG.COLORS];

    return {
      type: pieceType,
      shape,
      position: {
        x: Math.floor((this.cols - shape[0].length) / 2),
        y: 0,
      },
      color,
    };
  }

  public init(): void {
    this.board = createEmptyBoard(this.cols, this.rows);
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.paused = false;
    this.pieceLocked = false;
    this.deckSystem.initializeDeck();
    this.currentPiece = this.createPiece();
    this.nextPiece = this.createPiece();
  }

  public movePiece(dx: number, dy: number): boolean {
    if (!this.currentPiece || this.gameOver || this.paused || this.pieceLocked) return false;

    const newPosition: Position = {
      x: this.currentPiece.position.x + dx,
      y: this.currentPiece.position.y + dy,
    };

    if (!checkCollision(this.currentPiece.shape, newPosition, this.board, this.cols, this.rows)) {
      this.currentPiece.position = newPosition;
      return true;
    }
    return false;
  }

  /**
   * 旋转方块
   * 修复说明：实现基础墙踢机制，旋转时尝试多个位置
   * 
   * 墙踢顺序：
   * 1. 原位置
   * 2. 向右移动 1 格
   * 3. 向左移动 1 格
   * 4. 向右移动 2 格
   * 5. 向左移动 2 格
   */
  public rotatePiece(): boolean {
    if (!this.currentPiece || this.gameOver || this.paused || this.pieceLocked) return false;

    const rotated = rotateShape(this.currentPiece.shape);
    const originalPosition = { ...this.currentPiece.position };

    // 基础墙踢机制：尝试多个位置
    // 1. 原位置
    if (!checkCollision(rotated, originalPosition, this.board, this.cols, this.rows)) {
      this.currentPiece.shape = rotated;
      return true;
    }

    // 2. 向右移动 1 格
    const kickRight = { ...originalPosition, x: originalPosition.x + 1 };
    if (!checkCollision(rotated, kickRight, this.board, this.cols, this.rows)) {
      this.currentPiece.shape = rotated;
      this.currentPiece.position = kickRight;
      return true;
    }

    // 3. 向左移动 1 格
    const kickLeft = { ...originalPosition, x: originalPosition.x - 1 };
    if (!checkCollision(rotated, kickLeft, this.board, this.cols, this.rows)) {
      this.currentPiece.shape = rotated;
      this.currentPiece.position = kickLeft;
      return true;
    }

    // 4. 向右移动 2 格
    const kickRight2 = { ...originalPosition, x: originalPosition.x + 2 };
    if (!checkCollision(rotated, kickRight2, this.board, this.cols, this.rows)) {
      this.currentPiece.shape = rotated;
      this.currentPiece.position = kickRight2;
      return true;
    }

    // 5. 向左移动 2 格
    const kickLeft2 = { ...originalPosition, x: originalPosition.x - 2 };
    if (!checkCollision(rotated, kickLeft2, this.board, this.cols, this.rows)) {
      this.currentPiece.shape = rotated;
      this.currentPiece.position = kickLeft2;
      return true;
    }

    // 所有墙踢尝试都失败
    return false;
  }

  public hardDrop(): number {
    if (!this.currentPiece || this.gameOver || this.paused || this.pieceLocked) return 0;

    // 硬降时立即锁定，防止在硬降过程中被移动
    this.pieceLocked = true;

    let dropDistance = 0;
    while (this.movePiece(0, 1)) {
      dropDistance++;
    }
    return dropDistance;
  }

  /**
   * 锁定方块到棋盘
   * 修复说明：修复类型安全问题，显式检查 cell !== 0 和 cell !== undefined
   */
  public lockPiece(): number {
    if (!this.currentPiece) return 0;

    const { shape, position, type } = this.currentPiece;
    const typeId = GAME_CONFIG.PIECE_TYPE_MAP[type as keyof typeof GAME_CONFIG.PIECE_TYPE_MAP];

    // 将方块固定到棋盘
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        // 类型安全修复：显式检查 cell 是否为非零值，并处理边界情况
        const cell = shape[row][col];
        const boardY = position.y + row;
        const boardX = position.x + col;
        
        // 确保方块在棋盘范围内且 cell 有效
        if (cell !== 0 && cell !== undefined && boardY >= 0 && boardY < this.rows && boardX >= 0 && boardX < this.cols) {
          this.board[boardY][boardX] = typeId;
        }
      }
    }

    // 将方块类型放回弃牌堆
    this.deckSystem.discardPiece(type);

    // 计算消除行数和分数
    const clearedLines = this.clearLines();
    // 类型安全修复：使用更可靠的过滤方式
    const pieceSize = shape.flat().filter(cell => cell !== 0 && cell !== undefined).length;
    const sizeMultiplier = PIECE_SIZE_MULTIPLIER[pieceSize] || 1.0;
    
    if (clearedLines > 0) {
      const baseScore = GAME_CONFIG.SCORE.LINES[clearedLines] || 0;
      this.score += Math.floor(baseScore * sizeMultiplier);
      this.lines += clearedLines;
      
      // 升级
      const newLevel = Math.floor(this.lines / 10) + 1;
      if (newLevel > this.level) {
        this.level = newLevel;
      }
    }

    // 生成新方块
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.createPiece();
    
    // 重置锁定标记（在生成新方块后）
    this.pieceLocked = false;

    // 检查游戏结束
    if (this.currentPiece && checkCollision(this.currentPiece.shape, this.currentPiece.position, this.board, this.cols, this.rows)) {
      this.gameOver = true;
    }

    return clearedLines;
  }

  private clearLines(): number {
    let cleared = 0;

    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.board[row].every(cell => cell !== 0)) {
        this.board.splice(row, 1);
        this.board.unshift(Array(this.cols).fill(0));
        cleared++;
        row++; // 重新检查当前行
      }
    }

    return cleared;
  }

  public getGameState(): GameState {
    return {
      board: copyBoard(this.board),
      currentPiece: this.currentPiece ? { ...this.currentPiece, shape: copyShape(this.currentPiece.shape) } : null,
      nextPiece: this.nextPiece ? { ...this.nextPiece, shape: copyShape(this.nextPiece.shape) } : null,
      score: this.score,
      lines: this.lines,
      level: this.level,
      gameOver: this.gameOver,
      paused: this.paused,
    };
  }

  public togglePause(): void {
    this.paused = !this.paused;
  }

  public isGameOver(): boolean {
    return this.gameOver;
  }
}

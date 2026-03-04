import { GAME_CONFIG, PIECE_SIZE_MULTIPLIER } from '../config/game-config';

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  type: string;
  shape: number[][];
  position: Position;
  color: string;
}

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

  constructor(cols: number = GAME_CONFIG.GAME.COLS, rows: number = GAME_CONFIG.GAME.ROWS) {
    this.cols = cols;
    this.rows = rows;
    this.board = this.createEmptyBoard();
  }

  private createEmptyBoard(): number[][] {
    return Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
  }

  private createPiece(type?: string): Piece {
    const types = Object.keys(GAME_CONFIG.SHAPES);
    const pieceType = type || types[Math.floor(Math.random() * types.length)];
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
    this.board = this.createEmptyBoard();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.paused = false;
    this.currentPiece = this.createPiece();
    this.nextPiece = this.createPiece();
  }

  public movePiece(dx: number, dy: number): boolean {
    if (!this.currentPiece || this.gameOver || this.paused) return false;

    const newPosition = {
      x: this.currentPiece.position.x + dx,
      y: this.currentPiece.position.y + dy,
    };

    if (!this.checkCollision(this.currentPiece.shape, newPosition)) {
      this.currentPiece.position = newPosition;
      return true;
    }
    return false;
  }

  public rotatePiece(): boolean {
    if (!this.currentPiece || this.gameOver || this.paused) return false;

    const rotated = this.rotateShape(this.currentPiece.shape);
    if (!this.checkCollision(rotated, this.currentPiece.position)) {
      this.currentPiece.shape = rotated;
      return true;
    }
    return false;
  }

  private rotateShape(shape: number[][]): number[][] {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated: number[][] = [];

    for (let col = 0; col < cols; col++) {
      rotated[col] = [];
      for (let row = rows - 1; row >= 0; row--) {
        rotated[col].push(shape[row][col]);
      }
    }
    return rotated;
  }

  public hardDrop(): number {
    if (!this.currentPiece || this.gameOver || this.paused) return 0;

    let dropDistance = 0;
    while (this.movePiece(0, 1)) {
      dropDistance++;
    }
    return dropDistance;
  }

  private checkCollision(shape: number[][], position: Position): boolean {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = position.x + col;
          const newY = position.y + row;

          if (
            newX < 0 ||
            newX >= this.cols ||
            newY >= this.rows ||
            (newY >= 0 && this.board[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public lockPiece(): number {
    if (!this.currentPiece) return 0;

    const { shape, position, type } = this.currentPiece;
    const typeId = GAME_CONFIG.PIECE_TYPE_MAP[type as keyof typeof GAME_CONFIG.PIECE_TYPE_MAP];

    // 将方块固定到棋盘
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] && position.y + row >= 0) {
          this.board[position.y + row][position.x + col] = typeId;
        }
      }
    }

    // 计算消除行数和分数
    const clearedLines = this.clearLines();
    const pieceSize = shape.flat().filter(cell => cell === 1).length;
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

    // 检查游戏结束
    if (this.checkCollision(this.currentPiece.shape, this.currentPiece.position)) {
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
      board: this.board.map(row => [...row]),
      currentPiece: this.currentPiece ? { ...this.currentPiece, shape: this.currentPiece.shape.map(r => [...r]) } : null,
      nextPiece: this.nextPiece ? { ...this.nextPiece, shape: this.nextPiece.shape.map(r => [...r]) } : null,
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

// ==================== 游戏引擎 ====================

import { GAME_CONFIG, PIECE_SIZE_MULTIPLIER } from '../config/game-config';
import { DeckManager } from './DeckManager';
import type { Piece, Position, GameState } from '../types';
import { BattleState } from '../types';
import type { Deck, DrawResult } from '../types/deck';
import type { EnemyType } from '../types/enemy';
import { getEnemyType } from '../config/enemy-config';
import { createEmptyBoard, checkCollision, rotateShape, copyBoard, copyShape } from '../utils/game-utils';

/**
 * 游戏引擎类
 * 负责游戏核心逻辑：方块生成、移动、旋转、消除等
 * 
 * 支持卡组系统：
 * - 可以从自定义卡组中抽取方块
 * - 支持稀有度权重抽取
 * - 未设置卡组时使用完全随机
 */
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
  private deckManager: DeckManager;
  private activeDeck: Deck | null = null; // 当前激活的卡组
  private pieceLocked: boolean = false; // 标记方块是否已锁定
  private lastDrawnCard: { id: string } | null = null; // 记录上次抽取的卡牌
  // 战斗系统血量属性
  private playerHp: number = 100;
  private playerMaxHp: number = 100;
  private enemyHp: number = 200;
  private enemyMaxHp: number = 200;
  private battleState: BattleState = BattleState.IDLE;
  private currentEnemyType: EnemyType | null = null; // 当前敌人类型
  
  // 敌人 AI 计时器属性
  private enemyAttackInterval: number = 10000; // 10 秒（毫秒）
  private lastEnemyAttackTime: number = 0;

  constructor(
    cols: number = GAME_CONFIG.GAME.COLS,
    rows: number = GAME_CONFIG.GAME.ROWS,
    deckManager?: DeckManager
  ) {
    this.cols = cols;
    this.rows = rows;
    this.board = createEmptyBoard(cols, rows);
    this.deckManager = deckManager || new DeckManager();
    this.pieceLocked = false;
  }

  /**
   * 设置当前使用的卡组
   * @param deck 卡组对象，null 表示不使用卡组（使用默认随机）
   */
  public setDeck(deck: Deck | null): void {
    this.activeDeck = deck;
  }

  /**
   * 获取当前卡组管理器
   */
  public getDeckManager(): DeckManager {
    return this.deckManager;
  }

  /**
   * 创建新方块
   * 支持两种模式：
   * 1. 从激活的卡组中抽取（牌堆模式：无放回抽样）
   * 2. 完全随机（未设置卡组时）
   * 
   * @param type 指定方块类型（可选，用于测试或特殊方块）
   * @returns 新创建的方块对象
   */
  private createPiece(type?: string): Piece {
    let pieceType: string;

    if (this.activeDeck && this.activeDeck.cards.length > 0) {
      // 从卡组中抽取（牌堆模式：无放回抽样）
      const drawResult = this.deckManager.drawFromDeck();
      
      // 触发抽空惩罚：如果刚重新填充（洗牌）
      if (drawResult.wasRefilled) {
        this.triggerGarbagePenalty();
      }
      
      this.lastDrawnCard = drawResult.card;
      pieceType = drawResult.card?.id || 'T';
    } else {
      // 使用所有方块类型（当前逻辑）
      const types = Object.keys(GAME_CONFIG.SHAPES);
      pieceType = type || types[Math.floor(Math.random() * types.length)];
    }

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

  /**
   * 从卡组抽取方块（旧方法，保留用于向后兼容）
   * @deprecated 使用 DeckManager.drawFromDeck() 代替
   * @returns 抽取的方块 ID
   */
  private drawFromDeck(): string {
    const drawResult = this.deckManager.drawFromDeck();
    return drawResult.card?.id || 'T';
  }

  /**
   * 触发抽空惩罚：从底部生成垃圾行
   * @param rows 垃圾行数量（默认由配置决定）
   */
  private triggerGarbagePenalty(rows?: number): void {
    const penaltyRows = rows ?? GAME_CONFIG.DECK.GARBAGE_PENALTY_ROWS;
    
    // 从底部生成 rows 行垃圾行
    for (let i = 0; i < penaltyRows; i++) {
      this.addGarbageRow();
    }
  }

  /**
   * 添加垃圾行（带随机缺口）
   * 垃圾行从底部生成，将现有行向上顶，顶部行被移除
   * @param rows 垃圾行数量（默认 1）
   */
  private addGarbageRow(rows: number = 1): void {
    for (let i = 0; i < rows; i++) {
      const gap = Math.floor(Math.random() * this.cols);
      const garbageRow = Array(this.cols).fill(1);
      garbageRow[gap] = 0; // 留一个缺口
      
      // 从底部插入垃圾行，移除最顶部一行以保持棋盘大小
      this.board.shift();      // 移除顶部行（索引 0）
      this.board.push(garbageRow); // 从底部插入新行（索引 rows-1）
    }
  }

  /**
   * 初始化游戏
   */
  public init(): void {
    this.board = createEmptyBoard(this.cols, this.rows);
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.paused = false;
    this.pieceLocked = false;
    this.lastDrawnCard = null;
    
    // 获取激活的卡组
    this.activeDeck = this.deckManager.getActiveDeck();
    
    // 初始化抽取池（开始新的牌堆，不触发抽空惩罚）
    if (this.activeDeck) {
      this.deckManager.initializeDrawPool();
    }
    
    this.currentPiece = this.createPiece();
    this.nextPiece = this.createPiece();
  }

  /**
   * 移动方块
   */
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
   * 实现基础墙踢机制
   */
  public rotatePiece(): boolean {
    if (!this.currentPiece || this.gameOver || this.paused || this.pieceLocked) return false;

    const rotated = rotateShape(this.currentPiece.shape);
    const originalPosition = { ...this.currentPiece.position };

    // 基础墙踢机制：尝试多个位置
    const kickOffsets = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 2, y: 0 },
      { x: -2, y: 0 },
    ];

    for (const offset of kickOffsets) {
      const kickPosition = {
        x: originalPosition.x + offset.x,
        y: originalPosition.y + offset.y,
      };
      
      if (!checkCollision(rotated, kickPosition, this.board, this.cols, this.rows)) {
        this.currentPiece.shape = rotated;
        this.currentPiece.position = kickPosition;
        return true;
      }
    }

    return false;
  }

  /**
   * 硬降方块
   * 硬降时直接计算最低位置并移动，不依赖 movePiece()（避免 pieceLocked 检查）
   */
  public hardDrop(): number {
    if (!this.currentPiece || this.gameOver || this.paused || this.pieceLocked) return 0;

    let dropDistance = 0;
    const originalY = this.currentPiece.position.y;

    // 直接计算最低位置，不使用 movePiece（避免 pieceLocked 检查）
    while (true) {
      const newPosition: Position = {
        x: this.currentPiece.position.x,
        y: this.currentPiece.position.y + 1,
      };

      if (!checkCollision(this.currentPiece.shape, newPosition, this.board, this.cols, this.rows)) {
        this.currentPiece.position = newPosition;
        dropDistance++;
      } else {
        break;
      }
    }
    
    // 硬降后锁定方块
    this.lockPiece();
    
    return dropDistance;
  }

  /**
   * 锁定方块到棋盘
   */
  public lockPiece(): number {
    if (!this.currentPiece) return 0;

    const { shape, position, type } = this.currentPiece;
    const typeId = GAME_CONFIG.PIECE_TYPE_MAP[type as keyof typeof GAME_CONFIG.PIECE_TYPE_MAP];

    // 将方块固定到棋盘
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        const cell = shape[row][col];
        const boardY = position.y + row;
        const boardX = position.x + col;
        
        if (cell !== 0 && cell !== undefined && boardY >= 0 && boardY < this.rows && boardX >= 0 && boardX < this.cols) {
          this.board[boardY][boardX] = typeId;
        }
      }
    }

    // 计算消除行数和分数
    const clearedLines = this.clearLines();
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

    // 战斗系统：消行时触发伤害
    if (clearedLines > 0 && this.battleState === BattleState.FIGHTING) {
      const damage = this.calculateDamage(clearedLines);
      this.enemyTakeDamage(damage);
      
      // 检查胜利
      if (this.isEnemyDead()) {
        this.battleState = BattleState.WON;
      }
    }

    // 生成新方块
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.createPiece();
    
    // 重置锁定标记
    this.pieceLocked = false;

    // 检查游戏结束
    if (this.currentPiece && checkCollision(this.currentPiece.shape, this.currentPiece.position, this.board, this.cols, this.rows)) {
      this.gameOver = true;
    }

    return clearedLines;
  }

  /**
   * 消除完整行
   */
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

  /**
   * 获取游戏状态
   */
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
      // 战斗系统血量
      playerHp: this.playerHp,
      playerMaxHp: this.playerMaxHp,
      enemyHp: this.enemyHp,
      enemyMaxHp: this.enemyMaxHp,
      battleState: this.battleState,
    };
  }

  /**
   * 切换暂停状态
   */
  public togglePause(): void {
    this.paused = !this.paused;
  }

  /**
   * 检查游戏是否结束
   */
  public isGameOver(): boolean {
    return this.gameOver;
  }

  // ==================== 战斗系统 - 血量管理 ====================

  /**
   * 初始化战斗
   * @param enemyType 敌人类型 ID（可选，默认为史莱姆）
   */
  public initBattle(enemyType: string = 'slime'): void {
    const enemy = getEnemyType(enemyType);
    
    if (enemy) {
      this.currentEnemyType = enemy;
      this.playerHp = 100;
      this.playerMaxHp = 100;
      this.enemyHp = enemy.hp;
      this.enemyMaxHp = enemy.hp;
      this.enemyAttackInterval = enemy.attackInterval;
      this.battleState = BattleState.FIGHTING;
    } else {
      // 如果敌人类型不存在，使用默认值
      this.currentEnemyType = getEnemyType('slime') || null;
      this.playerHp = 100;
      this.playerMaxHp = 100;
      this.enemyHp = 200;
      this.enemyMaxHp = 200;
      this.enemyAttackInterval = 10000;
      this.battleState = BattleState.FIGHTING;
    }
  }

  /**
   * 玩家受伤
   * @param amount 伤害值
   */
  public takeDamage(amount: number): void {
    if (amount < 0) return; // 添加防护
    this.playerHp = Math.max(0, this.playerHp - amount);
    if (this.playerHp === 0) {
      this.battleState = BattleState.LOST;
    }
  }

  /**
   * 敌人受伤
   * @param amount 伤害值
   */
  public enemyTakeDamage(amount: number): void {
    if (amount < 0) return; // 添加防护
    this.enemyHp = Math.max(0, this.enemyHp - amount);
    if (this.enemyHp === 0) {
      this.battleState = BattleState.WON;
    }
  }

  /**
   * 检查玩家是否死亡
   * @returns 玩家是否死亡
   */
  public isPlayerDead(): boolean {
    return this.playerHp <= 0;
  }

  /**
   * 检查敌人是否死亡
   * @returns 敌人是否死亡
   */
  public isEnemyDead(): boolean {
    return this.enemyHp <= 0;
  }

  /**
   * 获取当前敌人类型
   * @returns 当前敌人类型，未设置战斗时返回 null
   */
  public getCurrentEnemyType(): EnemyType | null {
    return this.currentEnemyType;
  }

  /**
   * 获取所有可用敌人类型
   * @returns 敌人类型数组
   */
  public getAllEnemyTypes(): EnemyType[] {
    const { getAllEnemies } = require('../config/enemy-config');
    return getAllEnemies();
  }

  /**
   * 计算消行造成的伤害
   * @param lines 消除的行数
   * @returns 伤害值
   */
  private calculateDamage(lines: number): number {
    const damageTable = [0, 10, 25, 45, 80];
    return damageTable[lines] || 0;
  }

  // ==================== 敌人 AI 系统 ====================

  /**
   * 更新敌人 AI（需要在游戏循环中调用）
   * @param currentTime 当前时间戳（毫秒）
   */
  public updateEnemyAI(currentTime: number): void {
    if (this.battleState !== BattleState.FIGHTING) return;
    
    if (currentTime - this.lastEnemyAttackTime >= this.enemyAttackInterval) {
      this.executeEnemyAttack();
      this.lastEnemyAttackTime = currentTime;
    }
  }

  /**
   * 执行敌人攻击
   * 根据当前敌人类型生成垃圾行和造成伤害
   */
  private executeEnemyAttack(): void {
    if (!this.currentEnemyType) {
      // 默认攻击（史莱姆）
      this.addGarbageRow(1);
      this.takeDamage(10);
    } else {
      // 根据敌人类型攻击
      this.addGarbageRow(this.currentEnemyType.garbageRows);
      this.takeDamage(this.currentEnemyType.attackDamage);
    }
    
    // 检查失败
    if (this.isPlayerDead()) {
      this.battleState = BattleState.LOST;
    }
  }
}

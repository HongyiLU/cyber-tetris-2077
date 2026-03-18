// ==================== 游戏引擎 ====================

import { GAME_CONFIG, PIECE_SIZE_MULTIPLIER } from '../config/game-config';
import { DeckManager } from './DeckManager';
import { AudioManager } from '../systems/AudioManagerSynth';
import { SoundId } from '../systems/AudioManagerSynth';
import type { Piece, Position, GameState } from '../types';
import { BattleState } from '../types';
import type { Deck, DrawResult } from '../types/deck';
import type { EnemyType } from '../types/enemy';
import { getEnemyType, getAllEnemies } from '../config/enemy-config';
import { createEmptyBoard, checkCollision, rotateShape, copyBoard, copyShape } from '../utils/game-utils';
import { ParticleEffect } from '../system/ParticleEffect';
import { SpecialEffectSystem, triggerSpecialEffect } from '../system/SpecialEffectSystem';
import type { Card } from '../types/card.v2';
import { CARD_DATABASE } from '../core/CardDatabase';
import type { GameEndResult, GameStats } from '../types/game';

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
  private currentCard: Card | null = null; // 当前卡牌对象（用于特殊效果）
  // 战斗系统血量属性
  private playerHp: number = 100;
  private playerMaxHp: number = 100;
  private enemyHp: number = 200;
  private enemyMaxHp: number = 200;
  private battleState: BattleState = BattleState.IDLE;
  private currentEnemyType: EnemyType | null = null; // 当前敌人类型
  
  // 连击系统
  private combo: number = 0;
  private maxCombo: number = 0;
  private lastClearTime: number = 0;
  private comboTimeout: number = 5000; // 5 秒内消行维持连击
  
  // 敌人 AI 计时器属性
  private enemyAttackInterval: number = 10000; // 10 秒（毫秒）
  private lastEnemyAttackTime: number = 0;
  
  // 粒子特效系统
  private particleEffect: ParticleEffect | null = null;
  private onParticleSpawn?: (x: number, y: number, color: string, lines: number) => void;
  
  // 特殊效果状态
  private enemyPaused: boolean = false;
  private enemyPauseEndTime: number = 0;
  private playerShield: number = 0;
  private burnDamagePending: number = 0;
  private burnEndTime: number = 0;
  private luckyMode: boolean = false;
  private luckyEliminationCount: number = 0;
  private garbageRowsToClear: number = 0;
  
  // 音频管理器
  private audioManager: AudioManager;
  
  // 游戏时间统计
  private startTime: number = 0;
  private elapsedTime: number = 0;
  private gameTimer: NodeJS.Timeout | null = null;
  
  // 游戏结束回调
  private onGameEnd?: (result: GameEndResult) => void;

  constructor(
    cols: number = GAME_CONFIG.GAME.COLS,
    rows: number = GAME_CONFIG.GAME.ROWS,
    deckManager?: DeckManager,
    audioManager?: AudioManager
  ) {
    this.cols = cols;
    this.rows = rows;
    this.board = createEmptyBoard(cols, rows);
    this.deckManager = deckManager || new DeckManager();
    this.pieceLocked = false;
    this.audioManager = audioManager || new AudioManager();
    // 初始化音频管理器（不等待）
    this.audioManager.initialize().catch(console.warn);
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
   * 设置粒子特效回调
   * @param callback 粒子生成回调函数
   */
  public setParticleSpawnCallback(callback: (x: number, y: number, color: string, lines: number) => void): void {
    this.onParticleSpawn = callback;
  }

  /**
   * 设置粒子系统实例
   * @param system 粒子系统实例
   */
  public setParticleSystem(system: ParticleEffect): void {
    this.particleEffect = system;
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
    let cardId: string | undefined;

    if (this.activeDeck && this.activeDeck.cards.length > 0) {
      // 从卡组中抽取（牌堆模式：无放回抽样）
      const drawResult = this.deckManager.drawFromDeck();
      
      // 触发抽空惩罚：如果刚重新填充（洗牌）
      if (drawResult.wasRefilled) {
        this.triggerGarbagePenalty();
      }
      
      this.lastDrawnCard = drawResult.card;
      cardId = drawResult.card?.id;
      pieceType = cardId || 'T';
    } else {
      // 使用所有方块类型（当前逻辑）
      const types = Object.keys(GAME_CONFIG.SHAPES);
      pieceType = type || types[Math.floor(Math.random() * types.length)];
      cardId = pieceType;
    }

    const shape = GAME_CONFIG.SHAPES[pieceType as keyof typeof GAME_CONFIG.SHAPES];
    const color = GAME_CONFIG.COLORS[pieceType as keyof typeof GAME_CONFIG.COLORS];

    // 获取卡牌对象（用于特殊效果）
    this.currentCard = cardId ? CARD_DATABASE.getCard(cardId) || null : null;
    
    // 🔧 DEBUG: 特殊方块数据流追踪
    console.log('[GameEngine.createPiece] DEBUG:', {
      cardId,
      pieceType,
      hasShape: !!shape,
      hasColor: !!color,
      currentCardId: this.currentCard?.id,
      currentCardName: this.currentCard?.name,
      currentCardSpecial: this.currentCard?.special,
      blockType: this.currentCard?.blockType,
    });

    // v1.9.22 修复：将卡牌数据存储在方块上，避免被覆盖
    const cardData = this.currentCard ? {
      id: this.currentCard.id,
      name: this.currentCard.name,
      special: this.currentCard.special,
      damage: this.currentCard.damage,
      block: this.currentCard.block,
    } : undefined;

    return {
      type: pieceType,
      shape,
      position: {
        x: Math.floor((this.cols - shape[0].length) / 2),
        y: 0,
      },
      color,
      card: cardData,
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
    this.currentCard = null;
    this.elapsedTime = 0;
    
    // 重置特殊效果状态
    this.enemyPaused = false;
    this.enemyPauseEndTime = 0;
    this.playerShield = 0;
    this.burnDamagePending = 0;
    this.burnEndTime = 0;
    this.luckyMode = false;
    this.luckyEliminationCount = 0;
    this.garbageRowsToClear = 0;
    
    // 获取激活的卡组
    this.activeDeck = this.deckManager.getActiveDeck();
    console.log('[GameEngine] 激活的卡组:', this.activeDeck);
    console.log('[GameEngine] 卡组卡牌:', this.activeDeck?.cards);
    console.log('[GameEngine] 抽取池大小:', this.deckManager.getDrawPoolSize());
    
    // 初始化抽取池（开始新的牌堆，不触发抽空惩罚）
    if (this.activeDeck) {
      this.deckManager.initializeDrawPool();
    }
    
    this.currentPiece = this.createPiece();
    this.nextPiece = this.createPiece();
    
    // 启动游戏计时器
    this.startGameTimer();
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
      // 播放移动音效（仅左右移动）
      if (dx !== 0) {
        this.audioManager.playSound(SoundId.MOVE);
      }
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
        // 播放旋转音效
        this.audioManager.playSound(SoundId.ROTATE);
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
    
    // 播放硬降音效
    this.audioManager.playSound(SoundId.HARD_DROP);
    
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

    // 计算消除行数和分数（传入方块信息以触发粒子特效）
    const clearedLines = this.clearLines(type, position);
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

    // 连击系统：更新连击数
    if (clearedLines > 0) {
      const currentTime = Date.now();
      if (currentTime - this.lastClearTime <= this.comboTimeout) {
        // 在连击时间内，增加连击数
        this.combo++;
      } else {
        // 超出连击时间，重置连击
        this.combo = 1;
      }
      this.lastClearTime = currentTime;
      
      // 更新最大连击
      if (this.combo > this.maxCombo) {
        this.maxCombo = this.combo;
      }
      
      // 播放消行音效
      this.audioManager.playClearSound(clearedLines);
      
      // 播放连击音效（连击数 > 1 时）
      if (this.combo > 1) {
        this.audioManager.playSound(SoundId.COMBO);
      }
    }

    // 战斗系统：消行时触发伤害
    if (clearedLines > 0 && this.battleState === BattleState.FIGHTING) {
      // 计算连击加成
      const comboMultiplier = 1 + (this.combo - 1) * 0.1; // 每连击 +10% 伤害
      const baseDamage = this.calculateDamage(clearedLines);
      const damage = Math.floor(baseDamage * comboMultiplier);
      
      this.enemyTakeDamage(damage);
      
      // 🔧 v1.9.22 修复：使用 currentPiece 上的 card 数据，而不是 this.currentCard
      // v1.9.22 之前：this.currentCard 在 init() 时被 nextPiece 的 createPiece() 覆盖
      const pieceCard = this.currentPiece?.card;
      if (pieceCard?.special && clearedLines > 0) {
        console.log('[GameEngine.lockPiece] 触发特殊效果:', {
          pieceType: this.currentPiece?.type,
          cardId: pieceCard.id,
          cardName: pieceCard.name,
          special: pieceCard.special,
          clearedLines,
        });
        this.triggerSpecialEffect(pieceCard.special, clearedLines, pieceCard);
      } else {
        console.log('[GameEngine.lockPiece] 未触发特殊效果:', {
          pieceType: this.currentPiece?.type,
          hasCard: !!pieceCard,
          hasSpecial: !!pieceCard?.special,
          clearedLines,
          cardId: pieceCard?.id,
        });
      }
      
      // 检查胜利
      if (this.isEnemyDead()) {
        this.battleState = BattleState.WON;
        // 播放胜利音效
        this.audioManager.playSound(SoundId.VICTORY);
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
      // 播放游戏结束音效
      this.audioManager.playSound(SoundId.GAME_OVER);
    }

    return clearedLines;
  }

  /**
   * 消除完整行
   * @param pieceType 当前方块类型（用于获取颜色）
   * @param piecePosition 当前方块位置（用于确定特效位置）
   */
  private clearLines(pieceType?: string, piecePosition?: Position): number {
    let cleared = 0;
    const clearedRows: number[] = [];

    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.board[row].every(cell => cell !== 0)) {
        this.board.splice(row, 1);
        this.board.unshift(Array(this.cols).fill(0));
        cleared++;
        clearedRows.push(row);
        row++; // 重新检查当前行
      }
    }

    // 触发粒子特效
    if (cleared > 0 && pieceType && piecePosition) {
      this.triggerParticleEffect(cleared, pieceType, piecePosition, clearedRows);
    }

    return cleared;
  }

  /**
   * 触发粒子特效
   * @param lines 消除行数
   * @param pieceType 方块类型
   * @param position 方块位置
   * @param clearedRows 消除的行号数组
   */
  private triggerParticleEffect(
    lines: number,
    pieceType: string,
    position: Position,
    clearedRows: number[]
  ): void {
    // 获取方块颜色
    const color = GAME_CONFIG.COLORS[pieceType as keyof typeof GAME_CONFIG.COLORS] || '#ffffff';
    
    // 计算特效中心位置（棋盘中间）
    const blockSize = GAME_CONFIG.GAME.BLOCK_SIZE;
    const boardHeight = this.rows * blockSize;
    const centerX = (this.cols / 2) * blockSize;
    const centerY = clearedRows.length > 0 
      ? (clearedRows[0] / this.rows) * boardHeight
      : boardHeight / 2;

    // 使用回调通知 UI 层生成粒子
    if (this.onParticleSpawn) {
      this.onParticleSpawn(centerX, centerY, color, lines);
    }

    // 如果有直接引用的粒子系统，也可以使用
    if (this.particleEffect) {
      this.particleEffect.spawnForLines(centerX, centerY, color, lines);
    }
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
      // 连击系统
      combo: this.combo,
      maxCombo: this.maxCombo,
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
    // 重置连击数
    this.resetCombo();
    
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
    return getAllEnemies();
  }

  /**
   * 获取当前连击数
   * @returns 连击数
   */
  public getCombo(): number {
    return this.combo;
  }

  /**
   * 获取最大连击数
   * @returns 最大连击数
   */
  public getMaxCombo(): number {
    return this.maxCombo;
  }

  /**
   * 重置连击数
   */
  public resetCombo(): void {
    this.combo = 0;
    this.maxCombo = 0;
    this.lastClearTime = 0;
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

  // ==================== 特殊效果系统 ====================

  /**
   * 触发特殊效果
   * v1.9.22 修复：使用 pieceCard 参数，不再依赖 this.currentCard
   * @param effectId 效果 ID
   * @param linesCleared 消除行数
   * @param pieceCard 方块上的卡牌数据（可选）
   */
  private triggerSpecialEffect(effectId: string, linesCleared: number, pieceCard?: { id: string; name: string; special?: string }): void {
    // v1.9.22 修复：使用传入的 pieceCard，不再依赖 this.currentCard
    const card = pieceCard || this.currentPiece?.card;
    if (!card) {
      console.warn('[DEBUG] 触发特殊效果失败：没有卡牌数据', { effectId });
      return;
    }

    console.log('[DEBUG] 触发特殊效果', {
      specialId: effectId,
      cardId: card.id,
      cardName: card.name,
      linesCleared,
    });

    // 初始化特殊效果系统
    SpecialEffectSystem.initialize();

    // 创建战斗状态上下文
    const stateContext = {
      playerHp: this.playerHp,
      playerMaxHp: this.playerMaxHp,
      enemyHp: this.enemyHp,
      enemyMaxHp: this.enemyMaxHp,
      combo: this.combo,
      paused: this.enemyPaused,
      
      // 回调函数
      healPlayer: (amount: number) => {
        this.playerHp = Math.min(this.playerHp + amount, this.playerMaxHp);
        console.log(`[特效] 玩家恢复 ${amount} 点生命值，当前 HP: ${this.playerHp}`);
      },
      
      damageEnemy: (amount: number) => {
        this.enemyTakeDamage(amount);
        console.log(`[特效] 敌人受到 ${amount} 点伤害，剩余 HP: ${this.enemyHp}`);
      },
      
      damagePlayer: (amount: number) => {
        if (this.playerShield > 0) {
          const shieldAbsorb = Math.min(this.playerShield, amount);
          this.playerShield -= shieldAbsorb;
          const remainingDamage = amount - shieldAbsorb;
          if (remainingDamage > 0) {
            this.takeDamage(remainingDamage);
          }
          console.log(`[特效] 护盾抵挡 ${shieldAbsorb} 点伤害`);
        } else {
          this.takeDamage(amount);
        }
      },
      
      setEnemyPaused: (paused: boolean, duration?: number) => {
        if (paused && duration) {
          this.enemyPaused = true;
          this.enemyPauseEndTime = Date.now() + duration;
          console.log(`[特效] 敌人被暂停 ${duration / 1000} 秒`);
        } else {
          this.enemyPaused = false;
        }
      },
      
      setPlayerShield: (amount: number) => {
        this.playerShield = amount;
        console.log(`[特效] 玩家获得 ${amount} 点护盾`);
      },
      
      clearGarbageRows: (): number => {
        // 清除底部垃圾行（没有缺口的行）
        let cleared = 0;
        for (let row = this.rows - 1; row >= 0; row--) {
          // 检查是否是垃圾行（只有一个缺口或没有缺口）
          const emptyCells = this.board[row].filter(cell => cell === 0).length;
          if (emptyCells <= 1) {
            this.board.splice(row, 1);
            this.board.unshift(Array(this.cols).fill(0));
            cleared++;
            row++;
          }
        }
        console.log(`[特效] 清除了 ${cleared} 行垃圾行`);
        return cleared;
      },
      
      eliminate3x3: (boardX: number, boardY: number): number => {
        // 消除 3x3 区域
        let eliminated = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const x = boardX + dx;
            const y = boardY + dy;
            if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
              if (this.board[y][x] !== 0) {
                this.board[y][x] = 0;
                eliminated++;
              }
            }
          }
        }
        console.log(`[特效] 消除了 ${eliminated} 个方块（3x3 区域）`);
        return eliminated;
      },
      
      triggerLightningChain: () => {
        // 雷电连锁：随机消除一些方块
        let eliminated = 0;
        for (let row = 0; row < this.rows; row++) {
          for (let col = 0; col < this.cols; col++) {
            if (this.board[row][col] !== 0 && Math.random() < 0.3) {
              this.board[row][col] = 0;
              eliminated++;
            }
          }
        }
        console.log(`[特效] 雷电连锁消除了 ${eliminated} 个方块`);
      },
      
      applyBurnDamage: (amount: number, duration: number) => {
        this.burnDamagePending = amount;
        this.burnEndTime = Date.now() + duration;
        console.log(`[特效] 施加燃烧效果：${amount} 点伤害（${duration / 1000}秒）`);
      },
      
      freezeEnemy: (duration: number) => {
        this.enemyPaused = true;
        this.enemyPauseEndTime = Date.now() + duration;
        console.log(`[特效] 敌人被冻结 ${duration / 1000} 秒`);
      },
      
      setLuckyMode: (enabled: boolean) => {
        this.luckyMode = enabled;
        if (enabled) {
          this.luckyEliminationCount = 0;
        }
        console.log(`[特效] 幸运模式：${enabled ? '激活' : '关闭'}`);
      },
      
      addCombo: (amount: number) => {
        this.combo += amount;
        if (this.combo > this.maxCombo) {
          this.maxCombo = this.combo;
        }
        console.log(`[特效] 连击数 +${amount}，当前连击：${this.combo}`);
      },
    };

    // 触发特殊效果
    triggerSpecialEffect(effectId, card, stateContext);
  }

  /**
   * 更新特殊效果状态（每帧调用）
   * @param currentTime 当前时间戳
   */
  public updateSpecialEffects(currentTime: number): void {
    // 检查敌人暂停是否结束
    if (this.enemyPaused && currentTime >= this.enemyPauseEndTime) {
      this.enemyPaused = false;
      console.log('[特效] 敌人暂停结束');
    }

    // 处理燃烧伤害
    if (this.burnDamagePending > 0 && currentTime >= this.burnEndTime) {
      this.enemyTakeDamage(this.burnDamagePending);
      console.log(`[特效] 燃烧伤害结算：${this.burnDamagePending} 点`);
      this.burnDamagePending = 0;
    }

    // 处理幸运七计数
    if (this.luckyMode) {
      this.luckyEliminationCount++;
      if (this.luckyEliminationCount >= 7) {
        this.luckyEliminationCount = 0;
        this.luckyMode = false;
        console.log('[特效] 幸运七触发：2x 伤害加成！');
      }
    }
  }

  // ==================== 敌人 AI 系统 ====================

  /**
   * 更新敌人 AI（需要在游戏循环中调用）
   * @param currentTime 当前时间戳（毫秒）
   */
  public updateEnemyAI(currentTime: number): void {
    if (this.battleState !== BattleState.FIGHTING) return;
    
    // 更新特殊效果状态
    this.updateSpecialEffects(currentTime);
    
    // 如果敌人被暂停，跳过攻击
    if (this.enemyPaused) {
      return;
    }
    
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
  
  // ==================== 游戏结束系统 ====================
  
  /**
   * 设置游戏结束回调
   * @param callback 游戏结束回调函数
   */
  public setOnGameEnd(callback: (result: GameEndResult) => void): void {
    this.onGameEnd = callback;
  }
  
  /**
   * 启动游戏计时器
   */
  private startGameTimer(): void {
    this.startTime = Date.now();
    this.gameTimer = setInterval(() => {
      this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
    }, 1000);
  }
  
  /**
   * 停止游戏计时器
   */
  private stopGameTimer(): void {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
  }
  
  /**
   * 获取游戏统计数据
   */
  private getGameStats(): GameStats {
    return {
      linesCleared: this.lines,
      score: this.score,
      time: this.elapsedTime,
      combos: this.maxCombo,
    };
  }
  
  /**
   * 触发游戏结束
   * @param reason 结束原因
   */
  public triggerGameOver(reason: string = '方块堆叠过高'): void {
    this.gameOver = true;
    this.stopGameTimer();
    
    // 播放游戏结束音效
    this.audioManager.playSound(SoundId.GAME_OVER);
    
    // 触发回调
    if (this.onGameEnd) {
      const result: GameEndResult = {
        isVictory: false,
        stats: this.getGameStats(),
        reason,
      };
      this.onGameEnd(result);
    }
  }
  
  /**
   * 触发游戏胜利
   */
  public triggerGameVictory(): void {
    this.stopGameTimer();
    
    // 播放胜利音效
    this.audioManager.playSound(SoundId.VICTORY);
    
    // 触发回调
    if (this.onGameEnd) {
      const result: GameEndResult = {
        isVictory: true,
        stats: this.getGameStats(),
        enemyName: this.currentEnemyType?.name,
        isFinalBoss: this.currentEnemyType?.isFinalBoss ?? false,
      };
      this.onGameEnd(result);
    }
  }
  
  /**
   * 检查并触发游戏结束/胜利
   * 在游戏循环中调用
   */
  public checkGameEnd(): void {
    // 检查游戏结束（方块堆叠到顶部）
    if (this.currentPiece && checkCollision(this.currentPiece.shape, this.currentPiece.position, this.board, this.cols, this.rows)) {
      this.gameOver = true;
      // 判断是刚生成就碰撞（层数超出画布）还是堆叠过高
      const isTopOut = this.currentPiece.position.y <= 0;
      const reason = isTopOut ? '层数超出画布' : '方块堆叠过高';
      this.triggerGameOver(reason);
    }
    
    // 检查战斗胜利
    if (this.battleState === BattleState.WON) {
      this.triggerGameVictory();
    }
    
    // 检查战斗失败
    if (this.battleState === BattleState.LOST) {
      this.triggerGameOver('被敌人击败');
    }
  }
}

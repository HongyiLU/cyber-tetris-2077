// ==================== 游戏引擎 ====================
import { GAME_CONFIG, PIECE_SIZE_MULTIPLIER } from '../config/game-config';
import { DeckManager } from './DeckManager';
import { AudioManager } from '../systems/AudioManagerSynth';
import { SoundId } from '../systems/AudioManagerSynth';
import { BattleState } from '../types';
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
    constructor(cols = GAME_CONFIG.GAME.COLS, rows = GAME_CONFIG.GAME.ROWS, deckManager, audioManager) {
        Object.defineProperty(this, "cols", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "rows", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "board", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "currentPiece", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "nextPiece", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "score", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "lines", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "level", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "gameOver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "paused", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "deckManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "activeDeck", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        }); // 当前激活的卡组
        Object.defineProperty(this, "pieceLocked", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        }); // 标记方块是否已锁定
        Object.defineProperty(this, "lastDrawnCard", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        }); // 记录上次抽取的卡牌
        // 战斗系统血量属性
        Object.defineProperty(this, "playerHp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 100
        });
        Object.defineProperty(this, "playerMaxHp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 100
        });
        Object.defineProperty(this, "enemyHp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 200
        });
        Object.defineProperty(this, "enemyMaxHp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 200
        });
        Object.defineProperty(this, "battleState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: BattleState.IDLE
        });
        Object.defineProperty(this, "currentEnemyType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        }); // 当前敌人类型
        // 连击系统
        Object.defineProperty(this, "combo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "maxCombo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "lastClearTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "comboTimeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5000
        }); // 5 秒内消行维持连击
        // 敌人 AI 计时器属性
        Object.defineProperty(this, "enemyAttackInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 10000
        }); // 10 秒（毫秒）
        Object.defineProperty(this, "lastEnemyAttackTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        // 粒子特效系统
        Object.defineProperty(this, "particleEffect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "onParticleSpawn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // 音频管理器
        Object.defineProperty(this, "audioManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // 游戏时间统计
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "elapsedTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "gameTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        // 游戏结束回调
        Object.defineProperty(this, "onGameEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
    setDeck(deck) {
        this.activeDeck = deck;
    }
    /**
     * 获取当前卡组管理器
     */
    getDeckManager() {
        return this.deckManager;
    }
    /**
     * 设置粒子特效回调
     * @param callback 粒子生成回调函数
     */
    setParticleSpawnCallback(callback) {
        this.onParticleSpawn = callback;
    }
    /**
     * 设置粒子系统实例
     * @param system 粒子系统实例
     */
    setParticleSystem(system) {
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
    createPiece(type) {
        let pieceType;
        if (this.activeDeck && this.activeDeck.cards.length > 0) {
            // 从卡组中抽取（牌堆模式：无放回抽样）
            const drawResult = this.deckManager.drawFromDeck();
            // 触发抽空惩罚：如果刚重新填充（洗牌）
            if (drawResult.wasRefilled) {
                this.triggerGarbagePenalty();
            }
            this.lastDrawnCard = drawResult.card;
            pieceType = drawResult.card?.id || 'T';
        }
        else {
            // 使用所有方块类型（当前逻辑）
            const types = Object.keys(GAME_CONFIG.SHAPES);
            pieceType = type || types[Math.floor(Math.random() * types.length)];
        }
        const shape = GAME_CONFIG.SHAPES[pieceType];
        const color = GAME_CONFIG.COLORS[pieceType];
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
    drawFromDeck() {
        const drawResult = this.deckManager.drawFromDeck();
        return drawResult.card?.id || 'T';
    }
    /**
     * 触发抽空惩罚：从底部生成垃圾行
     * @param rows 垃圾行数量（默认由配置决定）
     */
    triggerGarbagePenalty(rows) {
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
    addGarbageRow(rows = 1) {
        for (let i = 0; i < rows; i++) {
            const gap = Math.floor(Math.random() * this.cols);
            const garbageRow = Array(this.cols).fill(1);
            garbageRow[gap] = 0; // 留一个缺口
            // 从底部插入垃圾行，移除最顶部一行以保持棋盘大小
            this.board.shift(); // 移除顶部行（索引 0）
            this.board.push(garbageRow); // 从底部插入新行（索引 rows-1）
        }
    }
    /**
     * 初始化游戏
     */
    init() {
        this.board = createEmptyBoard(this.cols, this.rows);
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.pieceLocked = false;
        this.lastDrawnCard = null;
        this.elapsedTime = 0;
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
    movePiece(dx, dy) {
        if (!this.currentPiece || this.gameOver || this.paused || this.pieceLocked)
            return false;
        const newPosition = {
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
    rotatePiece() {
        if (!this.currentPiece || this.gameOver || this.paused || this.pieceLocked)
            return false;
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
    hardDrop() {
        if (!this.currentPiece || this.gameOver || this.paused || this.pieceLocked)
            return 0;
        let dropDistance = 0;
        const originalY = this.currentPiece.position.y;
        // 直接计算最低位置，不使用 movePiece（避免 pieceLocked 检查）
        while (true) {
            const newPosition = {
                x: this.currentPiece.position.x,
                y: this.currentPiece.position.y + 1,
            };
            if (!checkCollision(this.currentPiece.shape, newPosition, this.board, this.cols, this.rows)) {
                this.currentPiece.position = newPosition;
                dropDistance++;
            }
            else {
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
    lockPiece() {
        if (!this.currentPiece)
            return 0;
        const { shape, position, type } = this.currentPiece;
        const typeId = GAME_CONFIG.PIECE_TYPE_MAP[type];
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
            }
            else {
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
    clearLines(pieceType, piecePosition) {
        let cleared = 0;
        const clearedRows = [];
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
    triggerParticleEffect(lines, pieceType, position, clearedRows) {
        // 获取方块颜色
        const color = GAME_CONFIG.COLORS[pieceType] || '#ffffff';
        // 计算特效中心位置（棋盘中间）
        const centerX = (this.cols / 2) * 30; // 假设每个格子 30px
        const centerY = clearedRows.length > 0
            ? (clearedRows[0] / this.rows) * 600 // 假设棋盘高度 600px
            : 300;
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
    getGameState() {
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
    togglePause() {
        this.paused = !this.paused;
    }
    /**
     * 检查游戏是否结束
     */
    isGameOver() {
        return this.gameOver;
    }
    // ==================== 战斗系统 - 血量管理 ====================
    /**
     * 初始化战斗
     * @param enemyType 敌人类型 ID（可选，默认为史莱姆）
     */
    initBattle(enemyType = 'slime') {
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
        }
        else {
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
    takeDamage(amount) {
        if (amount < 0)
            return; // 添加防护
        this.playerHp = Math.max(0, this.playerHp - amount);
        if (this.playerHp === 0) {
            this.battleState = BattleState.LOST;
        }
    }
    /**
     * 敌人受伤
     * @param amount 伤害值
     */
    enemyTakeDamage(amount) {
        if (amount < 0)
            return; // 添加防护
        this.enemyHp = Math.max(0, this.enemyHp - amount);
        if (this.enemyHp === 0) {
            this.battleState = BattleState.WON;
        }
    }
    /**
     * 检查玩家是否死亡
     * @returns 玩家是否死亡
     */
    isPlayerDead() {
        return this.playerHp <= 0;
    }
    /**
     * 检查敌人是否死亡
     * @returns 敌人是否死亡
     */
    isEnemyDead() {
        return this.enemyHp <= 0;
    }
    /**
     * 获取当前敌人类型
     * @returns 当前敌人类型，未设置战斗时返回 null
     */
    getCurrentEnemyType() {
        return this.currentEnemyType;
    }
    /**
     * 获取所有可用敌人类型
     * @returns 敌人类型数组
     */
    getAllEnemyTypes() {
        const { getAllEnemies } = require('../config/enemy-config');
        return getAllEnemies();
    }
    /**
     * 获取当前连击数
     * @returns 连击数
     */
    getCombo() {
        return this.combo;
    }
    /**
     * 获取最大连击数
     * @returns 最大连击数
     */
    getMaxCombo() {
        return this.maxCombo;
    }
    /**
     * 重置连击数
     */
    resetCombo() {
        this.combo = 0;
        this.maxCombo = 0;
        this.lastClearTime = 0;
    }
    /**
     * 计算消行造成的伤害
     * @param lines 消除的行数
     * @returns 伤害值
     */
    calculateDamage(lines) {
        const damageTable = [0, 10, 25, 45, 80];
        return damageTable[lines] || 0;
    }
    // ==================== 敌人 AI 系统 ====================
    /**
     * 更新敌人 AI（需要在游戏循环中调用）
     * @param currentTime 当前时间戳（毫秒）
     */
    updateEnemyAI(currentTime) {
        if (this.battleState !== BattleState.FIGHTING)
            return;
        if (currentTime - this.lastEnemyAttackTime >= this.enemyAttackInterval) {
            this.executeEnemyAttack();
            this.lastEnemyAttackTime = currentTime;
        }
    }
    /**
     * 执行敌人攻击
     * 根据当前敌人类型生成垃圾行和造成伤害
     */
    executeEnemyAttack() {
        if (!this.currentEnemyType) {
            // 默认攻击（史莱姆）
            this.addGarbageRow(1);
            this.takeDamage(10);
        }
        else {
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
    setOnGameEnd(callback) {
        this.onGameEnd = callback;
    }
    /**
     * 启动游戏计时器
     */
    startGameTimer() {
        this.startTime = Date.now();
        this.gameTimer = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        }, 1000);
    }
    /**
     * 停止游戏计时器
     */
    stopGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }
    /**
     * 获取游戏统计数据
     */
    getGameStats() {
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
    triggerGameOver(reason = '方块堆叠过高') {
        this.gameOver = true;
        this.stopGameTimer();
        // 播放游戏结束音效
        this.audioManager.playSound(SoundId.GAME_OVER);
        // 触发回调
        if (this.onGameEnd) {
            const result = {
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
    triggerGameVictory() {
        this.stopGameTimer();
        // 播放胜利音效
        this.audioManager.playSound(SoundId.VICTORY);
        // 触发回调
        if (this.onGameEnd) {
            const result = {
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
    checkGameEnd() {
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

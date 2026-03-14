/**
 * 游戏引擎
 * 集成效果管理系统，处理游戏核心逻辑
 */

import { EffectManager, effectManager } from '../systems/EffectManager';
import { EffectResult, EffectTrigger } from '../types/effects';
import { BLOCK_EFFECTS, getEffectById } from '../config/block-effects';
import { GAME_CONFIG, BlockId } from '../config/game';

/**
 * 游戏状态接口
 */
export interface GameState {
  /** 游戏是否运行中 */
  isRunning: boolean;
  /** 游戏是否暂停 */
  isPaused: boolean;
  /** 当前分数 */
  score: number;
  /** 当前等级 */
  level: number;
  /** 当前生命值 */
  health: number;
  /** 最大生命值 */
  maxHealth: number;
  /** 连击数 */
  combo: number;
  /** 消除行数 */
  linesCleared: number;
  /** 垃圾行数量 */
  garbageLines: number;
  /** 敌人攻击是否暂停 */
  enemyAttackPaused: boolean;
  /** 敌人攻击暂停结束时间 */
  enemyAttackPauseEnd?: number;
  /** 防御护盾是否激活 */
  hasDefenseShield: boolean;
  /** 燃烧效果是否激活 */
  isBurning: boolean;
  /** 燃烧每秒伤害 */
  burnDamage: number;
  /** 燃烧剩余持续时间（秒） */
  burnDurationRemaining: number;
  /** 燃烧伤害上次触发时间 */
  lastBurnDamageTime: number;
}

/**
 * 方块位置接口
 */
export interface BlockPosition {
  x: number;
  y: number;
}

/**
 * 游戏引擎类
 */
export class GameEngine {
  /** 游戏状态 */
  private state: GameState;

  /** 效果管理器 */
  private effectManager: EffectManager;

  /** 游戏板 */
  private board: (BlockId | null)[][];

  /** 游戏板宽度 */
  private boardWidth: number = 10;

  /** 游戏板高度 */
  private boardHeight: number = 20;

  /** 效果回调注册 */
  private effectCallbacksRegistered: boolean = false;

  /**
   * 构造函数
   */
  constructor() {
    this.effectManager = new EffectManager();
    this.state = this.createInitialState();
    this.board = this.createEmptyBoard();
    this.registerEffectCallbacks();
  }

  /**
   * 创建初始游戏状态
   */
  private createInitialState(): GameState {
    return {
      isRunning: false,
      isPaused: false,
      score: 0,
      level: 1,
      health: 100,
      maxHealth: 100,
      combo: 0,
      linesCleared: 0,
      garbageLines: 0,
      enemyAttackPaused: false,
      hasDefenseShield: false,
      isBurning: false,
      burnDamage: 0,
      burnDurationRemaining: 0,
      lastBurnDamageTime: 0,
    };
  }

  /**
   * 创建空游戏板
   */
  private createEmptyBoard(): (BlockId | null)[][] {
    return Array(this.boardHeight)
      .fill(null)
      .map(() => Array(this.boardWidth).fill(null));
  }

  /**
   * 注册效果回调
   */
  private registerEffectCallbacks(): void {
    if (this.effectCallbacksRegistered) return;

    // 注册炸弹方块效果
    this.effectManager.registerEffectCallback('bomb_block', (effect, data) => {
      const range = effect.range || 3;
      const position = data?.position as BlockPosition | undefined;
      if (position) {
        this.clearArea(position.x, position.y, range);
        return {
          success: true,
          effectId: effect.id,
          message: `💣 炸弹方块消除了 ${range}x${range} 区域！`,
          data: { range, position },
        };
      }
      return {
        success: false,
        effectId: effect.id,
        message: '炸弹方块需要指定位置',
      };
    });

    // 注册时间停止效果
    this.effectManager.registerEffectCallback('time_stop', (effect, data) => {
      const duration = effect.duration || 10;
      this.pauseEnemyAttack(duration * 1000);
      return {
        success: true,
        effectId: effect.id,
        message: `⏰ 时间停止！敌人攻击暂停 ${duration} 秒！`,
        data: { duration },
      };
    });

    // 注册生命偷取效果
    this.effectManager.registerEffectCallback('life_steal', (effect, data) => {
      const healAmount = effect.value || 5;
      this.heal(healAmount);
      return {
        success: true,
        effectId: effect.id,
        message: `💖 生命偷取！恢复了 ${healAmount} 点生命值！`,
        data: { healAmount },
      };
    });

    // 注册防御护盾效果
    this.effectManager.registerEffectCallback('defense_shield', (effect, data) => {
      this.state.hasDefenseShield = true;
      return {
        success: true,
        effectId: effect.id,
        message: '🛡️ 防御护盾激活！将抵挡下一次垃圾行攻击！',
      };
    });

    // 注册连击增幅效果
    this.effectManager.registerEffectCallback('combo_boost', (effect, data) => {
      const boostMultiplier = effect.value || 0.5;
      const comboCount = data?.comboCount as number | undefined;
      return {
        success: true,
        effectId: effect.id,
        message: `⚡ 连击增幅！连击伤害 +${boostMultiplier * 100}%！（连击：${comboCount}）`,
        data: { boostMultiplier, comboCount },
      };
    });

    // 注册全屏清除效果
    this.effectManager.registerEffectCallback('full_clear', (effect, data) => {
      const clearedLines = this.clearAllGarbageLines();
      return {
        success: true,
        effectId: effect.id,
        message: `🌟 全屏清除！清除了 ${clearedLines} 行垃圾行！`,
        data: { clearedLines },
      };
    });

    // 注册幸运七效果
    this.effectManager.registerEffectCallback('lucky_seven', (effect, data) => {
      const multiplier = effect.value || 2;
      const clearCount = data?.clearCount as number | undefined;
      return {
        success: true,
        effectId: effect.id,
        message: `7️⃣ 幸运七！第 ${clearCount} 次消除，伤害 x${multiplier}！`,
        data: { multiplier, clearCount },
      };
    });

    // 注册寒冰冻结效果
    this.effectManager.registerEffectCallback('ice_freeze', (effect, data) => {
      const duration = effect.duration || 3;
      this.freezeEnemy(duration * 1000);
      return {
        success: true,
        effectId: effect.id,
        message: `❄️ 寒冰冻结！敌人被冻结 ${duration} 秒！`,
        data: { duration },
      };
    });

    // 注册火焰燃烧效果
    this.effectManager.registerEffectCallback('fire_burn', (effect, data) => {
      const damage = effect.value || 10;
      const duration = effect.duration || 5;
      this.applyBurn(damage, duration);
      return {
        success: true,
        effectId: effect.id,
        message: `🔥 火焰燃烧！造成 ${damage} 点/秒持续伤害，持续 ${duration} 秒！`,
        data: { damage, duration },
      };
    });

    // 注册雷电连锁效果
    this.effectManager.registerEffectCallback('lightning_chain', (effect, data) => {
      const range = effect.range || 2;
      const position = data?.position as BlockPosition | undefined;
      if (position) {
        const clearedBlocks = this.chainClear(position.x, position.y, range);
        return {
          success: true,
          effectId: effect.id,
          message: `⚡ 雷电连锁！连锁消除了 ${clearedBlocks} 个方块！`,
          data: { clearedBlocks, range },
        };
      }
      return {
        success: false,
        effectId: effect.id,
        message: '雷电连锁需要指定位置',
      };
    });

    this.effectCallbacksRegistered = true;
  }

  /**
   * 清除指定区域
   */
  private clearArea(centerX: number, centerY: number, range: number): number {
    let clearedCount = 0;
    const halfRange = Math.floor(range / 2);

    for (let y = centerY - halfRange; y <= centerY + halfRange; y++) {
      for (let x = centerX - halfRange; x <= centerX + halfRange; x++) {
        if (y >= 0 && y < this.boardHeight && x >= 0 && x < this.boardWidth) {
          if (this.board[y][x] !== null) {
            this.board[y][x] = null;
            clearedCount++;
          }
        }
      }
    }

    return clearedCount;
  }

  /**
   * 连锁清除相邻方块
   */
  private chainClear(startX: number, startY: number, range: number): number {
    let clearedCount = 0;
    const visited = new Set<string>();
    const queue: BlockPosition[] = [{ x: startX, y: startY }];

    while (queue.length > 0) {
      const pos = queue.shift()!;
      const key = `${pos.x},${pos.y}`;

      if (visited.has(key)) continue;
      if (pos.x < 0 || pos.x >= this.boardWidth || pos.y < 0 || pos.y >= this.boardHeight) continue;

      visited.add(key);

      if (this.board[pos.y][pos.x] !== null) {
        this.board[pos.y][pos.x] = null;
        clearedCount++;

        // 添加相邻位置到队列
        if (clearedCount < range * range) {
          queue.push({ x: pos.x - 1, y: pos.y });
          queue.push({ x: pos.x + 1, y: pos.y });
          queue.push({ x: pos.x, y: pos.y - 1 });
          queue.push({ x: pos.x, y: pos.y + 1 });
        }
      }
    }

    return clearedCount;
  }

  /**
   * 清除所有垃圾行
   */
  private clearAllGarbageLines(): number {
    let clearedCount = 0;
    for (let y = 0; y < this.boardHeight; y++) {
      // 简化：假设底部行为垃圾行
      if (y >= this.boardHeight - this.state.garbageLines) {
        for (let x = 0; x < this.boardWidth; x++) {
          if (this.board[y][x] !== null) {
            this.board[y][x] = null;
            clearedCount++;
          }
        }
      }
    }
    this.state.garbageLines = 0;
    return clearedCount;
  }

  /**
   * 暂停敌人攻击
   */
  private pauseEnemyAttack(duration: number): void {
    this.state.enemyAttackPaused = true;
    this.state.enemyAttackPauseEnd = Date.now() + duration;
  }

  /**
   * 冻结敌人
   */
  private freezeEnemy(duration: number): void {
    this.pauseEnemyAttack(duration);
  }

  /**
   * 治疗
   */
  private heal(amount: number): void {
    this.state.health = Math.min(this.state.maxHealth, this.state.health + amount);
  }

  /**
   * 应用燃烧效果
   */
  private applyBurn(damagePerSecond: number, duration: number): void {
    this.state.isBurning = true;
    this.state.burnDamage = damagePerSecond;
    this.state.burnDurationRemaining = duration;
    this.state.lastBurnDamageTime = Date.now();
    
    console.log(`🔥 燃烧效果开始：${damagePerSecond} 点/秒，持续 ${duration} 秒`);
  }

  /**
   * 造成伤害
   */
  private damage(amount: number): void {
    if (this.state.hasDefenseShield) {
      this.state.hasDefenseShield = false;
      console.log('🛡️ 防御护盾抵挡了伤害！');
      return;
    }

    this.state.health = Math.max(0, this.state.health - amount);
    if (this.state.health <= 0) {
      this.gameOver();
    }
  }

  /**
   * 游戏结束
   */
  private gameOver(): void {
    this.state.isRunning = false;
    console.log('💀 游戏结束！');
  }

  /**
   * 开始游戏
   */
  public startGame(): void {
    this.state = this.createInitialState();
    this.state.isRunning = true;
    this.board = this.createEmptyBoard();
    this.effectManager.clearAllEffects();
    console.log('🎮 游戏开始！');
  }

  /**
   * 暂停游戏
   */
  public pauseGame(): void {
    this.state.isPaused = true;
    console.log('⏸️ 游戏暂停');
  }

  /**
   * 恢复游戏
   */
  public resumeGame(): void {
    this.state.isPaused = false;
    console.log('▶️ 游戏恢复');
  }

  /**
   * 停止游戏
   */
  public stopGame(): void {
    this.state.isRunning = false;
    console.log('🏁 游戏停止');
  }

  /**
   * 放置方块
   * @param blockId 方块 ID
   * @param x X 坐标
   * @param y Y 坐标
   * @param effectIds 触发的效果 ID 列表
   */
  public placeBlock(blockId: BlockId, x: number, y: number, effectIds: string[]): EffectResult[] {
    if (!this.state.isRunning || this.state.isPaused) {
      return [];
    }

    // 放置方块到游戏板
    const shape = GAME_CONFIG.SHAPES[blockId];
    if (shape) {
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            const boardY = y + row;
            const boardX = x + col;
            if (boardY >= 0 && boardY < this.boardHeight && boardX >= 0 && boardX < this.boardWidth) {
              this.board[boardY][boardX] = blockId;
            }
          }
        }
      }
    }

    // 触发放置效果
    const results = this.effectManager.onBlockPlace(effectIds);

    // 为炸弹和寒冰效果添加位置信息
    for (const result of results) {
      if (result.effectId === 'bomb_block' || result.effectId === 'ice_freeze') {
        result.data = { ...result.data, position: { x, y } };
      }
    }

    return results;
  }

  /**
   * 消除方块
   * @param lines 消除的行索引
   * @param effectIds 触发的效果 ID 列表
   */
  public clearLines(lines: number[], effectIds: string[]): EffectResult[] {
    if (!this.state.isRunning || this.state.isPaused) {
      return [];
    }

    const linesCleared = lines.length;
    this.state.linesCleared += linesCleared;
    this.state.score += linesCleared * 100 * this.state.level;

    // 清除行
    for (const lineIndex of lines) {
      for (let x = 0; x < this.boardWidth; x++) {
        this.board[lineIndex][x] = null;
      }
    }

    // 触发消除效果
    const results = this.effectManager.onBlockClear(effectIds, linesCleared);

    // 为雷电连锁效果添加位置信息
    for (const result of results) {
      if (result.effectId === 'lightning_chain') {
        result.data = { ...result.data, position: { x: 5, y: lines[0] || 0 } };
      }
    }

    // 检查是否需要下移方块
    this.applyGravity(lines);

    return results;
  }

  /**
   * 应用重力
   */
  private applyGravity(clearedLines: number[]): void {
    // 简化重力逻辑
    for (let x = 0; x < this.boardWidth; x++) {
      const blocks: BlockId[] = [];
      for (let y = 0; y < this.boardHeight; y++) {
        if (this.board[y][x] !== null) {
          blocks.push(this.board[y][x] as BlockId);
        }
      }

      // 重新填充列
      for (let y = 0; y < this.boardHeight; y++) {
        if (y < this.boardHeight - blocks.length) {
          this.board[y][x] = null;
        } else {
          this.board[y][x] = blocks[y - (this.boardHeight - blocks.length)];
        }
      }
    }
  }

  /**
   * 添加垃圾行
   * @param count 垃圾行数量
   */
  public addGarbageLines(count: number): void {
    if (this.state.hasDefenseShield) {
      this.state.hasDefenseShield = false;
      console.log('🛡️ 防御护盾抵挡了垃圾行攻击！');
      return;
    }

    this.state.garbageLines += count;
    console.log(`⚠️ 收到 ${count} 行垃圾行攻击！`);
  }

  /**
   * 更新游戏状态（每帧调用）
   */
  public update(): void {
    if (!this.state.isRunning || this.state.isPaused) {
      return;
    }

    // 更新效果管理器
    this.effectManager.update();

    // 检查敌人攻击暂停是否结束
    if (this.state.enemyAttackPaused && this.state.enemyAttackPauseEnd) {
      if (Date.now() >= this.state.enemyAttackPauseEnd) {
        this.state.enemyAttackPaused = false;
        this.state.enemyAttackPauseEnd = undefined;
        console.log('▶️ 敌人攻击恢复');
      }
    }

    // 检查燃烧效果 - 每秒造成伤害
    if (this.state.isBurning) {
      const now = Date.now();
      // 每 1 秒造成一次伤害
      if (now - this.state.lastBurnDamageTime >= 1000) {
        this.damage(this.state.burnDamage);
        this.state.lastBurnDamageTime = now;
        this.state.burnDurationRemaining--;
        
        console.log(`🔥 燃烧伤害：-${this.state.burnDamage} HP，剩余 ${this.state.burnDurationRemaining} 秒`);
        
        // 燃烧结束
        if (this.state.burnDurationRemaining <= 0) {
          this.state.isBurning = false;
          this.state.burnDamage = 0;
          this.state.burnDurationRemaining = 0;
          console.log('🔥 燃烧效果结束');
        }
      }
    }
  }

  /**
   * 获取游戏状态
   */
  public getState(): GameState {
    return { ...this.state };
  }

  /**
   * 获取游戏板
   */
  public getBoard(): (BlockId | null)[][] {
    return this.board.map((row) => [...row]);
  }

  /**
   * 获取效果管理器
   */
  public getEffectManager(): EffectManager {
    return this.effectManager;
  }

  /**
   * 重置游戏
   */
  public reset(): void {
    this.state = this.createInitialState();
    this.board = this.createEmptyBoard();
    this.effectManager.clearAllEffects();
  }
}

// 导出单例实例
export const gameEngine = new GameEngine();

/**
 * @fileoverview 敌人AI v2.0.0
 * 管理敌人攻击模式、攻击间隔和AI决策
 */

import { EnemyState, EnemyType } from './CombatManager';

/**
 * 敌人AI攻击模式
 */
export enum EnemyAIType {
  /** 普通攻击 - 固定间隔攻击 */
  NORMAL = 'normal',
  /** 狂暴模式 - 血量低时攻击加快 */
  RAMPAGE = 'rampage',
  /** 防守模式 - 攻击间隔长但防御高 */
  DEFENSIVE = 'defensive',
  /** Boss模式 - 多种攻击模式 */
  BOSS = 'boss',
}

/**
 * 敌人AI状态
 */
export interface EnemyAIState {
  /** AI类型 */
  aiType: EnemyAIType;
  /** 上次攻击时间戳 */
  lastAttackTime: number;
  /** 下次攻击时间戳 */
  nextAttackTime: number;
  /** 是否正在攻击 */
  isAttacking: boolean;
  /** 当前攻击阶段 (Boss用) */
  attackPhase: number;
  /** 狂暴状态 */
  isRampaging: boolean;
}

/**
 * 敌人AI配置
 */
export interface EnemyAIConfig {
  /** 基础攻击间隔 */
  baseAttackInterval: number;
  /** AI类型 */
  aiType: EnemyAIType;
  /** 狂暴血量阈值 (0-1) */
  rampageThreshold?: number;
  /** 狂暴攻击间隔倍率 */
  rampageIntervalMultiplier?: number;
  /** 攻击前摇时间(ms) */
  attackWindup?: number;
}

/**
 * 敌人AI类
 * 管理敌人的攻击逻辑和AI决策
 */
export class EnemyAI {
  private state: EnemyAIState;
  private config: EnemyAIConfig;
  private enemyState: EnemyState | null = null;
  private attackCallback?: (damage: number) => void;
  /** 待处理的攻击超时ID，用于取消未执行的攻击 */
  private pendingAttackTimeout: number | null = null;

  constructor(config?: Partial<EnemyAIConfig>) {
    this.config = {
      baseAttackInterval: config?.baseAttackInterval ?? 3000,
      aiType: config?.aiType ?? EnemyAIType.NORMAL,
      rampageThreshold: config?.rampageThreshold ?? 0.3,
      rampageIntervalMultiplier: config?.rampageIntervalMultiplier ?? 0.5,
      attackWindup: config?.attackWindup ?? 500,
    };

    this.state = this.createInitialState();
  }

  /**
   * 创建初始AI状态
   */
  private createInitialState(): EnemyAIState {
    return {
      aiType: this.config.aiType,
      lastAttackTime: 0,
      nextAttackTime: 0,
      isAttacking: false,
      attackPhase: 0,
      isRampaging: false,
    };
  }

  /**
   * 初始化AI（绑定敌人状态）
   * @param enemy 敌人状态引用
   */
  initialize(enemy: EnemyState): void {
    this.enemyState = enemy;
    this.state = this.createInitialState();
    this.state.nextAttackTime = Date.now() + this.config.baseAttackInterval;
  }

  /**
   * 注册攻击回调
   * @param callback 攻击回调函数
   */
  onAttack(callback: (damage: number) => void): void {
    this.attackCallback = callback;
  }

  /**
   * 更新AI状态（每帧调用）
   * @param currentTime 当前时间戳
   * @returns 是否应该发动攻击
   */
  update(currentTime: number): boolean {
    if (!this.enemyState) return false;

    // 敌人被暂停时不攻击
    if (this.enemyState.isStunned) {
      return false;
    }

    // 检查狂暴状态
    this.updateRampageState();

    // 根据AI类型更新
    switch (this.config.aiType) {
      case EnemyAIType.NORMAL:
      case EnemyAIType.DEFENSIVE:
        return this.updateNormalAttack(currentTime);
      case EnemyAIType.RAMPAGE:
        return this.updateRampageAttack(currentTime);
      case EnemyAIType.BOSS:
        return this.updateBossAttack(currentTime);
      default:
        return false;
    }
  }

  /**
   * 更新狂暴状态
   */
  private updateRampageState(): void {
    if (!this.enemyState || !this.config.rampageThreshold) return;

    const healthPercent = this.enemyState.health / this.enemyState.maxHealth;
    const wasRampaging = this.state.isRampaging;
    this.state.isRampaging = healthPercent <= this.config.rampageThreshold;

    // 状态变化时更新下次攻击时间
    if (!wasRampaging && this.state.isRampaging) {
      this.state.nextAttackTime =
        Date.now() +
        this.config.baseAttackInterval * (this.config.rampageIntervalMultiplier ?? 0.5);
    }
  }

  /**
   * 普通攻击更新
   */
  private updateNormalAttack(currentTime: number): boolean {
    if (currentTime >= this.state.nextAttackTime) {
      this.performAttack();
      this.state.nextAttackTime = currentTime + this.getCurrentAttackInterval();
      return true;
    }
    return false;
  }

  /**
   * 狂暴攻击更新
   */
  private updateRampageAttack(currentTime: number): boolean {
    return this.updateNormalAttack(currentTime);
  }

  /**
   * Boss攻击更新（多阶段攻击）
   */
  private updateBossAttack(currentTime: number): boolean {
    if (currentTime >= this.state.nextAttackTime) {
      this.performBossAttack();
      this.state.nextAttackTime = currentTime + this.getCurrentAttackInterval();
      return true;
    }
    return false;
  }

  /**
   * 执行普通攻击
   */
  private performAttack(): void {
    if (!this.enemyState) return;

    this.state.isAttacking = true;
    const damage = this.enemyState.attack;

    // 延迟执行伤害（攻击前摇），保存timeout ID以便取消
    this.pendingAttackTimeout = window.setTimeout(() => {
      this.pendingAttackTimeout = null;
      this.state.isAttacking = false;
      this.attackCallback?.(damage);
    }, this.config.attackWindup ?? 500);
  }

  /**
   * 执行Boss攻击
   */
  private performBossAttack(): void {
    if (!this.enemyState) return;

    this.state.isAttacking = true;
    const damage = this.calculateBossDamage();

    // Boss有3个攻击阶段循环
    this.state.attackPhase = (this.state.attackPhase % 3) + 1;

    // 延迟执行伤害（攻击前摇），保存timeout ID以便取消
    this.pendingAttackTimeout = window.setTimeout(() => {
      this.pendingAttackTimeout = null;
      this.state.isAttacking = false;
      this.attackCallback?.(damage);
    }, this.config.attackWindup ?? 500);
  }

  /**
   * 计算Boss伤害（根据阶段）
   */
  private calculateBossDamage(): number {
    if (!this.enemyState) return 0;

    const baseDamage = this.enemyState.attack;
    switch (this.state.attackPhase) {
      case 1: // 普通攻击
        return baseDamage;
      case 2: // 强力攻击 x1.5
        return Math.floor(baseDamage * 1.5);
      case 3: // 范围攻击 x1.2（但打2次，这里简化为+50%）
        return Math.floor(baseDamage * 1.2);
      default:
        return baseDamage;
    }
  }

  /**
   * 获取当前攻击间隔
   */
  private getCurrentAttackInterval(): number {
    if (this.state.isRampaging && this.config.rampageIntervalMultiplier) {
      return (
        this.config.baseAttackInterval *
        this.config.rampageIntervalMultiplier
      );
    }
    return this.config.baseAttackInterval;
  }

  /**
   * 取消待处理的攻击（防止战斗结束后攻击仍然触发）
   * 在停止敌人攻击计时器时调用
   */
  cancelPendingAttack(): void {
    if (this.pendingAttackTimeout !== null) {
      window.clearTimeout(this.pendingAttackTimeout);
      this.pendingAttackTimeout = null;
      this.state.isAttacking = false;
    }
  }

  /**
   * 获取当前AI状态
   */
  getState(): EnemyAIState {
    return { ...this.state };
  }

  /**
   * 获取AI类型对应的敌人类型
   * @param enemyType 敌人类型
   */
  static getAITypeForEnemy(enemyType: EnemyType): EnemyAIType {
    switch (enemyType) {
      case EnemyType.NORMAL:
        return EnemyAIType.NORMAL;
      case EnemyType.ELITE:
        return EnemyAIType.RAMPAGE;
      case EnemyType.BOSS:
        return EnemyAIType.BOSS;
      default:
        return EnemyAIType.NORMAL;
    }
  }

  /**
   * 根据敌人配置创建AI
   * @param enemy 敌人状态
   */
  static createForEnemy(enemy: EnemyState): EnemyAI {
    const aiType = EnemyAI.getAITypeForEnemy(enemy.type);
    const ai = new EnemyAI({
      aiType,
      baseAttackInterval: enemy.attackInterval,
      attackWindup: 500,
    });
    ai.initialize(enemy);
    return ai;
  }
}

/** 单例导出 */
export const enemyAI = new EnemyAI();

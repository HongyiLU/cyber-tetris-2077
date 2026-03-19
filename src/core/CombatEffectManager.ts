// ==================== CombatEffectManager - 战斗特效管理器 ====================
// v2.0.0 Day 6 - 战斗特效系统

import { ParticleEffect } from '../system/ParticleEffect';

/**
 * 伤害数字接口
 */
export interface DamageNumber {
  id: number;
  value: number;
  x: number;
  y: number;
  color: string;
  timestamp: number;
  isPlayer: boolean; // true: 玩家受伤, false: 敌人受伤
  isHeal?: boolean;  // 是否为治疗
  isBlock?: boolean; // 是否为格挡
}

/**
 * 战斗特效配置
 */
export interface CombatEffectConfig {
  maxDamageNumbers: number;   // 最大伤害数字数量
  damageNumberDuration: number; // 伤害数字持续时间 (ms)
  particlePoolSize: number;  // 粒子池大小
}

// 预定义颜色
const COLORS = {
  DAMAGE_PLAYER: '#ff4444',   // 玩家受伤 - 红色
  DAMAGE_ENEMY: '#ffaa00',    // 敌人受伤 - 橙色
  HEAL: '#44ff44',            // 治疗 - 绿色
  BUFF: '#44aaff',           // 增益 - 蓝色
  DEBUFF: '#aa44ff',         // 减益 - 紫色
  BLOCK: '#aaaaaa',          // 格挡 - 灰色
};

/**
 * 战斗特效管理器
 * 负责管理战斗相关的粒子特效和伤害数字
 */
export class CombatEffectManager {
  private static instance: CombatEffectManager;

  private particleEffect: ParticleEffect;
  private damageNumbers: DamageNumber[];
  private nextDamageNumberId: number;

  // 配置
  private config: CombatEffectConfig;

  /**
   * 私有构造函数（单例模式）
   */
  private constructor(config?: Partial<CombatEffectConfig>) {
    this.config = {
      maxDamageNumbers: 20,
      damageNumberDuration: 1500,
      particlePoolSize: 500,
      ...config,
    };

    this.particleEffect = new ParticleEffect(this.config.particlePoolSize);
    this.damageNumbers = [];
    this.nextDamageNumberId = 0;
  }

  /**
   * 获取单例实例
   */
  static getInstance(config?: Partial<CombatEffectConfig>): CombatEffectManager {
    if (!CombatEffectManager.instance) {
      CombatEffectManager.instance = new CombatEffectManager(config);
    }
    return CombatEffectManager.instance;
  }

  /**
   * 重置单例实例（用于测试或重新初始化）
   */
  static resetInstance(): void {
    CombatEffectManager.instance = undefined as unknown as CombatEffectManager;
  }

  // ==================== 粒子特效 ====================

  /**
   * 播放敌人受伤粒子特效
   * @param x X 坐标
   * @param y Y 坐标
   * @param intensity 强度 (1-3)，影响粒子数量
   */
  public spawnEnemyDamageParticles(x: number, y: number, intensity: number = 1): void {
    const count = Math.floor(10 + intensity * 8);
    this.particleEffect.spawn(x, y, COLORS.DAMAGE_ENEMY, count, {
      spread: 60,
      minSpeed: 3,
      maxSpeed: 8,
      minSize: 3,
      maxSize: 7,
      life: 0.8,
      gravity: 0.3,
      friction: 0.95,
    });
  }

  /**
   * 播放玩家受伤粒子特效
   * @param x X 坐标
   * @param y Y 坐标
   * @param intensity 强度 (1-3)
   */
  public spawnPlayerDamageParticles(x: number, y: number, intensity: number = 1): void {
    const count = Math.floor(8 + intensity * 6);
    this.particleEffect.spawn(x, y, COLORS.DAMAGE_PLAYER, count, {
      spread: 50,
      minSpeed: 2,
      maxSpeed: 6,
      minSize: 3,
      maxSize: 6,
      life: 0.6,
      gravity: 0.4,
      friction: 0.97,
    });
  }

  /**
   * 播放治疗粒子特效
   * @param x X 坐标
   * @param y Y 坐标
   */
  public spawnHealParticles(x: number, y: number): void {
    // 治疗特效：向上飘动的绿色粒子
    this.particleEffect.spawn(x, y, COLORS.HEAL, 15, {
      spread: 40,
      minSpeed: 1,
      maxSpeed: 4,
      minSize: 3,
      maxSize: 6,
      life: 1.2,
      gravity: -0.3, // 负重力，向上飘
      friction: 0.98,
    });
  }

  /**
   * 播放增益粒子特效
   * @param x X 坐标
   * @param y Y 坐标
   */
  public spawnBuffParticles(x: number, y: number): void {
    this.particleEffect.spawn(x, y, COLORS.BUFF, 12, {
      spread: 30,
      minSpeed: 2,
      maxSpeed: 5,
      minSize: 2,
      maxSize: 5,
      life: 1.0,
      gravity: -0.2,
      friction: 0.98,
    });
  }

  /**
   * 播放减益粒子特效
   * @param x X 坐标
   * @param y Y 坐标
   */
  public spawnDebuffParticles(x: number, y: number): void {
    this.particleEffect.spawn(x, y, COLORS.DEBUFF, 12, {
      spread: 40,
      minSpeed: 2,
      maxSpeed: 6,
      minSize: 3,
      maxSize: 6,
      life: 0.8,
      gravity: 0.3,
      friction: 0.95,
    });
  }

  /**
   * 播放格挡粒子特效
   * @param x X 坐标
   * @param y Y 坐标
   */
  public spawnBlockParticles(x: number, y: number): void {
    this.particleEffect.spawn(x, y, COLORS.BLOCK, 8, {
      spread: 20,
      minSpeed: 1,
      maxSpeed: 3,
      minSize: 2,
      maxSize: 4,
      life: 0.5,
      gravity: 0.1,
      friction: 0.99,
    });
  }

  /**
   * 播放战斗胜利粒子特效
   * @param x X 坐标
   * @param y Y 坐标
   */
  public spawnVictoryParticles(x: number, y: number): void {
    // 金色光效
    this.particleEffect.spawn(x, y, '#ffd700', 50, {
      spread: 150,
      minSpeed: 4,
      maxSpeed: 12,
      minSize: 4,
      maxSize: 10,
      life: 2.0,
      gravity: 0.2,
      friction: 0.95,
    });
  }

  /**
   * 播放战斗失败粒子特效
   * @param x X 坐标
   * @param y Y 坐标
   */
  public spawnDefeatParticles(x: number, y: number): void {
    // 暗红色效果
    this.particleEffect.spawn(x, y, '#aa0000', 30, {
      spread: 100,
      minSpeed: 2,
      maxSpeed: 8,
      minSize: 3,
      maxSize: 8,
      life: 1.5,
      gravity: 0.4,
      friction: 0.96,
    });
  }

  // ==================== 伤害数字 ====================

  /**
   * 添加伤害数字
   * @param value 伤害/治疗值
   * @param x X 坐标
   * @param y Y 坐标
   * @param isPlayer 是否为玩家（影响颜色）
   * @param isHeal 是否为治疗
   * @param isBlock 是否为格挡
   */
  public addDamageNumber(
    value: number,
    x: number,
    y: number,
    isPlayer: boolean = false,
    isHeal: boolean = false,
    isBlock: boolean = false
  ): void {
    // 如果超过最大数量，移除最老的
    if (this.damageNumbers.length >= this.config.maxDamageNumbers) {
      this.damageNumbers.shift();
    }

    let color: string;
    if (isHeal) {
      color = COLORS.HEAL;
    } else if (isBlock) {
      color = COLORS.BLOCK;
    } else if (isPlayer) {
      color = COLORS.DAMAGE_PLAYER;
    } else {
      color = COLORS.DAMAGE_ENEMY;
    }

    const damageNumber: DamageNumber = {
      id: this.nextDamageNumberId++,
      value,
      x,
      y,
      color,
      timestamp: Date.now(),
      isPlayer,
      isHeal,
      isBlock,
    };

    this.damageNumbers.push(damageNumber);
  }

  /**
   * 获取所有活跃的伤害数字
   */
  public getDamageNumbers(): DamageNumber[] {
    return this.damageNumbers;
  }

  /**
   * 清理过期的伤害数字
   */
  private cleanupDamageNumbers(): void {
    const now = Date.now();
    this.damageNumbers = this.damageNumbers.filter(
      (dn) => now - dn.timestamp < this.config.damageNumberDuration
    );
  }

  // ==================== 更新与渲染 ====================

  /**
   * 更新所有特效状态
   * @param deltaTime 时间增量 (ms)
   */
  public update(deltaTime: number): void {
    // 更新粒子
    this.particleEffect.update(deltaTime);

    // 清理过期伤害数字
    this.cleanupDamageNumbers();
  }

  /**
   * 获取粒子特效系统（用于渲染）
   */
  public getParticleEffect(): ParticleEffect {
    return this.particleEffect;
  }

  /**
   * 获取活跃粒子数量
   */
  public getActiveParticleCount(): number {
    return this.particleEffect.getActiveCount();
  }

  /**
   * 清除所有特效
   */
  public clear(): void {
    this.particleEffect.clear();
    this.damageNumbers = [];
  }

  // ==================== 便捷方法 ====================

  /**
   * 播放敌人受伤效果（粒子 + 伤害数字）
   * @param damage 伤害值（用于决定粒子强度）
   * @param x X 坐标
   * @param y Y 坐标
   * @param intensity 粒子强度（默认根据 damage 自动计算）
   */
  public playEnemyDamageEffect(damage: number, x: number, y: number, intensity?: number): void {
    // P2-1: intensity 默认根据 damage 自动计算（1-3 范围）
    const computedIntensity = intensity ?? Math.min(3, Math.max(1, Math.ceil(damage / 8)));
    this.spawnEnemyDamageParticles(x, y, computedIntensity);
    this.addDamageNumber(damage, x, y, false, false, false);
  }

  /**
   * 播放玩家受伤效果（粒子 + 伤害数字）
   * @param damage 伤害值（未格挡前的总伤害）
   * @param x X 坐标
   * @param y Y 坐标
   * @param blockedAmount 格挡抵消的伤害（0 表示无格挡）
   */
  public playPlayerDamageEffect(
    damage: number,
    x: number,
    y: number,
    blockedAmount: number = 0
  ): void {
    if (blockedAmount > 0) {
      // 有格挡：先显示格挡数字和粒子
      this.spawnBlockParticles(x, y);
      this.addDamageNumber(blockedAmount, x, y, true, false, true);
      // 如果还有剩余伤害（damage - blockedAmount），显示穿透伤害
      const remainingDamage = Math.max(0, damage - blockedAmount);
      if (remainingDamage > 0) {
        this.spawnPlayerDamageParticles(x, y, 1);
        this.addDamageNumber(remainingDamage, x + 20, y + 20, true, false, false);
      }
    } else {
      // 无格挡：正常显示伤害
      this.spawnPlayerDamageParticles(x, y);
      this.addDamageNumber(damage, x, y, true, false, false);
    }
  }

  /**
   * 播放治疗效果（粒子 + 数字）
   * @param amount 治疗量
   * @param x X 坐标
   * @param y Y 坐标
   */
  public playHealEffect(amount: number, x: number, y: number): void {
    this.spawnHealParticles(x, y);
    this.addDamageNumber(amount, x, y, true, true, false);
  }

  /**
   * 播放增益效果
   * @param x X 坐标
   * @param y Y 坐标
   */
  public playBuffEffect(x: number, y: number): void {
    this.spawnBuffParticles(x, y);
  }

  /**
   * 播放减益效果
   * @param x X 坐标
   * @param y Y 坐标
   */
  public playDebuffEffect(x: number, y: number): void {
    this.spawnDebuffParticles(x, y);
  }

  /**
   * 播放战斗胜利效果
   * @param x X 坐标
   * @param y Y 坐标
   */
  public playVictoryEffect(x: number, y: number): void {
    this.spawnVictoryParticles(x, y);
  }

  /**
   * 播放战斗失败效果
   * @param x X 坐标
   * @param y Y 坐标
   */
  public playDefeatEffect(x: number, y: number): void {
    this.spawnDefeatParticles(x, y);
  }
}

// 导出单例实例
export const combatEffectManager = CombatEffectManager.getInstance();

export default CombatEffectManager;

/**
 * 效果管理器
 * 管理激活的效果、处理效果触发、管理冷却时间和持续时间
 */

import { EffectConfig, ActiveEffect, EffectResult, EffectTrigger } from '../types/effects';
import { BLOCK_EFFECTS, getEffectById } from '../config/block-effects';

/**
 * 效果回调函数类型
 */
export type EffectCallback = (effect: EffectConfig, data?: Record<string, unknown>) => EffectResult;

/**
 * 效果管理器类
 */
export class EffectManager {
  /** 激活的效果列表 */
  private activeEffects: Map<string, ActiveEffect> = new Map();

  /** 效果冷却时间映射 */
  private cooldowns: Map<string, number> = new Map();

  /** 效果回调注册表 */
  private effectCallbacks: Map<string, EffectCallback> = new Map();

  /** 连击计数器 */
  private comboCount: number = 0;

  /** 消除计数器（用于幸运七） */
  private clearCount: number = 0;

  /** 游戏开始时间 */
  private gameStartTime: number = Date.now();

  /**
   * 构造函数
   */
  constructor() {
    this.gameStartTime = Date.now();
  }

  /**
   * 注册效果回调
   * @param effectId 效果 ID
   * @param callback 回调函数
   */
  public registerEffectCallback(effectId: string, callback: EffectCallback): void {
    this.effectCallbacks.set(effectId, callback);
  }

  /**
   * 激活效果
   * @param effectId 效果 ID
   * @param duration 持续时间（毫秒），可选
   * @returns 是否成功激活
   */
  public activateEffect(effectId: string, duration?: number): boolean {
    const config = getEffectById(effectId);
    if (!config) {
      console.warn(`Effect not found: ${effectId}`);
      return false;
    }

    // 检查冷却时间
    if (!this.canActivateEffect(effectId)) {
      console.warn(`Effect on cooldown: ${effectId}`);
      return false;
    }

    const now = Date.now();
    const activeEffect: ActiveEffect = {
      config,
      activatedAt: now,
      expiresAt: duration ? now + duration : config.duration ? now + config.duration * 1000 : undefined,
      stacks: 1,
    };

    this.activeEffects.set(effectId, activeEffect);

    // 设置冷却时间
    if (config.cooldown && config.cooldown > 0) {
      this.cooldowns.set(effectId, now + config.cooldown * 1000);
    }

    console.log(`Effect activated: ${config.name}`);
    return true;
  }

  /**
   * 检查效果是否可以激活
   * @param effectId 效果 ID
   * @returns 是否可以激活
   */
  public canActivateEffect(effectId: string): boolean {
    const cooldownEnd = this.cooldowns.get(effectId);
    if (cooldownEnd) {
      return Date.now() >= cooldownEnd;
    }
    return true;
  }

  /**
   * 获取效果剩余冷却时间
   * @param effectId 效果 ID
   * @returns 剩余冷却时间（秒）
   */
  public getRemainingCooldown(effectId: string): number {
    const cooldownEnd = this.cooldowns.get(effectId);
    if (cooldownEnd) {
      const remaining = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
      return remaining;
    }
    return 0;
  }

  /**
   * 触发效果
   * @param effectId 效果 ID
   * @param data 效果数据
   * @returns 效果结果
   */
  public triggerEffect(effectId: string, data?: Record<string, unknown>): EffectResult {
    const config = getEffectById(effectId);
    if (!config) {
      return {
        success: false,
        effectId,
        message: `Effect not found: ${effectId}`,
      };
    }

    // 检查效果是否激活
    const activeEffect = this.activeEffects.get(effectId);
    if (!activeEffect) {
      // 对于被动效果，可以直接触发
      if (config.trigger !== EffectTrigger.PASSIVE) {
        return {
          success: false,
          effectId,
          message: `Effect not active: ${effectId}`,
        };
      }
    }

    // 检查效果是否过期
    if (activeEffect && activeEffect.expiresAt && Date.now() > activeEffect.expiresAt) {
      this.deactivateEffect(effectId);
      return {
        success: false,
        effectId,
        message: `Effect expired: ${effectId}`,
      };
    }

    // 执行效果回调
    const callback = this.effectCallbacks.get(effectId);
    if (callback) {
      const result = callback(config, data);
      if (result.success) {
        console.log(`Effect triggered: ${config.name}`, result);
      }
      return result;
    }

    // 默认效果结果
    return {
      success: true,
      effectId,
      message: `Effect triggered: ${config.name}`,
      data,
    };
  }

  /**
   * 停用效果
   * @param effectId 效果 ID
   */
  public deactivateEffect(effectId: string): void {
    const effect = this.activeEffects.get(effectId);
    if (effect) {
      console.log(`Effect deactivated: ${effect.config.name}`);
      this.activeEffects.delete(effectId);
    }
  }

  /**
   * 更新效果状态（每帧调用）
   */
  public update(): void {
    const now = Date.now();

    // 检查过期效果 - 先收集要移除的效果 ID，避免遍历中修改 Map
    const expiredEffects: string[] = [];
    for (const [effectId, effect] of this.activeEffects.entries()) {
      if (effect.expiresAt && now > effect.expiresAt) {
        expiredEffects.push(effectId);
      }
    }
    // 统一移除过期效果
    expiredEffects.forEach(id => this.deactivateEffect(id));
  }

  /**
   * 获取所有激活的效果
   * @returns 激活的效果列表
   */
  public getActiveEffects(): ActiveEffect[] {
    return Array.from(this.activeEffects.values());
  }

  /**
   * 获取激活的效果数量
   * @returns 激活的效果数量
   */
  public getActiveEffectCount(): number {
    return this.activeEffects.size;
  }

  /**
   * 清除所有效果
   */
  public clearAllEffects(): void {
    this.activeEffects.clear();
    this.cooldowns.clear();
    this.comboCount = 0;
    this.clearCount = 0;
  }

  /**
   * 处理方块放置
   * @param effectIds 触发的效果 ID 列表
   * @returns 效果结果列表
   */
  public onBlockPlace(effectIds: string[]): EffectResult[] {
    const results: EffectResult[] = [];

    for (const effectId of effectIds) {
      const config = getEffectById(effectId);
      if (config && config.trigger === EffectTrigger.ON_PLACE) {
        if (this.activateEffect(effectId)) {
          const result = this.triggerEffect(effectId);
          results.push(result);
        }
      }
    }

    return results;
  }

  /**
   * 处理方块消除
   * @param effectIds 触发的效果 ID 列表
   * @param linesCleared 消除的行数
   * @returns 效果结果列表
   */
  public onBlockClear(effectIds: string[], linesCleared: number = 1): EffectResult[] {
    const results: EffectResult[] = [];
    this.clearCount++;

    // 更新连击计数
    if (linesCleared > 1) {
      this.comboCount++;
    } else {
      this.comboCount = 0;
    }

    for (const effectId of effectIds) {
      const config = getEffectById(effectId);
      if (config) {
        // 检查触发条件
        if (config.trigger === EffectTrigger.ON_CLEAR) {
          if (this.activateEffect(effectId)) {
            const result = this.triggerEffect(effectId, { linesCleared });
            results.push(result);
          }
        } else if (config.trigger === EffectTrigger.ON_COMBO && this.comboCount > 1) {
          const result = this.triggerEffect(effectId, { comboCount: this.comboCount });
          results.push(result);
        } else if (config.trigger === EffectTrigger.PASSIVE) {
          // 检查特殊条件（如幸运七）
          if (config.id === 'lucky_seven' && this.clearCount % 7 === 0) {
            const result = this.triggerEffect(effectId, { clearCount: this.clearCount });
            results.push(result);
          }
        }
      }
    }

    return results;
  }

  /**
   * 处理连击
   * @param effectIds 触发的效果 ID 列表
   * @returns 效果结果列表
   */
  public onCombo(effectIds: string[]): EffectResult[] {
    const results: EffectResult[] = [];

    for (const effectId of effectIds) {
      const config = getEffectById(effectId);
      if (config && config.trigger === EffectTrigger.ON_COMBO) {
        const result = this.triggerEffect(effectId, { comboCount: this.comboCount });
        results.push(result);
      }
    }

    return results;
  }

  /**
   * 重置连击计数
   */
  public resetCombo(): void {
    this.comboCount = 0;
  }

  /**
   * 获取当前连击数
   * @returns 连击数
   */
  public getComboCount(): number {
    return this.comboCount;
  }

  /**
   * 获取当前消除数
   * @returns 消除数
   */
  public getClearCount(): number {
    return this.clearCount;
  }

  /**
   * 序列化效果管理器状态
   * @returns 状态对象
   */
  public serialize(): Record<string, unknown> {
    return {
      activeEffects: Array.from(this.activeEffects.entries()).map(([id, effect]) => ({
        id,
        activatedAt: effect.activatedAt,
        expiresAt: effect.expiresAt,
        stacks: effect.stacks,
      })),
      cooldowns: Array.from(this.cooldowns.entries()),
      comboCount: this.comboCount,
      clearCount: this.clearCount,
    };
  }

  /**
   * 反序列化效果管理器状态
   * @param state 状态对象
   */
  public deserialize(state: Record<string, unknown>): void {
    const activeEffects = state.activeEffects as Array<{
      id: string;
      activatedAt: number;
      expiresAt?: number;
      stacks?: number;
    }>;

    if (activeEffects) {
      for (const effect of activeEffects) {
        const config = getEffectById(effect.id);
        if (config) {
          this.activeEffects.set(effect.id, {
            config,
            activatedAt: effect.activatedAt,
            expiresAt: effect.expiresAt,
            stacks: effect.stacks,
          });
        }
      }
    }

    const cooldowns = state.cooldowns as Array<[string, number]>;
    if (cooldowns) {
      for (const [id, cooldown] of cooldowns) {
        this.cooldowns.set(id, cooldown);
      }
    }

    this.comboCount = (state.comboCount as number) || 0;
    this.clearCount = (state.clearCount as number) || 0;
  }
}

// 导出单例实例
export const effectManager = new EffectManager();

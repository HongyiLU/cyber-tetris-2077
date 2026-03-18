// ==================== 特殊效果系统 ====================
// v2.0.1 - 特殊方块效果触发系统

import type { Card } from '../types/card.v2';
import type { BattleState } from '../types';

/**
 * 特殊效果处理函数类型
 */
type EffectHandler = (card: Card, state: BattleStateContext) => void;

/**
 * 战斗状态上下文
 */
interface BattleStateContext {
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  combo: number;
  paused: boolean;
  // 回调函数
  healPlayer: (amount: number) => void;
  damageEnemy: (amount: number) => void;
  damagePlayer: (amount: number) => void;
  setEnemyPaused: (paused: boolean, duration?: number) => void;
  setPlayerShield: (amount: number) => void;
  clearGarbageRows: () => number;
  eliminate3x3: (boardX: number, boardY: number) => number;
  triggerLightningChain: () => void;
  applyBurnDamage: (amount: number, duration: number) => void;
  freezeEnemy: (duration: number) => void;
  setLuckyMode: (enabled: boolean) => void;
  addCombo: (amount: number) => void;
}

/**
 * 特殊效果系统类
 * 负责管理和触发所有特殊方块的效果
 */
export class SpecialEffectSystem {
  private static effects: Map<string, EffectHandler> = new Map();
  private static initialized: boolean = false;

  /**
   * 初始化所有特殊效果
   */
  static initialize(): void {
    if (this.initialized) return;

    // 💣 炸弹方块 - 消除 3x3 区域
    this.effects.set('eliminate_3x3', (card, state) => {
      console.log('[特效] 炸弹方块：消除 3x3 区域');
      // 3x3 消除逻辑在 GameEngine 中通过 eliminate3x3 回调实现
    });

    // ⏰ 时间停止 - 暂停敌人攻击 10 秒
    this.effects.set('pause_enemy_10s', (card, state) => {
      console.log('[特效] 时间停止：暂停敌人攻击 10 秒');
      state.setEnemyPaused(true, 10000);
    });

    // 💚 生命偷取 - 恢复 3 点生命值
    this.effects.set('heal_3hp', (card, state) => {
      console.log('[特效] 生命偷取：恢复 3 点生命值');
      state.healPlayer(3);
    });

    // 🛡️ 防御护盾 - 抵挡下一次攻击
    this.effects.set('shield_5', (card, state) => {
      console.log('[特效] 防御护盾：获得 5 点护盾');
      state.setPlayerShield(5);
    });

    // 🔥 连击强化 - 连击伤害 +50%
    this.effects.set('combo_damage_plus_50', (card, state) => {
      console.log('[特效] 连击强化：连击伤害 +50%');
      state.addCombo(2);
    });

    // 🌟 全屏清除 - 清除所有垃圾行
    this.effects.set('clear_all_garbage', (card, state) => {
      console.log('[特效] 全屏清除：清除所有垃圾行');
      const cleared = state.clearGarbageRows();
      console.log(`[特效] 清除了 ${cleared} 行垃圾行`);
    });

    // 7️⃣ 幸运七 - 第 7 次消除 2x 伤害
    this.effects.set('lucky_7th_double', (card, state) => {
      console.log('[特效] 幸运七：激活第 7 次消除 2x 伤害');
      state.setLuckyMode(true);
    });

    // ❄️ 寒冰冻结 - 冻结敌人 3 秒
    this.effects.set('freeze_enemy_3s', (card, state) => {
      console.log('[特效] 寒冰冻结：冻结敌人 3 秒');
      state.freezeEnemy(3000);
    });

    // 🔥 火焰燃烧 - 持续伤害 10 点（5 秒）
    this.effects.set('burn_10_5s', (card, state) => {
      console.log('[特效] 火焰燃烧：持续伤害 10 点（5 秒）');
      state.applyBurnDamage(10, 5000);
    });

    // ⚡ 雷电连锁 - 连锁消除相邻方块
    this.effects.set('lightning_chain', (card, state) => {
      console.log('[特效] 雷电连锁：触发连锁消除');
      state.triggerLightningChain();
    });

    // ⚡ 闪电暴击 - 有几率暴击
    this.effects.set('chance_crit', (card, state) => {
      console.log('[特效] 闪电暴击：有几率造成暴击伤害');
      // 暴击逻辑在伤害计算中处理
    });

    this.initialized = true;
    console.log('[SpecialEffectSystem] 已初始化 11 种特殊效果');
  }

  /**
   * 触发特殊效果
   * @param effectId 效果 ID
   * @param card 触发效果的卡牌
   * @param state 战斗状态上下文
   */
  static trigger(effectId: string, card: Card, state: BattleStateContext): void {
    if (!this.initialized) {
      this.initialize();
    }

    const effect = this.effects.get(effectId);
    if (effect) {
      console.log('[DEBUG] 触发特殊效果', {
        specialId: effectId,
        cardName: card.name,
      });
      effect(card, state);
    } else {
      console.warn(`[警告] 未找到特殊效果：${effectId}`);
    }
  }

  /**
   * 获取所有已注册的效果 ID
   */
  static getRegisteredEffects(): string[] {
    return Array.from(this.effects.keys());
  }

  /**
   * 检查效果是否存在
   */
  static hasEffect(effectId: string): boolean {
    return this.effects.has(effectId);
  }

  /**
   * 重置系统（用于测试）
   */
  static reset(): void {
    this.effects.clear();
    this.initialized = false;
  }
}

// 导出单例式方法
export const triggerSpecialEffect = (
  effectId: string,
  card: Card,
  state: BattleStateContext
): void => {
  SpecialEffectSystem.trigger(effectId, card, state);
};

export default SpecialEffectSystem;

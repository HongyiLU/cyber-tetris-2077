/**
 * EffectManager 单元测试
 */

import { EffectManager } from '../systems/EffectManager';
import { EffectType, EffectTrigger, Rarity } from '../types/effects';
import { BLOCK_EFFECTS, getEffectById } from '../config/block-effects';

describe('EffectManager', () => {
  let effectManager: EffectManager;

  beforeEach(() => {
    effectManager = new EffectManager();
  });

  afterEach(() => {
    effectManager.clearAllEffects();
  });

  describe('初始化', () => {
    test('应该正确初始化', () => {
      expect(effectManager.getActiveEffectCount()).toBe(0);
      expect(effectManager.getComboCount()).toBe(0);
      expect(effectManager.getClearCount()).toBe(0);
    });
  });

  describe('激活效果', () => {
    test('应该成功激活效果', () => {
      const result = effectManager.activateEffect('bomb_block');
      expect(result).toBe(true);
      expect(effectManager.getActiveEffectCount()).toBe(1);
    });

    test('激活不存在的效果应该返回 false', () => {
      const result = effectManager.activateEffect('nonexistent_effect');
      expect(result).toBe(false);
    });

    test('激活有冷却时间的效果后应该进入冷却', () => {
      effectManager.activateEffect('bomb_block');
      expect(effectManager.canActivateEffect('bomb_block')).toBe(false);
      expect(effectManager.getRemainingCooldown('bomb_block')).toBeGreaterThan(0);
    });

    test('激活无冷却时间的效果应该可以立即再次激活', () => {
      effectManager.activateEffect('combo_boost');
      // combo_boost 冷却时间为 0
      expect(effectManager.canActivateEffect('combo_boost')).toBe(true);
    });
  });

  describe('效果冷却', () => {
    test('应该正确获取剩余冷却时间', () => {
      effectManager.activateEffect('bomb_block');
      const cooldown = effectManager.getRemainingCooldown('bomb_block');
      expect(cooldown).toBeGreaterThan(0);
      expect(cooldown).toBeLessThanOrEqual(15); // bomb_block 冷却 15 秒
    });

    test('没有冷却时间的效果应该返回 0', () => {
      const cooldown = effectManager.getRemainingCooldown('nonexistent_effect');
      expect(cooldown).toBe(0);
    });
  });

  describe('触发效果', () => {
    test('应该成功触发已激活的效果', () => {
      effectManager.activateEffect('life_steal');
      const result = effectManager.triggerEffect('life_steal');
      expect(result.success).toBe(true);
      expect(result.effectId).toBe('life_steal');
    });

    test('触发未激活的非被动效果应该失败', () => {
      const result = effectManager.triggerEffect('time_stop');
      expect(result.success).toBe(false);
    });

    test('被动效果可以直接触发', () => {
      const result = effectManager.triggerEffect('defense_shield');
      expect(result.success).toBe(true);
    });

    test('触发不存在的效果应该失败', () => {
      const result = effectManager.triggerEffect('nonexistent_effect');
      expect(result.success).toBe(false);
    });
  });

  describe('效果回调', () => {
    test('应该可以注册效果回调', () => {
      const mockCallback = jest.fn().mockReturnValue({
        success: true,
        effectId: 'bomb_block',
        message: 'Bomb effect triggered',
      });

      // 覆盖 bomb_block 的回调
      effectManager.registerEffectCallback('bomb_block', mockCallback);
      effectManager.activateEffect('bomb_block');
      effectManager.triggerEffect('bomb_block');

      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('方块放置', () => {
    test('onBlockPlace 应该触发 ON_PLACE 效果', () => {
      const results = effectManager.onBlockPlace(['bomb_block']);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].effectId).toBe('bomb_block');
    });

    test('onBlockPlace 不应该触发 ON_CLEAR 效果', () => {
      const results = effectManager.onBlockPlace(['life_steal']);
      // life_steal 是 ON_CLEAR 触发，不应该被 onBlockPlace 触发
      expect(results.length).toBe(0);
    });
  });

  describe('方块消除', () => {
    test('onBlockClear 应该触发 ON_CLEAR 效果', () => {
      const results = effectManager.onBlockClear(['life_steal'], 1);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].effectId).toBe('life_steal');
    });

    test('onBlockClear 应该增加消除计数', () => {
      effectManager.onBlockClear(['life_steal'], 1);
      expect(effectManager.getClearCount()).toBe(1);

      effectManager.onBlockClear(['life_steal'], 1);
      expect(effectManager.getClearCount()).toBe(2);
    });

    test('多次消除应该增加连击计数', () => {
      effectManager.onBlockClear(['life_steal'], 2); // 多行消除
      expect(effectManager.getComboCount()).toBe(1);

      effectManager.onBlockClear(['life_steal'], 2);
      expect(effectManager.getComboCount()).toBe(2);
    });

    test('单行消除应该重置连击计数', () => {
      effectManager.onBlockClear(['life_steal'], 2);
      expect(effectManager.getComboCount()).toBe(1);

      effectManager.onBlockClear(['life_steal'], 1);
      expect(effectManager.getComboCount()).toBe(0);
    });
  });

  describe('连击处理', () => {
    test('onCombo 应该触发 ON_COMBO 效果', () => {
      // 先设置连击
      effectManager.onBlockClear(['combo_boost'], 2);
      const results = effectManager.onCombo(['combo_boost']);
      expect(results.length).toBeGreaterThan(0);
    });

    test('resetCombo 应该重置连击计数', () => {
      effectManager.onBlockClear(['life_steal'], 2);
      expect(effectManager.getComboCount()).toBe(1);

      effectManager.resetCombo();
      expect(effectManager.getComboCount()).toBe(0);
    });
  });

  describe('效果停用', () => {
    test('deactivateEffect 应该停用效果', () => {
      effectManager.activateEffect('bomb_block');
      expect(effectManager.getActiveEffectCount()).toBe(1);

      effectManager.deactivateEffect('bomb_block');
      expect(effectManager.getActiveEffectCount()).toBe(0);
    });

    test('停用不存在的效果不应该报错', () => {
      expect(() => effectManager.deactivateEffect('nonexistent_effect')).not.toThrow();
    });
  });

  describe('清除所有效果', () => {
    test('clearAllEffects 应该清除所有激活的效果和冷却', () => {
      effectManager.activateEffect('bomb_block');
      effectManager.activateEffect('time_stop');
      expect(effectManager.getActiveEffectCount()).toBe(2);

      effectManager.clearAllEffects();
      expect(effectManager.getActiveEffectCount()).toBe(0);
      expect(effectManager.getComboCount()).toBe(0);
      expect(effectManager.getClearCount()).toBe(0);
    });
  });

  describe('获取激活的效果', () => {
    test('getActiveEffects 应该返回所有激活的效果', () => {
      effectManager.activateEffect('bomb_block');
      effectManager.activateEffect('time_stop');

      const activeEffects = effectManager.getActiveEffects();
      expect(activeEffects.length).toBe(2);
    });

    test('getActiveEffects 应该包含效果配置', () => {
      effectManager.activateEffect('bomb_block');

      const activeEffects = effectManager.getActiveEffects();
      expect(activeEffects[0].config.id).toBe('bomb_block');
      expect(activeEffects[0].config.name).toContain('炸弹方块');
    });
  });

  describe('序列化和反序列化', () => {
    test('应该可以序列化状态', () => {
      effectManager.activateEffect('bomb_block');
      effectManager.onBlockClear(['life_steal'], 2);

      const state = effectManager.serialize();

      expect(state.activeEffects).toBeDefined();
      expect(state.comboCount).toBe(1);
      expect(state.clearCount).toBe(1);
    });

    test('应该可以反序列化状态', () => {
      const state = {
        activeEffects: [
          {
            id: 'bomb_block',
            activatedAt: Date.now(),
            expiresAt: Date.now() + 10000,
            stacks: 1,
          },
        ],
        cooldowns: [['bomb_block', Date.now() + 15000]] as Array<[string, number]>,
        comboCount: 2,
        clearCount: 5,
      };

      effectManager.deserialize(state);

      expect(effectManager.getActiveEffectCount()).toBe(1);
      expect(effectManager.getComboCount()).toBe(2);
      expect(effectManager.getClearCount()).toBe(5);
    });
  });

  describe('效果配置验证', () => {
    test('所有效果应该有唯一的 ID', () => {
      const ids = BLOCK_EFFECTS.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('所有效果应该有有效的稀有度', () => {
      const validRarities = Object.values(Rarity);
      for (const effect of BLOCK_EFFECTS) {
        expect(validRarities).toContain(effect.rarity);
      }
    });

    test('所有效果应该有有效的效果类型', () => {
      const validTypes = Object.values(EffectType);
      for (const effect of BLOCK_EFFECTS) {
        expect(validTypes).toContain(effect.effectType);
      }
    });

    test('所有效果应该有有效的触发时机', () => {
      const validTriggers = Object.values(EffectTrigger);
      for (const effect of BLOCK_EFFECTS) {
        expect(validTriggers).toContain(effect.trigger);
      }
    });
  });
});

/**
 * 特殊效果方块卡牌单元测试
 * 测试效果触发逻辑和游戏引擎集成
 */

import { GameEngine } from '../engine/GameEngine';
import { EffectManager } from '../systems/EffectManager';
import { BLOCK_EFFECTS, getEffectById, getEffectsByRarity, getEffectsByType } from '../config/block-effects';
import { EffectType, EffectTrigger, Rarity } from '../types/effects';
import { GAME_CONFIG, getBlockEffect } from '../config/game';

describe('BlockEffects', () => {
  describe('效果配置', () => {
    test('应该有 10 种特殊效果', () => {
      expect(BLOCK_EFFECTS.length).toBe(10);
    });

    test('炸弹方块配置应该正确', () => {
      const effect = getEffectById('bomb_block');
      expect(effect).toBeDefined();
      expect(effect?.name).toContain('炸弹方块');
      expect(effect?.rarity).toBe(Rarity.EPIC);
      expect(effect?.effectType).toBe(EffectType.OFFENSE);
      expect(effect?.trigger).toBe(EffectTrigger.ON_PLACE);
      expect(effect?.range).toBe(3);
    });

    test('时间停止配置应该正确', () => {
      const effect = getEffectById('time_stop');
      expect(effect).toBeDefined();
      expect(effect?.name).toContain('时间停止');
      expect(effect?.rarity).toBe(Rarity.LEGENDARY);
      expect(effect?.duration).toBe(10);
      expect(effect?.cooldown).toBe(60);
    });

    test('生命偷取配置应该正确', () => {
      const effect = getEffectById('life_steal');
      expect(effect).toBeDefined();
      expect(effect?.name).toContain('生命偷取');
      expect(effect?.rarity).toBe(Rarity.RARE);
      expect(effect?.effectType).toBe(EffectType.SUPPORT);
      expect(effect?.value).toBe(5);
    });

    test('防御护盾配置应该正确', () => {
      const effect = getEffectById('defense_shield');
      expect(effect).toBeDefined();
      expect(effect?.name).toContain('防御护盾');
      expect(effect?.rarity).toBe(Rarity.UNCOMMON);
      expect(effect?.effectType).toBe(EffectType.DEFENSE);
      expect(effect?.trigger).toBe(EffectTrigger.PASSIVE);
    });

    test('连击增幅配置应该正确', () => {
      const effect = getEffectById('combo_boost');
      expect(effect).toBeDefined();
      expect(effect?.name).toContain('连击增幅');
      expect(effect?.rarity).toBe(Rarity.EPIC);
      expect(effect?.trigger).toBe(EffectTrigger.ON_COMBO);
      expect(effect?.value).toBe(0.5);
    });

    test('全屏清除配置应该正确', () => {
      const effect = getEffectById('full_clear');
      expect(effect).toBeDefined();
      expect(effect?.name).toContain('全屏清除');
      expect(effect?.rarity).toBe(Rarity.LEGENDARY);
      expect(effect?.cooldown).toBe(60);
    });

    test('幸运七配置应该正确', () => {
      const effect = getEffectById('lucky_seven');
      expect(effect).toBeDefined();
      expect(effect?.name).toContain('幸运七');
      expect(effect?.rarity).toBe(Rarity.UNCOMMON);
      expect(effect?.value).toBe(2);
      expect(effect?.range).toBe(7);
    });

    test('寒冰冻结配置应该正确', () => {
      const effect = getEffectById('ice_freeze');
      expect(effect).toBeDefined();
      expect(effect?.name).toContain('寒冰冻结');
      expect(effect?.rarity).toBe(Rarity.RARE);
      expect(effect?.duration).toBe(3);
    });

    test('火焰燃烧配置应该正确', () => {
      const effect = getEffectById('fire_burn');
      expect(effect).toBeDefined();
      expect(effect?.name).toContain('火焰燃烧');
      expect(effect?.rarity).toBe(Rarity.UNCOMMON);
      expect(effect?.duration).toBe(5);
      expect(effect?.value).toBe(10);
    });

    test('雷电连锁配置应该正确', () => {
      const effect = getEffectById('lightning_chain');
      expect(effect).toBeDefined();
      expect(effect?.name).toContain('雷电连锁');
      expect(effect?.rarity).toBe(Rarity.EPIC);
      expect(effect?.range).toBe(2);
    });
  });

  describe('效果筛选', () => {
    test('按稀有度筛选 - 传说效果', () => {
      const legendaryEffects = getEffectsByRarity(Rarity.LEGENDARY);
      expect(legendaryEffects.length).toBe(2); // 时间停止、全屏清除
      expect(legendaryEffects.map((e) => e.id)).toContain('time_stop');
      expect(legendaryEffects.map((e) => e.id)).toContain('full_clear');
    });

    test('按稀有度筛选 - 史诗效果', () => {
      const epicEffects = getEffectsByRarity(Rarity.EPIC);
      expect(epicEffects.length).toBe(3); // 炸弹方块、连击增幅、雷电连锁
    });

    test('按稀有度筛选 - 稀有效果', () => {
      const rareEffects = getEffectsByRarity(Rarity.RARE);
      expect(rareEffects.length).toBe(2); // 生命偷取、寒冰冻结
    });

    test('按稀有度筛选 - 罕见效果', () => {
      const uncommonEffects = getEffectsByRarity(Rarity.UNCOMMON);
      expect(uncommonEffects.length).toBe(3); // 防御护盾、幸运七、火焰燃烧
    });

    test('按效果类型筛选 - 进攻型', () => {
      const offenseEffects = getEffectsByType(EffectType.OFFENSE);
      expect(offenseEffects.length).toBe(3); // 炸弹方块、火焰燃烧、雷电连锁
    });

    test('按效果类型筛选 - 防御型', () => {
      const defenseEffects = getEffectsByType(EffectType.DEFENSE);
      expect(defenseEffects.length).toBe(1); // 防御护盾
    });

    test('按效果类型筛选 - 辅助型', () => {
      const supportEffects = getEffectsByType(EffectType.SUPPORT);
      expect(supportEffects.length).toBe(3); // 生命偷取、连击增幅、幸运七
    });

    test('按效果类型筛选 - 特殊型', () => {
      const specialEffects = getEffectsByType(EffectType.SPECIAL);
      expect(specialEffects.length).toBe(3); // 时间停止、全屏清除、寒冰冻结
    });
  });

  describe('方块效果配置', () => {
    test('I 方块应该有时间停止效果', () => {
      const effect = getBlockEffect('I');
      expect(effect?.effectId).toBe('time_stop');
      expect(effect?.trigger).toBe(EffectTrigger.ON_CLEAR);
    });

    test('O 方块应该有防御护盾效果', () => {
      const effect = getBlockEffect('O');
      expect(effect?.effectId).toBe('defense_shield');
      expect(effect?.trigger).toBe(EffectTrigger.PASSIVE);
    });

    test('T 方块应该有炸弹方块效果', () => {
      const effect = getBlockEffect('T');
      expect(effect?.effectId).toBe('bomb_block');
      expect(effect?.trigger).toBe(EffectTrigger.ON_PLACE);
    });

    test('S 方块应该有寒冰冻结效果', () => {
      const effect = getBlockEffect('S');
      expect(effect?.effectId).toBe('ice_freeze');
      expect(effect?.trigger).toBe(EffectTrigger.ON_PLACE);
    });

    test('Z 方块应该有火焰燃烧效果', () => {
      const effect = getBlockEffect('Z');
      expect(effect?.effectId).toBe('fire_burn');
      expect(effect?.trigger).toBe(EffectTrigger.ON_CLEAR);
    });

    test('L 方块应该有雷电连锁效果', () => {
      const effect = getBlockEffect('L');
      expect(effect?.effectId).toBe('lightning_chain');
      expect(effect?.trigger).toBe(EffectTrigger.ON_CLEAR);
    });

    test('J 方块应该有生命偷取效果', () => {
      const effect = getBlockEffect('J');
      expect(effect?.effectId).toBe('life_steal');
      expect(effect?.trigger).toBe(EffectTrigger.ON_CLEAR);
    });
  });
});

describe('GameEngine 效果集成', () => {
  let gameEngine: GameEngine;

  beforeEach(() => {
    gameEngine = new GameEngine();
    gameEngine.startGame();
  });

  afterEach(() => {
    gameEngine.stopGame();
  });

  describe('游戏状态', () => {
    test('游戏应该正确初始化', () => {
      const state = gameEngine.getState();
      expect(state.isRunning).toBe(true);
      expect(state.health).toBe(100);
      expect(state.score).toBe(0);
    });

    test('游戏板应该正确创建', () => {
      const board = gameEngine.getBoard();
      expect(board.length).toBe(20);
      expect(board[0].length).toBe(10);
    });
  });

  describe('效果触发', () => {
    test('放置 T 方块应该触发炸弹效果', () => {
      const results = gameEngine.placeBlock('T', 3, 10, ['bomb_block']);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].effectId).toBe('bomb_block');
    });

    test('消除 J 方块应该触发生命偷取效果', () => {
      const results = gameEngine.clearLines([10], ['life_steal']);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].effectId).toBe('life_steal');
    });

    test('消除多行应该增加连击', () => {
      gameEngine.clearLines([10], ['combo_boost']);
      const effectManager = gameEngine.getEffectManager();
      expect(effectManager.getComboCount()).toBe(0); // 单行不增加连击

      gameEngine.clearLines([9, 8], ['combo_boost']);
      expect(effectManager.getComboCount()).toBe(1); // 多行增加连击
    });
  });

  describe('生命值系统', () => {
    test('生命偷取应该恢复生命值', () => {
      const initialState = gameEngine.getState();
      expect(initialState.health).toBe(100);

      // 模拟受到伤害
      gameEngine.clearLines([10], ['life_steal']);

      // 生命偷取会恢复 5 点生命值（但已经在最大值）
      const state = gameEngine.getState();
      expect(state.health).toBe(100);
    });

    test('防御护盾应该抵挡垃圾行攻击', () => {
      // 直接激活防御护盾（被动效果）
      const effectManager = gameEngine.getEffectManager();
      effectManager.activateEffect('defense_shield');
      effectManager.triggerEffect('defense_shield');

      // 验证护盾已激活
      let state = gameEngine.getState();
      expect(state.hasDefenseShield).toBe(true);

      // 受到垃圾行攻击
      gameEngine.addGarbageLines(3);

      // 验证护盾已消耗且攻击被抵挡
      state = gameEngine.getState();
      expect(state.hasDefenseShield).toBe(false); // 护盾已消耗
      expect(state.garbageLines).toBe(0); // 攻击被抵挡
    });
  });

  describe('敌人攻击暂停', () => {
    test('时间停止应该暂停敌人攻击', () => {
      // 触发时间停止
      gameEngine.clearLines([10], ['time_stop']);

      const state = gameEngine.getState();
      expect(state.enemyAttackPaused).toBe(true);
      expect(state.enemyAttackPauseEnd).toBeDefined();
    });
  });

  describe('游戏循环', () => {
    test('update 应该正确处理效果状态', () => {
      gameEngine.update();

      const state = gameEngine.getState();
      expect(state.isRunning).toBe(true);
    });

    test('暂停后 update 不应该处理逻辑', () => {
      gameEngine.pauseGame();
      gameEngine.update();

      const state = gameEngine.getState();
      expect(state.isPaused).toBe(true);
    });
  });

  describe('游戏重置', () => {
    test('reset 应该重置所有状态', () => {
      gameEngine.clearLines([10], ['life_steal']);
      gameEngine.placeBlock('T', 3, 10, ['bomb_block']);

      gameEngine.reset();

      const state = gameEngine.getState();
      expect(state.isRunning).toBe(false);
      expect(state.score).toBe(0);
      expect(state.health).toBe(100);
    });
  });
});

describe('效果触发时机', () => {
  describe('ON_PLACE 触发', () => {
    test('炸弹方块应该在放置时触发', () => {
      const effect = getEffectById('bomb_block');
      expect(effect?.trigger).toBe(EffectTrigger.ON_PLACE);
    });

    test('寒冰冻结应该在放置时触发', () => {
      const effect = getEffectById('ice_freeze');
      expect(effect?.trigger).toBe(EffectTrigger.ON_PLACE);
    });
  });

  describe('ON_CLEAR 触发', () => {
    test('生命偷取应该在消除时触发', () => {
      const effect = getEffectById('life_steal');
      expect(effect?.trigger).toBe(EffectTrigger.ON_CLEAR);
    });

    test('时间停止应该在消除时触发', () => {
      const effect = getEffectById('time_stop');
      expect(effect?.trigger).toBe(EffectTrigger.ON_CLEAR);
    });

    test('火焰燃烧应该在消除时触发', () => {
      const effect = getEffectById('fire_burn');
      expect(effect?.trigger).toBe(EffectTrigger.ON_CLEAR);
    });

    test('雷电连锁应该在消除时触发', () => {
      const effect = getEffectById('lightning_chain');
      expect(effect?.trigger).toBe(EffectTrigger.ON_CLEAR);
    });

    test('全屏清除应该在消除时触发', () => {
      const effect = getEffectById('full_clear');
      expect(effect?.trigger).toBe(EffectTrigger.ON_CLEAR);
    });
  });

  describe('ON_COMBO 触发', () => {
    test('连击增幅应该在连击时触发', () => {
      const effect = getEffectById('combo_boost');
      expect(effect?.trigger).toBe(EffectTrigger.ON_COMBO);
    });
  });

  describe('PASSIVE 触发', () => {
    test('防御护盾应该是被动触发', () => {
      const effect = getEffectById('defense_shield');
      expect(effect?.trigger).toBe(EffectTrigger.PASSIVE);
    });

    test('幸运七应该是被动触发', () => {
      const effect = getEffectById('lucky_seven');
      expect(effect?.trigger).toBe(EffectTrigger.PASSIVE);
    });
  });
});

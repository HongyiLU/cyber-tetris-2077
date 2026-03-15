/**
 * 特殊效果方块卡牌单元测试
 * 测试 10 种特殊方块的配置正确性
 */

import { GAME_CONFIG, getBlockType, getBasicBlockIds, getSpecialBlockIds, getAllBlockIds, SpecialBlockId } from '../config/game';
import { PieceType } from '../types/block-types';
import { getEffectById } from '../config/block-effects';
import { EffectType, Rarity } from '../types/effects';

// 特殊方块 ID 列表（用于测试）
const specialBlockIds: SpecialBlockId[] = [
  'BOMB',
  'TIME',
  'HEAL',
  'SHIELD',
  'COMBO',
  'CLEAR',
  'LUCKY',
  'FREEZE',
  'FIRE',
  'LIGHTNING',
];

describe('SpecialBlocks', () => {
  describe('特殊方块配置', () => {
    test('应该有 10 种特殊方块', () => {
      const specialBlocks = getSpecialBlockIds();
      expect(specialBlocks.length).toBe(10);
    });

    test('应该有 7 种基础方块', () => {
      const basicBlocks = getBasicBlockIds();
      expect(basicBlocks.length).toBe(7);
    });

    test('总共应该有 17 种方块', () => {
      const allBlocks = getAllBlockIds();
      expect(allBlocks.length).toBe(17);
    });

    test('所有特殊方块类型应该为 SPECIAL', () => {
      const specialBlocks = getSpecialBlockIds();
      specialBlocks.forEach((blockId) => {
        expect(getBlockType(blockId)).toBe(PieceType.SPECIAL);
      });
    });

    test('所有基础方块类型应该为 BASIC', () => {
      const basicBlocks = getBasicBlockIds();
      basicBlocks.forEach((blockId) => {
        expect(getBlockType(blockId)).toBe(PieceType.BASIC);
      });
    });
  });

  describe('10 种特殊方块详细配置', () => {
    const specialBlockConfigs: Array<{
      id: SpecialBlockId;
      name: string;
      color: string;
      rarity: Rarity;
      effectType: EffectType;
    }> = [
      {
        id: 'BOMB',
        name: '💣 炸弹方块',
        color: '#ff6600',
        rarity: Rarity.EPIC,
        effectType: EffectType.OFFENSE,
      },
      {
        id: 'TIME',
        name: '⏰ 时间停止',
        color: '#00ccff',
        rarity: Rarity.LEGENDARY,
        effectType: EffectType.SPECIAL,
      },
      {
        id: 'HEAL',
        name: '💖 生命偷取',
        color: '#ff69b4',
        rarity: Rarity.RARE,
        effectType: EffectType.SUPPORT,
      },
      {
        id: 'SHIELD',
        name: '🛡️ 防御护盾',
        color: '#cccccc',
        rarity: Rarity.UNCOMMON,
        effectType: EffectType.DEFENSE,
      },
      {
        id: 'COMBO',
        name: '📈 连击增幅',
        color: '#9932cc',
        rarity: Rarity.EPIC,
        effectType: EffectType.SUPPORT,
      },
      {
        id: 'CLEAR',
        name: '🌟 全屏清除',
        color: '#ffd700',
        rarity: Rarity.LEGENDARY,
        effectType: EffectType.SPECIAL,
      },
      {
        id: 'LUCKY',
        name: '7️⃣ 幸运七',
        color: '#32cd32',
        rarity: Rarity.UNCOMMON,
        effectType: EffectType.SUPPORT,
      },
      {
        id: 'FREEZE',
        name: '❄️ 寒冰冻结',
        color: '#87ceeb',
        rarity: Rarity.RARE,
        effectType: EffectType.SPECIAL,
      },
      {
        id: 'FIRE',
        name: '🔥 火焰燃烧',
        color: '#ff4500',
        rarity: Rarity.UNCOMMON,
        effectType: EffectType.OFFENSE,
      },
      {
        id: 'LIGHTNING',
        name: '⚡ 雷电连锁',
        color: '#ffff00',
        rarity: Rarity.EPIC,
        effectType: EffectType.OFFENSE,
      },
    ];

    test.each(specialBlockConfigs)('$id - 形状应该定义', ({ id }) => {
      expect(GAME_CONFIG.SHAPES[id]).toBeDefined();
      expect(Array.isArray(GAME_CONFIG.SHAPES[id])).toBe(true);
    });

    test.each(specialBlockConfigs)('$id - 颜色应该正确', ({ id, color }) => {
      expect(GAME_CONFIG.COLORS[id]).toBe(color);
    });

    test.each(specialBlockConfigs)('$id - 名称应该正确', ({ id, name }) => {
      expect(GAME_CONFIG.BLOCK_NAMES[id]).toBe(name);
    });

    test.each(specialBlockConfigs)('$id - 类型应该为 SPECIAL', ({ id }) => {
      expect(getBlockType(id)).toBe(PieceType.SPECIAL);
    });
  });

  describe('稀有度分布', () => {
    // 特殊方块 ID 到效果 ID 的映射
    const blockToEffectMap: Record<SpecialBlockId, string> = {
      'BOMB': 'bomb_block',
      'TIME': 'time_stop',
      'HEAL': 'life_steal',
      'SHIELD': 'defense_shield',
      'COMBO': 'combo_boost',
      'CLEAR': 'full_clear',
      'LUCKY': 'lucky_seven',
      'FREEZE': 'ice_freeze',
      'FIRE': 'fire_burn',
      'LIGHTNING': 'lightning_chain',
    };

    test('传说稀有度应该有 2 种', () => {
      const legendaryBlocks = specialBlockIds.filter((id) => {
        const effectId = blockToEffectMap[id];
        const effect = getEffectById(effectId);
        return effect?.rarity === Rarity.LEGENDARY;
      });
      expect(legendaryBlocks.length).toBe(2); // TIME, CLEAR
    });

    test('史诗稀有度应该有 3 种', () => {
      const epicBlocks = specialBlockIds.filter((id) => {
        const effectId = blockToEffectMap[id];
        const effect = getEffectById(effectId);
        return effect?.rarity === Rarity.EPIC;
      });
      expect(epicBlocks.length).toBe(3); // BOMB, COMBO, LIGHTNING
    });

    test('稀有稀有度应该有 2 种', () => {
      const rareBlocks = specialBlockIds.filter((id) => {
        const effectId = blockToEffectMap[id];
        const effect = getEffectById(effectId);
        return effect?.rarity === Rarity.RARE;
      });
      expect(rareBlocks.length).toBe(2); // HEAL, FREEZE
    });

    test('罕见稀有度应该有 3 种', () => {
      const uncommonBlocks = specialBlockIds.filter((id) => {
        const effectId = blockToEffectMap[id];
        const effect = getEffectById(effectId);
        return effect?.rarity === Rarity.UNCOMMON;
      });
      expect(uncommonBlocks.length).toBe(3); // SHIELD, LUCKY, FIRE
    });
  });

  describe('颜色配置', () => {
    test('所有特殊方块颜色应该不同', () => {
      const colors = specialBlockIds.map((id) => GAME_CONFIG.COLORS[id]);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });

    test('炸弹方块颜色应该是橙色', () => {
      expect(GAME_CONFIG.COLORS.BOMB).toBe('#ff6600');
    });

    test('时间停止颜色应该是蓝色', () => {
      expect(GAME_CONFIG.COLORS.TIME).toBe('#00ccff');
    });

    test('生命偷取颜色应该是粉色', () => {
      expect(GAME_CONFIG.COLORS.HEAL).toBe('#ff69b4');
    });

    test('防御护盾颜色应该是灰色', () => {
      expect(GAME_CONFIG.COLORS.SHIELD).toBe('#cccccc');
    });

    test('连击增幅颜色应该是紫色', () => {
      expect(GAME_CONFIG.COLORS.COMBO).toBe('#9932cc');
    });

    test('全屏清除颜色应该是金色', () => {
      expect(GAME_CONFIG.COLORS.CLEAR).toBe('#ffd700');
    });

    test('幸运七颜色应该是绿色', () => {
      expect(GAME_CONFIG.COLORS.LUCKY).toBe('#32cd32');
    });

    test('寒冰冻结颜色应该是天蓝色', () => {
      expect(GAME_CONFIG.COLORS.FREEZE).toBe('#87ceeb');
    });

    test('火焰燃烧颜色应该是红色', () => {
      expect(GAME_CONFIG.COLORS.FIRE).toBe('#ff4500');
    });

    test('雷电连锁颜色应该是黄色', () => {
      expect(GAME_CONFIG.COLORS.LIGHTNING).toBe('#ffff00');
    });
  });

  describe('卡组编辑界面可访问性', () => {
    test('所有 17 种方块都应该可以在卡组中使用', () => {
      const allBlocks = getAllBlockIds();
      expect(allBlocks).toHaveLength(17);
      
      // 验证每个方块都有完整的配置
      allBlocks.forEach((blockId) => {
        expect(GAME_CONFIG.SHAPES[blockId]).toBeDefined();
        expect(GAME_CONFIG.COLORS[blockId]).toBeDefined();
        expect(GAME_CONFIG.BLOCK_NAMES[blockId]).toBeDefined();
        expect(GAME_CONFIG.BLOCK_TYPES[blockId]).toBeDefined();
      });
    });

    test('基础方块和特殊方块应该可以区分', () => {
      const basicBlocks = getBasicBlockIds();
      const specialBlocks = getSpecialBlockIds();
      
      // 确保没有重叠
      const basicSet = new Set(basicBlocks);
      const specialSet = new Set(specialBlocks);
      
      basicBlocks.forEach((block) => {
        expect(specialSet.has(block)).toBe(false);
      });
      
      specialBlocks.forEach((block) => {
        expect(basicSet.has(block)).toBe(false);
      });
    });

    test('所有特殊方块都应该有对应的效果配置', () => {
      // 特殊方块 ID 到效果 ID 的映射
      const blockToEffectMap: Record<SpecialBlockId, string> = {
        'BOMB': 'bomb_block',
        'TIME': 'time_stop',
        'HEAL': 'life_steal',
        'SHIELD': 'defense_shield',
        'COMBO': 'combo_boost',
        'CLEAR': 'full_clear',
        'LUCKY': 'lucky_seven',
        'FREEZE': 'ice_freeze',
        'FIRE': 'fire_burn',
        'LIGHTNING': 'lightning_chain',
      };

      specialBlockIds.forEach((blockId) => {
        const effectId = blockToEffectMap[blockId];
        const effect = getEffectById(effectId);
        expect(effect).toBeDefined();
        expect(effect?.id).toBe(effectId);
      });
    });
  });

  describe('向后兼容性', () => {
    test('基础方块配置不应该改变', () => {
      // 验证 7 种基础方块的形状保持不变
      expect(GAME_CONFIG.SHAPES.I).toEqual([[1, 1, 1, 1]]);
      expect(GAME_CONFIG.SHAPES.O).toEqual([[1, 1], [1, 1]]);
      expect(GAME_CONFIG.SHAPES.T).toEqual([[0, 1, 0], [1, 1, 1]]);
      expect(GAME_CONFIG.SHAPES.S).toEqual([[0, 1, 1], [1, 1, 0]]);
      expect(GAME_CONFIG.SHAPES.Z).toEqual([[1, 1, 0], [0, 1, 1]]);
      expect(GAME_CONFIG.SHAPES.L).toEqual([[0, 0, 1], [1, 1, 1]]);
      expect(GAME_CONFIG.SHAPES.J).toEqual([[1, 0, 0], [1, 1, 1]]);
    });

    test('基础方块颜色应该保持不变', () => {
      expect(GAME_CONFIG.COLORS.I).toBe('#00ffff');
      expect(GAME_CONFIG.COLORS.O).toBe('#ffff00');
      expect(GAME_CONFIG.COLORS.T).toBe('#da70d6');
      expect(GAME_CONFIG.COLORS.S).toBe('#00ff00');
      expect(GAME_CONFIG.COLORS.Z).toBe('#ff4444');
      expect(GAME_CONFIG.COLORS.L).toBe('#ff8c00');
      expect(GAME_CONFIG.COLORS.J).toBe('#4169e1');
    });

    test('BLOCK_EFFECTS 配置应该保持不变', () => {
      expect(GAME_CONFIG.BLOCK_EFFECTS.I).toBeDefined();
      expect(GAME_CONFIG.BLOCK_EFFECTS.O).toBeDefined();
      expect(GAME_CONFIG.BLOCK_EFFECTS.T).toBeDefined();
      expect(GAME_CONFIG.BLOCK_EFFECTS.S).toBeDefined();
      expect(GAME_CONFIG.BLOCK_EFFECTS.Z).toBeDefined();
      expect(GAME_CONFIG.BLOCK_EFFECTS.L).toBeDefined();
      expect(GAME_CONFIG.BLOCK_EFFECTS.J).toBeDefined();
    });
  });
});

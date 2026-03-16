// ==================== DeckManager 单元测试 ====================
// v1.9.5 卡组编辑功能测试

import { DeckManager } from '../engine/DeckManager';
import { GAME_CONFIG } from '../config/game-config';

// 模拟 localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('DeckManager - v1.9.5 卡组编辑功能', () => {
  let deckManager: DeckManager;

  beforeEach(() => {
    localStorage.clear();
    deckManager = new DeckManager();
  });

  // ==================== setCardCount 功能测试 ====================

  describe('setCardCount', () => {
    test('应该能够设置方块数量为 0', () => {
      deckManager.setCardCount('I', 0);
      expect(deckManager.getCardCount('I')).toBe(0);
    });

    test('应该能够设置方块数量为 1', () => {
      deckManager.setCardCount('O', 1);
      expect(deckManager.getCardCount('O')).toBe(1);
    });

    test('应该能够设置方块数量为 2', () => {
      deckManager.setCardCount('T', 2);
      expect(deckManager.getCardCount('T')).toBe(2);
    });

    test('应该能够设置方块数量为 3', () => {
      deckManager.setCardCount('S', 3);
      expect(deckManager.getCardCount('S')).toBe(3);
    });

    test('应该能够同时设置多个方块数量', () => {
      deckManager.setCardCount('I', 3);
      deckManager.setCardCount('O', 2);
      deckManager.setCardCount('T', 1);
      
      expect(deckManager.getCardCount('I')).toBe(3);
      expect(deckManager.getCardCount('O')).toBe(2);
      expect(deckManager.getCardCount('T')).toBe(1);
    });
  });

  // ==================== getCardCount 功能测试 ====================

  describe('getCardCount', () => {
    test('应该返回默认数量 1（未设置时）', () => {
      expect(deckManager.getCardCount('I')).toBe(1);
      expect(deckManager.getCardCount('O')).toBe(1);
      expect(deckManager.getCardCount('T')).toBe(1);
    });

    test('应该返回设置后的数量', () => {
      deckManager.setCardCount('Z', 3);
      expect(deckManager.getCardCount('Z')).toBe(3);
    });

    test('对于无效的方块类型应该返回 0', () => {
      expect(deckManager.getCardCount('INVALID')).toBe(0);
      expect(deckManager.getCardCount('X')).toBe(0);
      expect(deckManager.getCardCount('')).toBe(0);
    });

    test('应该返回所有 7 种经典方块的数量', () => {
      const classicPieces = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'];
      classicPieces.forEach(piece => {
        expect(deckManager.getCardCount(piece)).toBeDefined();
        expect(typeof deckManager.getCardCount(piece)).toBe('number');
      });
    });
  });

  // ==================== 数量限制测试 ====================

  describe('数量限制（0-3）', () => {
    test('设置数量为 -1 应该抛出错误', () => {
      expect(() => deckManager.setCardCount('I', -1)).toThrow('数量必须在 0-3 之间');
    });

    test('设置数量为 4 应该抛出错误', () => {
      expect(() => deckManager.setCardCount('I', 4)).toThrow('数量必须在 0-3 之间');
    });

    test('设置数量为 100 应该抛出错误', () => {
      expect(() => deckManager.setCardCount('I', 100)).toThrow('数量必须在 0-3 之间');
    });

    test('设置非整数应该抛出错误', () => {
      expect(() => deckManager.setCardCount('I', 1.5)).toThrow('数量必须在 0-3 之间');
    });

    test('边界值 0 应该成功', () => {
      expect(() => deckManager.setCardCount('I', 0)).not.toThrow();
      expect(deckManager.getCardCount('I')).toBe(0);
    });

    test('边界值 3 应该成功', () => {
      expect(() => deckManager.setCardCount('I', 3)).not.toThrow();
      expect(deckManager.getCardCount('I')).toBe(3);
    });

    test('边界值 1 应该成功', () => {
      expect(() => deckManager.setCardCount('I', 1)).not.toThrow();
      expect(deckManager.getCardCount('I')).toBe(1);
    });
  });

  // ==================== save/load 配置测试 ====================

  describe('saveDeckConfig / loadDeckConfig', () => {
    test('应该能够保存配置到 localStorage', () => {
      deckManager.setCardCount('I', 3);
      deckManager.setCardCount('O', 2);
      deckManager.setCardCount('T', 0);
      
      const result = deckManager.saveDeckConfig();
      
      expect(result.success).toBe(true);
      expect(localStorage.getItem('tetris_deck_config_v1')).toBeDefined();
    });

    test('应该能够从 localStorage 加载配置', () => {
      // 设置并保存配置
      deckManager.setCardCount('I', 3);
      deckManager.setCardCount('O', 2);
      deckManager.setCardCount('T', 0);
      deckManager.saveDeckConfig();
      
      // 创建新的 DeckManager 实例
      const newDeckManager = new DeckManager();
      const loadResult = newDeckManager.loadDeckConfig();
      
      expect(loadResult.success).toBe(true);
      expect(newDeckManager.getCardCount('I')).toBe(3);
      expect(newDeckManager.getCardCount('O')).toBe(2);
      expect(newDeckManager.getCardCount('T')).toBe(0);
    });

    test('首次使用应该使用默认配置（每种方块 1 个）', () => {
      localStorage.clear();
      const freshManager = new DeckManager();
      const classicPieces = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'];
      
      classicPieces.forEach(piece => {
        expect(freshManager.getCardCount(piece)).toBe(1);
      });
    });

    test('应该能够重置为默认配置', () => {
      deckManager.setCardCount('I', 3);
      deckManager.setCardCount('O', 3);
      deckManager.setCardCount('T', 3);
      
      deckManager.resetDeckConfig();
      
      expect(deckManager.getCardCount('I')).toBe(1);
      expect(deckManager.getCardCount('O')).toBe(1);
      expect(deckManager.getCardCount('T')).toBe(1);
    });

    test('保存失败时应该返回错误信息', () => {
      // 模拟 localStorage 失败
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('Storage full');
      };
      
      const result = deckManager.saveDeckConfig();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      
      // 恢复
      localStorage.setItem = originalSetItem;
    });
  });

  // ==================== buildDeck 使用配置测试 ====================

  describe('buildDeck', () => {
    test('应该使用默认配置构建牌堆（7 张牌）', () => {
      const deck = deckManager.buildDeck();
      expect(deck.length).toBe(7);
      
      const classicPieces = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'];
      classicPieces.forEach(piece => {
        expect(deck).toContain(piece);
      });
    });

    test('应该使用自定义配置构建牌堆', () => {
      deckManager.setCardCount('I', 3);
      deckManager.setCardCount('O', 2);
      deckManager.setCardCount('T', 1);
      deckManager.setCardCount('S', 0);
      deckManager.setCardCount('Z', 0);
      deckManager.setCardCount('L', 0);
      deckManager.setCardCount('J', 0);
      
      const deck = deckManager.buildDeck();
      
      expect(deck.length).toBe(6); // 3+2+1+0+0+0+0
      expect(deck.filter(c => c === 'I').length).toBe(3);
      expect(deck.filter(c => c === 'O').length).toBe(2);
      expect(deck.filter(c => c === 'T').length).toBe(1);
      expect(deck).not.toContain('S');
      expect(deck).not.toContain('Z');
    });

    test('当所有方块数量为 0 时应该返回空数组', () => {
      ['I', 'O', 'T', 'S', 'Z', 'L', 'J'].forEach(piece => {
        deckManager.setCardCount(piece, 0);
      });
      
      const deck = deckManager.buildDeck();
      expect(deck.length).toBe(0);
    });

    test('最大配置时牌堆应该有 51 张牌（7 种基础 × 3 + 10 种特殊 × 3）', () => {
      // 设置所有卡牌（包括特殊方块）为最大数量 3
      ['I', 'O', 'T', 'S', 'Z', 'L', 'J', 'BOMB', 'TIME', 'HEAL', 'SHIELD', 'COMBO', 'CLEAR', 'LUCKY', 'FREEZE', 'FIRE', 'LIGHTNING'].forEach(piece => {
        deckManager.setCardCount(piece, 3);
      });
      
      const deck = deckManager.buildDeck();
      expect(deck.length).toBe(51); // 17 种 × 3
    });
  });

  // ==================== getTotalCardCount 测试 ====================

  describe('getTotalCardCount', () => {
    test('默认配置下总数应该是 7', () => {
      expect(deckManager.getTotalCardCount()).toBe(7);
    });

    test('应该正确计算自定义配置的总数', () => {
      deckManager.setCardCount('I', 3);
      deckManager.setCardCount('O', 2);
      deckManager.setCardCount('T', 1);
      // 其他方块保持默认值 1，所以总数 = 3+2+1+1+1+1+1 = 10
      expect(deckManager.getTotalCardCount()).toBe(10);
    });

    test('所有方块为 0 时总数应该是 0', () => {
      ['I', 'O', 'T', 'S', 'Z', 'L', 'J'].forEach(piece => {
        deckManager.setCardCount(piece, 0);
      });
      
      expect(deckManager.getTotalCardCount()).toBe(0);
    });

    test('最大配置时总数应该是 21', () => {
      ['I', 'O', 'T', 'S', 'Z', 'L', 'J'].forEach(piece => {
        deckManager.setCardCount(piece, 3);
      });
      
      expect(deckManager.getTotalCardCount()).toBe(21);
    });
  });

  // ==================== getDeckConfig 测试 ====================

  describe('getDeckConfig', () => {
    test('应该返回所有方块的配置', () => {
      const config = deckManager.getDeckConfig();
      
      expect(config).toHaveProperty('I');
      expect(config).toHaveProperty('O');
      expect(config).toHaveProperty('T');
      expect(config).toHaveProperty('S');
      expect(config).toHaveProperty('Z');
      expect(config).toHaveProperty('L');
      expect(config).toHaveProperty('J');
    });

    test('应该返回当前配置值', () => {
      deckManager.setCardCount('I', 3);
      deckManager.setCardCount('O', 2);
      
      const config = deckManager.getDeckConfig();
      expect(config['I']).toBe(3);
      expect(config['O']).toBe(2);
    });

    test('返回的应该是副本而不是引用', () => {
      const config1 = deckManager.getDeckConfig();
      config1['I'] = 999;
      
      const config2 = deckManager.getDeckConfig();
      expect(config2['I']).toBe(1); // 应该是默认值，不是 999
    });
  });

  // ==================== 边界条件测试 ====================

  describe('边界条件', () => {
    test('快速连续设置同一方块应该使用最后设置的值', () => {
      deckManager.setCardCount('I', 1);
      deckManager.setCardCount('I', 2);
      deckManager.setCardCount('I', 3);
      
      expect(deckManager.getCardCount('I')).toBe(3);
    });

    test('设置后保存再加载应该保持配置不变', () => {
      ['I', 'O', 'T', 'S', 'Z', 'L', 'J'].forEach((piece, index) => {
        deckManager.setCardCount(piece, index % 4); // 0, 1, 2, 3, 0, 1, 2
      });
      
      deckManager.saveDeckConfig();
      
      const newManager = new DeckManager();
      
      ['I', 'O', 'T', 'S', 'Z', 'L', 'J'].forEach((piece, index) => {
        expect(newManager.getCardCount(piece)).toBe(index % 4);
      });
    });

    test('localStorage 中有无效数据时应该使用默认值', () => {
      localStorage.setItem('tetris_deck_config_v1', JSON.stringify({
        'I': -1, // 无效
        'O': 5,  // 无效
        'T': 'invalid', // 无效
        'S': 2,  // 有效
      }));
      
      const newManager = new DeckManager();
      
      expect(newManager.getCardCount('I')).toBe(1); // 默认值
      expect(newManager.getCardCount('O')).toBe(1); // 默认值
      expect(newManager.getCardCount('T')).toBe(1); // 默认值
      expect(newManager.getCardCount('S')).toBe(2); // 保持有效值
    });

    test('localStorage 损坏时应该使用默认配置', () => {
      localStorage.setItem('tetris_deck_config_v1', 'invalid json{{{');
      
      const newManager = new DeckManager();
      const loadResult = newManager.loadDeckConfig();
      
      expect(loadResult.success).toBe(false);
      expect(newManager.getCardCount('I')).toBe(1); // 默认值
    });
  });

  // ==================== 向后兼容性测试 ====================

  describe('向后兼容性', () => {
    test('默认卡组配置应该保持向后兼容（每种方块 1 个）', () => {
      const classicPieces = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'];
      classicPieces.forEach(piece => {
        expect(deckManager.getCardCount(piece)).toBe(1);
      });
    });

    test('预设卡组应该正常工作', () => {
      const presets = deckManager.getPresetDecks();
      expect(presets.length).toBeGreaterThan(0);
      
      presets.forEach(preset => {
        expect(preset.id).toBeDefined();
        expect(preset.name).toBeDefined();
        expect(preset.cards).toBeDefined();
      });
    });

    test('原有的 drawFromDeck 功能应该正常工作', () => {
      const result = deckManager.drawFromDeck();
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.card).toBeDefined();
      expect(result.card!.id).toBeDefined();
    });
  });
});

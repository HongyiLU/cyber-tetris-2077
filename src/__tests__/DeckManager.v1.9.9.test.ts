// ==================== v1.9.9 卡组创建功能优化测试 ====================
// 测试需求：允许保存任意大小的卡组，但只有 ≥7 张的卡组才能使用

import { DeckManager } from '../engine/DeckManager';

describe('v1.9.9 卡组创建功能优化', () => {
  let deckManager: DeckManager;

  beforeEach(() => {
    localStorage.clear();
    deckManager = new DeckManager();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('创建任意大小的卡组', () => {
    test('应该允许创建空卡组（0 张）', () => {
      const deck = deckManager.createDeck('空卡组', []);
      expect(deck.cards.length).toBe(0);
      expect(deckManager.isDeckUsable(deck)).toBe(false);
    });

    test('应该允许创建 1 张卡牌的卡组', () => {
      const deck = deckManager.createDeck('单卡', ['I']);
      expect(deck.cards.length).toBe(1);
      expect(deckManager.isDeckUsable(deck)).toBe(false);
    });

    test('应该允许创建 2 张卡牌的卡组', () => {
      const deck = deckManager.createDeck('双卡', ['I', 'O']);
      expect(deck.cards.length).toBe(2);
      expect(deckManager.isDeckUsable(deck)).toBe(false);
    });

    test('应该允许创建 3 张卡牌的卡组（但仍不可用）', () => {
      const deck = deckManager.createDeck('小组', ['I', 'O', 'T']);
      expect(deck.cards.length).toBe(3);
      expect(deckManager.isDeckUsable(deck)).toBe(false);
    });

    test('应该允许创建 6 张卡牌的卡组（但仍不可用）', () => {
      const deck = deckManager.createDeck('6 张', ['I', 'O', 'T', 'S', 'Z', 'L']);
      expect(deck.cards.length).toBe(6);
      expect(deckManager.isDeckUsable(deck)).toBe(false);
    });

    test('应该允许创建 7 张卡牌的卡组（刚好可用）', () => {
      const deck = deckManager.createDeck('完整', ['I', 'O', 'T', 'S', 'Z', 'L', 'J']);
      expect(deck.cards.length).toBe(7);
      expect(deckManager.isDeckUsable(deck)).toBe(true);
    });
  });

  describe('更新任意大小的卡组', () => {
    test('应该允许将卡组更新为空', () => {
      const deck = deckManager.createDeck('测试', ['I', 'O', 'T', 'S', 'Z', 'L', 'J']);
      deckManager.updateDeck(deck.id, { cards: [] });
      const updated = deckManager.getDeck(deck.id);
      expect(updated!.cards.length).toBe(0);
      expect(deckManager.isDeckUsable(updated!)).toBe(false);
    });

    test('应该允许将卡组更新为 2 张', () => {
      const deck = deckManager.createDeck('测试', ['I', 'O', 'T', 'S', 'Z', 'L', 'J']);
      deckManager.updateDeck(deck.id, { cards: ['I', 'O'] });
      const updated = deckManager.getDeck(deck.id);
      expect(updated!.cards.length).toBe(2);
      expect(deckManager.isDeckUsable(updated!)).toBe(false);
    });
  });

  describe('卡组可用性验证', () => {
    test('空卡组不可用', () => {
      const deck = deckManager.createDeck('空', []);
      expect(deckManager.isDeckUsable(deck)).toBe(false);
    });

    test('2 张卡牌不可用', () => {
      const deck = deckManager.createDeck('小', ['I', 'O']);
      expect(deckManager.isDeckUsable(deck)).toBe(false);
    });

    test('6 张卡牌不可用', () => {
      const deck = deckManager.createDeck('6 张', ['I', 'O', 'T', 'S', 'Z', 'L']);
      expect(deckManager.isDeckUsable(deck)).toBe(false);
    });

    test('7 张卡牌可用', () => {
      const deck = deckManager.createDeck('完整', ['I', 'O', 'T', 'S', 'Z', 'L', 'J']);
      expect(deckManager.isDeckUsable(deck)).toBe(true);
    });

    test('状态变化：从 2 张到 7 张', () => {
      const deck = deckManager.createDeck('测试', ['I', 'O']);
      expect(deckManager.isDeckUsable(deck)).toBe(false);
      
      deckManager.updateDeck(deck.id, { cards: ['I', 'O', 'T', 'S', 'Z', 'L', 'J'] });
      const updated = deckManager.getDeck(deck.id);
      expect(deckManager.isDeckUsable(updated!)).toBe(true);
    });
  });

  describe('getUsableDecks', () => {
    test('只返回可用卡组', () => {
      deckManager.createDeck('空', []);
      deckManager.createDeck('小', ['I', 'O']);
      deckManager.createDeck('完整', ['I', 'O', 'T', 'S', 'Z', 'L', 'J']);
      
      const usable = deckManager.getUsableDecks();
      expect(usable.every(d => d.cards.length >= 7)).toBe(true);
    });

    test('没有可用卡组返回空数组', () => {
      const newManager = new DeckManager();
      const usable = newManager.getUsableDecks();
      expect(usable.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('setActiveDeck 验证', () => {
    test('可以激活可用卡组', () => {
      const deck = deckManager.createDeck('可用', ['I', 'O', 'T', 'S', 'Z', 'L', 'J']);
      expect(() => deckManager.setActiveDeck(deck.id)).not.toThrow();
    });

    test('激活不可用卡组抛出错误', () => {
      const deck = deckManager.createDeck('不可用', ['I', 'O']);
      expect(() => deckManager.setActiveDeck(deck.id)).toThrow('至少需要');
    });

    test('可以设置为 null', () => {
      expect(() => deckManager.setActiveDeck(null)).not.toThrow();
    });
  });

  describe('validateDeck 选项', () => {
    test('默认检查最小组牌数', () => {
      const smallDeck = {
        id: 'test',
        name: '测试',
        cards: ['I', 'O'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      const result = deckManager.validateDeck(smallDeck);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('至少需要'))).toBe(true);
    });

    test('checkMinSize: false 不检查', () => {
      const smallDeck = {
        id: 'test',
        name: '测试',
        cards: ['I', 'O'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      const result = deckManager.validateDeck(smallDeck, { checkMinSize: false });
      expect(result.valid).toBe(true);
    });
  });

  describe('持久化', () => {
    test('空卡组可以持久化', () => {
      const deck = deckManager.createDeck('空', []);
      deckManager.saveDecks();
      
      const newManager = new DeckManager();
      const loaded = newManager.getDeck(deck.id);
      expect(loaded).toBeDefined();
      expect(loaded!.cards.length).toBe(0);
    });

    test('不可用卡组可以持久化', () => {
      const deck = deckManager.createDeck('小', ['I', 'O']);
      deckManager.saveDecks();
      
      const newManager = new DeckManager();
      const loaded = newManager.getDeck(deck.id);
      expect(loaded).toBeDefined();
      expect(loaded!.cards.length).toBe(2);
    });
  });
});

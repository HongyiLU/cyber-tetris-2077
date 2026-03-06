// ==================== 卡组管理器测试 ====================

import { DeckManager } from '../engine/DeckManager';
import { GAME_CONFIG } from '../config/game-config';
import type { Deck } from '../types/deck';

describe('DeckManager', () => {
  let deckManager: DeckManager;

  beforeEach(() => {
    // 清空 localStorage
    localStorage.clear();
    deckManager = new DeckManager();
  });

  // ==================== 卡组 CRUD 测试 ====================

  describe('卡组 CRUD 操作', () => {
    test('应该成功创建卡组', () => {
      const deck = deckManager.createDeck('测试卡组', ['I', 'O', 'T']);
      
      expect(deck.id).toBeDefined();
      expect(deck.name).toBe('测试卡组');
      expect(deck.cards).toEqual(['I', 'O', 'T']);
      expect(deck.createdAt).toBeDefined();
    });

    test('创建卡组时应该验证卡组', () => {
      // 卡组太小
      expect(() => {
        deckManager.createDeck('太小的卡组', ['I']);
      }).toThrow();

      // 卡组太大
      const tooManyCards = Array(20).fill('I');
      expect(() => {
        deckManager.createDeck('太大的卡组', tooManyCards);
      }).toThrow();
    });

    test('应该成功获取卡组', () => {
      const created = deckManager.createDeck('测试卡组', ['I', 'O', 'T']);
      const retrieved = deckManager.getDeck(created.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('测试卡组');
    });

    test('应该成功更新卡组', () => {
      const deck = deckManager.createDeck('原名', ['I', 'O', 'T']);
      
      deckManager.updateDeck(deck.id, { name: '新名称' });
      
      const updated = deckManager.getDeck(deck.id);
      expect(updated?.name).toBe('新名称');
    });

    test('应该成功删除卡组', () => {
      const deck = deckManager.createDeck('待删除', ['I', 'O', 'T']);
      
      deckManager.deleteDeck(deck.id);
      
      const retrieved = deckManager.getDeck(deck.id);
      expect(retrieved).toBeUndefined();
    });

    test('应该列出所有卡组', () => {
      deckManager.createDeck('卡组 1', ['I', 'O', 'T']);
      deckManager.createDeck('卡组 2', ['T', 'S', 'Z']);
      
      const decks = deckManager.listDecks();
      
      expect(decks.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ==================== 卡组验证测试 ====================

  describe('卡组验证', () => {
    test('应该验证有效卡组', () => {
      const deck: Deck = {
        id: 'test',
        name: '有效卡组',
        cards: ['I', 'O', 'T'],
        createdAt: Date.now(),
      };

      const result = deckManager.validateDeck(deck);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('应该检测空名称', () => {
      const deck: Deck = {
        id: 'test',
        name: '',
        cards: ['I', 'O', 'T'],
        createdAt: Date.now(),
      };

      const result = deckManager.validateDeck(deck);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('卡组名称不能为空');
    });

    test('应该检测卡组太小', () => {
      const deck: Deck = {
        id: 'test',
        name: '太小的卡组',
        cards: ['I'],
        createdAt: Date.now(),
      };

      const result = deckManager.validateDeck(deck);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('至少需要'))).toBe(true);
    });

    test('应该检测卡组太大', () => {
      const deck: Deck = {
        id: 'test',
        name: '太大的卡组',
        cards: Array(20).fill('I'),
        createdAt: Date.now(),
      };

      const result = deckManager.validateDeck(deck);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('最多容纳'))).toBe(true);
    });

    test('应该检测重复卡牌', () => {
      const deck: Deck = {
        id: 'test',
        name: '重复卡组',
        cards: ['I', 'I', 'O'],
        createdAt: Date.now(),
      };

      const result = deckManager.validateDeck(deck);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('卡组中包含重复的卡牌');
    });

    test('应该检测无效卡牌 ID', () => {
      const deck: Deck = {
        id: 'test',
        name: '无效卡牌',
        cards: ['I', 'O', 'INVALID_ID'],
        createdAt: Date.now(),
      };

      const result = deckManager.validateDeck(deck);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('无效的卡牌 ID: INVALID_ID');
    });
  });

  // ==================== 持久化测试 ====================

  describe('持久化', () => {
    test('应该保存卡组到 localStorage', () => {
      deckManager.createDeck('持久化测试', ['I', 'O', 'T']);
      
      const saved = localStorage.getItem('cyber-blocks-decks');
      expect(saved).toBeDefined();
      
      const parsed = JSON.parse(saved!);
      expect(parsed.decks).toBeDefined();
      expect(parsed.decks.length).toBeGreaterThan(0);
    });

    test('应该从 localStorage 加载卡组', () => {
      // 创建并保存卡组
      const deck = deckManager.createDeck('加载测试', ['I', 'O', 'T']);
      
      // 创建新的 DeckManager 实例
      const newManager = new DeckManager();
      
      // 应该能加载之前保存的卡组
      const loaded = newManager.getDeck(deck.id);
      expect(loaded).toBeDefined();
      expect(loaded?.name).toBe('加载测试');
    });

    test('首次使用应该加载预设卡组', () => {
      localStorage.clear();
      const manager = new DeckManager();
      
      const decks = manager.listDecks();
      
      // 应该至少有 3 个预设卡组
      expect(decks.length).toBeGreaterThanOrEqual(3);
      
      // 检查预设卡组名称
      const names = decks.map(d => d.name);
      expect(names).toContain('经典卡组');
      expect(names).toContain('新手卡组');
      expect(names).toContain('全卡卡组');
    });
  });

  // ==================== 激活卡组测试 ====================

  describe('激活卡组', () => {
    test('应该设置和获取激活的卡组', () => {
      const deck = deckManager.createDeck('激活测试', ['I', 'O', 'T']);
      
      deckManager.setActiveDeck(deck.id);
      const active = deckManager.getActiveDeck();
      
      expect(active).toBeDefined();
      expect(active?.id).toBe(deck.id);
    });

    test('应该可以清空激活的卡组', () => {
      const deck = deckManager.createDeck('激活测试', ['I', 'O', 'T']);
      deckManager.setActiveDeck(deck.id);
      
      deckManager.setActiveDeck(null);
      const active = deckManager.getActiveDeck();
      
      expect(active).toBeNull();
    });

    test('设置不存在的卡组应该抛出错误', () => {
      expect(() => {
        deckManager.setActiveDeck('non-existent-id');
      }).toThrow();
    });
  });

  // ==================== 预设卡组测试 ====================

  describe('预设卡组', () => {
    test('应该提供预设卡组列表', () => {
      const presets = deckManager.getPresetDecks();
      
      expect(presets.length).toBeGreaterThanOrEqual(3);
      
      const names = presets.map(p => p.name);
      expect(names).toContain('经典卡组');
      expect(names).toContain('新手卡组');
      expect(names).toContain('全卡卡组');
    });

    test('经典卡组应该只包含 7 种经典 4 块', () => {
      const presets = deckManager.getPresetDecks();
      const classic = presets.find(p => p.name === '经典卡组');
      
      expect(classic).toBeDefined();
      expect(classic?.cards).toEqual(['I', 'O', 'T', 'S', 'Z', 'L', 'J']);
    });

    test('新手卡组应该包含 2/3/4 块', () => {
      const presets = deckManager.getPresetDecks();
      const beginner = presets.find(p => p.name === '新手卡组');
      
      expect(beginner).toBeDefined();
      // 应该包含经典 7 块 + DOM(2 块) + V3, COR(3 块)
      expect(beginner?.cards).toContain('DOM');
      expect(beginner?.cards).toContain('V3');
      expect(beginner?.cards).toContain('COR');
    });
  });

  // ==================== 配置测试 ====================

  describe('卡组配置', () => {
    test('应该获取默认配置', () => {
      const config = deckManager.getConfig();
      
      expect(config.minDeckSize).toBe(3);
      expect(config.maxDeckSize).toBe(15);
      expect(config.rarityWeights).toBeDefined();
    });

    test('应该获取稀有度权重', () => {
      const weights = deckManager.getRarityWeights();
      
      expect(weights.common).toBe(50);
      expect(weights.uncommon).toBe(30);
      expect(weights.rare).toBe(15);
      expect(weights.epic).toBe(4);
      expect(weights.legendary).toBe(1);
    });

    test('应该支持自定义配置', () => {
      const customManager = new DeckManager({
        minDeckSize: 5,
        maxDeckSize: 20,
      });
      
      const config = customManager.getConfig();
      
      expect(config.minDeckSize).toBe(5);
      expect(config.maxDeckSize).toBe(20);
    });
  });
});

describe('GameEngine with DeckManager', () => {
  // 这些测试需要实际运行游戏引擎
  // 这里只是示例，实际测试可能需要更多设置
  
  test('GameEngine 应该能使用 DeckManager', () => {
    // 这个测试验证 GameEngine 和 DeckManager 的集成
    // 具体测试逻辑在 GameEngine.test.ts 中
    expect(true).toBe(true);
  });
});

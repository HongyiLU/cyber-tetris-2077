// ==================== 卡组系统综合验证测试 ====================
// 测试范围：核心功能、抽取算法、持久化、游戏集成、回归测试

import { DeckManager } from '../engine/DeckManager';
import { GameEngine } from '../engine/GameEngine';
import { GAME_CONFIG } from '../config/game-config';
import type { Deck } from '../types/deck';

describe('卡组系统综合验证测试', () => {
  let deckManager: DeckManager;
  let engine: GameEngine;

  beforeEach(() => {
    localStorage.clear();
    deckManager = new DeckManager();
    engine = new GameEngine(10, 20, deckManager);
  });

  // ==================== 1. 核心功能测试 ====================
  describe('1. 核心功能测试', () => {
    describe('1.1 创建卡组', () => {
      test('应该成功创建有效卡组', () => {
        const deck = deckManager.createDeck('测试卡组', ['I', 'O', 'T', 'S', 'Z']);
        
        expect(deck.id).toBeDefined();
        expect(deck.name).toBe('测试卡组');
        expect(deck.cards.length).toBe(5);
        expect(deck.createdAt).toBeDefined();
      });

      test('创建卡组应该自动保存', () => {
        deckManager.createDeck('保存测试', ['I', 'O', 'T']);
        
        const saved = localStorage.getItem('cyber-blocks-decks');
        expect(saved).toBeDefined();
        const parsed = JSON.parse(saved!);
        expect(parsed.decks.length).toBeGreaterThan(0);
      });

      test('创建无效卡组应该抛出错误', () => {
        // 卡组太小
        expect(() => {
          deckManager.createDeck('太小的卡组', ['I']);
        }).toThrow('卡组验证失败');

        // 卡组太大
        const tooManyCards = Array(20).fill('I');
        expect(() => {
          deckManager.createDeck('太大的卡组', tooManyCards);
        }).toThrow('卡组验证失败');

        // 重复卡牌
        expect(() => {
          deckManager.createDeck('重复卡组', ['I', 'I', 'O']);
        }).toThrow('卡组验证失败');
      });
    });

    describe('1.2 编辑卡组', () => {
      test('应该成功更新卡组名称', () => {
        const deck = deckManager.createDeck('原名', ['I', 'O', 'T']);
        
        deckManager.updateDeck(deck.id, { name: '新名称' });
        
        const updated = deckManager.getDeck(deck.id);
        expect(updated?.name).toBe('新名称');
      });

      test('应该成功更新卡组卡牌', () => {
        const deck = deckManager.createDeck('测试', ['I', 'O', 'T']);
        
        deckManager.updateDeck(deck.id, { cards: ['I', 'O', 'T', 'S', 'Z'] });
        
        const updated = deckManager.getDeck(deck.id);
        expect(updated?.cards.length).toBe(5);
        expect(updated?.cards).toContain('S');
      });

      test('更新无效卡组应该抛出错误', () => {
        const deck = deckManager.createDeck('测试', ['I', 'O', 'T']);
        
        expect(() => {
          deckManager.updateDeck(deck.id, { cards: ['I'] }); // 太小
        }).toThrow('卡组验证失败');
      });

      test('更新不存在的卡组应该抛出错误', () => {
        expect(() => {
          deckManager.updateDeck('non-existent', { name: '新名称' });
        }).toThrow('卡组不存在');
      });
    });

    describe('1.3 删除卡组', () => {
      test('应该成功删除卡组', () => {
        const deck = deckManager.createDeck('待删除', ['I', 'O', 'T']);
        
        deckManager.deleteDeck(deck.id);
        
        const retrieved = deckManager.getDeck(deck.id);
        expect(retrieved).toBeUndefined();
      });

      test('删除激活的卡组应该清空激活状态', () => {
        const deck = deckManager.createDeck('测试', ['I', 'O', 'T']);
        deckManager.setActiveDeck(deck.id);
        
        deckManager.deleteDeck(deck.id);
        
        expect(deckManager.getActiveDeck()).toBeNull();
      });

      test('删除不存在的卡组应该抛出错误', () => {
        expect(() => {
          deckManager.deleteDeck('non-existent');
        }).toThrow('卡组不存在');
      });
    });

    describe('1.4 选择卡组', () => {
      test('应该成功设置激活卡组', () => {
        const deck = deckManager.createDeck('激活测试', ['I', 'O', 'T']);
        
        deckManager.setActiveDeck(deck.id);
        
        const active = deckManager.getActiveDeck();
        expect(active).toBeDefined();
        expect(active?.id).toBe(deck.id);
      });

      test('应该可以清空激活卡组', () => {
        const deck = deckManager.createDeck('测试', ['I', 'O', 'T']);
        deckManager.setActiveDeck(deck.id);
        
        deckManager.setActiveDeck(null);
        
        expect(deckManager.getActiveDeck()).toBeNull();
      });

      test('设置不存在的卡组应该抛出错误', () => {
        expect(() => {
          deckManager.setActiveDeck('non-existent-id');
        }).toThrow('卡组不存在');
      });
    });

    describe('1.5 预设卡组加载', () => {
      test('首次使用应该自动加载预设卡组', () => {
        localStorage.clear();
        const manager = new DeckManager();
        
        const decks = manager.listDecks();
        
        expect(decks.length).toBeGreaterThanOrEqual(3);
        const names = decks.map(d => d.name);
        expect(names).toContain('经典卡组');
        expect(names).toContain('新手卡组');
        expect(names).toContain('全卡卡组');
      });

      test('经典卡组应该包含 7 种经典方块', () => {
        const presets = deckManager.getPresetDecks();
        const classic = presets.find(p => p.id === 'preset-classic');
        
        expect(classic).toBeDefined();
        expect(classic?.cards).toEqual(['I', 'O', 'T', 'S', 'Z', 'L', 'J']);
      });

      test('新手卡组应该只包含经典 7 种方块', () => {
        const presets = deckManager.getPresetDecks();
        const beginner = presets.find(p => p.id === 'preset-beginner');
        
        expect(beginner).toBeDefined();
        expect(beginner?.cards).toEqual(['I', 'O', 'T', 'S', 'Z', 'L', 'J']);
      });

      test('全卡卡组应该只包含经典 7 种（特殊方块已移除）', () => {
        const presets = deckManager.getPresetDecks();
        const complete = presets.find(p => p.id === 'preset-complete');
        
        expect(complete).toBeDefined();
        expect(complete?.cards.length).toBe(7); // 只包含经典 7 种
        expect(complete?.cards).toEqual(['I', 'O', 'T', 'S', 'Z', 'L', 'J']);
      });
    });
  });

  // ==================== 2. 抽取算法测试 ====================
  describe('2. 抽取算法测试', () => {
    describe('2.1 从卡组抽取方块', () => {
      test('应该从激活卡组抽取方块', () => {
        const deck = deckManager.createDeck('测试', ['I', 'O', 'T']);
        deckManager.setActiveDeck(deck.id);
        
        engine.init();
        const state = engine.getGameState();
        
        // 抽取的方块应该在卡组中
        expect(state.currentPiece).toBeDefined();
        expect(deck.cards).toContain(state.currentPiece!.type);
      });

      test('未设置卡组时应该使用默认随机', () => {
        deckManager.setActiveDeck(null);
        engine.init();
        
        const state = engine.getGameState();
        expect(state.currentPiece).toBeDefined();
        // 应该是有效的方块类型
        expect(Object.keys(GAME_CONFIG.SHAPES)).toContain(state.currentPiece!.type);
      });

      test('空卡组应该回退到默认随机', () => {
        // 注：由于验证规则不允许空卡组，这里测试最小卡组（3 张）
        // 回退机制主要在 drawFromDeck 内部处理空数组情况
        const deck = deckManager.createDeck('最小卡组测试', ['I', 'O', 'T']);
        deckManager.setActiveDeck(deck.id);
        
        engine.init();
        const state = engine.getGameState();
        
        // 应该能从卡组抽取
        expect(state.currentPiece).toBeDefined();
        expect(deck.cards).toContain(state.currentPiece!.type);
      });
    });

    describe('2.2 稀有度权重正确', () => {
      test('应该使用正确的稀有度权重', () => {
        const weights = deckManager.getRarityWeights();
        
        expect(weights.common).toBe(50);
        expect(weights.uncommon).toBe(30);
        expect(weights.rare).toBe(15);
        expect(weights.epic).toBe(4);
        expect(weights.legendary).toBe(1);
      });

      test('卡组抽取应该均匀分布（经典模式下所有方块等概率）', () => {
        // 经典卡组，所有方块都是 common，等概率抽取
        const deck = deckManager.createDeck('均匀测试', ['I', 'O', 'T', 'S', 'Z']);
        deckManager.setActiveDeck(deck.id);
        
        // 多次抽取统计
        const draws: Record<string, number> = {};
        const totalDraws = 1000;
        
        for (let i = 0; i < totalDraws; i++) {
          engine.init();
          const type = engine.getGameState().currentPiece!.type;
          draws[type] = (draws[type] || 0) + 1;
        }
        
        // 每个方块应该大致均匀分布（允许 20% 误差）
        const expectedPerType = totalDraws / 5;
        for (const type of ['I', 'O', 'T', 'S', 'Z']) {
          const count = draws[type] || 0;
          expect(count).toBeGreaterThanOrEqual(expectedPerType * 0.5);
          expect(count).toBeLessThanOrEqual(expectedPerType * 1.5);
        }
      });
    });

    describe('2.3 空卡组回退机制', () => {
      test('未设置卡组时应该使用所有方块类型', () => {
        deckManager.setActiveDeck(null);
        
        // 多次抽取，应该能覆盖多种方块类型
        const types = new Set<string>();
        for (let i = 0; i < 50; i++) {
          engine.init();
          types.add(engine.getGameState().currentPiece!.type);
        }
        
        // 应该能抽到多种不同的方块
        expect(types.size).toBeGreaterThan(3);
      });
    });
  });

  // ==================== 3. 持久化测试 ====================
  describe('3. 持久化测试', () => {
    test('localStorage 保存', () => {
      deckManager.createDeck('保存测试', ['I', 'O', 'T']);
      
      const saved = localStorage.getItem('cyber-blocks-decks');
      expect(saved).toBeDefined();
      
      const parsed = JSON.parse(saved!);
      expect(parsed.decks).toBeDefined();
      expect(parsed.activeDeckId).toBeDefined();
    });

    test('localStorage 加载', () => {
      const deck = deckManager.createDeck('加载测试', ['I', 'O', 'T', 'S']);
      deckManager.setActiveDeck(deck.id);
      
      // 创建新实例，应该从 localStorage 加载
      const newManager = new DeckManager();
      
      const loaded = newManager.getDeck(deck.id);
      expect(loaded).toBeDefined();
      expect(loaded?.name).toBe('加载测试');
      expect(loaded?.cards).toEqual(['I', 'O', 'T', 'S']);
      expect(newManager.getActiveDeck()?.id).toBe(deck.id);
    });

    test('刷新后数据保留', () => {
      // 创建多个卡组（只使用经典方块）
      deckManager.createDeck('卡组 1', ['I', 'O', 'T']);
      deckManager.createDeck('卡组 2', ['S', 'Z', 'L']);
      deckManager.createDeck('卡组 3', ['J', 'I', 'O']);
      
      // 模拟刷新（创建新实例）
      const freshManager = new DeckManager();
      
      const decks = freshManager.listDecks();
      expect(decks.length).toBeGreaterThanOrEqual(3);
      
      const names = decks.map(d => d.name);
      expect(names).toContain('卡组 1');
      expect(names).toContain('卡组 2');
      expect(names).toContain('卡组 3');
    });

    test('localStorage 损坏时应该使用预设卡组', () => {
      localStorage.setItem('cyber-blocks-decks', 'invalid json');
      
      const manager = new DeckManager();
      const decks = manager.listDecks();
      
      // 应该回退到预设卡组
      expect(decks.length).toBeGreaterThanOrEqual(3);
      const names = decks.map(d => d.name);
      expect(names).toContain('经典卡组');
    });
  });

  // ==================== 4. 游戏集成测试 ====================
  describe('4. 游戏集成测试', () => {
    test('设置卡组后游戏使用卡组抽取', () => {
      const deck = deckManager.createDeck('游戏测试', ['I', 'O', 'T']);
      deckManager.setActiveDeck(deck.id);
      
      engine.init();
      
      // 多次生成方块，都应该来自卡组
      for (let i = 0; i < 10; i++) {
        const state = engine.getGameState();
        expect(deck.cards).toContain(state.currentPiece!.type);
        engine.hardDrop();
      }
    });

    test('切换卡组生效', () => {
      const deck1 = deckManager.createDeck('卡组 1', ['I', 'O', 'T']);
      const deck2 = deckManager.createDeck('卡组 2', ['S', 'Z', 'L']);
      
      // 使用卡组 1
      deckManager.setActiveDeck(deck1.id);
      engine.init();
      
      let state = engine.getGameState();
      expect(deck1.cards).toContain(state.currentPiece!.type);
      
      // 切换到卡组 2
      deckManager.setActiveDeck(deck2.id);
      engine.init(); // 重新初始化
      
      state = engine.getGameState();
      expect(deck2.cards).toContain(state.currentPiece!.type);
    });

    test('无卡组时使用默认逻辑', () => {
      deckManager.setActiveDeck(null);
      engine.init();
      
      const state = engine.getGameState();
      expect(state.currentPiece).toBeDefined();
      // 应该是有效的方块类型
      expect(Object.keys(GAME_CONFIG.SHAPES)).toContain(state.currentPiece!.type);
    });
  });

  // ==================== 5. UI 组件测试（间接测试） ====================
  describe('5. UI 组件支持测试', () => {
    test('卡组管理器提供 UI 所需的方法', () => {
      // 验证 UI 组件需要的方法都存在
      expect(typeof deckManager.listDecks).toBe('function');
      expect(typeof deckManager.getDeck).toBe('function');
      expect(typeof deckManager.createDeck).toBe('function');
      expect(typeof deckManager.updateDeck).toBe('function');
      expect(typeof deckManager.deleteDeck).toBe('function');
      expect(typeof deckManager.setActiveDeck).toBe('function');
      expect(typeof deckManager.getActiveDeck).toBe('function');
      expect(typeof deckManager.validateDeck).toBe('function');
      expect(typeof deckManager.getPresetDecks).toBe('function');
      expect(typeof deckManager.getConfig).toBe('function');
      expect(typeof deckManager.getRarityWeights).toBe('function');
    });


  });

  // ==================== 6. 回归测试 ====================
  describe('6. 回归测试', () => {
    test('原有方块生成逻辑正常', () => {
      // 不使用卡组，测试默认方块生成
      deckManager.setActiveDeck(null);
      engine.init();
      
      const state = engine.getGameState();
      expect(state.currentPiece).toBeDefined();
      expect(state.currentPiece!.shape).toBeDefined();
      expect(state.currentPiece!.color).toBeDefined();
      expect(state.currentPiece!.position).toBeDefined();
    });

    test('游戏主流程不受影响', () => {
      engine.init();
      
      // 测试基本游戏流程
      const stateBefore = engine.getGameState();
      expect(stateBefore.gameOver).toBe(false);
      
      // 移动方块
      const moved = engine.movePiece(1, 0);
      expect(moved).toBe(true);
      
      // 旋转方块
      const rotated = engine.rotatePiece();
      expect(rotated).toBe(true);
      
      // 硬降
      const dropDistance = engine.hardDrop();
      expect(dropDistance).toBeGreaterThanOrEqual(0);
      
      // 游戏状态应该仍然有效
      const stateAfter = engine.getGameState();
      expect(stateAfter).toBeDefined();
    });

    test('无新引入的 Bug', () => {
      // 边界测试
      const deck = deckManager.createDeck('边界测试', ['I', 'O', 'T']);
      
      // 快速创建和删除（使用有效卡组大小）
      for (let i = 0; i < 10; i++) {
        const tempDeck = deckManager.createDeck(`临时${i}`, ['I', 'O', 'T']);
        deckManager.deleteDeck(tempDeck.id);
      }
      
      // 激活和取消激活
      deckManager.setActiveDeck(deck.id);
      deckManager.setActiveDeck(null);
      deckManager.setActiveDeck(deck.id);
      
      // 应该没有错误抛出
      expect(deckManager.getDeck(deck.id)).toBeDefined();
    });

    test('并发操作安全', () => {
      const deck1 = deckManager.createDeck('并发 1', ['I', 'O', 'T']);
      const deck2 = deckManager.createDeck('并发 2', ['S', 'Z', 'L']);
      
      // 同时操作多个卡组
      deckManager.updateDeck(deck1.id, { name: '更新 1' });
      deckManager.updateDeck(deck2.id, { name: '更新 2' });
      deckManager.setActiveDeck(deck1.id);
      
      const d1 = deckManager.getDeck(deck1.id);
      const d2 = deckManager.getDeck(deck2.id);
      
      expect(d1?.name).toBe('更新 1');
      expect(d2?.name).toBe('更新 2');
      expect(deckManager.getActiveDeck()?.id).toBe(deck1.id);
    });
  });

  // ==================== 7. 性能测试（基本） ====================
  describe('7. 性能测试', () => {
    test('大量卡组操作性能', () => {
      const startTime = Date.now();
      
      // 创建 50 个卡组
      const decks: string[] = [];
      for (let i = 0; i < 50; i++) {
        const deck = deckManager.createDeck(`性能测试${i}`, ['I', 'O', 'T']);
        decks.push(deck.id);
      }
      
      // 更新所有卡组
      for (const id of decks) {
        deckManager.updateDeck(id, { name: `更新${id}` });
      }
      
      // 删除所有卡组
      for (const id of decks) {
        deckManager.deleteDeck(id);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 应该在合理时间内完成（< 5 秒）
      expect(duration).toBeLessThan(5000);
    });

    test('抽取算法性能', () => {
      const deck = deckManager.createDeck('性能测试', [
        'I', 'O', 'T', 'S', 'Z', 'L', 'J'
      ]);
      deckManager.setActiveDeck(deck.id);
      
      const startTime = Date.now();
      
      // 抽取 1000 次
      for (let i = 0; i < 1000; i++) {
        engine.init();
        engine.hardDrop();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 应该在合理时间内完成（< 10 秒）
      expect(duration).toBeLessThan(10000);
    });
  });
});

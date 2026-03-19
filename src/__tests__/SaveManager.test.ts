// ==================== SaveManager 单元测试 ====================
// v2.0.0 存档系统修复测试

import { SaveManager } from '../core/SaveManager';
import type { SaveData, PlayerSave, StatsSave, SettingsSave, AchievementSave } from '../types/save';

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

describe('SaveManager - v2.0.0 存档系统', () => {
  beforeEach(() => {
    localStorage.clear();
    SaveManager.resetInstance();
  });

  afterEach(() => {
    localStorage.clear();
    SaveManager.resetInstance();
  });

  // ==================== 基本功能测试 ====================

  describe('基本功能', () => {
    test('应该能够获取单例实例', () => {
      const instance1 = SaveManager.getInstance();
      const instance2 = SaveManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    test('新实例应该没有存档', () => {
      const saveManager = SaveManager.getInstance();
      expect(saveManager.hasSave()).toBe(false);
      expect(saveManager.getSave()).toBeNull();
    });

    test('应该能够保存新存档', () => {
      const saveManager = SaveManager.getInstance();
      const result = saveManager.save({
        player: {
          level: 5,
          hp: 100,
          maxHp: 100,
          energy: 5,
          maxEnergy: 5,
          gold: 1000,
          exp: 500,
        },
      });
      expect(result).toBe(true);
      expect(saveManager.hasSave()).toBe(true);
      expect(saveManager.getSave()).not.toBeNull();
    });

    test('应该能够加载已保存的存档', () => {
      const saveManager = SaveManager.getInstance();
      saveManager.save({
        player: {
          level: 10,
          hp: 150,
          maxHp: 150,
          energy: 8,
          maxEnergy: 8,
          gold: 5000,
          exp: 2500,
        },
      });

      // 重置实例模拟重新加载
      SaveManager.resetInstance();
      const loadedManager = SaveManager.getInstance();
      const loaded = loadedManager.load();

      expect(loaded).toBe(true);
      expect(loadedManager.getSave()).not.toBeNull();
      expect(loadedManager.getSave()?.player.level).toBe(10);
      expect(loadedManager.getSave()?.player.gold).toBe(5000);
    });

    test('应该能够删除存档', () => {
      const saveManager = SaveManager.getInstance();
      saveManager.save({ player: { level: 1, hp: 50, maxHp: 50, energy: 3, maxEnergy: 3, gold: 0, exp: 0 } });
      expect(saveManager.hasSave()).toBe(true);

      saveManager.deleteSave();
      expect(saveManager.hasSave()).toBe(false);
      expect(saveManager.getSave()).toBeNull();
    });
  });

  // ==================== 玩家数据测试 ====================

  describe('玩家数据', () => {
    test('应该能够更新玩家数据', () => {
      const saveManager = SaveManager.getInstance();
      saveManager.save({ player: { level: 1, hp: 50, maxHp: 50, energy: 3, maxEnergy: 3, gold: 0, exp: 0 } });

      const result = saveManager.updatePlayer({ gold: 100, exp: 50 });
      expect(result).toBe(true);

      const save = saveManager.getSave();
      expect(save?.player.gold).toBe(100);
      expect(save?.player.exp).toBe(50);
      expect(save?.player.level).toBe(1); // 未更新的字段保持不变
    });

    test('没有存档时 updatePlayer 应该返回 false', () => {
      const saveManager = SaveManager.getInstance();
      expect(saveManager.updatePlayer({ gold: 100 })).toBe(false);
    });
  });

  // ==================== 统计数据测试 ====================

  describe('统计数据', () => {
    test('应该能够更新统计数据', () => {
      const saveManager = SaveManager.getInstance();
      saveManager.save({
        stats: {
          totalGames: 0,
          totalWins: 0,
          totalLosses: 0,
          totalDamage: 0,
          totalCardsPlayed: 0,
          maxCombo: 0,
          totalPlayTime: 0,
        },
      });

      const result = saveManager.updateStats({
        totalGames: 10,
        totalWins: 7,
        totalDamage: 500,
      });
      expect(result).toBe(true);

      const save = saveManager.getSave();
      expect(save?.stats.totalGames).toBe(10);
      expect(save?.stats.totalWins).toBe(7);
      expect(save?.stats.totalDamage).toBe(500);
    });

    test('没有存档时 updateStats 应该返回 false', () => {
      const saveManager = SaveManager.getInstance();
      expect(saveManager.updateStats({ totalGames: 1 })).toBe(false);
    });
  });

  // ==================== 成就系统测试 ====================

  describe('成就系统', () => {
    test('应该能够解锁成就', () => {
      const saveManager = SaveManager.getInstance();
      saveManager.save({
        achievements: { unlockedIds: [], progress: {} },
      });

      const result = saveManager.unlockAchievement('achievement_1');
      expect(result).toBe(true);
      expect(saveManager.getSave()?.achievements.unlockedIds).toContain('achievement_1');
    });

    test('重复解锁成就应该返回 true（已解锁）', () => {
      const saveManager = SaveManager.getInstance();
      saveManager.save({
        achievements: { unlockedIds: ['achievement_1'], progress: {} },
      });

      const result = saveManager.unlockAchievement('achievement_1');
      expect(result).toBe(true);
      expect(saveManager.getSave()?.achievements.unlockedIds).toHaveLength(1);
    });

    test('应该能够添加成就进度', () => {
      const saveManager = SaveManager.getInstance();
      saveManager.save({
        achievements: { unlockedIds: [], progress: {} },
      });

      const result = saveManager.addAchievementProgress('achievement_2', 50);
      expect(result).toBe(true);
      expect(saveManager.getSave()?.achievements.progress['achievement_2']).toBe(50);
    });

    test('应该能够累加成就进度', () => {
      const saveManager = SaveManager.getInstance();
      saveManager.save({
        achievements: { unlockedIds: [], progress: { 'achievement_3': 30 } },
      });

      saveManager.addAchievementProgress('achievement_3', 20);
      expect(saveManager.getSave()?.achievements.progress['achievement_3']).toBe(20);
    });

    test('没有存档时 unlockAchievement 应该返回 false', () => {
      const saveManager = SaveManager.getInstance();
      expect(saveManager.unlockAchievement('test')).toBe(false);
    });

    test('没有存档时 addAchievementProgress 应该返回 false', () => {
      const saveManager = SaveManager.getInstance();
      expect(saveManager.addAchievementProgress('test', 50)).toBe(false);
    });
  });

  // ==================== v2.0.0 卡组系统修复测试 ====================

  describe('v2.0.0 卡组系统（只存储 activeDeckId）', () => {
    test('应该能够设置激活的卡组', () => {
      const saveManager = SaveManager.getInstance();
      saveManager.save({
        activeDeckId: null,
      });

      const result = saveManager.setActiveDeck('deck_123');
      expect(result).toBe(true);
      expect(saveManager.getActiveDeckId()).toBe('deck_123');
    });

    test('应该能够清除激活的卡组', () => {
      const saveManager = SaveManager.getInstance();
      saveManager.save({
        activeDeckId: 'deck_123',
      });

      const result = saveManager.setActiveDeck(null);
      expect(result).toBe(true);
      expect(saveManager.getActiveDeckId()).toBeNull();
    });

    test('新存档的 activeDeckId 应该为 null', () => {
      const saveManager = SaveManager.getInstance();
      saveManager.save({});
      expect(saveManager.getActiveDeckId()).toBeNull();
    });

    test('getActiveDeckId 在没有存档时应该返回 null', () => {
      const saveManager = SaveManager.getInstance();
      expect(saveManager.getActiveDeckId()).toBeNull();
    });

    test('v2.0.0 新格式存档应该不包含 decks 字段', () => {
      const saveManager = SaveManager.getInstance();
      saveManager.save({
        activeDeckId: 'deck_abc',
      });

      const save = saveManager.getSave();
      expect(save).not.toBeNull();
      expect(save).not.toHaveProperty('decks');
      expect(save?.activeDeckId).toBe('deck_abc');
    });
  });

  // ==================== 向后兼容测试 ====================

  describe('向后兼容（旧版存档迁移）', () => {
    test('应该能够从旧版存档迁移 activeDeckId', () => {
      const saveManager = SaveManager.getInstance();

      // 模拟旧版存档（有 decks 字段和 isActive 标记）
      const oldSave: SaveData = {
        version: 1,
        timestamp: Date.now(),
        player: { level: 5, hp: 50, maxHp: 50, energy: 3, maxEnergy: 3, gold: 100, exp: 0 },
        // @ts-expect-error - 旧版字段，故意添加用于测试迁移
        decks: [
          { id: 'deck_1', name: '卡组1', cards: ['I', 'O'], isActive: false, createdAt: Date.now() },
          { id: 'deck_2', name: '卡组2', cards: ['T', 'S'], isActive: true, createdAt: Date.now() },
          { id: 'deck_3', name: '卡组3', cards: ['L', 'J'], isActive: false, createdAt: Date.now() },
        ],
        achievements: { unlockedIds: [], progress: {} },
        stats: { totalGames: 0, totalWins: 0, totalLosses: 0, totalDamage: 0, totalCardsPlayed: 0, maxCombo: 0, totalPlayTime: 0 },
        settings: { soundEnabled: true, musicEnabled: true, soundVolume: 80, musicVolume: 60 },
        // @ts-expect-error - 故意不提供 activeDeckId，测试迁移逻辑
      };

      // 直接设置到 localStorage 模拟旧版存档
      localStorage.setItem('cyber-tetris-2077-save', JSON.stringify(oldSave));

      // 重新加载
      SaveManager.resetInstance();
      const loadedManager = SaveManager.getInstance();
      loadedManager.load();

      // 应该从旧版存档中推断出 activeDeckId
      expect(loadedManager.getActiveDeckId()).toBe('deck_2');
    });

    test('旧版存档没有激活卡组时应该返回 null', () => {
      const saveManager = SaveManager.getInstance();

      // 模拟旧版存档（没有 isActive 的卡组）
      const oldSave: SaveData = {
        version: 1,
        timestamp: Date.now(),
        player: { level: 5, hp: 50, maxHp: 50, energy: 3, maxEnergy: 3, gold: 100, exp: 0 },
        // @ts-expect-error - 旧版字段，故意添加用于测试迁移
        decks: [
          { id: 'deck_1', name: '卡组1', cards: ['I', 'O'], isActive: false, createdAt: Date.now() },
        ],
        achievements: { unlockedIds: [], progress: {} },
        stats: { totalGames: 0, totalWins: 0, totalLosses: 0, totalDamage: 0, totalCardsPlayed: 0, maxCombo: 0, totalPlayTime: 0 },
        settings: { soundEnabled: true, musicEnabled: true, soundVolume: 80, musicVolume: 60 },
      };

      localStorage.setItem('cyber-tetris-2077-save', JSON.stringify(oldSave));

      SaveManager.resetInstance();
      const loadedManager = SaveManager.getInstance();
      loadedManager.load();

      expect(loadedManager.getActiveDeckId()).toBeNull();
    });
  });

  // ==================== 错误处理测试 ====================

  describe('错误处理', () => {
    test('localStorage 不可用时 save 应该返回 false', () => {
      const saveManager = SaveManager.getInstance();

      // 模拟 localStorage 出错
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('localStorage error');
      };

      const result = saveManager.save({ player: { level: 1, hp: 50, maxHp: 50, energy: 3, maxEnergy: 3, gold: 0, exp: 0 } });
      expect(result).toBe(false);

      // 恢复
      localStorage.setItem = originalSetItem;
    });

    test('损坏的 JSON 应该导致 load 返回 false', () => {
      localStorage.setItem('cyber-tetris-2077-save', 'not valid json {{{');

      SaveManager.resetInstance();
      const loadedManager = SaveManager.getInstance();
      const result = loadedManager.load();

      expect(result).toBe(false);
    });
  });
});

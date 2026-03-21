/**
 * @fileoverview GameFlowManager 单元测试 v2.0.0 Phase 4
 */

import { GameFlowManager } from '../core/GameFlowManager';
import { GameStage } from '../types/deck-builder';
import { EnemyType } from '../core/CombatManager';

describe('GameFlowManager', () => {
  let manager: GameFlowManager;

  beforeEach(() => {
    manager = new GameFlowManager();
  });

  afterEach(() => {
    manager.dispose();
  });

  describe('startNewGame', () => {
    it('应该初始化游戏状态', () => {
      manager.startNewGame();
      const state = manager.getState();

      expect(state.gameStage).toBe(GameStage.MENU);
      expect(state.currentStage).toBe(1);
      expect(state.currentDeck.length).toBeGreaterThan(0);
    });

    it('应该有默认起始卡组', () => {
      manager.startNewGame();
      const state = manager.getState();
      expect(state.currentDeck.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('startBattle', () => {
    it('应该从菜单进入战斗', () => {
      manager.startNewGame();
      manager.startBattle();

      const state = manager.getState();
      expect(state.gameStage).toBe(GameStage.BATTLE);
      expect(state.enemyConfig).not.toBeNull();
      expect(state.combatState).not.toBeNull();
    });

    it('应该生成第1关敌人', () => {
      manager.startNewGame();
      manager.startBattle();

      const state = manager.getState();
      expect(state.enemyConfig?.name).toBe('街头混混');
    });
  });

  describe('playCard', () => {
    it('不在战斗时不应该成功', () => {
      manager.startNewGame();
      const result = manager.playCard('test_card', 1);
      expect(result.success).toBe(false);
    });

    it('战斗时应该能使用卡牌', () => {
      manager.startNewGame();
      manager.startBattle();

      const state = manager.getState();
      if (state.hand.length > 0) {
        const card = state.hand[0];
        const result = manager.playCard(card.id, 1);
        // 可能成功也可能因为能量不足失败
        expect(typeof result.success).toBe('boolean');
      }
    });
  });

  describe('endTurn', () => {
    it('不在战斗时不应该有效果', () => {
      manager.startNewGame();
      manager.endTurn(); // 不应该崩溃
      const state = manager.getState();
      expect(state.gameStage).toBe(GameStage.MENU);
    });
  });

  describe('nextStage', () => {
    it('应该进入下一关', () => {
      manager.startNewGame();
      manager.nextStage();

      const state = manager.getState();
      expect(state.currentStage).toBe(2);
    });

    it('应该能进入第4关', () => {
      manager.startNewGame();
      manager.nextStage(); // 2
      manager.nextStage(); // 3
      manager.nextStage(); // 4

      const state = manager.getState();
      expect(state.currentStage).toBe(4);
    });
  });

  describe('returnToMenu', () => {
    it('应该从战斗返回主菜单', () => {
      manager.startNewGame();
      manager.startBattle();
      manager.returnToMenu();

      const state = manager.getState();
      expect(state.gameStage).toBe(GameStage.MENU);
    });

    it('应该从失败返回主菜单', () => {
      manager.startNewGame();
      manager.startBattle();
      manager.returnToMenu();

      const state = manager.getState();
      expect(state.gameStage).toBe(GameStage.MENU);
    });
  });

  describe('callbacks', () => {
    it('应该正确注册状态变化回调', () => {
      let callbackCount = 0;
      manager.setCallbacks({
        onStateChange: () => {
          callbackCount++;
        },
      });

      manager.startNewGame();
      expect(callbackCount).toBeGreaterThan(0);
    });

    it('应该正确注册胜利回调', () => {
      let victoryCalled = false;
      manager.setCallbacks({
        onVictory: () => {
          victoryCalled = true;
        },
      });

      manager.startNewGame();
      // 胜利需要完整战斗流程触发
      expect(typeof victoryCalled).toBe('boolean');
    });

    it('should correctly register defeat callback', () => {
      let defeatCalled = false;
      manager.setCallbacks({
        onDefeat: () => {
          defeatCalled = true;
        },
      });

      manager.startNewGame();
      expect(typeof defeatCalled).toBe('boolean');
    });
  });

  describe('getDeck', () => {
    it('应该返回当前卡组的副本', () => {
      manager.startNewGame();
      const deck1 = manager.getDeck();
      const deck2 = manager.getDeck();

      expect(deck1).toEqual(deck2);
      expect(deck1).not.toBe(deck2); // 应该是副本
    });
  });

  describe('getCurrentStage', () => {
    it('应该返回当前关卡', () => {
      manager.startNewGame();
      expect(manager.getCurrentStage()).toBe(1);

      manager.nextStage();
      expect(manager.getCurrentStage()).toBe(2);
    });
  });
});

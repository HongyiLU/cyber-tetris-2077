/**
 * CombatManager 组件测试
 */
import { CombatManager, EnemyType } from '../core/CombatManager';
import { Card, CardRarity, CardSpecialEffect } from '../types/card.v2';

const mockCard: Card = {
  id: 'combat_card',
  name: '战斗卡牌',
  cost: 1,
  shape: [[1, 1]],
  rarity: CardRarity.COMMON,
  damage: 5,
  upgradeLevel: 0,
};

const mockEnemy = {
  name: '测试敌人',
  type: EnemyType.NORMAL,
  maxHealth: 50,
  health: 50,
  attack: 10,
  defense: 0,
  attackInterval: 3000,
  rarityWeight: 100,
};

describe('CombatManager', () => {
  let combatManager: CombatManager;

  beforeEach(() => {
    combatManager = new CombatManager();
  });

  describe('generateEnemy', () => {
    it('should generate enemy with scaled stats based on stage', () => {
      const enemy = CombatManager.generateEnemy(1);
      expect(enemy.name).toBeDefined();
      expect(enemy.maxHealth).toBeGreaterThan(0);
      expect(enemy.attack).toBeGreaterThan(0);
    });

    it('should increase enemy stats with higher stages', () => {
      const enemy1 = CombatManager.generateEnemy(1);
      const enemy5 = CombatManager.generateEnemy(5);
      expect(enemy5.maxHealth).toBeGreaterThan(enemy1.maxHealth);
    });
  });

  describe('startCombat', () => {
    it('should initialize combat state', () => {
      const deck: Card[] = [mockCard];
      combatManager.startCombat(deck, mockEnemy);
      const state = combatManager.getState();
      expect(state.enemy).toBeDefined();
      expect(state.playerHealth).toBe(100);
    });
  });

  describe('playCard', () => {
    it('should fail when not in player action phase', () => {
      const deck: Card[] = [mockCard];
      combatManager.startCombat(deck, mockEnemy);
      const result = combatManager.playCard('non_existent', 1);
      expect(result.success).toBe(false);
    });

    it('should fail when card not in hand', () => {
      const deck: Card[] = [mockCard];
      combatManager.startCombat(deck, mockEnemy);
      const result = combatManager.playCard('non_existent', 1);
      expect(result.success).toBe(false);
    });
  });

  describe('getHand', () => {
    it('should return empty hand initially', () => {
      const deck: Card[] = [mockCard];
      combatManager.startCombat(deck, mockEnemy);
      const hand = combatManager.getHand();
      expect(hand).toBeDefined();
    });
  });

  describe('getState', () => {
    it('should return current combat state', () => {
      const deck: Card[] = [mockCard];
      combatManager.startCombat(deck, mockEnemy);
      const state = combatManager.getState();
      expect(state).toHaveProperty('phase');
      expect(state).toHaveProperty('playerHealth');
      expect(state).toHaveProperty('enemy');
    });
  });

  describe('getPileCounts', () => {
    it('should return pile counts', () => {
      const deck: Card[] = [mockCard];
      combatManager.startCombat(deck, mockEnemy);
      const counts = combatManager.getPileCounts();
      expect(counts).toHaveProperty('draw');
      expect(counts).toHaveProperty('discard');
    });
  });
});

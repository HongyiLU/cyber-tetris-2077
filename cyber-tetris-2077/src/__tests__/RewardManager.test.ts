/**
 * RewardManager 组件测试
 */
import { RewardManager } from '../core/RewardManager';
import { Card, CardRarity } from '../types/card.v2';

const mockCard: Card = {
  id: 'reward_card',
  name: '奖励卡牌',
  cost: 1,
  shape: [[1, 1]],
  rarity: CardRarity.COMMON,
  damage: 5,
  upgradeLevel: 0,
};

describe('RewardManager', () => {
  let rewardManager: RewardManager;

  beforeEach(() => {
    rewardManager = new RewardManager();
  });

  describe('initialize', () => {
    it('should initialize with deck and stage', () => {
      const deck: Card[] = [mockCard];
      rewardManager.initialize(deck, 1);
      const state = rewardManager.getState();
      expect(state).toBeDefined();
    });
  });

  describe('generateRewards', () => {
    it('should generate reward options', () => {
      const deck: Card[] = [mockCard];
      rewardManager.initialize(deck, 1);
      const options = rewardManager.generateRewards();
      expect(options.length).toBeGreaterThan(0);
    });

    it('should set isSelecting to true after generating rewards', () => {
      const deck: Card[] = [mockCard];
      rewardManager.initialize(deck, 1);
      rewardManager.generateRewards();
      expect(rewardManager.isSelecting()).toBe(true);
    });
  });

  describe('selectReward', () => {
    it('should return null for invalid index', () => {
      const deck: Card[] = [mockCard];
      rewardManager.initialize(deck, 1);
      rewardManager.generateRewards();
      const result = rewardManager.selectReward(-1);
      expect(result).toBeNull();
    });

    it('should return card for valid index', () => {
      const deck: Card[] = [mockCard];
      rewardManager.initialize(deck, 1);
      rewardManager.generateRewards();
      const result = rewardManager.selectReward(0);
      expect(result).toBeDefined();
    });
  });

  describe('skipReward', () => {
    it('should return gold amount for skipping', () => {
      const deck: Card[] = [mockCard];
      rewardManager.initialize(deck, 1);
      rewardManager.generateRewards();
      const gold = rewardManager.skipReward();
      expect(gold).toBe(10);
    });
  });

  describe('getDeck', () => {
    it('should return current deck', () => {
      const deck: Card[] = [mockCard];
      rewardManager.initialize(deck, 1);
      const currentDeck = rewardManager.getDeck();
      expect(currentDeck).toBeDefined();
      expect(Array.isArray(currentDeck)).toBe(true);
    });
  });

  describe('getOptions', () => {
    it('should return reward options', () => {
      const deck: Card[] = [mockCard];
      rewardManager.initialize(deck, 1);
      rewardManager.generateRewards();
      const options = rewardManager.getOptions();
      expect(options).toBeDefined();
    });
  });

  describe('reset', () => {
    it('should reset reward state', () => {
      const deck: Card[] = [mockCard];
      rewardManager.initialize(deck, 1);
      rewardManager.generateRewards();
      rewardManager.reset();
      const state = rewardManager.getState();
      expect(state.options.length).toBe(0);
      expect(state.isSelecting).toBe(false);
    });
  });
});

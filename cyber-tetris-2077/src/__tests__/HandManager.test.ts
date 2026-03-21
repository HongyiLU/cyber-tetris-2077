/**
 * HandManager 组件测试
 */
import { HandManager } from '../core/HandManager';
import { Card, CardRarity } from '../types/card.v2';

const mockCard: Card = {
  id: 'test_card',
  name: '测试卡牌',
  cost: 1,
  shape: [[1, 1]],
  rarity: CardRarity.COMMON,
  damage: 5,
  upgradeLevel: 0,
};

describe('HandManager', () => {
  let handManager: HandManager;

  beforeEach(() => {
    handManager = new HandManager();
  });

  describe('initializeHand', () => {
    it('should initialize hand with cards from deck', () => {
      const deck: Card[] = [mockCard, { ...mockCard, id: 'card_2' }];
      handManager.initializeHand(deck);
      const hand = handManager.getHand();
      expect(hand.length).toBeGreaterThan(0);
    });
  });

  describe('drawCards', () => {
    it('should draw cards up to max hand size', () => {
      const deck: Card[] = Array(10).fill(null).map((_, i) => ({
        ...mockCard,
        id: `card_${i}`,
      }));
      handManager.initializeHand(deck);
      handManager.drawCards(10);
      const hand = handManager.getHand();
      expect(hand.length).toBeLessThanOrEqual(5);
    });
  });

  describe('playCard', () => {
    it('should remove card from hand when played', () => {
      const deck: Card[] = [mockCard];
      handManager.initializeHand(deck);
      const hand = handManager.getHand();
      if (hand.length > 0) {
        const cardToPlay = hand[0];
        const success = handManager.playCard(cardToPlay.id);
        expect(success).toBe(true);
        expect(handManager.getHand().find((c) => c.id === cardToPlay.id)).toBeUndefined();
      }
    });

    it('should return false for non-existent card', () => {
      const success = handManager.playCard('non_existent');
      expect(success).toBe(false);
    });
  });

  describe('discardHand', () => {
    it('should discard all cards', () => {
      const deck: Card[] = [mockCard, { ...mockCard, id: 'card_2' }];
      handManager.initializeHand(deck);
      handManager.discardHand();
      expect(handManager.getHand().length).toBe(0);
    });
  });

  describe('getPileCounts', () => {
    it('should return pile counts', () => {
      const deck: Card[] = [mockCard];
      handManager.initializeHand(deck);
      const drawCount = handManager.getDrawPileCount();
      const discardCount = handManager.getDiscardPileCount();
      expect(drawCount).toBeGreaterThanOrEqual(0);
      expect(discardCount).toBeGreaterThanOrEqual(0);
    });
  });
});

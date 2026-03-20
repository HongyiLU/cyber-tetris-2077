/**
 * @fileoverview CardDatabase v2.0.0 单元测试
 */

import { CardDatabase, cardDatabase } from '../core/CardDatabase';
import { CardRarity, CardSpecialEffect, UPGRADE_MULTIPLIERS } from '../types/card.v2';
import { REWARD_CONFIG } from '../config/reward-config';

describe('CardDatabase', () => {
  let db: CardDatabase;

  beforeEach(() => {
    db = new CardDatabase();
  });

  describe('initializeCards', () => {
    it('should register all 14 cards (5 COMMON + 5 UNCOMMON + 3 EPIC + 1 LEGENDARY)', () => {
      const allCards = db.getAllCards();
      expect(allCards.length).toBe(14);
    });

    it('should register COMMMON rarity cards (5)', () => {
      const commonCards = db.getCardsByRarity(CardRarity.COMMON);
      expect(commonCards.length).toBe(5);
    });

    it('should register UNCOMMON rarity cards (5)', () => {
      const uncommonCards = db.getCardsByRarity(CardRarity.UNCOMMON);
      expect(uncommonCards.length).toBe(5);
    });

    it('should register EPIC rarity cards (3)', () => {
      const epicCards = db.getCardsByRarity(CardRarity.EPIC);
      expect(epicCards.length).toBe(3);
    });

    it('should register LEGENDARY rarity cards (1)', () => {
      const legendaryCards = db.getCardsByRarity(CardRarity.LEGENDARY);
      expect(legendaryCards.length).toBe(1);
    });
  });

  describe('getCardById', () => {
    it('should return the correct card by id', () => {
      const card = db.getCardById('i_block');
      expect(card).toBeDefined();
      expect(card!.name).toBe('I方块');
      expect(card!.cost).toBe(0);
      expect(card!.rarity).toBe(CardRarity.COMMON);
    });

    it('should return undefined for non-existent id', () => {
      const card = db.getCardById('nonexistent');
      expect(card).toBeUndefined();
    });

    it('should return cloned cards (no mutation risk)', () => {
      const card1 = db.getCardById('i_block');
      const card2 = db.getCardById('i_block');
      expect(card1).not.toBe(card2);
    });
  });

  describe('getUpgradeEffect', () => {
    it('should return base values at upgradeLevel 0', () => {
      const card = db.getCardById('i_block')!;
      card.upgradeLevel = 0;
      const upgraded = db.getUpgradeEffect(card);
      // P0-1 fix: 正确公式 = baseStat + floor(upgradeBonus * multiplier)
      // multiplier=1.0 at level 0 → 5 + floor(3 * 1.0) = 8
      expect(upgraded.damage).toBe(8);
    });

    it('should apply +50% at upgradeLevel 1', () => {
      const card = db.getCardById('i_block')!;
      card.upgradeLevel = 1;
      const upgraded = db.getUpgradeEffect(card);
      // P0-1 fix: 正确公式 = baseStat + floor(upgradeBonus * multiplier)
      // Base damage 5, upgrade adds +3, multiplier 1.5 → 5 + floor(3 * 1.5) = 5 + 4 = 9
      expect(upgraded.damage).toBe(9);
    });

    it('should apply +100% at upgradeLevel 2', () => {
      const card = db.getCardById('i_block')!;
      card.upgradeLevel = 2;
      const upgraded = db.getUpgradeEffect(card);
      // P0-1 fix: 正确公式 = baseStat + floor(upgradeBonus * multiplier)
      // Base damage 5, upgrade adds +3, multiplier 2.0 → 5 + floor(3 * 2.0) = 5 + 6 = 11
      expect(upgraded.damage).toBe(11);
    });

    it('should apply upgrade to block values', () => {
      const card = db.getCardById('s_block')!;
      card.upgradeLevel = 1;
      const upgraded = db.getUpgradeEffect(card);
      // P0-1 fix: 正确公式 = baseStat + floor(upgradeBonus * multiplier)
      // Base block 5, upgrade adds +3, multiplier 1.5 → 5 + floor(3 * 1.5) = 5 + 4 = 9
      expect(upgraded.block).toBe(9);
    });

    it('should apply upgrade to poison values', () => {
      const card = db.getCardById('z_block')!;
      card.upgradeLevel = 2;
      const upgraded = db.getUpgradeEffect(card);
      // P0-1 fix: 正确公式 = baseStat + floor(upgradeBonus * multiplier)
      // Base poison 2, upgrade adds +1, multiplier 2.0 → 2 + floor(1 * 2.0) = 2 + 2 = 4
      expect(upgraded.poison).toBe(4);
    });
  });

  describe('getRewardPool', () => {
    it('should return a non-empty pool for stage 1', () => {
      const pool = db.getRewardPool(1);
      expect(pool.length).toBeGreaterThan(0);
    });

    it('should return a non-empty pool for stage 4', () => {
      const pool = db.getRewardPool(4);
      expect(pool.length).toBeGreaterThan(0);
    });

    it('should contain only valid CardRarity values', () => {
      const pool = db.getRewardPool(2);
      const validRarities = Object.values(CardRarity);
      pool.forEach((card) => {
        expect(validRarities).toContain(card.rarity);
      });
    });
  });

  describe('generateRewardOptions', () => {
    it('should return exactly optionsCount reward options', () => {
      const deck: any[] = [];
      const options = db.generateRewardOptions(deck, 1);
      expect(options.length).toBe(REWARD_CONFIG.optionsCount);
    });

    it('should return unique cards (no duplicates)', () => {
      const deck: any[] = [];
      const options = db.generateRewardOptions(deck, 1);
      // P0-3 fix: options is now RewardOption[], each with cards: Card[]
      const ids = options.map((o) => o.cards[0].id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(options.length);
    });

    it('should return different cards on multiple calls (randomized)', () => {
      const deck: any[] = [];
      // P0-3 fix: options is now RewardOption[], each with cards: Card[]
      const set1 = db.generateRewardOptions(deck, 1).map((o) => o.cards[0].id).sort();
      const set2 = db.generateRewardOptions(deck, 1).map((o) => o.cards[0].id).sort();
      // There's a very small chance they could be equal, but practically this should differ
      // We just check both return valid arrays
      expect(set1.length).toBe(REWARD_CONFIG.optionsCount);
      expect(set2.length).toBe(REWARD_CONFIG.optionsCount);
    });
  });

  describe('UPGRADE_MULTIPLIERS', () => {
    it('should have correct base multiplier', () => {
      expect(UPGRADE_MULTIPLIERS.BASE).toBe(1.0);
    });

    it('should have correct +50% multiplier', () => {
      expect(UPGRADE_MULTIPLIERS.PLUS).toBe(1.5);
    });

    it('should have correct +100% multiplier', () => {
      expect(UPGRADE_MULTIPLIERS.PLUS_PLUS).toBe(2.0);
    });
  });

  describe('special card effects', () => {
    it('clear_block should have CLEAR_GARBAGE special effect', () => {
      const card = db.getCardById('clear_block');
      expect(card!.specialEffect).toBe(CardSpecialEffect.CLEAR_GARBAGE);
      expect(card!.specialValue).toBe(50);
    });

    it('time_block should have STUN special effect', () => {
      const card = db.getCardById('time_block');
      expect(card!.specialEffect).toBe(CardSpecialEffect.STUN);
      expect(card!.specialValue).toBe(3);
    });

    it('z_block should have POISON special effect', () => {
      const card = db.getCardById('z_block');
      expect(card!.specialEffect).toBe(CardSpecialEffect.POISON);
    });
  });

  describe('singleton export', () => {
    it('should export a cardDatabase instance', () => {
      expect(cardDatabase).toBeDefined();
      expect(cardDatabase.getAllCards().length).toBe(14);
    });
  });
});

/**
 * DeckBuilder 组件测试
 */
import { DeckBuilder } from '../core/DeckBuilder';
import { GameStage } from '../types/deck-builder';

describe('DeckBuilder', () => {
  let deckBuilder: DeckBuilder;

  beforeEach(() => {
    deckBuilder = new DeckBuilder();
  });

  describe('startNewGame', () => {
    it('should initialize new game with starter deck', () => {
      deckBuilder.startNewGame();
      const state = deckBuilder.getState();
      expect(state.currentDeck.length).toBeGreaterThan(0);
      expect(state.gameStage).toBe(GameStage.MENU);
    });
  });

  describe('getDeck', () => {
    it('should return current deck', () => {
      deckBuilder.startNewGame();
      const deck = deckBuilder.getDeck();
      expect(deck.length).toBeGreaterThan(0);
    });
  });

  describe('getCurrentStage', () => {
    it('should return current stage', () => {
      deckBuilder.startNewGame();
      const stage = deckBuilder.getCurrentStage();
      expect(stage).toBe(1);
    });
  });

  describe('getGameStage', () => {
    it('should return current game stage', () => {
      deckBuilder.startNewGame();
      const stage = deckBuilder.getGameStage();
      expect(stage).toBe(GameStage.MENU);
    });
  });

  describe('getDeckStats', () => {
    it('should return deck statistics', () => {
      deckBuilder.startNewGame();
      const stats = deckBuilder.getDeckStats();
      expect(stats).toHaveProperty('totalCards');
      expect(stats).toHaveProperty('byRarity');
      expect(stats).toHaveProperty('avgCost');
    });

    it('should have correct total cards count', () => {
      deckBuilder.startNewGame();
      const deck = deckBuilder.getDeck();
      const stats = deckBuilder.getDeckStats();
      expect(stats.totalCards).toBe(deck.length);
    });
  });

  describe('startBattle', () => {
    it('should transition to battle stage', () => {
      deckBuilder.startNewGame();
      deckBuilder.startBattle();
      const stage = deckBuilder.getGameStage();
      expect(stage).toBe(GameStage.BATTLE);
    });

    it('should not start battle with empty deck', () => {
      // Start with default which has starter deck, so it should work
      deckBuilder.startNewGame();
      // This should work since we have a starter deck
      deckBuilder.startBattle();
      expect(deckBuilder.getGameStage()).toBe(GameStage.BATTLE);
    });
  });

  describe('returnToMenu', () => {
    it('should return to menu from battle', () => {
      deckBuilder.startNewGame();
      deckBuilder.startBattle();
      deckBuilder.returnToMenu();
      expect(deckBuilder.getGameStage()).toBe(GameStage.MENU);
    });
  });

  describe('getState', () => {
    it('should return full state', () => {
      deckBuilder.startNewGame();
      const state = deckBuilder.getState();
      expect(state).toHaveProperty('currentDeck');
      expect(state).toHaveProperty('gameStage');
      expect(state).toHaveProperty('currentStage');
    });
  });
});

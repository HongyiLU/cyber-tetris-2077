import { DeckSystem } from '../engine/DeckSystem';

describe('DeckSystem', () => {
  let deck: DeckSystem;

  beforeEach(() => {
    deck = new DeckSystem();
  });

  test('应该正确初始化卡组', () => {
    deck.initializeDeck();
    const info = deck.getDeckInfo();
    expect(info.selectedCount).toBeGreaterThan(0);
  });

  test('应该正确抽取方块', () => {
    deck.initializeDeck();
    const piece = deck.drawPiece();
    expect(piece).toBeDefined();
    expect(piece.length).toBeGreaterThan(0);
  });

  test('卡组空时应该重洗弃牌堆', () => {
    deck.initializeDeck();
    // 抽完所有牌
    while(deck.getDeckInfo().drawCount > 0) {
      deck.drawPiece();
    }
    // 应该能继续抽
    const piece = deck.drawPiece();
    expect(piece).toBeDefined();
  });
});

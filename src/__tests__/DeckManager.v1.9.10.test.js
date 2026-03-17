// ==================== v1.9.10 删除卡组功能测试 ====================
import { DeckManager } from '../engine/DeckManager';
describe('v1.9.10 删除卡组功能', () => {
    let deckManager;
    beforeEach(() => {
        localStorage.clear();
        deckManager = new DeckManager();
    });
    afterEach(() => {
        localStorage.clear();
    });
    describe('最后一个卡组保护', () => {
        test('无法删除最后一个卡组', () => {
            // 删除所有卡组直到只剩 1 个
            while (deckManager.listDecks().length > 1) {
                const deck = deckManager.listDecks()[0];
                deckManager.deleteDeck(deck.id);
            }
            // 确认只剩 1 个
            expect(deckManager.listDecks().length).toBe(1);
            // 获取最后一个卡组
            const lastDeck = deckManager.listDecks()[0];
            // 尝试删除最后一个卡组，应该抛出错误
            expect(() => {
                deckManager.deleteDeck(lastDeck.id);
            }).toThrow('无法删除最后一个卡组');
        });
        test('有 2 个卡组时可以删除其中一个', () => {
            // 先删除到只剩 1 个
            while (deckManager.listDecks().length > 1) {
                deckManager.deleteDeck(deckManager.listDecks()[0].id);
            }
            // 创建 1 个新卡组，现在有 2 个
            const newDeck = deckManager.createDeck('新卡组', ['I', 'O', 'T', 'S', 'Z', 'L', 'J']);
            expect(deckManager.listDecks().length).toBe(2);
            // 删除新创建的卡组
            deckManager.deleteDeck(newDeck.id);
            // 确认还剩 1 个
            expect(deckManager.listDecks().length).toBe(1);
        });
    });
    describe('删除预设卡组', () => {
        test('可以删除预设卡组（当有多个卡组时）', () => {
            // 预设卡组已经存在，创建额外可用卡组
            deckManager.createDeck('额外卡组', ['I', 'O', 'T', 'S', 'Z', 'L', 'J']);
            // 获取一个预设卡组
            const presetDeck = deckManager.listDecks().find(d => d.id.startsWith('preset-'));
            expect(presetDeck).toBeDefined();
            // 删除预设卡组
            expect(() => {
                deckManager.deleteDeck(presetDeck.id);
            }).not.toThrow();
            // 确认预设卡组已删除
            expect(deckManager.getDeck(presetDeck.id)).toBeUndefined();
        });
    });
    describe('删除激活的卡组', () => {
        test('删除激活的卡组应该清空激活状态', () => {
            // 创建两个可用卡组（需要≥7 张卡牌）
            const deck1 = deckManager.createDeck('卡组 1', ['I', 'O', 'T', 'S', 'Z', 'L', 'J']);
            const deck2 = deckManager.createDeck('卡组 2', ['I', 'O', 'T', 'S', 'Z', 'L', 'J']);
            // 激活卡组 1
            deckManager.setActiveDeck(deck1.id);
            expect(deckManager.getActiveDeck()?.id).toBe(deck1.id);
            // 删除卡组 1
            deckManager.deleteDeck(deck1.id);
            // 确认激活状态已清空
            expect(deckManager.getActiveDeck()).toBeNull();
        });
    });
    describe('删除不存在的卡组', () => {
        test('删除不存在的卡组应该抛出错误', () => {
            expect(() => {
                deckManager.deleteDeck('non-existent-deck');
            }).toThrow('卡组不存在');
        });
    });
});

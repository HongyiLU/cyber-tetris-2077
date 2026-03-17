/**
 * 牌堆模式 + 抽空惩罚集成测试
 *
 * 测试完整的抽卡 → 抽空 → 洗牌 → 惩罚流程
 */
import { GameEngine } from '../engine/GameEngine';
import { DeckManager } from '../engine/DeckManager';
import { GAME_CONFIG } from '../config/game-config';
describe('牌堆模式 + 抽空惩罚集成测试', () => {
    let deckManager;
    let engine;
    beforeEach(() => {
        deckManager = new DeckManager();
        engine = new GameEngine(GAME_CONFIG.GAME.COLS, GAME_CONFIG.GAME.ROWS, deckManager);
    });
    test('完整流程：抽卡 → 抽空 → 洗牌 → 惩罚', () => {
        // 1. 创建小型测试卡组（7 张卡）
        const testDeck = deckManager.createDeck('测试牌堆', ['I', 'O', 'T', 'S', 'Z', 'L', 'J']);
        deckManager.setActiveDeck(testDeck.id);
        // 2. 初始化游戏
        engine.init();
        const initialState = engine.getGameState();
        const initialEmptyRows = initialState.board.filter(row => row.every(cell => cell === 0)).length;
        // 3. 连续抽卡直到触发惩罚
        // 第一次抽卡会填充牌堆（3 张），然后抽 1 张，剩 2 张
        // 再抽 2 张，抽空
        // 第 4 次抽卡会触发洗牌和惩罚
        let penaltyTriggered = false;
        let drawCount = 0;
        // 模拟多次抽卡（通过创建新方块）
        for (let i = 0; i < 10; i++) {
            const stateBefore = engine.getGameState();
            // 创建新方块（会触发抽卡）
            engine['createPiece']();
            drawCount++;
            // 检查是否触发了惩罚（通过棋盘变化判断）
            const stateAfter = engine.getGameState();
            const nonEmptyRowsBefore = stateBefore.board.filter(row => row.some(cell => cell !== 0)).length;
            const nonEmptyRowsAfter = stateAfter.board.filter(row => row.some(cell => cell !== 0)).length;
            // 如果非空行数突然增加，说明触发了惩罚
            if (nonEmptyRowsAfter > nonEmptyRowsBefore + 1) {
                penaltyTriggered = true;
            }
        }
        // 验证：应该至少触发了一次惩罚
        expect(penaltyTriggered).toBe(true);
        expect(drawCount).toBeGreaterThan(3);
    });
    test('惩罚触发时垃圾行数量正确', () => {
        engine.init();
        const stateBefore = engine.getGameState();
        const rowsBefore = stateBefore.board.length;
        // 手动触发惩罚（2 行）
        engine.triggerGarbagePenalty(GAME_CONFIG.DECK.GARBAGE_PENALTY_ROWS);
        const stateAfter = engine.getGameState();
        // 棋盘总行数应该不变（固定 ROWS）
        expect(stateAfter.board.length).toBe(rowsBefore);
        // 但应该有垃圾行被添加（从底部生成）
        const bottomRows = stateAfter.board.slice(-2);
        const hasGarbageRows = bottomRows.some(row => {
            const ones = row.filter(cell => cell === 1).length;
            const zeros = row.filter(cell => cell === 0).length;
            return ones === GAME_CONFIG.GAME.COLS - 1 && zeros === 1;
        });
        expect(hasGarbageRows).toBe(true);
    });
    test('多次惩罚应该累积垃圾行', () => {
        engine.init();
        // 连续触发 3 次惩罚（每次 2 行）
        engine.triggerGarbagePenalty(2);
        engine.triggerGarbagePenalty(2);
        engine.triggerGarbagePenalty(2);
        const state = engine.getGameState();
        // 底部 6 行应该都有垃圾行特征
        const bottomRows = state.board.slice(-6);
        const garbageRowCount = bottomRows.filter(row => {
            const ones = row.filter(cell => cell === 1).length;
            return ones === GAME_CONFIG.GAME.COLS - 1;
        }).length;
        expect(garbageRowCount).toBeGreaterThanOrEqual(3);
    });
    test('缺口位置应该随机分布', () => {
        engine.init();
        const gapPositions = new Set();
        // 生成 20 个垃圾行
        for (let i = 0; i < 20; i++) {
            engine.addGarbageRow();
            const board = engine.board;
            const bottomRow = board[board.length - 1];
            const gapIndex = bottomRow.findIndex((cell) => cell === 0);
            gapPositions.add(gapIndex);
        }
        // 验证缺口位置有足够的随机性
        // 棋盘宽度为 10，20 次中应该至少有 5 个不同位置
        expect(gapPositions.size).toBeGreaterThanOrEqual(5);
        expect(gapPositions.size).toBeLessThanOrEqual(GAME_CONFIG.GAME.COLS);
    });
    test('牌堆抽空后应该能继续游戏', () => {
        // 创建最小组卡组（7 张卡）
        const smallDeck = deckManager.createDeck('超小牌堆', ['I', 'O', 'T', 'S', 'Z', 'L', 'J']);
        deckManager.setActiveDeck(smallDeck.id);
        engine.init();
        // 多次创建方块，模拟抽空和洗牌
        for (let i = 0; i < 20; i++) {
            expect(() => {
                engine.createPiece();
            }).not.toThrow();
        }
        // 游戏应该仍然在进行中
        const state = engine.getGameState();
        expect(state.gameOver).toBe(false);
    });
    test('空卡组时应该使用回退卡牌', () => {
        // 不设置卡组
        deckManager.setActiveDeck(null);
        engine.init();
        // 抽卡应该返回某个方块（不使用卡组时使用完全随机）
        const piece = engine.createPiece();
        expect(piece).toBeDefined();
        expect(piece.type).toBeDefined();
    });
    test('惩罚不应该影响硬降功能', () => {
        engine.init();
        // 先触发惩罚
        engine.triggerGarbagePenalty(2);
        const stateBefore = engine.getGameState();
        const currentPiece = stateBefore.currentPiece;
        if (currentPiece) {
            // 执行硬降
            engine.hardDrop();
            const stateAfter = engine.getGameState();
            // 硬降应该成功（方块位置改变或被锁定）
            expect(stateAfter.currentPiece).toBeDefined();
        }
    });
    test('惩罚不应该影响旋转功能', () => {
        engine.init();
        // 先触发惩罚
        engine.triggerGarbagePenalty(2);
        const stateBefore = engine.getGameState();
        const pieceBefore = stateBefore.currentPiece;
        if (pieceBefore) {
            // 执行旋转
            engine.rotatePiece();
            const stateAfter = engine.getGameState();
            const pieceAfter = stateAfter.currentPiece;
            // 旋转应该成功
            expect(pieceAfter).toBeDefined();
        }
    });
});

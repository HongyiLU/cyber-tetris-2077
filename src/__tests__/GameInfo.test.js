import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameInfo from '../components/game/GameInfo';
import { BattleState } from '../types';
import { GAME_CONFIG } from '../config/game-config';
// 辅助函数：创建测试用的 GameState
const createMockGameState = (overrides) => ({
    board: [],
    currentPiece: null,
    nextPiece: {
        type: 'I',
        shape: GAME_CONFIG.SHAPES.I,
        position: { x: 0, y: 0 },
        color: GAME_CONFIG.COLORS.I,
    },
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    paused: false,
    playerHp: 100,
    playerMaxHp: 100,
    enemyHp: 100,
    enemyMaxHp: 100,
    battleState: BattleState.IDLE,
    combo: 0,
    maxCombo: 0,
    ...overrides,
});
describe('GameInfo Component', () => {
    // 保存原始的 window.innerWidth
    const originalInnerWidth = window.innerWidth;
    afterEach(() => {
        // 恢复原始的 innerWidth
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalInnerWidth,
        });
    });
    describe('getCardData 函数', () => {
        it('应该能找到基础方块卡牌数据', () => {
            const gameState = createMockGameState({
                nextPiece: {
                    type: 'I',
                    shape: GAME_CONFIG.SHAPES.I,
                    position: { x: 0, y: 0 },
                    color: GAME_CONFIG.COLORS.I,
                },
            });
            render(_jsx(GameInfo, { gameState: gameState }));
            // I 方块是基础方块，不应该显示名称和描述
            expect(screen.queryByText('直线冲击')).not.toBeInTheDocument();
        });
        it('应该能找到特殊方块卡牌数据', () => {
            const gameState = createMockGameState({
                nextPiece: {
                    type: 'BOMB',
                    shape: GAME_CONFIG.SHAPES.BOMB,
                    position: { x: 0, y: 0 },
                    color: GAME_CONFIG.COLORS.BOMB,
                },
            });
            render(_jsx(GameInfo, { gameState: gameState }));
            // BOMB 是特殊方块，应该显示名称
            expect(screen.getByText('💣 炸弹方块')).toBeInTheDocument();
        });
        it('应该为所有特殊方块找到卡牌数据', () => {
            const specialBlocks = [
                { type: 'BOMB', name: '💣 炸弹方块' },
                { type: 'TIME', name: '⏰ 时间停止' },
                { type: 'HEAL', name: '💖 生命偷取' },
                { type: 'SHIELD', name: '🛡️ 防御护盾' },
                { type: 'COMBO', name: '📈 连击增幅' },
                { type: 'CLEAR', name: '🌟 全屏清除' },
                { type: 'LUCKY', name: '7️⃣ 幸运七' },
                { type: 'FREEZE', name: '❄️ 寒冰冻结' },
                { type: 'FIRE', name: '🔥 火焰燃烧' },
                { type: 'LIGHTNING', name: '⚡ 雷电连锁' },
            ];
            specialBlocks.forEach(({ type, name }) => {
                const gameState = createMockGameState({
                    nextPiece: {
                        type,
                        shape: GAME_CONFIG.SHAPES[type],
                        position: { x: 0, y: 0 },
                        color: GAME_CONFIG.COLORS[type],
                    },
                });
                render(_jsx(GameInfo, { gameState: gameState }));
                expect(screen.getByText(name)).toBeInTheDocument();
            });
        });
    });
    describe('特殊方块显示', () => {
        it('特殊方块应该显示名称和效果描述', () => {
            const gameState = createMockGameState({
                nextPiece: {
                    type: 'BOMB',
                    shape: GAME_CONFIG.SHAPES.BOMB,
                    position: { x: 0, y: 0 },
                    color: GAME_CONFIG.COLORS.BOMB,
                },
            });
            render(_jsx(GameInfo, { gameState: gameState }));
            expect(screen.getByText('💣 炸弹方块')).toBeInTheDocument();
            expect(screen.getByText('消除 3x3 区域')).toBeInTheDocument();
        });
        it('特殊方块应该有粉色边框和发光效果', () => {
            const gameState = createMockGameState({
                nextPiece: {
                    type: 'TIME',
                    shape: GAME_CONFIG.SHAPES.TIME,
                    position: { x: 0, y: 0 },
                    color: GAME_CONFIG.COLORS.TIME,
                },
            });
            const { container } = render(_jsx(GameInfo, { gameState: gameState }));
            // 查找包含特殊方块的 div（应该有粉色边框）
            const specialBlockDivs = Array.from(container.querySelectorAll('div'));
            const hasSpecialBorder = specialBlockDivs.some(div => {
                const style = div.getAttribute('style');
                return style && style.includes('var(--neon-pink)');
            });
            expect(hasSpecialBorder).toBe(true);
        });
        it('不同特殊方块应该显示不同的效果描述', () => {
            const testCases = [
                { type: 'TIME', desc: '暂停敌人攻击 10 秒' },
                { type: 'HEAL', desc: '恢复 5 点生命值' },
                { type: 'SHIELD', desc: '抵挡下一次攻击' },
                { type: 'FREEZE', desc: '冻结敌人 3 秒' },
            ];
            testCases.forEach(({ type, desc }) => {
                const gameState = createMockGameState({
                    nextPiece: {
                        type,
                        shape: GAME_CONFIG.SHAPES[type],
                        position: { x: 0, y: 0 },
                        color: GAME_CONFIG.COLORS[type],
                    },
                });
                render(_jsx(GameInfo, { gameState: gameState }));
                expect(screen.getByText(desc)).toBeInTheDocument();
            });
        });
    });
    describe('基础方块显示', () => {
        it('基础方块不显示额外文字', () => {
            const gameState = createMockGameState({
                nextPiece: {
                    type: 'I',
                    shape: GAME_CONFIG.SHAPES.I,
                    position: { x: 0, y: 0 },
                    color: GAME_CONFIG.COLORS.I,
                },
            });
            render(_jsx(GameInfo, { gameState: gameState }));
            // 基础方块不应该显示名称和描述
            expect(screen.queryByText('直线冲击')).not.toBeInTheDocument();
            expect(screen.queryByText('消除整行，造成穿透伤害')).not.toBeInTheDocument();
        });
        it('所有经典 7 种方块都不显示额外文字', () => {
            const basicBlocks = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'];
            basicBlocks.forEach(type => {
                const gameState = createMockGameState({
                    nextPiece: {
                        type,
                        shape: GAME_CONFIG.SHAPES[type],
                        position: { x: 0, y: 0 },
                        color: GAME_CONFIG.COLORS[type],
                    },
                });
                render(_jsx(GameInfo, { gameState: gameState }));
                // 不应该显示任何卡牌名称
                GAME_CONFIG.CARDS.filter(card => card.type === 'basic').forEach(card => {
                    expect(screen.queryByText(card.name)).not.toBeInTheDocument();
                });
            });
        });
        it('基础方块应该有青色边框', () => {
            const gameState = createMockGameState({
                nextPiece: {
                    type: 'O',
                    shape: GAME_CONFIG.SHAPES.O,
                    position: { x: 0, y: 0 },
                    color: GAME_CONFIG.COLORS.O,
                },
            });
            const { container } = render(_jsx(GameInfo, { gameState: gameState }));
            // 查找包含基础方块的 div（应该有青色边框）
            const basicBlockDivs = Array.from(container.querySelectorAll('div'));
            const hasBasicBorder = basicBlockDivs.some(div => {
                const style = div.getAttribute('style');
                return style && style.includes('var(--neon-cyan)') && !style.includes('var(--neon-pink)');
            });
            expect(hasBasicBorder).toBe(true);
        });
    });
    describe('桌面端布局', () => {
        beforeEach(() => {
            // 设置桌面端宽度
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1024,
            });
        });
        it('应该渲染桌面端布局', () => {
            const gameState = createMockGameState();
            const { container } = render(_jsx(GameInfo, { gameState: gameState }));
            // 桌面端应该是 column 布局
            const infoDivs = Array.from(container.querySelectorAll('div'));
            const hasDesktopLayout = infoDivs.some(div => {
                const style = div.getAttribute('style');
                return style && style.includes('flex-direction: column');
            });
            expect(hasDesktopLayout).toBe(true);
        });
        it('桌面端应该显示所有信息面板', () => {
            const gameState = createMockGameState({
                score: 1500,
                lines: 25,
                level: 3,
            });
            render(_jsx(GameInfo, { gameState: gameState }));
            expect(screen.getByText('下一个')).toBeInTheDocument();
            expect(screen.getByText('分数')).toBeInTheDocument();
            expect(screen.getByText('1,500')).toBeInTheDocument();
            expect(screen.getByText('消除行数')).toBeInTheDocument();
            expect(screen.getByText('25')).toBeInTheDocument();
            expect(screen.getByText('等级')).toBeInTheDocument();
            expect(screen.getByText('3')).toBeInTheDocument();
        });
        it('桌面端特殊方块应该显示名称和描述', () => {
            const gameState = createMockGameState({
                nextPiece: {
                    type: 'CLEAR',
                    shape: GAME_CONFIG.SHAPES.CLEAR,
                    position: { x: 0, y: 0 },
                    color: GAME_CONFIG.COLORS.CLEAR,
                },
            });
            render(_jsx(GameInfo, { gameState: gameState }));
            expect(screen.getByText('🌟 全屏清除')).toBeInTheDocument();
            expect(screen.getByText('清除所有垃圾行')).toBeInTheDocument();
        });
        it('桌面端游戏结束应该显示提示', () => {
            const gameState = createMockGameState({ gameOver: true });
            render(_jsx(GameInfo, { gameState: gameState }));
            expect(screen.getByText('游戏结束')).toBeInTheDocument();
        });
        it('桌面端暂停应该显示提示', () => {
            const gameState = createMockGameState({ paused: true, gameOver: false });
            render(_jsx(GameInfo, { gameState: gameState }));
            expect(screen.getByText('已暂停')).toBeInTheDocument();
        });
    });
    describe('移动端布局', () => {
        beforeEach(() => {
            // 设置移动端宽度
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });
        });
        it('应该渲染移动端布局', () => {
            const gameState = createMockGameState();
            const { container } = render(_jsx(GameInfo, { gameState: gameState }));
            // 移动端应该是 row 布局
            const infoDivs = Array.from(container.querySelectorAll('div'));
            const hasMobileLayout = infoDivs.some(div => {
                const style = div.getAttribute('style');
                return style && style.includes('flex-direction: row');
            });
            expect(hasMobileLayout).toBe(true);
        });
        it('移动端应该显示所有信息面板', () => {
            const gameState = createMockGameState({
                score: 2500,
                lines: 40,
                level: 5,
            });
            render(_jsx(GameInfo, { gameState: gameState }));
            expect(screen.getByText('下一个')).toBeInTheDocument();
            expect(screen.getByText('分数')).toBeInTheDocument();
            expect(screen.getByText('2,500')).toBeInTheDocument();
            expect(screen.getByText('消除')).toBeInTheDocument();
            expect(screen.getByText('40')).toBeInTheDocument();
            expect(screen.getByText('等级')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument();
        });
        it('移动端特殊方块应该显示名称和描述', () => {
            const gameState = createMockGameState({
                nextPiece: {
                    type: 'LIGHTNING',
                    shape: GAME_CONFIG.SHAPES.LIGHTNING,
                    position: { x: 0, y: 0 },
                    color: GAME_CONFIG.COLORS.LIGHTNING,
                },
            });
            render(_jsx(GameInfo, { gameState: gameState }));
            expect(screen.getByText('⚡ 雷电连锁')).toBeInTheDocument();
            expect(screen.getByText('连锁消除相邻方块')).toBeInTheDocument();
        });
        it('移动端游戏结束应该显示提示', () => {
            const gameState = createMockGameState({ gameOver: true });
            render(_jsx(GameInfo, { gameState: gameState }));
            expect(screen.getByText('游戏结束')).toBeInTheDocument();
        });
        it('移动端暂停应该显示提示', () => {
            const gameState = createMockGameState({ paused: true, gameOver: false });
            render(_jsx(GameInfo, { gameState: gameState }));
            expect(screen.getByText('已暂停')).toBeInTheDocument();
        });
    });
    describe('方块形状预览', () => {
        it('应该渲染方块形状预览', () => {
            const gameState = createMockGameState({
                nextPiece: {
                    type: 'T',
                    shape: GAME_CONFIG.SHAPES.T,
                    position: { x: 0, y: 0 },
                    color: GAME_CONFIG.COLORS.T,
                },
            });
            const { container } = render(_jsx(GameInfo, { gameState: gameState }));
            // 应该渲染方块形状（grid 或 svg）
            const hasShapePreview = container.innerHTML.includes('display: grid') ||
                container.innerHTML.includes('<svg');
            expect(hasShapePreview).toBe(true);
        });
        it('特殊方块应该渲染单格形状', () => {
            const gameState = createMockGameState({
                nextPiece: {
                    type: 'BOMB',
                    shape: GAME_CONFIG.SHAPES.BOMB,
                    position: { x: 0, y: 0 },
                    color: GAME_CONFIG.COLORS.BOMB,
                },
            });
            const { container } = render(_jsx(GameInfo, { gameState: gameState }));
            // BOMB 是 1x1 的方块
            expect(container.innerHTML).toContain('15px'); // 移动端小尺寸
        });
    });
    describe('null 和边界情况', () => {
        it('gameState 为 null 时应该返回 null', () => {
            const { container } = render(_jsx(GameInfo, { gameState: null }));
            expect(container.innerHTML).toBe('');
        });
        it('nextPiece 为 null 时不应该崩溃', () => {
            const gameState = createMockGameState({ nextPiece: null });
            const { container } = render(_jsx(GameInfo, { gameState: gameState }));
            // 不应该显示"下一个"标签
            expect(screen.queryByText('下一个')).not.toBeInTheDocument();
            // 但其他信息应该正常显示
            expect(screen.getByText('分数')).toBeInTheDocument();
        });
        it('应该处理大数值分数', () => {
            const gameState = createMockGameState({ score: 1234567 });
            render(_jsx(GameInfo, { gameState: gameState }));
            expect(screen.getByText('1,234,567')).toBeInTheDocument();
        });
    });
    describe('卡牌数据完整性', () => {
        it('所有在 CARDS 中定义的方块都应该能被找到', () => {
            GAME_CONFIG.CARDS.forEach(card => {
                const gameState = createMockGameState({
                    nextPiece: {
                        type: card.id,
                        shape: GAME_CONFIG.SHAPES[card.id],
                        position: { x: 0, y: 0 },
                        color: card.color || GAME_CONFIG.COLORS[card.id],
                    },
                });
                render(_jsx(GameInfo, { gameState: gameState }));
                // 特殊方块应该显示名称
                if (card.type === 'special') {
                    expect(screen.getByText(card.name)).toBeInTheDocument();
                    expect(screen.getByText(card.desc)).toBeInTheDocument();
                }
            });
        });
        it('特殊方块的 type 应该是 special', () => {
            const specialCards = GAME_CONFIG.CARDS.filter(card => card.type === 'special');
            expect(specialCards.length).toBeGreaterThan(0);
            specialCards.forEach(card => {
                expect(card.type).toBe('special');
                expect(card.name).toBeDefined();
                expect(card.desc).toBeDefined();
            });
        });
        it('基础方块的 type 应该是 basic', () => {
            const basicCards = GAME_CONFIG.CARDS.filter(card => card.type === 'basic');
            expect(basicCards.length).toBe(7); // 经典 7 种
            basicCards.forEach(card => {
                expect(card.type).toBe('basic');
            });
        });
    });
});

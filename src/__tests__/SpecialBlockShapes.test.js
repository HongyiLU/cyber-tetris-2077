/**
 * v1.9.17 特殊效果方块单格形状测试
 */
import GAME_CONFIG from '../config/game-config';
const { SHAPES, COLORS, CARDS, GAME } = GAME_CONFIG;
describe('SpecialBlockShapes - v1.9.17', () => {
    // 10 种特殊效果方块 ID
    const SPECIAL_BLOCKS = [
        'BOMB',
        'TIME',
        'HEAL',
        'SHIELD',
        'COMBO',
        'CLEAR',
        'LUCKY',
        'FREEZE',
        'FIRE',
        'LIGHTNING',
    ];
    // 经典 7 种基础方块 ID
    const BASIC_BLOCKS = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'];
    describe('特殊方块形状配置', () => {
        it('所有特殊方块形状应为单格 [[1]]', () => {
            SPECIAL_BLOCKS.forEach((blockId) => {
                const shape = SHAPES[blockId];
                expect(shape).toEqual([[1]]);
            });
        });
        it('BOMB 形状为 [[1]]', () => {
            expect(SHAPES.BOMB).toEqual([[1]]);
        });
        it('TIME 形状为 [[1]]', () => {
            expect(SHAPES.TIME).toEqual([[1]]);
        });
        it('HEAL 形状为 [[1]]', () => {
            expect(SHAPES.HEAL).toEqual([[1]]);
        });
        it('SHIELD 形状为 [[1]]', () => {
            expect(SHAPES.SHIELD).toEqual([[1]]);
        });
        it('COMBO 形状为 [[1]]', () => {
            expect(SHAPES.COMBO).toEqual([[1]]);
        });
        it('CLEAR 形状为 [[1]]', () => {
            expect(SHAPES.CLEAR).toEqual([[1]]);
        });
        it('LUCKY 形状为 [[1]]', () => {
            expect(SHAPES.LUCKY).toEqual([[1]]);
        });
        it('FREEZE 形状为 [[1]]', () => {
            expect(SHAPES.FREEZE).toEqual([[1]]);
        });
        it('FIRE 形状为 [[1]]', () => {
            expect(SHAPES.FIRE).toEqual([[1]]);
        });
        it('LIGHTNING 形状为 [[1]]', () => {
            expect(SHAPES.LIGHTNING).toEqual([[1]]);
        });
    });
    describe('特殊方块颜色配置', () => {
        it('BOMB 颜色应为 #ff6600', () => {
            expect(COLORS.BOMB).toBe('#ff6600');
        });
        it('TIME 颜色应为 #00ccff', () => {
            expect(COLORS.TIME).toBe('#00ccff');
        });
        it('HEAL 颜色应为 #ff69b4', () => {
            expect(COLORS.HEAL).toBe('#ff69b4');
        });
        it('SHIELD 颜色应为 #cccccc', () => {
            expect(COLORS.SHIELD).toBe('#cccccc');
        });
        it('COMBO 颜色应为 #9932cc', () => {
            expect(COLORS.COMBO).toBe('#9932cc');
        });
        it('CLEAR 颜色应为 #ffd700', () => {
            expect(COLORS.CLEAR).toBe('#ffd700');
        });
        it('LUCKY 颜色应为 #32cd32', () => {
            expect(COLORS.LUCKY).toBe('#32cd32');
        });
        it('FREEZE 颜色应为 #87ceeb', () => {
            expect(COLORS.FREEZE).toBe('#87ceeb');
        });
        it('FIRE 颜色应为 #ff4500', () => {
            expect(COLORS.FIRE).toBe('#ff4500');
        });
        it('LIGHTNING 颜色应为 #ffff00', () => {
            expect(COLORS.LIGHTNING).toBe('#ffff00');
        });
    });
    describe('基础方块形状保持不变', () => {
        it('I 方块保持 4 格', () => {
            expect(SHAPES.I).toEqual([[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]]);
        });
        it('O 方块保持 4 格 (2x2)', () => {
            expect(SHAPES.O).toEqual([[1, 1], [1, 1]]);
        });
        it('T 方块保持 4 格', () => {
            expect(SHAPES.T).toEqual([[0, 1, 0], [1, 1, 1], [0, 0, 0]]);
        });
        it('S 方块保持 4 格', () => {
            expect(SHAPES.S).toEqual([[0, 1, 1], [1, 1, 0], [0, 0, 0]]);
        });
        it('Z 方块保持 4 格', () => {
            expect(SHAPES.Z).toEqual([[1, 1, 0], [0, 1, 1], [0, 0, 0]]);
        });
        it('L 方块保持 4 格', () => {
            expect(SHAPES.L).toEqual([[0, 0, 1], [1, 1, 1], [0, 0, 0]]);
        });
        it('J 方块保持 4 格', () => {
            expect(SHAPES.J).toEqual([[1, 0, 0], [1, 1, 1], [0, 0, 0]]);
        });
        it('所有基础方块保持 4 格', () => {
            BASIC_BLOCKS.forEach((blockId) => {
                const shape = SHAPES[blockId];
                const filledCells = shape.flat().filter((cell) => cell === 1).length;
                expect(filledCells).toBe(4);
            });
        });
    });
    describe('特殊方块与基础方块区分', () => {
        it('特殊方块为 1 格，基础方块为 4 格', () => {
            SPECIAL_BLOCKS.forEach((blockId) => {
                const shape = SHAPES[blockId];
                const filledCells = shape.flat().filter((cell) => cell === 1).length;
                expect(filledCells).toBe(1);
            });
            BASIC_BLOCKS.forEach((blockId) => {
                const shape = SHAPES[blockId];
                const filledCells = shape.flat().filter((cell) => cell === 1).length;
                expect(filledCells).toBe(4);
            });
        });
        it('所有方块在配置中都有定义', () => {
            [...SPECIAL_BLOCKS, ...BASIC_BLOCKS].forEach((blockId) => {
                expect(SHAPES[blockId]).toBeDefined();
                expect(COLORS[blockId]).toBeDefined();
            });
        });
    });
    describe('向后兼容性', () => {
        it('GAME_CONFIG 结构完整', () => {
            expect(GAME_CONFIG.SHAPES).toBeDefined();
            expect(GAME_CONFIG.COLORS).toBeDefined();
            expect(GAME_CONFIG.CARDS).toBeDefined();
            expect(GAME_CONFIG.GAME).toBeDefined();
        });
        it('基础方块颜色保持不变', () => {
            expect(COLORS.I).toBe('#00ffff');
            expect(COLORS.O).toBe('#ffff00');
            expect(COLORS.T).toBe('#da70d6');
        });
        it('特殊方块卡牌配置正确', () => {
            const specialCards = CARDS.filter((card) => card.type === 'special');
            expect(specialCards.length).toBe(10);
        });
        it('基础方块卡牌配置正确', () => {
            const basicCards = CARDS.filter((card) => card.type === 'basic');
            expect(basicCards.length).toBe(7);
        });
    });
});

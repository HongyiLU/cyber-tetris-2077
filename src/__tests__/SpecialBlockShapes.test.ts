/**
 * v1.9.17 特殊效果方块单格形状测试
 */

import GAME_CONFIG from '../config/game-config';

const { SHAPES, COLORS, CARDS, GAME } = GAME_CONFIG;

describe('SpecialBlockShapes - v1.9.17', () => {
  // 10 种特殊效果方块 ID
  const SPECIAL_BLOCKS = [
    'bomb_block',
    'time_stop',
    'heal_block',
    'shield_block',
    'combo_block',
    'clear_block',
    'lucky_block',
    'freeze_block',
    'fire_block',
    'lightning_block',
  ];

  // 经典 7 种基础方块 ID
  const BASIC_BLOCKS = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'];

  describe('特殊方块形状配置', () => {
    it('所有特殊方块形状应为单格 [[1]]', () => {
      SPECIAL_BLOCKS.forEach((blockId: string) => {
        const shape = (SHAPES as any)[blockId];
        expect(shape).toEqual([[1]]);
      });
    });

    it('bomb_block 形状为 [[1]]', () => {
      expect((SHAPES as any).bomb_block).toEqual([[1]]);
    });

    it('time_stop 形状为 [[1]]', () => {
      expect((SHAPES as any).time_stop).toEqual([[1]]);
    });

    it('heal_block 形状为 [[1]]', () => {
      expect((SHAPES as any).heal_block).toEqual([[1]]);
    });

    it('shield_block 形状为 [[1]]', () => {
      expect((SHAPES as any).shield_block).toEqual([[1]]);
    });

    it('combo_block 形状为 [[1]]', () => {
      expect((SHAPES as any).combo_block).toEqual([[1]]);
    });

    it('clear_block 形状为 [[1]]', () => {
      expect((SHAPES as any).clear_block).toEqual([[1]]);
    });

    it('lucky_block 形状为 [[1]]', () => {
      expect((SHAPES as any).lucky_block).toEqual([[1]]);
    });

    it('freeze_block 形状为 [[1]]', () => {
      expect((SHAPES as any).freeze_block).toEqual([[1]]);
    });

    it('fire_block 形状为 [[1]]', () => {
      expect((SHAPES as any).fire_block).toEqual([[1]]);
    });

    it('lightning_block 形状为 [[1]]', () => {
      expect((SHAPES as any).lightning_block).toEqual([[1]]);
    });
  });

  describe('特殊方块颜色配置', () => {
    it('bomb_block 颜色应为 #ff6600', () => {
      expect((COLORS as any).bomb_block).toBe('#ff6600');
    });

    it('time_stop 颜色应为 #00ccff', () => {
      expect((COLORS as any).time_stop).toBe('#00ccff');
    });

    it('heal_block 颜色应为 #ff69b4', () => {
      expect((COLORS as any).heal_block).toBe('#ff69b4');
    });

    it('shield_block 颜色应为 #cccccc', () => {
      expect((COLORS as any).shield_block).toBe('#cccccc');
    });

    it('combo_block 颜色应为 #9932cc', () => {
      expect((COLORS as any).combo_block).toBe('#9932cc');
    });

    it('clear_block 颜色应为 #ffd700', () => {
      expect((COLORS as any).clear_block).toBe('#ffd700');
    });

    it('lucky_block 颜色应为 #32cd32', () => {
      expect((COLORS as any).lucky_block).toBe('#32cd32');
    });

    it('freeze_block 颜色应为 #87ceeb', () => {
      expect((COLORS as any).freeze_block).toBe('#87ceeb');
    });

    it('fire_block 颜色应为 #ff4500', () => {
      expect((COLORS as any).fire_block).toBe('#ff4500');
    });

    it('lightning_block 颜色应为 #ffff00', () => {
      expect((COLORS as any).lightning_block).toBe('#ffff00');
    });
  });

  describe('基础方块形状保持不变', () => {
    it('I 方块保持 4 格', () => {
      expect(SHAPES.I).toEqual([[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]);
    });

    it('O 方块保持 4 格 (2x2)', () => {
      expect(SHAPES.O).toEqual([[1,1],[1,1]]);
    });

    it('T 方块保持 4 格', () => {
      expect(SHAPES.T).toEqual([[0,1,0],[1,1,1],[0,0,0]]);
    });

    it('S 方块保持 4 格', () => {
      expect(SHAPES.S).toEqual([[0,1,1],[1,1,0],[0,0,0]]);
    });

    it('Z 方块保持 4 格', () => {
      expect(SHAPES.Z).toEqual([[1,1,0],[0,1,1],[0,0,0]]);
    });

    it('L 方块保持 4 格', () => {
      expect(SHAPES.L).toEqual([[0,0,1],[1,1,1],[0,0,0]]);
    });

    it('J 方块保持 4 格', () => {
      expect(SHAPES.J).toEqual([[1,0,0],[1,1,1],[0,0,0]]);
    });

    it('所有基础方块保持 4 格', () => {
      BASIC_BLOCKS.forEach((blockId: string) => {
        const shape = (SHAPES as any)[blockId];
        const filledCells = shape.flat().filter((cell: number) => cell === 1).length;
        expect(filledCells).toBe(4);
      });
    });
  });

  describe('特殊方块与基础方块区分', () => {
    it('特殊方块为 1 格，基础方块为 4 格', () => {
      SPECIAL_BLOCKS.forEach((blockId: string) => {
        const shape = (SHAPES as any)[blockId];
        const filledCells = shape.flat().filter((cell: number) => cell === 1).length;
        expect(filledCells).toBe(1);
      });

      BASIC_BLOCKS.forEach((blockId: string) => {
        const shape = (SHAPES as any)[blockId];
        const filledCells = shape.flat().filter((cell: number) => cell === 1).length;
        expect(filledCells).toBe(4);
      });
    });

    it('所有方块在配置中都有定义', () => {
      [...SPECIAL_BLOCKS, ...BASIC_BLOCKS].forEach((blockId: string) => {
        expect((SHAPES as any)[blockId]).toBeDefined();
        expect((COLORS as any)[blockId]).toBeDefined();
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
      const specialCards = CARDS.filter((card: any) => card.type === 'special');
      expect(specialCards.length).toBe(10);
    });

    it('基础方块卡牌配置正确', () => {
      const basicCards = CARDS.filter((card: any) => card.type === 'basic');
      expect(basicCards.length).toBe(7);
    });
  });
});

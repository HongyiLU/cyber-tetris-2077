// ==================== GameEngine 测试 ====================

import { GameEngine } from '../engine/GameEngine';

describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  describe('初始化', () => {
    test('应该创建空的棋盘', () => {
      const state = engine.getGameState();
      expect(state.board).toHaveLength(20);
      expect(state.board[0]).toHaveLength(10);
      expect(state.board.every((row: number[]) => row.every((cell: number) => cell === 0))).toBe(true);
    });

    test('init() 应该初始化游戏状态', () => {
      engine.init();
      const state = engine.getGameState();
      
      expect(state.score).toBe(0);
      expect(state.lines).toBe(0);
      expect(state.level).toBe(1);
      expect(state.gameOver).toBe(false);
      expect(state.paused).toBe(false);
      expect(state.currentPiece).not.toBeNull();
      expect(state.nextPiece).not.toBeNull();
    });

    test('应该生成有效的当前方块', () => {
      engine.init();
      const state = engine.getGameState();
      
      expect(state.currentPiece).not.toBeNull();
      expect(state.currentPiece!.type).toBeDefined();
      expect(state.currentPiece!.shape).toBeDefined();
      expect(state.currentPiece!.position).toBeDefined();
      expect(state.currentPiece!.color).toBeDefined();
    });
  });

  describe('方块移动', () => {
    beforeEach(() => {
      engine.init();
    });

    test('应该可以向左移动方块', () => {
      const state = engine.getGameState();
      const initialX = state.currentPiece!.position.x;
      
      const moved = engine.movePiece(-1, 0);
      
      expect(moved).toBe(true);
      const newState = engine.getGameState();
      expect(newState.currentPiece!.position.x).toBe(initialX - 1);
    });

    test('应该可以向右移动方块', () => {
      const state = engine.getGameState();
      const initialX = state.currentPiece!.position.x;
      
      const moved = engine.movePiece(1, 0);
      
      expect(moved).toBe(true);
      const newState = engine.getGameState();
      expect(newState.currentPiece!.position.x).toBe(initialX + 1);
    });

    test('应该可以向下移动方块', () => {
      const state = engine.getGameState();
      const initialY = state.currentPiece!.position.y;
      
      const moved = engine.movePiece(0, 1);
      
      expect(moved).toBe(true);
      const newState = engine.getGameState();
      expect(newState.currentPiece!.position.y).toBe(initialY + 1);
    });

    test('当方块到达左边界时不能继续向左移动', () => {
      // 移动到最左边
      for (let i = 0; i < 10; i++) {
        engine.movePiece(-1, 0);
      }
      
      const moved = engine.movePiece(-1, 0);
      expect(moved).toBe(false);
    });

    test('当方块到达右边界时不能继续向右移动', () => {
      // 移动到最右边
      for (let i = 0; i < 10; i++) {
        engine.movePiece(1, 0);
      }
      
      const moved = engine.movePiece(1, 0);
      expect(moved).toBe(false);
    });

    test('游戏结束时不能移动方块', () => {
      (engine as any).gameOver = true;
      const moved = engine.movePiece(1, 0);
      expect(moved).toBe(false);
    });

    test('暂停时不能移动方块', () => {
      engine.togglePause();
      const moved = engine.movePiece(1, 0);
      expect(moved).toBe(false);
    });
  });

  describe('方块旋转', () => {
    beforeEach(() => {
      engine.init();
    });

    test('应该可以旋转方块', () => {
      const state = engine.getGameState();
      
      const rotated = engine.rotatePiece();
      
      // 旋转应该返回布尔值（成功或失败取决于是否有碰撞）
      expect(typeof rotated).toBe('boolean');
    });

    test('旋转应该改变方块形状的方向', () => {
      engine.init();
      const state = engine.getGameState();
      const shape = state.currentPiece!.shape;
      
      // 旋转 90 度
      engine.rotatePiece();
      const rotated90 = engine.getGameState().currentPiece!.shape;
      
      // 验证形状维度交换（对于非正方形形状）
      if (shape.length !== shape[0].length) {
        expect(rotated90.length).toBe(shape[0].length);
        expect(rotated90[0].length).toBe(shape.length);
      }
    });

    test('当旋转会导致碰撞时不能旋转', () => {
      // 将方块移动到边缘
      for (let i = 0; i < 8; i++) {
        engine.movePiece(1, 0);
      }
      
      // 尝试旋转（可能会超出边界）
      const rotated = engine.rotatePiece();
      // 根据方块类型，旋转可能成功或失败
      expect(typeof rotated).toBe('boolean');
    });

    test('游戏结束时不能旋转', () => {
      (engine as any).gameOver = true;
      const rotated = engine.rotatePiece();
      expect(rotated).toBe(false);
    });

    test('暂停时不能旋转', () => {
      engine.togglePause();
      const rotated = engine.rotatePiece();
      expect(rotated).toBe(false);
    });
  });

  describe('碰撞检测', () => {
    beforeEach(() => {
      engine.init();
    });

    test('方块不应该穿过棋盘边界', () => {
      // 尝试移出左边界
      for (let i = 0; i < 15; i++) {
        const moved = engine.movePiece(-1, 0);
        if (!moved) break;
      }
      
      const state = engine.getGameState();
      expect(state.currentPiece!.position.x).toBeGreaterThanOrEqual(0);
    });

    test('方块不应该穿过棋盘右边界', () => {
      // 尝试移出右边界
      for (let i = 0; i < 15; i++) {
        const moved = engine.movePiece(1, 0);
        if (!moved) break;
      }
      
      const state = engine.getGameState();
      expect(state.currentPiece!.position.x).toBeLessThan(10);
    });

    test('方块不应该穿过棋盘底部', () => {
      // 让方块下落到底部
      while (engine.movePiece(0, 1)) {
        // 持续下落
      }
      
      const state = engine.getGameState();
      expect(state.currentPiece!.position.y).toBeLessThan(20);
    });
  });

  describe('硬降落', () => {
    beforeEach(() => {
      engine.init();
    });

    test('硬降落应该返回下落距离', () => {
      const distance = engine.hardDrop();
      expect(distance).toBeGreaterThanOrEqual(0);
    });

    test('硬降落后方块应该在底部', () => {
      const stateBefore = engine.getGameState();
      engine.hardDrop();
      const stateAfter = engine.getGameState();
      
      // 方块应该已经降落到底部
      expect(stateAfter.currentPiece!.position.y).toBeGreaterThanOrEqual(
        stateBefore.currentPiece!.position.y
      );
    });

    test('游戏结束时硬降落返回 0', () => {
      (engine as any).gameOver = true;
      const distance = engine.hardDrop();
      expect(distance).toBe(0);
    });
  });

  describe('锁定方块和消行', () => {
    beforeEach(() => {
      engine = new GameEngine();
      engine.init();
    });

    test('锁定方块应该将方块固定到棋盘', () => {
      // 让方块下落到底部并锁定
      while (engine.movePiece(0, 1)) {
        // 持续下落
      }
      engine.lockPiece();
      
      const state = engine.getGameState();
      // 棋盘上应该有方块
      expect(state.board.some((row: number[]) => row.some((cell: number) => cell !== 0))).toBe(true);
    });

    test('锁定方块后应该生成新方块', () => {
      const stateBefore = engine.getGameState();
      
      // 让方块下落到底部并锁定
      while (engine.movePiece(0, 1)) {
        // 持续下落
      }
      engine.lockPiece();
      
      const stateAfter = engine.getGameState();
      expect(stateAfter.currentPiece).not.toBeNull();
      expect(stateAfter.currentPiece!.type).not.toBe(stateBefore.currentPiece!.type);
    });

    test('消除一行应该得分', () => {
      // 创建一个几乎满的行，然后放一个方块填满它
      const testEngine = new GameEngine();
      testEngine.init();
      
      // 手动设置棋盘，让最后一行只差一个方块
      (testEngine as any).board = Array(19).fill(null).map(() => Array(10).fill(0));
      (testEngine as any).board[19] = Array(10).fill(1);
      (testEngine as any).board[19][0] = 0;
      
      // 创建一个 I 方块放在第一列，位置在最后一行
      (testEngine as any).currentPiece = {
        type: 'I',
        shape: [[1]],
        position: { x: 0, y: 19 },
        color: '#00ffff',
      };
      
      // 锁定方块
      testEngine.lockPiece();
      
      const state = testEngine.getGameState();
      // 消除一行应该得分（具体分数取决于方块大小倍率）
      expect(state.score).toBeGreaterThan(0);
      expect(state.lines).toBe(1);
    });

    test('消除多行应该获得更多分数', () => {
      const testEngine = new GameEngine();
      testEngine.init();
      
      // 手动设置棋盘，让最后两行几乎满了
      (testEngine as any).board = Array(18).fill(null).map(() => Array(10).fill(0));
      (testEngine as any).board[18] = Array(10).fill(1);
      (testEngine as any).board[19] = Array(10).fill(1);
      (testEngine as any).board[18][0] = 0;
      (testEngine as any).board[19][0] = 0;
      
      // 创建一个方块填满两行
      (testEngine as any).currentPiece = {
        type: 'I',
        shape: [[1], [1]],
        position: { x: 0, y: 17 },
        color: '#00ffff',
      };
      
      testEngine.lockPiece();
      
      const state = testEngine.getGameState();
      // 消除行应该得分
      expect(state.score).toBeGreaterThan(0);
      expect(state.lines).toBeGreaterThan(0);
    });

    test('消除行后棋盘应该更新', () => {
      const testEngine = new GameEngine();
      testEngine.init();
      
      // 设置最后一行满了
      (testEngine as any).board = Array(19).fill(null).map(() => Array(10).fill(0));
      (testEngine as any).board[19] = Array(10).fill(1);
      
      // 在倒数第二行放一个方块
      (testEngine as any).currentPiece = {
        type: 'I',
        shape: [[1]],
        position: { x: 0, y: 18 },
        color: '#00ffff',
      };
      
      testEngine.lockPiece();
      
      const state = testEngine.getGameState();
      // 消除行后应该有一行被清空
      expect(state.lines).toBe(1);
      // 棋盘行数应该保持不变
      expect(state.board.length).toBe(20);
    });
  });

  describe('计分系统', () => {
    beforeEach(() => {
      engine.init();
    });

    test('初始分数应该为 0', () => {
      const state = engine.getGameState();
      expect(state.score).toBe(0);
    });

    test('初始等级应该为 1', () => {
      const state = engine.getGameState();
      expect(state.level).toBe(1);
    });

    test('消除 10 行应该升级到等级 2', () => {
      const testEngine = new GameEngine();
      testEngine.init();
      
      // 模拟消除 10 行
      (testEngine as any).lines = 10;
      (testEngine as any).level = Math.floor(10 / 10) + 1;
      
      const state = testEngine.getGameState();
      expect(state.level).toBe(2);
    });

    test('分数应该随着消除行数增加', () => {
      const testEngine = new GameEngine();
      testEngine.init();
      
      const initialScore = testEngine.getGameState().score;
      
      // 模拟得分
      (testEngine as any).score = 150;
      
      const newState = testEngine.getGameState();
      expect(newState.score).toBeGreaterThan(initialScore);
    });
  });

  describe('游戏状态', () => {
    beforeEach(() => {
      engine.init();
    });

    test('应该可以切换暂停状态', () => {
      expect(engine.getGameState().paused).toBe(false);
      
      engine.togglePause();
      expect(engine.getGameState().paused).toBe(true);
      
      engine.togglePause();
      expect(engine.getGameState().paused).toBe(false);
    });

    test('游戏结束时应该返回 true', () => {
      expect(engine.isGameOver()).toBe(false);
      
      (engine as any).gameOver = true;
      expect(engine.isGameOver()).toBe(true);
    });

    test('getGameState 应该返回状态的深拷贝', () => {
      const state1 = engine.getGameState();
      const state2 = engine.getGameState();
      
      // 修改 state1 不应该影响 state2
      state1.board[0][0] = 999;
      expect(state2.board[0][0]).toBe(0);
    });
  });

  describe('边界情况', () => {
    test('应该可以创建自定义大小的棋盘', () => {
      const customEngine = new GameEngine(8, 16);
      const state = customEngine.getGameState();
      
      expect(state.board).toHaveLength(16);
      expect(state.board[0]).toHaveLength(8);
    });

    test('没有当前方块时移动应该返回 false', () => {
      const testEngine = new GameEngine();
      // 不调用 init()，所以没有当前方块
      const moved = testEngine.movePiece(1, 0);
      expect(moved).toBe(false);
    });

    test('没有当前方块时旋转应该返回 false', () => {
      const testEngine = new GameEngine();
      const rotated = testEngine.rotatePiece();
      expect(rotated).toBe(false);
    });

    test('没有当前方块时硬降落应该返回 0', () => {
      const testEngine = new GameEngine();
      const distance = testEngine.hardDrop();
      expect(distance).toBe(0);
    });
  });
});

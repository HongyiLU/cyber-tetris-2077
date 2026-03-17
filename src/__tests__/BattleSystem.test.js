// ==================== 战斗系统专项测试 ====================
// v1.4.0 Day 7 测试优化 - 完整战斗流程测试
import { GameEngine } from '../engine/GameEngine';
import { GAME_CONFIG } from '../config/game-config';
import { BattleState } from '../types';
describe('战斗系统 - v1.4.0 完整流程测试', () => {
    let engine;
    beforeEach(() => {
        engine = new GameEngine();
    });
    describe('1. 完整流程测试', () => {
        test('初始化战斗时血量正确显示', () => {
            engine.initBattle('slime');
            const state = engine.getGameState();
            expect(state.playerHp).toBe(100);
            expect(state.playerMaxHp).toBe(100);
            expect(state.enemyHp).toBe(200);
            expect(state.enemyMaxHp).toBe(200);
            expect(state.battleState).toBe(BattleState.FIGHTING);
        });
        test('负数伤害对玩家无效', () => {
            engine.initBattle('slime');
            const initialHp = engine.getGameState().playerHp;
            // 尝试造成负数伤害
            engine.takeDamage(-50);
            // 血量应该不变
            expect(engine.getGameState().playerHp).toBe(initialHp);
        });
        test('负数伤害对敌人无效', () => {
            engine.initBattle('slime');
            const initialHp = engine.getGameState().enemyHp;
            // 尝试造成负数伤害
            engine.enemyTakeDamage(-50);
            // 血量应该不变
            expect(engine.getGameState().enemyHp).toBe(initialHp);
        });
        test('消行对敌人造成伤害', () => {
            engine.initBattle('slime');
            // 模拟消 4 行造成 80 伤害
            engine.enemyTakeDamage(80);
            expect(engine.getGameState().enemyHp).toBe(120);
        });
        test('敌人 AI 每 10 秒攻击玩家', () => {
            engine.initBattle('slime');
            const startTime = Date.now();
            // 初始血量
            expect(engine.getGameState().playerHp).toBe(100);
            // 10 秒后触发第一次攻击
            engine.updateEnemyAI(startTime + 10000);
            expect(engine.getGameState().playerHp).toBe(90); // 受到 10 伤害
            // 15 秒时不触发（未到下次攻击时间）
            engine.updateEnemyAI(startTime + 15000);
            expect(engine.getGameState().playerHp).toBe(90); // 血量不变
            // 20 秒后触发第二次攻击
            engine.updateEnemyAI(startTime + 20000);
            expect(engine.getGameState().playerHp).toBe(80); // 再次受到 10 伤害
        });
        test('敌人 HP 归零显示胜利', () => {
            engine.initBattle('slime');
            // 造成 200 点伤害击败敌人
            engine.enemyTakeDamage(200);
            expect(engine.isEnemyDead()).toBe(true);
            expect(engine.getGameState().battleState).toBe(BattleState.WON);
        });
        test('玩家 HP 归零显示失败', () => {
            engine.initBattle('slime');
            // 受到 100 点伤害击败玩家
            engine.takeDamage(100);
            expect(engine.isPlayerDead()).toBe(true);
            expect(engine.getGameState().battleState).toBe(BattleState.LOST);
        });
    });
    describe('2. 边界条件测试', () => {
        test('同时消行和受到攻击 - 血量计算正确', () => {
            engine.initBattle('slime');
            const startTime = Date.now();
            // 玩家对敌人造成伤害
            engine.enemyTakeDamage(80); // 消 4 行
            expect(engine.getGameState().enemyHp).toBe(120);
            // 同时敌人攻击玩家
            engine.updateEnemyAI(startTime + 10000);
            expect(engine.getGameState().playerHp).toBe(90);
            // 双方都存活，战斗继续
            expect(engine.getGameState().battleState).toBe(BattleState.FIGHTING);
        });
        test('血量刚好归零 - 触发正确状态', () => {
            engine.initBattle('slime');
            // 造成恰好 200 伤害
            engine.enemyTakeDamage(100);
            engine.enemyTakeDamage(100);
            expect(engine.getGameState().enemyHp).toBe(0);
            expect(engine.getGameState().battleState).toBe(BattleState.WON);
        });
        test('连续快速消行 - 伤害累加正确', () => {
            engine.initBattle('slime');
            // 连续消行：4 行 + 3 行 + 2 行 + 1 行
            engine.enemyTakeDamage(80); // 4 行
            engine.enemyTakeDamage(45); // 3 行
            engine.enemyTakeDamage(25); // 2 行
            engine.enemyTakeDamage(10); // 1 行
            expect(engine.getGameState().enemyHp).toBe(40); // 200 - 160 = 40
        });
        test('战斗结束后不能继续操作', () => {
            engine.initBattle('slime');
            // 结束战斗
            engine.enemyTakeDamage(200);
            expect(engine.getGameState().battleState).toBe(BattleState.WON);
            // 战斗结束后，敌人 AI 不应再攻击
            const playerHpBefore = engine.getGameState().playerHp;
            engine.updateEnemyAI(Date.now() + 10000);
            // 血量不应再变化
            expect(engine.getGameState().playerHp).toBe(playerHpBefore);
        });
    });
    describe('3. 伤害计算验证', () => {
        test('消 1 行 = 10 伤害', () => {
            engine.initBattle('slime');
            engine.enemyTakeDamage(10);
            expect(engine.getGameState().enemyHp).toBe(190);
        });
        test('消 2 行 = 25 伤害', () => {
            engine.initBattle('slime');
            engine.enemyTakeDamage(25);
            expect(engine.getGameState().enemyHp).toBe(175);
        });
        test('消 3 行 = 45 伤害', () => {
            engine.initBattle('slime');
            engine.enemyTakeDamage(45);
            expect(engine.getGameState().enemyHp).toBe(155);
        });
        test('消 4 行 = 80 伤害', () => {
            engine.initBattle('slime');
            engine.enemyTakeDamage(80);
            expect(engine.getGameState().enemyHp).toBe(120);
        });
        test('伤害不会超过最大血量', () => {
            engine.initBattle('slime');
            // 造成过量伤害
            engine.enemyTakeDamage(500);
            expect(engine.getGameState().enemyHp).toBe(0);
            expect(engine.getGameState().battleState).toBe(BattleState.WON);
        });
    });
    describe('4. 敌人 AI 行为验证', () => {
        test('敌人攻击生成垃圾行', () => {
            engine.initBattle('slime');
            // 获取初始棋盘底部行状态
            const stateBefore = engine.getGameState();
            const bottomRowBefore = stateBefore.board[stateBefore.board.length - 1];
            // 触发敌人攻击
            engine.updateEnemyAI(Date.now() + 10000);
            // 检查底部生成了垃圾行（大部分是 1，有一个 0 缺口）
            const stateAfter = engine.getGameState();
            const bottomRowAfter = stateAfter.board[stateAfter.board.length - 1];
            const ones = bottomRowAfter.filter(cell => cell === 1).length;
            expect(ones).toBe(GAME_CONFIG.GAME.COLS - 1); // 只有一个缺口
        });
        test('敌人攻击造成 10 点伤害', () => {
            engine.initBattle('slime');
            engine.updateEnemyAI(Date.now() + 10000);
            expect(engine.getGameState().playerHp).toBe(90);
        });
        test('非战斗状态敌人 AI 不攻击', () => {
            engine.init(); // 普通游戏，非战斗模式
            const playerHpBefore = engine.getGameState().playerHp;
            engine.updateEnemyAI(Date.now() + 10000);
            // 血量不应变化
            expect(engine.getGameState().playerHp).toBe(playerHpBefore);
        });
    });
    describe('5. 战斗状态同步', () => {
        test('战斗状态正确同步到游戏状态', () => {
            engine.initBattle('slime');
            let state = engine.getGameState();
            expect(state.battleState).toBe(BattleState.FIGHTING);
            expect(state.playerHp).toBe(100);
            expect(state.enemyHp).toBe(200);
            // 玩家受伤
            engine.takeDamage(50);
            state = engine.getGameState();
            expect(state.playerHp).toBe(50);
            expect(state.battleState).toBe(BattleState.FIGHTING);
            // 敌人受伤
            engine.enemyTakeDamage(100);
            state = engine.getGameState();
            expect(state.enemyHp).toBe(100);
            expect(state.battleState).toBe(BattleState.FIGHTING);
        });
        test('胜利状态不可逆', () => {
            engine.initBattle('slime');
            engine.enemyTakeDamage(200);
            expect(engine.getGameState().battleState).toBe(BattleState.WON);
            // 尝试继续造成伤害
            engine.enemyTakeDamage(100);
            // 状态保持胜利
            expect(engine.getGameState().battleState).toBe(BattleState.WON);
            expect(engine.getGameState().enemyHp).toBe(0);
        });
        test('失败状态不可逆', () => {
            engine.initBattle('slime');
            engine.takeDamage(100);
            expect(engine.getGameState().battleState).toBe(BattleState.LOST);
            // 尝试继续治疗（如果有）
            // 状态保持失败
            expect(engine.getGameState().battleState).toBe(BattleState.LOST);
            expect(engine.getGameState().playerHp).toBe(0);
        });
    });
    describe('6. 血量条比例计算', () => {
        test('血量百分比计算正确', () => {
            engine.initBattle('slime');
            // 50% 血量
            engine.takeDamage(50);
            expect((engine.getGameState().playerHp / engine.getGameState().playerMaxHp) * 100).toBe(50);
            // 25% 血量
            engine.enemyTakeDamage(150);
            expect((engine.getGameState().enemyHp / engine.getGameState().enemyMaxHp) * 100).toBe(25);
        });
        test('满血时百分比为 100', () => {
            engine.initBattle('slime');
            expect((engine.getGameState().playerHp / engine.getGameState().playerMaxHp) * 100).toBe(100);
            expect((engine.getGameState().enemyHp / engine.getGameState().enemyMaxHp) * 100).toBe(100);
        });
        test('空血时百分比为 0', () => {
            engine.initBattle('slime');
            engine.takeDamage(100);
            engine.enemyTakeDamage(200);
            expect((engine.getGameState().playerHp / engine.getGameState().playerMaxHp) * 100).toBe(0);
            expect((engine.getGameState().enemyHp / engine.getGameState().enemyMaxHp) * 100).toBe(0);
        });
    });
});

/**
 * 排行榜系统测试
 */
import { LeaderboardSystem } from '../systems/LeaderboardSystem';
describe('LeaderboardSystem', () => {
    let system;
    beforeEach(() => {
        system = new LeaderboardSystem();
    });
    describe('初始化', () => {
        test('应该正确初始化三个排行榜', () => {
            const leaderboards = system.getAllLeaderboards();
            expect(leaderboards.length).toBe(3);
            expect(leaderboards.some(lb => lb.type === 'combo')).toBe(true);
            expect(leaderboards.some(lb => lb.type === 'speed')).toBe(true);
            expect(leaderboards.some(lb => lb.type === 'score')).toBe(true);
        });
        test('应该使用默认配置', () => {
            const leaderboard = system.getLeaderboard('combo');
            expect(leaderboard.maxEntries).toBe(10);
        });
        test('应该支持自定义配置', () => {
            const customSystem = new LeaderboardSystem({ maxEntries: 5 });
            const leaderboard = customSystem.getLeaderboard('combo');
            expect(leaderboard.maxEntries).toBe(5);
        });
    });
    describe('添加记录', () => {
        test('应该添加新记录到空排行榜', () => {
            const result = system.addEntry('combo', 'Player1', 10);
            expect(result.success).toBe(true);
            expect(result.rank).toBe(1);
            const leaderboard = system.getLeaderboard('combo');
            expect(leaderboard.entries.length).toBe(1);
        });
        test('应该按降序排序（连击榜）', () => {
            system.addEntry('combo', 'Player1', 10);
            system.addEntry('combo', 'Player2', 20);
            system.addEntry('combo', 'Player3', 15);
            const leaderboard = system.getLeaderboard('combo');
            expect(leaderboard.entries[0].value).toBe(20);
            expect(leaderboard.entries[1].value).toBe(15);
            expect(leaderboard.entries[2].value).toBe(10);
        });
        test('应该按升序排序（速度榜）', () => {
            system.addEntry('speed', 'Player1', 60);
            system.addEntry('speed', 'Player2', 45);
            system.addEntry('speed', 'Player3', 50);
            const leaderboard = system.getLeaderboard('speed');
            expect(leaderboard.entries[0].value).toBe(45);
            expect(leaderboard.entries[1].value).toBe(50);
            expect(leaderboard.entries[2].value).toBe(60);
        });
        test('应该限制条目数量', () => {
            for (let i = 1; i <= 15; i++) {
                system.addEntry('combo', `Player${i}`, i * 10);
            }
            const leaderboard = system.getLeaderboard('combo');
            expect(leaderboard.entries.length).toBe(10);
            expect(leaderboard.entries[0].value).toBe(150);
        });
        test('低分不应该进入排行榜（降序）', () => {
            system.addEntry('combo', 'Player1', 100);
            system.addEntry('combo', 'Player2', 90);
            // 填满排行榜
            for (let i = 3; i <= 10; i++) {
                system.addEntry('combo', `Player${i}`, 100 - i * 10);
            }
            const result = system.addEntry('combo', 'LowPlayer', 5);
            expect(result.success).toBe(false);
            const leaderboard = system.getLeaderboard('combo');
            expect(leaderboard.entries.some(e => e.playerName === 'LowPlayer')).toBe(false);
        });
        test('应该返回正确排名', () => {
            system.addEntry('combo', 'Player1', 30);
            system.addEntry('combo', 'Player2', 50);
            const result = system.addEntry('combo', 'Player3', 40);
            expect(result.rank).toBe(2);
        });
    });
    describe('查询功能', () => {
        beforeEach(() => {
            system.addEntry('combo', 'Player1', 10);
            system.addEntry('combo', 'Player1', 20);
            system.addEntry('combo', 'Player2', 15);
        });
        test('应该获取玩家最佳记录', () => {
            const best = system.getPlayerBest('combo', 'Player1');
            expect(best).not.toBeNull();
            expect(best?.value).toBe(20);
        });
        test('应该获取玩家排名', () => {
            const rank = system.getPlayerRank('combo', 'Player1');
            expect(rank).toBe(1);
        });
        test('不存在的玩家应该返回 null', () => {
            const best = system.getPlayerBest('combo', 'NonExistent');
            const rank = system.getPlayerRank('combo', 'NonExistent');
            expect(best).toBeNull();
            expect(rank).toBeNull();
        });
    });
    describe('元数据', () => {
        test('应该保存元数据', () => {
            const metadata = { enemyType: 'dragon', equipment: ['sword', 'shield'] };
            system.addEntry('score', 'Player1', 1000, metadata);
            const leaderboard = system.getLeaderboard('score');
            expect(leaderboard.entries[0].metadata).toEqual(metadata);
        });
    });
    describe('清空', () => {
        test('应该清空指定排行榜', () => {
            system.addEntry('combo', 'Player1', 10);
            system.addEntry('score', 'Player1', 100);
            system.clear('combo');
            const combo = system.getLeaderboard('combo');
            const score = system.getLeaderboard('score');
            expect(combo.entries.length).toBe(0);
            expect(score.entries.length).toBe(1);
        });
        test('应该清空所有排行榜', () => {
            system.addEntry('combo', 'Player1', 10);
            system.addEntry('speed', 'Player1', 30);
            system.addEntry('score', 'Player1', 100);
            system.clear();
            const leaderboards = system.getAllLeaderboards();
            leaderboards.forEach(lb => {
                expect(lb.entries.length).toBe(0);
            });
        });
    });
    describe('序列化/反序列化', () => {
        test('应该正确序列化状态', () => {
            system.addEntry('combo', 'Player1', 10);
            system.addEntry('combo', 'Player2', 20);
            const serialized = system.serialize();
            expect(serialized).toContain('Player1');
            expect(serialized).toContain('Player2');
        });
        test('应该正确反序列化状态', () => {
            system.addEntry('combo', 'Player1', 10);
            system.addEntry('combo', 'Player2', 20);
            const serialized = system.serialize();
            const loadedSystem = LeaderboardSystem.deserialize(serialized);
            const leaderboard = loadedSystem.getLeaderboard('combo');
            expect(leaderboard.entries.length).toBe(2);
            expect(leaderboard.entries[0].value).toBe(20);
        });
    });
    describe('localStorage 集成', () => {
        test('应该保存到 localStorage', () => {
            system.addEntry('combo', 'Player1', 10);
            system.saveToStorage('test_leaderboard');
            const saved = localStorage.getItem('test_leaderboard');
            expect(saved).not.toBeNull();
            expect(saved).toContain('Player1');
            localStorage.removeItem('test_leaderboard');
        });
        test('应该从 localStorage 加载', () => {
            system.addEntry('combo', 'Player1', 10);
            system.addEntry('combo', 'Player2', 20);
            system.saveToStorage('test_leaderboard_load');
            const loadedSystem = LeaderboardSystem.loadFromStorage('test_leaderboard_load');
            expect(loadedSystem).not.toBeNull();
            const leaderboard = loadedSystem.getLeaderboard('combo');
            expect(leaderboard.entries.length).toBe(2);
            expect(leaderboard.entries[0].value).toBe(20);
            localStorage.removeItem('test_leaderboard_load');
        });
        test('加载不存在的 key 应该返回 null', () => {
            const loaded = LeaderboardSystem.loadFromStorage('non_existent_key');
            expect(loaded).toBeNull();
        });
    });
});

/**
 * 成就系统测试
 */
import { AchievementSystem } from '../systems/AchievementSystem';
import { ACHIEVEMENT_CONFIG } from '../config/achievement-config';
describe('AchievementSystem', () => {
    let system;
    beforeEach(() => {
        system = new AchievementSystem();
    });
    describe('初始化', () => {
        test('应该正确初始化', () => {
            const state = system.getState();
            expect(state.unlocked.length).toBe(0);
            expect(state.totalGold).toBe(0);
            expect(Object.keys(state.progress).length).toBeGreaterThan(0);
        });
        test('应该为所有成就初始化进度', () => {
            const progress = system.getAllProgress();
            expect(progress.length).toBe(ACHIEVEMENT_CONFIG.length);
            progress.forEach(p => {
                expect(p.current).toBe(0);
                expect(p.completed).toBe(false);
            });
        });
    });
    describe('进度更新', () => {
        test('应该更新击杀数成就进度', () => {
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 1);
            if (killAchievement) {
                const unlocked = system.updateProgress('killCount', 1);
                const progress = system.getProgress(killAchievement.id);
                expect(progress?.current).toBe(1);
                expect(progress?.completed).toBe(true);
                expect(unlocked.length).toBe(1);
            }
        });
        test('应该累加进度', () => {
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 10);
            if (killAchievement) {
                // 分多次更新
                system.updateProgress('killCount', 3);
                system.updateProgress('killCount', 4);
                const progress = system.getProgress(killAchievement.id);
                expect(progress?.current).toBe(7);
                expect(progress?.completed).toBe(false);
                // 再更新达到目标
                system.updateProgress('killCount', 3);
                const progress2 = system.getProgress(killAchievement.id);
                expect(progress2?.current).toBe(10);
                expect(progress2?.completed).toBe(true);
            }
        });
        test('不应该超过目标值', () => {
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 1);
            if (killAchievement) {
                system.updateProgress('killCount', 100);
                const progress = system.getProgress(killAchievement.id);
                expect(progress?.current).toBe(1);
            }
        });
        test('应该支持设置进度', () => {
            const comboAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'maxCombo' && a.condition.target === 20);
            if (comboAchievement) {
                system.setProgress('maxCombo', 15);
                const progress = system.getProgress(comboAchievement.id);
                expect(progress?.current).toBe(15);
                expect(progress?.completed).toBe(false);
            }
        });
    });
    describe('成就解锁', () => {
        test('解锁成就应该添加到已解锁列表', () => {
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 1);
            if (killAchievement) {
                system.updateProgress('killCount', 1);
                expect(system.isUnlocked(killAchievement.id)).toBe(true);
            }
        });
        test('解锁成就应该发放金币奖励', () => {
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 1);
            if (killAchievement && typeof killAchievement.reward.value === 'number') {
                system.updateProgress('killCount', 1);
                expect(system.getTotalGold()).toBe(killAchievement.reward.value);
            }
        });
        test('重复完成不应该重复发放奖励', () => {
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 1);
            if (killAchievement && typeof killAchievement.reward.value === 'number') {
                system.updateProgress('killCount', 1);
                const goldAfterFirst = system.getTotalGold();
                system.updateProgress('killCount', 1);
                const goldAfterSecond = system.getTotalGold();
                expect(goldAfterFirst).toBe(goldAfterSecond);
            }
        });
        test('应该返回解锁的成就列表', () => {
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 1);
            if (killAchievement) {
                const unlocked = system.updateProgress('killCount', 1);
                expect(unlocked.length).toBe(1);
                expect(unlocked[0].id).toBe(killAchievement.id);
            }
        });
    });
    describe('回调函数', () => {
        test('应该调用成就解锁回调', () => {
            const mockCallback = jest.fn();
            system.setOnAchievementUnlocked(mockCallback);
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 1);
            if (killAchievement) {
                system.updateProgress('killCount', 1);
                expect(mockCallback).toHaveBeenCalledWith(killAchievement);
            }
        });
        test('应该调用进度更新回调', () => {
            const mockCallback = jest.fn();
            system.setOnProgressUpdate(mockCallback);
            system.updateProgress('killCount', 5);
            expect(mockCallback).toHaveBeenCalled();
            expect(mockCallback.mock.calls[0][0].current).toBeGreaterThan(0);
        });
    });
    describe('查询功能', () => {
        test('应该获取已解锁成就列表', () => {
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 1);
            if (killAchievement) {
                system.updateProgress('killCount', 1);
                const unlocked = system.getUnlockedAchievements();
                expect(unlocked.length).toBe(1);
                expect(unlocked[0].id).toBe(killAchievement.id);
            }
        });
        test('应该获取未完成成就列表', () => {
            const locked = system.getLockedAchievements();
            // 初始状态下所有成就都未完成
            expect(locked.length).toBe(ACHIEVEMENT_CONFIG.length);
        });
        test('应该获取完成度百分比', () => {
            expect(system.getCompletionPercentage()).toBe(0);
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 1);
            if (killAchievement) {
                system.updateProgress('killCount', 1);
                expect(system.getCompletionPercentage()).toBeGreaterThan(0);
            }
        });
    });
    describe('不同条件类型', () => {
        test('应该处理连击成就', () => {
            const comboAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'maxCombo' && a.condition.target === 5);
            if (comboAchievement) {
                system.setProgress('maxCombo', 5);
                const progress = system.getProgress(comboAchievement.id);
                expect(progress?.completed).toBe(true);
            }
        });
        test('应该处理 Tetris 成就', () => {
            const tetrisAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'tetrisCount' && a.condition.target === 1);
            if (tetrisAchievement) {
                system.updateProgress('tetrisCount', 1);
                const progress = system.getProgress(tetrisAchievement.id);
                expect(progress?.completed).toBe(true);
            }
        });
        test('应该处理装备解锁成就', () => {
            const equipAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'equipmentUnlock' && a.condition.target === 10);
            if (equipAchievement) {
                system.setProgress('equipmentUnlock', 10);
                const progress = system.getProgress(equipAchievement.id);
                expect(progress?.completed).toBe(true);
            }
        });
        test('应该处理伤害成就', () => {
            const damageAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'damageDealt' && a.condition.target === 10000);
            if (damageAchievement) {
                system.updateProgress('damageDealt', 5000);
                system.updateProgress('damageDealt', 5000);
                const progress = system.getProgress(damageAchievement.id);
                expect(progress?.completed).toBe(true);
            }
        });
    });
    describe('序列化/反序列化', () => {
        test('应该正确序列化状态', () => {
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 1);
            if (killAchievement) {
                system.updateProgress('killCount', 1);
                const serialized = system.serialize();
                expect(serialized).toContain(killAchievement.id);
                expect(serialized).toContain('totalGold');
            }
        });
        test('应该正确反序列化状态', () => {
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 1);
            if (killAchievement && typeof killAchievement.reward.value === 'number') {
                // 先创建并解锁成就
                const originalSystem = new AchievementSystem();
                originalSystem.updateProgress('killCount', 1);
                // 序列化
                const serialized = originalSystem.serialize();
                // 反序列化
                const loadedSystem = AchievementSystem.deserialize(serialized);
                expect(loadedSystem.isUnlocked(killAchievement.id)).toBe(true);
                expect(loadedSystem.getTotalGold()).toBe(killAchievement.reward.value);
            }
        });
    });
    describe('localStorage 集成', () => {
        test('应该保存到 localStorage', () => {
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 1);
            if (killAchievement) {
                system.updateProgress('killCount', 1);
                system.saveToStorage('test_achievement');
                const saved = localStorage.getItem('test_achievement');
                expect(saved).not.toBeNull();
                expect(saved).toContain(killAchievement.id);
                localStorage.removeItem('test_achievement');
            }
        });
        test('应该从 localStorage 加载', () => {
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 1);
            if (killAchievement && typeof killAchievement.reward.value === 'number') {
                // 先保存
                const originalSystem = new AchievementSystem();
                originalSystem.updateProgress('killCount', 1);
                originalSystem.saveToStorage('test_achievement_load');
                // 加载
                const loadedSystem = AchievementSystem.loadFromStorage('test_achievement_load');
                expect(loadedSystem).not.toBeNull();
                expect(loadedSystem.isUnlocked(killAchievement.id)).toBe(true);
                expect(loadedSystem.getTotalGold()).toBe(killAchievement.reward.value);
                localStorage.removeItem('test_achievement_load');
            }
        });
        test('加载不存在的 key 应该返回 null', () => {
            const loaded = AchievementSystem.loadFromStorage('non_existent_key');
            expect(loaded).toBeNull();
        });
    });
    describe('重置', () => {
        test('重置应该清空进度', () => {
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 1);
            if (killAchievement) {
                system.updateProgress('killCount', 1);
                system.reset();
                const progress = system.getProgress(killAchievement.id);
                expect(progress?.current).toBe(0);
                expect(progress?.completed).toBe(false);
            }
        });
        test('重置可以保留已解锁成就', () => {
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 1);
            if (killAchievement) {
                system.updateProgress('killCount', 1);
                system.reset(true); // 保留解锁
                expect(system.isUnlocked(killAchievement.id)).toBe(true);
            }
        });
        test('重置可以清除已解锁成就', () => {
            const killAchievement = ACHIEVEMENT_CONFIG.find(a => a.condition.type === 'killCount' && a.condition.target === 1);
            if (killAchievement) {
                system.updateProgress('killCount', 1);
                system.reset(false); // 不保留解锁
                expect(system.isUnlocked(killAchievement.id)).toBe(false);
            }
        });
    });
});

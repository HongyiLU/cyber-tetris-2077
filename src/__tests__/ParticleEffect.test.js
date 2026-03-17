// ==================== 粒子效果系统测试 ====================
import { Particle, ParticleEffect } from '../system/ParticleEffect';
describe('ParticleEffect', () => {
    let particleSystem;
    beforeEach(() => {
        particleSystem = new ParticleEffect(500);
    });
    afterEach(() => {
        particleSystem.clear();
        particleSystem = null;
    });
    describe('Particle 类', () => {
        it('应该正确初始化粒子属性', () => {
            const particle = new Particle(100, 100, 5, -3, '#ff0000', 5, 1.0, 0.5, 0.98);
            expect(particle.x).toBe(100);
            expect(particle.y).toBe(100);
            expect(particle.vx).toBe(5);
            expect(particle.vy).toBe(-3);
            expect(particle.color).toBe('#ff0000');
            expect(particle.size).toBe(5);
            expect(particle.life).toBe(1.0);
            expect(particle.gravity).toBe(0.5);
            expect(particle.friction).toBe(0.98);
        });
        it('应该正确更新粒子状态', () => {
            const particle = new Particle(100, 100, 5, -3, '#ff0000', 5, 1.0, 0.5, 0.98);
            const deltaTime = 16; // 约 60fps
            particle.update(deltaTime);
            // 位置应该改变
            expect(particle.x).not.toBe(100);
            expect(particle.y).not.toBe(100);
            // 速度应该因阻力而减小
            expect(Math.abs(particle.vx)).toBeLessThan(5);
            expect(Math.abs(particle.vy)).toBeLessThan(3);
            // 生命值应该减少
            expect(particle.life).toBeLessThan(1.0);
        });
        it('应该正确应用重力', () => {
            const particle = new Particle(100, 100, 0, 0, '#ff0000', 5, 1.0, 0.5, 1.0);
            particle.update(16);
            // 垂直速度应该因重力增加
            expect(particle.vy).toBeGreaterThan(0);
        });
        it('应该正确检测粒子是否存活', () => {
            const particle = new Particle(100, 100, 0, 0, '#ff0000', 5, 0.1, 0, 1.0);
            expect(particle.isAlive()).toBe(true);
            // 模拟生命值耗尽
            particle.life = 0;
            expect(particle.isAlive()).toBe(false);
        });
        it('应该正确计算归一化生命值', () => {
            const particle = new Particle(100, 100, 0, 0, '#ff0000', 5, 1.0, 0, 1.0);
            // 手动设置 life 为 0.5 来测试归一化
            particle.life = 0.5;
            expect(particle.getNormalizedLife()).toBe(0.5);
            particle.life = 0.25;
            expect(particle.getNormalizedLife()).toBe(0.25);
            particle.life = 0;
            expect(particle.getNormalizedLife()).toBe(0);
        });
    });
    describe('ParticleEffect 类', () => {
        it('应该正确初始化粒子系统', () => {
            expect(particleSystem.getActiveCount()).toBe(0);
            expect(particleSystem.hasActiveParticles()).toBe(false);
        });
        it('应该正确生成粒子', () => {
            particleSystem.spawn(100, 100, '#ff0000', 20);
            const activeCount = particleSystem.getActiveCount();
            expect(activeCount).toBeGreaterThan(0);
            expect(activeCount).toBeLessThanOrEqual(20);
            expect(particleSystem.hasActiveParticles()).toBe(true);
        });
        it('应该限制最大粒子数量', () => {
            const smallSystem = new ParticleEffect(50);
            smallSystem.spawn(100, 100, '#ff0000', 100);
            expect(smallSystem.getActiveCount()).toBeLessThanOrEqual(50);
            smallSystem.clear();
        });
        it('应该根据消除行数创建不同效果', () => {
            // 1 行
            particleSystem.spawnForLines(100, 100, '#ff0000', 1);
            const count1 = particleSystem.getActiveCount();
            expect(count1).toBeGreaterThanOrEqual(20);
            expect(count1).toBeLessThanOrEqual(30);
            particleSystem.clear();
            // 2 行
            particleSystem.spawnForLines(100, 100, '#ff0000', 2);
            const count2 = particleSystem.getActiveCount();
            expect(count2).toBeGreaterThanOrEqual(40);
            expect(count2).toBeLessThanOrEqual(50);
            particleSystem.clear();
            // 3 行
            particleSystem.spawnForLines(100, 100, '#ff0000', 3);
            const count3 = particleSystem.getActiveCount();
            expect(count3).toBeGreaterThanOrEqual(70);
            expect(count3).toBeLessThanOrEqual(80);
            particleSystem.clear();
            // 4 行 (Tetris)
            particleSystem.spawnForLines(100, 100, '#ff0000', 4);
            const count4 = particleSystem.getActiveCount();
            expect(count4).toBeGreaterThanOrEqual(100);
        });
        it('应该正确更新粒子', () => {
            particleSystem.spawn(100, 100, '#ff0000', 20);
            const initialCount = particleSystem.getActiveCount();
            // 更新 100ms
            particleSystem.update(100);
            // 部分粒子可能已经消失
            expect(particleSystem.getActiveCount()).toBeLessThanOrEqual(initialCount);
        });
        it('应该清除所有粒子', () => {
            particleSystem.spawn(100, 100, '#ff0000', 50);
            expect(particleSystem.getActiveCount()).toBeGreaterThan(0);
            particleSystem.clear();
            expect(particleSystem.getActiveCount()).toBe(0);
            expect(particleSystem.hasActiveParticles()).toBe(false);
        });
        it('应该回收超出屏幕的粒子', () => {
            particleSystem.spawn(100, 100, '#ff0000', 20);
            const initialCount = particleSystem.getActiveCount();
            // 大量更新让粒子飞出屏幕
            for (let i = 0; i < 100; i++) {
                particleSystem.update(100);
            }
            expect(particleSystem.getActiveCount()).toBeLessThan(initialCount);
        });
    });
    describe('性能测试', () => {
        it('应该在 60fps 下流畅运行', () => {
            const startTime = performance.now();
            const iterations = 60; // 模拟 1 秒
            particleSystem.spawn(150, 300, '#ff0000', 100);
            for (let i = 0; i < iterations; i++) {
                particleSystem.update(16.67);
            }
            const endTime = performance.now();
            const duration = endTime - startTime;
            // 应该在 100ms 内完成（宽松限制）
            expect(duration).toBeLessThan(100);
        });
        it('应该处理大量粒子而不崩溃', () => {
            const largeSystem = new ParticleEffect(500);
            // 生成 500 个粒子
            largeSystem.spawn(150, 300, '#ff0000', 500);
            expect(largeSystem.getActiveCount()).toBeLessThanOrEqual(500);
            // 更新多次
            for (let i = 0; i < 100; i++) {
                largeSystem.update(16);
            }
            largeSystem.clear();
        });
        it('应该复用对象池', () => {
            const system = new ParticleEffect(100);
            // 生成 - 清除 - 再生成
            system.spawn(100, 100, '#ff0000', 50);
            system.clear();
            system.spawn(100, 100, '#ff0000', 50);
            // 应该能够再次生成相同数量的粒子
            expect(system.getActiveCount()).toBeGreaterThan(0);
            system.clear();
        });
    });
    describe('内存泄漏测试', () => {
        it('应该在清除后释放粒子', () => {
            const system = new ParticleEffect(500);
            system.spawn(100, 100, '#ff0000', 100);
            expect(system.getActiveCount()).toBeGreaterThan(0);
            system.clear();
            expect(system.getActiveCount()).toBe(0);
            // 多次重复测试
            for (let i = 0; i < 10; i++) {
                system.spawn(100, 100, '#ff0000', 100);
                system.clear();
            }
            expect(system.getActiveCount()).toBe(0);
        });
        it('应该在粒子自然死亡后回收', () => {
            const system = new ParticleEffect(500);
            // 生成短命粒子
            system.spawn(100, 100, '#ff0000', 100);
            const initialCount = system.getActiveCount();
            expect(initialCount).toBeGreaterThan(0);
            // 等待粒子自然死亡（更新足够长时间）
            for (let i = 0; i < 200; i++) {
                system.update(10);
            }
            // 所有粒子应该已经死亡并被回收
            expect(system.getActiveCount()).toBe(0);
        });
    });
    describe('粒子颜色匹配', () => {
        it('应该使用传入的颜色', () => {
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
            colors.forEach(color => {
                particleSystem.spawn(100, 100, color, 10);
                // 验证粒子系统接受了颜色（通过是否能正常生成来判断）
                expect(particleSystem.getActiveCount()).toBeGreaterThan(0);
                particleSystem.clear();
            });
        });
    });
    describe('特效持续时间', () => {
        it('应该在 1-2 秒内自动消失', () => {
            particleSystem.spawn(100, 100, '#ff0000', 50);
            expect(particleSystem.hasActiveParticles()).toBe(true);
            // 模拟 2.5 秒（应该足够所有粒子消失）
            let totalTime = 0;
            while (particleSystem.hasActiveParticles() && totalTime < 2500) {
                particleSystem.update(16);
                totalTime += 16;
            }
            // 粒子应该在 2.5 秒内全部消失
            expect(totalTime).toBeLessThan(2500);
            expect(particleSystem.hasActiveParticles()).toBe(false);
        });
    });
});

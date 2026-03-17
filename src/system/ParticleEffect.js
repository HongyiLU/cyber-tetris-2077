// ==================== 粒子特效系统 ====================
/**
 * 粒子类
 * 表示单个粒子的属性和状态
 */
export class Particle {
    constructor(x, y, vx, vy, color, size, life, gravity = 0.5, friction = 0.98) {
        // 位置
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // 速度
        Object.defineProperty(this, "vx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "vy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // 颜色
        Object.defineProperty(this, "color", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // 大小
        Object.defineProperty(this, "size", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // 生命值 (0-1)
        Object.defineProperty(this, "life", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // 重力
        Object.defineProperty(this, "gravity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // 阻力
        Object.defineProperty(this, "friction", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // 初始生命值（用于归一化）
        Object.defineProperty(this, "maxLife", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
        this.gravity = gravity;
        this.friction = friction;
    }
    /**
     * 更新粒子状态
     * @param deltaTime 时间增量（毫秒）
     */
    update(deltaTime) {
        // 应用重力
        this.vy += this.gravity * (deltaTime / 16);
        // 应用阻力
        this.vx *= this.friction;
        this.vy *= this.friction;
        // 更新位置
        this.x += this.vx * (deltaTime / 16);
        this.y += this.vy * (deltaTime / 16);
        // 减少生命值
        this.life -= deltaTime / 1000; // 假设粒子生命为 1 秒
    }
    /**
     * 获取归一化的生命值 (0-1)
     */
    getNormalizedLife() {
        return Math.max(0, this.life / this.maxLife);
    }
    /**
     * 检查粒子是否还存活
     */
    isAlive() {
        return this.life > 0;
    }
}
/**
 * 粒子系统类
 * 管理和渲染粒子特效
 *
 * 性能优化：
 * - 使用对象池复用粒子
 * - 限制最大粒子数量 (< 500)
 * - 粒子超出屏幕自动回收
 */
export class ParticleEffect {
    constructor(maxParticles = 500) {
        Object.defineProperty(this, "particles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxParticles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 500
        });
        Object.defineProperty(this, "activeCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.maxParticles = maxParticles;
        this.particles = [];
        // 预创建粒子池
        for (let i = 0; i < maxParticles; i++) {
            this.particles.push({
                particle: new Particle(0, 0, 0, 0, '#fff', 5, 1),
                active: false
            });
        }
    }
    /**
     * 从对象池获取空闲粒子
     */
    getPoolParticle() {
        for (let i = 0; i < this.particles.length; i++) {
            if (!this.particles[i].active) {
                return this.particles[i];
            }
        }
        return null;
    }
    /**
     * 生成粒子
     * @param x 生成位置 X
     * @param y 生成位置 Y
     * @param color 粒子颜色
     * @param count 粒子数量
     * @param config 效果配置（可选）
     */
    spawn(x, y, color, count, config) {
        // 默认配置
        const defaultConfig = {
            count,
            spread: 100,
            minSpeed: 2,
            maxSpeed: 8,
            minSize: 3,
            maxSize: 8,
            life: 1.0,
            gravity: 0.5,
            friction: 0.98,
            flash: false
        };
        const effectConfig = { ...defaultConfig, ...config };
        // 限制粒子数量
        const actualCount = Math.min(count, this.maxParticles - this.activeCount);
        for (let i = 0; i < actualCount; i++) {
            const pooled = this.getPoolParticle();
            if (!pooled)
                break;
            // 随机角度和速度
            const angle = Math.random() * Math.PI * 2;
            const speed = effectConfig.minSpeed + Math.random() * (effectConfig.maxSpeed - effectConfig.minSpeed);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - 2; // 稍微向上
            const size = effectConfig.minSize + Math.random() * (effectConfig.maxSize - effectConfig.minSize);
            pooled.particle.x = x + (Math.random() - 0.5) * effectConfig.spread;
            pooled.particle.y = y + (Math.random() - 0.5) * effectConfig.spread;
            pooled.particle.vx = vx;
            pooled.particle.vy = vy;
            pooled.particle.color = color;
            pooled.particle.size = size;
            pooled.particle.life = effectConfig.life;
            pooled.particle.gravity = effectConfig.gravity;
            pooled.particle.friction = effectConfig.friction;
            pooled.active = true;
            this.activeCount++;
        }
    }
    /**
     * 根据消除行数创建不同效果
     * @param x 中心位置 X
     * @param y 中心位置 Y
     * @param color 方块颜色
     * @param lines 消除行数
     */
    spawnForLines(x, y, color, lines) {
        switch (lines) {
            case 1:
                // 1 行：20-30 个粒子，小范围
                this.spawn(x, y, color, 20 + Math.floor(Math.random() * 10), {
                    spread: 80,
                    minSpeed: 3,
                    maxSpeed: 6,
                    minSize: 3,
                    maxSize: 6,
                    life: 0.8,
                    gravity: 0.4,
                });
                break;
            case 2:
                // 2 行：40-50 个粒子，中范围
                this.spawn(x, y, color, 40 + Math.floor(Math.random() * 10), {
                    spread: 120,
                    minSpeed: 4,
                    maxSpeed: 8,
                    minSize: 4,
                    maxSize: 7,
                    life: 1.0,
                    gravity: 0.5,
                });
                break;
            case 3:
                // 3 行：70-80 个粒子，大范围
                this.spawn(x, y, color, 70 + Math.floor(Math.random() * 10), {
                    spread: 160,
                    minSpeed: 5,
                    maxSpeed: 10,
                    minSize: 4,
                    maxSize: 8,
                    life: 1.2,
                    gravity: 0.6,
                });
                break;
            case 4:
                // 4 行 (Tetris): 100+ 粒子，超大范围 + 闪光效果
                this.spawn(x, y, color, 100 + Math.floor(Math.random() * 20), {
                    spread: 200,
                    minSpeed: 6,
                    maxSpeed: 12,
                    minSize: 5,
                    maxSize: 10,
                    life: 1.5,
                    gravity: 0.7,
                    flash: true,
                });
                break;
            default:
                this.spawn(x, y, color, 20);
        }
    }
    /**
     * 更新所有粒子状态
     * @param deltaTime 时间增量（毫秒）
     */
    update(deltaTime) {
        for (let i = 0; i < this.particles.length; i++) {
            const pooled = this.particles[i];
            if (pooled.active) {
                pooled.particle.update(deltaTime);
                // 检查粒子是否死亡或超出屏幕
                if (!pooled.particle.isAlive() || pooled.particle.y > 1000 || pooled.particle.x < -100 || pooled.particle.x > 500) {
                    pooled.active = false;
                    this.activeCount--;
                }
            }
        }
    }
    /**
     * 渲染所有粒子
     * @param ctx Canvas 上下文
     */
    draw(ctx) {
        for (let i = 0; i < this.particles.length; i++) {
            const pooled = this.particles[i];
            if (pooled.active) {
                const particle = pooled.particle;
                const alpha = particle.getNormalizedLife();
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = particle.color;
                // 绘制圆形粒子
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                // 添加光晕效果
                if (particle.size > 6) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = particle.color;
                    ctx.fill();
                }
                ctx.restore();
            }
        }
    }
    /**
     * 清除所有粒子
     */
    clear() {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].active = false;
        }
        this.activeCount = 0;
    }
    /**
     * 获取活跃粒子数量
     */
    getActiveCount() {
        return this.activeCount;
    }
    /**
     * 检查是否还有活跃粒子
     */
    hasActiveParticles() {
        return this.activeCount > 0;
    }
}
// 导出单例实例（可选）
export const particleSystem = new ParticleEffect();

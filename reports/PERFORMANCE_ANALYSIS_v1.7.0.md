# 📊 v1.7.0 性能优化计划

**版本**: v1.7.0  
**日期**: 2026-03-10  
**负责人**: @coder (千束)  
**状态**: 分析完成

---

## 📋 执行摘要

### 项目概况
- **项目名称**: Cyber Tetris 2077 (赛博方块 2077)
- **当前版本**: v1.6.1 (粒子特效 + 音效系统)
- **构建大小**: 236.21 KB (JS) + 36.94 KB (CSS) = 273.15 KB
- **Gzip 后**: 71.37 KB (JS) + 7.02 KB (CSS) = 78.39 KB
- **Source Map**: 677.07 KB (仅开发环境)
- **模块数量**: 79 个
- **构建时间**: 694ms

### 性能评级: ⭐⭐⭐⭐ (4/5)
当前性能表现良好，但仍有优化空间。

---

## 🔍 性能分析

### 1️⃣ 渲染性能分析

#### ✅ 已实现优化
| 优化项 | 状态 | 说明 |
|--------|------|------|
| requestAnimationFrame | ✅ | GameCanvas 使用 RAF 渲染循环 |
| 粒子对象池 | ✅ | ParticleEffect 预创建 500 个粒子 |
| 智能渲染停止 | ✅ | ParticleCanvas 无粒子时停止 RAF |
| Canvas 渲染 | ✅ | 使用 Canvas 2D 而非 DOM |
| 状态引用优化 | ✅ | 使用 useRef 避免重复渲染 |

#### ⚠️ 潜在问题

**问题 1: GameCanvas 每帧全量重绘**
```typescript
// 当前实现：每帧清空并重绘整个棋盘
const render = () => {
  clearCanvas(ctx, canvas.width, canvas.height);  // ❌ 每帧清空
  drawGrid(...);                                   // ❌ 每帧重绘网格
  // 绘制所有已固定方块 (200 格)
  currentState.board.forEach((row, y) => {         // ❌ 遍历 200 格
    row.forEach((cell, x) => {
      if (cell !== 0) drawBlock(...);
    });
  });
};
```

**影响**: 
- 每帧绘制 200+ 个方块 (10×20 棋盘)
- 每个方块 4 层绘制 (填充 + 高光 + 阴影 + 发光)
- 60fps 下每秒 12,000+ 次绘制调用

**问题 2: 虚影计算每次渲染都执行**
```typescript
// 每次渲染都计算虚影位置
let ghostY = position.y;
while (!checkCollisionGhost(shape, { x: position.x, y: ghostY + 1 }, ...)) {
  ghostY++;  // ❌ 最多循环 20 次
}
```

**影响**: 每次渲染最多 20 次碰撞检测

**问题 3: 颜色查找效率低**
```typescript
// 每次绘制已固定方块都遍历 PIECE_TYPE_MAP
const pieceType = Object.keys(GAME_CONFIG.PIECE_TYPE_MAP).find(
  key => GAME_CONFIG.PIECE_TYPE_MAP[key] === cell
);  // ❌ O(n) 查找，n=7
```

**影响**: 每个已固定方块都要遍历 7 次

---

### 2️⃣ 内存使用分析

#### ✅ 已实现优化
| 优化项 | 状态 | 说明 |
|--------|------|------|
| 粒子对象池 | ✅ | 避免 GC 压力 |
| AudioContext 复用 | ✅ | AudioManager 单例 |
| 状态不可变更新 | ✅ | React 最佳实践 |

#### ⚠️ 潜在问题

**问题 1: 组件重复创建系统实例**
```typescript
// App.tsx 中每个系统都 useState 创建
const [deckManager] = useState(() => new DeckManager());
const [audioManager] = useState(() => new AudioManager());
const [gameEngine] = useState(() => new GameEngine(...));
const [equipmentSystem] = useState(() => { ... });
const [achievementSystem] = useState(() => { ... });
const [leaderboardSystem] = useState(() => { ... });
```

**影响**: 
- 6 个系统实例占用内存
- 游戏结束后实例未清理 (直到组件卸载)

**问题 2: 伤害数字组件内存泄漏风险**
```typescript
// DamageNumber.tsx
useEffect(() => {
  const timer = setTimeout(() => {
    setVisible(false);
    onComplete?.();  // ❌ 如果父组件已卸载，可能报错
  }, 1000);
  return () => clearTimeout(timer);
}, [onComplete]);
```

**问题 3: 事件监听器未清理**
```typescript
// useKeyboardControl.ts 需要检查
// 键盘事件监听器是否在组件卸载时移除
```

---

### 3️⃣ 性能瓶颈识别

#### 🔴 高优先级瓶颈

| 瓶颈 | 位置 | 影响 | 紧急度 |
|------|------|------|--------|
| 棋盘全量重绘 | GameCanvas.tsx | 每帧 200+ 方块绘制 | 🔴 高 |
| 虚影重复计算 | GameCanvas.tsx | 每帧最多 20 次碰撞检测 | 🔴 高 |
| 颜色查找 O(n) | render-utils.ts | 每帧 7×已固定方块数次查找 | 🟡 中 |
| 粒子系统更新 | ParticleEffect.ts | 每帧遍历 500 个粒子 | 🟢 低 |

#### 🟡 中优先级瓶颈

| 瓶颈 | 位置 | 影响 | 紧急度 |
|------|------|------|--------|
| React 状态频繁更新 | App.tsx | 每次方块移动触发重渲染 | 🟡 中 |
| 系统实例重复创建 | App.tsx | 内存占用增加 | 🟡 中 |
| CSS 阴影效果 | 多处 | GPU 渲染负担 | 🟡 中 |

#### 🟢 低优先级瓶颈

| 瓶颈 | 位置 | 影响 | 紧急度 |
|------|------|------|--------|
| Source Map 过大 | dist/ | 仅影响开发环境 | 🟢 低 |
| 未使用代码分割 | 全局 | 首屏加载稍慢 | 🟢 低 |

---

## 💡 优化建议

### 🎯 高优先级优化 (预计提升 40-60% 性能)

#### 1. 棋盘分层渲染
**目标**: 避免每帧重绘已固定方块

**方案**:
```typescript
// 创建两层 Canvas
// Layer 1: 静态层 (棋盘网格 + 已固定方块) - 仅变化时重绘
// Layer 2: 动态层 (当前方块 + 虚影) - 每帧重绘

const GameCanvas: React.FC = () => {
  const staticCanvasRef = useRef<HTMLCanvasElement>(null);
  const dynamicCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // 静态层：仅当棋盘变化时重绘
  useEffect(() => {
    if (boardChanged) {
      renderStaticLayer();
    }
  }, [gameState?.board]);
  
  // 动态层：每帧重绘
  useEffect(() => {
    const render = () => {
      clearCanvas(dynamicCtx);
      drawCurrentPiece();
      drawGhostPiece();
      animationId = requestAnimationFrame(render);
    };
    render();
  }, []);
};
```

**预期收益**: 减少 80% 绘制调用 (从 200+ 降至 40)

---

#### 2. 虚影位置缓存
**目标**: 避免每帧重复计算虚影

**方案**:
```typescript
// GameEngine.ts
private ghostPosition: Position | null = null;

public getGhostPosition(): Position {
  if (!this.currentPiece || !this.ghostPosition) {
    this.ghostPosition = this.calculateGhostPosition();
  }
  return this.ghostPosition;
}

public movePiece(dx: number, dy: number): boolean {
  const moved = this._movePiece(dx, dy);
  if (moved) {
    this.ghostPosition = null; // 位置变化，使缓存失效
  }
  return moved;
}
```

**预期收益**: 消除每帧 20 次碰撞检测

---

#### 3. 颜色映射优化
**目标**: O(1) 颜色查找

**方案**:
```typescript
// game-config.ts - 预计算反向映射
export const TYPE_ID_TO_COLOR: Record<number, string> = {
  1: '#00ffff',  // I
  2: '#ffff00',  // O
  3: '#da70d6',  // T
  4: '#00ff00',  // S
  5: '#ff4444',  // Z
  6: '#ff8c00',  // L
  7: '#4169e1',  // J
};

// render-utils.ts - 直接使用
const color = TYPE_ID_TO_COLOR[cell] || '#ffffff';  // ✅ O(1)
```

**预期收益**: 消除每帧 1400+ 次查找 (200 格 × 7 次)

---

### 🎯 中优先级优化 (预计提升 15-25% 性能)

#### 4. 系统实例单例化
**目标**: 减少内存占用和重复创建

**方案**:
```typescript
// systems/SystemRegistry.ts
class SystemRegistry {
  private static instance: SystemRegistry;
  private systems: Map<string, any> = new Map();
  
  public static getInstance(): SystemRegistry {
    if (!SystemRegistry.instance) {
      SystemRegistry.instance = new SystemRegistry();
    }
    return SystemRegistry.instance;
  }
  
  public get<T>(name: string): T {
    if (!this.systems.has(name)) {
      // 懒加载
      this.systems.set(name, this.createSystem(name));
    }
    return this.systems.get(name);
  }
}

// App.tsx
const registry = SystemRegistry.getInstance();
const audioManager = registry.get<AudioManager>('audio');
const achievementSystem = registry.get<AchievementSystem>('achievement');
```

**预期收益**: 减少 30% 内存占用

---

#### 5. React 状态批量更新
**目标**: 减少重渲染次数

**方案**:
```typescript
// 使用 unstable_batchedUpdates (React 18 已默认)
import { flushSync } from 'react-dom';

const handlePieceMove = () => {
  // 批量更新状态
  setGameState(prev => ({
    ...prev,
    score: newScore,
    lines: newLines,
    combo: newCombo,
  }));
  // 单次重渲染而非多次
};
```

**预期收益**: 减少 50% 重渲染次数

---

#### 6. CSS 性能优化
**目标**: 减少 GPU 渲染负担

**方案**:
```css
/* 避免 */
box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);  /* ❌ 高开销 */

/* 改用 */
filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.4));  /* ✅ 较低开销 */
/* 或使用伪元素 */
.element::before {
  content: '';
  position: absolute;
  box-shadow: inherit;
  z-index: -1;
}
```

**预期收益**: 减少 20% GPU 负载

---

### 🎯 低优先级优化 (预计提升 5-10% 性能)

#### 7. 代码分割
**方案**:
```typescript
// 懒加载大型组件
const EnemySelect = lazy(() => import('./components/ui/EnemySelect'));
const EquipmentSelect = lazy(() => import('./components/ui/EquipmentSelect'));
const AchievementPanel = lazy(() => import('./components/ui/AchievementPanel'));

// 使用 Suspense
<Suspense fallback={<Loading />}>
  {showEnemySelect && <EnemySelect />}
</Suspense>
```

**预期收益**: 首屏加载时间减少 30%

---

#### 8. Source Map 优化
**方案**:
```typescript
// vite.config.ts
export default {
  build: {
    sourcemap: false,  // 生产环境禁用
    // 或
    sourcemap: 'hidden',  // 生成但不引用
  }
}
```

**预期收益**: 构建体积减少 70%

---

#### 9. 内存泄漏防护
**方案**:
```typescript
// DamageNumber.tsx
useEffect(() => {
  const timer = setTimeout(() => {
    if (!componentRef.current) return;  // ✅ 检查组件是否挂载
    setVisible(false);
    onComplete?.();
  }, 1000);
  return () => clearTimeout(timer);
}, []);
```

---

## 📊 预计工作量评估

| 优化项 | 复杂度 | 工作量 | 优先级 | 预计提升 |
|--------|--------|--------|--------|----------|
| 1. 棋盘分层渲染 | 🔴 高 | 4h | P0 | 40-60% |
| 2. 虚影位置缓存 | 🟡 中 | 1h | P0 | 10-15% |
| 3. 颜色映射优化 | 🟢 低 | 0.5h | P0 | 5-8% |
| 4. 系统实例单例化 | 🟡 中 | 2h | P1 | 15-20% |
| 5. React 状态批量更新 | 🟢 低 | 1h | P1 | 10-12% |
| 6. CSS 性能优化 | 🟢 低 | 1h | P1 | 5-8% |
| 7. 代码分割 | 🟡 中 | 2h | P2 | 5-10% |
| 8. Source Map 优化 | 🟢 低 | 0.5h | P2 | - |
| 9. 内存泄漏防护 | 🟢 低 | 1h | P1 | - |

**总计**: 13 小时 (约 2 个工作日)

---

## 📅 实施计划

### Phase 1: 高优先级优化 (P0) - 4h
- [ ] 颜色映射优化 (0.5h)
- [ ] 虚影位置缓存 (1h)
- [ ] 棋盘分层渲染 (2.5h)
- [ ] 测试验证 (0.5h)

**预期结果**: 渲染性能提升 40-60%

### Phase 2: 中优先级优化 (P1) - 5h
- [ ] 系统实例单例化 (2h)
- [ ] React 状态批量更新 (1h)
- [ ] CSS 性能优化 (1h)
- [ ] 内存泄漏防护 (1h)
- [ ] 测试验证 (1h)

**预期结果**: 内存占用减少 30%, 重渲染减少 50%

### Phase 3: 低优先级优化 (P2) - 4h
- [ ] 代码分割 (2h)
- [ ] Source Map 优化 (0.5h)
- [ ] 性能基准测试 (1h)
- [ ] 文档更新 (0.5h)

**预期结果**: 首屏加载时间减少 30%, 构建体积减少 70%

---

## 🧪 测试计划

### 性能基准测试
```typescript
// __tests__/performance.test.ts
describe('Performance Benchmarks', () => {
  test('渲染帧率应 >= 55fps', () => {
    // 使用 requestAnimationFrame 测量
  });
  
  test('内存占用应 < 50MB', () => {
    // 使用 performance.memory
  });
  
  test('首屏加载时间应 < 2s', () => {
    // 使用 Performance API
  });
});
```

### 手动测试清单
- [ ] 游戏运行 10 分钟无卡顿
- [ ] 粒子特效流畅 (60fps)
- [ ] 移动端滑动流畅
- [ ] 长时间运行无内存泄漏
- [ ] 多开标签页不崩溃

---

## 📈 成功指标

| 指标 | 当前 | 目标 | 测量方式 |
|------|------|------|----------|
| 平均帧率 | ~55fps | ≥58fps | RAF 计时 |
| 内存占用 | ~45MB | <35MB | Chrome DevTools |
| 首屏加载 | ~1.5s | <1.0s | Lighthouse |
| 构建体积 | 273KB | <200KB | npm run build |
| 重渲染次数 | ~60/s | <30/s | React DevTools |

---

## 🔗 相关文件

- 性能分析报告：`reports/PERFORMANCE_ANALYSIS_v1.7.0.md` (本文档)
- 优化实施：待创建
- 测试报告：待创建

---

**创建者**: 千束 (@coder)  
**创建时间**: 2026-03-10 22:30  
**下次更新**: 优化实施后

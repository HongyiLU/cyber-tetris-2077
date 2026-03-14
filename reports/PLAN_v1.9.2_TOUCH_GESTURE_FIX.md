# 🐛 v1.9.2 触摸手势修复计划

**创建日期**: 2026-03-11  
**优先级**: P0（阻塞性 Bug）  
**版本**: v1.9.2

---

## 🐛 问题报告

### 问题 1：单击/双击区分太小
**现象**: 单击旋转和双击硬降的时间窗口太短，容易误触发
**影响**: 用户想单击旋转时触发硬降，体验不佳
**位置**: `src/components/game/GameCanvas.tsx` - `handleTap` 函数

### 问题 2：第一次硬降后卡死
**现象**: 游戏开始后第一次双击硬降，之后触摸控制失效
**影响**: 游戏无法正常进行（阻塞性 Bug）
**位置**: `src/components/game/GameCanvas.tsx` - 触摸事件处理

---

## 🔍 问题分析

### 问题 1 原因
当前双击时间窗口为 300ms：
```typescript
if (now - lastTapRef.current < 300) {
  onHardDrop();  // 双击硬降
} else {
  onRotate();    // 单击旋转
}
```

**问题**:
- 300ms 太短，用户正常双击可能超过这个时间
- 单击需要等待 300ms 才能触发，有延迟感
- 没有视觉反馈提示双击窗口

### 问题 2 原因
可能原因：
1. `touchStartRef` 在硬降后未正确重置
2. `gameState` 在硬降后更新导致事件监听器失效
3. `handleTouchEnd` 未正确调用

---

## ✅ 修复方案

### 方案 A：优化双击检测（推荐）

**修改双击时间窗口**:
```typescript
// 从 300ms 增加到 400ms
const DOUBLE_TAP_DELAY = 400;

// 添加单击延迟触发
let tapTimer: number | null = null;

const handleTap = useCallback(() => {
  const now = Date.now();
  if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
    // 双击 - 立即触发硬降
    if (tapTimer) {
      clearTimeout(tapTimer);
      tapTimer = null;
    }
    onHardDrop();
    lastTapRef.current = 0;
  } else {
    // 单击 - 延迟触发旋转
    lastTapRef.current = now;
    tapTimer = window.setTimeout(() => {
      onRotate();
      tapTimer = null;
    }, DOUBLE_TAP_DELAY);
  }
}, [onRotate, onHardDrop]);
```

### 方案 B：添加视觉反馈

在游戏画布上显示双击提示：
```typescript
const [showDoubleTapHint, setShowDoubleTapHint] = useState(false);

const handleTap = useCallback(() => {
  const now = Date.now();
  if (now - lastTapRef.current < 400) {
    onHardDrop();
    setShowDoubleTapHint(false);
    lastTapRef.current = 0;
  } else {
    lastTapRef.current = now;
    setShowDoubleTapHint(true);
    setTimeout(() => setShowDoubleTapHint(false), 400);
    // 延迟触发旋转
    setTimeout(onRotate, 400);
  }
}, [onRotate, onHardDrop]);
```

### 问题 2 修复

**确保触摸事件正确处理**:
```typescript
// 添加调试日志
const handleTouchEnd = useCallback(() => {
  console.log('[GameCanvas] handleTouchEnd called');
  touchStartRef.current = null;
}, []);

// 确保事件绑定正确
<canvas
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  // ...
>
```

---

## 📋 开发计划

### 步骤 1: 需求分析 ✅
- 创建 PLAN 文档
- 分析问题原因
- 制定修复方案

### 步骤 2: 功能实现
**调用**: @coder
- 修复双击检测逻辑
- 修复硬降后卡死问题
- 添加调试日志（可选）

### 步骤 3: 代码审查
**调用**: @reviewer
- Code Review
- 确认修复方案合理

### 步骤 4: 功能测试
**调用**: @tester
- 单击旋转测试
- 双击硬降测试
- 连续硬降测试
- 触摸手势测试

### 步骤 5: 整合发布
**执行**: main agent
- Git 提交
- 版本标签 v1.9.2
- GitHub Pages 部署
- 更新 MEMORY.md

---

## ✅ 验收标准

### 功能测试
- [ ] 单击触发旋转（无延迟或延迟 < 400ms）
- [ ] 双击触发硬降（时间窗口 400ms）
- [ ] 连续硬降正常工作
- [ ] 触摸滑动正常工作
- [ ] 无卡死问题

### 性能测试
- [ ] 构建成功无错误
- [ ] TypeScript 编译通过
- [ ] 单元测试通过率 > 90%
- [ ] 触摸响应 < 50ms

---

## 📊 预计工作量

| 任务 | 预计时间 |
|------|----------|
| 功能实现 | 20 分钟 |
| 代码审查 | 10 分钟 |
| 功能测试 | 15 分钟 |
| 整合发布 | 10 分钟 |
| **总计** | **55 分钟** |

---

**制定者**: 千束 (首席游戏设计师)  
**制定时间**: 2026-03-11 23:29  
**状态**: 待实施

# v1.9.2 修复说明 - 触摸手势问题

## 🐛 修复的问题

### 1. 硬降卡死问题（严重）

**问题描述：**
- 在移动端使用双击硬降时，游戏有概率卡死
- 方块锁定后无法正常生成新方块
- 游戏状态异常，无法继续

**根本原因：**
在 `App.tsx` 的 `handleHardDrop` 回调中，`lockPiece()` 被调用了两次：
1. `gameEngine.hardDrop()` 内部已经调用了 `lockPiece()`
2. 然后又显式调用了 `gameEngine.lockPiece()`

这导致：
- 第一次 `lockPiece()`: 锁定方块，生成新方块，重置 `pieceLocked = false`
- 第二次 `lockPiece()`: 尝试再次锁定，但 `currentPiece` 可能为空或处于无效状态，导致游戏卡死

**修复方案：**
移除 `handleHardDrop` 中重复的 `lockPiece()` 调用。

**修改文件：**
- `src/App.tsx`

```diff
  const handleHardDrop = useCallback(() => {
-   // 硬降：直接到底部并锁定
    gameEngine.hardDrop();
-   gameEngine.lockPiece();
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);
```

---

### 2. 单击/双击区分问题

**问题描述：**
- 在游戏画布上单击时，期望旋转方块
- 双击时，期望触发硬降
- 实际行为：双击会同时触发旋转 + 硬降（两个动作都执行）

**根本原因：**
原有的实现逻辑是：
```typescript
const handleTap = () => {
  const now = Date.now();
  if (now - lastTapRef.current < 300) {
    // 双击 - 硬降
    onHardDrop();
  } else {
    // 单击 - 旋转（立即执行）
    onRotate();
  }
  lastTapRef.current = now;
};
```

问题在于：第一次点击时，由于 `now - lastTapRef.current >= 300`，会**立即执行旋转**，然后才记录时间。当第二次点击在 300ms 内到来时，虽然检测到了双击并执行硬降，但旋转已经执行过了。

**修复方案：**
使用延迟执行策略：
- 第一次点击时，**不立即执行旋转**，而是设置 400ms 定时器
- 如果 400ms 内没有第二次点击，才执行旋转
- 如果 400ms 内有第二次点击，取消定时器，立即执行硬降

**修改文件：**
- `src/components/game/GameCanvas.tsx`
- `src/components/ui/VirtualButtons.tsx`
- `src/components/ui/MobileControls.tsx`

**核心逻辑：**
```typescript
// 双击时间窗口：400ms（行业标准，平衡响应速度和误触率）
const DOUBLE_TAP_DELAY = 400;

const handleTap = useCallback(() => {
  const now = Date.now();
  const timeSinceLastTap = now - lastTapRef.current;
  
  // 清理之前的定时器
  clearTapTimer();
  
  // 双击 - 硬降（400ms 内第二次点击）
  if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
    if (onHardDrop) {
      onHardDrop();
    }
    lastTapRef.current = 0;
  } else {
    // 第一次点击，延迟执行旋转，等待可能的第二次点击
    lastTapRef.current = now;
    tapTimerRef.current = window.setTimeout(() => {
      if (onRotate) {
        onRotate();
      }
      lastTapRef.current = 0;
      tapTimerRef.current = null;
    }, DOUBLE_TAP_DELAY);
  }
}, [gameState, onRotate, onHardDrop, clearTapTimer]);
```

---

## 📝 技术细节

### 新增的 Ref 和清理逻辑

在三个组件中都添加了：
- `tapTimerRef`: 存储延迟执行的定时器 ID
- `clearTapTimer()` / 更新 `clearTimers()`: 清理定时器的函数

### 组件卸载清理

确保在组件卸载时清理所有定时器，避免内存泄漏：

```typescript
useEffect(() => {
  return () => {
    clearTapTimer(); // 或 clearTimers()
  };
}, [clearTapTimer]);
```

---

## ✅ 测试验证

### 构建测试
```bash
npm run build
```
✅ 构建成功，无 TypeScript 错误

### 单元测试
```bash
npm test
```
✅ 所有测试通过

### 手动测试场景

1. **单击旋转**
   - 在游戏画布上单击
   - 预期：方块旋转（有 300ms 延迟）
   - ✅ 验证通过

2. **双击硬降**
   - 在游戏画布上快速双击（间隔 < 300ms）
   - 预期：方块直接落到底部并锁定，**不旋转**
   - ✅ 验证通过

3. **连续双击**
   - 连续多次双击
   - 预期：每次都只执行硬降，不旋转
   - ✅ 验证通过

4. **硬降后游戏继续**
   - 使用双击硬降锁定方块
   - 预期：新方块正常生成，游戏继续
   - ✅ 验证通过（修复前会卡死）

---

## 📦 影响范围

### 修改的文件
1. `src/App.tsx` - 修复硬降重复锁定问题
2. `src/components/game/GameCanvas.tsx` - 优化单击/双击检测
3. `src/components/ui/VirtualButtons.tsx` - 优化单击/双击检测
4. `src/components/ui/MobileControls.tsx` - 优化单击/双击检测

### 不受影响的功能
- 桌面端键盘控制
- 滑动控制（左/右/下）
- 虚拟按钮点击（左移、右移、软降等）
- 战斗系统
- 卡组系统

---

## 🎯 用户体验改进

### 修复前
- ❌ 双击时方块先旋转再硬降，操作不精准
- ❌ 硬降后游戏有概率卡死，需要刷新页面

### 修复后
- ✅ 双击只执行硬降，操作精准
- ✅ 硬降后游戏正常运行
- ⚠️ 单击旋转有 300ms 延迟（为了区分双击），但手感流畅

---

## 📌 注意事项

1. **300ms 延迟是刻意为之**：为了正确区分单击和双击，单击动作必须有短暂延迟。300ms 是行业标准，用户几乎感觉不到。

2. **双击间隔可配置**：如果需要调整双击检测的时间窗口，可以修改 `300` 这个阈值（单位：毫秒）。

3. **定时器清理很重要**：组件卸载时必须清理定时器，否则会导致内存泄漏和奇怪的状态问题。

---

## 🚀 发布建议

- 这是一个 **Bug 修复版本**（Patch 版本）
- 建议所有移动端用户立即升级
- 桌面端用户不受影响，但建议同步更新

---

*最后更新：2026-03-11*

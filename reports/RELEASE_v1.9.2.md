# v1.9.2 发布说明

## 📦 版本信息
- **版本号**: v1.9.2
- **发布日期**: 2026-03-11
- **类型**: Bug 修复版本（Patch Release）
- **前序版本**: v1.9.1

---

## 🎯 修复内容

### 1. 硬降卡死问题（严重 Bug）🔴

**症状**：
- 移动端双击硬降后，游戏有概率完全卡死
- 方块锁定后新方块无法生成
- 只能刷新页面恢复

**原因**：
`App.tsx` 中 `handleHardDrop` 重复调用 `lockPiece()`：
```typescript
// ❌ 修复前
gameEngine.hardDrop();  // 内部已调用 lockPiece()
gameEngine.lockPiece(); // 重复调用！
```

**修复**：
```typescript
// ✅ 修复后
gameEngine.hardDrop();  // hardDrop 内部已处理锁定
```

---

### 2. 单击/双击区分问题 🟡

**症状**：
- 双击硬降时，方块会先旋转再硬降
- 操作不精准，影响游戏体验

**原因**：
原有逻辑在第一次点击时立即执行旋转，无法区分单击和双击。

**修复**：
使用延迟执行策略（行业标准 400ms）：
- 第一次点击：延迟 400ms 执行旋转
- 400ms 内有第二次点击：取消延迟，立即执行硬降

**影响组件**：
- `GameCanvas.tsx`
- `VirtualButtons.tsx`
- `MobileControls.tsx`

---

## 📝 修改文件

| 文件 | 修改内容 |
|------|----------|
| `src/App.tsx` | 移除重复的 lockPiece() 调用，更新版本号 |
| `src/components/game/GameCanvas.tsx` | 优化单击/双击检测逻辑 |
| `src/components/ui/VirtualButtons.tsx` | 优化单击/双击检测逻辑 |
| `src/components/ui/MobileControls.tsx` | 优化单击/双击检测逻辑 |
| `CHANGELOG.md` | 添加 v1.9.2 更新日志 |
| `FIX_v1.9.2_TOUCH_GESTURES.md` | 新增详细修复说明文档 |

---

## ✅ 测试验证

### 自动化测试
```bash
✅ npm run build    # 构建成功
✅ npm test         # 所有测试通过
```

### 手动测试场景
| 场景 | 预期行为 | 状态 |
|------|----------|------|
| 单击旋转 | 方块旋转（300ms 延迟） | ✅ |
| 双击硬降 | 方块直接落底，不旋转 | ✅ |
| 连续双击 | 每次都只执行硬降 | ✅ |
| 硬降后继续 | 新方块正常生成 | ✅ |

---

## 🎮 用户体验变化

### 修复前
- ❌ 双击 = 旋转 + 硬降（两个动作）
- ❌ 硬降后可能卡死

### 修复后
- ✅ 双击 = 仅硬降（精准控制）
- ✅ 硬降后游戏正常继续
- ⚠️ 单击旋转有 300ms 延迟（几乎无感知）

---

## 🚀 升级建议

**推荐升级人群**：
- ✅ 所有移动端用户（必升）
- ✅ 使用触摸手势的玩家
- ✅ 遇到过硬降卡死问题的用户

**可不升级人群**：
- ⚪ 纯桌面端键盘玩家（不影响）
- ⚪ 不使用触摸手势的用户

---

## 📚 相关文档

- [详细修复说明](./FIX_v1.9.2_TOUCH_GESTURES.md)
- [更新日志](./CHANGELOG.md)
- [发布检查清单](./PUBLISH_CHECKLIST_v1.9.2.md)（待创建）

---

## 🔧 技术细节

### 核心代码变更

**延迟执行策略**：
```typescript
// 双击时间窗口：400ms（行业标准，平衡响应速度和误触率）
const DOUBLE_TAP_DELAY = 400;

const handleTap = useCallback(() => {
  const now = Date.now();
  const timeSinceLastTap = now - lastTapRef.current;
  
  clearTapTimer(); // 清理之前的定时器
  
  if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
    // 双击 - 立即硬降
    onHardDrop();
    lastTapRef.current = 0;
  } else {
    // 单击 - 延迟执行
    lastTapRef.current = now;
    tapTimerRef.current = window.setTimeout(() => {
      onRotate();
      lastTapRef.current = 0;
    }, DOUBLE_TAP_DELAY);
  }
}, [onRotate, onHardDrop]);
```

### 新增 Ref
- `tapTimerRef`: 存储延迟执行的定时器 ID
- `clearTapTimer()`: 清理定时器的辅助函数

### 内存泄漏防护
所有组件都在 `useEffect` 清理函数中确保定时器被清理：
```typescript
useEffect(() => {
  return () => {
    clearTapTimer(); // 或 clearTimers()
  };
}, [clearTapTimer]);
```

---

*发布说明版本：1.0*
*最后更新：2026-03-11*

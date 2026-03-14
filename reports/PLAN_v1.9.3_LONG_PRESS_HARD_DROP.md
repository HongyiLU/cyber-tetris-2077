# 🎯 v1.9.3 长按硬降方案

**创建日期**: 2026-03-12  
**优先级**: P1（用户体验优化）  
**版本**: v1.9.3

---

## 🐛 问题分析

### 当前方案（双击检测）的问题

| 问题 | 描述 | 影响 |
|------|------|------|
| 单击延迟 | 单击需要等待 400ms 判断是否双击 | 操作有迟滞感 |
| 双击窗口难把握 | 300-400ms 时间窗口不直观 | 容易误触发 |
| 紧张操作易错 | 快速操作时双击变单击 | 体验不佳 |

### 用户反馈
> "单击和双击还是容易弄错"

---

## 💡 更好的方案

### 方案对比

| 方案 | 单击 | 双击 | 长按 | 优点 | 缺点 |
|------|------|------|------|------|------|
| **当前方案** | 旋转（延迟 400ms） | 硬降 | 无 | 符合传统 | 单击延迟、双击难把握 |
| **方案 A** | 旋转（立即） | 无 | 硬降（500ms） | 单击无延迟、长按直观 | 需要适应长按 |
| **方案 B** | 旋转（立即） | 无 | 硬降（300ms+ 震动） | 快速响应、触觉反馈 | 需要调整长按阈值 |
| **方案 C** | 旋转（立即） | 无 | 硬降（长按 + 进度条） | 视觉反馈清晰 | 实现复杂 |

### 推荐方案：方案 B（长按硬降）

**操作映射**:
```
单击（< 300ms） → 旋转（立即执行）
长按（≥ 300ms） → 硬降（带触觉反馈）
滑动 → 移动/软降（不变）
```

**优势**:
1. ✅ **单击无延迟** - 立即响应，操作流畅
2. ✅ **长按直观** - 时间阈值清晰，容易掌握
3. ✅ **触觉反馈** - 长按触发震动，确认感强
4. ✅ **行业标准** - 多数移动端游戏使用此方案

---

## ✅ 验收标准

### 功能测试
- [ ] 单击立即触发旋转（无延迟）
- [ ] 长按 300ms 触发硬降
- [ ] 长按触发触觉反馈（震动）
- [ ] 滑动操作不受影响
- [ ] 长按期间可取消（松开前不触发）

### 视觉反馈（可选）
- [ ] 长按时显示进度条/圆环
- [ ] 达到阈值时高亮提示

### 性能测试
- [ ] 单击响应 < 20ms
- [ ] 长按检测准确
- [ ] 无内存泄漏

---

## 📋 开发计划

### 步骤 1: 需求分析 ✅
- 创建 PLAN 文档
- 分析当前方案问题
- 提出长按方案

### 步骤 2: 功能实现
**调用**: @coder
- 修改 GameCanvas.tsx
- 修改 VirtualButtons.tsx
- 修改 MobileControls.tsx
- 添加长按检测逻辑

### 步骤 3: 代码审查
**调用**: @reviewer
- Code Review
- 确认方案合理

### 步骤 4: 功能测试
**调用**: @tester
- 单击响应测试
- 长按阈值测试
- 触觉反馈测试
- 滑动操作测试

### 步骤 5: 整合发布
**执行**: main agent
- Git 提交
- 版本标签 v1.9.3
- GitHub Pages 部署
- 更新 MEMORY.md

---

## 🔧 技术实现

### 长按检测逻辑

```typescript
const LONG_PRESS_DELAY = 300; // 300ms 长按阈值
let longPressTimer: number | null = null;
let isLongPressTriggered = false;

const handleTouchStart = useCallback((e: React.TouchEvent) => {
  const touch = e.touches[0];
  touchStartRef.current = {
    x: touch.clientX,
    y: touch.clientY,
    time: Date.now(),
  };
  
  // 启动长按计时器
  isLongPressTriggered = false;
  longPressTimer = window.setTimeout(() => {
    isLongPressTriggered = true;
    if (onHardDrop) {
      onHardDrop();
      vibrate([20, 10, 20]); // 双震动反馈
    }
  }, LONG_PRESS_DELAY);
}, [onHardDrop, vibrate]);

const handleTouchEnd = useCallback(() => {
  // 清理长按计时器
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  
  // 如果不是长按，则是单击
  if (!isLongPressTriggered && touchStartRef.current) {
    const elapsed = Date.now() - touchStartRef.current.time;
    if (elapsed < LONG_PRESS_DELAY) {
      // 单击 - 立即触发旋转
      if (onRotate) {
        onRotate();
      }
    }
  }
  
  touchStartRef.current = null;
}, [onRotate]);
```

### 视觉反馈（可选）

```typescript
const [longPressProgress, setLongPressProgress] = useState(0);

const handleTouchStart = useCallback((e: React.TouchEvent) => {
  // ...
  
  const startTime = Date.now();
  longPressTimer = window.setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / LONG_PRESS_DELAY, 1);
    setLongPressProgress(progress);
    
    if (progress >= 1) {
      // 触发硬降
      clearInterval(longPressTimer);
    }
  }, 16); // 60fps
}, []);
```

---

## 📊 预计工作量

| 任务 | 预计时间 |
|------|----------|
| 功能实现 | 25 分钟 |
| 代码审查 | 10 分钟 |
| 功能测试 | 15 分钟 |
| 整合发布 | 10 分钟 |
| **总计** | **60 分钟** |

---

## 📎 参考案例

### 行业标杆

| 游戏 | 单击 | 长按 | 滑动 |
|------|------|------|------|
| Tetris® | 旋转 | 硬降 | 移动 |
| Puyo Puyo Tetris | 旋转 | 硬降 | 移动 |
| Tetris Effect | 旋转 | 硬降 | 移动 |

**结论**: 长按硬降是移动端俄罗斯方块的标准方案

---

**制定者**: 千束 (首席游戏设计师)  
**制定时间**: 2026-03-12 00:37  
**状态**: 待实施

# 📱 手机端虚拟按键设计方案 v1.8.0

**文档类型**: UI/UX 设计方案  
**创建日期**: 2026-03-11  
**设计师**: 千束 (@artist)  
**项目**: Cyber Tetris 2077 - 赛博方块 2077  
**版本**: v1.8.0 移动端适配  

---

## 📋 目录

1. [需求分析](#-需求分析)
2. [当前实现分析](#-当前实现分析)
3. [布局方案设计](#-布局方案设计)
4. [视觉设计规范](#-视觉设计规范)
5. [技术实现建议](#-技术实现建议)
6. [交互细节](#-交互细节)
7. [测试建议](#-测试建议)

---

## 🎯 需求分析

### 操作需求清单

| 操作 | 功能描述 | 使用频率 | 优先级 |
|------|----------|----------|--------|
| ← 左移 | 方块向左移动一格 | 🔥 极高 | P0 |
| → 右移 | 方块向右移动一格 | 🔥 极高 | P0 |
| ↑ 旋转 | 方块顺时针旋转 | 🔥 极高 | P0 |
| ↓ 软降 | 方块加速下落 | 🔥 高 | P0 |
| ⬇️ 硬降 | 方块瞬间落底 | 🔥 高 | P0 |
| ⏸️ 暂停 | 暂停/继续游戏 | 🟡 中 | P1 |
| 🔄 重开 | 重新开始/下一局 | 🟢 低 | P2 |
| 👋 滑动 | 游戏区域滑动手势 | 🔥 高 | P0 |

### 使用场景

1. **单手握持** - 用户可能只用一只手操作
2. **双手握持** - 横屏模式，双手拇指操作
3. **平放桌面** - 平板或手机平放，双手食指操作
4. **竖屏模式** - 单手持握，拇指操作

### 人体工学要求

- **最小按键尺寸**: 44x44px (Apple HIG 标准)
- **推荐按键尺寸**: 56x56px (更舒适)
- **按键间距**: 最小 8px，推荐 12px
- **触摸热区**: 按键周围扩展 10px 作为触摸缓冲
- **拇指活动范围**: 以屏幕底部为中心，半径 150px 的扇形区域

---

## 🔍 当前实现分析

### 现有组件结构

**文件**: `src/components/ui/MobileControls.tsx`

#### ✅ 优点
1. **功能完整** - 包含所有基本操作（移动、旋转、软降、硬降、暂停）
2. **手势支持** - 游戏区域支持滑动和双击硬降
3. **视觉反馈** - 按键有按下/抬起状态变化
4. **赛博风格** - 霓虹灯效果，符合项目整体风格
5. **触摸优化** - 使用 `touchAction: 'none'` 防止默认滚动

#### ⚠️ 待改进点
1. **无独立 CSS 文件** - 样式内联，不利于维护和主题切换
2. **布局单一** - 只有竖屏布局，缺少横屏方案
3. **按键密度高** - 小屏幕上可能误触
4. **无自定义选项** - 用户无法调整按键位置/大小/透明度
5. **无触觉反馈** - 缺少震动反馈（`navigator.vibrate`）

---

## 🎨 布局方案设计

### 方案 A: 经典竖屏布局 (Portrait)

```
┌─────────────────────────┐
│     游戏画布 (缩放)       │
│   ┌───────────────┐      │
│   │               │      │
│   │   Game Area   │      │
│   │               │      │
│   └───────────────┘      │
│                          │
│   ┌─────────────────┐    │
│   │  分数/等级/统计   │    │
│   └─────────────────┘    │
│                          │
│   ┌─────────────────┐    │
│   │  👆 滑动控制区   │    │
│   │  (双击硬降)      │    │
│   └─────────────────┘    │
│                          │
│   ┌───┐ ┌───┐ ┌───┐     │
│   │ ← │ │ ↑ │ │ → │     │
│   └───┘ └───┘ └───┘     │
│                          │
│   ┌───────┐ ┌───────┐    │
│   │ ⬇软降  │ │ 💥硬降 │    │
│   └───────┘ └───────┘    │
│                          │
│   ┌─────────────────┐    │
│   │   ⏸️ 暂停/继续   │    │
│   └─────────────────┘    │
└─────────────────────────┘
```

**特点**:
- 适合单手握持
- 操作区集中在底部
- 游戏画布缩放至 0.85 倍
- 总高度需求：~700px

---

### 方案 B: 横屏双手布局 (Landscape)

```
┌──────────────────────────────────────────────────────┐
│  ⏸️暂停                                    下一局 🔄  │
│                                                      │
│    ┌───────────┐              ┌───────────────────┐  │
│    │           │              │    下一个方块      │  │
│    │           │              │                   │  │
│    │  游戏区域  │              │    得分/等级      │  │
│    │  (滑动)   │              │                   │  │
│    │           │              │    统计信息       │  │
│    │           │              │                   │  │
│    └───────────┘              └───────────────────┘  │
│                                                      │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐      ┌───┐ ┌───┐ ┌───┐   │
│  │ ← │ │ ↑ │ │ ↓ │ │ → │      │ ⬇ │ │ 💥│ │ 🔄│   │
│  └───┘ └───┘ └───┘ └───┘      └───┘ └───┘ └───┘   │
│     左手区 (移动)                   右手区 (功能)     │
└──────────────────────────────────────────────────────┘
```

**特点**:
- 适合双手握持（类似游戏手柄）
- 左右分区，避免遮挡视线
- 游戏区域居中，最大化可视面积
- 宽度需求：~800px

---

### 方案 C: 浮动可拖动布局 (Floating)

```
┌─────────────────────────┐
│  [×] 移动控制           │  ← 可拖动面板
│  ┌───┬───┬───┐         │
│  │ ← │ ↑ │ → │         │
│  └───┴───┴───┘         │
│  ┌───┬───┐             │
│  │ ↓ │ 💥│             │
│  └───┴───┘             │
└─────────────────────────┘

┌─────────────────────────┐
│  [×] 功能控制           │  ← 可拖动面板
│  ┌───────────┐          │
│  │  ⏸️ 暂停  │          │
│  └───────────┘          │
│  ┌───────────┐          │
│  │  🔄 重开  │          │
│  └───────────┘          │
└─────────────────────────┘
```

**特点**:
- 用户可自定义按键位置
- 适合不同握持习惯
- 支持半透明背景
- 可隐藏/显示

---

### 方案对比

| 特性 | 方案 A (竖屏) | 方案 B (横屏) | 方案 C (浮动) |
|------|--------------|--------------|--------------|
| 适用场景 | 手机竖握 | 手机横握/平板 | 任意 |
| 操作舒适度 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 视野遮挡 | 中 | 低 | 低 |
| 实现复杂度 | 低 | 中 | 高 |
| 推荐度 | 🔥 首选 | 🔥 推荐 | 🟡 可选 |

---

## 🎨 视觉设计规范

### 色彩方案 (赛博朋克风格)

```css
:root {
  /* 主色调 - 霓虹青 */
  --neon-cyan: #00ffff;
  --neon-cyan-dim: rgba(0, 255, 255, 0.1);
  --neon-cyan-bright: rgba(0, 255, 255, 0.4);
  
  /* 功能色 - 霓虹粉 */
  --neon-pink: #ff00ff;
  --neon-pink-dim: rgba(255, 0, 255, 0.1);
  --neon-pink-bright: rgba(255, 0, 255, 0.4);
  
  /* 警告色 - 霓虹橙 */
  --neon-orange: #ffa600;
  --neon-orange-dim: rgba(255, 166, 0, 0.1);
  --neon-orange-bright: rgba(255, 166, 0, 0.4);
  
  /* 成功色 - 霓虹绿 */
  --neon-green: #00ff80;
  --neon-green-dim: rgba(0, 255, 128, 0.1);
  --neon-green-bright: rgba(0, 255, 128, 0.4);
  
  /* 危险色 - 霓虹红 */
  --neon-red: #ff0040;
  --neon-red-dim: rgba(255, 0, 64, 0.1);
  --neon-red-bright: rgba(255, 0, 64, 0.4);
  
  /* 背景 */
  --dark-bg: linear-gradient(135deg, #0a0a0f 0%, #16213e 50%, #0f3460 100%);
  --panel-bg: rgba(0, 0, 0, 0.8);
}
```

### 按键状态设计

```css
/* 基础状态 */
.mobile-btn {
  background: var(--btn-color-dim);
  border: 2px solid var(--btn-color);
  color: var(--btn-color);
  border-radius: 12px;
  transition: all 0.1s ease-out;
  box-shadow: 0 0 5px var(--btn-color-dim);
}

/* 按下状态 */
.mobile-btn:active,
.mobile-btn.pressed {
  background: var(--btn-color-bright);
  box-shadow: 0 0 15px var(--btn-color), inset 0 0 10px var(--btn-color-dim);
  transform: scale(0.95);
}

/* 禁用状态 */
.mobile-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(50%);
}

/* 触摸高亮 */
.mobile-btn.touched {
  background: var(--btn-color-bright);
  box-shadow: 0 0 20px var(--btn-color);
}
```

### 按键尺寸规范

```css
/* 方向键 (大) */
.direction-btn {
  width: 64px;
  height: 64px;
  font-size: 28px;
  min-width: 56px;  /* 最小触摸尺寸 */
  min-height: 56px;
}

/* 功能键 (中) */
.action-btn {
  width: 72px;
  height: 56px;
  font-size: 18px;
  min-width: 56px;
  min-height: 48px;
}

/* 辅助键 (小) */
.utility-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  min-height: 44px;
}

/* 间距 */
.btn-group {
  gap: 12px;  /* 按键间距 */
  padding: 12px;  /* 外边距 */
}
```

### 图标与 Emoji

| 功能 | 图标 | 备选 |
|------|------|------|
| 左移 | ⬅️ | ◀️ |
| 右移 | ➡️ | ▶️ |
| 旋转 | 🔄 | ↻ |
| 软降 | ⬇️ | ↓ |
| 硬降 | 💥 | ⚡ |
| 暂停 | ⏸️ | ⏯️ |
| 重开 | 🔄 | 🔄 |

---

## 💻 技术实现建议

### 1. 提取 CSS 到独立文件

**建议创建**: `src/components/ui/MobileControls.css`

```css
/* ==================== 移动端控制样式 ==================== */

/* 主容器 */
.mobile-controls-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px;
  max-width: 400px;
  margin: 0 auto;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

/* 游戏区域触摸层 */
.game-touch-area {
  position: relative;
  background: rgba(0, 255, 255, 0.05);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 10px;
  touch-action: none;
  user-select: none;
}

.game-touch-hint {
  text-align: center;
  color: rgba(0, 255, 255, 0.5);
  font-size: 12px;
  font-family: Orbitron, monospace;
}

/* 按钮网格 */
.direction-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

/* 通用按钮样式 */
.mobile-btn {
  padding: 20px;
  font-size: 24px;
  border: 2px solid;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.1s ease-out;
  opacity: 1;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Orbitron, monospace;
}

.mobile-btn:active,
.mobile-btn.pressed {
  transform: scale(0.95);
}

.mobile-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 颜色变体 */
.mobile-btn-cyan {
  background: rgba(0, 255, 255, 0.1);
  border-color: #00ffff;
  color: #00ffff;
}

.mobile-btn-cyan:active,
.mobile-btn-cyan.pressed {
  background: rgba(0, 255, 255, 0.4);
  box-shadow: 0 0 15px #00ffff;
}

.mobile-btn-pink {
  background: rgba(255, 0, 255, 0.1);
  border-color: #ff00ff;
  color: #ff00ff;
}

.mobile-btn-pink:active,
.mobile-btn-pink.pressed {
  background: rgba(255, 0, 255, 0.4);
  box-shadow: 0 0 15px #ff00ff;
}

.mobile-btn-green {
  background: rgba(0, 255, 128, 0.1);
  border-color: #00ff80;
  color: #00ff80;
}

.mobile-btn-green:active,
.mobile-btn-green.pressed {
  background: rgba(0, 255, 128, 0.4);
  box-shadow: 0 0 15px #00ff80;
}

.mobile-btn-orange {
  background: rgba(255, 166, 0, 0.1);
  border-color: #ffa600;
  color: #ffa600;
}

.mobile-btn-orange:active,
.mobile-btn-orange.pressed {
  background: rgba(255, 166, 0, 0.4);
  box-shadow: 0 0 15px #ffa600;
}

.mobile-btn-red {
  background: rgba(255, 0, 64, 0.1);
  border-color: #ff0040;
  color: #ff0040;
}

.mobile-btn-red:active,
.mobile-btn-red.pressed {
  background: rgba(255, 0, 64, 0.4);
  box-shadow: 0 0 15px #ff0040;
}

/* 横屏模式适配 */
@media (orientation: landscape) and (max-height: 500px) {
  .mobile-controls-container {
    flex-direction: row;
    justify-content: space-between;
    max-width: 100%;
  }
  
  .direction-grid,
  .action-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .game-touch-area {
    display: none;  /* 横屏时隐藏触摸提示 */
  }
}

/* 超大屏幕适配 */
@media (min-width: 768px) {
  .mobile-controls-container {
    max-width: 600px;
  }
  
  .mobile-btn {
    padding: 24px;
    font-size: 28px;
  }
}
```

---

### 2. 组件重构建议

**当前问题**: 样式内联，难以维护和定制

**建议方案**:

```typescript
// src/components/ui/MobileControls.tsx

import React, { useRef, useState, useCallback } from 'react';
import './MobileControls.css';  // 引入独立 CSS

interface MobileControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onPause: () => void;
  onRestart?: () => void;  // 新增：重开按钮
  disabled?: boolean;
  layout?: 'portrait' | 'landscape' | 'floating';  // 新增：布局模式
  showTouchArea?: boolean;  // 新增：是否显示触摸区
}

const MobileControls: React.FC<MobileControlsProps> = ({
  // ... props
  layout = 'portrait',
  showTouchArea = true,
}) => {
  // ... 逻辑保持不变
  
  return (
    <div className={`mobile-controls-container layout-${layout}`}>
      {showTouchArea && (
        <div className="game-touch-area" {...touchHandlers}>
          <div className="game-touch-hint">👆 滑动控制 | 双击硬降落</div>
        </div>
      )}
      
      <div className="direction-grid">
        <button className="mobile-btn mobile-btn-cyan" {...handlers.left}>⬅️</button>
        <button className="mobile-btn mobile-btn-pink" {...handlers.rotate}>🔄</button>
        <button className="mobile-btn mobile-btn-cyan" {...handlers.right}>➡️</button>
      </div>
      
      <div className="action-grid">
        <button className="mobile-btn mobile-btn-green" {...handlers.softDrop}>⬇️ 软降</button>
        <button className="mobile-btn mobile-btn-orange" {...handlers.hardDrop}>💥 硬降</button>
      </div>
      
      <button className="mobile-btn mobile-btn-red utility-btn" onClick={onPause}>
        ⏸️ 暂停 / 继续
      </button>
      
      {onRestart && (
        <button className="mobile-btn mobile-btn-pink utility-btn" onClick={onRestart}>
          🔄 重开
        </button>
      )}
    </div>
  );
};

export default MobileControls;
```

---

### 3. 触觉反馈实现

```typescript
// 在 MobileControls.tsx 中添加

/**
 * 触觉反馈
 */
const vibrate = useCallback((pattern: number | number[] = 10) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}, []);

// 在不同操作中调用
const handlePressStart = useCallback((action: () => void, button: string) => {
  if (disabled) return;
  setActiveButton(button);
  vibrate(10);  // 短震动
  action();
}, [disabled, vibrate]);

const handleDoubleTap = useCallback(() => {
  if (disabled) return;
  vibrate([20, 10, 20]);  // 双震动反馈
  onHardDrop();
}, [disabled, vibrate, onHardDrop]);
```

---

### 4. 响应式布局 Hook

**建议创建**: `src/hooks/useMobileLayout.ts`

```typescript
import { useState, useEffect } from 'react';

export type MobileLayout = 'portrait' | 'landscape' | 'tablet';

interface UseMobileLayoutReturn {
  layout: MobileLayout;
  isMobile: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  controlsSize: 'small' | 'medium' | 'large';
}

export function useMobileLayout(): UseMobileLayoutReturn {
  const [layout, setLayout] = useState<MobileLayout>('portrait');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouch = 'ontouchstart' in window;
      
      setIsMobile(width < 768 || isTouch);
      
      if (width < 768) {
        if (height > width) {
          setLayout('portrait');
        } else {
          setLayout('landscape');
        }
      } else {
        setLayout('tablet');
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  return {
    layout,
    isMobile,
    isPortrait: layout === 'portrait',
    isLandscape: layout === 'landscape',
    controlsSize: isMobile ? 'medium' : 'large',
  };
}
```

---

### 5. 设置面板集成

**建议在设置中添加**:

```typescript
// src/components/ui/SettingsPanel.tsx (新建)

interface MobileSettings {
  controlsLayout: 'portrait' | 'landscape' | 'floating';
  controlsOpacity: number;  // 0.5 - 1.0
  showTouchArea: boolean;
  hapticFeedback: boolean;
  controlsSize: 'small' | 'medium' | 'large';
}

// 保存到 localStorage
const saveMobileSettings = (settings: MobileSettings) => {
  localStorage.setItem('mobileControls', JSON.stringify(settings));
};

// 从 localStorage 加载
const loadMobileSettings = (): MobileSettings => {
  const saved = localStorage.getItem('mobileControls');
  return saved ? JSON.parse(saved) : {
    controlsLayout: 'portrait',
    controlsOpacity: 0.9,
    showTouchArea: true,
    hapticFeedback: true,
    controlsSize: 'medium',
  };
};
```

---

## 🎮 交互细节

### 手势识别参数

```typescript
const GESTURE_CONFIG = {
  // 滑动阈值 (px)
  SWIPE_THRESHOLD: 30,
  
  // 双击时间间隔 (ms)
  DOUBLE_TAP_INTERVAL: 300,
  
  // 长按时间 (ms) - 可用于硬降备选方案
  LONG_PRESS_DURATION: 400,
  
  // 防止误触延迟 (ms)
  ANTI_MISCLICK_DELAY: 50,
};
```

### 按键连发机制

```typescript
// 对于左右移动，支持长按连发
const useAutoRepeat = (
  action: () => void,
  initialDelay: number = 300,
  repeatInterval: number = 100
) => {
  const timerRef = useRef<number | null>(null);
  
  const start = useCallback(() => {
    action();  // 立即执行一次
    timerRef.current = window.setTimeout(() => {
      action();  // 延迟后第二次
      timerRef.current = window.setInterval(action, repeatInterval);
    }, initialDelay);
  }, [action, initialDelay, repeatInterval]);
  
  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  return { start, stop };
};
```

### 防误触策略

1. **触摸缓冲** - 按键周围 10px 作为缓冲区域
2. **滑动锁定** - 开始滑动后，300ms 内不响应点击
3. **边缘禁用** - 屏幕边缘 20px 禁用触摸（防止系统手势冲突）
4. **延迟响应** - 游戏开始时 500ms 内禁用控件（防止误触）

---

## 🧪 测试建议

### 设备覆盖

| 设备类型 | 屏幕尺寸 | 测试重点 |
|----------|----------|----------|
| 小屏手机 | < 5.5" | 按键大小、布局紧凑度 |
| 大屏手机 | 5.5" - 6.7" | 单手握持舒适度 |
| 折叠屏 | 展开 > 7" | 横屏布局、多任务 |
| 平板 | > 8" | 双手操作、浮动布局 |

### 测试场景

1. **单手竖屏** - 拇指覆盖所有按键
2. **双手横屏** - 左右手分工明确
3. **快速操作** - 连按、快速切换方向
4. **边看边按** - 视线在游戏区，手在控制区
5. **误触测试** - 手掌边缘、意外滑动

### 性能指标

- **触摸响应延迟**: < 50ms
- **帧率影响**: 开启控件后 FPS 下降 < 5%
- **内存占用**: 控件组件 < 1MB
- **包体积增加**: CSS + TSX < 10KB

---

## 📦 交付清单

### 已完成
- ✅ 需求分析
- ✅ 当前实现分析
- ✅ 3 种布局方案设计
- ✅ 视觉设计规范
- ✅ 技术实现建议

### 待实现 (v1.8.0)
- [ ] 提取 CSS 到独立文件 `MobileControls.css`
- [ ] 添加横屏布局支持
- [ ] 实现触觉反馈
- [ ] 添加设置面板集成
- [ ] 实现浮动布局 (可选)
- [ ] 添加按键连发机制
- [ ] 完善防误触策略
- [ ] 多设备测试

---

## 🔗 相关文件

- 当前实现：`src/components/ui/MobileControls.tsx`
- 响应式布局：`src/components/ui/ResponsiveLayout.tsx`
- 主应用：`src/App.tsx`
- CSS 规范：`src/components/ui/CardDeck.css` (参考)

---

**设计师**: 千束 🎮  
**创建时间**: 2026-03-11 09:30  
**版本**: v1.0  
**状态**: 设计方案完成，待开发实现

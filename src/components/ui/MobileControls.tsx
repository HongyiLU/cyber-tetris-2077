// ==================== v1.9.3 长按硬降版移动端控制组件 ====================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import './MobileControls.css';

export interface MobileControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onPause: () => void;
  onRestart?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  opacity?: number;
  // v1.9.3 新增：长按硬降配置
  longPressConfig?: {
    enabled?: boolean;        // 是否启用长按硬降（默认 true）
    triggerTime?: number;     // 长按触发时间 ms（默认 300）
    repeatEnabled?: boolean;  // 是否启用连发（默认 true）
    repeatInterval?: number;  // 连发间隔 ms（默认 200）
  };
}

const MobileControls: React.FC<MobileControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
  onPause,
  onRestart,
  disabled = false,
  size = 'medium',
  opacity = 0.9,
  longPressConfig = {},
}) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const repeatIntervalRef = useRef<number | null>(null);
  // v1.9.3 新增：长按硬降计时器
  const longPressHardDropTimerRef = useRef<number | null>(null);
  const hardDropRepeatTimerRef = useRef<number | null>(null);

  // v1.9.3 长按硬降配置（必须在 callbacks 之前定义）
  const LONG_PRESS_TRIGGER_TIME = longPressConfig.triggerTime ?? 300; // 默认 300ms
  const LONG_PRESS_REPEAT_INTERVAL = longPressConfig.repeatInterval ?? 200; // 默认 200ms
  const isLongPressEnabled = longPressConfig.enabled ?? true;
  const isRepeatEnabled = longPressConfig.repeatEnabled ?? true;

  // 触觉反馈
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // 忽略错误
      }
    }
  }, []);

  // 清理定时器（包括长按硬降定时器）
  const clearTimers = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (repeatIntervalRef.current) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
    // v1.9.3 新增：清理长按硬降定时器
    if (longPressHardDropTimerRef.current) {
      clearTimeout(longPressHardDropTimerRef.current);
      longPressHardDropTimerRef.current = null;
    }
    if (hardDropRepeatTimerRef.current) {
      clearInterval(hardDropRepeatTimerRef.current);
      hardDropRepeatTimerRef.current = null;
    }
  }, []);

  // 开始长按连发
  const startLongPress = useCallback((action: () => void, buttonId: string) => {
    if (disabled) return;
    
    setActiveButton(buttonId);
    vibrate(10);
    action();

    longPressTimerRef.current = window.setTimeout(() => {
      action();
      repeatIntervalRef.current = window.setInterval(action, 100);
    }, 300);
  }, [disabled, vibrate]);

  // 释放按钮
  const endPress = useCallback(() => {
    clearTimers();
    setActiveButton(null);
  }, [clearTimers]);

  // 按钮按下处理
  const handlePressStart = useCallback((action: () => void, buttonId: string, enableRepeat: boolean = false) => {
    if (disabled) return;
    
    if (enableRepeat) {
      startLongPress(action, buttonId);
    } else {
      setActiveButton(buttonId);
      vibrate(10);
      action();
    }
  }, [disabled, startLongPress, vibrate]);

  // v1.9.3 触摸滑动处理（集成长按硬降）
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    
    // v1.9.3 新增：启动长按硬降计时器
    if (isLongPressEnabled) {
      longPressHardDropTimerRef.current = window.setTimeout(() => {
        vibrate([20, 10, 20]); // 硬降震动反馈
        onHardDrop();
        
        // v1.9.3 新增：长按连发
        if (isRepeatEnabled) {
          hardDropRepeatTimerRef.current = window.setInterval(() => {
            vibrate(10);
            onHardDrop();
          }, LONG_PRESS_REPEAT_INTERVAL);
        }
      }, LONG_PRESS_TRIGGER_TIME);
    }
  }, [disabled, isLongPressEnabled, isRepeatEnabled, vibrate, onHardDrop, LONG_PRESS_TRIGGER_TIME, LONG_PRESS_REPEAT_INTERVAL]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || disabled) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    e.preventDefault();
    
    // v1.9.3 优化：滑动时取消长按硬降
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      if (longPressHardDropTimerRef.current) {
        clearTimeout(longPressHardDropTimerRef.current);
        longPressHardDropTimerRef.current = null;
      }
      if (hardDropRepeatTimerRef.current) {
        clearInterval(hardDropRepeatTimerRef.current);
        hardDropRepeatTimerRef.current = null;
      }
    }
    
    if (Math.abs(deltaX) > 30) {
      deltaX > 0 ? onMoveRight() : onMoveLeft();
      vibrate(8);
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
    
    if (deltaY > 30) {
      onSoftDrop();
      vibrate(8);
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  }, [disabled, onMoveLeft, onMoveRight, onSoftDrop, vibrate]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    // v1.9.3 新增：清理长按硬降定时器
    if (longPressHardDropTimerRef.current) {
      clearTimeout(longPressHardDropTimerRef.current);
      longPressHardDropTimerRef.current = null;
    }
    if (hardDropRepeatTimerRef.current) {
      clearInterval(hardDropRepeatTimerRef.current);
      hardDropRepeatTimerRef.current = null;
    }
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return (
    <div 
      className={`mobile-controls size-${size}`}
      style={{ opacity }}
    >
      {/* 游戏区域触摸层 */}
      <div
        className="touch-area"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        // v1.9.3 移除 onClick，改为单击立即旋转
        onClick={() => {
          if (!disabled) {
            vibrate(10);
            onRotate();
          }
        }}
      >
        <div className="touch-hint">滑动控制 | 长按硬降</div>
      </div>

      {/* 第一行：方向控制 ⬅️ 🔄 ➡️ */}
      <div className="button-row direction-row">
        <button
          className={`btn btn-cyan ${activeButton === 'left' ? 'active' : ''}`}
          onTouchStart={() => handlePressStart(onMoveLeft, 'left', true)}
          onTouchEnd={endPress}
          onMouseDown={() => handlePressStart(onMoveLeft, 'left', true)}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          disabled={disabled}
        >
          ⬅️
        </button>
        <button
          className={`btn btn-pink ${activeButton === 'rotate' ? 'active' : ''}`}
          onTouchStart={() => handlePressStart(onRotate, 'rotate')}
          onTouchEnd={endPress}
          onMouseDown={() => handlePressStart(onRotate, 'rotate')}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          disabled={disabled}
        >
          🔄
        </button>
        <button
          className={`btn btn-cyan ${activeButton === 'right' ? 'active' : ''}`}
          onTouchStart={() => handlePressStart(onMoveRight, 'right', true)}
          onTouchEnd={endPress}
          onMouseDown={() => handlePressStart(onMoveRight, 'right', true)}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          disabled={disabled}
        >
          ➡️
        </button>
      </div>

      {/* 第二行：降落 ⬇️软降 💥硬降 */}
      <div className="button-row drop-row">
        <button
          className={`btn btn-green ${activeButton === 'softDrop' ? 'active' : ''}`}
          onTouchStart={() => handlePressStart(onSoftDrop, 'softDrop')}
          onTouchEnd={endPress}
          onMouseDown={() => handlePressStart(onSoftDrop, 'softDrop')}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          disabled={disabled}
        >
          ⬇️ 软降
        </button>
        <button
          className={`btn btn-orange ${activeButton === 'hardDrop' ? 'active' : ''}`}
          onTouchStart={() => handlePressStart(onHardDrop, 'hardDrop')}
          onTouchEnd={endPress}
          onMouseDown={() => handlePressStart(onHardDrop, 'hardDrop')}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          disabled={disabled}
        >
          💥 硬降
        </button>
      </div>

      {/* 第三行：暂停/重开 */}
      <div className="button-row utility-row">
        <button
          className={`btn btn-red utility-btn ${activeButton === 'pause' ? 'active' : ''}`}
          onClick={() => {
            setActiveButton('pause');
            vibrate(15);
            onPause();
            setTimeout(() => setActiveButton(null), 100);
          }}
          disabled={disabled}
        >
          ⏸️ 暂停
        </button>
        {onRestart && (
          <button
            className={`btn btn-pink utility-btn ${activeButton === 'restart' ? 'active' : ''}`}
            onClick={() => {
              setActiveButton('restart');
              vibrate([15, 10, 15]);
              onRestart();
              setTimeout(() => setActiveButton(null), 100);
            }}
            disabled={disabled}
          >
            🔄 重开
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileControls;

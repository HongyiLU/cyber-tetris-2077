// ==================== v1.9.1 精简版移动端控制组件 ====================

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
}) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const repeatIntervalRef = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);
  const tapTimerRef = useRef<number | null>(null);

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

  // 清理定时器（包括点击定时器）
  const clearTimers = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (repeatIntervalRef.current) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
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

  // 触摸滑动处理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || disabled) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    e.preventDefault();
    
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
  }, []);

  // 双击时间窗口：400ms（行业标准，平衡响应速度和误触率）
  const DOUBLE_TAP_DELAY = 400;

  // 双击硬降落（优化：延迟执行单击动作，避免双击时误触发）
  const handleTap = useCallback(() => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    // 清理之前的定时器
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
    }
    
    // 双击 - 硬降（400ms 内第二次点击）
    if (timeSinceLastTap < DOUBLE_TAP_DELAY) {
      // 检测到双击，立即执行硬降
      vibrate([20, 10, 20]);
      onHardDrop();
      lastTapRef.current = 0;
    } else {
      // 第一次点击，延迟执行旋转，等待可能的第二次点击
      lastTapRef.current = now;
      tapTimerRef.current = window.setTimeout(() => {
        // 延迟后没有第二次点击，执行单击旋转
        vibrate(10);
        onRotate();
        lastTapRef.current = 0;
        tapTimerRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  }, [vibrate, onHardDrop, onRotate]);

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
        onClick={handleTap}
      >
        <div className="touch-hint">滑动控制 | 双击硬降</div>
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

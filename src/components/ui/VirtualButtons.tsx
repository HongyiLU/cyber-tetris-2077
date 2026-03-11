// ==================== v1.9.1 精简版虚拟按键组件 ====================
// 轻量级移动端控制组件 - 专注于核心功能

import React, { useCallback, useEffect, useRef, useState } from 'react';
import './VirtualButtons.css';

export interface VirtualButtonsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  opacity?: number;
}

interface ButtonConfig {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  color: 'cyan' | 'pink' | 'green' | 'orange';
  span?: number;
}

const VirtualButtons: React.FC<VirtualButtonsProps> = ({
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
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

    // 长按后开始连发
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

  // 触摸滑动处理（游戏区域）
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

  // 按钮配置
  const buttons: ButtonConfig[] = [
    { id: 'left', label: '左移', icon: '⬅️', action: onMoveLeft, color: 'cyan', span: 1 },
    { id: 'rotate', label: '旋转', icon: '🔄', action: onRotate, color: 'pink', span: 1 },
    { id: 'right', label: '右移', icon: '➡️', action: onMoveRight, color: 'cyan', span: 1 },
    { id: 'softDrop', label: '软降', icon: '⬇️', action: onSoftDrop, color: 'green', span: 1 },
    { id: 'hardDrop', label: '硬降', icon: '💥', action: onHardDrop, color: 'orange', span: 1 },
  ];

  const colorClasses = {
    cyan: 'btn-cyan',
    pink: 'btn-pink',
    green: 'btn-green',
    orange: 'btn-orange',
  };

  return (
    <div 
      className={`virtual-buttons size-${size}`}
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

      {/* 方向控制 */}
      <div className="button-row">
        {buttons.slice(0, 3).map(btn => (
          <button
            key={btn.id}
            className={`btn ${colorClasses[btn.color]} ${activeButton === btn.id ? 'active' : ''}`}
            onTouchStart={() => handlePressStart(btn.action, btn.id, btn.id === 'left' || btn.id === 'right')}
            onTouchEnd={endPress}
            onMouseDown={() => handlePressStart(btn.action, btn.id, btn.id === 'left' || btn.id === 'right')}
            onMouseUp={endPress}
            onMouseLeave={endPress}
            disabled={disabled}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* 功能按钮 */}
      <div className="button-row">
        {buttons.slice(3).map(btn => (
          <button
            key={btn.id}
            className={`btn ${colorClasses[btn.color]} ${activeButton === btn.id ? 'active' : ''}`}
            onTouchStart={() => handlePressStart(btn.action, btn.id)}
            onTouchEnd={endPress}
            onMouseDown={() => handlePressStart(btn.action, btn.id)}
            onMouseUp={endPress}
            onMouseLeave={endPress}
            disabled={disabled}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VirtualButtons;

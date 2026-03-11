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

  // 清理定时器
  const clearTimers = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (repeatIntervalRef.current) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
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

  // 双击硬降落
  const lastTapRef = useRef<number>(0);
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      vibrate([20, 10, 20]);
      onHardDrop();
    }
    lastTapRef.current = now;
  }, [vibrate, onHardDrop]);

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

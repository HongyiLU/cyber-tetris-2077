// ==================== 移动端控制组件 ====================

import React, { useRef, useState, useCallback, useEffect } from 'react';
import './MobileControls.css';

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
  opacity?: number;  // 新增：透明度 0.5-1.0
  controlsSize?: 'small' | 'medium' | 'large';  // 新增：按键尺寸
  hapticFeedback?: boolean;  // 新增：触觉反馈
}

interface MobileSettings {
  layout: 'portrait' | 'landscape' | 'floating';
  opacity: number;
  showTouchArea: boolean;
  hapticFeedback: boolean;
  controlsSize: 'small' | 'medium' | 'large';
}

/**
 * 从 localStorage 加载移动设置
 */
const loadMobileSettings = (): MobileSettings => {
  try {
    const saved = localStorage.getItem('mobileControls');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load mobile settings:', e);
  }
  return {
    layout: 'portrait',
    opacity: 0.9,
    showTouchArea: true,
    hapticFeedback: true,
    controlsSize: 'medium',
  };
};

/**
 * 保存移动设置到 localStorage
 */
const saveMobileSettings = (settings: Partial<MobileSettings>) => {
  try {
    const current = loadMobileSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('mobileControls', JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save mobile settings:', e);
  }
};

const MobileControls: React.FC<MobileControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
  onPause,
  onRestart,
  disabled = false,
  layout: propLayout,
  showTouchArea: propShowTouchArea,
  opacity: propOpacity,
  controlsSize: propControlsSize,
  hapticFeedback: propHapticFeedback,
}) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const lastTapRef = useRef<number>(0);
  const autoRepeatTimerRef = useRef<number | null>(null);
  const isProcessingRef = useRef<boolean>(false);  // P0-002: 防止重复触发标志位
  
  // 从 localStorage 加载设置
  const [settings, setSettings] = useState<MobileSettings>(() => loadMobileSettings());
  
  // 合并 props 和 settings
  const layout = propLayout ?? settings.layout;
  const showTouchArea = propShowTouchArea ?? settings.showTouchArea;
  const opacity = propOpacity ?? settings.opacity;
  const controlsSize = propControlsSize ?? settings.controlsSize;
  const hapticFeedback = propHapticFeedback ?? settings.hapticFeedback;

  /**
   * 触觉反馈
   */
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (hapticFeedback && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // 忽略震动 API 错误
      }
    }
  }, [hapticFeedback]);

  /**
   * 按键连发 Hook
   */
  const useAutoRepeat = useCallback((
    action: () => void,
    initialDelay: number = 300,
    repeatInterval: number = 100
  ) => {
    return {
      start: useCallback(() => {
        action();  // 立即执行一次
        autoRepeatTimerRef.current = window.setTimeout(() => {
          action();  // 延迟后第二次
          autoRepeatTimerRef.current = window.setInterval(action, repeatInterval);
        }, initialDelay);
      }, [action, initialDelay, repeatInterval]),
      stop: useCallback(() => {
        if (autoRepeatTimerRef.current) {
          clearInterval(autoRepeatTimerRef.current);
          clearTimeout(autoRepeatTimerRef.current);
          autoRepeatTimerRef.current = null;
        }
      }, []),
    };
  }, []);

  // 为左右移动创建连发功能
  const leftRepeat = useAutoRepeat(onMoveLeft);
  const rightRepeat = useAutoRepeat(onMoveRight);

  /**
   * 处理按钮按下
   */
  const handlePressStart = useCallback((action: () => void, button: string, enableRepeat: boolean = false) => {
    // P0-002: 防止重复触发
    if (disabled || isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    setActiveButton(button);
    vibrate(10);  // 短震动反馈
    
    if (enableRepeat) {
      if (button === 'left') leftRepeat.start();
      else if (button === 'right') rightRepeat.start();
      else action();
    } else {
      action();
    }
    
    // P0-002: 50ms 后重置标志位，允许下一次触发
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 50);
  }, [disabled, vibrate, leftRepeat, rightRepeat]);

  /**
   * 处理按钮释放
   */
  const handlePressEnd = useCallback(() => {
    setActiveButton(null);
    leftRepeat.stop();
    rightRepeat.stop();
  }, [leftRepeat, rightRepeat]);

  /**
   * 处理触摸滑动
   */
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
    
    // 防止默认滚动
    e.preventDefault();
    
    // 水平滑动超过阈值
    if (Math.abs(deltaX) > 30) {
      if (deltaX > 0) {
        onMoveRight();
        vibrate(8);
      } else {
        onMoveLeft();
        vibrate(8);
      }
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
    
    // 垂直滑动超过阈值
    if (deltaY > 30) {
      onSoftDrop();
      vibrate(8);
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  }, [disabled, onMoveLeft, onMoveRight, onSoftDrop, vibrate]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  /**
   * 处理双击（硬降落）
   */
  const handleDoubleTap = useCallback(() => {
    if (disabled) return;
    vibrate([20, 10, 20]);  // 双震动反馈
    onHardDrop();
  }, [disabled, vibrate, onHardDrop]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleDoubleTap();
    }
    lastTapRef.current = now;
  }, [handleDoubleTap]);

  /**
   * 更新设置
   */
  const updateSetting = useCallback(<K extends keyof MobileSettings>(key: K, value: MobileSettings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      saveMobileSettings({ [key]: value });
      return updated;
    });
  }, []);

  // 暴露设置方法供外部调用 (通过 ref 或自定义事件)
  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent<Partial<MobileSettings>>) => {
      Object.entries(event.detail).forEach(([key, value]) => {
        updateSetting(key as keyof MobileSettings, value as any);
      });
    };

    window.addEventListener('mobileControlsSettingsUpdate' as any, handleSettingsUpdate as any);
    return () => {
      window.removeEventListener('mobileControlsSettingsUpdate' as any, handleSettingsUpdate as any);
    };
  }, [updateSetting]);

  // P0-001: 组件卸载时清理所有定时器
  useEffect(() => {
    return () => {
      if (autoRepeatTimerRef.current) {
        clearInterval(autoRepeatTimerRef.current);
        clearTimeout(autoRepeatTimerRef.current);
        autoRepeatTimerRef.current = null;
      }
    };
  }, []);

  // 应用透明度类名
  const opacityClass = opacity >= 0.9 ? 'controls-opacity-high' : opacity >= 0.7 ? 'controls-opacity-medium' : 'controls-opacity-low';
  
  // 应用尺寸类名
  const sizeClass = `controls-size-${controlsSize}`;

  return (
    <div 
      className={`mobile-controls-container layout-${layout} ${opacityClass} ${sizeClass} ${!hapticFeedback ? 'no-haptic' : ''}`}
      style={{ opacity }}
    >
      {showTouchArea && layout !== 'landscape' && (
        <div
          className="game-touch-area"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleTap}
        >
          <div className="game-touch-hint">
            👆 滑动控制 | 双击硬降落
          </div>
        </div>
      )}

      {/* 方向控制按钮 */}
      <div className="direction-grid">
        {/* 左 */}
        <button
          className="mobile-btn mobile-btn-cyan"
          onTouchStart={() => handlePressStart(onMoveLeft, 'left', true)}
          onTouchEnd={handlePressEnd}
          onMouseDown={() => handlePressStart(onMoveLeft, 'left', true)}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          disabled={disabled}
        >
          ⬅️
        </button>

        {/* 旋转 */}
        <button
          className="mobile-btn mobile-btn-pink"
          onTouchStart={() => handlePressStart(onRotate, 'rotate')}
          onTouchEnd={handlePressEnd}
          onMouseDown={() => handlePressStart(onRotate, 'rotate')}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          disabled={disabled}
        >
          🔄
        </button>

        {/* 右 */}
        <button
          className="mobile-btn mobile-btn-cyan"
          onTouchStart={() => handlePressStart(onMoveRight, 'right', true)}
          onTouchEnd={handlePressEnd}
          onMouseDown={() => handlePressStart(onMoveRight, 'right', true)}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          disabled={disabled}
        >
          ➡️
        </button>
      </div>

      {/* 功能按钮 */}
      <div className="action-grid">
        {/* 软降落 */}
        <button
          className="mobile-btn mobile-btn-green"
          onTouchStart={() => handlePressStart(onSoftDrop, 'softDrop')}
          onTouchEnd={handlePressEnd}
          onMouseDown={() => handlePressStart(onSoftDrop, 'softDrop')}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          disabled={disabled}
        >
          ⬇️ 软降
        </button>

        {/* 硬降落 */}
        <button
          className="mobile-btn mobile-btn-orange"
          onTouchStart={() => handlePressStart(onHardDrop, 'hardDrop')}
          onTouchEnd={handlePressEnd}
          onMouseDown={() => handlePressStart(onHardDrop, 'hardDrop')}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          disabled={disabled}
        >
          💥 硬降
        </button>
      </div>

      {/* 暂停按钮 */}
      <button
        className="mobile-btn mobile-btn-red utility-btn"
        onClick={() => {
          vibrate(15);
          onPause();
        }}
        disabled={disabled}
      >
        ⏸️ 暂停 / 继续
      </button>

      {/* 重开按钮 (可选) */}
      {onRestart && (
        <button
          className="mobile-btn mobile-btn-pink utility-btn"
          onClick={() => {
            vibrate([15, 10, 15]);
            onRestart();
          }}
          disabled={disabled}
        >
          🔄 重开
        </button>
      )}
    </div>
  );
};

// 导出设置工具函数
export { loadMobileSettings, saveMobileSettings };
export type { MobileSettings };

export default MobileControls;

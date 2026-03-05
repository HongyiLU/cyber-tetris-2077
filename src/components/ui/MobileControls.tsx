// ==================== 移动端控制组件 ====================

import React, { useRef, useState, useCallback } from 'react';

interface MobileControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onPause: () => void;
  disabled?: boolean;
}

const MobileControls: React.FC<MobileControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
  onPause,
  disabled = false,
}) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  /**
   * 处理按钮按下
   */
  const handlePressStart = useCallback((action: () => void, button: string) => {
    if (disabled) return;
    setActiveButton(button);
    action();
  }, [disabled]);

  /**
   * 处理按钮释放
   */
  const handlePressEnd = useCallback(() => {
    setActiveButton(null);
  }, []);

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
      } else {
        onMoveLeft();
      }
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
    
    // 垂直滑动超过阈值
    if (deltaY > 30) {
      onSoftDrop();
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  }, [disabled, onMoveLeft, onMoveRight, onSoftDrop]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  /**
   * 处理双击（硬降落）
   */
  const handleDoubleTap = useCallback(() => {
    if (disabled) return;
    onHardDrop();
  }, [disabled, onHardDrop]);

  const lastTapRef = useRef<number>(0);
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleDoubleTap();
    }
    lastTapRef.current = now;
  }, [handleDoubleTap]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      padding: '10px',
      maxWidth: '400px',
      margin: '0 auto',
      touchAction: 'none',
    }}>
      {/* 游戏区域 - 支持滑动和双击 */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleTap}
        style={{
          position: 'relative',
          background: 'rgba(0, 255, 255, 0.05)',
          border: '2px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '10px',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <div style={{
          textAlign: 'center',
          color: 'rgba(0, 255, 255, 0.5)',
          fontSize: '12px',
        }}>
          👆 滑动控制 | 双击硬降落
        </div>
      </div>

      {/* 方向控制按钮 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
      }}>
        {/* 左 */}
        <button
          onTouchStart={() => handlePressStart(onMoveLeft, 'left')}
          onTouchEnd={handlePressEnd}
          onMouseDown={() => handlePressStart(onMoveLeft, 'left')}
          onMouseUp={handlePressEnd}
          disabled={disabled}
          style={{
            padding: '20px',
            fontSize: '24px',
            background: activeButton === 'left' 
              ? 'rgba(0, 255, 255, 0.4)' 
              : 'rgba(0, 255, 255, 0.1)',
            border: '2px solid var(--neon-cyan, #00ffff)',
            borderRadius: '12px',
            color: 'var(--neon-cyan, #00ffff)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.1s',
            opacity: disabled ? 0.5 : 1,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ⬅️
        </button>

        {/* 旋转 */}
        <button
          onTouchStart={() => handlePressStart(onRotate, 'rotate')}
          onTouchEnd={handlePressEnd}
          onMouseDown={() => handlePressStart(onRotate, 'rotate')}
          onMouseUp={handlePressEnd}
          disabled={disabled}
          style={{
            padding: '20px',
            fontSize: '24px',
            background: activeButton === 'rotate' 
              ? 'rgba(255, 0, 255, 0.4)' 
              : 'rgba(255, 0, 255, 0.1)',
            border: '2px solid #ff00ff',
            borderRadius: '12px',
            color: '#ff00ff',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.1s',
            opacity: disabled ? 0.5 : 1,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          🔄
        </button>

        {/* 右 */}
        <button
          onTouchStart={() => handlePressStart(onMoveRight, 'right')}
          onTouchEnd={handlePressEnd}
          onMouseDown={() => handlePressStart(onMoveRight, 'right')}
          onMouseUp={handlePressEnd}
          disabled={disabled}
          style={{
            padding: '20px',
            fontSize: '24px',
            background: activeButton === 'right' 
              ? 'rgba(0, 255, 255, 0.4)' 
              : 'rgba(0, 255, 255, 0.1)',
            border: '2px solid var(--neon-cyan, #00ffff)',
            borderRadius: '12px',
            color: 'var(--neon-cyan, #00ffff)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.1s',
            opacity: disabled ? 0.5 : 1,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ➡️
        </button>
      </div>

      {/* 功能按钮 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
      }}>
        {/* 软降落 */}
        <button
          onTouchStart={() => handlePressStart(onSoftDrop, 'softDrop')}
          onTouchEnd={handlePressEnd}
          onMouseDown={() => handlePressStart(onSoftDrop, 'softDrop')}
          onMouseUp={handlePressEnd}
          disabled={disabled}
          style={{
            padding: '15px',
            fontSize: '16px',
            background: activeButton === 'softDrop' 
              ? 'rgba(0, 255, 128, 0.4)' 
              : 'rgba(0, 255, 128, 0.1)',
            border: '2px solid #00ff80',
            borderRadius: '8px',
            color: '#00ff80',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.1s',
            opacity: disabled ? 0.5 : 1,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ⬇️ 软降
        </button>

        {/* 硬降落 */}
        <button
          onTouchStart={() => handlePressStart(onHardDrop, 'hardDrop')}
          onTouchEnd={handlePressEnd}
          onMouseDown={() => handlePressStart(onHardDrop, 'hardDrop')}
          onMouseUp={handlePressEnd}
          disabled={disabled}
          style={{
            padding: '15px',
            fontSize: '16px',
            background: activeButton === 'hardDrop' 
              ? 'rgba(255, 166, 0, 0.4)' 
              : 'rgba(255, 166, 0, 0.1)',
            border: '2px solid #ffa600',
            borderRadius: '8px',
            color: '#ffa600',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.1s',
            opacity: disabled ? 0.5 : 1,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          💥 硬降
        </button>
      </div>

      {/* 暂停按钮 */}
      <button
        onClick={onPause}
        disabled={disabled}
        style={{
          padding: '12px',
          fontSize: '14px',
          background: 'rgba(255, 0, 64, 0.2)',
          border: '2px solid #ff0040',
          borderRadius: '8px',
          color: '#ff0040',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'Orbitron, monospace',
          opacity: disabled ? 0.5 : 1,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        ⏸️ 暂停 / 继续
      </button>
    </div>
  );
};

export default MobileControls;

// ==================== 游戏画布组件 ====================

import React, { useRef, useEffect, useCallback } from 'react';
import { GAME_CONFIG } from '../../config/game-config';
import { clearCanvas, drawGrid, drawBlock, drawGhostBlock } from '../../utils/render-utils';
import { checkCollisionGhost } from '../../utils/game-utils';
import type { GameState } from '../../types';

interface GameCanvasProps {
  gameState: GameState | null;
  blockSize?: number;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onRotate?: () => void;
  onSoftDrop?: () => void;
  onHardDrop?: () => void;
  onPause?: () => void;
  // v1.9.3 新增：长按硬降配置
  longPressConfig?: {
    enabled?: boolean;        // 是否启用长按硬降（默认 true）
    triggerTime?: number;     // 长按触发时间 ms（默认 300）
    repeatEnabled?: boolean;  // 是否启用连发（默认 false，画布上不启用连发）
    repeatInterval?: number;  // 连发间隔 ms（默认 200）
  };
}

// 创建 typeId 到颜色的反向映射
const TYPE_ID_TO_COLOR: Record<number, string> = {};
Object.entries(GAME_CONFIG.PIECE_TYPE_MAP).forEach(([type, id]) => {
  const color = GAME_CONFIG.COLORS[type as keyof typeof GAME_CONFIG.COLORS];
  if (color) {
    TYPE_ID_TO_COLOR[id] = color;
  }
});

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  blockSize,
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
  onPause,
  longPressConfig = {},
}) => {
  // 移动端使用更小的 blockSize
  const actualBlockSize = blockSize ?? (typeof window !== 'undefined' && window.innerWidth < 768 
    ? 20  // 移动端 20px
    : GAME_CONFIG.GAME.BLOCK_SIZE);  // 桌面端 30px

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  // v1.9.3 新增：长按硬降计时器
  const longPressHardDropTimerRef = useRef<number | null>(null);
  const hardDropRepeatTimerRef = useRef<number | null>(null);

  // v1.9.3 长按硬降配置
  const LONG_PRESS_TRIGGER_TIME = longPressConfig.triggerTime ?? 300; // 默认 300ms
  const LONG_PRESS_REPEAT_INTERVAL = longPressConfig.repeatInterval ?? 200; // 默认 200ms
  const isLongPressEnabled = longPressConfig.enabled ?? true;
  const isRepeatEnabled = longPressConfig.repeatEnabled ?? false; // 画布上默认不启用连发

  // 更新 gameStateRef
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // v1.9.3 清理长按硬降定时器
  const clearLongPressTimers = useCallback(() => {
    if (longPressHardDropTimerRef.current) {
      clearTimeout(longPressHardDropTimerRef.current);
      longPressHardDropTimerRef.current = null;
    }
    if (hardDropRepeatTimerRef.current) {
      clearInterval(hardDropRepeatTimerRef.current);
      hardDropRepeatTimerRef.current = null;
    }
  }, []);

  // v1.9.3 触摸手势处理（集成长按硬降）
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!gameState || gameState.gameOver || gameState.paused) return;
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    
    // v1.9.3 新增：启动长按硬降计时器
    if (isLongPressEnabled) {
      longPressHardDropTimerRef.current = window.setTimeout(() => {
        if (onHardDrop) {
          onHardDrop();
        }
        
        // v1.9.3 新增：长按连发（画布上默认关闭）
        if (isRepeatEnabled && onHardDrop) {
          hardDropRepeatTimerRef.current = window.setInterval(() => {
            onHardDrop();
          }, LONG_PRESS_REPEAT_INTERVAL);
        }
      }, LONG_PRESS_TRIGGER_TIME);
    }
  }, [gameState, isLongPressEnabled, isRepeatEnabled, onHardDrop, LONG_PRESS_TRIGGER_TIME, LONG_PRESS_REPEAT_INTERVAL]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !gameState || gameState.gameOver || gameState.paused) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    // 防止默认滚动
    e.preventDefault();
    
    // v1.9.3 优化：滑动时取消长按硬降
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      clearLongPressTimers();
    }
    
    // 水平滑动 - 移动方块
    if (Math.abs(deltaX) > 30) {
      if (deltaX > 0 && onMoveRight) {
        onMoveRight();
      } else if (deltaX < 0 && onMoveLeft) {
        onMoveLeft();
      }
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    }
    
    // 垂直向下滑动 - 软降
    if (deltaY > 30 && onSoftDrop) {
      onSoftDrop();
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    }
  }, [gameState, onMoveLeft, onMoveRight, onSoftDrop, clearLongPressTimers]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    // v1.9.3 新增：清理长按硬降定时器
    clearLongPressTimers();
  }, [clearLongPressTimers]);

  // v1.9.3 单击立即旋转（替代双击方案）
  const handleClick = useCallback(() => {
    if (!gameState || gameState.gameOver || gameState.paused) return;
    
    if (onRotate) {
      onRotate();
    }
  }, [gameState, onRotate]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      clearLongPressTimers();
    };
  }, [clearLongPressTimers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    /**
     * 渲染函数 - 使用 requestAnimationFrame 优化性能
     */
    const render = () => {
      const currentState = gameStateRef.current;
      
      // 清空画布
      clearCanvas(ctx, canvas.width, canvas.height);

      // 绘制棋盘网格
      drawGrid(ctx, GAME_CONFIG.GAME.COLS, GAME_CONFIG.GAME.ROWS, actualBlockSize);

      // 绘制已固定的方块
      if (currentState?.board) {
        currentState.board.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell !== 0) {
              const pieceType = Object.keys(GAME_CONFIG.PIECE_TYPE_MAP).find(
                key => GAME_CONFIG.PIECE_TYPE_MAP[key as keyof typeof GAME_CONFIG.PIECE_TYPE_MAP] === cell
              );
              const color = pieceType ? GAME_CONFIG.COLORS[pieceType as keyof typeof GAME_CONFIG.COLORS] : '#ffffff';
              drawBlock(ctx, x, y, actualBlockSize, color);
            }
          });
        });
      }

      // 绘制当前方块和虚影
      if (currentState?.currentPiece) {
        const { shape, position, color } = currentState.currentPiece;
        
        // 先绘制下落虚影（在方块下面）
        let ghostY = position.y;
        while (!checkCollisionGhost(shape, { x: position.x, y: ghostY + 1 }, currentState.board, GAME_CONFIG.GAME.COLS, GAME_CONFIG.GAME.ROWS)) {
          ghostY++;
        }
        
        // 只有在虚影位置与当前位置不同时才绘制
        if (ghostY !== position.y) {
          shape.forEach((row, dy) => {
            row.forEach((cell, dx) => {
              if (cell) {
                drawGhostBlock(ctx, position.x + dx, ghostY + dy, actualBlockSize, color);
              }
            });
          });
        }
        
        // 再绘制当前方块（实心，覆盖虚影）
        shape.forEach((row, dy) => {
          row.forEach((cell, dx) => {
            if (cell) {
              drawBlock(ctx, position.x + dx, position.y + dy, actualBlockSize, color);
            }
          });
        });
      }

      // 继续渲染循环
      animationId = requestAnimationFrame(render);
    };

    // 启动渲染循环
    render();

    // 清理函数
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [actualBlockSize]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.GAME.COLS * actualBlockSize}
        height={GAME_CONFIG.GAME.ROWS * actualBlockSize}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        style={{
          border: `2px solid var(--neon-cyan)`,
          borderRadius: '4px',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 30px rgba(0, 255, 255, 0.05)',
          touchAction: 'none',
          display: 'block',
        }}
      />
      {/* 移动端触摸提示 */}
      {typeof window !== 'undefined' && window.innerWidth < 768 && !gameState?.gameOver && !gameState?.paused && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'rgba(0, 255, 255, 0.3)',
          fontSize: '12px',
          fontFamily: 'Orbitron, monospace',
          textAlign: 'center',
          pointerEvents: 'none',
          textShadow: '0 0 5px rgba(0, 255, 255, 0.5)',
        }}>
          👆 滑动控制<br/>长按硬降
        </div>
      )}
    </div>
  );
};

export default GameCanvas;

// ==================== 游戏画布组件 ====================

import React, { useRef, useEffect } from 'react';
import { GAME_CONFIG } from '../../config/game-config';
import { clearCanvas, drawGrid, drawBlock, drawGhostBlock } from '../../utils/render-utils';
import { checkCollisionGhost } from '../../utils/game-utils';
import type { GameState } from '../../types';

interface GameCanvasProps {
  gameState: GameState | null;
  blockSize?: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  blockSize = GAME_CONFIG.GAME.BLOCK_SIZE 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);

  // 更新 gameStateRef
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

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
      drawGrid(ctx, GAME_CONFIG.GAME.COLS, GAME_CONFIG.GAME.ROWS, blockSize);

      // 绘制已固定的方块
      if (currentState?.board) {
        currentState.board.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell !== 0) {
              const color = Object.values(GAME_CONFIG.COLORS)[cell - 1] || '#ffffff';
              drawBlock(ctx, x, y, blockSize, color);
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
                drawGhostBlock(ctx, position.x + dx, ghostY + dy, blockSize, color);
              }
            });
          });
        }
        
        // 再绘制当前方块（实心，覆盖虚影）
        shape.forEach((row, dy) => {
          row.forEach((cell, dx) => {
            if (cell) {
              drawBlock(ctx, position.x + dx, position.y + dy, blockSize, color);
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
  }, [blockSize]);

  return (
    <canvas
      ref={canvasRef}
      width={GAME_CONFIG.GAME.COLS * blockSize}
      height={GAME_CONFIG.GAME.ROWS * blockSize}
      style={{
        border: `2px solid var(--neon-cyan)`,
        borderRadius: '4px',
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 30px rgba(0, 255, 255, 0.05)',
      }}
    />
  );
};

export default GameCanvas;

import React, { useRef, useEffect } from 'react';
import { GAME_CONFIG } from '../config/game-config';
import type { GameState } from '../engine/GameEngine';

interface GameCanvasProps {
  gameState: GameState | null;
  blockSize?: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  blockSize = GAME_CONFIG.GAME.BLOCK_SIZE 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制棋盘网格
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GAME_CONFIG.GAME.COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * blockSize, 0);
      ctx.lineTo(i * blockSize, GAME_CONFIG.GAME.ROWS * blockSize);
      ctx.stroke();
    }
    for (let i = 0; i <= GAME_CONFIG.GAME.ROWS; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * blockSize);
      ctx.lineTo(GAME_CONFIG.GAME.COLS * blockSize, i * blockSize);
      ctx.stroke();
    }

    // 绘制已固定的方块
    gameState.board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== 0) {
          const color = Object.values(GAME_CONFIG.COLORS)[cell - 1] || '#ffffff';
          drawBlock(ctx, x, y, blockSize, color);
        }
      });
    });

    // 绘制当前方块
    if (gameState.currentPiece) {
      const { shape, position, color } = gameState.currentPiece;
      shape.forEach((row, dy) => {
        row.forEach((cell, dx) => {
          if (cell) {
            drawBlock(ctx, position.x + dx, position.y + dy, blockSize, color);
          }
        });
      });
    }

  }, [gameState, blockSize]);

  const drawBlock = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string
  ) => {
    // 填充
    ctx.fillStyle = color;
    ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);

    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x * size + 1, y * size + 1, size - 2, 3);
    ctx.fillRect(x * size + 1, y * size + 1, 3, size - 2);

    // 阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x * size + size - 4, y * size + 1, 3, size - 2);
    ctx.fillRect(x * size + 1, y * size + size - 4, size - 2, 3);

    // 发光效果
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x * size + 2, y * size + 2, size - 4, size - 4);
    ctx.shadowBlur = 0;
  };

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

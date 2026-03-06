// ==================== 游戏信息面板组件 ====================

import React from 'react';
import { GAME_CONFIG } from '../../config/game-config';
import type { GameState } from '../../types';

interface GameInfoProps {
  gameState: GameState | null;
}

const GameInfo: React.FC<GameInfoProps> = ({ gameState }) => {
  if (!gameState) return null;

  // 渲染下一个方块预览
  const renderNextPiece = () => {
    if (!gameState.nextPiece) return null;

    const { shape, color } = gameState.nextPiece;
    const previewSize = 20;

    return (
      <div style={{
        background: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid var(--neon-cyan)',
        borderRadius: '4px',
        padding: '15px',
        boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--neon-cyan)', marginBottom: '10px' }}>
          下一个
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '60px'
        }}>
          <svg width="80" height="60" style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px' }}>
            {shape.map((row, rowIndex) => (
              row.map((cell, colIndex) => {
                if (cell) {
                  return (
                    <rect
                      key={`${rowIndex}-${colIndex}`}
                      x={colIndex * previewSize + (80 - shape[0].length * previewSize) / 2}
                      y={rowIndex * previewSize + (60 - shape.length * previewSize) / 2}
                      width={previewSize - 2}
                      height={previewSize - 2}
                      fill={color}
                      style={{
                        filter: `drop-shadow(0 0 3px ${color})`,
                      }}
                    />
                  );
                }
                return null;
              })
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px',
      minWidth: '150px'
    }}>
      {renderNextPiece()}

      <div style={{
        background: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid var(--neon-cyan)',
        borderRadius: '4px',
        padding: '15px',
        boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--neon-cyan)', marginBottom: '5px' }}>
          分数
        </div>
        <div style={{ fontSize: '24px', color: 'var(--neon-yellow)', fontWeight: 'bold' }}>
          {gameState.score.toLocaleString()}
        </div>
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid var(--neon-cyan)',
        borderRadius: '4px',
        padding: '15px',
        boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--neon-cyan)', marginBottom: '5px' }}>
          消除行数
        </div>
        <div style={{ fontSize: '24px', color: 'var(--neon-yellow)', fontWeight: 'bold' }}>
          {gameState.lines}
        </div>
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.6)',
        border: '1px solid var(--neon-cyan)',
        borderRadius: '4px',
        padding: '15px',
        boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--neon-cyan)', marginBottom: '5px' }}>
          等级
        </div>
        <div style={{ fontSize: '24px', color: 'var(--neon-yellow)', fontWeight: 'bold' }}>
          {gameState.level}
        </div>
      </div>

      {gameState.gameOver && (
        <div style={{
          background: 'rgba(255, 0, 0, 0.2)',
          border: '2px solid var(--neon-pink)',
          borderRadius: '4px',
          padding: '15px',
          textAlign: 'center',
          boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)',
        }}>
          <div style={{ fontSize: '18px', color: 'var(--neon-pink)', fontWeight: 'bold' }}>
            游戏结束
          </div>
        </div>
      )}

      {gameState.paused && !gameState.gameOver && (
        <div style={{
          background: 'rgba(255, 255, 0, 0.2)',
          border: '2px solid var(--neon-yellow)',
          borderRadius: '4px',
          padding: '15px',
          textAlign: 'center',
          boxShadow: '0 0 20px rgba(255, 255, 0, 0.5)',
        }}>
          <div style={{ fontSize: '18px', color: 'var(--neon-yellow)', fontWeight: 'bold' }}>
            已暂停
          </div>
        </div>
      )}
    </div>
  );
};

export default GameInfo;

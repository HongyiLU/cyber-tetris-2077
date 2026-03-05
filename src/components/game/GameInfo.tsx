// ==================== 游戏信息面板组件 ====================

import React from 'react';
import { GAME_CONFIG } from '../../config/game-config';
import type { GameState } from '../../types';

interface GameInfoProps {
  gameState: GameState | null;
}

const GameInfo: React.FC<GameInfoProps> = ({ gameState }) => {
  if (!gameState) return null;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px',
      minWidth: '150px'
    }}>
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

      {/* 下一个方块提示 */}
      {gameState.nextPiece && (
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
            display: 'grid',
            gridTemplateColumns: `repeat(${gameState.nextPiece.shape[0].length}, 20px)`,
            gap: '2px',
            justifyContent: 'center',
          }}>
            {gameState.nextPiece.shape.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    width: '20px',
                    height: '20px',
                    background: cell ? gameState.nextPiece!.color : 'transparent',
                    borderRadius: '2px',
                    boxShadow: cell ? 'inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.3)' : 'none',
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}

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

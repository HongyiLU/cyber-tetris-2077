import React from 'react';
import type { GameState } from '../engine/GameEngine';

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

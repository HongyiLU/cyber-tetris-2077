import React, { useState, useEffect, useCallback } from 'react';
import { GameEngine } from './engine/GameEngine';
import GameCanvas from './components/GameCanvas';
import GameInfo from './components/GameInfo';
import type { GameState } from './engine/GameEngine';

const App: React.FC = () => {
  const [gameEngine] = useState(() => new GameEngine());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  // 游戏循环
  useEffect(() => {
    if (!gameStarted || !gameState || gameState.gameOver || gameState.paused) return;

    const dropInterval = setInterval(() => {
      gameEngine.movePiece(0, 1);
      gameEngine.lockPiece();
      setGameState(gameEngine.getGameState());
    }, Math.max(100, 1000 - (gameState.level - 1) * 100));

    return () => clearInterval(dropInterval);
  }, [gameStarted, gameState?.gameOver, gameState?.paused, gameState?.level]);

  // 键盘控制
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!gameStarted || !gameState || gameState.gameOver) return;

    switch (e.key) {
      case 'ArrowLeft':
        gameEngine.movePiece(-1, 0);
        break;
      case 'ArrowRight':
        gameEngine.movePiece(1, 0);
        break;
      case 'ArrowDown':
        gameEngine.movePiece(0, 1);
        break;
      case 'ArrowUp':
        gameEngine.rotatePiece();
        break;
      case ' ':
        gameEngine.hardDrop();
        break;
      case 'p':
      case 'P':
        gameEngine.togglePause();
        break;
      default:
        return;
    }

    setGameState(gameEngine.getGameState());
  }, [gameStarted, gameState, gameEngine]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const startGame = () => {
    gameEngine.init();
    setGameState(gameEngine.getGameState());
    setGameStarted(true);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--dark-bg)',
      fontFamily: 'Orbitron, monospace',
    }}>
      <h1 style={{
        fontSize: '48px',
        color: 'var(--neon-cyan)',
        textShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan)',
        marginBottom: '30px',
        letterSpacing: '6px',
      }}>
        赛博方块 2077
      </h1>

      {!gameStarted ? (
        <button
          onClick={startGame}
          style={{
            padding: '15px 40px',
            fontSize: '24px',
            background: 'rgba(0, 255, 255, 0.1)',
            border: '2px solid var(--neon-cyan)',
            borderRadius: '8px',
            color: 'var(--neon-cyan)',
            cursor: 'pointer',
            fontFamily: 'Orbitron, monospace',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
          }}
        >
          开始游戏
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          <GameCanvas gameState={gameState} />
          <GameInfo gameState={gameState} />
        </div>
      )}

      <div style={{
        marginTop: '20px',
        fontSize: '12px',
        color: 'var(--neon-cyan)',
        textAlign: 'center',
        opacity: 0.7,
      }}>
        ← → 移动 | ↑ 旋转 | ↓ 加速 | 空格 落下 | P 暂停
      </div>

      <div style={{
        marginTop: '10px',
        fontSize: '10px',
        color: '#666',
      }}>
        v1.3.0 - React + Canvas
      </div>
    </div>
  );
};

export default App;

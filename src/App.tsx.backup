// ==================== 主应用组件 ====================

import React, { useState } from 'react';
import { GameEngine } from './engine/GameEngine';
import { DeckManager } from './engine/DeckManager';
import { GameCanvas, GameInfo } from './components/game';
import { CardDeck } from './components/ui';
import { useGameLoop, useKeyboardControl } from './hooks';
import type { GameState } from './types';

const App: React.FC = () => {
  const [gameEngine] = useState(() => new GameEngine());
  const [deckManager] = useState(() => new DeckManager());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showDeck, setShowDeck] = useState(false);

  // 使用游戏循环 Hook - 修复内存泄漏
  useGameLoop({
    gameStarted,
    gameState,
    gameEngine,
    paused: gameState?.paused ?? false,
    onGameStateChange: () => {
      setGameState(gameEngine.getGameState());
    },
  });

  // 使用键盘控制 Hook
  useKeyboardControl({
    gameStarted,
    gameState,
    gameEngine,
    onGameStateChange: setGameState,
  });

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
        <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', alignItems: 'center' }}>
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
          
          <button
            onClick={() => setShowDeck(true)}
            style={{
              padding: '12px 30px',
              fontSize: '18px',
              background: 'rgba(255, 0, 255, 0.1)',
              border: '2px solid #ff00ff',
              borderRadius: '8px',
              color: '#ff00ff',
              cursor: 'pointer',
              fontFamily: 'Orbitron, monospace',
              boxShadow: '0 0 15px rgba(255, 0, 255, 0.3)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 0, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 0, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 0, 255, 0.1)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 255, 0.3)';
            }}
          >
            🎴 卡组管理
          </button>
        </div>
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
        v2.1.0 - 卡组系统版
      </div>

      {/* 卡组管理界面 */}
      {showDeck && (
        <CardDeck 
          deckManager={deckManager}
          onClose={() => setShowDeck(false)}
        />
      )}
    </div>
  );
};

export default App;

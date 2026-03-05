// ==================== 主应用组件 ====================

import React, { useState, useCallback } from 'react';
import { GameEngine } from './engine/GameEngine';
import { DeckManager } from './engine/DeckManager';
import { GameCanvas, GameInfo } from './components/game';
import { CardDeck, MobileControls, ResponsiveLayout } from './components/ui';
import { useGameLoop, useKeyboardControl } from './hooks';
import type { GameState } from './types';

const App: React.FC = () => {
  const [gameEngine] = useState(() => new GameEngine());
  const [deckManager] = useState(() => new DeckManager());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showDeck, setShowDeck] = useState(false);

  // 使用游戏循环 Hook
  useGameLoop({
    gameStarted,
    gameState,
    gameEngine,
    paused: gameState?.paused ?? false,
    onGameStateChange: () => {
      setGameState(gameEngine.getGameState());
    },
  });

  // 使用键盘控制 Hook（桌面端）
  useKeyboardControl({
    gameStarted,
    gameState,
    gameEngine,
    onGameStateChange: setGameState,
  });

  const startGame = useCallback(() => {
    gameEngine.init();
    setGameState(gameEngine.getGameState());
    setGameStarted(true);
  }, [gameEngine]);

  // 移动端控制回调 - 不依赖 gameState，直接操作引擎
  const handleMoveLeft = useCallback(() => {
    gameEngine.movePiece(-1, 0);
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);

  const handleMoveRight = useCallback(() => {
    gameEngine.movePiece(1, 0);
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);

  const handleRotate = useCallback(() => {
    gameEngine.rotatePiece();
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);

  const handleSoftDrop = useCallback(() => {
    gameEngine.movePiece(0, 1);
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);

  const handleHardDrop = useCallback(() => {
    gameEngine.hardDrop();
    gameEngine.lockPiece();
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);

  const handlePause = useCallback(() => {
    gameEngine.togglePause();
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);

  return (
    <ResponsiveLayout
      gameCanvas={<GameCanvas gameState={gameState} />}
      gameInfo={<GameInfo gameState={gameState} />}
      mobileControls={gameStarted ? (
        <MobileControls
          onMoveLeft={handleMoveLeft}
          onMoveRight={handleMoveRight}
          onRotate={handleRotate}
          onSoftDrop={handleSoftDrop}
          onHardDrop={handleHardDrop}
          onPause={handlePause}
          disabled={!gameStarted || gameState?.gameOver === true}
        />
      ) : null}
    >
      <h1 style={{
        fontSize: 'clamp(24px, 8vw, 48px)',
        color: 'var(--neon-cyan, #00ffff)',
        textShadow: '0 0 10px var(--neon-cyan, #00ffff), 0 0 20px var(--neon-cyan, #00ffff)',
        marginBottom: '20px',
        letterSpacing: '4px',
        textAlign: 'center',
      }}>
        赛博方块 2077
      </h1>

      {!gameStarted ? (
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          flexDirection: 'column', 
          alignItems: 'center',
          width: '100%',
        }}>
          <button
            onClick={startGame}
            style={{
              padding: 'clamp(12px, 3vw, 15px) clamp(30px, 8vw, 40px)',
              fontSize: 'clamp(18px, 5vw, 24px)',
              background: 'rgba(0, 255, 255, 0.1)',
              border: '2px solid var(--neon-cyan, #00ffff)',
              borderRadius: '8px',
              color: 'var(--neon-cyan, #00ffff)',
              cursor: 'pointer',
              fontFamily: 'Orbitron, monospace',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
              transition: 'all 0.3s',
              width: '100%',
              maxWidth: '300px',
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
              padding: 'clamp(10px, 3vw, 12px) clamp(25px, 6vw, 30px)',
              fontSize: 'clamp(14px, 4vw, 18px)',
              background: 'rgba(255, 0, 255, 0.1)',
              border: '2px solid #ff00ff',
              borderRadius: '8px',
              color: '#ff00ff',
              cursor: 'pointer',
              fontFamily: 'Orbitron, monospace',
              boxShadow: '0 0 15px rgba(255, 0, 255, 0.3)',
              transition: 'all 0.3s',
              width: '100%',
              maxWidth: '300px',
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
        <>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
            <GameCanvas gameState={gameState} />
            <GameInfo gameState={gameState} />
          </div>
          
          <div style={{
            marginTop: '15px',
            fontSize: 'clamp(10px, 3vw, 12px)',
            color: 'var(--neon-cyan, #00ffff)',
            textAlign: 'center',
            opacity: 0.7,
            lineHeight: '1.6',
          }}>
            <div>← → 移动 | ↑ 旋转 | ↓ 加速 | 空格 落下 | P 暂停</div>
            <div style={{ marginTop: '5px' }}>📱 或滑动屏幕 / 点击按钮</div>
          </div>
        </>
      )}

      <div style={{
        marginTop: '10px',
        fontSize: 'clamp(9px, 2.5vw, 10px)',
        color: '#666',
      }}>
        v2.1.0 - 移动端适配版
      </div>

      {/* 卡组管理界面 */}
      {showDeck && (
        <CardDeck 
          deckManager={deckManager}
          onClose={() => setShowDeck(false)}
        />
      )}
    </ResponsiveLayout>
  );
};

export default App;

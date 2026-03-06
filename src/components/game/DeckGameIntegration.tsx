// ==================== 卡组系统与游戏集成示例 ====================

import React, { useState, useCallback } from 'react';
import { GameEngine } from '../../engine/GameEngine';
import { GameCanvas, GameInfo } from './game';
import {
  DeckManagement,
  DeckEditor,
  DrawAnimation,
  DeckDisplay,
  type Deck,
} from '../ui';
import { useGameLoop, useKeyboardControl } from '../../hooks';
import { GAME_CONFIG } from '../../config/game-config';
import type { GameState, Piece, CardData } from '../../types';

/**
 * 卡组存储接口（示例实现）
 */
interface DeckStorage {
  loadDecks(): Deck[];
  saveDeck(deck: Deck): void;
  deleteDeck(deckId: string): void;
}

/**
 * 本地存储实现
 */
const localStorageDeckStorage: DeckStorage = {
  loadDecks: () => {
    try {
      const data = localStorage.getItem('tetris-decks');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveDeck: (deck: Deck) => {
    try {
      const decks = localStorageDeckStorage.loadDecks();
      const index = decks.findIndex(d => d.id === deck.id);
      if (index >= 0) {
        decks[index] = deck;
      } else {
        decks.push(deck);
      }
      localStorage.setItem('tetris-decks', JSON.stringify(decks));
    } catch (error) {
      console.error('Failed to save deck:', error);
    }
  },
  deleteDeck: (deckId: string) => {
    try {
      const decks = localStorageDeckStorage.loadDecks();
      const filtered = decks.filter(d => d.id !== deckId);
      localStorage.setItem('tetris-decks', JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete deck:', error);
    }
  },
};

/**
 * 从卡牌获取对应的方块类型
 */
const getPieceTypeFromCard = (cardId: string): string => {
  return cardId; // 卡牌 ID 与方块类型对应
};

/**
 * 从卡组抽取方块
 */
const drawFromDeck = (deck: Deck): CardData => {
  if (deck.cards.length === 0) {
    // 如果卡组为空，返回随机基础方块
    const basicCards = GAME_CONFIG.CARDS.filter(c => c.type === 'basic');
    return basicCards[Math.floor(Math.random() * basicCards.length)];
  }
  
  const randomCardId = deck.cards[Math.floor(Math.random() * deck.cards.length)];
  const card = GAME_CONFIG.CARDS.find(c => c.id === randomCardId);
  
  if (!card) {
    // 如果找不到卡牌，返回 I 方块
    return GAME_CONFIG.CARDS.find(c => c.id === 'I')!;
  }
  
  return card;
};

interface DeckGameIntegrationProps {
  storage?: DeckStorage;
}

const DeckGameIntegration: React.FC<DeckGameIntegrationProps> = ({
  storage = localStorageDeckStorage,
}) => {
  // 游戏引擎状态
  const [gameEngine] = useState(() => new GameEngine());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  
  // 卡组系统状态
  const [decks, setDecks] = useState<Deck[]>(() => storage.loadDecks());
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(null);
  const [showDeckManagement, setShowDeckManagement] = useState(false);
  const [showDeckEditor, setShowDeckEditor] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  
  // 抽卡状态
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCard, setDrawnCard] = useState<CardData | null>(null);
  const [pendingPiece, setPendingPiece] = useState<Piece | null>(null);

  // 获取当前卡组
  const currentDeck = decks.find(d => d.id === currentDeckId) || null;
  const currentDeckName = currentDeck?.name || null;

  // 游戏循环
  useGameLoop({
    gameStarted,
    gameState,
    gameEngine,
    paused: gameState?.paused ?? false || isDrawing, // 抽卡时暂停游戏
    onGameStateChange: () => {
      setGameState(gameEngine.getGameState());
    },
  });

  // 键盘控制
  useKeyboardControl({
    gameStarted,
    gameState,
    gameEngine,
    onGameStateChange: setGameState,
  });

  // 开始游戏
  const startGame = useCallback(() => {
    gameEngine.init();
    const state = gameEngine.getGameState();
    
    // 如果有卡组，从卡组抽取第一个方块
    if (currentDeck) {
      const card = drawFromDeck(currentDeck);
      const pieceType = getPieceTypeFromCard(card.id);
      const piece = gameEngine.createPiece(pieceType);
      
      if (piece) {
        setPendingPiece(piece);
        setDrawnCard(card);
        setIsDrawing(true); // 显示抽卡动画
      } else {
        setGameState(state);
        setGameStarted(true);
      }
    } else {
      setGameState(state);
      setGameStarted(true);
    }
  }, [gameEngine, currentDeck]);

  // 抽卡动画完成
  const handleDrawComplete = useCallback(() => {
    setIsDrawing(false);
    
    if (pendingPiece && drawnCard) {
      // 设置抽取的方块
      gameEngine.setNextPiece(pendingPiece);
      setGameState(gameEngine.getGameState());
      setGameStarted(true);
      setPendingPiece(null);
      setDrawnCard(null);
    }
  }, [gameEngine, pendingPiece, drawnCard]);

  // 创建新卡组
  const handleCreateDeck = useCallback((name: string) => {
    const newDeck: Deck = {
      id: `deck_${Date.now()}`,
      name,
      cards: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const newDecks = [...decks, newDeck];
    setDecks(newDecks);
    storage.saveDeck(newDeck);
    setEditingDeck(newDeck);
    setShowDeckEditor(true);
  }, [decks, storage]);

  // 选择卡组
  const handleSelectDeck = useCallback((deckId: string) => {
    setCurrentDeckId(deckId);
  }, []);

  // 编辑卡组
  const handleEditDeck = useCallback((deckId: string) => {
    const deck = decks.find(d => d.id === deckId);
    if (deck) {
      setEditingDeck(deck);
      setShowDeckEditor(true);
    }
  }, [decks]);

  // 删除卡组
  const handleDeleteDeck = useCallback((deckId: string) => {
    const newDecks = decks.filter(d => d.id !== deckId);
    setDecks(newDecks);
    storage.deleteDeck(deckId);
    
    if (currentDeckId === deckId) {
      setCurrentDeckId(null);
    }
  }, [decks, currentDeckId, storage]);

  // 保存卡组
  const handleSaveDeck = useCallback((deck: Deck) => {
    const newDecks = decks.map(d => d.id === deck.id ? deck : d);
    setDecks(newDecks);
    storage.saveDeck(deck);
    setShowDeckEditor(false);
    setEditingDeck(null);
  }, [decks, storage]);

  // 取消编辑
  const handleCancelEdit = useCallback(() => {
    setShowDeckEditor(false);
    setEditingDeck(null);
  }, []);

  // 游戏内抽卡（例如使用特殊能力）
  const handleDrawInGame = useCallback(() => {
    if (!currentDeck || isDrawing) return;
    
    const card = drawFromDeck(currentDeck);
    const pieceType = getPieceTypeFromCard(card.id);
    const piece = gameEngine.createPiece(pieceType);
    
    if (piece) {
      setPendingPiece(piece);
      setDrawnCard(card);
      setIsDrawing(true);
    }
  }, [currentDeck, gameEngine, isDrawing]);

  return (
    <div className="deck-game-integration">
      {/* 游戏主界面 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--dark-bg)',
          fontFamily: 'Orbitron, monospace',
        }}
      >
        <h1
          style={{
            fontSize: '48px',
            color: 'var(--neon-cyan)',
            textShadow: '0 0 10px var(--neon-cyan), 0 0 20px var(--neon-cyan)',
            marginBottom: '30px',
            letterSpacing: '6px',
          }}
        >
          赛博方块 2077
        </h1>

        {!gameStarted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
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
              onClick={() => setShowDeckManagement(true)}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                background: 'rgba(255, 0, 255, 0.1)',
                border: '2px solid var(--neon-pink)',
                borderRadius: '8px',
                color: 'var(--neon-pink)',
                cursor: 'pointer',
                fontFamily: 'Orbitron, monospace',
                boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 0, 255, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(255, 0, 255, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 0, 255, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.3)';
              }}
            >
              管理卡组
            </button>
            
            {currentDeck && (
              <div style={{
                fontSize: '14px',
                color: 'var(--neon-green)',
                textShadow: '0 0 5px var(--neon-green)',
              }}>
                当前卡组：{currentDeck.name} ({currentDeck.cards.length} 张)
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
            <GameCanvas gameState={gameState} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <DeckDisplay
                currentDeckName={currentDeckName}
                nextPiece={gameState?.nextPiece || null}
                nextCard={null}
                onOpenDeckManagement={() => setShowDeckManagement(true)}
              />
              <GameInfo gameState={gameState} />
              
              {/* 游戏内抽卡按钮（示例） */}
              <button
                onClick={handleDrawInGame}
                disabled={isDrawing || !currentDeck}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  background: isDrawing || !currentDeck 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(0, 255, 255, 0.1)',
                  border: isDrawing || !currentDeck
                    ? '1px solid #444'
                    : '2px solid var(--neon-cyan)',
                  borderRadius: '6px',
                  color: isDrawing || !currentDeck ? '#666' : 'var(--neon-cyan)',
                  cursor: isDrawing || !currentDeck ? 'not-allowed' : 'pointer',
                  fontFamily: 'Orbitron, monospace',
                  transition: 'all 0.3s',
                }}
              >
                {isDrawing ? '抽取中...' : '从卡组抽取'}
              </button>
            </div>
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
          v2.1.0 - 卡组系统
        </div>
      </div>

      {/* 卡组管理界面 */}
      {showDeckManagement && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            zIndex: 1000,
          }}
        >
          <DeckManagement
            decks={decks}
            currentDeckId={currentDeckId}
            allCards={GAME_CONFIG.CARDS}
            onCreateDeck={handleCreateDeck}
            onSelectDeck={handleSelectDeck}
            onEditDeck={handleEditDeck}
            onDeleteDeck={handleDeleteDeck}
            onClose={() => setShowDeckManagement(false)}
          />
        </div>
      )}

      {/* 卡组编辑界面 */}
      {showDeckEditor && editingDeck && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            zIndex: 1000,
          }}
        >
          <DeckEditor
            deck={editingDeck}
            allCards={GAME_CONFIG.CARDS}
            onSave={handleSaveDeck}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      {/* 抽卡动画 */}
      {isDrawing && drawnCard && (
        <DrawAnimation
          card={drawnCard}
          isDrawing={isDrawing}
          onComplete={handleDrawComplete}
          duration={1500}
        />
      )}
    </div>
  );
};

export default DeckGameIntegration;

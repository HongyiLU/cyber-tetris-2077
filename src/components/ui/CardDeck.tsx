// ==================== 卡组管理界面组件 ====================

import React, { useState } from 'react';
import Card from './Card';
import type { CardData, DeckManager } from '../../types';

interface CardDeckProps {
  deckManager: DeckManager;
  onClose?: () => void;
}

const CardDeck: React.FC<CardDeckProps> = ({ deckManager, onClose }) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'deck'>('collection');
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [rarityFilter, setRarityFilter] = useState<string>('all');

  const collectedCards = deckManager.getCollectedCards();
  const uncollectedCards = deckManager.getUncollectedCards();
  const currentDeck = deckManager.getCurrentDeck();

  // 过滤卡牌
  const filterCards = (cards: CardData[]): CardData[] => {
    if (rarityFilter === 'all') return cards;
    return cards.filter(card => card.rarity === rarityFilter);
  };

  const handleAddToDeck = (cardId: string) => {
    deckManager.addToDeck(cardId);
    setSelectedCard(null);
  };

  const handleRemoveFromDeck = (cardId: string) => {
    deckManager.removeFromDeck(cardId);
  };

  const handleAutoFill = () => {
    deckManager.autoFillDeck();
  };

  const handleClearDeck = () => {
    deckManager.clearDeck();
  };

  const stats = deckManager.getDeckStats();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      zIndex: 1000,
      padding: '20px',
      overflow: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* 标题栏 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '2px solid #00ffff',
        }}>
          <h2 style={{
            fontSize: '28px',
            color: '#00ffff',
            textShadow: '0 0 10px #00ffff',
            margin: 0,
          }}>
            🎴 卡组管理
          </h2>
          
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '2px solid #ff0040',
                color: '#ff0040',
                padding: '8px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontFamily: 'Orbitron, monospace',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ff0040';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#ff0040';
              }}
            >
              关闭
            </button>
          )}
        </div>

        {/* 统计信息 */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          padding: '15px',
          background: 'rgba(0, 255, 255, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(0, 255, 255, 0.3)',
        }}>
          <div style={{ color: '#fff' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>已收集</div>
            <div style={{ fontSize: '24px', color: '#00ff80' }}>
              {stats.collectedCount} / {stats.totalCards}
            </div>
          </div>
          <div style={{ color: '#fff' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>卡组大小</div>
            <div style={{ fontSize: '24px', color: '#00ffff' }}>
              {stats.deckSize} / 10
            </div>
          </div>
          <div style={{ color: '#fff', marginLeft: 'auto' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>未收集</div>
            <div style={{ fontSize: '24px', color: '#ff66b2' }}>
              {stats.totalCollected - stats.collectedCount}
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
        }}>
          <button
            onClick={() => setActiveTab('collection')}
            style={{
              padding: '10px 25px',
              background: activeTab === 'collection' 
                ? 'rgba(0, 255, 255, 0.3)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: activeTab === 'collection' 
                ? '2px solid #00ffff' 
                : '1px solid #666',
              color: activeTab === 'collection' ? '#00ffff' : '#888',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'Orbitron, monospace',
              transition: 'all 0.3s',
            }}
          >
            📚 卡牌收藏
          </button>
          <button
            onClick={() => setActiveTab('deck')}
            style={{
              padding: '10px 25px',
              background: activeTab === 'deck' 
                ? 'rgba(0, 255, 255, 0.3)' 
                : 'rgba(255, 255, 255, 0.1)',
              border: activeTab === 'deck' 
                ? '2px solid #00ffff' 
                : '1px solid #666',
              color: activeTab === 'deck' ? '#00ffff' : '#888',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'Orbitron, monospace',
              transition: 'all 0.3s',
            }}
          >
            🎴 当前卡组 ({currentDeck.length}/10)
          </button>
        </div>

        {/* 稀有度过滤 */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}>
          {['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'].map(rarity => (
            <button
              key={rarity}
              onClick={() => setRarityFilter(rarity)}
              style={{
                padding: '6px 15px',
                background: rarityFilter === rarity 
                  ? 'rgba(0, 255, 255, 0.3)' 
                  : 'rgba(255, 255, 255, 0.05)',
                border: rarityFilter === rarity 
                  ? `2px solid ${rarity === 'all' ? '#00ffff' : 
                      rarity === 'common' ? '#888' :
                      rarity === 'uncommon' ? '#00cc66' :
                      rarity === 'rare' ? '#0099ff' :
                      rarity === 'epic' ? '#bf00ff' : '#ffd700'}`
                  : '1px solid #444',
                color: rarityFilter === rarity ? '#fff' : '#666',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                textTransform: 'uppercase',
                fontFamily: 'Orbitron, monospace',
                transition: 'all 0.3s',
              }}
            >
              {rarity === 'all' ? '全部' : rarity}
            </button>
          ))}
        </div>

        {/* 卡组操作按钮 */}
        {activeTab === 'deck' && (
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
          }}>
            <button
              onClick={handleAutoFill}
              style={{
                padding: '10px 20px',
                background: 'rgba(0, 255, 128, 0.2)',
                border: '2px solid #00ff80',
                color: '#00ff80',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'Orbitron, monospace',
              }}
            >
              自动填充
            </button>
            <button
              onClick={handleClearDeck}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 0, 64, 0.2)',
                border: '2px solid #ff0040',
                color: '#ff0040',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'Orbitron, monospace',
              }}
            >
              清空卡组
            </button>
          </div>
        )}

        {/* 卡牌网格 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '20px',
          padding: '20px',
        }}>
          {activeTab === 'collection' ? (
            <>
              {/* 已收集的卡牌 */}
              {filterCards(collectedCards).map(card => (
                <Card
                  key={card.id}
                  card={card}
                  collected={true}
                  onClick={() => setSelectedCard(card)}
                  selected={selectedCard?.id === card.id}
                />
              ))}
              
              {/* 未收集的卡牌 */}
              {filterCards(uncollectedCards).map(card => (
                <Card
                  key={card.id}
                  card={card}
                  collected={false}
                  small={false}
                />
              ))}
            </>
          ) : (
            /* 当前卡组 */
            currentDeck.length > 0 ? (
              currentDeck.map(cardId => {
                const card = deckManager.getAllCards().find(c => c.id === cardId);
                if (!card) return null;
                
                return (
                  <Card
                    key={cardId}
                    card={card}
                    collected={true}
                    onClick={() => handleRemoveFromDeck(cardId)}
                    selected={selectedCard?.id === cardId}
                  />
                );
              })
            ) : (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '60px',
                color: '#666',
                fontSize: '18px',
              }}>
                卡组为空，点击"自动填充"或从收藏中添加卡牌
              </div>
            )
          )}
        </div>

        {/* 卡牌详情弹窗 */}
        {selectedCard && activeTab === 'collection' && (
          <div
            onClick={() => setSelectedCard(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, rgba(20, 20, 40, 0.95), rgba(40, 40, 80, 0.95))',
                border: `3px solid ${
                  selectedCard.rarity === 'legendary' ? '#ffd700' :
                  selectedCard.rarity === 'epic' ? '#bf00ff' :
                  selectedCard.rarity === 'rare' ? '#0099ff' :
                  selectedCard.rarity === 'uncommon' ? '#00cc66' : '#888'
                }`,
                borderRadius: '12px',
                padding: '30px',
                maxWidth: '400px',
                boxShadow: `0 0 40px ${
                  selectedCard.rarity === 'legendary' ? 'rgba(255, 215, 0, 0.6)' :
                  selectedCard.rarity === 'epic' ? 'rgba(191, 0, 255, 0.6)' :
                  selectedCard.rarity === 'rare' ? 'rgba(0, 153, 255, 0.6)' :
                  selectedCard.rarity === 'uncommon' ? 'rgba(0, 204, 102, 0.6)' : 'rgba(136, 136, 136, 0.6)'
                }`,
              }}
            >
              <h3 style={{
                fontSize: '24px',
                color: '#fff',
                textAlign: 'center',
                marginBottom: '15px',
              }}>
                {selectedCard.name}
              </h3>
              
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <div style={{ fontSize: '60px', marginBottom: '10px' }}>
                  {selectedCard.id === 'I' ? '📏' :
                   selectedCard.id === 'O' ? '⬜' :
                   selectedCard.id === 'T' ? '⏲️' :
                   selectedCard.id === 'BOMB' ? '💣' :
                   selectedCard.id === 'STAR' ? '⭐' : '🎴'}
                </div>
                <div style={{ color: '#888', fontSize: '14px' }}>
                  {selectedCard.type.toUpperCase()} • {selectedCard.rarity.toUpperCase()}
                </div>
              </div>
              
              <p style={{
                color: '#aaa',
                lineHeight: '1.6',
                textAlign: 'center',
                marginBottom: '25px',
              }}>
                {selectedCard.desc}
              </p>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    handleAddToDeck(selectedCard.id);
                    setSelectedCard(null);
                  }}
                  disabled={currentDeck.length >= 10}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: currentDeck.length >= 10 
                      ? 'rgba(136, 136, 136, 0.3)' 
                      : 'rgba(0, 255, 128, 0.2)',
                    border: currentDeck.length >= 10 
                      ? '2px solid #666' 
                      : '2px solid #00ff80',
                    color: currentDeck.length >= 10 ? '#666' : '#00ff80',
                    borderRadius: '4px',
                    cursor: currentDeck.length >= 10 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontFamily: 'Orbitron, monospace',
                  }}
                >
                  {currentDeck.length >= 10 ? '卡组已满' : '添加到卡组'}
                </button>
                
                <button
                  onClick={() => setSelectedCard(null)}
                  style={{
                    padding: '12px 25px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid #666',
                    color: '#888',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: 'Orbitron, monospace',
                  }}
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardDeck;

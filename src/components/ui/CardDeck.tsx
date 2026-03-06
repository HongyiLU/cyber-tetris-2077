// ==================== 卡组管理界面组件 ====================

import React, { useState } from 'react';
import Card from './Card';
import type { CardData, DeckManager } from '../../types';
import './CardDeck.css';

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

  const getRarityClass = (rarity: string): string => {
    switch (rarity) {
      case 'legendary': return 'legendary';
      case 'epic': return 'epic';
      case 'rare': return 'rare';
      case 'uncommon': return 'uncommon';
      default: return 'common';
    }
  };

  const getCardIcon = (cardId: string): string => {
    switch (cardId) {
      case 'I': return '📏';
      case 'O': return '⬜';
      case 'T': return '⏲️';
      case 'BOMB': return '💣';
      case 'STAR': return '⭐';
      default: return '🎴';
    }
  };

  return (
    <div className="card-deck-container">
      <div className="card-deck-content">
        {/* 标题栏 */}
        <div className="card-deck-header">
          <h2 className="card-deck-title">🎴 卡组管理</h2>
          
          {onClose && (
            <button
              onClick={onClose}
              className="card-deck-close-btn"
            >
              关闭
            </button>
          )}
        </div>

        {/* 统计信息 */}
        <div className="card-deck-stats">
          <div className="card-deck-stat-item">
            <div className="card-deck-stat-label">已收集</div>
            <div className="card-deck-stat-value collected">
              {stats.collectedCount} / {stats.totalCards}
            </div>
          </div>
          <div className="card-deck-stat-item">
            <div className="card-deck-stat-label">卡组大小</div>
            <div className="card-deck-stat-value deck-size">
              {stats.deckSize} / 10
            </div>
          </div>
          <div className="card-deck-stat-item">
            <div className="card-deck-stat-label">未收集</div>
            <div className="card-deck-stat-value uncollected">
              {stats.totalCollected - stats.collectedCount}
            </div>
          </div>
        </div>

        {/* 标签页 */}
        <div className="card-deck-tabs">
          <button
            onClick={() => setActiveTab('collection')}
            className={`card-deck-tab-btn ${activeTab === 'collection' ? 'active' : ''}`}
          >
            📚 卡牌收藏
          </button>
          <button
            onClick={() => setActiveTab('deck')}
            className={`card-deck-tab-btn ${activeTab === 'deck' ? 'active' : ''}`}
          >
            🎴 当前卡组 ({currentDeck.length}/10)
          </button>
        </div>

        {/* 稀有度过滤 */}
        <div className="card-deck-rarity-filter">
          {['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'].map(rarity => (
            <button
              key={rarity}
              onClick={() => setRarityFilter(rarity)}
              className={`card-deck-rarity-btn ${rarityFilter === rarity ? 'active' : ''}`}
              data-rarity={rarity}
            >
              {rarity === 'all' ? '全部' : rarity}
            </button>
          ))}
        </div>

        {/* 卡组操作按钮 */}
        {activeTab === 'deck' && (
          <div className="card-deck-actions">
            <button
              onClick={handleAutoFill}
              className="card-deck-action-btn auto-fill"
            >
              自动填充
            </button>
            <button
              onClick={handleClearDeck}
              className="card-deck-action-btn clear"
            >
              清空卡组
            </button>
          </div>
        )}

        {/* 卡牌网格 */}
        <div className="card-deck-grid">
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
                    selected={selectedCard?.id === card.id}
                  />
                );
              })
            ) : (
              <div className="card-deck-empty-message">
                卡组为空，点击"自动填充"或从收藏中添加卡牌
              </div>
            )
          )}
        </div>

        {/* 卡牌详情弹窗 */}
        {selectedCard && activeTab === 'collection' && (
          <div
            onClick={() => setSelectedCard(null)}
            className="card-deck-modal-overlay"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`card-deck-modal-content ${getRarityClass(selectedCard.rarity)}`}
            >
              <h3 className="card-deck-modal-title">
                {selectedCard.name}
              </h3>
              
              <div className="card-deck-modal-icon">
                {getCardIcon(selectedCard.id)}
              </div>
              <div className="card-deck-modal-meta">
                {selectedCard.type.toUpperCase()} • {selectedCard.rarity.toUpperCase()}
              </div>
              
              <p className="card-deck-modal-desc">
                {selectedCard.desc}
              </p>
              
              <div className="card-deck-modal-actions">
                <button
                  onClick={() => {
                    handleAddToDeck(selectedCard.id);
                    setSelectedCard(null);
                  }}
                  disabled={currentDeck.length >= 10}
                  className={`card-deck-modal-btn add ${currentDeck.length >= 10 ? 'disabled' : ''}`}
                >
                  {currentDeck.length >= 10 ? '卡组已满' : '添加到卡组'}
                </button>
                
                <button
                  onClick={() => setSelectedCard(null)}
                  className="card-deck-modal-btn close"
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

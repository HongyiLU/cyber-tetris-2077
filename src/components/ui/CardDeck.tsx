// ==================== 卡组管理界面组件 ====================

import React, { useState, useEffect } from 'react';
import Card from './Card';
import type { CardData, Deck, DeckManager } from '../../types';
import './CardDeck.css';

interface CardDeckProps {
  deckManager: DeckManager;
  onClose?: () => void;
}

const CardDeck: React.FC<CardDeckProps> = ({ deckManager, onClose }) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'deck' | 'presets'>('deck');
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  // 加载卡组列表
  useEffect(() => {
    const loadDecks = () => {
      const allDecks = deckManager.listDecks();
      setDecks(allDecks);
      const active = deckManager.getActiveDeck();
      setActiveDeckId(active?.id || null);
    };
    loadDecks();
  }, [deckManager]);

  const collectedCards = deckManager.getCollectedCards();
  const uncollectedCards = deckManager.getUncollectedCards();
  const currentDeck = deckManager.getCurrentDeck();
  const activeDeck = deckManager.getActiveDeck();

  // 过滤卡牌
  const filterCards = (cards: CardData[]): CardData[] => {
    if (rarityFilter === 'all') return cards;
    return cards.filter(card => card.rarity === rarityFilter);
  };

  const handleAddToDeck = (cardId: string) => {
    deckManager.addToDeck(cardId);
    setSelectedCard(null);
    // 刷新卡组列表
    setDecks(deckManager.listDecks());
  };

  const handleRemoveFromDeck = (cardId: string) => {
    deckManager.removeFromDeck(cardId);
    setDecks(deckManager.listDecks());
  };

  const handleAutoFill = () => {
    deckManager.autoFillDeck();
    setDecks(deckManager.listDecks());
  };

  const handleClearDeck = () => {
    deckManager.clearDeck();
    setDecks(deckManager.listDecks());
  };

  // 设置激活卡组
  const handleSetActiveDeck = (deckId: string | null) => {
    try {
      deckManager.setActiveDeck(deckId);
      setActiveDeckId(deckId);
      setDecks(deckManager.listDecks());
    } catch (error) {
      console.error('设置激活卡组失败:', error);
    }
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

        {/* 当前激活状态提示 */}
        {activeDeck && (
          <div className="active-deck-banner">
            <span className="active-deck-label">✅ 当前使用：</span>
            <span className="active-deck-name">{activeDeck.name}</span>
            <span className="active-deck-count">({activeDeck.cards.length} 张)</span>
          </div>
        )}

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
            onClick={() => setActiveTab('presets')}
            className={`card-deck-tab-btn ${activeTab === 'presets' ? 'active' : ''}`}
          >
            📦 预设卡组
          </button>
          <button
            onClick={() => setActiveTab('deck')}
            className={`card-deck-tab-btn ${activeTab === 'deck' ? 'active' : ''}`}
          >
            🎴 我的卡组 ({decks.length})
          </button>
          <button
            onClick={() => setActiveTab('collection')}
            className={`card-deck-tab-btn ${activeTab === 'collection' ? 'active' : ''}`}
          >
            📚 卡牌收藏
          </button>
        </div>

        {/* 预设卡组标签页 */}
        {activeTab === 'presets' && (
          <div className="preset-decks-list">
            <h3 className="section-title">选择预设卡组</h3>
            {deckManager.getPresetDecks().map(preset => {
              const isActive = activeDeckId === preset.id;
              return (
                <div
                  key={preset.id}
                  className={`preset-deck-item ${isActive ? 'active' : ''}`}
                >
                  <div className="preset-deck-info">
                    <h4 className="preset-deck-name">{preset.name}</h4>
                    <p className="preset-deck-desc">{preset.description}</p>
                    <div className="preset-deck-cards">
                      包含：{preset.cards.join(' · ')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSetActiveDeck(preset.id)}
                    className={`preset-deck-select-btn ${isActive ? 'active' : ''}`}
                  >
                    {isActive ? '✓ 使用中' : '使用此卡组'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* 我的卡组标签页 */}
        {activeTab === 'deck' && (
          <>
            {/* 卡组操作按钮 */}
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

            {/* 卡组列表 */}
            <div className="decks-list">
              {decks.length > 0 ? (
                decks.map(deck => {
                  const isActive = activeDeckId === deck.id;
                  return (
                    <div
                      key={deck.id}
                      className={`deck-item ${isActive ? 'active' : ''}`}
                    >
                      <div className="deck-info">
                        <h4 className="deck-name">{deck.name}</h4>
                        <div className="deck-meta">
                          <span>{deck.cards.length} 张卡</span>
                          {isActive && <span className="active-badge">● 当前使用</span>}
                        </div>
                        <div className="deck-cards-preview">
                          {deck.cards.slice(0, 7).join(' · ')}
                          {deck.cards.length > 7 && ` ... (+${deck.cards.length - 7})`}
                        </div>
                      </div>
                      <div className="deck-actions">
                        <button
                          onClick={() => handleSetActiveDeck(deck.id)}
                          className={`deck-action-btn ${isActive ? 'active' : ''}`}
                        >
                          {isActive ? '✓ 使用中' : '使用'}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="card-deck-empty-message">
                  暂无卡组，请从预设卡组中选择或创建新卡组
                </div>
              )}
            </div>

            {/* 当前卡组（旧 API 兼容） */}
            <div className="current-deck-section">
              <h3 className="section-title">当前编辑卡组（旧版）</h3>
              <div className="card-deck-grid">
                {currentDeck.length > 0 ? (
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
                )}
              </div>
            </div>
          </>
        )}

        {/* 稀有度过滤（仅收藏标签页显示） */}
        {activeTab === 'collection' && (
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
        )}

        {/* 卡牌网格（收藏标签页） */}
        {activeTab === 'collection' && (
          <div className="card-deck-grid">
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
          </div>
        )}

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

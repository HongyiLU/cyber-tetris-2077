import React, { useState, useCallback } from 'react';
import BlockVisual from './BlockVisual';
import GAME_CONFIG from '../../config/game-config';

type BlockId = keyof typeof GAME_CONFIG.SHAPES;
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import './CardDeck.css';

export interface Card {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  count: number;
  maxCount: number;
}

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CardDeckProps {
  decks: Deck[];
  onDeckSelect?: (deck: Deck) => void;
  onDeckEdit?: (deck: Deck) => void;
  onDeckDelete?: (deckId: string) => void;
  onDeckUpdate?: (deck: Deck) => void;
  onCreateDeck?: () => void;
  editable?: boolean;
}

/**
 * 卡组列表组件 - 响应式布局优化
 * v1.9.15: 支持移动端、平板端、桌面端不同列数显示
 */
const CardDeck: React.FC<CardDeckProps> = ({
  decks,
  onDeckSelect,
  onDeckEdit,
  onDeckDelete,
  onDeckUpdate,
  onCreateDeck,
  editable = false,
}) => {
  const { columns, cardSize } = useResponsiveLayout();
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  // 处理卡组选择
  const handleDeckSelect = useCallback((deck: Deck) => {
    setSelectedDeck(deck);
    onDeckSelect?.(deck);
  }, [onDeckSelect]);

  // 处理卡组编辑
  const handleDeckEdit = useCallback((deck: Deck) => {
    setIsEditing(true);
    setEditingDeck({ ...deck, cards: deck.cards.map(card => ({ ...card })) }); // 深拷贝以便编辑
    onDeckEdit?.(deck);
  }, [onDeckEdit]);

  // 处理卡组删除
  const handleDeckDelete = useCallback((deckId: string) => {
    if (window.confirm('确定要删除这个卡组吗？')) {
      onDeckDelete?.(deckId);
    }
  }, [onDeckDelete]);

  // 处理增加卡牌数量 (P0-2 修复)
  const handleAddBlock = useCallback((cardIndex: number) => {
    if (!editingDeck) return;
    
    const updatedCards = editingDeck.cards.map((card, index) => {
      if (index === cardIndex && card.count < card.maxCount) {
        return { ...card, count: card.count + 1 };
      }
      return card;
    });
    
    const updatedDeck = { ...editingDeck, cards: updatedCards, updatedAt: new Date() };
    setEditingDeck(updatedDeck);
    onDeckUpdate?.(updatedDeck);
  }, [editingDeck, onDeckUpdate]);

  // 处理减少卡牌数量 (P0-2 修复)
  const handleRemoveBlock = useCallback((cardIndex: number) => {
    if (!editingDeck) return;
    
    const updatedCards = editingDeck.cards.map((card, index) => {
      if (index === cardIndex && card.count > 0) {
        return { ...card, count: card.count - 1 };
      }
      return card;
    });
    
    const updatedDeck = { ...editingDeck, cards: updatedCards, updatedAt: new Date() };
    setEditingDeck(updatedDeck);
    onDeckUpdate?.(updatedDeck);
  }, [editingDeck, onDeckUpdate]);

  // 处理保存编辑
  const handleSaveEdit = useCallback(() => {
    if (editingDeck) {
      onDeckUpdate?.(editingDeck);
    }
    setIsEditing(false);
    setEditingDeck(null);
  }, [editingDeck, onDeckUpdate]);

  // 处理取消编辑
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditingDeck(null);
  }, []);

  // 渲染卡组预览（显示方块形状）
  const renderDeckPreview = useCallback((deck: Deck, size: 'small' | 'medium' | 'large') => {
    const previewCards = deck.cards.slice(0, 6); // 只显示前 6 张
    return (
      <div className="deck-blocks-preview">
        {previewCards.map((card, index) => (
          <BlockVisual
            key={index}
            blockId={card.id}
            size={size}
            showLabel={false}
          />
        ))}
        {deck.cards.length > 6 && (
          <div className="deck-preview-more">+{deck.cards.length - 6}</div>
        )}
      </div>
    );
  }, []);

  // 渲染编辑弹窗
  const renderEditModal = useCallback(() => {
    if (!isEditing || !editingDeck) return null;

    return (
      <div className="deck-edit-modal-overlay" onClick={handleCancelEdit}>
        <div className="deck-edit-modal" onClick={(e) => e.stopPropagation()}>
          <div className="deck-edit-header">
            <h2>编辑卡组：{editingDeck.name}</h2>
            <button className="deck-edit-close" onClick={handleCancelEdit}>×</button>
          </div>
          <div className="deck-edit-content">
            <div className="deck-edit-blocks">
              {editingDeck.cards.map((card, index) => (
                <div key={index} className="deck-edit-card">
                  <BlockVisual
                    blockId={card.id}
                    size="medium"
                    showLabel={true}
                    isEditing={true}
                  />
                  <div className="deck-edit-card-info">
                    <span className="deck-edit-card-name">{card.name}</span>
                    <div className="deck-edit-card-controls">
                      <button
                        className="deck-edit-btn deck-edit-btn-remove"
                        onClick={() => handleRemoveBlock(index)}
                        disabled={card.count <= 0}
                      >
                        -
                      </button>
                      <span className="deck-edit-card-count">{card.count}/{card.maxCount}</span>
                      <button
                        className="deck-edit-btn deck-edit-btn-add"
                        onClick={() => handleAddBlock(index)}
                        disabled={card.count >= card.maxCount}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="deck-edit-footer">
            <button className="deck-edit-btn deck-edit-btn-cancel" onClick={handleCancelEdit}>
              取消
            </button>
            <button className="deck-edit-btn deck-edit-btn-save" onClick={handleSaveEdit}>
              保存
            </button>
          </div>
        </div>
      </div>
    );
  }, [isEditing, editingDeck, handleAddBlock, handleRemoveBlock, handleCancelEdit, handleSaveEdit]);

  return (
    <div className="card-deck-container">
      <div className="card-deck-header">
        <h2 className="card-deck-title">我的卡组</h2>
        {editable && (
          <button className="card-deck-create-btn" onClick={onCreateDeck}>
            + 新建卡组
          </button>
        )}
      </div>

      {/* 响应式卡组网格 */}
      <div
        className="card-deck-grid"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {decks.map((deck) => (
          <div
            key={deck.id}
            className={`card-deck-item ${selectedDeck?.id === deck.id ? 'selected' : ''}`}
            onClick={() => handleDeckSelect(deck)}
          >
            <div className="card-deck-item-header">
              <h3 className="card-deck-item-name">{deck.name}</h3>
              {editable && (
                <div className="card-deck-item-actions">
                  <button
                    className="card-deck-action-btn card-deck-action-edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeckEdit(deck);
                    }}
                    title="编辑"
                  >
                    ✏️
                  </button>
                  <button
                    className="card-deck-action-btn card-deck-action-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeckDelete(deck.id);
                    }}
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
            <div className="card-deck-item-preview">
              {renderDeckPreview(deck, cardSize)}
            </div>
            <div className="card-deck-item-footer">
              <span className="card-deck-item-count">{deck.cards.length} 张卡牌</span>
              <span className="card-deck-item-date">
                {new Date(deck.updatedAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
        ))}

        {decks.length === 0 && (
          <div className="card-deck-empty">
            <p>暂无卡组</p>
            {editable && (
              <button className="card-deck-create-empty-btn" onClick={onCreateDeck}>
                创建第一个卡组
              </button>
            )}
          </div>
        )}
      </div>

      {/* 编辑弹窗 */}
      {renderEditModal()}
    </div>
  );
};

export default CardDeck;

// ==================== 卡组管理界面组件 ====================
// v1.9.14 - 卡牌视觉优化
// v1.9.16 - 添加特殊效果方块卡牌

import React, { useState, useEffect } from 'react';
import Card from './Card';
import BlockVisual from './BlockVisual';
import type { CardData, Deck } from '../../types';
import { isDeckValidForUse, getDeckStatusText, DEFAULT_DECK_CONFIG } from '../../types/deck';
import type { DeckManager } from '../../engine/DeckManager';
import type { Card as CardType } from '../../types/card';
import { GAME_CONFIG } from '../../config/game-config';
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
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  
  // v1.9.5 新增：卡组编辑状态
  const [deckConfig, setDeckConfig] = useState<{ [pieceType: string]: number }>({});
  
  // v1.9.11 新增：弹窗编辑状态（移除编辑页签，改为弹窗）
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [editConfig, setEditConfig] = useState<{ [pieceType: string]: number }>({});
  const [editDeckName, setEditDeckName] = useState('');

  // 所有可用卡牌
  const allCards = deckManager.getAllCards();

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

  // v1.9.9 新增：判断卡组是否可用（使用类型定义中的 helper）
  const isDeckUsable = (deck: Deck): boolean => {
    return isDeckValidForUse(deck, DEFAULT_DECK_CONFIG.minDeckSize);
  };

  // v1.9.9 新增：获取卡组可用性提示
  const getDeckUsabilityMessage = (deck: Deck): string => {
    return getDeckStatusText(deck);
  };

  // v1.9.11 新增：打开编辑弹窗
  // v1.9.19 修复：确保加载的是当前卡组的数据
  const handleOpenEdit = (deckId: string) => {
    const deck = deckManager.getDeck(deckId);
    if (!deck) {
      console.error('卡组不存在:', deckId);
      alert('卡组不存在，请刷新页面后重试');
      return;
    }
    
    // v1.9.19 修复：从卡组数据加载配置，而不是全局配置
    const cardCounts: { [pieceType: string]: number } = {};
    deck.cards.forEach(card => {
      const cardId = typeof card === 'string' ? card : card.cardId;
      const count = typeof card === 'string' ? 1 : card.count;
      cardCounts[cardId] = count;
    });
    
    setEditConfig(cardCounts);
    setEditingDeckId(deckId);
    setEditDeckName(deck.name);
    setShowEditModal(true);
  };

  // v1.9.11 新增：保存编辑
  const handleSaveEdit = () => {
    if (!editingDeckId) return;
    
    try {
      // 保存配置
      deckManager.saveDeckConfig();
      setShowEditModal(false);
      setEditingDeckId(null);
      setDecks(deckManager.listDecks());
      // 刷新配置显示
      const config = deckManager.getDeckConfig();
      setDeckConfig(config);
    } catch (error) {
      console.error('保存编辑失败:', error);
      alert('保存失败');
    }
  };

  // v1.9.11 新增：取消编辑
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingDeckId(null);
    // 重置配置
    const config = deckManager.getDeckConfig();
    setEditConfig(config);
  };

  // v1.9.11 新增：修改配置（弹窗内）
  const handleEditSetCardCount = (pieceType: string, count: number) => {
    setEditConfig({ ...editConfig, [pieceType]: count });
  };

  // v1.9.11 新增：获取编辑卡组名称
  const getEditingDeckName = (): string => {
    if (!editingDeckId) return '';
    const deck = deckManager.getDeck(editingDeckId);
    return deck?.name || '';
  };

  // v1.9.5 新增：加载卡组配置
  useEffect(() => {
    const config = deckManager.getDeckConfig();
    setDeckConfig(config);
  }, [deckManager]);

  // 过滤卡牌
  const filterCards = (cards: CardData[]): CardData[] => {
    if (rarityFilter === 'all') return cards;
    return cards.filter(card => card.rarity === rarityFilter);
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

  // 创建新卡组
  const handleCreateDeck = () => {
    if (!newDeckName.trim()) {
      alert('请输入卡组名称');
      return;
    }

    try {
      deckManager.createDeck(newDeckName.trim(), [], newDeckDescription.trim());
      setShowNewDeckModal(false);
      setNewDeckName('');
      setNewDeckDescription('');
      setDecks(deckManager.listDecks());
    } catch (error) {
      console.error('创建卡组失败:', error);
      if (error instanceof Error) {
        alert(`创建失败：${error.message}`);
      }
    }
  };

  // 删除卡组
  // v1.9.10 优化：允许删除预设卡组，但最后一个卡组无法删除
  const handleDeleteDeck = (deckId: string) => {
    // 检查是否为最后一个卡组
    if (decks.length <= 1) {
      alert('无法删除最后一个卡组，请至少保留一个卡组');
      return;
    }
    
    const deck = decks.find(d => d.id === deckId);
    const isPreset = deck?.id?.startsWith('preset-');
    const remainingCount = decks.length - 1;
    
    // 确认删除（v1.9.10: 显示更多信息）
    const confirmMsg = isPreset 
      ? `确定要删除预设卡组"${deck?.name}"吗？\n\n删除后剩余 ${remainingCount} 个卡组`
      : `确定要删除卡组"${deck?.name}"吗？\n\n删除后剩余 ${remainingCount} 个卡组`;
    
    if (!confirm(confirmMsg)) return;
    
    try {
      deckManager.deleteDeck(deckId);
      setDecks(deckManager.listDecks());
      if (activeDeckId === deckId) {
        setActiveDeckId(null);
      }
    } catch (error) {
      console.error('删除卡组失败:', error);
      if (error instanceof Error) {
        alert(`删除失败：${error.message}`);
      }
    }
  };

  // 复制卡组
  const handleCopyDeck = (deckId: string) => {
    try {
      deckManager.copyDeck(deckId);
      setDecks(deckManager.listDecks());
    } catch (error) {
      console.error('复制卡组失败:', error);
      if (error instanceof Error) {
        alert(`复制失败：${error.message}`);
      }
    }
  };

  // 导出卡组
  const handleExportDeck = (deckId: string) => {
    try {
      const jsonString = deckManager.exportDeck(deckId);
      const deck = deckManager.getDeck(deckId);
      const filename = `${deck?.name || 'deck'}.json`;
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出卡组失败:', error);
      if (error instanceof Error) {
        alert(`导出失败：${error.message}`);
      }
    }
  };

  // 导入卡组
  const handleImportDeck = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;
          deckManager.importDeck(jsonString, true);
          setDecks(deckManager.listDecks());
          alert('卡组导入成功！');
        } catch (error) {
          console.error('导入卡组失败:', error);
          if (error instanceof Error) {
            alert(`导入失败：${error.message}`);
          }
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // 从收藏添加卡牌到卡组（用于编辑模式）
  const handleAddCardToDeck = (cardId: string, targetDeckId: string) => {
    try {
      const deck = deckManager.getDeck(targetDeckId);
      if (!deck) return;

      // v1.9.19 修复：检查 DeckCard[] 类型
      const cardExists = deck.cards.some(c => 
        typeof c === 'string' ? c === cardId : c.cardId === cardId
      );
      
      if (cardExists) {
        alert('该卡牌已在卡组中');
        return;
      }

      if (deck.cards.length >= 7) {
        alert('卡组已满（7/7）');
        return;
      }

      deckManager.updateDeck(targetDeckId, {
        // v1.9.19 修复：添加 DeckCard 对象
        cards: [...deck.cards, { cardId, count: 1 }],
      });
      setDecks(deckManager.listDecks());
    } catch (error) {
      console.error('添加卡牌失败:', error);
      if (error instanceof Error) {
        alert(`添加失败：${error.message}`);
      }
    }
  };

  // 从卡组移除卡牌
  const handleRemoveCardFromDeck = (cardId: string, deckId: string) => {
    try {
      const deck = deckManager.getDeck(deckId);
      if (!deck) return;

      deckManager.updateDeck(deckId, {
        // v1.9.19 修复：过滤 DeckCard[] 类型
        cards: deck.cards.filter(c => 
          typeof c === 'string' ? c !== cardId : c.cardId !== cardId
        ),
      });
      setDecks(deckManager.listDecks());
    } catch (error) {
      console.error('移除卡牌失败:', error);
    }
  };

  // v1.9.5 新增：卡组编辑功能（弹窗内使用临时配置）
  // v1.9.15 修复 P0-2: 注释说明 - 临时配置仅在保存时同步到 DeckManager，避免频繁更新导致性能问题
  const handleSetCardCount = (pieceType: string, count: number) => {
    setEditConfig({ ...editConfig, [pieceType]: count });
  };

  const handleSaveDeckConfig = () => {
    try {
      // v1.9.11: 保存弹窗中的编辑配置
      // 首先应用临时配置到 DeckManager
      Object.entries(editConfig).forEach(([pieceType, count]) => {
        deckManager.setCardCount(pieceType, count);
      });
      
      const result = deckManager.saveDeckConfig();
      if (result.success) {
        alert('卡组配置已保存！');
        setShowEditModal(false);
        setEditingDeckId(null);
        // 刷新显示
        const config = deckManager.getDeckConfig();
        setDeckConfig(config);
        setDecks(deckManager.listDecks());
      } else {
        alert(`保存失败：${result.error}`);
      }
    } catch (error) {
      console.error('保存卡组配置失败:', error);
      if (error instanceof Error) {
        alert(`保存失败：${error.message}`);
      }
    }
  };

  const handleResetDeckConfig = () => {
    if (confirm('确定要重置为默认卡组配置吗？')) {
      deckManager.resetDeckConfig();
      const config = deckManager.getDeckConfig();
      setEditConfig(config);
    }
  };

  const getTotalCardCount = () => {
    return Object.values(deckConfig).reduce((sum, count) => sum + count, 0);
  };

  const getRarityClass = (rarity: string): string => {
    switch (rarity) {
      case 'legendary': return 'legendary';
      case 'epic': return 'epic';
      case 'rare': return 'rare';
      case 'uncommon': return 'uncommon';
      default: return 'common';
    }
  };

  const getCardColor = (cardId: string): string => {
    const colors: { [key: string]: string } = {
      'I': '#00ffff',
      'O': '#ffff00',
      'T': '#da70d6',
      'S': '#00ff00',
      'Z': '#ff4444',
      'L': '#ff8c00',
      'J': '#4169e1',
    };
    return colors[cardId] || '#888';
  };

  // v1.9.13: 获取方块图标（保留用于预设卡组预览文本）
  const getCardIcon = (cardId: string): string => {
    switch (cardId) {
      case 'I': return '📏';
      case 'O': return '⬜';
      case 'T': return '⏲️';
      case 'S': return '📐';
      case 'Z': return '⚡';
      case 'L': return '🔨';
      case 'J': return '🎯';
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
        {activeDeckId && (
          <div className="active-deck-banner">
            <span className="active-deck-label">✅ 当前使用：</span>
            <span className="active-deck-name">
              {decks.find(d => d.id === activeDeckId)?.name || '未知卡组'}
            </span>
          </div>
        )}

        {/* 统计信息 */}
        <div className="card-deck-stats">
          <div className="card-deck-stat-item">
            <div className="card-deck-stat-label">卡组数量</div>
            <div className="card-deck-stat-value collected">
              {decks.length}
            </div>
          </div>
          <div className="card-deck-stat-item">
            <div className="card-deck-stat-label">卡牌总数</div>
            <div className="card-deck-stat-value deck-size">
              {allCards.length}
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

        {/* v1.9.11: 全局卡组编辑按钮（移除编辑页签，改为弹窗） */}
        {activeTab === 'deck' && activeDeckId && (
          <div className="card-deck-edit-action">
            <button
              onClick={() => handleOpenEdit(activeDeckId)}
              className="card-deck-edit-global-btn"
            >
              ✏️ 编辑当前卡组配置
            </button>
          </div>
        )}

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
                      包含：{preset.cards.map(id => getCardIcon(id)).join(' · ')}
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
                onClick={() => setShowNewDeckModal(true)}
                className="card-deck-action-btn new-deck"
              >
                ➕ 新建卡组
              </button>
              <button
                onClick={handleImportDeck}
                className="card-deck-action-btn import"
              >
                📥 导入卡组
              </button>
            </div>

            {/* 卡组列表 */}
            <div className="decks-list">
              {decks.length > 0 ? (
                decks.map(deck => {
                  const isActive = activeDeckId === deck.id;
                  const usable = isDeckUsable(deck);
                  
                  return (
                    <div
                      key={deck.id}
                      className={`deck-item ${isActive ? 'active' : ''} ${!usable ? 'unusable' : ''}`}
                      title={!usable ? getDeckUsabilityMessage(deck) : undefined}
                    >
                      <div className="deck-info">
                        <h4 className="deck-name">{deck.name}</h4>
                        {deck.description && (
                          <p className="deck-description">{deck.description}</p>
                        )}
                        <div className="deck-meta">
                          <span>{deck.cards.length}/7 张卡</span>
                          {isActive && <span className="active-badge">● 当前使用</span>}
                          {!usable && <span className="unusable-badge">⚠️ 不可用</span>}
                        </div>
                        <div className="deck-cards-preview">
                          {deck.cards.length > 0 ? (
                            deck.cards.slice(0, 7).map(card => {
                              const cardId = typeof card === 'string' ? card : card.cardId;
                              return getCardIcon(cardId);
                            }).join(' · ')
                          ) : (
                            <span className="empty-deck">空卡组</span>
                          )}
                        </div>
                        {!usable && (
                          <div className="deck-usability-hint">
                            {getDeckUsabilityMessage(deck)}
                          </div>
                        )}
                      </div>
                      <div className="deck-actions">
                        {/* v1.9.11: 添加编辑按钮 */}
                        <button
                          onClick={() => handleOpenEdit(deck.id)}
                          className="deck-action-btn edit"
                          title="编辑卡组"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleSetActiveDeck(deck.id)}
                          className={`deck-action-btn use ${isActive ? 'active' : ''} ${!usable ? 'disabled' : ''}`}
                          title={isActive ? '当前使用' : (!usable ? '卡组卡牌数量不足，无法使用' : '使用此卡组')}
                          disabled={!usable}
                        >
                          {isActive ? '✓' : '使用'}
                        </button>
                        <button
                          onClick={() => handleCopyDeck(deck.id)}
                          className="deck-action-btn copy"
                          title="复制卡组"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => handleExportDeck(deck.id)}
                          className="deck-action-btn export"
                          title="导出卡组"
                        >
                          📤
                        </button>
                        {/* v1.9.10: 所有卡组都显示删除按钮（包括预设） */}
                        <button
                          onClick={() => handleDeleteDeck(deck.id)}
                          className="deck-action-btn delete"
                          title="删除卡组"
                          disabled={decks.length <= 1}  // 最后一个卡组禁用
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="card-deck-empty-message">
                  暂无卡组，点击"新建卡组"创建你的第一个卡组
                </div>
              )}
            </div>
          </>
        )}

        {/* v1.9.11 新增：编辑卡组弹窗 */}
        {showEditModal && editingDeckId && (
          <div
            onClick={handleCancelEdit}
            className="card-deck-modal-overlay"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="card-deck-modal-content common"
            >
              <h3 className="card-deck-modal-title">编辑卡组配置：{getEditingDeckName()}</h3>
              
              {/* 卡组总数显示 */}
              <div className="deck-edit-stats">
                <div className="deck-edit-stat-item">
                  <span className="stat-label">当前卡组总数：</span>
                  <span className={`stat-value ${Object.values(editConfig).reduce((sum, count) => sum + count, 0) < 3 ? 'warning' : 'success'}`}>
                    {Object.values(editConfig).reduce((sum, count) => sum + count, 0)} 张
                  </span>
                </div>
                {Object.values(editConfig).reduce((sum, count) => sum + count, 0) < 3 && (
                  <div className="deck-edit-warning">
                    ⚠️ 卡组至少需要 3 张卡牌才能使用
                  </div>
                )}
              </div>

              {/* 方块配置列表 - v1.9.15 使用卡牌样式 */}
              <div className="deck-edit-list">
                <div className="deck-edit-cards-grid">
                  {allCards.map(card => {
                    const count = editConfig[card.id] ?? 1;
                    // v1.9.15 修复 P0-1: 添加类型转换验证
                    const cardData: import('../../types/card').Card = {
                      pieceType: card.id,
                      name: card.name,
                      description: card.desc || '',
                      rarity: card.rarity,
                      color: card.color || GAME_CONFIG.COLORS[card.id as keyof typeof GAME_CONFIG.COLORS] || '#ffffff',
                    };
                    
                    return (
                      <div key={card.id} className="deck-edit-card-item">
                        <Card
                          card={cardData}
                          size="small"
                          clickable={true}
                          onClick={() => handleEditSetCardCount(card.id, count > 0 ? 0 : 1)}
                        />
                        
                        <div className="deck-edit-card-controls">
                          <button
                            onClick={() => handleEditSetCardCount(card.id, count - 1)}
                            className="deck-edit-btn minus"
                            disabled={count <= 0}
                            aria-label="减少数量"
                          >
                            −
                          </button>
                          
                          <div className="deck-edit-count">
                            <span className={`count-value ${count === 0 ? 'zero' : ''}`}>
                              {count}
                            </span>
                            {count > 0 && (
                              <span className="count-label">张</span>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleEditSetCardCount(card.id, count + 1)}
                            className="deck-edit-btn plus"
                            disabled={count >= 3}
                            aria-label="增加数量"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="deck-edit-actions">
                <button
                  onClick={handleCancelEdit}
                  className="deck-edit-action-btn close"
                >
                  取消
                </button>
                
                <button
                  onClick={handleSaveDeckConfig}
                  className="deck-edit-action-btn save"
                >
                  💾 保存
                </button>
              </div>
            </div>
          </div>
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
            {filterCards(allCards).map(card => {
              // v1.9.14: 将 CardData 转换为 Card 类型
              // v1.9.15-fix2: 添加默认值防止 undefined
              const cardData: CardType = {
                pieceType: card.id,
                name: card.name,
                description: card.desc || '',
                rarity: card.rarity,
                color: card.color || GAME_CONFIG.COLORS[card.id as keyof typeof GAME_CONFIG.COLORS] || '#ffffff',
              };
              return (
                <Card
                  key={card.id}
                  card={cardData}
                  size="medium"
                  clickable={true}
                  onClick={() => setSelectedCard(card)}
                />
              );
            })}
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
              
              {/* 添加到卡组选择 */}
              <div className="card-deck-modal-actions">
                <div className="add-to-deck-section">
                  <label className="add-to-deck-label">添加到卡组：</label>
                  <select
                    className="add-to-deck-select"
                    onChange={(e) => {
                      const deckId = e.target.value;
                      if (deckId) {
                        handleAddCardToDeck(selectedCard.id, deckId);
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>选择卡组</option>
                    {decks.filter(d => d.cards.length < 7).map(deck => (
                      <option key={deck.id} value={deck.id}>
                        {deck.name} ({deck.cards.length}/7)
                      </option>
                    ))}
                  </select>
                </div>
                
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

        {/* 新建卡组弹窗 */}
        {showNewDeckModal && (
          <div
            onClick={() => setShowNewDeckModal(false)}
            className="card-deck-modal-overlay"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="card-deck-modal-content common"
            >
              <h3 className="card-deck-modal-title">新建卡组</h3>
              
              <div className="form-group">
                <label htmlFor="deck-name">卡组名称 *</label>
                <input
                  id="deck-name"
                  type="text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="输入卡组名称"
                  maxLength={30}
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="deck-description">卡组描述（可选）</label>
                <textarea
                  id="deck-description"
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  placeholder="描述卡组的策略或用途"
                  maxLength={200}
                  rows={3}
                />
              </div>
              
              <div className="card-deck-modal-actions">
                <button
                  onClick={handleCreateDeck}
                  className="card-deck-modal-btn add"
                  disabled={!newDeckName.trim()}
                >
                  创建
                </button>
                
                <button
                  onClick={() => {
                    setShowNewDeckModal(false);
                    setNewDeckName('');
                    setNewDeckDescription('');
                  }}
                  className="card-deck-modal-btn close"
                >
                  取消
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

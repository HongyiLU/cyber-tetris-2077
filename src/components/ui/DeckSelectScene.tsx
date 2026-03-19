// ==================== DeckSelectScene - 卡组选择场景 ====================
// v2.0.0 Day 8 - 深度集成

import React, { useState, useEffect } from 'react';
import type { Deck } from '../../types/deck';
import type { DeckManager } from '../../engine/DeckManager';
import Card from './Card';
import './DeckSelectScene.css';

interface DeckSelectSceneProps {
  /** 卡组管理器 */
  deckManager: DeckManager;
  /** 选择卡组后的回调 */
  onSelect: (deckId: string, enemyId: string) => void;
  /** 返回按钮回调 */
  onBack: () => void;
  /** 初始选中的敌人 ID */
  initialEnemyId?: string;
}

interface EnemyOption {
  id: string;
  name: string;
  emoji: string;
  hp: number;
  description: string;
  rarity: string;
}

const ENEMY_OPTIONS: EnemyOption[] = [
  {
    id: 'slime',
    name: '史莱姆',
    emoji: '🦠',
    hp: 20,
    description: '最基础的敌人，行动缓慢',
    rarity: 'common',
  },
  {
    id: 'goblin',
    name: '哥布林',
    emoji: '👺',
    hp: 35,
    description: '敏捷但脆弱的敌人',
    rarity: 'common',
  },
  {
    id: 'skeleton',
    name: '骷髅战士',
    emoji: '💀',
    hp: 50,
    description: '均衡型敌人',
    rarity: 'uncommon',
  },
  {
    id: 'demon',
    name: '恶魔',
    emoji: '😈',
    hp: 80,
    description: '强大的 Boss 级敌人',
    rarity: 'legendary',
  },
];

export const DeckSelectScene: React.FC<DeckSelectSceneProps> = ({
  deckManager,
  onSelect,
  onBack,
  initialEnemyId = 'slime',
}) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [selectedEnemyId, setSelectedEnemyId] = useState<string>(initialEnemyId);
  const [showDeckPreview, setShowDeckPreview] = useState(false);

  // 加载卡组列表
  useEffect(() => {
    const loadDecks = () => {
      const allDecks = deckManager.listDecks();
      setDecks(allDecks);
      // 如果有激活的卡组，默认选中
      const activeDeck = deckManager.getActiveDeck();
      if (activeDeck) {
        setSelectedDeckId(activeDeck.id);
      }
    };
    loadDecks();
  }, [deckManager]);

  // 获取选中卡组的详细信息
  const getSelectedDeck = (): Deck | null => {
    if (!selectedDeckId) return null;
    return deckManager.getDeck(selectedDeckId) || null;
  };

  // 获取选中敌人的信息
  const getSelectedEnemy = (): EnemyOption | null => {
    return ENEMY_OPTIONS.find(e => e.id === selectedEnemyId) || null;
  };

  // 检查是否可以开始战斗
  const canStartBattle = (): boolean => {
    return selectedDeckId !== null && selectedEnemyId !== null;
  };

  // 处理开始战斗
  const handleStartBattle = () => {
    if (canStartBattle() && selectedDeckId) {
      onSelect(selectedDeckId, selectedEnemyId);
    }
  };

  // 获取稀有度样式
  const getRarityClass = (rarity: string): string => {
    return `rarity-${rarity}`;
  };

  // 获取稀有度颜色
  const getRarityColor = (rarity: string): string => {
    const colors: Record<string, string> = {
      common: '#9e9e9e',
      uncommon: '#4caf50',
      rare: '#2196f3',
      epic: '#9c27b0',
      legendary: '#ff9800',
    };
    return colors[rarity] || colors.common;
  };

  const selectedDeck = getSelectedDeck();
  const selectedEnemy = getSelectedEnemy();

  return (
    <div className="deck-select-scene">
      {/* 背景遮罩 */}
      <div className="scene-backdrop" />
      
      {/* 主内容区 */}
      <div className="scene-content">
        {/* 标题栏 */}
        <div className="scene-header">
          <button className="back-btn" onClick={onBack}>
            ← 返回
          </button>
          <h1 className="scene-title">🃏 选择卡组与敌人</h1>
          <div className="spacer" />
        </div>

        {/* 选择区域 */}
        <div className="selection-area">
          {/* 左侧：卡组选择 */}
          <div className="deck-section">
            <h2 className="section-title">选择你的卡组</h2>
            
            <div className="deck-list">
              {decks.length === 0 ? (
                <div className="no-decks">
                  <span className="no-decks-icon">📭</span>
                  <p>暂无卡组</p>
                  <p className="no-decks-hint">请先在卡组管理中创建卡组</p>
                </div>
              ) : (
                decks.map(deck => (
                  <div
                    key={deck.id}
                    className={`deck-option ${selectedDeckId === deck.id ? 'selected' : ''}`}
                    onClick={() => setSelectedDeckId(deck.id)}
                  >
                    <div className="deck-icon">
                      {deck.id.startsWith('preset-') ? '📦' : '🎴'}
                    </div>
                    <div className="deck-info">
                      <span className="deck-name">{deck.name}</span>
                      <span className="deck-card-count">
                        {deck.cards.length} 张卡牌
                      </span>
                    </div>
                    {selectedDeckId === deck.id && (
                      <span className="selected-check">✓</span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* 卡组预览按钮 */}
            {selectedDeck && (
              <button
                className="preview-btn"
                onClick={() => setShowDeckPreview(!showDeckPreview)}
              >
                {showDeckPreview ? '隐藏' : '预览'}卡组详情
              </button>
            )}

            {/* 卡组预览 */}
            {showDeckPreview && selectedDeck && (
              <div className="deck-preview">
                <h3 className="preview-title">{selectedDeck.name}</h3>
                <p className="preview-desc">{selectedDeck.description}</p>
                <div className="preview-cards">
                  {selectedDeck.cards.slice(0, 10).map((card, index) => {
                    const cardData = typeof card === 'string' 
                      ? { id: card, name: card, type: 'basic', rarity: 'common', color: '#888' }
                      : { id: card.cardId, name: card.cardId, type: 'basic', rarity: 'common', color: '#888' };
                    return (
                      <div key={`${cardData.id}-${index}`} className="preview-card">
                        <Card card={cardData} />
                      </div>
                    );
                  })}
                  {selectedDeck.cards.length > 10 && (
                    <div className="preview-more">
                      +{selectedDeck.cards.length - 10} 更多
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 中间：VS 分隔 */}
          <div className="vs-divider">
            <div className="vs-line" />
            <span className="vs-text">VS</span>
            <div className="vs-line" />
          </div>

          {/* 右侧：敌人选择 */}
          <div className="enemy-section">
            <h2 className="section-title">选择敌人</h2>
            
            <div className="enemy-list">
              {ENEMY_OPTIONS.map(enemy => (
                <div
                  key={enemy.id}
                  className={`enemy-option ${selectedEnemyId === enemy.id ? 'selected' : ''}`}
                  onClick={() => setSelectedEnemyId(enemy.id)}
                >
                  <span className="enemy-emoji">{enemy.emoji}</span>
                  <div className="enemy-info">
                    <span className="enemy-name" style={{ color: getRarityColor(enemy.rarity) }}>
                      {enemy.name}
                    </span>
                    <span className="enemy-hp">❤️ {enemy.hp}</span>
                  </div>
                  {selectedEnemyId === enemy.id && (
                    <span className="selected-check">✓</span>
                  )}
                </div>
              ))}
            </div>

            {/* 敌人详情 */}
            {selectedEnemy && (
              <div className="enemy-preview">
                <div className="enemy-preview-header">
                  <span className="enemy-preview-emoji">{selectedEnemy.emoji}</span>
                  <span className="enemy-preview-name">{selectedEnemy.name}</span>
                  <span 
                    className="enemy-preview-rarity"
                    style={{ color: getRarityColor(selectedEnemy.rarity) }}
                  >
                    {selectedEnemy.rarity.toUpperCase()}
                  </span>
                </div>
                <p className="enemy-preview-desc">{selectedEnemy.description}</p>
                <div className="enemy-preview-stats">
                  <div className="stat">
                    <span className="stat-icon">❤️</span>
                    <span className="stat-label">HP</span>
                    <span className="stat-value">{selectedEnemy.hp}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部：开始战斗按钮 */}
        <div className="scene-footer">
          {!canStartBattle() && (
            <p className="warning-text">
              {selectedDeckId ? '请选择敌人' : '请选择卡组'}
            </p>
          )}
          <button
            className={`start-battle-btn ${canStartBattle() ? 'ready' : 'disabled'}`}
            onClick={handleStartBattle}
            disabled={!canStartBattle()}
          >
            ⚔️ 开始战斗
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeckSelectScene;

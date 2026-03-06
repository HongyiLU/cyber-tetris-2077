import React, { useState, useEffect } from 'react';
import './DeckUI.css';

interface Deck {
  id: string;
  name: string;
  blocks: string[];
  createdAt: Date;
  lastModified: Date;
}

interface DeckManagementProps {
  decks: Deck[];
  selectedDeckId?: string;
  onSelectDeck: (deckId: string) => void;
  onCreateDeck: (name: string) => void;
  onEditDeck: (deckId: string) => void;
  onDeleteDeck: (deckId: string) => void;
}

/**
 * 卡组管理界面组件
 * 功能：
 * - 卡组列表展示
 * - 创建/选择/编辑/删除卡组
 * - 当前选中状态标识
 */
export const DeckManagement: React.FC<DeckManagementProps> = ({
  decks,
  selectedDeckId,
  onSelectDeck,
  onCreateDeck,
  onEditDeck,
  onDeleteDeck,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');

  const handleCreateDeck = () => {
    if (newDeckName.trim()) {
      onCreateDeck(newDeckName.trim());
      setNewDeckName('');
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateDeck();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewDeckName('');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, deckId: string) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个卡组吗？此操作不可恢复。')) {
      onDeleteDeck(deckId);
    }
  };

  const handleEditClick = (e: React.MouseEvent, deckId: string) => {
    e.stopPropagation();
    onEditDeck(deckId);
  };

  return (
    <div className="deck-container">
      <div className="deck-management">
        {/* 头部标题 */}
        <header className="deck-header">
          <h1 className="deck-title">⚡ 卡组管理系统 ⚡</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
            管理你的方块卡组，打造专属策略
          </p>
        </header>

        {/* 创建新卡组按钮 */}
        {!isCreating ? (
          <button
            className="btn btn-primary"
            onClick={() => setIsCreating(true)}
            style={{ marginBottom: '30px', display: 'block', margin: '0 auto 30px' }}
          >
            + 创建新卡组
          </button>
        ) : (
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '30px',
            justifyContent: 'center'
          }}>
            <input
              type="text"
              className="deck-name-input"
              placeholder="输入卡组名称..."
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
              style={{ width: '300px' }}
            />
            <button className="btn btn-primary" onClick={handleCreateDeck}>
              确认
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setIsCreating(false);
                setNewDeckName('');
              }}
            >
              取消
            </button>
          </div>
        )}

        {/* 卡组列表 */}
        <div className="deck-list">
          {decks.length === 0 ? (
            <div style={{ 
              gridColumn: '1 / -1', 
              textAlign: 'center', 
              padding: '60px 20px',
              color: 'var(--text-secondary)'
            }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
                暂无卡组
              </p>
              <p>点击上方按钮创建你的第一个卡组</p>
            </div>
          ) : (
            decks.map((deck) => (
              <div
                key={deck.id}
                className={`deck-card ${selectedDeckId === deck.id ? 'selected' : ''}`}
                onClick={() => onSelectDeck(deck.id)}
              >
                <h3 className="deck-card-name">{deck.name}</h3>
                <div className="deck-card-info">
                  <p>方块数量：{deck.blocks.length}</p>
                  <p>最后修改：{new Date(deck.lastModified).toLocaleDateString('zh-CN')}</p>
                </div>
                <div className="deck-card-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={(e) => handleEditClick(e, deck.id)}
                    style={{ flex: 1 }}
                  >
                    编辑
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={(e) => handleDeleteClick(e, deck.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 统计信息 */}
        {decks.length > 0 && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '40px',
            padding: '20px',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            border: '2px solid var(--neon-purple)'
          }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
              📊 卡组统计
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px' }}>
              <div>
                <p style={{ fontSize: '2rem', color: 'var(--neon-blue)', margin: 0 }}>
                  {decks.length}
                </p>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>总卡组数</p>
              </div>
              <div>
                <p style={{ fontSize: '2rem', color: 'var(--neon-green)', margin: 0 }}>
                  {decks.reduce((sum, deck) => sum + deck.blocks.length, 0)}
                </p>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>总方块数</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckManagement;

import React, { useState, useMemo } from 'react';
import './DeckUI.css';

interface Block {
  id: string;
  name: string;
  shape: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  description?: string;
}

interface Deck {
  id: string;
  name: string;
  blocks: string[]; // block IDs
}

interface DeckEditorProps {
  deck: Deck;
  allBlocks: Block[];
  onSave: (deckId: string, name: string, blockIds: string[]) => void;
  onCancel: () => void;
}

type RarityFilter = 'all' | 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

/**
 * 卡组编辑界面组件
 * 功能：
 * - 卡组名称输入
 * - 可用方块池（带过滤）
 * - 已选方块列表
 * - 添加/移除方块
 */
export const DeckEditor: React.FC<DeckEditorProps> = ({
  deck,
  allBlocks,
  onSave,
  onCancel,
}) => {
  const [deckName, setDeckName] = useState(deck.name);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([...deck.blocks]);
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all');

  // 过滤后的可用方块
  const filteredBlocks = useMemo(() => {
    if (rarityFilter === 'all') {
      return allBlocks;
    }
    return allBlocks.filter(block => block.rarity === rarityFilter);
  }, [allBlocks, rarityFilter]);

  // 已选方块
  const selectedBlocks = useMemo(() => {
    return allBlocks.filter(block => selectedBlockIds.includes(block.id));
  }, [allBlocks, selectedBlockIds]);

  // 添加方块到卡组
  const handleAddBlock = (blockId: string) => {
    if (!selectedBlockIds.includes(blockId)) {
      setSelectedBlockIds([...selectedBlockIds, blockId]);
    }
  };

  // 从卡组移除方块
  const handleRemoveBlock = (blockId: string) => {
    setSelectedBlockIds(selectedBlockIds.filter(id => id !== blockId));
  };

  // 保存卡组
  const handleSave = () => {
    if (deckName.trim()) {
      onSave(deck.id, deckName.trim(), selectedBlockIds);
    }
  };

  // 获取稀有度显示文本
  const getRarityLabel = (rarity: string): string => {
    const labels: Record<string, string> = {
      common: '普通',
      rare: '稀有',
      epic: '史诗',
      legendary: '传说',
      mythic: '神话',
    };
    return labels[rarity] || rarity;
  };

  // 稀有度过滤按钮
  const rarityFilters: { key: RarityFilter; label: string; color: string }[] = [
    { key: 'all', label: '全部', color: 'var(--text-secondary)' },
    { key: 'common', label: '普通', color: 'var(--rarity-common)' },
    { key: 'rare', label: '稀有', color: 'var(--rarity-rare)' },
    { key: 'epic', label: '史诗', color: 'var(--rarity-epic)' },
    { key: 'legendary', label: '传说', color: 'var(--rarity-legendary)' },
    { key: 'mythic', label: '神话', color: 'var(--rarity-mythic)' },
  ];

  return (
    <div className="deck-container">
      <div className="deck-editor">
        {/* 编辑器头部 */}
        <div className="editor-header">
          <h2 style={{ color: 'var(--neon-purple)', margin: 0 }}>
            ✏️ 编辑卡组
          </h2>
          <input
            type="text"
            className="deck-name-input"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="卡组名称"
          />
        </div>

        {/* 编辑器内容 - 左右两栏 */}
        <div className="editor-content">
          {/* 左侧：可用方块池 */}
          <div className="block-pool">
            <h3 className="pool-title">📦 可用方块池</h3>
            
            {/* 稀有度过滤器 */}
            <div className="block-filter">
              {rarityFilters.map((filter) => (
                <button
                  key={filter.key}
                  className={`filter-btn ${rarityFilter === filter.key ? 'active' : ''}`}
                  onClick={() => setRarityFilter(filter.key)}
                  style={{
                    borderColor: rarityFilter === filter.key ? filter.color : 'var(--text-dim)',
                    color: rarityFilter === filter.key ? filter.color : 'var(--text-secondary)',
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* 方块列表 */}
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {filteredBlocks.length === 0 ? (
                <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
                  暂无方块
                </p>
              ) : (
                filteredBlocks.map((block) => {
                  const isSelected = selectedBlockIds.includes(block.id);
                  return (
                    <div
                      key={block.id}
                      className={`block-item ${block.rarity} ${isSelected ? 'selected' : ''}`}
                      style={{
                        opacity: isSelected ? 0.5 : 1,
                        cursor: isSelected ? 'default' : 'pointer',
                      }}
                      onClick={() => !isSelected && handleAddBlock(block.id)}
                    >
                      <div className="block-info">
                        <div className="block-shape">{block.shape}</div>
                        <div className="block-details">
                          <span className="block-name">{block.name}</span>
                          <span className="block-rarity">{getRarityLabel(block.rarity)}</span>
                        </div>
                      </div>
                      {!isSelected && (
                        <button
                          className="add-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddBlock(block.id);
                          }}
                        >
                          +
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 右侧：已选方块 */}
          <div className="selected-blocks">
            <h3 className="pool-title">
              ✅ 已选方块 ({selectedBlockIds.length})
            </h3>

            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {selectedBlocks.length === 0 ? (
                <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
                  尚未选择任何方块
                </p>
              ) : (
                selectedBlocks.map((block) => (
                  <div
                    key={block.id}
                    className={`block-item ${block.rarity}`}
                  >
                    <div className="block-info">
                      <div className="block-shape">{block.shape}</div>
                      <div className="block-details">
                        <span className="block-name">{block.name}</span>
                        <span className="block-rarity">{getRarityLabel(block.rarity)}</span>
                      </div>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveBlock(block.id)}
                    >
                      −
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '15px',
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '2px solid var(--neon-purple)',
        }}>
          <button className="btn btn-secondary" onClick={onCancel}>
            取消
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={!deckName.trim() || selectedBlockIds.length === 0}
            style={{
              opacity: (!deckName.trim() || selectedBlockIds.length === 0) ? 0.5 : 1,
              cursor: (!deckName.trim() || selectedBlockIds.length === 0) ? 'not-allowed' : 'pointer',
            }}
          >
            💾 保存卡组
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeckEditor;

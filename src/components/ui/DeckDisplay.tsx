import React from 'react';
import './DeckUI.css';

interface Block {
  id: string;
  name: string;
  shape: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

interface Deck {
  id: string;
  name: string;
  blocks: string[];
}

interface DeckDisplayProps {
  currentDeck?: Deck;
  nextBlock?: Block;
  currentBlock?: Block;
  score?: number;
  level?: number;
  isVisible?: boolean;
}

/**
 * 游戏内 UI 集成组件
 * 功能：
 * - 当前卡组名称显示
 * - 下一块预览
 * - 稀有度标识
 */
export const DeckDisplay: React.FC<DeckDisplayProps> = ({
  currentDeck,
  nextBlock,
  currentBlock,
  score,
  level,
  isVisible = true,
}) => {
  // 获取稀有度颜色
  const getRarityColor = (rarity: string): string => {
    const colors: Record<string, string> = {
      common: 'var(--rarity-common)',
      rare: 'var(--rarity-rare)',
      epic: 'var(--rarity-epic)',
      legendary: 'var(--rarity-legendary)',
      mythic: 'var(--rarity-mythic)',
    };
    return colors[rarity] || 'var(--text-primary)';
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

  if (!isVisible) {
    return null;
  }

  return (
    <div className="deck-display">
      {/* 卡组信息 */}
      {currentDeck && (
        <div className="deck-display-header">
          <span className="deck-display-name">
            🎴 {currentDeck.name}
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            {currentDeck.blocks.length} 块
          </span>
        </div>
      )}

      {/* 当前方块（如果游戏中） */}
      {currentBlock && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '5px' }}>
            当前方块
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '10px',
            background: 'var(--bg-dark)',
            borderRadius: '8px',
            border: `2px solid ${getRarityColor(currentBlock.rarity)}`,
          }}>
            <span style={{ 
              fontSize: '2rem',
              color: getRarityColor(currentBlock.rarity),
              textShadow: `0 0 10px ${getRarityColor(currentBlock.rarity)}`,
            }}>
              {currentBlock.shape}
            </span>
            <div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                {currentBlock.name}
              </div>
              <span
                className="rarity-indicator"
                style={{ backgroundColor: getRarityColor(currentBlock.rarity) }}
              >
                {getRarityLabel(currentBlock.rarity)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 下一块预览 */}
      {nextBlock && (
        <div className="next-block-preview">
          <span className="next-block-label">下一块</span>
          <div
            className="next-block-shape"
            style={{
              color: getRarityColor(nextBlock.rarity),
              textShadow: `0 0 10px ${getRarityColor(nextBlock.rarity)}`,
            }}
          >
            {nextBlock.shape}
          </div>
          <span
            className="rarity-indicator"
            style={{ 
              backgroundColor: getRarityColor(nextBlock.rarity),
              fontSize: '0.65rem',
              padding: '2px 8px',
            }}
          >
            {getRarityLabel(nextBlock.rarity)}
          </span>
        </div>
      )}

      {/* 游戏统计 */}
      {(score !== undefined || level !== undefined) && (
        <div style={{
          marginTop: '15px',
          paddingTop: '15px',
          borderTop: '1px solid var(--text-dim)',
        }}>
          {score !== undefined && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                分数
              </span>
              <span style={{ 
                color: 'var(--neon-green)', 
                fontWeight: 'bold',
                textShadow: '0 0 10px var(--neon-green)',
              }}>
                {score.toLocaleString()}
              </span>
            </div>
          )}
          
          {level !== undefined && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                等级
              </span>
              <span style={{ 
                color: 'var(--neon-yellow)', 
                fontWeight: 'bold',
                textShadow: '0 0 10px var(--neon-yellow)',
              }}>
                Lv.{level}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 卡组方块快速预览 */}
      {currentDeck && currentDeck.blocks.length > 0 && (
        <div style={{
          marginTop: '15px',
          paddingTop: '15px',
          borderTop: '1px solid var(--text-dim)',
        }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '8px' }}>
            卡组方块
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            maxHeight: '100px',
            overflowY: 'auto',
          }}>
            {currentDeck.blocks.slice(0, 12).map((blockId, index) => (
              <div
                key={blockId}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifySelf: 'center',
                  background: 'var(--bg-dark)',
                  borderRadius: '6px',
                  border: '1px solid var(--text-dim)',
                  fontSize: '1.2rem',
                }}
                title={`方块 ${index + 1}`}
              >
                ?
              </div>
            ))}
            {currentDeck.blocks.length > 12 && (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-dark)',
                  borderRadius: '6px',
                  border: '1px solid var(--neon-blue)',
                  color: 'var(--neon-blue)',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                }}
              >
                +{currentDeck.blocks.length - 12}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckDisplay;

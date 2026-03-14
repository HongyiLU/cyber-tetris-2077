import React from 'react';
import { GAME_CONFIG, BlockId } from '../../config/game';
import './BlockVisual.css';

export interface BlockVisualProps {
  blockId: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showName?: boolean;
  className?: string;
  style?: React.CSSProperties;
  isEditing?: boolean;
}

/**
 * 方块形状显示组件
 * 用于在卡组编辑器中显示方块的实际形状
 */
const BlockVisual: React.FC<BlockVisualProps> = ({
  blockId,
  size = 'medium',
  showLabel = true,
  showName = false,
  className = '',
  style,
  isEditing = false,
}) => {
  const shape = GAME_CONFIG.SHAPES[blockId as BlockId] || [];
  const color = GAME_CONFIG.COLORS[blockId as BlockId] || '#888';
  const name = GAME_CONFIG.BLOCK_NAMES[blockId as BlockId] || blockId;

  // 计算紧凑形状（移除空行和空列）
  const compactShape = shape.map((row) => row.filter((cell) => cell !== 0));

  if (!shape || shape.length === 0) {
    return (
      <div className={`block-visual block-visual--${size} ${className}`} style={style}>
        <div className="block-visual-error">Invalid Block</div>
      </div>
    );
  }

  return (
    <div
      className={`block-visual block-visual--${size} ${isEditing ? 'block-visual--editing' : ''} ${className}`}
      style={style}
    >
      <div className="block-visual-grid" style={{ gridTemplateColumns: `repeat(${shape[0].length}, 1fr)` }}>
        {shape.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`block-visual-cell ${cell ? 'filled' : 'empty'}`}
              style={cell ? { backgroundColor: color } : {}}
            />
          ))
        )}
      </div>
      {showLabel && (
        <div className="block-visual-label">{blockId}</div>
      )}
      {showName && (
        <div className="block-visual-name">{name}</div>
      )}
    </div>
  );
};

export default BlockVisual;

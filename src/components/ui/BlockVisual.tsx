// ==================== 方块形状可视化组件 ====================

import React from 'react';
import { GAME_CONFIG } from '../../config/game-config';
import './BlockVisual.css';

interface BlockVisualProps {
  /** 方块类型 (I, O, T, S, Z, L, J) */
  pieceType: string;
  /** 方块大小（像素） */
  size?: number;
  /** 是否显示边框 */
  showBorder?: boolean;
  /** 是否显示阴影 */
  showShadow?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 方块形状可视化组件
 * 使用实际的方块形状代替简单的图标显示
 */
const BlockVisual: React.FC<BlockVisualProps> = ({
  pieceType,
  size = 24,
  showBorder = true,
  showShadow = true,
  className = '',
}) => {
  // 获取方块形状和颜色
  const shape = GAME_CONFIG.SHAPES[pieceType as keyof typeof GAME_CONFIG.SHAPES];
  const color = GAME_CONFIG.COLORS[pieceType as keyof typeof GAME_CONFIG.COLORS];

  if (!shape || !color) {
    // 未知方块类型，显示占位符
    return (
      <div
        className={`block-visual block-visual-unknown ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="block-unknown-icon">?</span>
      </div>
    );
  }

  // 计算网格大小
  const gridSize = shape.length;
  const cellSize = size / gridSize;

  // 渲染方块网格
  return (
    <div
      className={`block-visual ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <div
        className="block-grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
        }}
      >
        {shape.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`block-cell ${cell ? 'block-cell-filled' : 'block-cell-empty'}`}
              style={
                cell
                  ? {
                      backgroundColor: color,
                      width: cellSize,
                      height: cellSize,
                      borderColor: showBorder ? adjustColor(color, -20) : 'transparent',
                      boxShadow: showShadow
                        ? `inset 2px 2px 4px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.3)`
                        : 'none',
                    }
                  : {
                      width: cellSize,
                      height: cellSize,
                    }
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

/**
 * 调整颜色亮度
 * @param color 十六进制颜色
 * @param amount 调整量（-255 到 255）
 * @returns 调整后的颜色
 */
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default BlockVisual;

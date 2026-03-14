// ==================== 方块形状可视化组件 ====================
// v1.9.13 代码审查修复：添加 useMemo 缓存、aria 标签、开发环境警告

import React, { useMemo } from 'react';
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
 * 
 * v1.9.13 改进：
 * - 使用 useMemo 缓存形状计算
 * - 添加 aria 标签提升可访问性
 * - 添加开发环境警告
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

  // v1.9.13 改进：开发环境警告
  if (!shape || !color) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`BlockVisual: 未知的方块类型 "${pieceType}"`);
    }
    // 未知方块类型，显示占位符
    return (
      <div
        className={`block-visual block-visual-unknown ${className}`}
        style={{ width: size, height: size }}
        role="img"
        aria-label="未知方块"
      >
        <span className="block-unknown-icon">?</span>
      </div>
    );
  }

  // v1.9.13 改进：使用 useMemo 缓存网格大小计算
  const { gridSize, cellSize } = useMemo(() => {
    const gridSize = shape.length;
    const cellSize = size / gridSize;
    return { gridSize, cellSize };
  }, [shape, size]);

  // v1.9.13 改进：使用 useMemo 缓存网格渲染
  const gridCells = useMemo(() => {
    return shape.map((row, rowIndex) =>
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
    );
  }, [shape, cellSize, color, showBorder, showShadow]);

  // 渲染方块网格
  return (
    <div
      className={`block-visual ${className}`}
      style={{
        width: size,
        height: size,
      }}
      role="img"
      aria-label={`${pieceType} 方块形状`}
    >
      <div
        className="block-grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
        }}
      >
        {gridCells}
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

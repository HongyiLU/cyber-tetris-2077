import { jsx as _jsx } from "react/jsx-runtime";
// ==================== 方块形状可视化组件 ====================
// v1.9.13 代码审查修复：添加 useMemo 缓存、aria 标签、开发环境警告
import { useMemo } from 'react';
import { GAME_CONFIG } from '../../config/game-config';
import './BlockVisual.css';
/**
 * 方块形状可视化组件
 * 使用实际的方块形状代替简单的图标显示
 *
 * v1.9.13 改进：
 * - 使用 useMemo 缓存形状计算
 * - 添加 aria 标签提升可访问性
 * - 添加开发环境警告
 */
const BlockVisual = ({ pieceType, size = 24, showBorder = true, showShadow = true, className = '', }) => {
    // 获取方块形状和颜色
    const shape = GAME_CONFIG.SHAPES[pieceType];
    const color = GAME_CONFIG.COLORS[pieceType];
    // v1.9.13 改进：开发环境警告
    if (!shape || !color) {
        if (process.env.NODE_ENV === 'development') {
            console.warn(`BlockVisual: 未知的方块类型 "${pieceType}"`);
        }
        // 未知方块类型，显示占位符
        return (_jsx("div", { className: `block-visual block-visual-unknown ${className}`, style: { width: size, height: size }, role: "img", "aria-label": "\u672A\u77E5\u65B9\u5757", children: _jsx("span", { className: "block-unknown-icon", children: "?" }) }));
    }
    // v1.9.13 改进：使用 useMemo 缓存网格大小计算
    const { gridSize, cellSize } = useMemo(() => {
        const gridSize = shape.length;
        const cellSize = size / gridSize;
        return { gridSize, cellSize };
    }, [shape, size]);
    // v1.9.13 改进：使用 useMemo 缓存网格渲染
    const gridCells = useMemo(() => {
        return shape.map((row, rowIndex) => row.map((cell, colIndex) => (_jsx("div", { className: `block-cell ${cell ? 'block-cell-filled' : 'block-cell-empty'}`, style: cell
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
                } }, `${rowIndex}-${colIndex}`))));
    }, [shape, cellSize, color, showBorder, showShadow]);
    // 渲染方块网格
    return (_jsx("div", { className: `block-visual ${className}`, style: {
            width: size,
            height: size,
        }, role: "img", "aria-label": `${pieceType} 方块形状`, children: _jsx("div", { className: "block-grid", style: {
                gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
            }, children: gridCells }) }));
};
/**
 * 调整颜色亮度
 * @param color 十六进制颜色
 * @param amount 调整量（-255 到 255）
 * @returns 调整后的颜色
 */
function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
export default BlockVisual;

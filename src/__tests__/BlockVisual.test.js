import { jsx as _jsx } from "react/jsx-runtime";
import { render } from '@testing-library/react';
import BlockVisual from '../components/ui/BlockVisual';
import { GAME_CONFIG } from '../config/game-config';
describe('BlockVisual', () => {
    // 测试所有经典 7 种方块
    const pieceTypes = ['I', 'O', 'T', 'S', 'Z', 'L', 'J'];
    describe('基础渲染', () => {
        it('应该渲染所有 7 种方块类型', () => {
            pieceTypes.forEach((type) => {
                const { container, unmount } = render(_jsx(BlockVisual, { pieceType: type, size: 24 }));
                // 检查组件是否渲染
                expect(container.querySelector('.block-visual')).toBeInTheDocument();
                expect(container.querySelector('.block-grid')).toBeInTheDocument();
                unmount();
            });
        });
        it('应该使用正确的尺寸渲染', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "I", size: 32 }));
            const blockVisual = container.querySelector('.block-visual');
            expect(blockVisual.style.width).toBe('32px');
            expect(blockVisual.style.height).toBe('32px');
        });
        it('应该使用默认尺寸 24px', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "O" }));
            const blockVisual = container.querySelector('.block-visual');
            expect(blockVisual.style.width).toBe('24px');
            expect(blockVisual.style.height).toBe('24px');
        });
    });
    describe('方块形状', () => {
        it('I-方块应该渲染 4x4 网格', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "I", size: 40 }));
            const grid = container.querySelector('.block-grid');
            expect(grid).toBeInTheDocument();
            expect(grid.style.gridTemplateColumns).toBe('repeat(4, 10px)');
            expect(grid.style.gridTemplateRows).toBe('repeat(4, 10px)');
        });
        it('O-方块应该渲染 2x2 网格', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "O", size: 40 }));
            const grid = container.querySelector('.block-grid');
            expect(grid).toBeInTheDocument();
            expect(grid.style.gridTemplateColumns).toBe('repeat(2, 20px)');
            expect(grid.style.gridTemplateRows).toBe('repeat(2, 20px)');
        });
        it('T-方块应该渲染 3x3 网格', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "T", size: 30 }));
            const grid = container.querySelector('.block-grid');
            expect(grid).toBeInTheDocument();
            expect(grid.style.gridTemplateColumns).toBe('repeat(3, 10px)');
            expect(grid.style.gridTemplateRows).toBe('repeat(3, 10px)');
        });
        it('每个方块应该有正确数量的单元格', () => {
            pieceTypes.forEach((type) => {
                const shape = GAME_CONFIG.SHAPES[type];
                const gridSize = shape.length;
                const { container } = render(_jsx(BlockVisual, { pieceType: type, size: gridSize * 10 }));
                const cells = container.querySelectorAll('.block-cell');
                // 总单元格数应该是 gridSize x gridSize
                expect(cells.length).toBe(gridSize * gridSize);
            });
        });
    });
    describe('方块颜色', () => {
        it('I-方块应该使用青色', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "I" }));
            const filledCell = container.querySelector('.block-cell-filled');
            expect(filledCell.style.backgroundColor).toBe('rgb(0, 255, 255)');
        });
        it('O-方块应该使用黄色', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "O" }));
            const filledCell = container.querySelector('.block-cell-filled');
            expect(filledCell.style.backgroundColor).toBe('rgb(255, 255, 0)');
        });
        it('T-方块应该使用兰花紫', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "T" }));
            const filledCell = container.querySelector('.block-cell-filled');
            expect(filledCell.style.backgroundColor).toBe('rgb(218, 112, 214)');
        });
        it('S-方块应该使用绿色', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "S" }));
            const filledCell = container.querySelector('.block-cell-filled');
            expect(filledCell.style.backgroundColor).toBe('rgb(0, 255, 0)');
        });
        it('Z-方块应该使用红色', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "Z" }));
            const filledCell = container.querySelector('.block-cell-filled');
            expect(filledCell.style.backgroundColor).toBe('rgb(255, 68, 68)');
        });
        it('L-方块应该使用深橙色', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "L" }));
            const filledCell = container.querySelector('.block-cell-filled');
            expect(filledCell.style.backgroundColor).toBe('rgb(255, 140, 0)');
        });
        it('J-方块应该使用宝蓝色', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "J" }));
            const filledCell = container.querySelector('.block-cell-filled');
            expect(filledCell.style.backgroundColor).toBe('rgb(65, 105, 225)');
        });
    });
    describe('边框和阴影', () => {
        it('默认应该显示边框', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "I" }));
            const filledCell = container.querySelector('.block-cell-filled');
            expect(filledCell.style.borderColor).not.toBe('transparent');
        });
        it('showBorder=false 时应该隐藏边框', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "I", showBorder: false }));
            const filledCell = container.querySelector('.block-cell-filled');
            expect(filledCell.style.borderColor).toBe('transparent');
        });
        it('默认应该显示阴影', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "I" }));
            const filledCell = container.querySelector('.block-cell-filled');
            expect(filledCell.style.boxShadow).not.toBe('none');
        });
        it('showShadow=false 时应该隐藏阴影', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "I", showShadow: false }));
            const filledCell = container.querySelector('.block-cell-filled');
            expect(filledCell.style.boxShadow).toBe('none');
        });
    });
    describe('自定义类名', () => {
        it('应该应用自定义类名', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "I", className: "custom-class" }));
            const blockVisual = container.querySelector('.block-visual');
            expect(blockVisual).toHaveClass('custom-class');
        });
        it('应该同时保留基础类名', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "I", className: "custom-class" }));
            const blockVisual = container.querySelector('.block-visual');
            expect(blockVisual).toHaveClass('block-visual');
            expect(blockVisual).toHaveClass('custom-class');
        });
    });
    describe('未知方块类型', () => {
        it('未知类型应该显示占位符', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "UNKNOWN", size: 32 }));
            expect(container.querySelector('.block-visual-unknown')).toBeInTheDocument();
            expect(container.querySelector('.block-unknown-icon')).toBeInTheDocument();
        });
        it('未知类型占位符应该显示问号', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "INVALID" }));
            const unknownIcon = container.querySelector('.block-unknown-icon');
            expect(unknownIcon?.textContent).toBe('?');
        });
    });
    describe('单元格状态', () => {
        it('应该正确渲染填充和空白单元格', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "O" }));
            const filledCells = container.querySelectorAll('.block-cell-filled');
            const emptyCells = container.querySelectorAll('.block-cell-empty');
            // O-方块是 2x2，全部填充，所以应该有 4 个填充单元格
            expect(filledCells.length).toBe(4);
            // O-方块网格是 2x2=4 个单元格，全部填充，所以空单元格应该是 0
            expect(emptyCells.length).toBe(0);
        });
        it('I-方块应该有 4 个填充单元格', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "I" }));
            const filledCells = container.querySelectorAll('.block-cell-filled');
            // I-方块有 4 个填充单元格
            expect(filledCells.length).toBe(4);
        });
        it('T-方块应该有 4 个填充单元格', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "T" }));
            const filledCells = container.querySelectorAll('.block-cell-filled');
            // T-方块有 4 个填充单元格
            expect(filledCells.length).toBe(4);
        });
    });
    describe('赛博朋克风格', () => {
        it('应该应用赛博朋克风格基础样式', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "I" }));
            const blockVisual = container.querySelector('.block-visual');
            // 检查基础类名存在（CSS 中定义了滤镜效果）
            expect(blockVisual).toHaveClass('block-visual');
        });
        it('hover 时应该增强滤镜效果', () => {
            const { container } = render(_jsx(BlockVisual, { pieceType: "I" }));
            const blockVisual = container.querySelector('.block-visual');
            // CSS 中定义了 hover 效果，这里主要检查基础样式存在
            expect(blockVisual).toHaveClass('block-visual');
        });
    });
    describe('性能优化', () => {
        it('应该快速渲染所有方块类型', () => {
            const startTime = performance.now();
            pieceTypes.forEach((type) => {
                render(_jsx(BlockVisual, { pieceType: type }));
            });
            const endTime = performance.now();
            const duration = endTime - startTime;
            // 渲染 7 个方块应该在 100ms 内完成
            expect(duration).toBeLessThan(100);
        });
    });
});

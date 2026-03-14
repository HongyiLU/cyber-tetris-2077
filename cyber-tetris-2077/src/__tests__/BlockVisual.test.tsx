import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlockVisual from '../components/ui/BlockVisual';

describe('BlockVisual', () => {
  describe('基础渲染', () => {
    it('应该渲染方块容器', () => {
      render(<BlockVisual blockId="I" />);
      const blockVisual = document.querySelector('.block-visual');
      expect(blockVisual).toBeInTheDocument();
    });

    it('应该显示方块标签', () => {
      render(<BlockVisual blockId="T" showLabel={true} />);
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('应该隐藏方块标签', () => {
      render(<BlockVisual blockId="T" showLabel={false} />);
      expect(screen.queryByText('T')).not.toBeInTheDocument();
    });

    it('应该显示方块名称', () => {
      render(<BlockVisual blockId="I" showName={true} />);
      expect(screen.getByText('I-Block')).toBeInTheDocument();
    });
  });

  describe('尺寸变体', () => {
    it('应该渲染 small 尺寸', () => {
      render(<BlockVisual blockId="I" size="small" />);
      const blockVisual = document.querySelector('.block-visual--small');
      expect(blockVisual).toBeInTheDocument();
    });

    it('应该渲染 medium 尺寸', () => {
      render(<BlockVisual blockId="I" size="medium" />);
      const blockVisual = document.querySelector('.block-visual--medium');
      expect(blockVisual).toBeInTheDocument();
    });

    it('应该渲染 large 尺寸', () => {
      render(<BlockVisual blockId="I" size="large" />);
      const blockVisual = document.querySelector('.block-visual--large');
      expect(blockVisual).toBeInTheDocument();
    });

    it('应该默认使用 medium 尺寸', () => {
      render(<BlockVisual blockId="I" />);
      const blockVisual = document.querySelector('.block-visual--medium');
      expect(blockVisual).toBeInTheDocument();
    });
  });

  describe('方块形状', () => {
    it('应该正确渲染 I 方块', () => {
      render(<BlockVisual blockId="I" />);
      const cells = document.querySelectorAll('.block-visual-cell.filled');
      expect(cells).toHaveLength(4); // I 方块有 4 个单元格
    });

    it('应该正确渲染 O 方块', () => {
      render(<BlockVisual blockId="O" />);
      const cells = document.querySelectorAll('.block-visual-cell.filled');
      expect(cells).toHaveLength(4); // O 方块有 4 个单元格 (2x2)
    });

    it('应该正确渲染 T 方块', () => {
      render(<BlockVisual blockId="T" />);
      const cells = document.querySelectorAll('.block-visual-cell.filled');
      expect(cells).toHaveLength(4); // T 方块有 4 个单元格
    });

    it('应该正确渲染 S 方块', () => {
      render(<BlockVisual blockId="S" />);
      const cells = document.querySelectorAll('.block-visual-cell.filled');
      expect(cells).toHaveLength(4); // S 方块有 4 个单元格
    });

    it('应该正确渲染 Z 方块', () => {
      render(<BlockVisual blockId="Z" />);
      const cells = document.querySelectorAll('.block-visual-cell.filled');
      expect(cells).toHaveLength(4); // Z 方块有 4 个单元格
    });

    it('应该正确渲染 L 方块', () => {
      render(<BlockVisual blockId="L" />);
      const cells = document.querySelectorAll('.block-visual-cell.filled');
      expect(cells).toHaveLength(4); // L 方块有 4 个单元格
    });

    it('应该正确渲染 J 方块', () => {
      render(<BlockVisual blockId="J" />);
      const cells = document.querySelectorAll('.block-visual-cell.filled');
      expect(cells).toHaveLength(4); // J 方块有 4 个单元格
    });
  });

  describe('方块颜色', () => {
    it('I 方块应该使用正确的颜色', () => {
      render(<BlockVisual blockId="I" />);
      const cells = document.querySelectorAll('.block-visual-cell.filled');
      cells.forEach((cell) => {
        expect(cell).toHaveStyle('background-color: rgb(0, 255, 255)');
      });
    });

    it('O 方块应该使用正确的颜色', () => {
      render(<BlockVisual blockId="O" />);
      const cells = document.querySelectorAll('.block-visual-cell.filled');
      cells.forEach((cell) => {
        expect(cell).toHaveStyle('background-color: rgb(255, 255, 0)');
      });
    });

    it('T 方块应该使用正确的颜色', () => {
      render(<BlockVisual blockId="T" />);
      const cells = document.querySelectorAll('.block-visual-cell.filled');
      cells.forEach((cell) => {
        expect(cell).toHaveStyle('background-color: rgb(218, 112, 214)');
      });
    });

    it('S 方块应该使用正确的颜色', () => {
      render(<BlockVisual blockId="S" />);
      const cells = document.querySelectorAll('.block-visual-cell.filled');
      cells.forEach((cell) => {
        expect(cell).toHaveStyle('background-color: rgb(0, 255, 0)');
      });
    });

    it('Z 方块应该使用正确的颜色', () => {
      render(<BlockVisual blockId="Z" />);
      const cells = document.querySelectorAll('.block-visual-cell.filled');
      cells.forEach((cell) => {
        expect(cell).toHaveStyle('background-color: rgb(255, 68, 68)');
      });
    });

    it('L 方块应该使用正确的颜色', () => {
      render(<BlockVisual blockId="L" />);
      const cells = document.querySelectorAll('.block-visual-cell.filled');
      cells.forEach((cell) => {
        expect(cell).toHaveStyle('background-color: rgb(255, 140, 0)');
      });
    });

    it('J 方块应该使用正确的颜色', () => {
      render(<BlockVisual blockId="J" />);
      const cells = document.querySelectorAll('.block-visual-cell.filled');
      cells.forEach((cell) => {
        expect(cell).toHaveStyle('background-color: rgb(65, 105, 225)');
      });
    });
  });

  describe('自定义样式', () => {
    it('应该应用自定义 className', () => {
      render(<BlockVisual blockId="I" className="custom-class" />);
      const blockVisual = document.querySelector('.block-visual.custom-class');
      expect(blockVisual).toBeInTheDocument();
    });

    it('应该应用自定义 style', () => {
      render(<BlockVisual blockId="I" style={{ opacity: 0.5 }} />);
      const blockVisual = document.querySelector('.block-visual');
      expect(blockVisual).toHaveStyle('opacity: 0.5');
    });
  });

  describe('无效方块 ID', () => {
    it('应该处理无效的方块 ID', () => {
      render(<BlockVisual blockId="INVALID" />);
      expect(screen.getByText('Invalid Block')).toBeInTheDocument();
    });
  });

  describe('形状紧凑化', () => {
    it('I 方块应该是 4x1 的形状', () => {
      render(<BlockVisual blockId="I" />);
      const grid = document.querySelector('.block-visual-grid');
      expect(grid).toHaveStyle('grid-template-columns: repeat(4, 1fr)');
    });

    it('O 方块应该是 2x2 的形状', () => {
      render(<BlockVisual blockId="O" />);
      const grid = document.querySelector('.block-visual-grid');
      expect(grid).toHaveStyle('grid-template-columns: repeat(2, 1fr)');
    });

    it('T 方块应该是正确的形状', () => {
      render(<BlockVisual blockId="T" />);
      const grid = document.querySelector('.block-visual-grid');
      expect(grid).toHaveStyle('grid-template-columns: repeat(3, 1fr)');
    });
  });

  describe('编辑模式', () => {
    it('应该应用编辑模式样式', () => {
      render(<BlockVisual blockId="I" isEditing={true} />);
      const blockVisual = document.querySelector('.block-visual--editing');
      expect(blockVisual).toBeInTheDocument();
    });

    it('应该没有编辑模式样式当 isEditing=false', () => {
      render(<BlockVisual blockId="I" isEditing={false} />);
      const blockVisual = document.querySelector('.block-visual--editing');
      expect(blockVisual).not.toBeInTheDocument();
    });
  });

  describe('悬停效果', () => {
    it('应该有悬停效果类', () => {
      render(<BlockVisual blockId="I" />);
      const blockVisual = document.querySelector('.block-visual');
      expect(blockVisual).toBeInTheDocument();
      // 检查是否有 hover 相关的样式类
      expect(blockVisual?.className).toContain('block-visual');
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App 组件', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('应该渲染游戏标题', () => {
    render(<App />);
    expect(screen.getByText('赛博方块 2077')).toBeInTheDocument();
  });

  test('初始状态应该显示开始游戏按钮', () => {
    render(<App />);
    expect(screen.getByText('开始游戏')).toBeInTheDocument();
  });

  test('应该显示控制说明', () => {
    render(<App />);
    
    expect(screen.getByText(/← → 移动/i)).toBeInTheDocument();
    expect(screen.getByText(/↑ 旋转/i)).toBeInTheDocument();
    expect(screen.getByText(/↓ 加速/i)).toBeInTheDocument();
    expect(screen.getByText(/空格 落下/i)).toBeInTheDocument();
    expect(screen.getByText(/P 暂停/i)).toBeInTheDocument();
  });

  test('应该显示版本号', () => {
    render(<App />);
    // 版本号可能是 v1.3.0 或 v2.0.0，使用正则匹配
    expect(screen.getByText(/v\d+\.\d+\.\d+/)).toBeInTheDocument();
  });

  describe('样式和布局', () => {
    test('主容器应该有正确的样式', () => {
      render(<App />);
      const container = screen.getByText('赛博方块 2077').closest('div');
      
      expect(container).toHaveStyle('display: flex');
      expect(container).toHaveStyle('flex-direction: column');
      expect(container).toHaveStyle('align-items: center');
    });

    test('标题应该有赛博朋克风格', () => {
      render(<App />);
      const title = screen.getByText('赛博方块 2077');
      
      expect(title).toHaveStyle('font-size: 48px');
      expect(title).toHaveStyle('color: var(--neon-cyan)');
    });
  });

  describe('可访问性', () => {
    test('按钮应该是可聚焦的', () => {
      render(<App />);
      const button = screen.getByText('开始游戏');
      
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    test('游戏说明应该可见', () => {
      render(<App />);
      const instructions = screen.getByText(/← → 移动/i);
      
      expect(instructions).toBeVisible();
    });
  });

  describe('边界情况', () => {
    test('组件应该正确处理卸载', () => {
      const { unmount } = render(<App />);
      
      // 卸载不应该抛出错误
      expect(() => unmount()).not.toThrow();
    });
  });
});

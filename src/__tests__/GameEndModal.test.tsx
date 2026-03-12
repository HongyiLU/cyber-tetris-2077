// ==================== GameEndModal 组件测试 ====================

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameEndModal from '../components/ui/GameEndModal';

describe('GameEndModal', () => {
  const defaultProps = {
    visible: true,
    score: 1000,
    lines: 10,
    combo: 5,
    maxCombo: 8,
    onRestart: jest.fn(),
    onBackToTitle: jest.fn(),
    isVictory: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 测试 1: 不显示时渲染 null
  test('renders null when not visible', () => {
    const { container } = render(
      <GameEndModal
        {...defaultProps}
        visible={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  // 测试 2: 显示游戏结束信息
  test('displays game over message', () => {
    render(<GameEndModal {...defaultProps} isVictory={false} />);
    expect(screen.getByText('💀 游戏结束')).toBeInTheDocument();
  });

  // 测试 3: 显示战斗胜利信息
  test('displays victory message', () => {
    render(<GameEndModal {...defaultProps} isVictory={true} />);
    expect(screen.getByText('🎉 战斗胜利!')).toBeInTheDocument();
  });

  // 测试 4: 显示得分
  test('displays score', () => {
    render(<GameEndModal {...defaultProps} score={2500} />);
    expect(screen.getByText('2,500')).toBeInTheDocument();
  });

  // 测试 5: 显示消除行数
  test('displays lines cleared', () => {
    render(<GameEndModal {...defaultProps} lines={15} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  // 测试 6: 显示最大连击
  test('displays max combo', () => {
    render(<GameEndModal {...defaultProps} maxCombo={12} />);
    expect(screen.getByText('12x')).toBeInTheDocument();
  });

  // 测试 7: 不显示连击当 maxCombo 为 0
  test('does not display combo when maxCombo is 0', () => {
    render(<GameEndModal {...defaultProps} maxCombo={0} />);
    expect(screen.queryByText('🔥 最大连击')).not.toBeInTheDocument();
  });

  // 测试 8: 不显示连击当 maxCombo 为 1
  test('does not display combo when maxCombo is 1', () => {
    render(<GameEndModal {...defaultProps} maxCombo={1} />);
    expect(screen.queryByText('🔥 最大连击')).not.toBeInTheDocument();
  });

  // 测试 9: 点击重新挑战按钮调用 onRestart
  test('calls onRestart when restart button is clicked', () => {
    const onRestartMock = jest.fn();
    render(
      <GameEndModal
        {...defaultProps}
        onRestart={onRestartMock}
      />
    );
    
    fireEvent.click(screen.getByText('🔄 重新挑战'));
    expect(onRestartMock).toHaveBeenCalledTimes(1);
  });

  // 测试 10: 点击回到标题页按钮调用 onBackToTitle
  test('calls onBackToTitle when back button is clicked', () => {
    const onBackToTitleMock = jest.fn();
    render(
      <GameEndModal
        {...defaultProps}
        onBackToTitle={onBackToTitleMock}
      />
    );
    
    fireEvent.click(screen.getByText('🏠 回到标题页'));
    expect(onBackToTitleMock).toHaveBeenCalledTimes(1);
  });

  // 测试 11: 游戏结束时有正确的颜色
  test('has correct colors for game over', () => {
    render(<GameEndModal {...defaultProps} isVictory={false} />);
    const title = screen.getByText('💀 游戏结束');
    expect(title).toHaveStyle('color: #ff4444');
  });

  // 测试 12: 战斗胜利时有正确的颜色
  test('has correct colors for victory', () => {
    render(<GameEndModal {...defaultProps} isVictory={true} />);
    const title = screen.getByText('🎉 战斗胜利!');
    expect(title).toHaveStyle('color: #f39c12');
  });

  // 测试 13: 应用赛博朋克样式
  test('applies cyberpunk styling', () => {
    render(<GameEndModal {...defaultProps} />);
    const title = screen.getByText('💀 游戏结束');
    expect(title).toHaveStyle('font-family: Orbitron, monospace');
  });

  // 测试 14: 容器具有正确的 z-index
  test('container has correct z-index', () => {
    render(<GameEndModal {...defaultProps} />);
    const container = screen.getByText('💀 游戏结束').closest('div[style*="position: fixed"]');
    expect(container).toHaveStyle('z-index: 3000');
  });

  // 测试 15: 显示得分标签
  test('displays score label', () => {
    render(<GameEndModal {...defaultProps} />);
    expect(screen.getByText('🎯 得分')).toBeInTheDocument();
  });

  // 测试 16: 显示消除行数标签
  test('displays lines cleared label', () => {
    render(<GameEndModal {...defaultProps} />);
    expect(screen.getByText('📊 消除行数')).toBeInTheDocument();
  });

  // 测试 17: 显示最大连击标签
  test('displays max combo label', () => {
    render(<GameEndModal {...defaultProps} />);
    expect(screen.getByText('🔥 最大连击')).toBeInTheDocument();
  });

  // 测试 18: 按钮有悬停效果样式
  test('buttons have hover effect styles', () => {
    render(<GameEndModal {...defaultProps} />);
    const restartButton = screen.getByText('🔄 重新挑战');
    expect(restartButton).toHaveStyle('transition: all 0.3s');
  });

  // 测试 19: 模态框有动画
  test('modal has animation', () => {
    render(<GameEndModal {...defaultProps} />);
    // Get the outermost container (fixed position div)
    const outerContainer = screen.getByText('💀 游戏结束').closest('div[style*="position: fixed"]');
    // Check that animation property exists
    expect(outerContainer?.getAttribute('style')).toContain('animation');
  });

  // 测试 20: 装饰角标存在
  test('decorative corners exist', () => {
    render(<GameEndModal {...defaultProps} />);
    const modal = screen.getByText('💀 游戏结束').closest('div[style*="position: relative"]');
    // 应该有 4 个装饰角标
    const corners = modal?.querySelectorAll('div[style*="position: absolute"]');
    expect(corners).toHaveLength(4);
  });

  // 测试 21: 大分数正确格式化
  test('formats large scores correctly', () => {
    render(<GameEndModal {...defaultProps} score={1234567} />);
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  // 测试 22: 响应式字体大小
  test('has responsive font sizes', () => {
    render(<GameEndModal {...defaultProps} />);
    const title = screen.getByText('💀 游戏结束');
    expect(title).toHaveStyle('font-size: clamp(28px, 8vw, 42px)');
  });

  // 测试 23: 按钮有正确的字体
  test('buttons have correct font', () => {
    render(<GameEndModal {...defaultProps} />);
    const restartButton = screen.getByText('🔄 重新挑战');
    expect(restartButton).toHaveStyle('font-family: Orbitron, monospace');
  });

  // 测试 24: 模态框有最大宽度
  test('modal has max-width', () => {
    render(<GameEndModal {...defaultProps} />);
    const modal = screen.getByText('💀 游戏结束').closest('div[style*="position: relative"]');
    expect(modal).toHaveStyle('max-width: 500px');
  });

  // 测试 25: 背景半透明
  test('has semi-transparent background', () => {
    render(<GameEndModal {...defaultProps} />);
    const container = screen.getByText('💀 游戏结束').closest('div[style*="position: fixed"]');
    expect(container).toHaveStyle('background: rgba(0, 0, 0, 0.9)');
  });

  // 测试 26: 统计信息容器样式
  test('stats container has correct styling', () => {
    render(<GameEndModal {...defaultProps} />);
    const statsContainer = screen.getByText('🎯 得分').parentElement?.parentElement;
    expect(statsContainer).toHaveStyle('border-radius: 12px');
  });

  // 测试 27: 按钮有边框
  test('buttons have borders', () => {
    render(<GameEndModal {...defaultProps} />);
    const restartButton = screen.getByText('🔄 重新挑战');
    expect(restartButton).toHaveStyle('border: 3px solid var(--neon-cyan, #00ffff)');
  });

  // 测试 28: 按钮有阴影效果
  test('buttons have shadow effects', () => {
    render(<GameEndModal {...defaultProps} />);
    const restartButton = screen.getByText('🔄 重新挑战');
    expect(restartButton).toHaveStyle('box-shadow: 0 0 30px rgba(0, 255, 255, 0.4)');
  });

  // 测试 29: 文本有霓虹效果
  test('text has neon effect', () => {
    render(<GameEndModal {...defaultProps} />);
    const scoreElement = screen.getByText('1,000');
    expect(scoreElement).toHaveStyle('text-shadow: 0 0 10px rgba(0, 255, 255, 0.5)');
  });

  // 测试 30: 可点击按钮
  test('buttons are clickable', () => {
    render(<GameEndModal {...defaultProps} />);
    const restartButton = screen.getByText('🔄 重新挑战');
    expect(restartButton).toHaveStyle('cursor: pointer');
    
    const backButton = screen.getByText('🏠 回到标题页');
    expect(backButton).toHaveStyle('cursor: pointer');
  });
});

// ==================== GameEndModal 组件测试 ====================

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameEndModal from '../components/ui/GameEndModal';
import type { GameEndResult } from '../types/game';

const defaultResult: GameEndResult = {
  isVictory: false,
  stats: {
    linesCleared: 10,
    score: 1000,
    time: 120,
    combos: 5,
  },
  enemyName: '史莱姆',
  isFinalBoss: false,
};

const defaultProps = {
  visible: true,
  result: defaultResult,
  onRetry: jest.fn(),
  onBackToTitle: jest.fn(),
  onNextLevel: jest.fn(),
};

describe('GameEndModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders null when not visible', () => {
    const { container } = render(
      <GameEndModal
        visible={false}
        result={defaultResult}
        onRetry={jest.fn()}
        onBackToTitle={jest.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test('displays game over message', () => {
    const result: GameEndResult = { ...defaultResult, isVictory: false };
    render(<GameEndModal {...defaultProps} result={result} />);
    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toBeInTheDocument();
    expect(title.textContent).toContain('游戏结束');
  });

  test('displays victory message', () => {
    const result: GameEndResult = { ...defaultResult, isVictory: true };
    render(<GameEndModal {...defaultProps} result={result} />);
    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toBeInTheDocument();
    expect(title.textContent).toContain('战斗胜利');
  });

  test('displays enemy name on victory', () => {
    const result: GameEndResult = { 
      ...defaultResult, 
      isVictory: true,
      enemyName: '哥布林',
    };
    render(<GameEndModal {...defaultProps} result={result} />);
    expect(screen.getByText(/恭喜击败 哥布林/)).toBeInTheDocument();
  });

  test('calls onRetry when retry button is clicked', () => {
    const onRetry = jest.fn();
    render(<GameEndModal {...defaultProps} onRetry={onRetry} />);
    const retryButton = screen.getByText(/再次挑战/);
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  test('calls onNextLevel when next level button is clicked on victory', () => {
    const onNextLevel = jest.fn();
    const result: GameEndResult = { ...defaultResult, isVictory: true };
    render(
      <GameEndModal 
        {...defaultProps} 
        result={result}
        onNextLevel={onNextLevel}
      />
    );
    const nextButton = screen.getByText(/挑战下一怪物/);
    fireEvent.click(nextButton);
    expect(onNextLevel).toHaveBeenCalled();
  });

  test('calls onBackToTitle when back button is clicked', () => {
    const onBackToTitle = jest.fn();
    render(<GameEndModal {...defaultProps} onBackToTitle={onBackToTitle} />);
    const backButton = screen.getByText(/回到标题页/);
    fireEvent.click(backButton);
    expect(onBackToTitle).toHaveBeenCalled();
  });

  test('displays score correctly', () => {
    const result: GameEndResult = { 
      ...defaultResult, 
      stats: { ...defaultResult.stats, score: 1234567 },
    };
    render(<GameEndModal {...defaultProps} result={result} />);
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  test('displays lines cleared correctly', () => {
    const result: GameEndResult = { 
      ...defaultResult, 
      stats: { ...defaultResult.stats, linesCleared: 50 },
    };
    render(<GameEndModal {...defaultProps} result={result} />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  test('displays max combo correctly', () => {
    const result: GameEndResult = { 
      ...defaultResult, 
      stats: { ...defaultResult.stats, combos: 15 },
    };
    render(<GameEndModal {...defaultProps} result={result} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  test('displays time correctly', () => {
    const result: GameEndResult = { 
      ...defaultResult, 
      stats: { ...defaultResult.stats, time: 185 },
    };
    render(<GameEndModal {...defaultProps} result={result} />);
    expect(screen.getByText('03:05')).toBeInTheDocument();
  });

  test('does not show next level button for final boss', () => {
    const result: GameEndResult = { 
      ...defaultResult, 
      isVictory: true,
      isFinalBoss: true,
    };
    render(<GameEndModal {...defaultProps} result={result} />);
    expect(screen.queryByText(/挑战下一怪物/)).not.toBeInTheDocument();
  });

  test('shows retry button on defeat', () => {
    const result: GameEndResult = { ...defaultResult, isVictory: false };
    render(<GameEndModal {...defaultProps} result={result} />);
    expect(screen.getByText(/再次挑战/)).toBeInTheDocument();
  });

  test('has correct CSS classes', () => {
    render(<GameEndModal {...defaultProps} />);
    const overlay = document.querySelector('.game-end-modal-overlay');
    expect(overlay).toBeInTheDocument();
    
    const content = document.querySelector('.game-end-modal-content');
    expect(content).toBeInTheDocument();
  });

  test('buttons have correct CSS classes', () => {
    render(<GameEndModal {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button.className).toMatch(/game-end-modal-btn/);
    });
  });
});

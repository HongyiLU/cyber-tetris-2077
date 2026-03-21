/**
 * HandDisplay 组件测试
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HandDisplay from '../components/ui/HandDisplay';
import { Card, CardRarity, CardSpecialEffect } from '../types/card.v2';

// Mock card data
const mockCards: Card[] = [
  {
    id: 'test_card_1',
    name: '测试卡牌1',
    cost: 1,
    shape: [[1, 1], [1, 1]],
    rarity: CardRarity.COMMON,
    damage: 8,
    description: '消除2行',
    upgradeLevel: 0,
  },
  {
    id: 'test_card_2',
    name: '测试卡牌2',
    cost: 2,
    shape: [[1, 1, 1]],
    rarity: CardRarity.RARE,
    damage: 10,
    description: '消除3行',
    specialEffect: CardSpecialEffect.CLEAR_LINES,
    specialValue: 3,
    upgradeLevel: 1,
  },
];

describe('HandDisplay', () => {
  it('renders without crashing', () => {
    render(
      <HandDisplay
        cards={mockCards}
        energy={3}
        maxEnergy={3}
      />
    );
    expect(screen.getByText('能量')).toBeInTheDocument();
  });

  it('displays cards correctly', () => {
    render(
      <HandDisplay
        cards={mockCards}
        energy={3}
        maxEnergy={3}
      />
    );
    expect(screen.getByText('测试卡牌1')).toBeInTheDocument();
    expect(screen.getByText('测试卡牌2')).toBeInTheDocument();
  });

  it('displays energy orbs', () => {
    render(
      <HandDisplay
        cards={mockCards}
        energy={2}
        maxEnergy={3}
      />
    );
    const energyOrbs = screen.getAllByText('⚡');
    expect(energyOrbs.length).toBe(3); // Should show 3 orbs total
  });

  it('calls onCardClick when card is clicked and playable', () => {
    const mockOnCardClick = jest.fn();
    render(
      <HandDisplay
        cards={mockCards}
        energy={3}
        maxEnergy={3}
        onCardClick={mockOnCardClick}
      />
    );

    const card = screen.getByText('测试卡牌1').closest('.hand-card');
    if (card) {
      fireEvent.click(card);
      expect(mockOnCardClick).toHaveBeenCalledWith(mockCards[0]);
    }
  });

  it('does not call onCardClick when disabled', () => {
    const mockOnCardClick = jest.fn();
    render(
      <HandDisplay
        cards={mockCards}
        energy={3}
        maxEnergy={3}
        onCardClick={mockOnCardClick}
        disabled={true}
      />
    );

    const card = screen.getByText('测试卡牌1').closest('.hand-card');
    if (card) {
      fireEvent.click(card);
      expect(mockOnCardClick).not.toHaveBeenCalled();
    }
  });

  it('shows waiting state', () => {
    render(
      <HandDisplay
        cards={mockCards}
        energy={3}
        maxEnergy={3}
        isWaiting={true}
      />
    );
    expect(screen.getByText('等待中...')).toBeInTheDocument();
  });

  it('displays empty state when no cards', () => {
    render(
      <HandDisplay
        cards={[]}
        energy={3}
        maxEnergy={3}
      />
    );
    expect(screen.getByText('没有手牌')).toBeInTheDocument();
  });
});

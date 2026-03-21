/**
 * RewardSelect 组件测试
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RewardSelect from '../components/ui/RewardSelect';
import { Card, CardRarity } from '../types/card.v2';
import { RewardOption } from '../types/deck-builder';

const mockCard: Card = {
  id: 'reward_card_1',
  name: '奖励卡牌',
  cost: 1,
  shape: [[1, 1], [1, 1]],
  rarity: CardRarity.UNCOMMON,
  damage: 10,
  description: '消除2行',
  upgrade: { damage: 5 },
  upgradeLevel: 0,
};

const mockOptions: RewardOption[] = [
  { id: 'reward_1', cards: [mockCard], skipBonus: 10 },
  {
    id: 'reward_2',
    cards: [
      {
        ...mockCard,
        id: 'reward_card_2',
        name: '奖励卡牌2',
        rarity: CardRarity.RARE,
      },
    ],
    skipBonus: 10,
  },
  {
    id: 'reward_3',
    cards: [
      {
        ...mockCard,
        id: 'reward_card_3',
        name: '奖励卡牌3',
        rarity: CardRarity.EPIC,
      },
    ],
    skipBonus: 10,
  },
];

describe('RewardSelect', () => {
  it('renders without crashing', () => {
    render(
      <RewardSelect
        options={mockOptions}
        onSelect={jest.fn()}
        onSkip={jest.fn()}
      />
    );
    expect(screen.getByText('战斗胜利！')).toBeInTheDocument();
  });

  it('displays all reward options', () => {
    render(
      <RewardSelect
        options={mockOptions}
        onSelect={jest.fn()}
        onSkip={jest.fn()}
      />
    );
    expect(screen.getByText('奖励卡牌')).toBeInTheDocument();
    expect(screen.getByText('奖励卡牌2')).toBeInTheDocument();
    expect(screen.getByText('奖励卡牌3')).toBeInTheDocument();
  });

  it('displays rarity labels', () => {
    render(
      <RewardSelect
        options={mockOptions}
        onSelect={jest.fn()}
        onSkip={jest.fn()}
      />
    );
    expect(screen.getByText('稀有')).toBeInTheDocument(); // 稀有度
  });

  it('calls onSkip when skip button is clicked', () => {
    const mockOnSkip = jest.fn();
    render(
      <RewardSelect
        options={mockOptions}
        onSelect={jest.fn()}
        onSkip={mockOnSkip}
      />
    );

    const skipButton = screen.getByText('跳过 (+10 金币)');
    fireEvent.click(skipButton);
    expect(mockOnSkip).toHaveBeenCalled();
  });

  it('calls onSelect when option is clicked', () => {
    const mockOnSelect = jest.fn();
    render(
      <RewardSelect
        options={mockOptions}
        onSelect={mockOnSelect}
        onSkip={jest.fn()}
      />
    );

    const option = screen.getByText('奖励卡牌').closest('.reward-option');
    if (option) {
      fireEvent.click(option);
      expect(mockOnSelect).toHaveBeenCalledWith(mockOptions[0]);
    }
  });

  it('displays stage information', () => {
    render(
      <RewardSelect
        options={mockOptions}
        onSelect={jest.fn()}
        onSkip={jest.fn()}
        stage={3}
      />
    );
    expect(screen.getByText('第 3 关')).toBeInTheDocument();
  });
});

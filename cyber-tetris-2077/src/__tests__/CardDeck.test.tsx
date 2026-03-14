import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardDeck, { CardDeckProps, Deck, Card } from '../components/ui/CardDeck';

// Mock BlockVisual component
jest.mock('../components/ui/BlockVisual', () => {
  return ({ blockId, size, showLabel }: { blockId: string; size: string; showLabel: boolean }) => (
    <div data-testid={`block-visual-${blockId}`} data-size={size} data-label={showLabel}>
      {blockId}
    </div>
  );
});

// Mock useResponsiveLayout hook
jest.mock('../hooks/useResponsiveLayout', () => {
  return {
    useResponsiveLayout: () => ({
      columns: 8,
      cardSize: 'medium' as const,
      breakpoint: 'desktop' as const,
    }),
    getBreakpoint: jest.fn(),
    getRecommendedColumns: jest.fn(),
    getRecommendedCardSize: jest.fn(),
  };
});

// Mock window.confirm
window.confirm = jest.fn(() => true);

describe('CardDeck', () => {
  const mockCards: Card[] = [
    { id: 'I', name: 'I-Block', description: 'Long block', rarity: 'common', count: 2, maxCount: 4 },
    { id: 'O', name: 'O-Block', description: 'Square block', rarity: 'common', count: 1, maxCount: 4 },
    { id: 'T', name: 'T-Block', description: 'T-shaped block', rarity: 'rare', count: 2, maxCount: 4 },
  ];

  const mockDecks: Deck[] = [
    {
      id: 'deck-1',
      name: 'Test Deck 1',
      cards: mockCards,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-03-15'),
    },
    {
      id: 'deck-2',
      name: 'Test Deck 2',
      cards: [...mockCards, { id: 'S', name: 'S-Block', description: 'S-shaped', rarity: 'epic', count: 1, maxCount: 4 }],
      createdAt: new Date('2026-02-01'),
      updatedAt: new Date('2026-03-14'),
    },
  ];

  const defaultProps: CardDeckProps = {
    decks: mockDecks,
    editable: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该渲染卡组容器', () => {
      render(<CardDeck {...defaultProps} />);
      expect(screen.getByText('我的卡组')).toBeInTheDocument();
    });

    it('应该显示所有卡组', () => {
      render(<CardDeck {...defaultProps} />);
      expect(screen.getByText('Test Deck 1')).toBeInTheDocument();
      expect(screen.getByText('Test Deck 2')).toBeInTheDocument();
    });

    it('应该显示卡组卡牌数量', () => {
      render(<CardDeck {...defaultProps} />);
      expect(screen.getAllByText('3 张卡牌')).toHaveLength(1);
      expect(screen.getAllByText('4 张卡牌')).toHaveLength(1);
    });

    it('应该显示新建卡组按钮（当 editable=true）', () => {
      render(<CardDeck {...defaultProps} />);
      expect(screen.getByText('+ 新建卡组')).toBeInTheDocument();
    });

    it('不应该显示新建卡组按钮（当 editable=false）', () => {
      render(<CardDeck {...defaultProps} editable={false} />);
      expect(screen.queryByText('+ 新建卡组')).not.toBeInTheDocument();
    });
  });

  describe('空状态', () => {
    it('应该显示空状态消息（当没有卡组时）', () => {
      render(<CardDeck decks={[]} editable={true} />);
      expect(screen.getByText('暂无卡组')).toBeInTheDocument();
    });

    it('应该显示创建第一个卡组按钮（当没有卡组且 editable=true）', () => {
      render(<CardDeck decks={[]} editable={true} />);
      expect(screen.getByText('创建第一个卡组')).toBeInTheDocument();
    });
  });

  describe('交互功能', () => {
    it('应该调用 onDeckSelect 当点击卡组', () => {
      const onDeckSelect = jest.fn();
      render(<CardDeck {...defaultProps} onDeckSelect={onDeckSelect} />);
      
      const deckElement = screen.getByText('Test Deck 1').closest('.card-deck-item');
      fireEvent.click(deckElement!);
      
      expect(onDeckSelect).toHaveBeenCalledWith(mockDecks[0]);
    });

    it('应该调用 onDeckEdit 当点击编辑按钮', () => {
      const onDeckEdit = jest.fn();
      render(<CardDeck {...defaultProps} onDeckEdit={onDeckEdit} />);
      
      const editButton = screen.getAllByTitle('编辑')[0];
      fireEvent.click(editButton);
      
      expect(onDeckEdit).toHaveBeenCalledWith(mockDecks[0]);
    });

    it('应该调用 onDeckDelete 当点击删除按钮并确认', () => {
      const onDeckDelete = jest.fn();
      window.confirm = jest.fn(() => true);
      
      render(<CardDeck {...defaultProps} onDeckDelete={onDeckDelete} />);
      
      const deleteButton = screen.getAllByTitle('删除')[0];
      fireEvent.click(deleteButton);
      
      expect(window.confirm).toHaveBeenCalled();
      expect(onDeckDelete).toHaveBeenCalledWith('deck-1');
    });

    it('不应该调用 onDeckDelete 当取消删除', () => {
      const onDeckDelete = jest.fn();
      window.confirm = jest.fn(() => false);
      
      render(<CardDeck {...defaultProps} onDeckDelete={onDeckDelete} />);
      
      const deleteButton = screen.getAllByTitle('删除')[0];
      fireEvent.click(deleteButton);
      
      expect(window.confirm).toHaveBeenCalled();
      expect(onDeckDelete).not.toHaveBeenCalled();
    });

    it('应该调用 onCreateDeck 当点击新建按钮', () => {
      const onCreateDeck = jest.fn();
      render(<CardDeck {...defaultProps} onCreateDeck={onCreateDeck} />);
      
      fireEvent.click(screen.getByText('+ 新建卡组'));
      
      expect(onCreateDeck).toHaveBeenCalled();
    });
  });

  describe('选中状态', () => {
    it('应该高亮选中的卡组', () => {
      const { container } = render(<CardDeck {...defaultProps} />);
      
      const deckElement = screen.getByText('Test Deck 1').closest('.card-deck-item');
      fireEvent.click(deckElement!);
      
      const selectedDeck = container.querySelector('.card-deck-item.selected');
      expect(selectedDeck).toBeInTheDocument();
    });
  });

  describe('方块预览', () => {
    it('应该渲染方块预览组件', () => {
      render(<CardDeck {...defaultProps} />);
      
      const blockVisuals = screen.getAllByTestId('block-visual-I');
      expect(blockVisuals.length).toBeGreaterThan(0);
    });

    it('应该使用正确的卡片尺寸', () => {
      render(<CardDeck {...defaultProps} />);
      
      const blockVisuals = screen.getAllByTestId('block-visual-I');
      blockVisuals.forEach((bv) => {
        expect(bv).toHaveAttribute('data-size', 'medium');
      });
    });

    it('应该显示更多卡牌数量（当超过 6 张时）', () => {
      const largeDeck: Deck = {
        id: 'deck-large',
        name: 'Large Deck',
        cards: [
          ...mockCards,
          { id: 'S', name: 'S-Block', description: 'S', rarity: 'common', count: 1, maxCount: 4 },
          { id: 'Z', name: 'Z-Block', description: 'Z', rarity: 'common', count: 1, maxCount: 4 },
          { id: 'L', name: 'L-Block', description: 'L', rarity: 'common', count: 1, maxCount: 4 },
          { id: 'J', name: 'J-Block', description: 'J', rarity: 'common', count: 1, maxCount: 4 },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(<CardDeck decks={[largeDeck]} editable={true} />);
      // 7 cards - 6 shown = +1 more
      const moreElement = screen.getByText('+1');
      expect(moreElement).toBeInTheDocument();
    });
  });

  describe('响应式布局', () => {
    it('应该使用响应式网格布局', () => {
      const { container } = render(<CardDeck {...defaultProps} />);
      
      const grid = container.querySelector('.card-deck-grid');
      expect(grid).toBeInTheDocument();
    });

    it('应该应用动态列数样式', () => {
      const { container } = render(<CardDeck {...defaultProps} />);
      
      const grid = container.querySelector('.card-deck-grid');
      expect(grid).toHaveAttribute('style');
      expect(grid?.getAttribute('style')).toContain('grid-template-columns');
    });
  });
});

// ==================== DeckSelectScene 组件测试 ====================
// v2.0.0 Day 8 - P0-3 测试覆盖

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeckSelectScene } from '../components/ui/DeckSelectScene';
import type { DeckManager } from '../engine/DeckManager';
import type { Deck } from '../types/deck';

// 模拟 DeckManager
const mockDeckManager: Partial<DeckManager> = {
  listDecks: jest.fn().mockReturnValue([
    {
      id: 'deck-1',
      name: '基础卡组',
      description: '适合新手的卡组',
      cards: ['strike', 'defend', 'bash'],
      isActive: true,
    },
    {
      id: 'deck-2',
      name: '高级卡组',
      description: '适合老手的卡组',
      cards: ['strike', 'strike', 'defend', 'defend', 'bash', 'cleave'],
      isActive: false,
    },
  ]),
  getActiveDeck: jest.fn().mockReturnValue({
    id: 'deck-1',
    name: '基础卡组',
    description: '适合新手的卡组',
    cards: ['strike', 'defend', 'bash'],
    isActive: true,
  }),
  getDeck: jest.fn().mockImplementation((id: string) => {
    const decks: Record<string, Deck> = {
      'deck-1': {
        id: 'deck-1',
        name: '基础卡组',
        description: '适合新手的卡组',
        cards: ['strike', 'defend', 'bash'],
        isActive: true,
      },
      'deck-2': {
        id: 'deck-2',
        name: '高级卡组',
        description: '适合老手的卡组',
        cards: ['strike', 'strike', 'defend', 'defend', 'bash', 'cleave'],
        isActive: false,
      },
    };
    return decks[id] || null;
  }),
};

describe('DeckSelectScene Component', () => {
  const mockOnSelect = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该渲染场景标题', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      expect(screen.getByText('🃏 选择卡组与敌人')).toBeInTheDocument();
    });

    it('应该渲染返回按钮', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      expect(screen.getByText('← 返回')).toBeInTheDocument();
    });

    it('应该渲染卡组选择区域标题', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      expect(screen.getByText('选择你的卡组')).toBeInTheDocument();
    });

    it('应该渲染敌人选择区域标题', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      expect(screen.getByText('选择敌人')).toBeInTheDocument();
    });
  });

  describe('卡组列表', () => {
    it('应该显示卡组列表', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      expect(screen.getByText('基础卡组')).toBeInTheDocument();
      expect(screen.getByText('高级卡组')).toBeInTheDocument();
    });

    it('应该显示卡牌数量', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      expect(screen.getByText('3 张卡牌')).toBeInTheDocument();
      expect(screen.getByText('6 张卡牌')).toBeInTheDocument();
    });

    it('默认选中激活的卡组', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      // 基础卡组是激活的，应该显示选中状态
      const deckOptions = document.querySelectorAll('.deck-option');
      expect(deckOptions[0]).toHaveClass('selected');
    });

    it('点击卡组应该切换选中状态', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      
      // 点击第二个卡组
      const deckOptions = document.querySelectorAll('.deck-option');
      fireEvent.click(deckOptions[1]);
      
      // 第二个卡组应该变为选中状态
      expect(deckOptions[1]).toHaveClass('selected');
    });

    it('没有卡组时应该显示提示信息', () => {
      const emptyDeckManager = {
        ...mockDeckManager,
        listDecks: jest.fn().mockReturnValue([]),
        getActiveDeck: jest.fn().mockReturnValue(null),
      };
      
      render(
        <DeckSelectScene
          deckManager={emptyDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      
      expect(screen.getByText('📭')).toBeInTheDocument();
      expect(screen.getByText('暂无卡组')).toBeInTheDocument();
      expect(screen.getByText('请先在卡组管理中创建卡组')).toBeInTheDocument();
    });
  });

  describe('敌人选择', () => {
    it('应该显示所有敌人选项', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      
      // 检查敌人列表中是否有 4 个敌人选项（排除预览区域中的重复）
      const enemyNames = document.querySelectorAll('.enemy-option .enemy-name');
      expect(enemyNames).toHaveLength(4);
      expect(enemyNames[0].textContent).toBe('史莱姆');
      expect(enemyNames[1].textContent).toBe('哥布林');
      expect(enemyNames[2].textContent).toBe('骷髅战士');
      expect(enemyNames[3].textContent).toBe('恶魔');
    });

    it('应该显示敌人表情', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      
      // 检查敌人列表中是否有 4 个敌人表情（排除预览区域中的重复）
      const enemyEmojis = document.querySelectorAll('.enemy-option .enemy-emoji');
      expect(enemyEmojis).toHaveLength(4);
      expect(enemyEmojis[0].textContent).toBe('🦠');
      expect(enemyEmojis[1].textContent).toBe('👺');
      expect(enemyEmojis[2].textContent).toBe('💀');
      expect(enemyEmojis[3].textContent).toBe('😈');
    });

    it('默认选中第一个敌人（史莱姆）', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      
      const enemyOptions = document.querySelectorAll('.enemy-option');
      expect(enemyOptions[0]).toHaveClass('selected');
    });

    it('点击敌人应该切换选中状态', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      
      const enemyOptions = document.querySelectorAll('.enemy-option');
      fireEvent.click(enemyOptions[2]); // 点击骷髅战士
      
      expect(enemyOptions[2]).toHaveClass('selected');
    });

    it('应该使用 initialEnemyId 作为默认选中', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
          initialEnemyId="skeleton"
        />
      );
      
      const enemyOptions = document.querySelectorAll('.enemy-option');
      // skeleton 应该是默认选中的（index 2）
      expect(enemyOptions[2]).toHaveClass('selected');
    });
  });

  describe('卡组预览', () => {
    it('选中卡组后应该显示预览按钮', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      
      expect(screen.getByText('预览卡组详情')).toBeInTheDocument();
    });

    it('点击预览按钮应该显示卡组详情', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      
      const previewBtn = screen.getByText('预览卡组详情');
      fireEvent.click(previewBtn);
      
      expect(screen.getByText('隐藏卡组详情')).toBeInTheDocument();
      expect(screen.getByText('适合新手的卡组')).toBeInTheDocument();
    });

    it('再次点击预览按钮应该隐藏卡组详情', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      
      const previewBtn = screen.getByText('预览卡组详情');
      fireEvent.click(previewBtn);
      fireEvent.click(screen.getByText('隐藏卡组详情'));
      
      expect(screen.getByText('预览卡组详情')).toBeInTheDocument();
      expect(screen.queryByText('适合新手的卡组')).not.toBeInTheDocument();
    });
  });

  describe('开始战斗按钮', () => {
    it('应该渲染开始战斗按钮', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      
      expect(screen.getByText('⚔️ 开始战斗')).toBeInTheDocument();
    });

    it('没有选择卡组时按钮应该禁用', () => {
      const noActiveDeckManager = {
        ...mockDeckManager,
        listDecks: jest.fn().mockReturnValue([
          {
            id: 'deck-1',
            name: '基础卡组',
            description: '适合新手的卡组',
            cards: ['strike'],
            isActive: false,
          },
        ]),
        getActiveDeck: jest.fn().mockReturnValue(null),
      };
      
      render(
        <DeckSelectScene
          deckManager={noActiveDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      
      const startBtn = screen.getByRole('button', { name: /开始战斗/i });
      expect(startBtn).toBeDisabled();
    });

    it('选择卡组和敌人后按钮应该可用', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      
      const startBtn = screen.getByRole('button', { name: /开始战斗/i });
      expect(startBtn).not.toBeDisabled();
    });

    it('点击开始战斗按钮应该调用 onSelect', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      
      const startBtn = screen.getByRole('button', { name: /开始战斗/i });
      fireEvent.click(startBtn);
      
      expect(mockOnSelect).toHaveBeenCalledWith('deck-1', 'slime');
    });

    it('点击开始战斗按钮应该传入选中的敌人 ID', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      
      // 选择哥布林
      const enemyOptions = document.querySelectorAll('.enemy-option');
      fireEvent.click(enemyOptions[1]);
      
      const startBtn = screen.getByRole('button', { name: /开始战斗/i });
      fireEvent.click(startBtn);
      
      expect(mockOnSelect).toHaveBeenCalledWith('deck-1', 'goblin');
    });
  });

  describe('返回按钮', () => {
    it('点击返回按钮应该调用 onBack', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      
      const backBtn = screen.getByText('← 返回');
      fireEvent.click(backBtn);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('VS 分隔符', () => {
    it('应该显示 VS 分隔符', () => {
      render(
        <DeckSelectScene
          deckManager={mockDeckManager as DeckManager}
          onSelect={mockOnSelect}
          onBack={mockOnBack}
        />
      );
      
      expect(screen.getByText('VS')).toBeInTheDocument();
    });
  });
});

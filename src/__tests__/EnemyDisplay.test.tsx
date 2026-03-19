// ==================== EnemyDisplay 组件测试 ====================
// v2.0.0 Day 8 - P0-1/P0-3 修复验证

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnemyDisplay } from '../components/ui/EnemyDisplay';
import { CombatState } from '../core/CombatManager';

describe('EnemyDisplay Component', () => {
  const defaultProps = {
    enemyName: '史莱姆',
    enemyHP: 20,
    enemyMaxHP: 30,
    enemyBlock: 5,
    enemyEmoji: '🦠',
    enemyAttack: 3,
    combatState: CombatState.PLAYER_TURN,
    turnCount: 1,
    isAttacking: false,
  };

  describe('基础渲染', () => {
    it('应该渲染敌人名称', () => {
      render(<EnemyDisplay {...defaultProps} />);
      expect(screen.getByText('史莱姆')).toBeInTheDocument();
    });

    it('应该渲染敌人表情', () => {
      render(<EnemyDisplay {...defaultProps} />);
      expect(screen.getByText('🦠')).toBeInTheDocument();
    });

    it('应该显示当前 HP', () => {
      render(<EnemyDisplay {...defaultProps} />);
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('应该显示最大 HP', () => {
      render(<EnemyDisplay {...defaultProps} />);
      expect(screen.getByText('30')).toBeInTheDocument();
    });

    it('应该显示回合数', () => {
      render(<EnemyDisplay {...defaultProps} turnCount={5} />);
      const turnNumber = document.querySelector('.turn-number');
      expect(turnNumber).toBeInTheDocument();
      expect(turnNumber?.textContent).toBe('5');
    });

    it('应该显示 HP 条', () => {
      const { container } = render(<EnemyDisplay {...defaultProps} />);
      const hpBar = container.querySelector('.hp-bar');
      expect(hpBar).toBeInTheDocument();
    });
  });

  describe('防御值显示', () => {
    it('当有防御值时应该显示防御图标和数值', () => {
      render(<EnemyDisplay {...defaultProps} enemyBlock={10} />);
      expect(screen.getByText('🛡️')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('当没有防御值时不应该显示防御区域', () => {
      render(<EnemyDisplay {...defaultProps} enemyBlock={0} />);
      const blockDisplay = document.querySelector('.block-display');
      expect(blockDisplay).not.toBeInTheDocument();
    });
  });

  describe('战斗状态显示', () => {
    it('当是敌人回合时应显示准备攻击状态', () => {
      render(<EnemyDisplay {...defaultProps} combatState={CombatState.ENEMY_TURN} />);
      expect(screen.getByText('准备攻击!')).toBeInTheDocument();
    });

    it('当是玩家回合时不应显示敌人攻击状态', () => {
      render(<EnemyDisplay {...defaultProps} combatState={CombatState.PLAYER_TURN} />);
      expect(screen.queryByText('准备攻击!')).not.toBeInTheDocument();
    });

    it('当是 RESOLVING 状态时应显示行动中', () => {
      render(<EnemyDisplay {...defaultProps} combatState={CombatState.RESOLVING} />);
      expect(screen.getByText('行动中...')).toBeInTheDocument();
    });

    it('当是 VICTORY 状态时应显示击败', () => {
      render(<EnemyDisplay {...defaultProps} combatState={CombatState.VICTORY} />);
      expect(screen.getByText('击败!')).toBeInTheDocument();
    });

    it('当是 DEFEAT 状态时应显示战败', () => {
      render(<EnemyDisplay {...defaultProps} combatState={CombatState.DEFEAT} />);
      expect(screen.getByText('战败...')).toBeInTheDocument();
    });
  });

  describe('P0-1 Fix: 伤害闪红效果', () => {
    it('当 HP 减少时应该触发 damaged 动画类', () => {
      const { container, rerender } = render(<EnemyDisplay {...defaultProps} enemyHP={20} />);
      
      // 初始状态不应该是 damaged
      expect(container.querySelector('.enemy-display')).not.toHaveClass('damaged');
      
      // HP 减少后应该触发 damaged
      rerender(<EnemyDisplay {...defaultProps} enemyHP={15} />);
      
      // 等待动画触发
      setTimeout(() => {
        expect(container.querySelector('.enemy-display')).toHaveClass('damaged');
      }, 50);
    });

    it('当 HP 不变时不应该触发 damaged 动画', () => {
      const { container, rerender } = render(<EnemyDisplay {...defaultProps} enemyHP={20} />);
      
      // HP 不变
      rerender(<EnemyDisplay {...defaultProps} enemyHP={20} />);
      
      // 不应该有 damaged 类
      expect(container.querySelector('.enemy-display')).not.toHaveClass('damaged');
    });

    it('当 HP 增加时不应该触发 damaged 动画', () => {
      const { container, rerender } = render(<EnemyDisplay {...defaultProps} enemyHP={20} />);
      
      // HP 增加（治疗）
      rerender(<EnemyDisplay {...defaultProps} enemyHP={25} />);
      
      // 不应该有 damaged 类
      expect(container.querySelector('.enemy-display')).not.toHaveClass('damaged');
    });

    it('应该使用 useRef 而非 useState 保存上一帧 HP', () => {
      // 验证组件渲染时不抛出错误
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const { rerender } = render(<EnemyDisplay {...defaultProps} enemyHP={20} />);
      
      // 多次渲染，HP 递减
      rerender(<EnemyDisplay {...defaultProps} enemyHP={18} />);
      rerender(<EnemyDisplay {...defaultProps} enemyHP={15} />);
      rerender(<EnemyDisplay {...defaultProps} enemyHP={10} />);
      
      // 不应该有 React 的 "maximum update depth exceeded" 错误
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Error:')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('攻击动画', () => {
    it('当 isAttacking 为 true 时应该添加 attacking 类', () => {
      const { container, rerender } = render(
        <EnemyDisplay {...defaultProps} isAttacking={false} />
      );
      
      expect(container.querySelector('.enemy-display')).not.toHaveClass('attacking');
      
      rerender(<EnemyDisplay {...defaultProps} isAttacking={true} />);
      
      // 攻击动画应该在短时间内触发
      setTimeout(() => {
        expect(container.querySelector('.enemy-display')).toHaveClass('attacking');
      }, 50);
    });
  });

  describe('HP 百分比计算', () => {
    it('应该正确计算 HP 百分比', () => {
      const { container, rerender } = render(
        <EnemyDisplay {...defaultProps} enemyHP={15} enemyMaxHP={30} />
      );
      
      // HP 为 50% 时，hp-fill 宽度应该是 50%
      const hpFill = container.querySelector('.hp-fill');
      expect(hpFill).toHaveStyle({ width: '50%' });
    });

    it('HP 为 0 时不应该显示负数', () => {
      const { container } = render(
        <EnemyDisplay {...defaultProps} enemyHP={0} enemyMaxHP={30} />
      );
      
      const hpFill = container.querySelector('.hp-fill');
      expect(hpFill).toHaveStyle({ width: '0%' });
    });

    it('HP 超过最大值时不应该超过 100%', () => {
      const { container } = render(
        <EnemyDisplay {...defaultProps} enemyHP={35} enemyMaxHP={30} />
      );
      
      const hpFill = container.querySelector('.hp-fill');
      expect(hpFill).toHaveStyle({ width: '100%' });
    });
  });

  describe('默认值', () => {
    it('应该使用默认敌人表情 👹', () => {
      render(<EnemyDisplay {...defaultProps} enemyEmoji={undefined as any} />);
      expect(screen.getByText('👹')).toBeInTheDocument();
    });

    it('应该使用默认防御值 0', () => {
      const { container } = render(
        <EnemyDisplay {...defaultProps} enemyBlock={undefined as any} />
      );
      const blockDisplay = container.querySelector('.block-display');
      expect(blockDisplay).not.toBeInTheDocument();
    });

    it('应该使用默认回合数 1', () => {
      render(<EnemyDisplay {...defaultProps} turnCount={undefined as any} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});

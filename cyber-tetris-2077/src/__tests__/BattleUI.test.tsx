/**
 * BattleUI 组件测试
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BattleUI from '../components/ui/BattleUI';
import { Card, CardRarity } from '../types/card.v2';
import { CombatPhase } from '../core/CombatManager';

const mockCard: Card = {
  id: 'battle_card_1',
  name: '战斗卡牌',
  cost: 1,
  shape: [[1, 1]],
  rarity: CardRarity.COMMON,
  damage: 5,
  description: '消除1行',
  upgradeLevel: 0,
};

const mockCards: Card[] = [mockCard];

describe('BattleUI', () => {
  it('renders without crashing', () => {
    render(
      <BattleUI
        playerHealth={100}
        playerMaxHealth={100}
        playerShield={0}
        energy={3}
        maxEnergy={3}
        enemyName="测试敌人"
        enemyHealth={50}
        enemyMaxHealth={100}
        enemyAttack={10}
        hand={mockCards}
        combatPhase={CombatPhase.PLAYER_ACTION}
        turnCount={1}
        comboCount={0}
      />
    );
    expect(screen.getByText('玩家')).toBeInTheDocument();
  });

  it('displays player and enemy HP', () => {
    render(
      <BattleUI
        playerHealth={80}
        playerMaxHealth={100}
        playerShield={0}
        energy={3}
        maxEnergy={3}
        enemyName="测试敌人"
        enemyHealth={50}
        enemyMaxHealth={100}
        enemyAttack={10}
        hand={mockCards}
        combatPhase={CombatPhase.PLAYER_ACTION}
        turnCount={1}
        comboCount={0}
      />
    );
    expect(screen.getByText('HP 80/100')).toBeInTheDocument();
    expect(screen.getByText('HP 50/100')).toBeInTheDocument();
  });

  it('displays shield when player has shield', () => {
    render(
      <BattleUI
        playerHealth={80}
        playerMaxHealth={100}
        playerShield={15}
        energy={3}
        maxEnergy={3}
        enemyName="测试敌人"
        enemyHealth={50}
        enemyMaxHealth={100}
        enemyAttack={10}
        hand={mockCards}
        combatPhase={CombatPhase.PLAYER_ACTION}
        turnCount={1}
        comboCount={0}
      />
    );
    expect(screen.getByText(/🛡️15/)).toBeInTheDocument();
  });

  it('displays enemy stun indicator when stunned', () => {
    render(
      <BattleUI
        playerHealth={80}
        playerMaxHealth={100}
        playerShield={0}
        energy={3}
        maxEnergy={3}
        enemyName="测试敌人"
        enemyHealth={50}
        enemyMaxHealth={100}
        enemyAttack={10}
        enemyIsStunned={true}
        hand={mockCards}
        combatPhase={CombatPhase.PLAYER_ACTION}
        turnCount={1}
        comboCount={0}
      />
    );
    expect(screen.getByText('敌人已暂停')).toBeInTheDocument();
  });

  it('shows end turn button during player action', () => {
    render(
      <BattleUI
        playerHealth={80}
        playerMaxHealth={100}
        playerShield={0}
        energy={3}
        maxEnergy={3}
        enemyName="测试敌人"
        enemyHealth={50}
        enemyMaxHealth={100}
        enemyAttack={10}
        hand={mockCards}
        combatPhase={CombatPhase.PLAYER_ACTION}
        turnCount={1}
        comboCount={0}
      />
    );
    expect(screen.getByText('结束回合')).toBeInTheDocument();
  });

  it('calls onEndTurn when end turn button is clicked', () => {
    const mockOnEndTurn = jest.fn();
    render(
      <BattleUI
        playerHealth={80}
        playerMaxHealth={100}
        playerShield={0}
        energy={3}
        maxEnergy={3}
        enemyName="测试敌人"
        enemyHealth={50}
        enemyMaxHealth={100}
        enemyAttack={10}
        hand={mockCards}
        combatPhase={CombatPhase.PLAYER_ACTION}
        turnCount={1}
        comboCount={0}
        onEndTurn={mockOnEndTurn}
      />
    );

    const endTurnButton = screen.getByText('结束回合');
    fireEvent.click(endTurnButton);
    expect(mockOnEndTurn).toHaveBeenCalled();
  });

  it('displays combo count when combo is active', () => {
    render(
      <BattleUI
        playerHealth={80}
        playerMaxHealth={100}
        playerShield={0}
        energy={3}
        maxEnergy={3}
        enemyName="测试敌人"
        enemyHealth={50}
        enemyMaxHealth={100}
        enemyAttack={10}
        hand={mockCards}
        combatPhase={CombatPhase.PLAYER_ACTION}
        turnCount={1}
        comboCount={5}
      />
    );
    expect(screen.getByText('🔥 连击 x5')).toBeInTheDocument();
  });

  it('shows victory overlay when victory phase', () => {
    render(
      <BattleUI
        playerHealth={80}
        playerMaxHealth={100}
        playerShield={0}
        energy={3}
        maxEnergy={3}
        enemyName="测试敌人"
        enemyHealth={0}
        enemyMaxHealth={100}
        enemyAttack={10}
        hand={mockCards}
        combatPhase={CombatPhase.VICTORY}
        turnCount={1}
        comboCount={0}
      />
    );
    expect(screen.getByText('🎉 胜利！')).toBeInTheDocument();
  });

  it('shows defeat overlay when defeat phase', () => {
    render(
      <BattleUI
        playerHealth={0}
        playerMaxHealth={100}
        playerShield={0}
        energy={3}
        maxEnergy={3}
        enemyName="测试敌人"
        enemyHealth={50}
        enemyMaxHealth={100}
        enemyAttack={10}
        hand={mockCards}
        combatPhase={CombatPhase.DEFEAT}
        turnCount={1}
        comboCount={0}
      />
    );
    expect(screen.getByText('💀 失败')).toBeInTheDocument();
  });
});

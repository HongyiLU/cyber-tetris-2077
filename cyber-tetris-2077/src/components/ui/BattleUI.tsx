/**
 * @fileoverview 战斗界面组件 v2.0.0 Phase 4
 * 整合战斗中的所有UI元素，支持伤害数字动画
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../../types/card.v2';
import { CombatPhase } from '../../core/CombatManager';
import HandDisplay from './HandDisplay';
import './BattleUI.css';

/**
 * 伤害数字类型
 */
interface DamageNumber {
  id: number;
  value: number;
  isPlayer: boolean;
}

/**
 * BattleUI Props
 */
export interface BattleUIProps {
  // 玩家状态
  playerHealth: number;
  playerMaxHealth: number;
  playerShield: number;
  energy: number;
  maxEnergy: number;

  // 敌人状态
  enemyName?: string;
  enemyHealth?: number;
  enemyMaxHealth?: number;
  enemyAttack?: number;
  enemyIsStunned?: boolean;

  // 手牌
  hand: Card[];

  // 战斗状态
  combatPhase: CombatPhase;
  turnCount: number;
  comboCount: number;

  // 动作回调
  onCardPlay?: (card: Card, linesCleared: number) => void;
  onEndTurn?: () => void;

  // 游戏状态
  onVictory?: () => void;
  onDefeat?: () => void;

  // 外部伤害数字（可选）
  damageNumbers?: DamageNumber[];
}

/**
 * 战斗界面组件
 */
const BattleUI: React.FC<BattleUIProps> = ({
  playerHealth,
  playerMaxHealth,
  playerShield,
  energy,
  maxEnergy,
  enemyName = '敌人',
  enemyHealth = 100,
  enemyMaxHealth = 100,
  enemyAttack = 10,
  enemyIsStunned = false,
  hand,
  combatPhase,
  turnCount,
  comboCount,
  onCardPlay,
  onEndTurn,
  onVictory,
  onDefeat,
  damageNumbers: externalDamageNumbers,
}) => {
  // 内部伤害数字状态
  const [internalDamageNumbers, setInternalDamageNumbers] = useState<DamageNumber[]>([]);

  // 使用外部或内部的伤害数字
  const displayDamageNumbers = externalDamageNumbers ?? internalDamageNumbers;

  // 是否显示结束回合按钮
  const canEndTurn = combatPhase === CombatPhase.PLAYER_ACTION;
  const isBattleOver =
    combatPhase === CombatPhase.VICTORY || combatPhase === CombatPhase.DEFEAT;
  const isWaiting =
    combatPhase === CombatPhase.PLAYER_TURN_END ||
    combatPhase === CombatPhase.ENEMY_TURN;

  /**
   * 处理卡牌点击
   */
  const handleCardClick = useCallback(
    (card: Card) => {
      // 计算消行数（基于卡牌形状）
      const linesCleared = card.shape?.length || 1;
      onCardPlay?.(card, linesCleared);
    },
    [onCardPlay]
  );

  /**
   * 处理结束回合
   */
  const handleEndTurn = useCallback(() => {
    onEndTurn?.();
  }, [onEndTurn]);

  // 监听战斗结束
  useEffect(() => {
    if (combatPhase === CombatPhase.VICTORY) {
      onVictory?.();
    } else if (combatPhase === CombatPhase.DEFEAT) {
      onDefeat?.();
    }
  }, [combatPhase, onVictory, onDefeat]);

  // 计算HP百分比
  const playerHealthPercent = (playerHealth / playerMaxHealth) * 100;
  const enemyHealthPercent = enemyMaxHealth > 0 
    ? (enemyHealth / enemyMaxHealth) * 100 
    : 0;

  // 获取阶段显示文本
  const getPhaseText = () => {
    switch (combatPhase) {
      case CombatPhase.PLAYER_TURN_START:
        return '回合开始';
      case CombatPhase.PLAYER_ACTION:
        return '你的回合';
      case CombatPhase.PLAYER_TURN_END:
        return '回合结束';
      case CombatPhase.ENEMY_TURN:
        return '敌人回合';
      case CombatPhase.VICTORY:
        return '胜利！';
      case CombatPhase.DEFEAT:
        return '失败...';
      default:
        return '';
    }
  };

  return (
    <div className="battle-ui">
      {/* 顶部状态栏 */}
      <div className="battle-ui__top-bar">
        {/* 玩家状态 */}
        <div className="battle-ui__player-status">
          <div className="battle-ui__status-header">
            <span className="battle-ui__status-label">玩家</span>
            <span className="battle-ui__status-info">
              HP {playerHealth}/{playerMaxHealth}
              {playerShield > 0 && (
                <span className="battle-ui__shield">🛡️{playerShield}</span>
              )}
            </span>
          </div>
          <div className="battle-ui__health-bar">
            <div
              className="battle-ui__health-fill battle-ui__health-fill--player"
              style={{ width: `${playerHealthPercent}%` }}
            />
          </div>
        </div>

        {/* 回合信息 */}
        <div className="battle-ui__turn-info">
          <div className="battle-ui__turn-count">第 {turnCount} 回合</div>
          <div className="battle-ui__phase">{getPhaseText()}</div>
          {comboCount > 0 && (
            <div className="battle-ui__combo">🔥 连击 x{comboCount}</div>
          )}
        </div>

        {/* 敌人状态 */}
        <div className="battle-ui__enemy-status">
          <div className="battle-ui__status-header">
            <span className="battle-ui__status-label">
              {enemyIsStunned && '⏸️'}
              {enemyName}
            </span>
            <span className="battle-ui__status-info">
              HP {enemyHealth}/{enemyMaxHealth}
            </span>
          </div>
          <div className="battle-ui__health-bar">
            <div
              className="battle-ui__health-fill battle-ui__health-fill--enemy"
              style={{ width: `${enemyHealthPercent}%` }}
            />
          </div>
          {enemyIsStunned && (
            <div className="battle-ui__stun-indicator">敌人已暂停</div>
          )}
        </div>
      </div>

      {/* 战斗区域 */}
      <div className="battle-ui__battle-area">
        <div className="battle-ui__enemy-zone">
          {/* 敌人攻击指示器 */}
          {combatPhase === CombatPhase.ENEMY_TURN && (
            <div className="battle-ui__attack-indicator">
              <div className="battle-ui__attack-arrow">
                ⚔️ {enemyAttack}
              </div>
            </div>
          )}
        </div>

        {/* 伤害数字 */}
        {displayDamageNumbers.map((dn) => (
          <div
            key={dn.id}
            className={`battle-ui__damage-number ${
              dn.isPlayer
                ? 'battle-ui__damage-number--player'
                : 'battle-ui__damage-number--enemy'
            }`}
          >
            -{dn.value}
          </div>
        ))}

        {/* 战斗结束遮罩 */}
        {isBattleOver && (
          <div
            className={`battle-ui__game-over ${
              combatPhase === CombatPhase.VICTORY
                ? 'battle-ui__game-over--victory'
                : 'battle-ui__game-over--defeat'
            }`}
          >
            <div className="battle-ui__game-over-text">
              {combatPhase === CombatPhase.VICTORY ? '🎉 胜利！' : '💀 失败'}
            </div>
          </div>
        )}
      </div>

      {/* 底部手牌区域 */}
      <div className="battle-ui__bottom-area">
        {/* 结束回合按钮 */}
        {canEndTurn && (
          <button
            className="battle-ui__end-turn-btn"
            onClick={handleEndTurn}
          >
            结束回合
          </button>
        )}

        {/* 手牌展示 */}
        <HandDisplay
          cards={hand}
          energy={energy}
          maxEnergy={maxEnergy}
          onCardClick={handleCardClick}
          disabled={!canEndTurn}
          isWaiting={isWaiting}
        />
      </div>
    </div>
  );
};

export default BattleUI;

// ==================== CombatUI - 战斗 UI 整合组件 ====================
// v2.0.0 Day 5 - UI 集成

import React from 'react';
import { CombatState } from '../../core/CombatManager';
import { HandUI } from './HandUI';
import type { CardData } from '../../types';
import './CombatUI.css';

interface CombatUIProps {
  /** 玩家当前血量 */
  playerHP: number;
  /** 玩家最大血量 */
  playerMaxHP: number;
  /** 玩家当前防御 */
  playerBlock?: number;
  /** 敌人当前血量 */
  enemyHP: number;
  /** 敌人最大血量 */
  enemyMaxHP: number;
  /** 敌人当前防御 */
  enemyBlock?: number;
  /** 敌人名称 */
  enemyName?: string;
  /** 敌人表情符号 */
  enemyEmoji?: string;
  /** 当前战斗状态 */
  combatState: CombatState;
  /** 当前手牌 */
  hand: CardData[];
  /** 当前能量 */
  energy: number;
  /** 最大能量 */
  maxEnergy: number;
  /** 回合数 */
  turnCount?: number;
  /** 出牌回调 */
  onCardPlay: (handIndex: number) => void;
  /** 结束回合回调 */
  onEndTurn: () => void;
  /** 卡牌详细数据映射 */
  cardDetails?: Map<string, { cost: number; damage: number; block: number }>;
}

export const CombatUI: React.FC<CombatUIProps> = ({
  playerHP,
  playerMaxHP,
  playerBlock = 0,
  enemyHP,
  enemyMaxHP,
  enemyBlock = 0,
  enemyName = '敌人',
  enemyEmoji = '👹',
  combatState,
  hand,
  energy,
  maxEnergy,
  turnCount = 1,
  onCardPlay,
  onEndTurn,
  cardDetails,
}) => {
  // 计算血量百分比
  const playerHpPercent = Math.max(0, Math.min(100, (playerHP / playerMaxHP) * 100));
  const enemyHpPercent = Math.max(0, Math.min(100, (enemyHP / enemyMaxHP) * 100));

  // 判断回合状态
  const isPlayerTurn = combatState === CombatState.PLAYER_TURN;
  const isEnemyTurn = combatState === CombatState.ENEMY_TURN;
  const isResolving = combatState === CombatState.RESOLVING;
  const isVictory = combatState === CombatState.VICTORY;
  const isDefeat = combatState === CombatState.DEFEAT;
  const isIdle = combatState === CombatState.IDLE;

  // 获取回合指示器文本
  const getTurnIndicator = (): string => {
    switch (combatState) {
      case CombatState.PLAYER_TURN:
        return '🟢 你的回合';
      case CombatState.ENEMY_TURN:
        return '🔴 敌人回合';
      case CombatState.RESOLVING:
        return '⚙️ 结算中...';
      case CombatState.VICTORY:
        return '✨ 胜利!';
      case CombatState.DEFEAT:
        return '💀 失败...';
      default:
        return '⏸️ 等待中';
    }
  };

  // 获取回合指示器样式类
  const getTurnIndicatorClass = (): string => {
    switch (combatState) {
      case CombatState.PLAYER_TURN:
        return 'turn-indicator player-turn';
      case CombatState.ENEMY_TURN:
        return 'turn-indicator enemy-turn';
      case CombatState.VICTORY:
        return 'turn-indicator victory-turn';
      case CombatState.DEFEAT:
        return 'turn-indicator defeat-turn';
      default:
        return 'turn-indicator';
    }
  };

  return (
    <div className="combat-ui">
      {/* 顶部：回合指示器和回合计数 */}
      <div className="combat-header">
        <div className={getTurnIndicatorClass()}>
          <span className="turn-indicator-icon">
            {combatState === CombatState.PLAYER_TURN && '⚡'}
            {combatState === CombatState.ENEMY_TURN && '💢'}
            {combatState === CombatState.RESOLVING && '⚙️'}
            {combatState === CombatState.VICTORY && '✨'}
            {combatState === CombatState.DEFEAT && '💀'}
            {combatState === CombatState.IDLE && '⏸️'}
          </span>
          <span className="turn-indicator-text">{getTurnIndicator()}</span>
        </div>
        <div className="turn-counter">
          <span className="turn-label">回合</span>
          <span className="turn-value">{turnCount}</span>
        </div>
      </div>

      {/* 中间：玩家和敌人信息面板 */}
      <div className="combat-middle">
        {/* 左侧：玩家信息 */}
        <div className="player-panel">
          <div className="panel-header">
            <span className="player-icon">👤</span>
            <span className="character-name">玩家</span>
          </div>
          <div className="hp-section">
            <div className="hp-label-row">
              <span className="hp-label">HP</span>
              <span className="hp-numbers">
                <span className="hp-current">{playerHP}</span>
                <span className="hp-separator">/</span>
                <span className="hp-max">{playerMaxHP}</span>
              </span>
            </div>
            <div className="hp-bar">
              <div
                className="hp-fill player-hp"
                style={{ width: `${playerHpPercent}%` }}
              />
            </div>
          </div>
          {/* 防御值显示 */}
          {playerBlock > 0 && (
            <div className="block-display">
              <span className="block-icon">🛡️</span>
              <span className="block-value">{playerBlock}</span>
            </div>
          )}
        </div>

        {/* 中间：VS 分隔符 */}
        <div className="vs-divider">
          <div className="vs-line" />
          <span className="vs-text">VS</span>
          <div className="vs-line" />
        </div>

        {/* 右侧：敌人信息 */}
        <div className="enemy-panel">
          <div className="panel-header">
            <span className="character-name">{enemyName}</span>
            <span className="enemy-icon">{enemyEmoji}</span>
          </div>
          <div className="hp-section">
            <div className="hp-label-row">
              <span className="hp-label">HP</span>
              <span className="hp-numbers">
                <span className="hp-current">{enemyHP}</span>
                <span className="hp-separator">/</span>
                <span className="hp-max">{enemyMaxHP}</span>
              </span>
            </div>
            <div className="hp-bar">
              <div
                className="hp-fill enemy-hp"
                style={{ width: `${enemyHpPercent}%` }}
              />
            </div>
          </div>
          {/* 敌人防御值显示 */}
          {enemyBlock > 0 && (
            <div className="block-display enemy-block">
              <span className="block-icon">🛡️</span>
              <span className="block-value">{enemyBlock}</span>
            </div>
          )}
        </div>
      </div>

      {/* 战斗状态消息 */}
      {(isEnemyTurn || isResolving) && (
        <div className="combat-status-message enemy-acting">
          <span className="status-icon">💢</span>
          <span className="status-text">
            {isResolving ? '敌人行动中...' : '敌人准备攻击!'}
          </span>
        </div>
      )}

      {isVictory && (
        <div className="combat-status-message victory-message">
          <span className="status-icon">✨</span>
          <span className="status-text">战斗胜利!</span>
        </div>
      )}

      {isDefeat && (
        <div className="combat-status-message defeat-message">
          <span className="status-icon">💀</span>
          <span className="status-text">战斗失败...</span>
        </div>
      )}

      {/* 底部：手牌 UI（仅玩家回合显示） */}
      {isPlayerTurn && (
        <div className="combat-hand-area">
          <HandUI
            hand={hand}
            energy={energy}
            maxEnergy={maxEnergy}
            onCardClick={onCardPlay}
            disabled={!isPlayerTurn}
            cardDetails={cardDetails}
          />
          {/* 结束回合按钮 */}
          <button
            className="end-turn-btn"
            onClick={onEndTurn}
            disabled={!isPlayerTurn}
          >
            <span className="btn-icon">⏭️</span>
            <span className="btn-text">结束回合</span>
          </button>
        </div>
      )}

      {/* 战斗结束遮罩 */}
      {(isVictory || isDefeat) && (
        <div className={`combat-end-overlay ${isVictory ? 'victory' : 'defeat'}`}>
          <div className="end-overlay-content">
            <span className="end-icon">
              {isVictory ? '🏆' : '💀'}
            </span>
            <span className="end-text">
              {isVictory ? '胜利!' : '失败'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombatUI;

import React from 'react';
import { BattleState } from '../../types';
import './BattleUI.css';

interface BattleUIProps {
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  battleState: BattleState;
  enemyName?: string;
}

export const BattleUI: React.FC<BattleUIProps> = ({
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  battleState,
  enemyName = '史莱姆',
}) => {
  const playerPercent = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));
  const enemyPercent = Math.max(0, Math.min(100, (enemyHp / enemyMaxHp) * 100));

  const isFighting = battleState === BattleState.FIGHTING;
  const isWon = battleState === BattleState.WON;
  const isLost = battleState === BattleState.LOST;

  return (
    <div className="battle-ui">
      {/* 顶部血量条区域 */}
      <div className="battle-top-bar">
        {/* 玩家血量（左侧） */}
        <div className="hp-section player-section">
          <div className="section-header">
            <span className="player-icon">👤</span>
            <span className="character-name player-name">玩家</span>
          </div>
          <div className="hp-bar-container">
            <div className="hp-bar player">
              <div 
                className="hp-fill" 
                style={{ width: `${playerPercent}%` }}
              />
            </div>
            <span className="hp-text">{playerHp}/{playerMaxHp}</span>
          </div>
        </div>

        {/* VS 分隔符 */}
        <div className="vs-divider">
          <span className="vs-text">VS</span>
        </div>

        {/* 敌人血量（右侧） */}
        <div className="hp-section enemy-section">
          <div className="section-header">
            <span className="character-name enemy-name">{enemyName}</span>
            <span className="enemy-icon">🦠</span>
          </div>
          <div className="hp-bar-container">
            <div className="hp-bar enemy">
              <div 
                className="hp-fill" 
                style={{ width: `${enemyPercent}%` }}
              />
            </div>
            <span className="hp-text">{enemyHp}/{enemyMaxHp}</span>
          </div>
        </div>
      </div>

      {/* 战斗状态提示（居中，不遮挡棋盘） */}
      {isFighting && (
        <div className="battle-status fighting">
          <div className="status-icon">⚔️</div>
          <div className="status-text">战斗中!</div>
        </div>
      )}
      
      {isWon && (
        <div className="battle-result victory">
          <div className="result-icon">✨</div>
          <div className="result-text">胜利!</div>
        </div>
      )}
      
      {isLost && (
        <div className="battle-result defeat">
          <div className="result-icon">💀</div>
          <div className="result-text">失败!</div>
        </div>
      )}
    </div>
  );
};

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
  const playerPercent = (playerHp / playerMaxHp) * 100;
  const enemyPercent = (enemyHp / enemyMaxHp) * 100;

  return (
    <div className="battle-ui">
      {/* 玩家血量条 */}
      <div className="hp-section player-section">
        <div className="character-name">玩家</div>
        <div className="hp-bar player">
          <div 
            className="hp-fill" 
            style={{ width: `${playerPercent}%` }}
          />
          <span className="hp-text">{playerHp}/{playerMaxHp}</span>
        </div>
      </div>
      
      {/* 敌人显示 */}
      <div className="enemy-display">
        <div className="enemy-avatar">🦠</div>
        <div className="enemy-info">
          <div className="character-name">{enemyName}</div>
          <div className="hp-bar enemy">
            <div 
              className="hp-fill" 
              style={{ width: `${enemyPercent}%` }}
            />
            <span className="hp-text">{enemyHp}/{enemyMaxHp}</span>
          </div>
        </div>
      </div>
      
      {/* 战斗状态提示 */}
      {battleState === BattleState.WON && (
        <div className="battle-result victory">
          ✨ 胜利!
        </div>
      )}
      {battleState === BattleState.LOST && (
        <div className="battle-result defeat">
          💀 失败!
        </div>
      )}
    </div>
  );
};

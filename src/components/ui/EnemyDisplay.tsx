// ==================== EnemyDisplay - 敌人显示组件 ====================
// v2.0.0 Day 8 - 深度集成

import React, { useState, useEffect, useRef } from 'react';
import { CombatState } from '../../core/CombatManager';
import './EnemyDisplay.css';

interface EnemyDisplayProps {
  /** 敌人名称 */
  enemyName: string;
  /** 敌人当前 HP */
  enemyHP: number;
  /** 敌人最大 HP */
  enemyMaxHP: number;
  /** 敌人防御值 */
  enemyBlock?: number;
  /** 敌人表情符号 */
  enemyEmoji?: string;
  /** 敌人攻击力 */
  enemyAttack?: number;
  /** 当前战斗状态 */
  combatState: CombatState;
  /** 回合数 */
  turnCount?: number;
  /** 敌人是否在攻击动画中 */
  isAttacking?: boolean;
}

export const EnemyDisplay: React.FC<EnemyDisplayProps> = ({
  enemyName,
  enemyHP,
  enemyMaxHP,
  enemyBlock = 0,
  enemyEmoji = '👹',
  enemyAttack = 0,
  combatState,
  turnCount = 1,
  isAttacking = false,
}) => {
  // 攻击动画状态
  const [attacking, setAttacking] = useState(false);
  
  // 伤害闪红效果
  const [damaged, setDamaged] = useState(false);
  
  // P0-1 Fix: 使用 useRef 保存上一帧 HP 值，而非每次渲染创建新 state
  const prevHPRef = useRef(enemyHP);
  
  // 监听攻击状态变化
  useEffect(() => {
    if (isAttacking) {
      setAttacking(true);
      const timer = setTimeout(() => setAttacking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAttacking]);

  // 监听 HP 变化（当敌人受到伤害时触发闪红效果）
  useEffect(() => {
    if (enemyHP < prevHPRef.current) {
      setDamaged(true);
      const timer = setTimeout(() => setDamaged(false), 300);
      return () => clearTimeout(timer);
    }
    // 更新 ref 为当前 HP（下次比较时使用）
    prevHPRef.current = enemyHP;
  }, [enemyHP]);

  // 计算 HP 百分比
  const hpPercent = Math.max(0, Math.min(100, (enemyHP / enemyMaxHP) * 100));
  
  // 判断回合状态
  const isEnemyTurn = combatState === CombatState.ENEMY_TURN;
  const isResolving = combatState === CombatState.RESOLVING;
  const isVictory = combatState === CombatState.VICTORY;
  const isDefeat = combatState === CombatState.DEFEAT;

  return (
    <div className={`enemy-display ${attacking ? 'attacking' : ''} ${damaged ? 'damaged' : ''}`}>
      {/* 顶部信息栏 */}
      <div className="enemy-header">
        <div className="enemy-info">
          <span className="enemy-emoji">{enemyEmoji}</span>
          <span className="enemy-name">{enemyName}</span>
        </div>
        
        {/* 回合计数 */}
        <div className="turn-badge">
          <span className="turn-label">回合</span>
          <span className="turn-number">{turnCount}</span>
        </div>
      </div>

      {/* HP 条 */}
      <div className="enemy-hp-section">
        <div className="hp-label-row">
          <span className="hp-icon">❤️</span>
          <span className="hp-text">HP</span>
          <span className="hp-numbers">
            <span className="hp-current">{enemyHP}</span>
            <span className="hp-separator">/</span>
            <span className="hp-max">{enemyMaxHP}</span>
          </span>
        </div>
        <div className="hp-bar">
          <div 
            className="hp-fill enemy-hp" 
            style={{ width: `${hpPercent}%` }}
          />
          {/* HP 减少动画指示 */}
          {hpPercent < 100 && (
            <div 
              className="hp-damage-indicator"
              style={{ left: `${hpPercent}%` }}
            />
          )}
        </div>
      </div>

      {/* 防御值显示 */}
      {enemyBlock > 0 && (
        <div className="block-display enemy-block">
          <span className="block-icon">🛡️</span>
          <span className="block-value">{enemyBlock}</span>
        </div>
      )}

      {/* 敌人状态指示 */}
      <div className="enemy-status">
        {isEnemyTurn && (
          <div className="status-indicator enemy-turn">
            <span className="status-icon">💢</span>
            <span className="status-text">准备攻击!</span>
          </div>
        )}
        {isResolving && (
          <div className="status-indicator resolving">
            <span className="status-icon">⚙️</span>
            <span className="status-text">行动中...</span>
          </div>
        )}
        {isVictory && (
          <div className="status-indicator victory">
            <span className="status-icon">✨</span>
            <span className="status-text">击败!</span>
          </div>
        )}
        {isDefeat && (
          <div className="status-indicator defeat">
            <span className="status-icon">💀</span>
            <span className="status-text">战败...</span>
          </div>
        )}
      </div>

      {/* 攻击动画覆盖层 */}
      {attacking && (
        <div className="attack-animation">
          <span className="attack-text">攻击!</span>
        </div>
      )}
    </div>
  );
};

export default EnemyDisplay;

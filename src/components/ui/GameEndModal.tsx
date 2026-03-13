// ==================== 游戏结束弹窗组件 ====================

import React from 'react';
import './GameEndModal.css';

interface GameEndModalProps {
  /** 是否可见 */
  visible: boolean;
  /** 游戏得分 */
  score: number;
  /** 消除行数 */
  lines: number;
  /** 连击数 */
  combo?: number;
  /** 最大连击 */
  maxCombo?: number;
  /** 重新挑战回调 */
  onRestart: () => void;
  /** 返回标题页回调 */
  onBackToTitle: () => void;
  /** 挑战下一关卡回调 */
  onNextLevel?: () => void;
  /** 战斗胜利状态 */
  isVictory?: boolean;
  /** 敌人名称 */
  enemyName?: string;
  /** 是否为最终 BOSS */
  isFinalBoss?: boolean;
}

const GameEndModal: React.FC<GameEndModalProps> = ({
  visible,
  score,
  lines,
  combo = 0,
  maxCombo = 0,
  onRestart,
  onBackToTitle,
  onNextLevel,
  isVictory = false,
  enemyName,
  isFinalBoss = false,
}) => {
  if (!visible) return null;

  return (
    <div className="game-end-modal-overlay">
      <div className="game-end-modal-content">
        {/* 标题 */}
        <div className="game-end-modal-header">
          <h2 className={`game-end-modal-title ${isVictory ? '' : 'game-over'}`}>
            {isVictory ? '🎉 战斗胜利!' : '💀 游戏结束'}
          </h2>
          <p className="game-end-modal-subtitle">
            {isVictory && enemyName ? `恭喜击败 ${enemyName}!` : isVictory ? '恭喜击败敌人!' : '再接再厉，下次一定行!'}
          </p>
        </div>

        {/* 统计信息 */}
        <div className="game-end-modal-stats">
          {/* 得分 */}
          <div className="game-end-modal-stat-row">
            <span className="game-end-modal-stat-label">
              🎯 得分
            </span>
            <span className="game-end-modal-stat-value">
              {score.toLocaleString()}
            </span>
          </div>

          {/* 消除行数 */}
          <div className="game-end-modal-stat-row">
            <span className="game-end-modal-stat-label">
              📊 消除行数
            </span>
            <span className="game-end-modal-stat-value lines">
              {lines}
            </span>
          </div>

          {/* 连击信息 (如果有) */}
          {maxCombo > 1 && (
            <div className="game-end-modal-stat-row">
              <span className="game-end-modal-stat-label">
                🔥 最大连击
              </span>
              <span className="game-end-modal-stat-value combo">
                {maxCombo}x
              </span>
            </div>
          )}
        </div>

        {/* 按钮组 */}
        <div className="game-end-modal-buttons">
          {/* 重新挑战/挑战下一关按钮 */}
          <button
            onClick={!isVictory ? onRestart : onNextLevel}
            className="game-end-modal-btn"
          >
            {!isVictory ? '🔄 再次挑战' : '⚔️ 挑战下一怪物'}
          </button>

          {/* 回到标题页按钮 */}
          <button
            onClick={onBackToTitle}
            className="game-end-modal-btn back"
          >
            🏠 回到标题页
          </button>
        </div>

        {/* 赛博朋克风格装饰角标 */}
        <div className="game-end-modal-corner top-left" />
        <div className="game-end-modal-corner top-right" />
        <div className="game-end-modal-corner bottom-left" />
        <div className="game-end-modal-corner bottom-right" />
      </div>
    </div>
  );
};

export default GameEndModal;

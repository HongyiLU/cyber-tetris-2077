// ==================== 游戏结束弹窗组件 ====================

import React from 'react';
import './GameEndModal.css';
import type { GameEndResult } from '../../types/game';

interface GameEndModalProps {
  /** 是否可见 */
  visible: boolean;
  /** 游戏结束结果 */
  result: GameEndResult | null;
  /** 重新挑战回调 */
  onRetry: () => void;
  /** 挑战下一关卡回调（仅胜利时） */
  onNextLevel?: () => void;
  /** 返回标题页回调 */
  onBackToTitle: () => void;
}

/**
 * 格式化时间为 MM:SS 格式
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const GameEndModal: React.FC<GameEndModalProps> = ({
  visible,
  result,
  onRetry,
  onNextLevel,
  onBackToTitle,
}) => {
  if (!visible || !result) return null;

  const { isVictory, stats, enemyName, isFinalBoss, reason } = result;

  return (
    <div className="game-end-modal-overlay">
      <div className="game-end-modal-content">
        {/* 标题 */}
        <div className="game-end-modal-header">
          <h2 className={`game-end-modal-title ${isVictory ? '' : 'game-over'}`}>
            {isVictory ? '🎉 战斗胜利!' : '💀 游戏结束'}
          </h2>
          <p className="game-end-modal-subtitle">
            {isVictory 
              ? (enemyName ? `击败 ${enemyName}!` : '恭喜获胜!') 
              : (reason || '再接再厉，下次一定行!')}
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
              {stats.score.toLocaleString()}
            </span>
          </div>

          {/* 消除行数 */}
          <div className="game-end-modal-stat-row">
            <span className="game-end-modal-stat-label">
              📊 消除行数
            </span>
            <span className="game-end-modal-stat-value lines">
              {stats.linesCleared}
            </span>
          </div>

          {/* 游戏时间 */}
          <div className="game-end-modal-stat-row">
            <span className="game-end-modal-stat-label">
              ⏱️ 游戏时间
            </span>
            <span className="game-end-modal-stat-value time">
              {formatTime(stats.time)}
            </span>
          </div>

          {/* 最大连击 */}
          {stats.combos > 1 && (
            <div className="game-end-modal-stat-row">
              <span className="game-end-modal-stat-label">
                🔥 最大连击
              </span>
              <span className="game-end-modal-stat-value combo">
                {stats.combos}x
              </span>
            </div>
          )}
        </div>

        {/* 按钮组 */}
        <div className="game-end-modal-buttons">
          {/* 失败：重新挑战 */}
          {!isVictory && (
            <button
              onClick={onRetry}
              className="game-end-modal-btn"
            >
              🔄 重新挑战
            </button>
          )}

          {/* 胜利：挑战下一关（非最终 BOSS） */}
          {isVictory && !isFinalBoss && onNextLevel && (
            <button
              onClick={onNextLevel}
              className="game-end-modal-btn next"
            >
              ⚔️ 挑战下一关
            </button>
          )}

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

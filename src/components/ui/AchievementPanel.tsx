/**
 * 成就面板组件
 * 展示成就列表和进度
 */

import React from 'react';
import { Achievement, AchievementProgress, CATEGORY_NAMES } from '../../types/achievement';
import { getAllAchievements, getAchievementsByCategory } from '../../config/achievement-config';
import './AchievementPanel.css';

interface AchievementPanelProps {
  progress: AchievementProgress[];
  totalGold: number;
  onClose: () => void;
}

export const AchievementPanel: React.FC<AchievementPanelProps> = ({
  progress,
  totalGold,
  onClose,
}) => {
  const categories: Array<keyof typeof CATEGORY_NAMES> = ['battle', 'combo', 'clear', 'special'];

  // 计算完成度
  const getCompletionRate = () => {
    const total = getAllAchievements().length;
    const completed = progress.filter(p => p.completed).length;
    return Math.round((completed / total) * 100);
  };

  // 获取类别图标
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      battle: '⚔️',
      combo: '🔥',
      clear: '📦',
      special: '⭐',
    };
    return icons[category] || '📋';
  };

  // 渲染单个成就
  const renderAchievement = (achievement: Achievement, prog: AchievementProgress | undefined) => {
    if (!prog) return null;

    const progressPercent = Math.min(100, Math.round((prog.current / prog.target) * 100));

    return (
      <div
        key={achievement.id}
        className={`achievement-card ${prog.completed ? 'completed' : ''}`}
      >
        <div className="achievement-header">
          <span className="achievement-icon">{achievement.icon}</span>
          <div className="achievement-info">
            <h4 className="achievement-name">{achievement.name}</h4>
            <span className="achievement-difficulty">{achievement.difficulty}</span>
          </div>
        </div>

        <p className="achievement-description">{achievement.description}</p>

        <div className="achievement-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="progress-text">
            {prog.current} / {prog.target}
          </span>
        </div>

        {prog.completed && (
          <div className="achievement-reward">
            <span className="reward-icon">💰</span>
            <span className="reward-text">+{achievement.reward.value} 金币</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="achievement-panel-overlay" onClick={onClose}>
      <div className="achievement-panel-modal" onClick={e => e.stopPropagation()}>
        <div className="achievement-panel-header">
          <h2>🏆 成就系统</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* 总览统计 */}
        <div className="achievement-stats">
          <div className="stat-item">
            <span className="stat-value">{getCompletionRate()}%</span>
            <span className="stat-label">完成度</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{progress.filter(p => p.completed).length}</span>
            <span className="stat-label">已解锁</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">💰 {totalGold}</span>
            <span className="stat-label">成就金币</span>
          </div>
        </div>

        {/* 按类别展示 */}
        <div className="achievement-categories">
          {categories.map((category: keyof typeof CATEGORY_NAMES) => {
            const achievements = getAchievementsByCategory(category);
            const categoryProgress = progress.filter(p =>
              achievements.some((a: Achievement) => a.id === p.achievementId)
            );

            return (
              <div key={category} className="category-section">
                <h3 className="category-title">
                  {getCategoryIcon(category)} {CATEGORY_NAMES[category]}
                </h3>
                <div className="achievement-list">
                  {achievements.map((achievement: Achievement) =>
                    renderAchievement(
                      achievement,
                      categoryProgress.find(p => p.achievementId === achievement.id)
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementPanel;

/**
 * 排行榜面板组件
 * 展示排行榜数据
 */

import React, { useState } from 'react';
import { Leaderboard, LeaderboardType } from '../../types/leaderboard';
import { LEADERBOARD_NAMES, LEADERBOARD_ICONS } from '../../types/leaderboard';
import './LeaderboardPanel.css';

interface LeaderboardPanelProps {
  leaderboards: Leaderboard[];
  onClose: () => void;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  leaderboards,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('combo');

  const activeLeaderboard = leaderboards.find(lb => lb.type === activeTab);

  // 格式化数值显示
  const formatValue = (value: number, type: LeaderboardType) => {
    if (type === 'speed') {
      return `${value.toFixed(1)}s`;
    }
    return value.toString();
  };

  // 获取排名样式
  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
  };

  // 获取排名图标
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="leaderboard-panel-overlay" onClick={onClose}>
      <div className="leaderboard-panel-modal" onClick={e => e.stopPropagation()}>
        <div className="leaderboard-panel-header">
          <h2>📊 排行榜</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* 排行榜标签页 */}
        <div className="leaderboard-tabs">
          {(['combo', 'speed', 'score'] as LeaderboardType[]).map(type => (
            <button
              key={type}
              className={`tab ${activeTab === type ? 'active' : ''}`}
              onClick={() => setActiveTab(type)}
            >
              <span className="tab-icon">{LEADERBOARD_ICONS[type]}</span>
              <span className="tab-name">{LEADERBOARD_NAMES[type]}</span>
            </button>
          ))}
        </div>

        {/* 排行榜描述 */}
        {activeLeaderboard && (
          <div className="leaderboard-description">
            <p>{activeLeaderboard.description}</p>
          </div>
        )}

        {/* 排行榜列表 */}
        <div className="leaderboard-list">
          {activeLeaderboard?.entries.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <p>暂无记录</p>
              <p className="empty-hint">成为第一个上榜的玩家！</p>
            </div>
          ) : (
            activeLeaderboard?.entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`leaderboard-entry ${getRankStyle(index + 1)}`}
              >
                <div className="entry-rank">
                  <span className="rank-icon">{getRankIcon(index + 1)}</span>
                </div>

                <div className="entry-info">
                  <span className="entry-player">{entry.playerName}</span>
                  {entry.metadata && (
                    <div className="entry-metadata">
                      {entry.metadata.enemyType && (
                        <span className="metadata-tag">
                          VS {entry.metadata.enemyType}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="entry-value">
                  <span className="value-number">
                    {formatValue(entry.value, activeLeaderboard.type)}
                  </span>
                  <span className="value-unit">{activeLeaderboard.unit}</span>
                </div>

                <div className="entry-date">
                  {formatDate(entry.date)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPanel;

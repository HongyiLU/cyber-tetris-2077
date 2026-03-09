/**
 * 成就解锁通知组件
 * 当玩家解锁成就时显示弹窗通知
 */

import React, { useEffect, useState } from 'react';
import './AchievementNotification.css';

interface AchievementNotificationProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    goldReward: number;
    icon?: string;
  } | null;
  visible: boolean;
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  visible,
  onClose,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible && achievement) {
      setIsAnimating(true);
      
      // M1: 简化定时器逻辑 - 使用单个 setTimeout 触发关闭动画
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, achievement, onClose]);

  // H1: 添加键盘事件监听（Esc 键关闭）
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose]);

  // M1: 使用 CSS transitionend 事件在动画完成后关闭
  const handleTransitionEnd = () => {
    if (!isAnimating && visible) {
      onClose();
    }
  };

  if (!achievement || !visible) return null;

  // H2: 添加 role="alertdialog", aria-modal="true", aria-labelledby
  return (
    <div 
      className={`achievement-notification-overlay ${isAnimating ? 'visible' : ''}`}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="notification-title"
    >
      <div 
        className={`achievement-notification ${isAnimating ? 'slide-in' : 'slide-out'}`}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="notification-header">
          <span className="notification-icon">🏆</span>
          <h3 className="notification-title" id="notification-title">成就解锁!</h3>
        </div>
        
        <div className="notification-content">
          <div className="notification-achievement-icon">
            {achievement.icon || '🏅'}
          </div>
          <div className="notification-achievement-info">
            <h4 className="notification-achievement-name">{achievement.name}</h4>
            <p className="notification-achievement-description">{achievement.description}</p>
            <div className="notification-gold-reward">
              💰 奖励：{achievement.goldReward} 金币
            </div>
          </div>
        </div>

        {/* H3: 关闭按钮已有 aria-label */}
        <button 
          className="notification-close-btn"
          onClick={onClose}
          aria-label="关闭通知"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AchievementNotification;

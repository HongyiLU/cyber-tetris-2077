import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 成就解锁通知组件
 * 当玩家解锁成就时显示弹窗通知
 */
import { useEffect, useState } from 'react';
import './AchievementNotification.css';
export const AchievementNotification = ({ achievement, visible, onClose, }) => {
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
        if (!visible)
            return;
        const handleKeyDown = (event) => {
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
    if (!achievement || !visible)
        return null;
    // H2: 添加 role="alertdialog", aria-modal="true", aria-labelledby
    return (_jsx("div", { className: `achievement-notification-overlay ${isAnimating ? 'visible' : ''}`, role: "alertdialog", "aria-modal": "true", "aria-labelledby": "notification-title", children: _jsxs("div", { className: `achievement-notification ${isAnimating ? 'slide-in' : 'slide-out'}`, onTransitionEnd: handleTransitionEnd, children: [_jsxs("div", { className: "notification-header", children: [_jsx("span", { className: "notification-icon", children: "\uD83C\uDFC6" }), _jsx("h3", { className: "notification-title", id: "notification-title", children: "\u6210\u5C31\u89E3\u9501!" })] }), _jsxs("div", { className: "notification-content", children: [_jsx("div", { className: "notification-achievement-icon", children: achievement.icon || '🏅' }), _jsxs("div", { className: "notification-achievement-info", children: [_jsx("h4", { className: "notification-achievement-name", children: achievement.name }), _jsx("p", { className: "notification-achievement-description", children: achievement.description }), _jsxs("div", { className: "notification-gold-reward", children: ["\uD83D\uDCB0 \u5956\u52B1\uFF1A", achievement.goldReward, " \u91D1\u5E01"] })] })] }), _jsx("button", { className: "notification-close-btn", onClick: onClose, "aria-label": "\u5173\u95ED\u901A\u77E5", children: "\u2715" })] }) }));
};
export default AchievementNotification;

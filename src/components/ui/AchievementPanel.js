import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CATEGORY_NAMES } from '../../types/achievement';
import { getAllAchievements, getAchievementsByCategory } from '../../config/achievement-config';
import './AchievementPanel.css';
export const AchievementPanel = ({ progress, totalGold, onClose, }) => {
    const categories = ['battle', 'combo', 'clear', 'special'];
    // 计算完成度
    const getCompletionRate = () => {
        const total = getAllAchievements().length;
        const completed = progress.filter(p => p.completed).length;
        return Math.round((completed / total) * 100);
    };
    // 获取类别图标
    const getCategoryIcon = (category) => {
        const icons = {
            battle: '⚔️',
            combo: '🔥',
            clear: '📦',
            special: '⭐',
        };
        return icons[category] || '📋';
    };
    // 渲染单个成就
    const renderAchievement = (achievement, prog) => {
        if (!prog)
            return null;
        const progressPercent = Math.min(100, Math.round((prog.current / prog.target) * 100));
        return (_jsxs("div", { className: `achievement-card ${prog.completed ? 'completed' : ''}`, children: [_jsxs("div", { className: "achievement-header", children: [_jsx("span", { className: "achievement-icon", children: achievement.icon }), _jsxs("div", { className: "achievement-info", children: [_jsx("h4", { className: "achievement-name", children: achievement.name }), _jsx("span", { className: "achievement-difficulty", children: achievement.difficulty })] })] }), _jsx("p", { className: "achievement-description", children: achievement.description }), _jsxs("div", { className: "achievement-progress", children: [_jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${progressPercent}%` } }) }), _jsxs("span", { className: "progress-text", children: [prog.current, " / ", prog.target] })] }), prog.completed && (_jsxs("div", { className: "achievement-reward", children: [_jsx("span", { className: "reward-icon", children: "\uD83D\uDCB0" }), _jsxs("span", { className: "reward-text", children: ["+", achievement.reward.value, " \u91D1\u5E01"] })] }))] }, achievement.id));
    };
    return (_jsx("div", { className: "achievement-panel-overlay", onClick: onClose, children: _jsxs("div", { className: "achievement-panel-modal", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "achievement-panel-header", children: [_jsx("h2", { children: "\uD83C\uDFC6 \u6210\u5C31\u7CFB\u7EDF" }), _jsx("button", { className: "close-btn", onClick: onClose, children: "\u2715" })] }), _jsxs("div", { className: "achievement-stats", children: [_jsxs("div", { className: "stat-item", children: [_jsxs("span", { className: "stat-value", children: [getCompletionRate(), "%"] }), _jsx("span", { className: "stat-label", children: "\u5B8C\u6210\u5EA6" })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-value", children: progress.filter(p => p.completed).length }), _jsx("span", { className: "stat-label", children: "\u5DF2\u89E3\u9501" })] }), _jsxs("div", { className: "stat-item", children: [_jsxs("span", { className: "stat-value", children: ["\uD83D\uDCB0 ", totalGold] }), _jsx("span", { className: "stat-label", children: "\u6210\u5C31\u91D1\u5E01" })] })] }), _jsx("div", { className: "achievement-categories", children: categories.map((category) => {
                        const achievements = getAchievementsByCategory(category);
                        const categoryProgress = progress.filter(p => achievements.some((a) => a.id === p.achievementId));
                        return (_jsxs("div", { className: "category-section", children: [_jsxs("h3", { className: "category-title", children: [getCategoryIcon(category), " ", CATEGORY_NAMES[category]] }), _jsx("div", { className: "achievement-list", children: achievements.map((achievement) => renderAchievement(achievement, categoryProgress.find(p => p.achievementId === achievement.id))) })] }, category));
                    }) })] }) }));
};
export default AchievementPanel;

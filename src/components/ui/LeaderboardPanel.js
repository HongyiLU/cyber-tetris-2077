import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 排行榜面板组件
 * 展示排行榜数据
 */
import { useState } from 'react';
import { LEADERBOARD_NAMES, LEADERBOARD_ICONS } from '../../types/leaderboard';
import './LeaderboardPanel.css';
export const LeaderboardPanel = ({ leaderboards, onClose, }) => {
    const [activeTab, setActiveTab] = useState('combo');
    const activeLeaderboard = leaderboards.find(lb => lb.type === activeTab);
    // 格式化数值显示
    const formatValue = (value, type) => {
        if (type === 'speed') {
            return `${value.toFixed(1)}s`;
        }
        return value.toString();
    };
    // 获取排名样式
    const getRankStyle = (rank) => {
        if (rank === 1)
            return 'rank-1';
        if (rank === 2)
            return 'rank-2';
        if (rank === 3)
            return 'rank-3';
        return '';
    };
    // 获取排名图标
    const getRankIcon = (rank) => {
        if (rank === 1)
            return '🥇';
        if (rank === 2)
            return '🥈';
        if (rank === 3)
            return '🥉';
        return `#${rank}`;
    };
    // 格式化日期
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0)
            return '今天';
        if (days === 1)
            return '昨天';
        if (days < 7)
            return `${days}天前`;
        return date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
        });
    };
    return (_jsx("div", { className: "leaderboard-panel-overlay", onClick: onClose, children: _jsxs("div", { className: "leaderboard-panel-modal", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "leaderboard-panel-header", children: [_jsx("h2", { children: "\uD83D\uDCCA \u6392\u884C\u699C" }), _jsx("button", { className: "close-btn", onClick: onClose, children: "\u2715" })] }), _jsx("div", { className: "leaderboard-tabs", children: ['combo', 'speed', 'score'].map(type => (_jsxs("button", { className: `tab ${activeTab === type ? 'active' : ''}`, onClick: () => setActiveTab(type), children: [_jsx("span", { className: "tab-icon", children: LEADERBOARD_ICONS[type] }), _jsx("span", { className: "tab-name", children: LEADERBOARD_NAMES[type] })] }, type))) }), activeLeaderboard && (_jsx("div", { className: "leaderboard-description", children: _jsx("p", { children: activeLeaderboard.description }) })), _jsx("div", { className: "leaderboard-list", children: activeLeaderboard?.entries.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("span", { className: "empty-icon", children: "\uD83D\uDCCB" }), _jsx("p", { children: "\u6682\u65E0\u8BB0\u5F55" }), _jsx("p", { className: "empty-hint", children: "\u6210\u4E3A\u7B2C\u4E00\u4E2A\u4E0A\u699C\u7684\u73A9\u5BB6\uFF01" })] })) : (activeLeaderboard?.entries.map((entry, index) => (_jsxs("div", { className: `leaderboard-entry ${getRankStyle(index + 1)}`, children: [_jsx("div", { className: "entry-rank", children: _jsx("span", { className: "rank-icon", children: getRankIcon(index + 1) }) }), _jsxs("div", { className: "entry-info", children: [_jsx("span", { className: "entry-player", children: entry.playerName }), entry.metadata && (_jsx("div", { className: "entry-metadata", children: entry.metadata.enemyType && (_jsxs("span", { className: "metadata-tag", children: ["VS ", entry.metadata.enemyType] })) }))] }), _jsxs("div", { className: "entry-value", children: [_jsx("span", { className: "value-number", children: formatValue(entry.value, activeLeaderboard.type) }), _jsx("span", { className: "value-unit", children: activeLeaderboard.unit })] }), _jsx("div", { className: "entry-date", children: formatDate(entry.date) })] }, entry.id)))) })] }) }));
};
export default LeaderboardPanel;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './GameEndModal.css';
/**
 * 格式化时间为 MM:SS 格式
 */
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
const GameEndModal = ({ visible, result, onRetry, onNextLevel, onBackToTitle, }) => {
    if (!visible || !result)
        return null;
    const { isVictory, stats, enemyName, isFinalBoss, reason } = result;
    return (_jsx("div", { className: "game-end-modal-overlay", children: _jsxs("div", { className: "game-end-modal-content", children: [_jsxs("div", { className: "game-end-modal-header", children: [_jsx("h2", { className: `game-end-modal-title ${isVictory ? '' : 'game-over'}`, children: isVictory ? '🎉 战斗胜利!' : '💀 游戏结束' }), _jsx("p", { className: "game-end-modal-subtitle", children: isVictory
                                ? (enemyName ? `击败 ${enemyName}!` : '恭喜获胜!')
                                : (reason || '再接再厉，下次一定行!') })] }), _jsxs("div", { className: "game-end-modal-stats", children: [_jsxs("div", { className: "game-end-modal-stat-row", children: [_jsx("span", { className: "game-end-modal-stat-label", children: "\uD83C\uDFAF \u5F97\u5206" }), _jsx("span", { className: "game-end-modal-stat-value", children: stats.score.toLocaleString() })] }), _jsxs("div", { className: "game-end-modal-stat-row", children: [_jsx("span", { className: "game-end-modal-stat-label", children: "\uD83D\uDCCA \u6D88\u9664\u884C\u6570" }), _jsx("span", { className: "game-end-modal-stat-value lines", children: stats.linesCleared })] }), _jsxs("div", { className: "game-end-modal-stat-row", children: [_jsx("span", { className: "game-end-modal-stat-label", children: "\u23F1\uFE0F \u6E38\u620F\u65F6\u95F4" }), _jsx("span", { className: "game-end-modal-stat-value time", children: formatTime(stats.time) })] }), stats.combos > 1 && (_jsxs("div", { className: "game-end-modal-stat-row", children: [_jsx("span", { className: "game-end-modal-stat-label", children: "\uD83D\uDD25 \u6700\u5927\u8FDE\u51FB" }), _jsxs("span", { className: "game-end-modal-stat-value combo", children: [stats.combos, "x"] })] }))] }), _jsxs("div", { className: "game-end-modal-buttons", children: [!isVictory && (_jsx("button", { onClick: onRetry, className: "game-end-modal-btn", children: "\uD83D\uDD04 \u91CD\u65B0\u6311\u6218" })), isVictory && !isFinalBoss && onNextLevel && (_jsx("button", { onClick: onNextLevel, className: "game-end-modal-btn next", children: "\u2694\uFE0F \u6311\u6218\u4E0B\u4E00\u5173" })), _jsx("button", { onClick: onBackToTitle, className: "game-end-modal-btn back", children: "\uD83C\uDFE0 \u56DE\u5230\u6807\u9898\u9875" })] }), _jsx("div", { className: "game-end-modal-corner top-left" }), _jsx("div", { className: "game-end-modal-corner top-right" }), _jsx("div", { className: "game-end-modal-corner bottom-left" }), _jsx("div", { className: "game-end-modal-corner bottom-right" })] }) }));
};
export default GameEndModal;

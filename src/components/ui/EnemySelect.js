import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==================== 敌人选择组件 ====================
import { useState } from 'react';
import { getAllEnemies, getEnemyType } from '../../config/enemy-config';
import './EnemySelect.css';
/**
 * 敌人选择组件
 * 用于在战斗开始前选择敌人
 */
export const EnemySelect = ({ onEnemySelect, selectedEnemyId = 'slime', }) => {
    const [selectedId, setSelectedId] = useState(selectedEnemyId);
    const enemies = getAllEnemies();
    const handleSelect = (enemyId) => {
        setSelectedId(enemyId);
        onEnemySelect(enemyId);
    };
    const getRarityColor = (rarity) => {
        const colors = {
            common: '#888',
            uncommon: '#4caf50',
            rare: '#2196f3',
            epic: '#9c27b0',
            legendary: '#ff9800',
        };
        return colors[rarity] || '#888';
    };
    const selectedEnemy = getEnemyType(selectedId);
    return (_jsxs("div", { className: "enemy-select", children: [selectedEnemy && (_jsxs("div", { className: "selected-enemy-preview", style: {
                    position: 'sticky',
                    top: '0',
                    zIndex: '100',
                    marginBottom: '15px',
                }, children: [_jsx("h4", { style: {
                            margin: '0 0 10px 0',
                            color: '#00ffff',
                            fontFamily: 'Orbitron, monospace',
                            fontSize: '14px',
                        }, children: "\uD83D\uDC46 \u5F53\u524D\u9009\u62E9" }), _jsxs("div", { className: "preview-content", style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '15px',
                            background: 'rgba(0, 255, 255, 0.1)',
                            border: '2px solid #00ffff',
                            borderRadius: '8px',
                            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
                        }, children: [_jsx("span", { className: "preview-emoji", style: {
                                    fontSize: '48px',
                                    lineHeight: '1',
                                }, children: selectedEnemy.emoji }), _jsxs("div", { className: "preview-info", style: {
                                    flex: '1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '5px',
                                }, children: [_jsx("span", { className: "preview-name", style: {
                                            color: '#fff',
                                            fontFamily: 'Orbitron, monospace',
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                        }, children: selectedEnemy.name }), _jsxs("div", { className: "preview-stats", style: {
                                            display: 'flex',
                                            gap: '15px',
                                            fontSize: '14px',
                                            color: '#aaa',
                                        }, children: [_jsxs("span", { children: ["\u2764\uFE0F HP: ", selectedEnemy.hp] }), _jsxs("span", { children: ["\u2694\uFE0F \u4F24\u5BB3\uFF1A", selectedEnemy.attackDamage] }), _jsxs("span", { children: ["\u23F1\uFE0F \u95F4\u9694\uFF1A", selectedEnemy.attackInterval / 1000, "s"] })] }), _jsx("span", { className: "preview-desc", style: {
                                            color: '#888',
                                            fontSize: '12px',
                                            marginTop: '5px',
                                        }, children: selectedEnemy.description })] })] })] })), _jsx("div", { className: "enemy-list", style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                }, children: enemies.map((enemy) => (_jsxs("div", { className: `enemy-card ${selectedId === enemy.id ? 'selected' : ''}`, onClick: () => handleSelect(enemy.id), style: {
                        padding: '15px',
                        background: selectedId === enemy.id
                            ? 'rgba(0, 255, 255, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)',
                        border: selectedId === enemy.id
                            ? '2px solid #00ffff'
                            : '2px solid transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginBottom: '8px',
                    }, children: [_jsxs("div", { className: "enemy-card-header", style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '10px',
                            }, children: [_jsx("span", { className: "enemy-emoji", style: {
                                        fontSize: '32px',
                                        marginRight: '10px',
                                    }, children: enemy.emoji }), _jsx("span", { className: "enemy-rarity", style: {
                                        color: getRarityColor(enemy.rarity),
                                        fontSize: '12px',
                                        fontFamily: 'Orbitron, monospace',
                                        textTransform: 'uppercase',
                                    }, children: enemy.rarity })] }), _jsx("h4", { className: "enemy-name", style: {
                                color: '#fff',
                                fontFamily: 'Orbitron, monospace',
                                fontSize: '16px',
                                margin: '0 0 10px 0',
                            }, children: enemy.name }), _jsxs("div", { className: "enemy-stats", style: {
                                display: 'flex',
                                gap: '15px',
                                fontSize: '13px',
                                color: '#aaa',
                                marginBottom: '8px',
                            }, children: [_jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "\u8840\u91CF\uFF1A" }), _jsx("span", { className: "stat-value", style: { color: '#ff6b6b' }, children: enemy.hp })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "\u4F24\u5BB3\uFF1A" }), _jsx("span", { className: "stat-value", style: { color: '#f39c12' }, children: enemy.attackDamage })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "\u95F4\u9694\uFF1A" }), _jsxs("span", { className: "stat-value", children: [enemy.attackInterval / 1000, "s"] })] })] }), _jsx("p", { className: "enemy-description", style: {
                                color: '#666',
                                fontSize: '12px',
                                margin: '0',
                                lineHeight: '1.4',
                            }, children: enemy.description })] }, enemy.id))) })] }));
};

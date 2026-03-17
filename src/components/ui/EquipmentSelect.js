import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 装备选择组件
 * 允许玩家在战斗前选择装备
 */
import { useState, useEffect } from 'react';
import { RARITY_COLORS } from '../../types/equipment';
import { getEquipmentByType } from '../../config/equipment-config';
import './EquipmentSelect.css';
// M4: 提取效果名称映射到常量
const EFFECT_NAMES = {
    damageBoost: '伤害提升',
    damageReduction: '伤害减免',
    healthBoost: '生命值提升',
    comboBoost: '连击伤害加成',
    comboTimeBoost: '连击时间延长',
    healAura: '每秒治疗',
};
export const EquipmentSelect = ({ onSelect, onClose, selectedEquipment = { head: null, body: null, accessory: null }, unlockedEquipment = [], }) => {
    const [activeTab, setActiveTab] = useState('Head');
    const [hoveredEquipment, setHoveredEquipment] = useState(null);
    // 获取当前标签页的装备列表
    const equipmentList = getEquipmentByType(activeTab);
    // 获取当前槽位已装备的物品 ID
    const getCurrentSlotId = () => {
        return selectedEquipment[activeTab.toLowerCase()];
    };
    // 获取当前装备的详细信息
    const getCurrentEquipment = () => {
        const currentId = getCurrentSlotId();
        if (!currentId)
            return null;
        return equipmentList.find(e => e.id === currentId);
    };
    // 检查装备是否已解锁
    const isUnlocked = (equipmentId) => {
        return unlockedEquipment.includes(equipmentId);
    };
    // 获取稀有度颜色
    const getRarityColor = (rarity) => {
        return RARITY_COLORS[rarity] || '#9CA3AF';
    };
    // 渲染效果描述
    const renderEffect = (effect, idx) => {
        const name = EFFECT_NAMES[effect.type] || effect.type;
        const value = effect.unit === '%' ? `${effect.value}%` :
            effect.unit === 'seconds' ? `+${effect.value}s` :
                `+${effect.value}`;
        return `${name} ${value}`;
    };
    // M4: 简化 compareEffects 函数
    const compareEffects = (currentEffect, newEffect) => {
        if (!currentEffect && !newEffect)
            return null;
        if (!currentEffect && newEffect) {
            return { text: renderEffect(newEffect, 0), color: '#2ecc71' };
        }
        if (currentEffect && !newEffect) {
            return { text: renderEffect(currentEffect, 0), color: '#e74c3c' };
        }
        if (!currentEffect || !newEffect)
            return null;
        const currentValue = currentEffect.value;
        const newValue = newEffect.value;
        if (newValue > currentValue) {
            return { text: renderEffect(newEffect, 0), color: '#2ecc71' };
        }
        else if (newValue < currentValue) {
            return { text: renderEffect(newEffect, 0), color: '#e74c3c' };
        }
        else {
            return { text: renderEffect(newEffect, 0), color: '#95a5a6' };
        }
    };
    // H1: 添加键盘事件监听（Esc 键关闭）
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);
    const currentEquipment = getCurrentEquipment();
    const hoveredEquipmentData = hoveredEquipment ? equipmentList.find(e => e.id === hoveredEquipment) : null;
    return (_jsx("div", { className: "equipment-select-overlay", onClick: onClose, children: _jsxs("div", { className: "equipment-select-modal", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "equipment-select-header", children: [_jsx("h2", { children: "\uD83C\uDF92 \u88C5\u5907\u9009\u62E9" }), _jsx("button", { className: "close-btn", onClick: onClose, "aria-label": "\u5173\u95ED\u88C5\u5907\u9009\u62E9", children: "\u2715" })] }), _jsxs("div", { className: "equipment-tabs", children: [_jsx("button", { className: `tab ${activeTab === 'Head' ? 'active' : ''}`, onClick: () => setActiveTab('Head'), children: "\uD83E\uDE96 \u5934\u90E8" }), _jsx("button", { className: `tab ${activeTab === 'Body' ? 'active' : ''}`, onClick: () => setActiveTab('Body'), children: "\uD83E\uDDBA \u8EAB\u4F53" }), _jsx("button", { className: `tab ${activeTab === 'Accessory' ? 'active' : ''}`, onClick: () => setActiveTab('Accessory'), children: "\uD83D\uDC8D \u9970\u54C1" })] }), hoveredEquipmentData && (_jsxs("div", { className: "equipment-comparison", children: [_jsx("div", { className: "comparison-title", children: "\u2696\uFE0F \u88C5\u5907\u5BF9\u6BD4" }), _jsxs("div", { className: "comparison-content", children: [_jsxs("div", { className: "comparison-column", children: [_jsx("div", { className: "comparison-label", children: "\u5F53\u524D\u88C5\u5907" }), currentEquipment ? (_jsxs("div", { className: "comparison-item", children: [_jsx("div", { className: "comparison-item-name", children: currentEquipment.name }), currentEquipment.effects.map((effect, idx) => (_jsx("div", { className: "comparison-effect", children: renderEffect(effect, idx) }, idx)))] })) : (_jsx("div", { className: "comparison-empty", children: "\u7A7A\u69FD\u4F4D" }))] }), _jsx("div", { className: "comparison-arrow", children: "\u2192" }), _jsxs("div", { className: "comparison-column", children: [_jsx("div", { className: "comparison-label", children: "\u65B0\u88C5\u5907" }), _jsxs("div", { className: "comparison-item", children: [_jsx("div", { className: "comparison-item-name", children: hoveredEquipmentData.name }), hoveredEquipmentData.effects.map((effect, idx) => {
                                                    const currentEffect = currentEquipment?.effects[idx];
                                                    const comparison = compareEffects(currentEffect, effect);
                                                    return (_jsx("div", { className: "comparison-effect", style: { color: comparison?.color || '#e2e8f0' }, children: comparison?.text || renderEffect(effect, idx) }, idx));
                                                })] })] })] })] })), _jsx("div", { className: "equipment-list", children: equipmentList.map((equipment) => {
                        const unlocked = isUnlocked(equipment.id);
                        const selected = getCurrentSlotId() === equipment.id;
                        const rarityColor = getRarityColor(equipment.rarity);
                        return (_jsxs("div", { className: `equipment-card ${selected ? 'selected' : ''} ${!unlocked ? 'locked' : ''}`, style: { borderColor: rarityColor }, onClick: () => unlocked && onSelect(equipment.id), onMouseEnter: () => unlocked && setHoveredEquipment(equipment.id), onMouseLeave: () => setHoveredEquipment(null), children: [_jsxs("div", { className: "equipment-card-header", children: [_jsx("span", { className: "equipment-icon", children: equipment.icon }), _jsxs("div", { className: "equipment-info", children: [_jsx("h3", { className: "equipment-name", children: equipment.name }), _jsx("span", { className: "equipment-rarity", style: { color: rarityColor }, children: equipment.rarity })] })] }), _jsx("p", { className: "equipment-description", children: equipment.description }), _jsx("div", { className: "equipment-effects", children: equipment.effects.map((effect, idx) => (_jsx("div", { className: "effect-item", children: _jsx("span", { className: "effect-text", children: renderEffect(effect, idx) }) }, idx))) }), !unlocked && (_jsx("div", { className: "equipment-locked-overlay", children: "\uD83D\uDD12 \u672A\u89E3\u9501" })), selected && (_jsx("div", { className: "equipment-selected-badge", children: "\u2713 \u5DF2\u88C5\u5907" }))] }, equipment.id));
                    }) }), _jsx("div", { className: "equipment-select-footer", children: _jsx("p", { children: "\uD83D\uDCA1 \u63D0\u793A\uFF1A\u70B9\u51FB\u88C5\u5907\u8FDB\u884C\u88C5\u5907/\u5378\u4E0B\u3002\u60AC\u505C\u67E5\u770B\u5BF9\u6BD4\u3002\u6BCF\u79CD\u7C7B\u578B\u53EA\u80FD\u88C5\u5907\u4E00\u4E2A\u7269\u54C1\u3002" }) })] }) }));
};
export default EquipmentSelect;

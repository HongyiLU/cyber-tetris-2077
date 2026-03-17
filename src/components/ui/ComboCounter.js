import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './ComboCounter.css';
/**
 * 连击计数器组件
 * 显示当前连击数和最大连击数
 */
export const ComboCounter = ({ combo, maxCombo, visible, }) => {
    if (!visible || combo <= 1)
        return null;
    const getComboLevel = () => {
        if (combo >= 20)
            return 'legendary';
        if (combo >= 15)
            return 'epic';
        if (combo >= 10)
            return 'rare';
        if (combo >= 5)
            return 'uncommon';
        return 'common';
    };
    const comboLevel = getComboLevel();
    return (_jsxs("div", { className: `combo-counter ${comboLevel}`, children: [_jsxs("div", { className: "combo-main", children: [_jsx("span", { className: "combo-label", children: "COMBO" }), _jsxs("span", { className: "combo-value", children: [combo, "x"] })] }), maxCombo > combo && (_jsxs("div", { className: "combo-max", children: [_jsx("span", { className: "combo-max-label", children: "MAX" }), _jsxs("span", { className: "combo-max-value", children: [maxCombo, "x"] })] })), _jsx("div", { className: "combo-effect" })] }));
};

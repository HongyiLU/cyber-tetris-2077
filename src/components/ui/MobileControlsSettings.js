import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==================== 移动端控制设置面板 ====================
import { useState, useCallback } from 'react';
const STORAGE_KEY = 'mobileControlsSettings';
const defaultSettings = {
    enabled: true,
    size: 'medium',
    opacity: 0.9,
};
const MobileControlsSettingsPanel = ({ onClose, onSettingsChange, }) => {
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return { ...defaultSettings, ...JSON.parse(saved) };
            }
        }
        catch (e) {
            console.warn('Failed to load mobile controls settings:', e);
        }
        return defaultSettings;
    });
    // 保存设置到 localStorage
    const saveSettings = useCallback((newSettings) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
            onSettingsChange?.(newSettings);
        }
        catch (e) {
            console.warn('Failed to save mobile controls settings:', e);
        }
    }, [onSettingsChange]);
    // 更新设置
    const updateSetting = useCallback((key, value) => {
        setSettings(prev => {
            const updated = { ...prev, [key]: value };
            saveSettings(updated);
            return updated;
        });
    }, [saveSettings]);
    // 切换启用状态
    const handleToggleEnabled = useCallback(() => {
        updateSetting('enabled', !settings.enabled);
    }, [settings.enabled, updateSetting]);
    // 更新尺寸
    const handleSizeChange = useCallback((size) => {
        updateSetting('size', size);
    }, [updateSetting]);
    // 更新透明度
    const handleOpacityChange = useCallback((e) => {
        const value = Number(e.target.value) / 100;
        updateSetting('opacity', value);
    }, [updateSetting]);
    // 重置为默认值
    const handleReset = useCallback(() => {
        setSettings(defaultSettings);
        saveSettings(defaultSettings);
    }, [saveSettings]);
    return (_jsxs("div", { style: styles.container, children: [_jsx("h2", { style: styles.title, children: "\uD83D\uDCF1 \u865A\u62DF\u6309\u952E\u8BBE\u7F6E" }), _jsxs("div", { style: styles.section, children: [_jsxs("div", { style: styles.row, children: [_jsx("span", { style: styles.label, children: "\u542F\u7528\u865A\u62DF\u6309\u952E" }), _jsx("button", { onClick: handleToggleEnabled, style: {
                                    ...styles.toggleButton,
                                    background: settings.enabled ? 'rgba(46, 204, 113, 0.3)' : 'rgba(255, 68, 68, 0.3)',
                                    borderColor: settings.enabled ? '#2ecc71' : '#ff4444',
                                    color: settings.enabled ? '#2ecc71' : '#ff4444',
                                }, children: settings.enabled ? '已启用' : '已禁用' })] }), _jsx("p", { style: styles.hint, children: settings.enabled
                            ? '游戏中将显示虚拟按键'
                            : '仅使用触摸手势控制' })] }), _jsxs("div", { style: styles.section, children: [_jsx("label", { style: styles.label, children: "\u6309\u952E\u5C3A\u5BF8" }), _jsx("div", { style: styles.buttonGroup, children: ['small', 'medium', 'large'].map(size => (_jsxs("button", { onClick: () => handleSizeChange(size), style: {
                                ...styles.sizeButton,
                                background: settings.size === size ? 'rgba(0, 255, 255, 0.3)' : 'rgba(0, 255, 255, 0.1)',
                                borderColor: settings.size === size ? '#00ffff' : 'rgba(0, 255, 255, 0.3)',
                                color: settings.size === size ? '#00ffff' : '#888',
                            }, children: [size === 'small' && '小', size === 'medium' && '中', size === 'large' && '大'] }, size))) }), _jsxs("p", { style: styles.hint, children: [settings.size === 'small' && '小尺寸 (40px) - 适合小屏幕', settings.size === 'medium' && '中尺寸 (50px) - 默认推荐', settings.size === 'large' && '大尺寸 (60px) - 适合大屏幕'] })] }), _jsxs("div", { style: styles.section, children: [_jsxs("label", { style: styles.label, children: ["\u900F\u660E\u5EA6\uFF1A", Math.round(settings.opacity * 100), "%"] }), _jsx("input", { type: "range", min: "50", max: "100", value: settings.opacity * 100, onChange: handleOpacityChange, style: styles.slider }), _jsx("div", { style: styles.opacityPreview, children: _jsx("div", { style: {
                                ...styles.previewBox,
                                opacity: settings.opacity,
                            }, children: "\u9884\u89C8" }) }), _jsx("p", { style: styles.hint, children: "\u8C03\u8282\u865A\u62DF\u6309\u952E\u7684\u900F\u660E\u5EA6\uFF0850%-100%\uFF09" })] }), _jsx("div", { style: styles.section, children: _jsx("button", { onClick: handleReset, style: styles.resetButton, children: "\uD83D\uDD04 \u91CD\u7F6E\u4E3A\u9ED8\u8BA4\u503C" }) }), _jsx("button", { onClick: onClose, style: styles.closeButton, children: "\u5173\u95ED" })] }));
};
// 样式
const styles = {
    container: {
        background: 'rgba(0, 20, 40, 0.95)',
        border: '2px solid #00ffff',
        borderRadius: '16px',
        padding: '25px',
        boxShadow: '0 0 40px rgba(0, 255, 255, 0.3)',
    },
    title: {
        fontSize: '20px',
        color: '#00ffff',
        fontFamily: 'Orbitron, monospace',
        marginBottom: '20px',
        textAlign: 'center',
        textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
    },
    section: {
        marginBottom: '20px',
        padding: '15px',
        background: 'rgba(0, 255, 255, 0.05)',
        borderRadius: '8px',
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
    },
    label: {
        display: 'block',
        color: '#fff',
        fontFamily: 'Orbitron, monospace',
        fontSize: '14px',
        marginBottom: '10px',
    },
    hint: {
        color: '#888',
        fontSize: '12px',
        fontFamily: 'Orbitron, monospace',
        marginTop: '8px',
        lineHeight: '1.5',
    },
    toggleButton: {
        padding: '8px 20px',
        fontSize: '14px',
        border: '2px solid',
        borderRadius: '8px',
        cursor: 'pointer',
        fontFamily: 'Orbitron, monospace',
        transition: 'all 0.3s',
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
    },
    sizeButton: {
        flex: 1,
        padding: '10px',
        fontSize: '14px',
        border: '2px solid',
        borderRadius: '8px',
        cursor: 'pointer',
        fontFamily: 'Orbitron, monospace',
        transition: 'all 0.3s',
    },
    slider: {
        width: '100%',
        height: '8px',
        borderRadius: '4px',
        background: 'rgba(0, 255, 255, 0.2)',
        outline: 'none',
        cursor: 'pointer',
        WebkitAppearance: 'none',
    },
    opacityPreview: {
        marginTop: '15px',
        display: 'flex',
        justifyContent: 'center',
    },
    previewBox: {
        padding: '15px 30px',
        background: 'rgba(0, 255, 255, 0.2)',
        border: '2px solid #00ffff',
        borderRadius: '8px',
        color: '#00ffff',
        fontFamily: 'Orbitron, monospace',
        fontSize: '14px',
    },
    resetButton: {
        width: '100%',
        padding: '10px',
        fontSize: '14px',
        background: 'rgba(255, 166, 0, 0.2)',
        border: '2px solid #ffa600',
        borderRadius: '8px',
        color: '#ffa600',
        cursor: 'pointer',
        fontFamily: 'Orbitron, monospace',
        transition: 'all 0.3s',
    },
    closeButton: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        background: 'rgba(0, 255, 255, 0.2)',
        border: '2px solid #00ffff',
        borderRadius: '8px',
        color: '#00ffff',
        cursor: 'pointer',
        fontFamily: 'Orbitron, monospace',
        boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
        transition: 'all 0.3s',
    },
};
// 工具函数：加载设置
export const loadMobileControlsSettings = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return { ...defaultSettings, ...JSON.parse(saved) };
        }
    }
    catch (e) {
        console.warn('Failed to load mobile controls settings:', e);
    }
    return defaultSettings;
};
// 工具函数：保存设置
export const saveMobileControlsSettings = (settings) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
    catch (e) {
        console.warn('Failed to save mobile controls settings:', e);
    }
};
export default MobileControlsSettingsPanel;

// ⚠️ DEPRECATED: v1.9.x 向后兼容版本
// 仅用于现有 UI 组件，新代码请使用 '../card'
// 计划移除日期：2026-06-01 (v2.2.0)
/**
 * 稀有度配置表
 */
export const RARITY_CONFIG = {
    common: {
        id: 'common',
        name: '普通',
        color: '#ffffff',
        borderColor: '#e5e5e5',
        glowColor: 'rgba(255, 255, 255, 0.3)',
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
        icon: '⚪',
    },
    uncommon: {
        id: 'uncommon',
        name: '罕见',
        color: '#00ff00',
        borderColor: '#00cc00',
        glowColor: 'rgba(0, 255, 0, 0.4)',
        background: 'linear-gradient(135deg, #00ff0015 0%, #00cc0025 100%)',
        icon: '🟢',
    },
    rare: {
        id: 'rare',
        name: '稀有',
        color: '#0088ff',
        borderColor: '#0066cc',
        glowColor: 'rgba(0, 136, 255, 0.5)',
        background: 'linear-gradient(135deg, #0088ff15 0%, #0066cc25 100%)',
        icon: '🔵',
    },
    epic: {
        id: 'epic',
        name: '史诗',
        color: '#a855f7',
        borderColor: '#7e22ce',
        glowColor: 'rgba(168, 85, 247, 0.6)',
        background: 'linear-gradient(135deg, #a855f715 0%, #7e22ce25 100%)',
        icon: '🟣',
    },
    legendary: {
        id: 'legendary',
        name: '传说',
        color: '#ff8800',
        borderColor: '#cc6600',
        glowColor: 'rgba(255, 136, 0, 0.7)',
        background: 'linear-gradient(135deg, #ff880015 0%, #cc660025 100%)',
        icon: '🟠',
    },
};
/**
 * 获取稀有度配置
 * @param rarity 稀有度
 * @returns 稀有度配置
 */
export function getRarityConfig(rarity) {
    return RARITY_CONFIG[rarity];
}
/**
 * 获取稀有度类名
 * @param rarity 稀有度
 * @returns CSS 类名
 */
export function getRarityClassName(rarity) {
    return `card-rarity-${rarity}`;
}

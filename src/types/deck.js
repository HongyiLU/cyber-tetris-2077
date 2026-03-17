// ==================== 卡组系统类型定义 ====================
/**
 * 默认卡组配置
 * v1.9.9 优化：minDeckSize 仅用于使用验证，不用于创建/保存验证
 */
export const DEFAULT_DECK_CONFIG = {
    minDeckSize: 7, // v1.9.9: 至少 7 张卡牌才能使用（经典 7 种方块各 1 个）
    maxDeckSize: 21, // v1.9.9: 最大 21 张（7 种 × 3 张）
    rarityWeights: {
        common: 50,
        uncommon: 30,
        rare: 15,
        epic: 4,
        legendary: 1,
    },
};
// ==================== 卡组辅助函数（v1.9.9 新增） ====================
/**
 * 计算卡组方块数量
 * @param deck 卡组对象
 * @returns 方块数量
 */
export function getDeckBlockCount(deck) {
    return deck.cards.length;
}
/**
 * 检查卡组是否有效（可用于游戏）
 * @param deck 卡组对象
 * @param minDeckSize 最小卡组大小（默认从配置获取）
 * @returns 是否有效
 */
export function isDeckValidForUse(deck, minDeckSize = DEFAULT_DECK_CONFIG.minDeckSize) {
    return deck.cards.length >= minDeckSize;
}
/**
 * 获取卡组状态描述
 * @param deck 卡组对象
 * @returns 状态描述字符串
 */
export function getDeckStatusText(deck) {
    const count = deck.cards.length;
    if (count >= DEFAULT_DECK_CONFIG.minDeckSize) {
        return `✅ 可用（${count}张）`;
    }
    else {
        return `⚠️ 不可用（${count}/${DEFAULT_DECK_CONFIG.minDeckSize}张）`;
    }
}

// ==================== 卡牌类型定义 v2.0.0 ====================
// 尖塔方块 2077 手牌系统 - 新版卡牌类型
/**
 * 卡牌类型枚举
 */
export var CardType;
(function (CardType) {
    /** 攻击卡 - 红色边框 */
    CardType["ATTACK"] = "attack";
    /** 技能卡 - 绿色边框 */
    CardType["SKILL"] = "skill";
    /** 能力卡 - 紫色边框 */
    CardType["POWER"] = "power";
})(CardType || (CardType = {}));
/**
 * 卡牌稀有度枚举
 */
export var CardRarity;
(function (CardRarity) {
    /** 普通 - 白色 */
    CardRarity["COMMON"] = "common";
    /** 罕见 - 蓝色 */
    CardRarity["UNCOMMON"] = "uncommon";
    /** 稀有 - 金色 */
    CardRarity["RARE"] = "rare";
    /** 传说 - 橙色 */
    CardRarity["LEGENDARY"] = "legendary";
})(CardRarity || (CardRarity = {}));

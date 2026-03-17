/**
 * 方块类型定义（v1.9.16）
 */
/**
 * 方块类型枚举
 * 用于区分基础方块和特殊效果方块
 */
export var PieceType;
(function (PieceType) {
    /** 基础方块（7 种经典俄罗斯方块） */
    PieceType["BASIC"] = "basic";
    /** 特殊效果方块（10 种特殊效果方块） */
    PieceType["SPECIAL"] = "special";
})(PieceType || (PieceType = {}));

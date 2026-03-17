// ==================== 游戏核心类型定义 ====================
export { CardType, CardRarity } from './card.v2';
export { RARITY_CONFIG, getRarityConfig, getRarityClassName } from './legacy/card';
/**
 * 战斗状态枚举
 */
export var BattleState;
(function (BattleState) {
    BattleState["IDLE"] = "idle";
    BattleState["FIGHTING"] = "fighting";
    BattleState["WON"] = "won";
    BattleState["LOST"] = "lost";
})(BattleState || (BattleState = {}));
/**
 * 方块类型枚举
 * 注意：只包含 GAME_CONFIG.CARDS 中定义的方块类型
 */
export var PieceType;
(function (PieceType) {
    // 经典 7 种
    PieceType["I"] = "I";
    PieceType["O"] = "O";
    PieceType["T"] = "T";
    PieceType["S"] = "S";
    PieceType["Z"] = "Z";
    PieceType["L"] = "L";
    PieceType["J"] = "J";
    // v1.9.16 特殊效果方块
    PieceType["BOMB"] = "BOMB";
    PieceType["TIME"] = "TIME";
    PieceType["HEAL"] = "HEAL";
    PieceType["SHIELD"] = "SHIELD";
    PieceType["COMBO"] = "COMBO";
    PieceType["CLEAR"] = "CLEAR";
    PieceType["LUCKY"] = "LUCKY";
    PieceType["FREEZE"] = "FREEZE";
    PieceType["FIRE"] = "FIRE";
    PieceType["LIGHTNING"] = "LIGHTNING";
    // 特殊方块（默认解锁）
    PieceType["BOMB_OLD"] = "BOMB";
    PieceType["ROW"] = "ROW";
    PieceType["COL"] = "COL";
    PieceType["RAINBOW"] = "RAINBOW";
    PieceType["GRAVITY"] = "GRAVITY";
    PieceType["SLOWMO"] = "SLOWMO";
    PieceType["STAR"] = "STAR";
    PieceType["VORTEX"] = "VORTEX";
})(PieceType || (PieceType = {}));
export { DEFAULT_DECK_CONFIG } from './deck';
// 导出 DeckManager 类
export { DeckManager } from '../engine/DeckManager';
export { RARITY_COLORS, RARITY_WEIGHTS } from './equipment';
export { DIFFICULTY_WEIGHTS, CATEGORY_NAMES } from './achievement';
export { LEADERBOARD_NAMES, LEADERBOARD_ICONS, DEFAULT_LEADERBOARD_CONFIG } from './leaderboard';

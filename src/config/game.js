// ==================== 赛博方块 2077 - 游戏类型和配置导出 ====================
import GAME_CONFIG, { BLOCK_NAMES } from './game-config';
export { GAME_CONFIG, BLOCK_NAMES };
// 重新导出游戏配置中的所有常量
export const { COLORS, SHAPES, CARDS, DECK, DIFFICULTY, GAME, PIECE_TYPE_MAP, SCORE, SPEED, SPECIAL, } = GAME_CONFIG;
// ==================== 方块效果映射（v1.9.16 预留） ====================
// Note: This is a stub for future implementation
// Maps basic blocks to their associated effects
// 临时定义 EffectTrigger 枚举（避免导入不存在的模块）
var EffectTrigger;
(function (EffectTrigger) {
    EffectTrigger["ON_PLACE"] = "onPlace";
    EffectTrigger["ON_CLEAR"] = "onClear";
    EffectTrigger["PASSIVE"] = "passive";
    EffectTrigger["ON_COMBO"] = "onCombo";
})(EffectTrigger || (EffectTrigger = {}));
export const getBlockEffect = (blockId) => {
    const blockEffects = {
        'I': { effectId: 'time_stop', trigger: EffectTrigger.ON_CLEAR },
        'O': { effectId: 'defense_shield', trigger: EffectTrigger.PASSIVE },
        'T': { effectId: 'bomb_block', trigger: EffectTrigger.ON_PLACE },
        'S': { effectId: 'ice_freeze', trigger: EffectTrigger.ON_PLACE },
        'Z': { effectId: 'fire_burn', trigger: EffectTrigger.ON_CLEAR },
        'L': { effectId: 'lightning_chain', trigger: EffectTrigger.ON_CLEAR },
        'J': { effectId: 'life_steal', trigger: EffectTrigger.ON_CLEAR },
    };
    return blockEffects[blockId] || null;
};

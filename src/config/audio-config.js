// ==================== 音效配置 ====================
/**
 * 音效分类
 */
export var AudioCategory;
(function (AudioCategory) {
    AudioCategory["UI"] = "ui";
    AudioCategory["GAME"] = "game";
    AudioCategory["EVENT"] = "event";
})(AudioCategory || (AudioCategory = {}));
/**
 * 音效 ID 枚举
 */
export var SoundId;
(function (SoundId) {
    // 方块操作
    SoundId["MOVE"] = "move";
    SoundId["ROTATE"] = "rotate";
    SoundId["HARD_DROP"] = "harddrop";
    // 消行（不同行数不同音调）
    SoundId["CLEAR_1"] = "clear1";
    SoundId["CLEAR_2"] = "clear2";
    SoundId["CLEAR_3"] = "clear3";
    SoundId["CLEAR_4"] = "clear4";
    // 战斗与成就
    SoundId["COMBO"] = "combo";
    SoundId["ACHIEVEMENT"] = "achievement";
    SoundId["GAME_OVER"] = "gameover";
    SoundId["VICTORY"] = "victory";
})(SoundId || (SoundId = {}));
/**
 * 音效文件路径映射
 */
export const AUDIO_PATHS = {
    [SoundId.MOVE]: '/audio/move.wav',
    [SoundId.ROTATE]: '/audio/rotate.wav',
    [SoundId.HARD_DROP]: '/audio/harddrop.wav',
    [SoundId.CLEAR_1]: '/audio/clear1.wav',
    [SoundId.CLEAR_2]: '/audio/clear2.wav',
    [SoundId.CLEAR_3]: '/audio/clear3.wav',
    [SoundId.CLEAR_4]: '/audio/clear4.wav',
    [SoundId.COMBO]: '/audio/combo.wav',
    [SoundId.ACHIEVEMENT]: '/audio/achievement.wav',
    [SoundId.GAME_OVER]: '/audio/gameover.wav',
    [SoundId.VICTORY]: '/audio/victory.wav',
};
/**
 * 音效分类映射
 */
export const AUDIO_CATEGORIES = {
    [SoundId.MOVE]: AudioCategory.GAME,
    [SoundId.ROTATE]: AudioCategory.GAME,
    [SoundId.HARD_DROP]: AudioCategory.GAME,
    [SoundId.CLEAR_1]: AudioCategory.GAME,
    [SoundId.CLEAR_2]: AudioCategory.GAME,
    [SoundId.CLEAR_3]: AudioCategory.GAME,
    [SoundId.CLEAR_4]: AudioCategory.GAME,
    [SoundId.COMBO]: AudioCategory.EVENT,
    [SoundId.ACHIEVEMENT]: AudioCategory.EVENT,
    [SoundId.GAME_OVER]: AudioCategory.EVENT,
    [SoundId.VICTORY]: AudioCategory.EVENT,
};
/**
 * 默认音量设置（0-100）
 */
export const DEFAULT_VOLUME = {
    MASTER: 80, // 主音量
    GAME: 70, // 游戏音效音量
    UI: 60, // UI 音效音量
    EVENT: 90, // 事件音效音量
};
/**
 * 默认音频配置
 */
export const DEFAULT_AUDIO_CONFIG = {
    masterVolume: DEFAULT_VOLUME.MASTER,
    gameVolume: DEFAULT_VOLUME.GAME,
    uiVolume: DEFAULT_VOLUME.UI,
    eventVolume: DEFAULT_VOLUME.EVENT,
    muted: false,
};
/**
 * 根据音效 ID 获取音量
 * @param soundId 音效 ID
 * @param config 音频配置
 * @returns 音量值 (0-1)
 */
export function getSoundVolume(soundId, config) {
    const category = AUDIO_CATEGORIES[soundId];
    let categoryVolume;
    switch (category) {
        case AudioCategory.GAME:
            categoryVolume = config.gameVolume;
            break;
        case AudioCategory.UI:
            categoryVolume = config.uiVolume;
            break;
        case AudioCategory.EVENT:
            categoryVolume = config.eventVolume;
            break;
        default:
            categoryVolume = DEFAULT_VOLUME.GAME;
    }
    // 计算最终音量 (categoryVolume * masterVolume / 10000)
    return (categoryVolume * config.masterVolume) / 10000;
}
export default {
    AUDIO_PATHS,
    AUDIO_CATEGORIES,
    DEFAULT_VOLUME,
    DEFAULT_AUDIO_CONFIG,
    getSoundVolume,
    SoundId,
    AudioCategory,
};

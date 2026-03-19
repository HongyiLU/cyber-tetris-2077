// ==================== 音效配置 ====================

/**
 * 音效分类
 */
export enum AudioCategory {
  UI = 'ui',           // UI 音效
  GAME = 'game',       // 游戏音效
  EVENT = 'event',     // 事件音效
}

/**
 * 音效 ID 枚举
 */
export enum SoundId {
  // 方块操作
  MOVE = 'move',           // 方块移动
  ROTATE = 'rotate',       // 方块旋转
  HARD_DROP = 'harddrop',  // 硬降

  // 消行（不同行数不同音调）
  CLEAR_1 = 'clear1',
  CLEAR_2 = 'clear2',
  CLEAR_3 = 'clear3',
  CLEAR_4 = 'clear4',

  // 战斗与成就
  COMBO = 'combo',         // 连击
  ACHIEVEMENT = 'achievement', // 成就解锁
  GAME_OVER = 'gameover',  // 游戏结束
  VICTORY = 'victory',     // 胜利

  // 战斗相关音效 (v2.0.0 Day 6)
  CARD_PLAY = 'cardplay',        // 出牌
  CARD_DRAW = 'carddraw',        // 抽牌
  DAMAGE_PLAYER = 'damageplayer', // 玩家受伤
  DAMAGE_ENEMY = 'damageenemy',  // 敌人受伤
  HEAL = 'heal',                 // 治疗
  BUFF = 'buff',                 // 增益
  DEBUFF = 'debuff',             // 减益
  VICTORY_BATTLE = 'victorybattle', // 战斗胜利
  DEFEAT_BATTLE = 'defeatbattle',   // 战斗失败
  ENEMY_ATTACK = 'enemyattack',  // 敌人攻击
  BLOCK = 'block',               // 格挡
  ENERGY = 'energy',             // 能量恢复
}

/**
 * 音效文件路径映射
 */
export const AUDIO_PATHS: Record<SoundId, string> = {
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
  // 战斗相关音效 (v2.0.0 Day 6)
  [SoundId.CARD_PLAY]: '/audio/cardplay.wav',
  [SoundId.CARD_DRAW]: '/audio/carddraw.wav',
  [SoundId.DAMAGE_PLAYER]: '/audio/damageplayer.wav',
  [SoundId.DAMAGE_ENEMY]: '/audio/damageenemy.wav',
  [SoundId.HEAL]: '/audio/heal.wav',
  [SoundId.BUFF]: '/audio/buff.wav',
  [SoundId.DEBUFF]: '/audio/debuff.wav',
  [SoundId.VICTORY_BATTLE]: '/audio/victorybattle.wav',
  [SoundId.DEFEAT_BATTLE]: '/audio/defeatbattle.wav',
  [SoundId.ENEMY_ATTACK]: '/audio/enemyattack.wav',
  [SoundId.BLOCK]: '/audio/block.wav',
  [SoundId.ENERGY]: '/audio/energy.wav',
};

/**
 * 音效分类映射
 */
export const AUDIO_CATEGORIES: Record<SoundId, AudioCategory> = {
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
  // 战斗相关音效 (v2.0.0 Day 6)
  [SoundId.CARD_PLAY]: AudioCategory.GAME,
  [SoundId.CARD_DRAW]: AudioCategory.GAME,
  [SoundId.DAMAGE_PLAYER]: AudioCategory.GAME,
  [SoundId.DAMAGE_ENEMY]: AudioCategory.GAME,
  [SoundId.HEAL]: AudioCategory.GAME,
  [SoundId.BUFF]: AudioCategory.GAME,
  [SoundId.DEBUFF]: AudioCategory.GAME,
  [SoundId.VICTORY_BATTLE]: AudioCategory.EVENT,
  [SoundId.DEFEAT_BATTLE]: AudioCategory.EVENT,
  [SoundId.ENEMY_ATTACK]: AudioCategory.GAME,
  [SoundId.BLOCK]: AudioCategory.GAME,
  [SoundId.ENERGY]: AudioCategory.GAME,
};

/**
 * 默认音量设置（0-100）
 */
export const DEFAULT_VOLUME = {
  MASTER: 80,      // 主音量
  GAME: 70,        // 游戏音效音量
  UI: 60,          // UI 音效音量
  EVENT: 90,       // 事件音效音量
};

/**
 * 音效配置接口
 */
export interface AudioConfig {
  masterVolume: number;      // 主音量 (0-100)
  gameVolume: number;        // 游戏音效音量 (0-100)
  uiVolume: number;          // UI 音效音量 (0-100)
  eventVolume: number;       // 事件音效音量 (0-100)
  muted: boolean;            // 是否静音
}

/**
 * 默认音频配置
 */
export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
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
export function getSoundVolume(soundId: SoundId, config: AudioConfig): number {
  const category = AUDIO_CATEGORIES[soundId];
  let categoryVolume: number;
  
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

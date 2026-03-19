/**
 * 存档数据版本（用于迁移）
 */
export const SAVE_VERSION = 1;

/**
 * 存档数据结构
 * v2.0.0 修复: 移除完整的 decks 数据存储（由 DeckManager 单独管理）
 *           只存储 activeDeckId 引用，避免数据重复和冲突
 */
export interface SaveData {
  version: number;           // 存档版本
  timestamp: number;         // 保存时间戳
  player: PlayerSave;        // 玩家数据
  achievements: AchievementSave;  // 成就进度
  stats: StatsSave;          // 统计数据
  settings: SettingsSave;     // 设置
  // v2.0.0 新增: 只存储当前激活的卡组 ID 引用，不存储完整卡组数据
  // 完整卡组数据由 DeckManager 单独管理（localStorage key: cyber-blocks-decks）
  activeDeckId: string | null;
}

/**
 * 玩家存档
 */
export interface PlayerSave {
  level: number;             // 玩家等级
  hp: number;                // 当前血量
  maxHp: number;             // 最大血量
  energy: number;            // 当前能量
  maxEnergy: number;         // 最大能量
  gold: number;              // 金币
  exp: number;               // 经验值
}

/**
 * 卡组存档
 * @deprecated v2.0.0 已废弃 - 卡组数据现在由 DeckManager 单独管理
 *             SaveData 只存储 activeDeckId 引用，不存储完整卡组数据
 */
export interface DeckSave {
  id: string;
  name: string;
  cards: string[];           // 卡牌 ID 列表
  isActive: boolean;         // 是否激活
  createdAt: number;
}

/**
 * 成就进度存档
 */
export interface AchievementSave {
  unlockedIds: string[];     // 已解锁的成就 ID
  progress: Record<string, number>;  // 进度（key: 成就 ID, value: 进度值）
}

/**
 * 统计数据存档
 */
export interface StatsSave {
  totalGames: number;        // 总游戏次数
  totalWins: number;        // 总胜利次数
  totalLosses: number;      // 总失败次数
  totalDamage: number;       // 总伤害
  totalCardsPlayed: number; // 总出牌次数
  maxCombo: number;          // 最大连击
  totalPlayTime: number;     // 总游戏时间（秒）
}

/**
 * 设置存档
 */
export interface SettingsSave {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
}

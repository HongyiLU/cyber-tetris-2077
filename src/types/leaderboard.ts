/**
 * 排行榜系统类型定义
 */

/** 排行榜类型 */
export type LeaderboardType = 'combo' | 'speed' | 'score';

/** 排行榜条目 */
export interface LeaderboardEntry {
  id: string;  // 唯一标识
  playerName: string;  // 玩家名称
  value: number;  // 分数/连击/时间
  date: number;  // 时间戳
  metadata?: Record<string, any>;  // 额外数据（敌人类型、装备等）
}

/** 排行榜数据 */
export interface Leaderboard {
  type: LeaderboardType;
  name: string;
  description: string;
  icon: string;
  unit: string;  // 单位显示（如 "连击", "分", "秒"）
  sortOrder: 'asc' | 'desc';  // 排序方式
  entries: LeaderboardEntry[];
  maxEntries: number;  // 最大条目数
}

/** 排行榜状态 */
export interface LeaderboardState {
  combo: Leaderboard;
  speed: Leaderboard;
  score: Leaderboard;
}

/** 排行榜配置 */
export interface LeaderboardConfig {
  maxEntries: number;
  allowLocalOnly: boolean;
}

/** 默认配置 */
export const DEFAULT_LEADERBOARD_CONFIG: LeaderboardConfig = {
  maxEntries: 10,
  allowLocalOnly: true,
};

/** 排行榜类型名称 */
export const LEADERBOARD_NAMES: Record<LeaderboardType, string> = {
  combo: '最高连击榜',
  speed: '最快通关榜',
  score: '总分榜',
};

/** 排行榜图标 */
export const LEADERBOARD_ICONS: Record<LeaderboardType, string> = {
  combo: '🔥',
  speed: '⚡',
  score: '🏆',
};

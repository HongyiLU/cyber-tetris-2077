// ==================== 游戏统计与结束结果类型 ====================

/**
 * 游戏统计数据接口
 */
export interface GameStats {
  /** 消除行数 */
  linesCleared: number;
  /** 游戏得分 */
  score: number;
  /** 游戏时间（秒） */
  time: number;
  /** 最大连击数 */
  combos: number;
}

/**
 * 游戏结束结果接口
 */
export interface GameEndResult {
  /** 是否胜利 */
  isVictory: boolean;
  /** 游戏统计数据 */
  stats: GameStats;
  /** 敌人名称（战斗模式） */
  enemyName?: string;
  /** 是否为最终 BOSS */
  isFinalBoss?: boolean;
  /** 结束原因（失败时） */
  reason?: string;
}

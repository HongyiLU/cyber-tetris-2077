/**
 * 成就系统类型定义
 */

/** 成就难度 */
export type AchievementDifficulty = '⭐' | '⭐⭐' | '⭐⭐⭐' | '⭐⭐⭐⭐' | '⭐⭐⭐⭐⭐';

/** 成就类别 */
export type AchievementCategory = 'battle' | 'combo' | 'clear' | 'special';

/** 成就数据 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;  // emoji 图标
  category: AchievementCategory;
  difficulty: AchievementDifficulty;
  condition: AchievementCondition;
  reward: AchievementReward;
}

/** 成就条件类型 */
export type AchievementConditionType = 
  | 'killCount'        // 击败敌人数量
  | 'maxCombo'         // 最大连击数
  | 'tetrisCount'      // 四次消行次数
  | 'perfectWin'       // 无伤胜利
  | 'speedClear'       // 快速通关
  | 'damageDealt'      // 累计造成伤害
  | 'healAmount'       // 累计治疗量
  | 'winStreak'        // 连胜次数
  | 'equipmentUnlock'  // 解锁装备数量
  | 'totalScore'       // 总得分
  | 'linesCleared'     // 累计消行数
  ;

/** 成就条件 */
export interface AchievementCondition {
  type: AchievementConditionType;
  target: number;  // 目标值
  description: string;  // 条件描述（用于 UI 显示）
}

/** 成就奖励类型 */
export type AchievementRewardType = 'gold' | 'equipment' | 'title' | 'skin';

/** 成就奖励 */
export interface AchievementReward {
  type: AchievementRewardType;
  value: number | string;  // 金币数量/装备 ID/称号 ID
  description: string;
}

/** 成就进度 */
export interface AchievementProgress {
  achievementId: string;
  current: number;
  target: number;
  completed: boolean;
  completedAt?: number;  // 完成时间戳
}

/** 成就状态 */
export interface AchievementState {
  unlocked: string[];  // 已解锁成就 ID 列表
  progress: Record<string, AchievementProgress>;  // 成就进度
  totalGold: number;  // 成就奖励总金币
}

/** 成就难度权重 */
export const DIFFICULTY_WEIGHTS: Record<AchievementDifficulty, number> = {
  '⭐': 1,
  '⭐⭐': 2,
  '⭐⭐⭐': 3,
  '⭐⭐⭐⭐': 4,
  '⭐⭐⭐⭐⭐': 5,
};

/** 成就类别名称 */
export const CATEGORY_NAMES: Record<AchievementCategory, string> = {
  battle: '战斗',
  combo: '连击',
  clear: '消除',
  special: '特殊',
};

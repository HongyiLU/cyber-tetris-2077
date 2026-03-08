/**
 * 成就系统
 * 管理成就的追踪、解锁和奖励发放
 */

import {
  Achievement,
  AchievementState,
  AchievementProgress,
  AchievementConditionType,
} from '../types/achievement';
import {
  ACHIEVEMENT_CONFIG,
  getAchievementById,
  getAllAchievements,
} from '../config/achievement-config';

export class AchievementSystem {
  private state: AchievementState;
  private onAchievementUnlocked?: (achievement: Achievement) => void;
  private onProgressUpdate?: (progress: AchievementProgress) => void;

  constructor(initialState?: Partial<AchievementState>) {
    this.state = {
      unlocked: initialState?.unlocked || [],
      progress: initialState?.progress || {},
      totalGold: initialState?.totalGold || 0,
    };

    // 初始化所有成就的进度
    this.initializeProgress();
  }

  /**
   * 设置成就解锁回调
   */
  setOnAchievementUnlocked(callback: (achievement: Achievement) => void) {
    this.onAchievementUnlocked = callback;
  }

  /**
   * 设置进度更新回调
   */
  setOnProgressUpdate(callback: (progress: AchievementProgress) => void) {
    this.onProgressUpdate = callback;
  }

  /**
   * 初始化所有成就进度
   */
  private initializeProgress() {
    ACHIEVEMENT_CONFIG.forEach(achievement => {
      if (!this.state.progress[achievement.id]) {
        this.state.progress[achievement.id] = {
          achievementId: achievement.id,
          current: 0,
          target: achievement.condition.target,
          completed: this.state.unlocked.includes(achievement.id),
          completedAt: this.state.unlocked.includes(achievement.id) ? Date.now() : undefined,
        };
      }
    });
  }

  /**
   * 获取当前状态
   */
  getState(): AchievementState {
    return { ...this.state };
  }

  /**
   * 获取所有成就进度
   */
  getAllProgress(): AchievementProgress[] {
    return Object.values(this.state.progress);
  }

  /**
   * 获取单个成就进度
   */
  getProgress(achievementId: string): AchievementProgress | undefined {
    return this.state.progress[achievementId];
  }

  /**
   * 获取已解锁成就列表
   */
  getUnlockedAchievements(): Achievement[] {
    return this.state.unlocked
      .map(id => getAchievementById(id))
      .filter((a): a is Achievement => a !== undefined);
  }

  /**
   * 获取未完成成就列表
   */
  getLockedAchievements(): Achievement[] {
    return getAllAchievements().filter(
      a => !this.state.unlocked.includes(a.id)
    );
  }

  /**
   * 更新成就进度
   */
  updateProgress(
    conditionType: AchievementConditionType,
    value: number,
    isAddition: boolean = true
  ): Achievement[] {
    const unlockedAchievements: Achievement[] = [];

    ACHIEVEMENT_CONFIG.forEach(achievement => {
      // 跳过已完成的成就
      if (this.state.progress[achievement.id]?.completed) {
        return;
      }

      // 检查条件类型是否匹配
      if (achievement.condition.type !== conditionType) {
        return;
      }

      const progress = this.state.progress[achievement.id];
      if (!progress) return;

      // 更新进度
      if (isAddition) {
        progress.current += value;
      } else {
        progress.current = Math.max(0, progress.current - value);
      }

      // 检查是否完成
      if (progress.current >= achievement.condition.target) {
        progress.current = achievement.condition.target;
        progress.completed = true;
        progress.completedAt = Date.now();

        // 添加到已解锁列表
        if (!this.state.unlocked.includes(achievement.id)) {
          this.state.unlocked.push(achievement.id);
          unlockedAchievements.push(achievement);

          // 发放奖励
          this.grantReward(achievement.reward);
        }
      }

      // 通知进度更新
      if (this.onProgressUpdate) {
        this.onProgressUpdate(progress);
      }
    });

    // 通知成就解锁
    unlockedAchievements.forEach(achievement => {
      if (this.onAchievementUnlocked) {
        this.onAchievementUnlocked(achievement);
      }
    });

    return unlockedAchievements;
  }

  /**
   * 设置成就进度（用于特定条件）
   */
  setProgress(
    conditionType: AchievementConditionType,
    value: number
  ): Achievement[] {
    const unlockedAchievements: Achievement[] = [];

    ACHIEVEMENT_CONFIG.forEach(achievement => {
      if (this.state.progress[achievement.id]?.completed) {
        return;
      }

      if (achievement.condition.type !== conditionType) {
        return;
      }

      const progress = this.state.progress[achievement.id];
      if (!progress) return;

      progress.current = value;

      if (progress.current >= achievement.condition.target) {
        progress.current = achievement.condition.target;
        progress.completed = true;
        progress.completedAt = Date.now();

        if (!this.state.unlocked.includes(achievement.id)) {
          this.state.unlocked.push(achievement.id);
          unlockedAchievements.push(achievement);
          this.grantReward(achievement.reward);
        }
      }

      if (this.onProgressUpdate) {
        this.onProgressUpdate(progress);
      }
    });

    unlockedAchievements.forEach(achievement => {
      if (this.onAchievementUnlocked) {
        this.onAchievementUnlocked(achievement);
      }
    });

    return unlockedAchievements;
  }

  /**
   * 发放奖励
   */
  private grantReward(reward: { type: string; value: number | string; description: string }) {
    if (reward.type === 'gold' && typeof reward.value === 'number') {
      this.state.totalGold += reward.value;
    }
    // 其他奖励类型可以在未来扩展
  }

  /**
   * 检查成就是否已解锁
   */
  isUnlocked(achievementId: string): boolean {
    return this.state.unlocked.includes(achievementId);
  }

  /**
   * 获取总金币数
   */
  getTotalGold(): number {
    return this.state.totalGold;
  }

  /**
   * 获取完成度百分比
   */
  getCompletionPercentage(): number {
    const total = ACHIEVEMENT_CONFIG.length;
    const unlocked = this.state.unlocked.length;
    return Math.round((unlocked / total) * 100);
  }

  /**
   * 重置成就系统（用于新游戏）
   */
  reset(keepUnlocked: boolean = false) {
    if (!keepUnlocked) {
      this.state.unlocked = [];
      this.state.totalGold = 0;
    }
    
    // 重置所有进度
    ACHIEVEMENT_CONFIG.forEach(achievement => {
      this.state.progress[achievement.id] = {
        achievementId: achievement.id,
        current: 0,
        target: achievement.condition.target,
        completed: keepUnlocked && this.state.unlocked.includes(achievement.id),
        completedAt: keepUnlocked && this.state.unlocked.includes(achievement.id) ? Date.now() : undefined,
      };
    });
  }

  /**
   * 序列化状态
   */
  serialize(): string {
    return JSON.stringify(this.state);
  }

  /**
   * 反序列化状态
   */
  static deserialize(data: string): AchievementSystem {
    const state = JSON.parse(data) as AchievementState;
    return new AchievementSystem(state);
  }

  /**
   * 从 localStorage 加载
   */
  static loadFromStorage(key: string = 'achievementState'): AchievementSystem | null {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      return AchievementSystem.deserialize(data);
    } catch (e) {
      console.error('Failed to load achievement state from storage:', e);
      return null;
    }
  }

  /**
   * 保存到 localStorage
   */
  saveToStorage(key: string = 'achievementState'): void {
    try {
      localStorage.setItem(key, this.serialize());
    } catch (e) {
      console.error('Failed to save achievement state to storage:', e);
    }
  }
}

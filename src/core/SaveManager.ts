import { SaveData, PlayerSave, AchievementSave, StatsSave, SettingsSave, SAVE_VERSION } from '../types/save';

const SAVE_KEY = 'cyber-tetris-2077-save';

/**
 * 存档管理器
 * 负责游戏的保存和加载
 * v2.0.0 修复: 不再存储完整的卡组数据（由 DeckManager 单独管理）
 *            只存储 activeDeckId 引用，避免数据重复和冲突
 */
export class SaveManager {
  private static instance: SaveManager;
  private currentSave: SaveData | null = null;

  private constructor() {
    this.load();
  }

  static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  /**
   * 重置单例实例（用于测试）
   */
  static resetInstance(): void {
    SaveManager.instance = undefined as unknown as SaveManager;
  }

  /**
   * 获取当前存档
   */
  getSave(): SaveData | null {
    return this.currentSave;
  }

  /**
   * 保存游戏
   * v2.0.0 修复: 不再处理 decks 数据，只处理 activeDeckId
   * 注意: 使用 'activeDeckId' in saveData 来区分 "未提供" 和 "明确设置为 null"
   */
  save(saveData: Partial<SaveData>): boolean {
    try {
      // 处理 activeDeckId: 区分 "未提供" 和 "明确设置为 null"
      let activeDeckId: string | null;
      if ('activeDeckId' in saveData) {
        activeDeckId = saveData.activeDeckId ?? null;
      } else {
        activeDeckId = this.currentSave?.activeDeckId ?? null;
      }

      const newSave: SaveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        player: saveData.player ?? this.currentSave?.player ?? this.getDefaultPlayer(),
        achievements: saveData.achievements ?? this.currentSave?.achievements ?? { unlockedIds: [], progress: {} },
        stats: saveData.stats ?? this.currentSave?.stats ?? this.getDefaultStats(),
        settings: saveData.settings ?? this.currentSave?.settings ?? this.getDefaultSettings(),
        activeDeckId,
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(newSave));
      this.currentSave = newSave;
      console.log('[SaveManager] 保存成功');
      return true;
    } catch (error) {
      console.error('[SaveManager] 保存失败:', error);
      return false;
    }
  }

  /**
   * 加载存档
   * v2.0.0 修复: 添加向后兼容，处理旧版存档中的 decks 字段
   */
  load(): boolean {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) {
        console.log('[SaveManager] 无存档');
        return false;
      }

      const parsed = JSON.parse(saved) as SaveData;

      // 版本检查和迁移
      if (parsed.version !== SAVE_VERSION) {
        console.warn('[SaveManager] 存档版本不匹配，需要迁移');
        // TODO: 实现存档迁移逻辑
      }

      // v2.0.0 修复: 向后兼容旧版存档
      // 如果存档中有 decks 字段但没有 activeDeckId，尝试从 decks 中推断
      // (decks 是旧版字段，已废弃，但 existing saves 可能仍有此数据)
      let activeDeckId = parsed.activeDeckId;
      if (activeDeckId === undefined && 'decks' in parsed && Array.isArray(parsed.decks)) {
        // 找出标记为 isActive 的卡组
        const activeDeck = (parsed.decks as Array<{ id: string; isActive?: boolean }>).find(d => d.isActive);
        activeDeckId = activeDeck?.id ?? null;
        console.log('[SaveManager] 从旧版存档迁移 activeDeckId:', activeDeckId);
      }

      this.currentSave = {
        ...parsed,
        activeDeckId: activeDeckId ?? null,
      };
      console.log('[SaveManager] 加载成功');
      return true;
    } catch (error) {
      console.error('[SaveManager] 加载失败:', error);
      return false;
    }
  }

  /**
   * 删除存档
   */
  deleteSave(): boolean {
    try {
      localStorage.removeItem(SAVE_KEY);
      this.currentSave = null;
      console.log('[SaveManager] 存档已删除');
      return true;
    } catch (error) {
      console.error('[SaveManager] 删除存档失败:', error);
      return false;
    }
  }

  /**
   * 检查存档是否存在
   */
  hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  /**
   * 获取默认玩家数据
   */
  private getDefaultPlayer(): PlayerSave {
    return {
      level: 1,
      hp: 50,
      maxHp: 50,
      energy: 3,
      maxEnergy: 3,
      gold: 0,
      exp: 0,
    };
  }

  /**
   * 获取默认统计数据
   */
  private getDefaultStats(): StatsSave {
    return {
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      totalDamage: 0,
      totalCardsPlayed: 0,
      maxCombo: 0,
      totalPlayTime: 0,
    };
  }

  /**
   * 获取默认设置
   */
  private getDefaultSettings(): SettingsSave {
    return {
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 80,
      musicVolume: 60,
    };
  }

  /**
   * 更新玩家数据
   */
  updatePlayer(player: Partial<PlayerSave>): boolean {
    if (!this.currentSave) return false;
    return this.save({
      player: { ...this.currentSave.player, ...player },
    });
  }

  /**
   * 更新统计数据
   */
  updateStats(stats: Partial<StatsSave>): boolean {
    if (!this.currentSave) return false;
    return this.save({
      stats: { ...this.currentSave.stats, ...stats },
    });
  }

  /**
   * 设置当前激活的卡组
   * v2.0.0 新增: 只存储卡组 ID 引用，不存储完整卡组数据
   * @param deckId 卡组 ID，null 表示不选择任何卡组
   */
  setActiveDeck(deckId: string | null): boolean {
    return this.save({ activeDeckId: deckId });
  }

  /**
   * 获取当前激活的卡组 ID
   * v2.0.0 新增
   * @returns 激活的卡组 ID，没有则返回 null
   */
  getActiveDeckId(): string | null {
    return this.currentSave?.activeDeckId ?? null;
  }

  /**
   * 添加成就进度
   */
  addAchievementProgress(achievementId: string, progress: number): boolean {
    if (!this.currentSave) return false;
    const newProgress = { ...this.currentSave.achievements.progress };
    newProgress[achievementId] = progress;
    return this.save({
      achievements: { ...this.currentSave.achievements, progress: newProgress },
    });
  }

  /**
   * 解锁成就
   */
  unlockAchievement(achievementId: string): boolean {
    if (!this.currentSave) return false;
    if (this.currentSave.achievements.unlockedIds.includes(achievementId)) {
      return true;  // 已经解锁
    }
    return this.save({
      achievements: {
        ...this.currentSave.achievements,
        unlockedIds: [...this.currentSave.achievements.unlockedIds, achievementId],
      },
    });
  }
}

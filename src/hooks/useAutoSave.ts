import { useEffect, useCallback } from 'react';
import { SaveManager } from '../core/SaveManager';
import { CombatManager, CombatState } from '../core/CombatManager';
import type { PlayerSave } from '../types/save';

/**
 * 自动保存 Hook
 * 在特定时机自动保存游戏进度
 */
export function useAutoSave() {
  const saveManager = SaveManager.getInstance();

  // 自动保存：每 30 秒
  useEffect(() => {
    const interval = setInterval(() => {
      const combatState = CombatManager.getInstance().getState();
      if (combatState !== CombatState.IDLE) {
        // 只在非空闲状态保存
        saveManager.save({});
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [saveManager]);

  // 保存玩家数据
  const savePlayer = useCallback((playerData: Partial<PlayerSave>) => {
    return saveManager.updatePlayer(playerData);
  }, [saveManager]);

  // 保存战斗结果
  const saveBattleResult = useCallback((result: {
    victory: boolean;
    damageDealt: number;
    cardsPlayed: number;
    maxCombo: number;
  }) => {
    return saveManager.updateStats({
      totalGames: (saveManager.getSave()?.stats.totalGames ?? 0) + 1,
      totalWins: (saveManager.getSave()?.stats.totalWins ?? 0) + (result.victory ? 1 : 0),
      totalLosses: (saveManager.getSave()?.stats.totalLosses ?? 0) + (result.victory ? 0 : 1),
      totalDamage: (saveManager.getSave()?.stats.totalDamage ?? 0) + result.damageDealt,
      totalCardsPlayed: (saveManager.getSave()?.stats.totalCardsPlayed ?? 0) + result.cardsPlayed,
      maxCombo: Math.max(saveManager.getSave()?.stats.maxCombo ?? 0, result.maxCombo),
    });
  }, [saveManager]);

  // 手动保存
  const saveNow = useCallback(() => {
    return saveManager.save({});
  }, [saveManager]);

  return {
    savePlayer,
    saveBattleResult,
    saveNow,
    hasSave: saveManager.hasSave(),
  };
}

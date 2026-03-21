/**
 * @fileoverview StageManager 单元测试 v2.0.0 Phase 4
 */

import { StageManager } from '../core/StageManager';
import { EnemyType } from '../core/CombatManager';

describe('StageManager', () => {
  describe('getStageInfo', () => {
    it('应该返回第1关的史莱姆配置', () => {
      const info = StageManager.getStageInfo(1);
      expect(info).not.toBeNull();
      expect(info?.stageNumber).toBe(1);
      expect(info?.enemyName).toBe('街头混混');
      expect(info?.enemyType).toBe(EnemyType.NORMAL);
      expect(info?.isBoss).toBe(false);
    });

    it('应该返回第4关的Boss配置', () => {
      const info = StageManager.getStageInfo(4);
      expect(info).not.toBeNull();
      expect(info?.stageNumber).toBe(4);
      expect(info?.enemyName).toBe('恶魔领主');
      expect(info?.enemyType).toBe(EnemyType.BOSS);
      expect(info?.isBoss).toBe(true);
    });

    it('应该对无效关卡返回null', () => {
      expect(StageManager.getStageInfo(0)).toBeNull();
      expect(StageManager.getStageInfo(5)).toBeNull();
      expect(StageManager.getStageInfo(-1)).toBeNull();
    });
  });

  describe('getEnemyConfig', () => {
    it('应该生成第1关的敌人配置', () => {
      const config = StageManager.getEnemyConfig(1);
      expect(config).not.toBeNull();
      expect(config?.name).toBe('街头混混');
      expect(config?.type).toBe(EnemyType.NORMAL);
      expect(config?.maxHealth).toBeGreaterThan(0);
      expect(config?.attack).toBeGreaterThan(0);
    });

    it('应该生成第4关Boss的配置', () => {
      const config = StageManager.getEnemyConfig(4);
      expect(config).not.toBeNull();
      expect(config?.name).toBe('恶魔领主');
      expect(config?.type).toBe(EnemyType.BOSS);
      expect(config?.maxHealth).toBeGreaterThanOrEqual(100);
      expect(config?.attack).toBeGreaterThanOrEqual(15);
    });

    it('应该对无效关卡返回null', () => {
      expect(StageManager.getEnemyConfig(0)).toBeNull();
      expect(StageManager.getEnemyConfig(99)).toBeNull();
    });
  });

  describe('TOTAL_STAGES', () => {
    it('应该有4个关卡', () => {
      expect(StageManager.TOTAL_STAGES).toBe(4);
    });
  });

  describe('getNextStage', () => {
    it('应该返回下一关', () => {
      expect(StageManager.getNextStage(1)).toBe(2);
      expect(StageManager.getNextStage(2)).toBe(3);
      expect(StageManager.getNextStage(3)).toBe(4);
    });

    it('第4关应该返回null（已通关）', () => {
      expect(StageManager.getNextStage(4)).toBeNull();
    });
  });

  describe('isBossStage', () => {
    it('第4关应该是Boss关', () => {
      expect(StageManager.isBossStage(4)).toBe(true);
    });

    it('第1-3关不应该是Boss关', () => {
      expect(StageManager.isBossStage(1)).toBe(false);
      expect(StageManager.isBossStage(2)).toBe(false);
      expect(StageManager.isBossStage(3)).toBe(false);
    });
  });

  describe('isGameComplete', () => {
    it('超过总关卡数应该返回true', () => {
      expect(StageManager.isGameComplete(5)).toBe(true);
      expect(StageManager.isGameComplete(4)).toBe(false);
    });
  });

  describe('getStageName', () => {
    it('应该返回关卡名称', () => {
      expect(StageManager.getStageName(1)).toContain('街头混混');
      expect(StageManager.getStageName(4)).toContain('恶魔领主');
    });
  });

  describe('calculateSkipBonus', () => {
    it('应该返回跳过奖励金币数', () => {
      const bonus = StageManager.calculateSkipBonus(1);
      expect(typeof bonus).toBe('number');
      expect(bonus).toBeGreaterThan(0);
    });
  });

  describe('getAllStages', () => {
    it('应该返回所有4个关卡', () => {
      const stages = StageManager.getAllStages();
      expect(stages).toHaveLength(4);
    });
  });
});

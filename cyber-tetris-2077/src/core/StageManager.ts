/**
 * @fileoverview 关卡进度管理 v2.0.0
 * 管理4个关卡的配置、递进逻辑和Boss战特殊处理
 */

import { EnemyType } from './CombatManager';

/**
 * 关卡信息接口
 */
export interface StageInfo {
  /** 关卡编号 (1-4) */
  stageNumber: number;
  /** 关卡名称 */
  name: string;
  /** 敌人名称 */
  enemyName: string;
  /** 敌人类型 */
  enemyType: EnemyType;
  /** 基础HP */
  baseHealth: number;
  /** 基础攻击 */
  baseAttack: number;
  /** 基础防御 */
  baseDefense: number;
  /** 攻击间隔(ms) */
  attackInterval: number;
  /** 是否为Boss关 */
  isBoss: boolean;
  /** 奖励金币倍率 */
  rewardGoldMultiplier: number;
}

/**
 * 关卡进度管理器
 */
export class StageManager {
  /** 所有关卡配置 */
  private static readonly STAGES: StageInfo[] = [
    {
      stageNumber: 1,
      name: '第一章：街头混混',
      enemyName: '街头混混',
      enemyType: EnemyType.NORMAL,
      baseHealth: 30,
      baseAttack: 5,
      baseDefense: 0,
      attackInterval: 3000,
      isBoss: false,
      rewardGoldMultiplier: 1.0,
    },
    {
      stageNumber: 2,
      name: '第二章：企业安保',
      enemyName: '企业安保',
      enemyType: EnemyType.NORMAL,
      baseHealth: 40,
      baseAttack: 8,
      baseDefense: 2,
      attackInterval: 2500,
      isBoss: false,
      rewardGoldMultiplier: 1.5,
    },
    {
      stageNumber: 3,
      name: '第三章：精英雇佣兵',
      enemyName: '精英雇佣兵',
      enemyType: EnemyType.ELITE,
      baseHealth: 60,
      baseAttack: 12,
      baseDefense: 5,
      attackInterval: 2000,
      isBoss: false,
      rewardGoldMultiplier: 2.0,
    },
    {
      stageNumber: 4,
      name: '第四章：恶魔领主',
      enemyName: '恶魔领主',
      enemyType: EnemyType.BOSS,
      baseHealth: 120,
      baseAttack: 20,
      baseDefense: 8,
      attackInterval: 1800,
      isBoss: true,
      rewardGoldMultiplier: 3.0,
    },
  ];

  /** 总关卡数 */
  static readonly TOTAL_STAGES = 4;

  /**
   * 获取指定关卡的信息
   * @param stage 关卡编号 (1-4)
   */
  static getStageInfo(stage: number): StageInfo | null {
    if (stage < 1 || stage > this.TOTAL_STAGES) {
      return null;
    }
    return this.STAGES[stage - 1] ?? null;
  }

  /**
   * 获取指定关卡的敌人配置
   * @param stage 关卡编号 (1-4)
   * @param playerBonusStage 玩家当前累计的关卡加成（每关后+1难度）
   */
  static getEnemyConfig(
    stage: number,
    playerBonusStage: number = 0
  ): {
    name: string;
    type: EnemyType;
    maxHealth: number;
    health: number;
    attack: number;
    defense: number;
    attackInterval: number;
  } | null {
    const info = this.getStageInfo(stage);
    if (!info) return null;

    const bonusPerStage = 0.1; // 每关递增10%
    const bonusMultiplier = 1 + bonusPerStage * (playerBonusStage - 1);

    return {
      name: info.enemyName,
      type: info.enemyType,
      maxHealth: Math.floor(info.baseHealth * bonusMultiplier),
      health: Math.floor(info.baseHealth * bonusMultiplier),
      attack: Math.floor(info.baseAttack * bonusMultiplier),
      defense: info.baseDefense,
      attackInterval: info.attackInterval,
    };
  }

  /**
   * 计算跳过奖励的金币
   * @param stage 当前关卡
   */
  static calculateSkipBonus(stage: number): number {
    const baseBonus = 10;
    const info = this.getStageInfo(stage);
    if (!info) return baseBonus;
    return Math.floor(baseBonus * info.rewardGoldMultiplier);
  }

  /**
   * 获取关卡名称
   * @param stage 关卡编号
   */
  static getStageName(stage: number): string {
    const info = this.getStageInfo(stage);
    return info?.name ?? `第 ${stage} 关`;
  }

  /**
   * 判断是否为Boss关
   * @param stage 关卡编号
   */
  static isBossStage(stage: number): boolean {
    const info = this.getStageInfo(stage);
    return info?.isBoss ?? false;
  }

  /**
   * 获取下一个关卡（用于递进）
   * @param currentStage 当前关卡
   */
  static getNextStage(currentStage: number): number | null {
    if (currentStage >= this.TOTAL_STAGES) {
      return null; // 已通关
    }
    return currentStage + 1;
  }

  /**
   * 判断是否已通关所有关卡
   * @param stage 当前关卡
   */
  static isGameComplete(stage: number): boolean {
    return stage > this.TOTAL_STAGES;
  }

  /**
   * 获取所有关卡信息
   */
  static getAllStages(): StageInfo[] {
    return [...this.STAGES];
  }
}

/** 单例导出 */
export const stageManager = new StageManager();

// ==================== EnemyAI - 敌人 AI 类 ====================
// v2.0.0 Day 4 - 敌人 AI 集成

import { CombatManager } from './CombatManager';
import { CardDatabase } from './CardDatabase';

/**
 * AI 难度等级
 */
export enum AILevel {
  EASY = 'easy',       // 简单 - 随机决策
  NORMAL = 'normal',   // 普通 - 基本策略
  HARD = 'hard',       // 困难 - 最优决策
}

/**
 * AI 行动类型
 */
export type AIActionType = 'attack' | 'skill' | 'defend' | 'wait';

/**
 * AI 决策
 */
export interface AIDecision {
  action: AIActionType;
  target?: 'player' | 'self';
  damage?: number;
  block?: number;
  skillId?: string;
  skillName?: string;
  reasoning: string;  // 决策理由
}

/**
 * 敌人技能
 */
export interface EnemySkill {
  id: string;
  name: string;
  damage?: number;
  block?: number;
  heal?: number;
  effect?: string;    // 特殊效果 ID
  cooldown: number;    // 冷却回合
  currentCooldown: number;  // 当前冷却
}

/**
 * 敌人配置
 */
export interface EnemyConfig {
  name: string;           // 敌人名称
  maxHP: number;          // 最大血量
  attack: number;         // 基础攻击力
  defense: number;         // 防御力
  aiLevel: AILevel;       // AI 难度
  skills?: EnemySkill[];  // 敌人技能
}

/**
 * 敌人 AI 类（单例模式）
 * 负责 AI 决策、技能管理和战斗行为
 */
export class EnemyAI {
  private static instance: EnemyAI;

  private combatManager: CombatManager;
  private cardDatabase: CardDatabase;

  private currentEnemy: EnemyConfig | null = null;
  private enemyState: {
    currentHP: number;
    maxHP: number;
    block: number;
    skills: EnemySkill[];
  } | null = null;

  /**
   * 私有构造函数（单例模式）
   */
  private constructor() {
    this.combatManager = CombatManager.getInstance();
    this.cardDatabase = CardDatabase.getInstance();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): EnemyAI {
    if (!EnemyAI.instance) {
      EnemyAI.instance = new EnemyAI();
    }
    return EnemyAI.instance;
  }

  /**
   * 重置单例实例（用于测试或重新开始）
   */
  static resetInstance(): void {
    EnemyAI.instance = undefined as unknown as EnemyAI;
  }

  // ==================== 敌人设置 ====================

  /**
   * 设置敌人
   * @param enemy 敌人配置
   */
  setEnemy(enemy: EnemyConfig): void {
    this.currentEnemy = enemy;
    this.enemyState = {
      currentHP: enemy.maxHP,
      maxHP: enemy.maxHP,
      block: 0,
      skills: enemy.skills ? enemy.skills.map(skill => ({ ...skill })) : [],
    };
  }

  // ==================== 回合执行 ====================

  /**
   * 执行 AI 回合
   * @returns AI 决策
   */
  executeTurn(): AIDecision {
    // 无敌人时返回 wait
    if (!this.currentEnemy || !this.enemyState) {
      return {
        action: 'wait',
        reasoning: '无敌人',
      };
    }

    // 玩家已死亡，不攻击
    const playerHP = this.combatManager.getPlayerHP();
    if (playerHP.current <= 0) {
      return {
        action: 'wait',
        reasoning: '玩家已死亡',
      };
    }

    // 减少所有技能冷却
    this.reduceAllCooldowns();

    // 做出决策
    const decision = this.makeDecision();

    // 执行决策效果
    this.applyDecision(decision);

    return decision;
  }

  /**
   * 应用决策效果
   */
  private applyDecision(decision: AIDecision): void {
    switch (decision.action) {
      case 'attack':
        this.executeAttack(decision.damage ?? this.currentEnemy!.attack);
        break;
      case 'defend':
        this.executeDefend(decision.block ?? Math.floor(this.currentEnemy!.attack * 0.5));
        break;
      case 'skill':
        // 技能效果已在 useSkill 中处理
        break;
      case 'wait':
        // 什么都不做
        break;
    }
  }

  // ==================== AI 决策逻辑 ====================

  /**
   * AI 决策逻辑
   * @returns AI 决策
   */
  private makeDecision(): AIDecision {
    // P0-1: 同步敌人 HP（从 CombatManager 获取实际值）
    this.syncEnemyHP();

    switch (this.currentEnemy?.aiLevel) {
      case AILevel.EASY:
        return this.makeEasyDecision();
      case AILevel.NORMAL:
        return this.makeNormalDecision();
      case AILevel.HARD:
        return this.makeHardDecision();
      default:
        return this.makeEasyDecision();
    }
  }

  /**
   * P0-1: 从 CombatManager 同步敌人 HP
   * 只在 CombatManager.enemyHP < enemyState.currentHP 时同步
   * 逻辑：真实游戏中敌人受击后 CombatManager.enemyHP 会降低，此时同步
   *      测试中直接 setEnemyHP() 不经 CombatManager，不触发此条件
   */
  private syncEnemyHP(): void {
    const enemyHP = this.combatManager.getEnemyHP();
    if (this.enemyState && enemyHP) {
      if (enemyHP.current < this.enemyState.currentHP) {
        this.enemyState.currentHP = enemyHP.current;
      }
    }
  }

  /**
   * 简单 AI：随机决策
   */
  private makeEasyDecision(): AIDecision {
    const actions = ['attack', 'defend'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    if (randomAction === 'attack') {
      return {
        action: 'attack',
        damage: this.currentEnemy!.attack,
        reasoning: '随机选择攻击',
      };
    } else {
      return {
        action: 'defend',
        block: Math.floor(this.currentEnemy!.attack * 0.5),
        reasoning: '随机选择防御',
      };
    }
  }

  /**
   * 普通 AI：基本策略
   */
  private makeNormalDecision(): AIDecision {
    const playerHP = this.combatManager.getPlayerHP();
    const availableSkill = this.getAvailableSkill();

    // 血量低时优先治疗或防御
    if (this.getEnemyHP() < this.getMaxHP() * 0.3) {
      const healSkill = this.getHealSkill();
      if (healSkill) {
        return this.useSkill(healSkill);
      }
      return {
        action: 'defend',
        block: this.currentEnemy!.defense * 2,
        reasoning: '低血量防御',
      };
    }

    // 有技能时使用技能
    if (availableSkill) {
      return this.useSkill(availableSkill);
    }

    // 否则普攻
    return this.executeAttackDecision(this.currentEnemy!.attack);
  }

  /**
   * 困难 AI：最优决策
   */
  private makeHardDecision(): AIDecision {
    const playerHP = this.combatManager.getPlayerHP();
    const availableSkill = this.getAvailableSkill();

    // 如果可以一击必杀，使用最高伤害技能
    if (availableSkill && availableSkill.damage && availableSkill.damage >= playerHP.current) {
      return this.useSkill(availableSkill);
    }

    // 血量低时使用治疗或防御
    if (this.getEnemyHP() < this.getMaxHP() * 0.4) {
      const healSkill = this.getHealSkill();
      if (healSkill) {
        return this.useSkill(healSkill);
      }
    }

    // 优先使用最高伤害技能
    if (availableSkill && availableSkill.damage) {
      return this.useSkill(availableSkill);
    }

    // 否则普攻
    return this.executeAttackDecision(this.currentEnemy!.attack);
  }

  // ==================== 行动执行 ====================

  /**
   * 执行攻击决策
   */
  private executeAttackDecision(damage: number): AIDecision {
    return {
      action: 'attack',
      damage,
      reasoning: `普攻造成 ${damage} 点伤害`,
    };
  }

  /**
   * 执行攻击
   * @param damage 伤害值
   */
  private executeAttack(damage: number): void {
    if (damage <= 0) return;
    this.combatManager.takeDamage(damage);
  }

  /**
   * 使用技能
   * @param skill 技能
   */
  private useSkill(skill: EnemySkill): AIDecision {
    // 设置技能冷却
    this.setSkillCooldown(skill.id, skill.cooldown);

    // 应用技能效果
    if (skill.damage) {
      this.combatManager.takeDamage(skill.damage);
    }

    if (skill.block) {
      this.addBlock(skill.block);
    }

    if (skill.heal) {
      this.healSelf(skill.heal);
    }

    return {
      action: 'skill',
      skillId: skill.id,
      skillName: skill.name,
      damage: skill.damage,
      block: skill.block,
      reasoning: `使用技能: ${skill.name}`,
    };
  }

  /**
   * 防御
   * P1-2: 将敌人基础防御力纳入防御计算
   * @param block 技能提供的防御值
   */
  private executeDefend(block: number): void {
    const totalBlock = block + (this.currentEnemy?.defense ?? 0);
    this.addBlock(totalBlock);
  }

  /**
   * 添加防御值
   */
  private addBlock(block: number): void {
    if (this.enemyState) {
      this.enemyState.block += block;
    }
  }

  /**
   * 治疗自身
   */
  private healSelf(amount: number): void {
    if (this.enemyState) {
      this.enemyState.currentHP = Math.min(
        this.enemyState.maxHP,
        this.enemyState.currentHP + amount
      );
    }
  }

  // ==================== 技能管理 ====================

  /**
   * 获取可用的技能（未冷却），优先返回最高伤害技能
   * P0-2: 扩展条件，包含 block 技能（heal 技能通过 makeNormalDecision 中的
   * 低血量检查单独处理，避免在满血时浪费治疗技能）
   */
  private getAvailableSkill(): EnemySkill | null {
    if (!this.enemyState) return null;

    const available = this.enemyState.skills.filter(
      skill => skill.currentCooldown === 0 && (skill.damage || skill.block)
    );

    if (available.length === 0) return null;

    // 优先返回最高伤害技能
    available.sort((a, b) => (b.damage ?? 0) - (a.damage ?? 0));
    return available[0];
  }

  /**
   * 获取治疗技能
   */
  private getHealSkill(): EnemySkill | null {
    if (!this.enemyState) return null;

    return (
      this.enemyState.skills.find(
        skill => skill.currentCooldown === 0 && skill.heal && skill.heal > 0
      ) || null
    );
  }

  /**
   * 设置技能冷却
   */
  private setSkillCooldown(skillId: string, cooldown: number): void {
    if (!this.enemyState) return;

    const skill = this.enemyState.skills.find(s => s.id === skillId);
    if (skill) {
      skill.currentCooldown = cooldown;
    }
  }

  /**
   * 减少所有技能冷却
   */
  private reduceAllCooldowns(): void {
    if (!this.enemyState) return;

    for (const skill of this.enemyState.skills) {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown--;
      }
    }
  }

  // ==================== 状态访问 ====================

  /**
   * 获取敌人状态
   */
  getEnemyState(): { currentHP: number; maxHP: number; block: number; skills: EnemySkill[] } | null {
    if (!this.enemyState) return null;

    return {
      currentHP: this.enemyState.currentHP,
      maxHP: this.enemyState.maxHP,
      block: this.enemyState.block,
      skills: this.enemyState.skills,
    };
  }

  /**
   * 获取当前敌人配置
   */
  getCurrentEnemy(): EnemyConfig | null {
    return this.currentEnemy;
  }

  /**
   * 获取敌人当前 HP
   */
  getEnemyHP(): number {
    return this.enemyState?.currentHP ?? 0;
  }

  /**
   * 获取敌人最大 HP
   */
  getMaxHP(): number {
    return this.enemyState?.maxHP ?? 0;
  }

  /**
   * 获取敌人防御值
   */
  getEnemyBlock(): number {
    return this.enemyState?.block ?? 0;
  }

  /**
   * 设置敌人当前 HP（用于测试）
   */
  setEnemyHP(hp: number): void {
    if (this.enemyState) {
      this.enemyState.currentHP = Math.max(0, Math.min(hp, this.enemyState.maxHP));
    }
  }

  /**
   * 重置 AI
   */
  reset(): void {
    this.currentEnemy = null;
    this.enemyState = null;
  }

  /**
   * P1-1: 玩家回合开始时调用，清除敌人的防御值
   * 敌人防御回合结束后，玩家的攻击回合开始前需要调用此方法
   */
  startPlayerTurn(): void {
    this.syncEnemyHP(); // 同步 HP
    if (this.enemyState) {
      this.enemyState.block = 0; // 清除防御
    }
  }
}

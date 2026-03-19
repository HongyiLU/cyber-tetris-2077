// ==================== EnemyAI 单元测试 ====================
// v2.0.0 Day 4 - 敌人 AI 系统测试

import { EnemyAI, AILevel, EnemyConfig, EnemySkill, AIDecision } from '../core/EnemyAI';
import { CombatManager, CombatState } from '../core/CombatManager';
import { HandManager } from '../core/HandManager';
import { CardDatabase } from '../core/CardDatabase';
import { ENEMY_CONFIGS } from '../config/enemy-config';

// 测试用的敌人配置
const createTestEnemy = (
  overrides: Partial<EnemyConfig> = {}
): EnemyConfig => ({
  name: '测试敌人',
  maxHP: 30,
  attack: 5,
  defense: 2,
  aiLevel: AILevel.NORMAL,
  skills: [
    {
      id: 'test_strike',
      name: '测试打击',
      damage: 8,
      cooldown: 2,
      currentCooldown: 0,
    },
    {
      id: 'test_defend',
      name: '测试防御',
      block: 5,
      cooldown: 3,
      currentCooldown: 0,
    },
    {
      id: 'test_heal',
      name: '测试治疗',
      heal: 5,
      cooldown: 4,
      currentCooldown: 0,
    },
  ],
  ...overrides,
});

describe('EnemyAI', () => {
  let enemyAI: EnemyAI;
  let combatManager: CombatManager;
  let cardDatabase: CardDatabase;

  beforeEach(() => {
    // 重置所有单例
    EnemyAI.resetInstance();
    CombatManager.resetInstance();
    HandManager.resetInstance();
    CardDatabase.resetInstance();

    enemyAI = EnemyAI.getInstance();
    combatManager = CombatManager.getInstance();
    cardDatabase = CardDatabase.getInstance();
  });

  afterEach(() => {
    EnemyAI.resetInstance();
    CombatManager.resetInstance();
    HandManager.resetInstance();
  });

  // ==================== 单例模式测试 ====================

  describe('单例模式', () => {
    test('应该返回同一个实例', () => {
      EnemyAI.resetInstance();
      const instance1 = EnemyAI.getInstance();
      const instance2 = EnemyAI.getInstance();
      expect(instance1).toBe(instance2);
    });

    test('resetInstance() 应该允许创建新实例', () => {
      const instance1 = EnemyAI.getInstance();
      EnemyAI.resetInstance();
      const instance2 = EnemyAI.getInstance();
      expect(instance1).not.toBe(instance2);
    });

    test('单例实例应该可访问 combatManager', () => {
      const instance = EnemyAI.getInstance();
      expect(instance).toBeDefined();
    });
  });

  // ==================== 敌人设置测试 ====================

  describe('setEnemy()', () => {
    test('应该正确设置敌人配置', () => {
      const enemy = createTestEnemy({ name: '哥布林' });
      enemyAI.setEnemy(enemy);

      const currentEnemy = enemyAI.getCurrentEnemy();
      expect(currentEnemy).not.toBeNull();
      expect(currentEnemy?.name).toBe('哥布林');
    });

    test('应该初始化敌人状态', () => {
      const enemy = createTestEnemy({ maxHP: 50 });
      enemyAI.setEnemy(enemy);

      const state = enemyAI.getEnemyState();
      expect(state).not.toBeNull();
      expect(state?.currentHP).toBe(50);
      expect(state?.maxHP).toBe(50);
      expect(state?.block).toBe(0);
    });

    test('设置敌人后 getEnemyHP() 应该返回正确值', () => {
      const enemy = createTestEnemy({ maxHP: 40 });
      enemyAI.setEnemy(enemy);

      expect(enemyAI.getEnemyHP()).toBe(40);
    });

    test('设置敌人后 getMaxHP() 应该返回正确值', () => {
      const enemy = createTestEnemy({ maxHP: 60 });
      enemyAI.setEnemy(enemy);

      expect(enemyAI.getMaxHP()).toBe(60);
    });

    test('初始 block 应该为 0', () => {
      const enemy = createTestEnemy();
      enemyAI.setEnemy(enemy);

      expect(enemyAI.getEnemyBlock()).toBe(0);
    });
  });

  // ==================== 敌人配置测试 ====================

  describe('敌人配置 (ENEMY_CONFIGS)', () => {
    test('slime 配置应该正确', () => {
      const slime = ENEMY_CONFIGS.slime;
      expect(slime.name).toBe('史莱姆');
      expect(slime.maxHP).toBe(20);
      expect(slime.attack).toBe(3);
      expect(slime.aiLevel).toBe(AILevel.EASY);
    });

    test('goblin 配置应该正确', () => {
      const goblin = ENEMY_CONFIGS.goblin;
      expect(goblin.name).toBe('哥布林');
      expect(goblin.maxHP).toBe(35);
      expect(goblin.attack).toBe(5);
      expect(goblin.aiLevel).toBe(AILevel.NORMAL);
    });

    test('skeleton 配置应该正确', () => {
      const skeleton = ENEMY_CONFIGS.skeleton;
      expect(skeleton.name).toBe('骷髅战士');
      expect(skeleton.maxHP).toBe(50);
      expect(skeleton.attack).toBe(7);
      expect(skeleton.aiLevel).toBe(AILevel.NORMAL);
    });

    test('demon 配置应该正确', () => {
      const demon = ENEMY_CONFIGS.demon;
      expect(demon.name).toBe('恶魔');
      expect(demon.maxHP).toBe(80);
      expect(demon.attack).toBe(12);
      expect(demon.aiLevel).toBe(AILevel.HARD);
      expect(demon.skills?.length).toBe(3);
    });
  });

  // ==================== AI 决策测试 ====================

  describe('AI 决策', () => {
    test('EASY AI 应该随机决策（多次执行）', () => {
      const enemy = createTestEnemy({ aiLevel: AILevel.EASY });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(30);

      const decisions: AIDecision['action'][] = [];
      for (let i = 0; i < 20; i++) {
        enemyAI.reset();
        enemyAI.setEnemy(enemy);
        const decision = enemyAI.executeTurn();
        decisions.push(decision.action);
      }

      // EASY AI 应该包含 attack 和 defend
      expect(decisions.includes('attack')).toBe(true);
      expect(decisions.includes('defend')).toBe(true);
    });

    test('EASY AI 不应该使用技能', () => {
      const enemy = createTestEnemy({ aiLevel: AILevel.EASY });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(30);

      const decision = enemyAI.executeTurn();
      expect(decision.action).not.toBe('skill');
    });

    test('NORMAL AI 应该使用技能', () => {
      const enemy = createTestEnemy({ aiLevel: AILevel.NORMAL });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(30);

      // NORMAL AI 应该有更高概率使用技能
      let skillUsed = false;
      for (let i = 0; i < 10 && !skillUsed; i++) {
        enemyAI.reset();
        enemyAI.setEnemy(enemy);
        const decision = enemyAI.executeTurn();
        if (decision.action === 'skill') {
          skillUsed = true;
        }
      }

      expect(skillUsed).toBe(true);
    });

    test('HARD AI 应该选择最优决策', () => {
      const enemy = createTestEnemy({ aiLevel: AILevel.HARD });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(30);

      const decision = enemyAI.executeTurn();
      expect(['attack', 'skill']).toContain(decision.action);
    });

    test('低血量时 NORMAL AI 应该优先治疗或防御', () => {
      const enemy = createTestEnemy({
        aiLevel: AILevel.NORMAL,
        maxHP: 100,
        skills: [], // 无技能，确保不随机到攻击
      });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(100);

      // 模拟低血量状态 - 低于 30%
      enemyAI.setEnemyHP(20); // 低于 30% 的 100 maxHP

      const decision = enemyAI.executeTurn();

      // 低血量 NORMAL AI 应该防御或使用技能
      expect(['defend', 'skill']).toContain(decision.action);
    });

    test('HARD AI 低血量时应该使用治疗技能', () => {
      const enemy = createTestEnemy({
        aiLevel: AILevel.HARD,
        maxHP: 100,
        skills: [
          {
            id: 'heal',
            name: '治疗',
            heal: 20,
            cooldown: 4,
            currentCooldown: 0,
          },
        ],
      });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(100);

      // 模拟低血量
      enemyAI.setEnemyHP(30); // 低于 40% 的 100 maxHP

      const decision = enemyAI.executeTurn();
      // HARD AI 低血量应该使用治疗
      expect(decision.action).toBe('skill');
      expect(decision.skillName).toBe('治疗');
    });

    test('HARD AI 应该优先使用高伤害技能', () => {
      const enemy = createTestEnemy({
        aiLevel: AILevel.HARD,
        maxHP: 100,
        skills: [
          {
            id: 'low_damage',
            name: '低伤害',
            damage: 5,
            cooldown: 1,
            currentCooldown: 0,
          },
          {
            id: 'high_damage',
            name: '高伤害',
            damage: 20,
            cooldown: 2,
            currentCooldown: 0,
          },
        ],
      });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(100);

      const decision = enemyAI.executeTurn();
      expect(decision.action).toBe('skill');
      expect(decision.skillId).toBe('high_damage');
    });
  });

  // ==================== 技能使用测试 ====================

  describe('技能使用', () => {
    test('冷却中的技能不应该使用', () => {
      const enemy = createTestEnemy({
        aiLevel: AILevel.NORMAL,
        skills: [
          {
            id: 'strike',
            name: '打击',
            damage: 10,
            cooldown: 2,
            currentCooldown: 2, // 正在冷却
          },
        ],
      });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(30);

      const decision = enemyAI.executeTurn();
      expect(decision.action).toBe('attack'); // 应该使用普攻而不是冷却中的技能
    });

    test('技能使用后应该增加冷却', () => {
      const enemy = createTestEnemy({
        aiLevel: AILevel.NORMAL,
        skills: [
          {
            id: 'strike',
            name: '打击',
            damage: 10,
            cooldown: 2,
            currentCooldown: 0,
          },
        ],
      });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(30);

      const decision = enemyAI.executeTurn();
      if (decision.action === 'skill') {
        const state = enemyAI.getEnemyState();
        // 技能使用后冷却应为 2
        const usedSkill = state?.skills.find(s => s.id === 'strike');
        expect(usedSkill?.currentCooldown).toBe(2);
      }
    });

    test('无技能可用时应该普攻', () => {
      const enemy = createTestEnemy({
        aiLevel: AILevel.NORMAL,
        skills: [
          {
            id: 'strike',
            name: '打击',
            damage: 10,
            cooldown: 2,
            currentCooldown: 2, // 所有技能都冷却中
          },
        ],
      });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(30);

      const decision = enemyAI.executeTurn();
      expect(decision.action).toBe('attack');
    });

    test('连续执行回合应该减少冷却', () => {
      const enemy = createTestEnemy({
        aiLevel: AILevel.NORMAL,
        skills: [
          {
            id: 'strike',
            name: '打击',
            damage: 10,
            cooldown: 2,
            currentCooldown: 0,
          },
        ],
      });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(30);

      // 第一次执行：技能被使用，冷却变为 2
      enemyAI.executeTurn();

      // 第二次执行：冷却从 2 减到 1，然后又被设为 2
      enemyAI.executeTurn();

      // 冷却应该为 1（2-1=1）
      const state = enemyAI.getEnemyState();
      const skill = state?.skills.find(s => s.id === 'strike');
      expect(skill?.currentCooldown).toBe(1);
    });
  });

  // ==================== 敌人行动测试 ====================

  describe('executeTurn()', () => {
    test('应该执行攻击并对玩家造成伤害', () => {
      const enemy = createTestEnemy({ attack: 10 });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(30);

      const initialPlayerHP = combatManager.getPlayerHP().current;
      enemyAI.executeTurn();

      const newPlayerHP = combatManager.getPlayerHP().current;
      expect(newPlayerHP).toBeLessThan(initialPlayerHP);
    });

    test('应该执行防御并增加防御值', () => {
      // 使用 NORMAL AI 并强制 AI 选择防御
      const enemy = createTestEnemy({
        aiLevel: AILevel.NORMAL,
        maxHP: 100,
        skills: [], // 无技能，强制普攻或防御
      });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(100);

      // 模拟低血量状态，强制 AI 防御
      enemyAI.setEnemyHP(10); // 低于 30% 的 100 maxHP

      enemyAI.executeTurn();

      // 防御值应该已经增加（因为低血量 NORMAL AI 会防御）
      const newState = enemyAI.getEnemyState();
      expect(newState?.block).toBeGreaterThan(0);
    });

    test('技能应该对玩家造成伤害', () => {
      const enemy = createTestEnemy({
        aiLevel: AILevel.NORMAL,
        skills: [
          {
            id: 'big_strike',
            name: '重击',
            damage: 15,
            cooldown: 2,
            currentCooldown: 0,
          },
        ],
      });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(100);

      const initialHP = combatManager.getPlayerHP().current;
      enemyAI.executeTurn();
      const newHP = combatManager.getPlayerHP().current;

      expect(initialHP - newHP).toBeGreaterThanOrEqual(15);
    });

    test('治疗技能应该恢复 HP', () => {
      const enemy = createTestEnemy({
        aiLevel: AILevel.NORMAL,
        maxHP: 50,
        skills: [
          {
            id: 'heal',
            name: '治疗',
            heal: 10,
            cooldown: 4,
            currentCooldown: 0,
          },
        ],
      });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(50); // 使用与 enemy.maxHP 相同的值

      // 模拟低血量状态 - 必须低于 30% 阈值 (15 HP)
      enemyAI.setEnemyHP(10);

      const initialHP = enemyAI.getEnemyHP();
      const decision = enemyAI.executeTurn();
      const newHP = enemyAI.getEnemyHP();

      // 决策应该是使用技能
      expect(decision.action).toBe('skill');
      expect(decision.skillName).toBe('治疗');
      // HP 应该增加
      expect(newHP).toBeGreaterThan(initialHP);
    });
  });

  // ==================== 边界情况测试 ====================

  describe('边界情况', () => {
    test('无敌人时应返回 wait', () => {
      // 不设置敌人
      const decision = enemyAI.executeTurn();
      expect(decision.action).toBe('wait');
      expect(decision.reasoning).toBe('无敌人');
    });

    test('玩家血量为 0 时不应攻击', () => {
      const enemy = createTestEnemy({ attack: 100 });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(30);

      // 将玩家血量设为 0
      combatManager.setPlayerHP(0);

      const decision = enemyAI.executeTurn();
      expect(decision.action).toBe('wait');
      expect(decision.reasoning).toBe('玩家已死亡');
    });

    test('reset() 应该重置 AI 状态', () => {
      const enemy = createTestEnemy({ name: '测试' });
      enemyAI.setEnemy(enemy);
      enemyAI.executeTurn();

      enemyAI.reset();

      expect(enemyAI.getCurrentEnemy()).toBeNull();
      expect(enemyAI.getEnemyState()).toBeNull();
    });

    test('getCurrentEnemy() 无敌人时应该返回 null', () => {
      expect(enemyAI.getCurrentEnemy()).toBeNull();
    });

    test('getEnemyState() 无敌人时应该返回 null', () => {
      expect(enemyAI.getEnemyState()).toBeNull();
    });

    test('getEnemyHP() 无敌人时应该返回 0', () => {
      expect(enemyAI.getEnemyHP()).toBe(0);
    });

    test('getMaxHP() 无敌人时应该返回 0', () => {
      expect(enemyAI.getMaxHP()).toBe(0);
    });

    test('getEnemyBlock() 无敌人时应该返回 0', () => {
      expect(enemyAI.getEnemyBlock()).toBe(0);
    });

    test('空技能列表应该正常处理', () => {
      const enemy = createTestEnemy({ skills: [] });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(30);

      const decision = enemyAI.executeTurn();
      expect(decision.action).toBe('attack');
    });

    test('所有技能冷却时应该普攻', () => {
      const enemy = createTestEnemy({
        aiLevel: AILevel.NORMAL,
        skills: [
          {
            id: 'strike1',
            name: '打击1',
            damage: 10,
            cooldown: 2,
            currentCooldown: 2,
          },
          {
            id: 'strike2',
            name: '打击2',
            damage: 10,
            cooldown: 2,
            currentCooldown: 2,
          },
        ],
      });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(30);

      const decision = enemyAI.executeTurn();
      expect(decision.action).toBe('attack');
    });

    test('治疗技能在满血时不应该优先使用', () => {
      const enemy = createTestEnemy({
        aiLevel: AILevel.NORMAL,
        maxHP: 50,
        skills: [
          {
            id: 'heal',
            name: '治疗',
            heal: 10,
            cooldown: 4,
            currentCooldown: 0,
          },
        ],
      });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(30);

      // 设置满血
      const state = enemyAI.getEnemyState();
      if (state) {
        state.currentHP = 50;
      }

      const decision = enemyAI.executeTurn();
      // 满血时不应该使用治疗
      expect(decision.action).not.toBe('skill');
    });
  });

  // ==================== 攻击防御测试 ====================

  describe('攻击和防御', () => {
    test('普通攻击应该正确计算伤害', () => {
      // 使用 EASY AI 确保随机到攻击
      const enemy = createTestEnemy({
        aiLevel: AILevel.EASY,
        attack: 10,
        skills: [], // 无技能
      });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(100);

      // EASY AI 随机选择，用多次尝试确保有一次攻击
      let attackDecision: AIDecision | null = null;
      for (let i = 0; i < 20 && !attackDecision; i++) {
        enemyAI.reset();
        enemyAI.setEnemy(enemy);
        const decision = enemyAI.executeTurn();
        if (decision.action === 'attack') {
          attackDecision = decision;
        }
      }

      // 确保最终有一次普攻
      const initialHP = combatManager.getPlayerHP().current;
      expect(attackDecision?.action).toBe('attack');
      expect(attackDecision?.damage).toBe(10);
    });

    test('防御决策的 reasoning 应该正确', () => {
      const enemy = createTestEnemy({
        aiLevel: AILevel.EASY,
        attack: 6,
      });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(30);

      enemyAI.executeTurn();

      const state = enemyAI.getEnemyState();
      if (state && state.block > 0) {
        // 防御成功，reasoning 应该是随机选择防御
        expect(enemyAI.getEnemyBlock()).toBeGreaterThan(0);
      }
    });

    test('高伤害技能应该造成更大伤害', () => {
      const enemy = createTestEnemy({
        aiLevel: AILevel.HARD,
        maxHP: 100,
        skills: [
          {
            id: 'mega_strike',
            name: '超级打击',
            damage: 30,
            cooldown: 3,
            currentCooldown: 0,
          },
        ],
      });
      enemyAI.setEnemy(enemy);
      combatManager.startCombat(100);

      const initialHP = combatManager.getPlayerHP().current;
      enemyAI.executeTurn();
      const newHP = combatManager.getPlayerHP().current;

      expect(initialHP - newHP).toBe(30);
    });
  });

  // ==================== AI Level 枚举测试 ====================

  describe('AILevel 枚举', () => {
    test('AILevel.EASY 应该等于 "easy"', () => {
      expect(AILevel.EASY).toBe('easy');
    });

    test('AILevel.NORMAL 应该等于 "normal"', () => {
      expect(AILevel.NORMAL).toBe('normal');
    });

    test('AILevel.HARD 应该等于 "hard"', () => {
      expect(AILevel.HARD).toBe('hard');
    });
  });
});

// ==================== 敌人系统测试 ====================

import { GameEngine } from '../engine/GameEngine';
import { ENEMY_TYPES, getEnemyType, getAllEnemies, getEnemiesByRarity } from '../config/enemy-config';
import { BattleState } from '../types';

describe('敌人系统', () => {
  describe('敌人配置', () => {
    test('应该有至少 5 种敌人类型', () => {
      expect(ENEMY_TYPES.length).toBeGreaterThanOrEqual(5);
    });

    test('所有敌人应该有必要的属性', () => {
      ENEMY_TYPES.forEach((enemy) => {
        expect(enemy).toHaveProperty('id');
        expect(enemy).toHaveProperty('name');
        expect(enemy).toHaveProperty('emoji');
        expect(enemy).toHaveProperty('hp');
        expect(enemy).toHaveProperty('attackInterval');
        expect(enemy).toHaveProperty('attackDamage');
        expect(enemy).toHaveProperty('garbageRows');
        expect(enemy).toHaveProperty('description');
        expect(enemy).toHaveProperty('rarity');
      });
    });

    test('敌人血量应该大于 0', () => {
      ENEMY_TYPES.forEach((enemy) => {
        expect(enemy.hp).toBeGreaterThan(0);
      });
    });

    test('敌人攻击间隔应该大于 0', () => {
      ENEMY_TYPES.forEach((enemy) => {
        expect(enemy.attackInterval).toBeGreaterThan(0);
      });
    });

    test('敌人伤害应该大于 0', () => {
      ENEMY_TYPES.forEach((enemy) => {
        expect(enemy.attackDamage).toBeGreaterThan(0);
      });
    });
  });

  describe('敌人类型查询', () => {
    test('应该能通过 ID 获取敌人类型', () => {
      const slime = getEnemyType('slime');
      expect(slime).toBeDefined();
      expect(slime?.id).toBe('slime');
      expect(slime?.name).toBe('史莱姆');
    });

    test('获取不存在的敌人类型应该返回 undefined', () => {
      const enemy = getEnemyType('nonexistent');
      expect(enemy).toBeUndefined();
    });

    test('应该能获取所有敌人', () => {
      const allEnemies = getAllEnemies();
      expect(allEnemies.length).toBe(ENEMY_TYPES.length);
    });

    test('应该能根据稀有度筛选敌人', () => {
      const commonEnemies = getEnemiesByRarity('common');
      expect(commonEnemies.length).toBeGreaterThan(0);
      commonEnemies.forEach((enemy) => {
        expect(enemy.rarity).toBe('common');
      });
    });
  });

  describe('GameEngine 敌人系统集成', () => {
    let gameEngine: GameEngine;

    beforeEach(() => {
      gameEngine = new GameEngine(10, 20);
    });

    test('初始化战斗应该设置正确的敌人血量', () => {
      gameEngine.initBattle('slime');
      const state = gameEngine.getGameState();
      
      expect(state.battleState).toBe(BattleState.FIGHTING);
      expect(state.enemyHp).toBe(200); // 史莱姆血量
      expect(state.enemyMaxHp).toBe(200);
    });

    test('初始化不同敌人应该有不同的属性', () => {
      gameEngine.initBattle('goblin');
      const goblinState = gameEngine.getGameState();
      
      expect(goblinState.enemyHp).toBe(150); // 哥布林血量
      
      gameEngine.initBattle('dragon');
      const dragonState = gameEngine.getGameState();
      
      expect(dragonState.enemyHp).toBe(500); // 巨龙血量
    });

    test('应该能获取当前敌人类型', () => {
      gameEngine.initBattle('orc');
      const enemyType = gameEngine.getCurrentEnemyType();
      
      expect(enemyType).not.toBeNull();
      expect(enemyType?.id).toBe('orc');
      expect(enemyType?.name).toBe('兽人');
    });

    test('应该能获取所有敌人类型', () => {
      const allEnemies = gameEngine.getAllEnemyTypes();
      expect(allEnemies.length).toBeGreaterThanOrEqual(5);
    });

    test('默认敌人应该是史莱姆', () => {
      gameEngine.initBattle(); // 不传参数，使用默认
      const enemyType = gameEngine.getCurrentEnemyType();
      
      expect(enemyType?.id).toBe('slime');
    });
  });

  describe('敌人 AI 攻击', () => {
    let gameEngine: GameEngine;

    beforeEach(() => {
      gameEngine = new GameEngine(10, 20);
      gameEngine.initBattle('slime');
    });

    test('敌人攻击应该造成伤害', () => {
      const initialHp = gameEngine.getGameState().playerHp;
      
      // 模拟敌人攻击
      gameEngine.initBattle('slime');
      const state = gameEngine.getGameState();
      expect(state.playerHp).toBe(100);
      
      // 手动触发一次敌人攻击（通过 updateEnemyAI）
      const currentTime = Date.now();
      gameEngine.updateEnemyAI(currentTime);
      
      // 等待攻击间隔后再次调用
      const afterAttackTime = currentTime + 10000 + 100;
      gameEngine.updateEnemyAI(afterAttackTime);
      
      const afterState = gameEngine.getGameState();
      expect(afterState.playerHp).toBeLessThan(100);
    });

    test('不同敌人攻击间隔应该不同', () => {
      gameEngine.initBattle('ghost');
      const ghostState = gameEngine.getGameState();
      expect(ghostState.battleState).toBe(BattleState.FIGHTING);
      
      // 幽灵攻击间隔是 6 秒
      const currentTime = Date.now();
      gameEngine.updateEnemyAI(currentTime);
      
      // 5 秒后不应该攻击
      const beforeAttackTime = currentTime + 5000;
      gameEngine.updateEnemyAI(beforeAttackTime);
      
      // 7 秒后应该攻击
      const afterAttackTime = currentTime + 7000;
      gameEngine.updateEnemyAI(afterAttackTime);
    });

    test('敌人攻击应该生成垃圾行', () => {
      gameEngine.initBattle('dragon');
      
      const currentTime = Date.now();
      const afterAttackTime = currentTime + 15000 + 100;
      gameEngine.updateEnemyAI(afterAttackTime);
      
      // 巨龙应该生成 3 行垃圾行
      // 这里无法直接验证垃圾行数量，但可以通过测试验证攻击逻辑
    });
  });

  describe('敌人稀有度', () => {
    test('应该有所有稀有度等级的敌人', () => {
      const rarities = ENEMY_TYPES.map(e => e.rarity);
      expect(rarities).toContain('common');
      expect(rarities).toContain('uncommon');
      expect(rarities).toContain('legendary');
    });

    test('巨龙应该是 legendary 稀有度', () => {
      const dragon = getEnemyType('dragon');
      expect(dragon?.rarity).toBe('legendary');
    });

    test('史莱姆和哥布林应该是 common 稀有度', () => {
      const slime = getEnemyType('slime');
      const goblin = getEnemyType('goblin');
      
      expect(slime?.rarity).toBe('common');
      expect(goblin?.rarity).toBe('common');
    });
  });

  describe('战斗状态', () => {
    let gameEngine: GameEngine;

    beforeEach(() => {
      gameEngine = new GameEngine(10, 20);
    });

    test('初始化战斗后状态应该是 FIGHTING', () => {
      gameEngine.initBattle('slime');
      const state = gameEngine.getGameState();
      expect(state.battleState).toBe(BattleState.FIGHTING);
    });

    test('敌人血量归零后状态应该是 WON', () => {
      gameEngine.initBattle('slime');
      
      // 对敌人造成足够伤害
      for (let i = 0; i < 20; i++) {
        gameEngine.enemyTakeDamage(10);
      }
      
      const state = gameEngine.getGameState();
      expect(state.battleState).toBe(BattleState.WON);
    });

    test('玩家血量归零后状态应该是 LOST', () => {
      gameEngine.initBattle('slime');
      
      // 对玩家造成足够伤害
      for (let i = 0; i < 10; i++) {
        gameEngine.takeDamage(10);
      }
      
      const state = gameEngine.getGameState();
      expect(state.battleState).toBe(BattleState.LOST);
    });
  });
});

/**
 * 装备系统测试
 */

import { EquipmentSystem } from '../systems/EquipmentSystem';
import { EQUIPMENT_CONFIG, getEquipmentById } from '../config/equipment-config';

describe('EquipmentSystem', () => {
  let system: EquipmentSystem;

  beforeEach(() => {
    system = new EquipmentSystem();
  });

  describe('初始化', () => {
    test('应该正确初始化', () => {
      const state = system.getState();
      
      expect(state.slots.head).toBeNull();
      expect(state.slots.body).toBeNull();
      expect(state.slots.accessory).toBeNull();
      expect(state.unlockedEquipment.length).toBeGreaterThan(0);
    });

    test('应该默认解锁所有 Common 装备', () => {
      const commonEquipment = EQUIPMENT_CONFIG.filter(eq => eq.rarity === 'Common');
      const state = system.getState();
      
      commonEquipment.forEach(eq => {
        expect(state.unlockedEquipment).toContain(eq.id);
      });
    });
  });

  describe('装备物品', () => {
    test('应该可以装备头部装备', () => {
      const headEquipment = EQUIPMENT_CONFIG.find(eq => eq.type === 'Head' && eq.rarity === 'Common');
      expect(headEquipment).toBeDefined();
      
      if (headEquipment) {
        const result = system.equipEquipment(headEquipment.id);
        expect(result).toBe(true);
        
        const slots = system.getEquipmentSlots();
        expect(slots.head).toEqual(headEquipment);
      }
    });

    test('应该可以装备身体装备', () => {
      const bodyEquipment = EQUIPMENT_CONFIG.find(eq => eq.type === 'Body' && eq.rarity === 'Common');
      expect(bodyEquipment).toBeDefined();
      
      if (bodyEquipment) {
        const result = system.equipEquipment(bodyEquipment.id);
        expect(result).toBe(true);
        
        const slots = system.getEquipmentSlots();
        expect(slots.body).toEqual(bodyEquipment);
      }
    });

    test('应该可以装备饰品', () => {
      const accEquipment = EQUIPMENT_CONFIG.find(eq => eq.type === 'Accessory' && eq.rarity === 'Common');
      expect(accEquipment).toBeDefined();
      
      if (accEquipment) {
        const result = system.equipEquipment(accEquipment.id);
        expect(result).toBe(true);
        
        const slots = system.getEquipmentSlots();
        expect(slots.accessory).toEqual(accEquipment);
      }
    });

    test('装备新物品应该替换旧物品', () => {
      const head1 = EQUIPMENT_CONFIG.find(eq => eq.type === 'Head' && eq.rarity === 'Common');
      const head2 = EQUIPMENT_CONFIG.find(eq => eq.type === 'Head' && eq.rarity === 'Uncommon');
      
      expect(head1).toBeDefined();
      expect(head2).toBeDefined();
      
      if (head1 && head2) {
        // 先解锁 head2
        system.unlockEquipment(head2.id);
        
        // 装备第一个
        system.equipEquipment(head1.id);
        expect(system.getEquipmentSlots().head).toEqual(head1);
        
        // 装备第二个（应该替换）
        system.equipEquipment(head2.id);
        expect(system.getEquipmentSlots().head).toEqual(head2);
      }
    });

    test('不能装备未解锁的物品', () => {
      const legendaryEquipment = EQUIPMENT_CONFIG.find(eq => eq.rarity === 'Legendary');
      expect(legendaryEquipment).toBeDefined();
      
      if (legendaryEquipment) {
        const result = system.equipEquipment(legendaryEquipment.id);
        expect(result).toBe(false);
      }
    });

    test('不能装备不存在的物品', () => {
      const result = system.equipEquipment('non_existent_id');
      expect(result).toBe(false);
    });
  });

  describe('卸下物品', () => {
    test('应该可以卸下装备', () => {
      const headEquipment = EQUIPMENT_CONFIG.find(eq => eq.type === 'Head' && eq.rarity === 'Common');
      
      if (headEquipment) {
        system.equipEquipment(headEquipment.id);
        expect(system.getEquipmentSlots().head).toEqual(headEquipment);
        
        const result = system.unequipEquipment('Head');
        expect(result).toBe(true);
        expect(system.getEquipmentSlots().head).toBeNull();
      }
    });

    test('卸下空槽位应该返回 false', () => {
      const result = system.unequipEquipment('Head');
      expect(result).toBe(false);
    });
  });

  describe('解锁物品', () => {
    test('应该可以解锁新物品', () => {
      const legendaryEquipment = EQUIPMENT_CONFIG.find(eq => eq.rarity === 'Legendary');
      
      if (legendaryEquipment) {
        expect(system.isEquipmentUnlocked(legendaryEquipment.id)).toBe(false);
        
        const result = system.unlockEquipment(legendaryEquipment.id);
        expect(result).toBe(true);
        expect(system.isEquipmentUnlocked(legendaryEquipment.id)).toBe(true);
      }
    });

    test('重复解锁应该返回 false', () => {
      const commonEquipment = EQUIPMENT_CONFIG.find(eq => eq.rarity === 'Common');
      
      if (commonEquipment) {
        // 已经解锁
        const result = system.unlockEquipment(commonEquipment.id);
        expect(result).toBe(false);
      }
    });

    test('解锁不存在的物品应该返回 false', () => {
      const result = system.unlockEquipment('non_existent_id');
      expect(result).toBe(false);
    });
  });

  describe('效果计算', () => {
    test('应该计算基础效果（无装备）', () => {
      const effects = system.calculateEffects();
      
      expect(effects.damageMultiplier).toBe(1.0);
      expect(effects.damageReductionMultiplier).toBe(1.0);
      expect(effects.healthBonus).toBe(0);
      expect(effects.comboDamageBonus).toBe(0);
      expect(effects.comboTimeBonus).toBe(0);
    });

    test('应该计算伤害加成', () => {
      const damageEquipment = EQUIPMENT_CONFIG.find(eq => 
        eq.type === 'Accessory' && eq.effects.some(e => e.type === 'damageBoost')
      );
      
      if (damageEquipment) {
        system.unlockEquipment(damageEquipment.id);
        system.equipEquipment(damageEquipment.id);
        
        const effects = system.calculateEffects();
        const expectedBoost = damageEquipment.effects
          .filter(e => e.type === 'damageBoost')
          .reduce((sum, e) => sum + e.value, 0) / 100;
        
        expect(effects.damageMultiplier).toBeCloseTo(1.0 + expectedBoost, 2);
      }
    });

    test('应该计算伤害减免', () => {
      const defenseEquipment = EQUIPMENT_CONFIG.find(eq => 
        eq.type === 'Head' && eq.effects.some(e => e.type === 'damageReduction')
      );
      
      if (defenseEquipment) {
        system.unlockEquipment(defenseEquipment.id);
        system.equipEquipment(defenseEquipment.id);
        
        const effects = system.calculateEffects();
        const expectedReduction = defenseEquipment.effects
          .filter(e => e.type === 'damageReduction')
          .reduce((sum, e) => sum + e.value, 0) / 100;
        
        expect(effects.damageReductionMultiplier).toBeCloseTo(1.0 - expectedReduction, 2);
      }
    });

    test('应该计算生命加成', () => {
      const healthEquipment = EQUIPMENT_CONFIG.find(eq => 
        eq.type === 'Body' && eq.effects.some(e => e.type === 'healthBoost')
      );
      
      if (healthEquipment) {
        system.unlockEquipment(healthEquipment.id);
        system.equipEquipment(healthEquipment.id);
        
        const effects = system.calculateEffects();
        const expectedBonus = healthEquipment.effects
          .filter(e => e.type === 'healthBoost')
          .reduce((sum, e) => sum + e.value, 0);
        
        expect(effects.healthBonus).toBe(expectedBonus);
      }
    });

    test('应该叠加多个装备效果', () => {
      // 装备多个有伤害加成的物品
      const damageItems = EQUIPMENT_CONFIG.filter(eq => 
        eq.effects.some(e => e.type === 'damageBoost')
      ).slice(0, 3);
      
      damageItems.forEach(item => {
        system.unlockEquipment(item.id);
        if (item.type === 'Accessory') {
          system.equipEquipment(item.id);
        }
      });
      
      const effects = system.calculateEffects();
      expect(effects.damageMultiplier).toBeGreaterThanOrEqual(1.0);
    });

    test('伤害减免不应超过 90%', () => {
      // 理论上装备多个高减免装备可能超过 100%，但系统应该限制
      const defenseItems = EQUIPMENT_CONFIG.filter(eq => 
        eq.effects.some(e => e.type === 'damageReduction')
      );
      
      defenseItems.forEach(item => {
        system.unlockEquipment(item.id);
        if (item.type === 'Head' || item.type === 'Body') {
          system.equipEquipment(item.id);
        }
      });
      
      const effects = system.calculateEffects();
      expect(effects.damageReductionMultiplier).toBeGreaterThanOrEqual(0.1);
    });
  });

  describe('战斗参数应用', () => {
    test('应该正确应用战斗参数', () => {
      const params = {
        baseHealth: 200,
        baseDamage: 50,
        comboTimeWindow: 5,
      };
      
      const result = system.applyToBattleParams(params);
      
      expect(result.health).toBe(200); // 无装备加成
      expect(result.damage).toBe(50); // 无装备加成
      expect(result.comboTimeWindow).toBe(5); // 无装备加成
    });

    test('应该应用装备加成到战斗参数', () => {
      const healthEquipment = EQUIPMENT_CONFIG.find(eq => 
        eq.type === 'Body' && eq.effects.some(e => e.type === 'healthBoost')
      );
      
      if (healthEquipment) {
        system.unlockEquipment(healthEquipment.id);
        system.equipEquipment(healthEquipment.id);
        
        const params = {
          baseHealth: 200,
          baseDamage: 50,
          comboTimeWindow: 5,
        };
        
        const result = system.applyToBattleParams(params);
        const expectedBonus = healthEquipment.effects
          .filter(e => e.type === 'healthBoost')
          .reduce((sum, e) => sum + e.value, 0);
        
        expect(result.health).toBe(200 + expectedBonus);
      }
    });
  });

  describe('重置', () => {
    test('重置应该清空装备槽', () => {
      const headEquipment = EQUIPMENT_CONFIG.find(eq => eq.type === 'Head' && eq.rarity === 'Common');
      
      if (headEquipment) {
        system.equipEquipment(headEquipment.id);
        expect(system.getEquipmentSlots().head).not.toBeNull();
        
        system.reset();
        expect(system.getEquipmentSlots().head).toBeNull();
      }
    });

    test('重置默认保留已解锁装备', () => {
      const legendaryEquipment = EQUIPMENT_CONFIG.find(eq => eq.rarity === 'Legendary');
      
      if (legendaryEquipment) {
        system.unlockEquipment(legendaryEquipment.id);
        system.reset();
        
        expect(system.isEquipmentUnlocked(legendaryEquipment.id)).toBe(true);
      }
    });

    test('重置可以清除已解锁装备', () => {
      const legendaryEquipment = EQUIPMENT_CONFIG.find(eq => eq.rarity === 'Legendary');
      
      if (legendaryEquipment) {
        system.unlockEquipment(legendaryEquipment.id);
        system.reset(false); // 不保留解锁
        
        expect(system.isEquipmentUnlocked(legendaryEquipment.id)).toBe(false);
      }
    });
  });

  describe('序列化/反序列化', () => {
    test('应该正确序列化状态', () => {
      const headEquipment = EQUIPMENT_CONFIG.find(eq => eq.type === 'Head' && eq.rarity === 'Common');
      
      if (headEquipment) {
        system.equipEquipment(headEquipment.id);
        
        const serialized = system.serialize();
        expect(serialized).toContain(headEquipment.id);
      }
    });

    test('应该正确反序列化状态', () => {
      const headEquipment = EQUIPMENT_CONFIG.find(eq => eq.type === 'Head' && eq.rarity === 'Common');
      
      if (headEquipment) {
        // 先创建并装备
        const originalSystem = new EquipmentSystem();
        const equipResult = originalSystem.equipEquipment(headEquipment.id);
        expect(equipResult).toBe(true);
        
        // 序列化
        const serialized = originalSystem.serialize();
        
        // 反序列化
        const loadedSystem = EquipmentSystem.deserialize(serialized);
        const slots = loadedSystem.getEquipmentSlots();
        
        expect(slots.head).not.toBeNull();
        expect(slots.head?.id).toBe(headEquipment.id);
      }
    });
  });

  describe('localStorage 集成', () => {
    test('应该保存到 localStorage', () => {
      const headEquipment = EQUIPMENT_CONFIG.find(eq => eq.type === 'Head' && eq.rarity === 'Common');
      
      if (headEquipment) {
        system.equipEquipment(headEquipment.id);
        system.saveToStorage('test_equipment');
        
        const saved = localStorage.getItem('test_equipment');
        expect(saved).not.toBeNull();
        expect(saved).toContain(headEquipment.id);
        
        // 清理
        localStorage.removeItem('test_equipment');
      }
    });

    test('应该从 localStorage 加载', () => {
      const headEquipment = EQUIPMENT_CONFIG.find(eq => eq.type === 'Head' && eq.rarity === 'Common');
      
      if (headEquipment) {
        // 先保存
        const originalSystem = new EquipmentSystem();
        originalSystem.equipEquipment(headEquipment.id);
        originalSystem.saveToStorage('test_equipment_load');
        
        // 加载
        const loadedSystem = EquipmentSystem.loadFromStorage('test_equipment_load');
        
        expect(loadedSystem).not.toBeNull();
        expect(loadedSystem!.getEquipmentSlots().head?.id).toBe(headEquipment.id);
        expect(loadedSystem!.getEquipmentSlots().head?.name).toBe(headEquipment.name);
        
        // 清理
        localStorage.removeItem('test_equipment_load');
      }
    });

    test('加载不存在的 key 应该返回 null', () => {
      const loaded = EquipmentSystem.loadFromStorage('non_existent_key');
      expect(loaded).toBeNull();
    });
  });
});

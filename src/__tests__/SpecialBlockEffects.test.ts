// ==================== 特殊方块效果单元测试 ====================
// v2.0.1 - 测试特殊方块效果触发逻辑

import { CARD_DATABASE, CardDatabase } from '../core/CardDatabase';
import { CardType, CardRarity } from '../types/card.v2';
import { SpecialEffectSystem } from '../system/SpecialEffectSystem';

describe('特殊方块效果', () => {
  const specialBlockIds = [
    'bomb_block',
    'time_stop',
    'heal',
    'defend', // 有 shield 效果
    'combo_boost',
    'lightning_strike',
  ];

  describe('卡牌数据验证', () => {
    it('所有特殊方块应该有 special 字段', () => {
      const specialCards = CARD_DATABASE.getAllCards().filter(card => card.special);
      
      expect(specialCards.length).toBeGreaterThan(0);
      
      specialCards.forEach(card => {
        expect(card.special).toBeDefined();
        expect(card.special).not.toBe('');
        console.log(`✅ ${card.name}: special = "${card.special}"`);
      });
    });

    it('所有特殊方块应该是攻击卡或技能卡类型', () => {
      const specialCards = CARD_DATABASE.getAllCards().filter(card => card.special);
      
      specialCards.forEach(card => {
        expect([CardType.ATTACK, CardType.SKILL]).toContain(card?.type);
      });
    });

    it('炸弹方块应该有 eliminate_3x3 效果', () => {
      const bombBlock = CARD_DATABASE.getCard('bomb_block');
      expect(bombBlock).toBeDefined();
      expect(bombBlock?.special).toBe('eliminate_3x3');
      expect(bombBlock?.type).toBe(CardType.ATTACK);
      expect(bombBlock?.damage).toBe(15);
    });

    it('时间停止应该有 pause_enemy_10s 效果', () => {
      const timeStop = CARD_DATABASE.getCard('time_stop');
      expect(timeStop).toBeDefined();
      expect(timeStop?.special).toBe('pause_enemy_10s');
      expect(timeStop?.type).toBe(CardType.SKILL);
      expect(timeStop?.rarity).toBe(CardRarity.LEGENDARY);
    });

    it('治疗应该有 heal_3hp 效果', () => {
      const heal = CARD_DATABASE.getCard('heal');
      expect(heal).toBeDefined();
      expect(heal?.special).toBe('heal_3hp');
      expect(heal?.type).toBe(CardType.SKILL);
    });

    it('连击强化应该有 combo_plus_2 效果', () => {
      const comboBoost = CARD_DATABASE.getCard('combo_boost');
      expect(comboBoost).toBeDefined();
      expect(comboBoost?.special).toBe('combo_plus_2');
      expect(comboBoost?.type).toBe(CardType.SKILL);
    });

    it('闪电打击应该有 chance_crit 效果', () => {
      const lightningStrike = CARD_DATABASE.getCard('lightning_strike');
      expect(lightningStrike).toBeDefined();
      expect(lightningStrike?.special).toBe('chance_crit');
      expect(lightningStrike?.type).toBe(CardType.ATTACK);
    });
  });

  describe('特殊效果系统', () => {
    beforeEach(() => {
      SpecialEffectSystem.reset();
    });

    it('特殊效果系统应该能初始化', () => {
      SpecialEffectSystem.initialize();
      const effects = SpecialEffectSystem.getRegisteredEffects();
      expect(effects.length).toBeGreaterThan(0);
      console.log(`已注册 ${effects.length} 种特殊效果`);
    });

    it('应该包含所有定义的特殊效果', () => {
      SpecialEffectSystem.initialize();
      
      const expectedEffects = [
        'eliminate_3x3',
        'pause_enemy_10s',
        'heal_3hp',
        'shield_5',
        'combo_plus_2',
        'clear_all_garbage',
        'lucky_7th_double',
        'freeze_enemy_3s',
        'burn_10_5s',
        'lightning_chain',
        'chance_crit',
      ];

      expectedEffects.forEach(effectId => {
        expect(SpecialEffectSystem.hasEffect(effectId)).toBe(true);
      });
    });

    it('触发未知效果应该输出警告', () => {
      SpecialEffectSystem.initialize();
      
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const mockCard = CARD_DATABASE.getCard('strike')!;
      
      SpecialEffectSystem.trigger('unknown_effect', mockCard, {
        playerHp: 100,
        playerMaxHp: 100,
        enemyHp: 200,
        enemyMaxHp: 200,
        combo: 1,
        paused: false,
        healPlayer: () => {},
        damageEnemy: () => {},
        damagePlayer: () => {},
        setEnemyPaused: () => {},
        setPlayerShield: () => {},
        clearGarbageRows: () => 0,
        eliminate3x3: () => 0,
        triggerLightningChain: () => {},
        applyBurnDamage: () => {},
        freezeEnemy: () => {},
        setLuckyMode: () => {},
        addCombo: () => {},
      });

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('未找到特殊效果'));
      warnSpy.mockRestore();
    });
  });

  describe('特殊效果触发测试', () => {
    beforeEach(() => {
      SpecialEffectSystem.reset();
      SpecialEffectSystem.initialize();
    });

    it('治疗效果应该能恢复生命值', () => {
      let healedAmount = 0;
      const mockCard = CARD_DATABASE.getCard('heal')!;
      
      SpecialEffectSystem.trigger('heal_3hp', mockCard, {
        playerHp: 50,
        playerMaxHp: 100,
        enemyHp: 200,
        enemyMaxHp: 200,
        combo: 1,
        paused: false,
        healPlayer: (amount: number) => {
          healedAmount = amount;
        },
        damageEnemy: () => {},
        damagePlayer: () => {},
        setEnemyPaused: () => {},
        setPlayerShield: () => {},
        clearGarbageRows: () => 0,
        eliminate3x3: () => 0,
        triggerLightningChain: () => {},
        applyBurnDamage: () => {},
        freezeEnemy: () => {},
        setLuckyMode: () => {},
        addCombo: () => {},
      });

      expect(healedAmount).toBe(3);
    });

    it('连击强化效果应该能增加连击数', () => {
      let comboAdded = 0;
      const mockCard = CARD_DATABASE.getCard('combo_boost')!;
      
      SpecialEffectSystem.trigger('combo_plus_2', mockCard, {
        playerHp: 100,
        playerMaxHp: 100,
        enemyHp: 200,
        enemyMaxHp: 200,
        combo: 1,
        paused: false,
        healPlayer: () => {},
        damageEnemy: () => {},
        damagePlayer: () => {},
        setEnemyPaused: () => {},
        setPlayerShield: () => {},
        clearGarbageRows: () => 0,
        eliminate3x3: () => 0,
        triggerLightningChain: () => {},
        applyBurnDamage: () => {},
        freezeEnemy: () => {},
        setLuckyMode: () => {},
        addCombo: (amount: number) => {
          comboAdded = amount;
        },
      });

      expect(comboAdded).toBe(2);
    });

    it('时间停止效果应该能暂停敌人', () => {
      let pauseDuration = 0;
      const mockCard = CARD_DATABASE.getCard('time_stop')!;
      
      SpecialEffectSystem.trigger('pause_enemy_10s', mockCard, {
        playerHp: 100,
        playerMaxHp: 100,
        enemyHp: 200,
        enemyMaxHp: 200,
        combo: 1,
        paused: false,
        healPlayer: () => {},
        damageEnemy: () => {},
        damagePlayer: () => {},
        setEnemyPaused: (paused: boolean, duration?: number) => {
          if (paused && duration) {
            pauseDuration = duration;
          }
        },
        setPlayerShield: () => {},
        clearGarbageRows: () => 0,
        eliminate3x3: () => 0,
        triggerLightningChain: () => {},
        applyBurnDamage: () => {},
        freezeEnemy: () => {},
        setLuckyMode: () => {},
        addCombo: () => {},
      });

      expect(pauseDuration).toBe(10000); // 10 秒
    });
  });

  describe('特殊方块统计', () => {
    it('应该至少有 5 张带有特殊效果的卡牌', () => {
      const specialCards = CARD_DATABASE.getAllCards().filter(card => card.special);
      expect(specialCards.length).toBeGreaterThanOrEqual(5);
      console.log(`总共有 ${specialCards.length} 张特殊效果卡牌`);
    });

    it('特殊效果卡牌应该有不同的稀有度', () => {
      const specialCards = CARD_DATABASE.getAllCards().filter(card => card.special);
      const rarities = new Set(specialCards.map(card => card.rarity));
      
      expect(rarities.size).toBeGreaterThan(1);
      console.log(`特殊效果卡牌稀有度分布：${Array.from(rarities).join(', ')}`);
    });
  });
});

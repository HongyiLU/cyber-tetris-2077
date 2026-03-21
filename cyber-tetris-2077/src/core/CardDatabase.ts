/**
 * @fileoverview 卡牌数据库 v2.0.0
 * 包含所有卡牌定义、升级效果和奖励池管理
 */

import {
  Card,
  CardRarity,
  CardShape,
  CardSpecialEffect,
  getUpgradeMultiplier,
} from '../types/card.v2';
import {
  REWARD_CONFIG,
  getStageRewardConfig,
  rollRarity,
} from '../config/reward-config';

/**
 * 卡牌数据库类
 * 管理所有卡牌数据、升级效果和奖励生成
 */
export class CardDatabase {
  /** 所有卡牌注册表 */
  private cardRegistry: Map<string, Card> = new Map();

  /** 按稀有度分类的卡牌索引 */
  private cardsByRarity: Map<CardRarity, Card[]> = new Map();

  constructor() {
    this.initializeCards();
  }

  /**
   * 初始化所有卡牌数据
   * 定义游戏中的所有卡牌及其升级效果
   */
  private initializeCards(): void {
    // ============ 普通卡（COMMON）============
    this.registerCard({
      id: 'i_block',
      name: 'I方块',
      cost: 0,
      shape: [[1], [1], [1], [1]],
      rarity: CardRarity.COMMON,
      damage: 5,
      description: '消除1行',
      specialEffect: CardSpecialEffect.CLEAR_LINES,
      specialValue: 1,
      upgrade: { damage: 3 },
      upgradeLevel: 0,
    });

    this.registerCard({
      id: 'o_block',
      name: 'O方块',
      cost: 0,
      shape: [
        [1, 1],
        [1, 1],
      ],
      rarity: CardRarity.COMMON,
      damage: 8,
      description: '消除2行',
      specialEffect: CardSpecialEffect.CLEAR_LINES,
      specialValue: 2,
      upgrade: { damage: 4 },
      upgradeLevel: 0,
    });

    this.registerCard({
      id: 'l_block',
      name: 'L方块',
      cost: 1,
      shape: [
        [1, 0],
        [1, 0],
        [1, 1],
      ],
      rarity: CardRarity.COMMON,
      damage: 6,
      description: '消除2行',
      specialEffect: CardSpecialEffect.CLEAR_LINES,
      specialValue: 2,
      upgrade: { damage: 3 },
      upgradeLevel: 0,
    });

    this.registerCard({
      id: 'j_block',
      name: 'J方块',
      cost: 1,
      shape: [
        [0, 1],
        [0, 1],
        [1, 1],
      ],
      rarity: CardRarity.COMMON,
      damage: 6,
      description: '消除2行',
      specialEffect: CardSpecialEffect.CLEAR_LINES,
      specialValue: 2,
      upgrade: { damage: 3 },
      upgradeLevel: 0,
    });

    this.registerCard({
      id: 't_block',
      name: 'T方块',
      cost: 1,
      shape: [
        [1, 1, 1],
        [0, 1, 0],
      ],
      rarity: CardRarity.COMMON,
      damage: 7,
      description: '消除2行',
      specialEffect: CardSpecialEffect.CLEAR_LINES,
      specialValue: 2,
      upgrade: { damage: 4 },
      upgradeLevel: 0,
    });

    // ============ 稀有卡（UNCOMMON）============
    this.registerCard({
      id: 's_block',
      name: 'S方块',
      cost: 1,
      shape: [
        [0, 1, 1],
        [1, 1, 0],
      ],
      rarity: CardRarity.UNCOMMON,
      damage: 8,
      block: 5,
      description: '消除3行，获得5护盾',
      specialEffect: CardSpecialEffect.CLEAR_LINES,
      specialValue: 3,
      upgrade: { damage: 4, block: 3 },
      upgradeLevel: 0,
    });

    this.registerCard({
      id: 'z_block',
      name: 'Z方块',
      cost: 1,
      shape: [
        [1, 1, 0],
        [0, 1, 1],
      ],
      rarity: CardRarity.UNCOMMON,
      damage: 8,
      poison: 2,
      description: '消除3行，敌人中毒2层',
      specialEffect: CardSpecialEffect.POISON,
      specialValue: 2,
      upgrade: { damage: 4, poison: 1 },
      upgradeLevel: 0,
    });

    this.registerCard({
      id: 'bomb_block',
      name: '炸弹方块',
      cost: 2,
      shape: [
        [1, 1],
        [1, 1],
      ],
      rarity: CardRarity.UNCOMMON,
      damage: 15,
      description: '3x3范围15伤害',
      specialEffect: CardSpecialEffect.AREA_DAMAGE,
      specialValue: 3,
      upgrade: { damage: 8 },
      upgradeLevel: 0,
    });

    this.registerCard({
      id: 'heal_block',
      name: '治疗方块',
      cost: 1,
      shape: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
      ],
      rarity: CardRarity.UNCOMMON,
      heal: 5,
      description: '消除2行，恢复5HP',
      specialEffect: CardSpecialEffect.HEAL,
      specialValue: 2,
      upgrade: { heal: 3 },
      upgradeLevel: 0,
    });

    this.registerCard({
      id: 'shield_block',
      name: '护盾方块',
      cost: 1,
      shape: [
        [1, 1],
        [1, 1],
      ],
      rarity: CardRarity.UNCOMMON,
      block: 10,
      description: '消除2行，获得10护盾',
      specialEffect: CardSpecialEffect.SHIELD,
      specialValue: 2,
      upgrade: { block: 5 },
      upgradeLevel: 0,
    });

    // ============ 史诗卡（EPIC）============
    this.registerCard({
      id: 'time_block',
      name: '时间停止',
      cost: 3,
      shape: [
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
        [1, 1, 1, 1],
      ],
      rarity: CardRarity.EPIC,
      damage: 10,
      description: '4x4消除，敌人暂停3回合',
      specialEffect: CardSpecialEffect.STUN,
      specialValue: 3,
      upgrade: { damage: 5, specialValue: 2 },
      upgradeLevel: 0,
    });

    this.registerCard({
      id: 'combo_block',
      name: '连击方块',
      cost: 2,
      shape: [
        [1, 1, 1],
        [0, 1, 0],
      ],
      rarity: CardRarity.EPIC,
      damage: 0,
      description: '消除行数×2伤害',
      specialEffect: CardSpecialEffect.COMBO_DAMAGE,
      specialValue: 2,
      upgrade: { specialValue: 1 },
      upgradeLevel: 0,
    });

    this.registerCard({
      id: 'lightning_block',
      name: '雷电方块',
      cost: 2,
      shape: [[1, 1], [1, 1]],
      rarity: CardRarity.EPIC,
      damage: 20,
      description: '消除4行，20伤害',
      specialEffect: CardSpecialEffect.CLEAR_LINES,
      specialValue: 4,
      upgrade: { damage: 10 },
      upgradeLevel: 0,
    });

    // ============ 传说卡（LEGENDARY）============
    this.registerCard({
      id: 'clear_block',
      name: '全清方块',
      cost: 3,
      shape: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      rarity: CardRarity.LEGENDARY,
      damage: 50,
      description: '清除所有垃圾行+50伤害',
      specialEffect: CardSpecialEffect.CLEAR_GARBAGE,
      specialValue: 50,
      upgrade: { damage: 25, specialValue: 25 },
      upgradeLevel: 0,
    });
  }

  /**
   * 注册卡牌到数据库
   * @param card 卡牌数据
   */
  private registerCard(card: Card): void {
    this.cardRegistry.set(card.id, card);

    const rarityGroup = this.cardsByRarity.get(card.rarity) ?? [];
    rarityGroup.push(card);
    this.cardsByRarity.set(card.rarity, rarityGroup);
  }

  /**
   * 获取所有卡牌
   * @returns 所有卡牌数组
   */
  getAllCards(): Card[] {
    return Array.from(this.cardRegistry.values());
  }

  /**
   * 根据ID获取卡牌
   * @param id 卡牌ID
   * @returns 卡牌实例（克隆）
   */
  getCardById(id: string): Card | undefined {
    const card = this.cardRegistry.get(id);
    return card ? this.cloneCard(card) : undefined;
  }

  /**
   * 根据稀有度获取卡牌
   * @param rarity 稀有度
   * @returns 该稀有度的所有卡牌
   */
  getCardsByRarity(rarity: CardRarity): Card[] {
    const cards = this.cardsByRarity.get(rarity) ?? [];
    return cards.map((c) => this.cloneCard(c));
  }

  /**
   * 获取卡牌的升级效果
   * 根据当前 upgradeLevel 计算升级后的卡牌效果
   * 公式: baseStat + floor(upgradeBonus * multiplier)
   * @param card 原始卡牌
   * @returns 升级效果应用后的卡牌
   */
  getUpgradeEffect(card: Card): Card {
    const upgradedCard = this.cloneCard(card);
    const multiplier = getUpgradeMultiplier(card.upgradeLevel);

    if (card.upgrade) {
      const u = card.upgrade;
      // P0-1 正确公式: baseStat + floor(upgradeBonus * multiplier)
      if (u.damage !== undefined) {
        upgradedCard.damage =
          (card.damage ?? 0) + Math.floor((u.damage ?? 0) * multiplier);
      }
      if (u.block !== undefined) {
        upgradedCard.block =
          (card.block ?? 0) + Math.floor((u.block ?? 0) * multiplier);
      }
      if (u.poison !== undefined) {
        upgradedCard.poison =
          (card.poison ?? 0) + Math.floor((u.poison ?? 0) * multiplier);
      }
      if (u.heal !== undefined) {
        upgradedCard.heal =
          (card.heal ?? 0) + Math.floor((u.heal ?? 0) * multiplier);
      }
      if (u.specialValue !== undefined) {
        upgradedCard.specialValue =
          (card.specialValue ?? 0) +
          Math.floor((u.specialValue ?? 0) * multiplier);
      }
    }

    return upgradedCard;
  }

  /**
   * 根据关卡获取奖励池卡牌
   * 根据关卡配置决定各稀有度权重，从卡池中抽取
   * @param stage 关卡数 (1-4)
   * @returns 符合该关卡权重分布的卡牌数组
   */
  getRewardPool(stage: number): Card[] {
    const config = getStageRewardConfig(stage);
    const { rarityWeights } = config;
    const pool: Card[] = [];

    for (const [rarityStr, weight] of Object.entries(rarityWeights)) {
      if (weight === undefined || weight <= 0) continue;
      const rarity = rarityStr as CardRarity;
      const cards = this.getCardsByRarity(rarity);
      // 按照权重计算该稀有度应抽取的卡牌数量（基准1张，按权重比例增加）
      const count = Math.max(1, Math.floor(weight / 20));
      for (let i = 0; i < count && i < cards.length; i++) {
        pool.push(this.cloneCard(cards[i]));
      }
    }

    return pool;
  }

  /**
   * 生成奖励选项
   * 从奖励池中随机抽取指定数量的卡牌作为可选奖励
   * @param deck 当前卡组（可用于未来个性化推荐）
   * @param stage 关卡数
   * @returns 奖励选项数组
   */
  generateRewardOptions(deck: Card[], stage: number): import('../types/deck-builder').RewardOption[] {
    const pool = this.getRewardPool(stage);
    const optionsCount = REWARD_CONFIG.optionsCount;

    // P0-2: 空池处理
    if (pool.length === 0) {
      console.warn(`[CardDatabase] Reward pool is empty for stage ${stage}`);
      return [];
    }

    // Fisher-Yates 洗牌
    const shuffled = this.shuffleArray([...pool]);
    const options: import('../types/deck-builder').RewardOption[] = [];

    for (let i = 0; i < Math.min(optionsCount, shuffled.length); i++) {
      options.push({
        id: `reward_${Date.now()}_${i}`, // 唯一标识符
        cards: [this.cloneCard(shuffled[i])],
        skipBonus: REWARD_CONFIG.skipBonus,
      });
    }

    return options;
  }

  /**
   * 克隆卡牌（深拷贝）
   * @param card 要克隆的卡牌
   * @returns 卡牌副本
   */
  private cloneCard(card: Card): Card {
    return {
      ...card,
      shape: card.shape.map((row) => [...row]),
      // P1-1: 深拷贝 upgrade 对象（虽然 CardUpgradeEffect 只有原始类型，但为了一致性做完整拷贝）
      upgrade: card.upgrade
        ? {
            damage: card.upgrade.damage,
            block: card.upgrade.block,
            poison: card.upgrade.poison,
            heal: card.upgrade.heal,
            specialValue: card.upgrade.specialValue,
          }
        : undefined,
    };
  }

  /**
   * 洗牌算法（Fisher-Yates）
   * @param array 要洗牌的数组
   * @returns 洗牌后的新数组
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j]!, result[i]!];
    }
    return result;
  }
}

/** 单例导出 */
export const cardDatabase = new CardDatabase();

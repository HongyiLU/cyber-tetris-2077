// ==================== 卡牌数据库 ====================
// v2.0.0 - 尖塔方块 2077 手牌系统

import { Card, CardType, CardRarity, BlockType } from '../types/card.v2';

/**
 * 卡牌数据库类（单例模式）
 * 管理所有卡牌数据，提供查询和筛选功能
 */
export class CardDatabase {
  private static instance: CardDatabase | null = null;
  private static isInitializing = false;
  private cards: Map<string, Card> = new Map();

  /**
   * 私有构造函数
   */
  private constructor() {
    this.initializeCards();
  }

  /**
   * 获取单例实例
   * @returns CardDatabase 单例实例
   */
  static getInstance(): CardDatabase {
    if (!CardDatabase.instance) {
      if (!CardDatabase.isInitializing) {
        CardDatabase.isInitializing = true;
        CardDatabase.instance = new CardDatabase();
        CardDatabase.isInitializing = false;
      } else {
        // 等待初始化完成
        while (!CardDatabase.instance) {
          // 简单等待，生产环境建议用 Promise
        }
      }
    }
    return CardDatabase.instance;
  }

  /**
   * 重置单例实例（用于测试）
   */
  static resetInstance(): void {
    CardDatabase.instance = null;
    CardDatabase.isInitializing = false;
  }

  /**
   * 验证卡牌数据
   * @param card 待验证的卡牌
   * @throws {Error} 当卡牌数据无效时
   */
  private validateCard(card: Card): void {
    if (card.cost < 0 || card.cost > 3) {
      throw new Error(`卡牌 ${card.id} 的消耗 ${card.cost} 超出范围 (0-3)`);
    }
    if (card.damage < 0) {
      throw new Error(`卡牌 ${card.id} 的伤害不能为负`);
    }
    if (card.shape.length === 0) {
      throw new Error(`卡牌 ${card.id} 的方块形状不能为空`);
    }
    // 验证 shape 是矩形
    const rowLength = card.shape[0].length;
    if (!card.shape.every(row => row.length === rowLength)) {
      throw new Error(`卡牌 ${card.id} 的方块形状必须是矩形`);
    }
  }

  /**
   * 初始化基础卡牌数据
   */
  private initializeCards(): void {
    const baseCards: Card[] = [
      // ===== 攻击卡 (5 张) =====
      {
        id: 'strike',
        name: '打击',
        description: '造成 6 点伤害',
        type: CardType.ATTACK,
        rarity: CardRarity.COMMON,
        cost: 1,
        blockType: 'I',
        shape: [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        color: '#00ffff',
        damage: 6,
        block: 0,
        tags: ['basic', 'melee'],
        flavor: '基础攻击技巧',
      },
      {
        id: 'heavy_strike',
        name: '重击',
        description: '造成 10 点伤害',
        type: CardType.ATTACK,
        rarity: CardRarity.COMMON,
        cost: 2,
        blockType: 'O',
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: '#ffff00',
        damage: 10,
        block: 0,
        tags: ['basic', 'heavy'],
        flavor: '沉重的一击',
      },
      {
        id: 'quick_strike',
        name: '快速打击',
        description: '造成 4 点伤害，消耗 0 能量',
        type: CardType.ATTACK,
        rarity: CardRarity.UNCOMMON,
        cost: 0,
        blockType: 'T',
        shape: [
          [0, 1, 0],
          [1, 1, 1],
          [0, 0, 0],
        ],
        color: '#ff6666',
        damage: 4,
        block: 0,
        tags: ['basic', 'quick'],
        flavor: '快速而精准的攻击',
      },
      {
        id: 'bomb_block',
        name: '💣 炸弹方块',
        description: '造成 15 点伤害，消除 3x3 区域',
        type: CardType.ATTACK,
        rarity: CardRarity.RARE,
        cost: 2,
        blockType: 'bomb_block',
        shape: [[1]],
        color: '#ff6600',
        damage: 15,
        block: 0,
        special: 'eliminate_3x3',
        tags: ['special', 'aoe'],
        flavor: '爆炸就是艺术',
      },
      {
        id: 'lightning_block',
        name: '⚡ 雷电连锁',
        description: '造成连锁消除相邻方块',
        type: CardType.ATTACK,
        rarity: CardRarity.RARE,
        cost: 2,
        blockType: 'lightning_block',
        shape: [[1]],
        color: '#ffff00',
        damage: 0,
        block: 0,
        special: 'lightning_chain',
        tags: ['special', 'lightning'],
        flavor: '雷霆万钧之势',
      },

      // ===== 技能卡 (5 张) =====
      {
        id: 'defend',
        name: '防御',
        description: '获得 5 点防御',
        type: CardType.SKILL,
        rarity: CardRarity.COMMON,
        cost: 1,
        blockType: 'O',
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: '#ffff00',
        damage: 0,
        block: 5,
        tags: ['basic', 'defense'],
        flavor: '基本的防御姿态',
      },
      {
        id: 'block_up',
        name: '格挡提升',
        description: '获得 8 点防御',
        type: CardType.SKILL,
        rarity: CardRarity.UNCOMMON,
        cost: 1,
        blockType: 'S',
        shape: [
          [0, 1, 1],
          [1, 1, 0],
          [0, 0, 0],
        ],
        color: '#66ff66',
        damage: 0,
        block: 8,
        tags: ['basic', 'defense'],
        flavor: '强化防御姿态',
      },
      {
        id: 'time_stop',
        name: '⏰ 时间停止',
        description: '获得 8 点防御，暂停敌人攻击 10 秒',
        type: CardType.SKILL,
        rarity: CardRarity.LEGENDARY,
        cost: 2,
        blockType: 'time_stop',
        shape: [[1]],
        color: '#00ccff',
        damage: 0,
        block: 8,
        special: 'pause_enemy_10s',
        tags: ['special', 'utility'],
        flavor: '时间在这一刻静止',
      },
      {
        id: 'heal_block',
        name: '💖 生命偷取',
        description: '恢复 3 点生命值',
        type: CardType.SKILL,
        rarity: CardRarity.RARE,
        cost: 1,
        blockType: 'heal_block',
        shape: [[1]],
        color: '#ff69b4',
        damage: 0,
        block: 0,
        special: 'heal_3hp',
        tags: ['special', 'heal'],
        flavor: '温暖的治愈之力',
      },
      {
        id: 'shield_block',
        name: '🛡️ 防御护盾',
        description: '获得 5 点护盾',
        type: CardType.SKILL,
        rarity: CardRarity.UNCOMMON,
        cost: 1,
        blockType: 'shield_block',
        shape: [[1]],
        color: '#cccccc',
        damage: 0,
        block: 5,
        special: 'shield_5',
        tags: ['special', 'defense'],
        flavor: '坚固的防御',
      },
      {
        id: 'combo_block',
        name: '📈 连击增幅',
        description: '连击伤害 +50%',
        type: CardType.SKILL,
        rarity: CardRarity.EPIC,
        cost: 2,
        blockType: 'combo_block',
        shape: [[1]],
        color: '#9932cc',
        damage: 0,
        block: 0,
        special: 'combo_damage_plus_50',
        tags: ['special', 'combo'],
        flavor: '连击的秘诀',
      },
      {
        id: 'clear_block',
        name: '🌟 全屏清除',
        description: '清除所有垃圾行',
        type: CardType.SKILL,
        rarity: CardRarity.LEGENDARY,
        cost: 3,
        blockType: 'clear_block',
        shape: [[1]],
        color: '#ffd700',
        damage: 0,
        block: 0,
        special: 'clear_all_garbage',
        tags: ['special', 'utility'],
        flavor: '一扫而空',
      },
      {
        id: 'lucky_block',
        name: '7️⃣ 幸运七',
        description: '第 7 次消除 2x 伤害',
        type: CardType.SKILL,
        rarity: CardRarity.UNCOMMON,
        cost: 1,
        blockType: 'lucky_block',
        shape: [[1]],
        color: '#32cd32',
        damage: 0,
        block: 0,
        special: 'lucky_7th_double',
        tags: ['special', 'luck'],
        flavor: '幸运女神眷顾',
      },
      {
        id: 'freeze_block',
        name: '❄️ 寒冰冻结',
        description: '冻结敌人 3 秒',
        type: CardType.SKILL,
        rarity: CardRarity.RARE,
        cost: 2,
        blockType: 'freeze_block',
        shape: [[1]],
        color: '#87ceeb',
        damage: 0,
        block: 0,
        special: 'freeze_enemy_3s',
        tags: ['special', 'control'],
        flavor: '冰封之力',
      },
      {
        id: 'fire_block',
        name: '🔥 火焰燃烧',
        description: '持续伤害 10 点（5 秒）',
        type: CardType.SKILL,
        rarity: CardRarity.UNCOMMON,
        cost: 1,
        blockType: 'fire_block',
        shape: [[1]],
        color: '#ff4500',
        damage: 0,
        block: 0,
        special: 'burn_10_5s',
        tags: ['special', 'dot'],
        flavor: '烈焰焚身',
      },
    ];

    // 注册卡牌（带验证和唯一性检查）
    baseCards.forEach((card) => {
      this.validateCard(card);
      if (this.cards.has(card.id)) {
        console.warn(`警告：卡牌 ID '${card.id}' 已存在，将被覆盖`);
      }
      this.cards.set(card.id, card);
    });
  }

  /**
   * 获取单张卡牌
   * @param cardId 卡牌 ID（区分大小写）
   * @returns 卡牌数据，不存在则返回 undefined
   * @throws {Error} 当 cardId 为空字符串时
   * 
   * @example
   * const strike = db.getCard('strike');
   * console.log(strike?.damage); // 6
   */
  getCard(cardId: string): Card | undefined {
    if (!cardId) {
      throw new Error('cardId 不能为空');
    }
    return this.cards.get(cardId);
  }

  /**
   * 获取所有卡牌
   * @returns 所有卡牌数组（返回副本）
   * 
   * @example
   * const allCards = db.getAllCards();
   * console.log(allCards.length); // 10
   */
  getAllCards(): Card[] {
    return Array.from(this.cards.values());
  }

  /**
   * 按类型筛选卡牌
   * @param type 卡牌类型
   * @returns 符合条件的卡牌数组
   * 
   * @example
   * const attackCards = db.getCardsByType(CardType.ATTACK);
   * console.log(attackCards.length); // 5
   */
  getCardsByType(type: CardType): Card[] {
    return this.getAllCards().filter((card) => card.type === type);
  }

  /**
   * 按稀有度筛选卡牌
   * @param rarity 卡牌稀有度
   * @returns 符合条件的卡牌数组
   * 
   * @example
   * const commonCards = db.getCardsByRarity(CardRarity.COMMON);
   * console.log(commonCards.length); // 3
   */
  getCardsByRarity(rarity: CardRarity): Card[] {
    return this.getAllCards().filter((card) => card.rarity === rarity);
  }

  /**
   * 按标签筛选卡牌
   * @param tag 标签
   * @returns 符合条件的卡牌数组
   * 
   * @example
   * const basicCards = db.getCardsByTag('basic');
   * console.log(basicCards.length); // 6
   */
  getCardsByTag(tag: string): Card[] {
    return this.getAllCards().filter((card) => card.tags.includes(tag));
  }

  /**
   * 获取卡牌数量
   * @returns 卡牌总数
   * 
   * @example
   * const count = db.getCardCount();
   * console.log(count); // 10
   */
  getCardCount(): number {
    return this.cards.size;
  }
}

// 导出单例实例
export const CARD_DATABASE = CardDatabase.getInstance();

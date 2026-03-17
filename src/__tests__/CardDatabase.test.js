// ==================== 卡牌数据库单元测试 ====================
// v2.0.0 - 尖塔方块 2077 手牌系统
import { CardDatabase } from '../core/CardDatabase';
import { CardType, CardRarity } from '../types/card.v2';
describe('CardDatabase', () => {
    let db;
    beforeEach(() => {
        db = CardDatabase.getInstance();
    });
    describe('单例模式', () => {
        it('应该返回同一个实例', () => {
            const instance1 = CardDatabase.getInstance();
            const instance2 = CardDatabase.getInstance();
            expect(instance1).toBe(instance2);
        });
        it('多次调用 getInstance 应该返回相同引用', () => {
            const instances = Array.from({ length: 5 }, () => CardDatabase.getInstance());
            instances.forEach((instance) => {
                expect(instance).toBe(instances[0]);
            });
        });
    });
    describe('获取卡牌', () => {
        it('应该能获取单张卡牌 - strike', () => {
            const card = db.getCard('strike');
            expect(card).toBeDefined();
            expect(card?.id).toBe('strike');
            expect(card?.name).toBe('打击');
            expect(card?.type).toBe(CardType.ATTACK);
        });
        it('应该能获取单张卡牌 - defend', () => {
            const card = db.getCard('defend');
            expect(card).toBeDefined();
            expect(card?.id).toBe('defend');
            expect(card?.name).toBe('防御');
            expect(card?.type).toBe(CardType.SKILL);
        });
        it('获取不存在的卡牌应返回 undefined', () => {
            const card = db.getCard('nonexistent_card_id');
            expect(card).toBeUndefined();
        });
        it('应该能获取所有卡牌', () => {
            const cards = db.getAllCards();
            expect(cards.length).toBeGreaterThan(0);
            expect(cards.length).toBe(db.getCardCount());
        });
        it('所有卡牌应该有完整的字段', () => {
            const cards = db.getAllCards();
            cards.forEach((card) => {
                expect(card.id).toBeDefined();
                expect(card.name).toBeDefined();
                expect(card.description).toBeDefined();
                expect(card.type).toBeDefined();
                expect(card.rarity).toBeDefined();
                expect(card.cost).toBeDefined();
                expect(card.blockType).toBeDefined();
                expect(card.shape).toBeDefined();
                expect(card.color).toBeDefined();
                expect(card.damage).toBeDefined();
                expect(card.block).toBeDefined();
                expect(card.tags).toBeDefined();
                expect(card.flavor).toBeDefined();
            });
        });
    });
    describe('筛选卡牌 - 按类型', () => {
        it('应该能按攻击类型筛选', () => {
            const attackCards = db.getCardsByType(CardType.ATTACK);
            expect(attackCards.length).toBeGreaterThan(0);
            attackCards.forEach((card) => {
                expect(card.type).toBe(CardType.ATTACK);
            });
        });
        it('应该能按技能类型筛选', () => {
            const skillCards = db.getCardsByType(CardType.SKILL);
            expect(skillCards.length).toBeGreaterThan(0);
            skillCards.forEach((card) => {
                expect(card.type).toBe(CardType.SKILL);
            });
        });
        it('攻击卡数量应该为 5 张', () => {
            const attackCards = db.getCardsByType(CardType.ATTACK);
            expect(attackCards.length).toBe(5);
        });
        it('技能卡数量应该为 5 张', () => {
            const skillCards = db.getCardsByType(CardType.SKILL);
            expect(skillCards.length).toBe(5);
        });
    });
    describe('筛选卡牌 - 按稀有度', () => {
        const rarityCases = [
            { rarity: CardRarity.COMMON, name: '普通' },
            { rarity: CardRarity.UNCOMMON, name: '罕见' },
            { rarity: CardRarity.RARE, name: '稀有' },
            { rarity: CardRarity.LEGENDARY, name: '传说' },
        ];
        it.each(rarityCases)('应该能按 $name 稀有度筛选', ({ rarity }) => {
            const cards = db.getCardsByRarity(rarity);
            expect(cards.length).toBeGreaterThanOrEqual(0);
            cards.forEach((card) => {
                expect(card.rarity).toBe(rarity);
            });
        });
    });
    describe('筛选卡牌 - 按标签', () => {
        it('应该能按 basic 标签筛选', () => {
            const basicCards = db.getCardsByTag('basic');
            expect(basicCards.length).toBeGreaterThan(0);
            basicCards.forEach((card) => {
                expect(card.tags).toContain('basic');
            });
        });
        it('应该能按 special 标签筛选', () => {
            const specialCards = db.getCardsByTag('special');
            expect(specialCards.length).toBeGreaterThan(0);
            specialCards.forEach((card) => {
                expect(card.tags).toContain('special');
            });
        });
        it('应该能按 defense 标签筛选', () => {
            const defenseCards = db.getCardsByTag('defense');
            expect(defenseCards.length).toBeGreaterThan(0);
            defenseCards.forEach((card) => {
                expect(card.tags).toContain('defense');
            });
        });
        it('不存在的标签应该返回空数组', () => {
            const cards = db.getCardsByTag('nonexistent_tag');
            expect(cards.length).toBe(0);
        });
    });
    describe('卡牌数据验证', () => {
        it('打击卡牌数据应该正确', () => {
            const strike = db.getCard('strike');
            expect(strike?.damage).toBe(6);
            expect(strike?.cost).toBe(1);
            expect(strike?.blockType).toBe('I');
            expect(strike?.rarity).toBe(CardRarity.COMMON);
            expect(strike?.type).toBe(CardType.ATTACK);
        });
        it('重击卡牌数据应该正确', () => {
            const heavyStrike = db.getCard('heavy_strike');
            expect(heavyStrike?.damage).toBe(10);
            expect(heavyStrike?.cost).toBe(2);
            expect(heavyStrike?.blockType).toBe('O');
        });
        it('防御卡牌数据应该正确', () => {
            const defend = db.getCard('defend');
            expect(defend?.block).toBe(5);
            expect(defend?.cost).toBe(1);
            expect(defend?.damage).toBe(0);
            expect(defend?.type).toBe(CardType.SKILL);
        });
        it('炸弹方块应该有特殊效果', () => {
            const bombBlock = db.getCard('bomb_block');
            expect(bombBlock?.special).toBe('eliminate_3x3');
            expect(bombBlock?.damage).toBe(15);
            expect(bombBlock?.rarity).toBe(CardRarity.RARE);
        });
        it('时间停止应该是传说稀有度', () => {
            const timeStop = db.getCard('time_stop');
            expect(timeStop?.rarity).toBe(CardRarity.LEGENDARY);
            expect(timeStop?.special).toBe('pause_enemy_10s');
        });
        it('所有卡牌的 shape 应该是二维数组', () => {
            const cards = db.getAllCards();
            cards.forEach((card) => {
                expect(Array.isArray(card.shape)).toBe(true);
                expect(card.shape.length).toBeGreaterThan(0);
                card.shape.forEach((row) => {
                    expect(Array.isArray(row)).toBe(true);
                });
            });
        });
        it('所有卡牌的 cost 应该在 0-3 范围内', () => {
            const cards = db.getAllCards();
            cards.forEach((card) => {
                expect(card.cost).toBeGreaterThanOrEqual(0);
                expect(card.cost).toBeLessThanOrEqual(3);
            });
        });
        it('所有卡牌的 damage 和 block 应该非负', () => {
            const cards = db.getAllCards();
            cards.forEach((card) => {
                expect(card.damage).toBeGreaterThanOrEqual(0);
                expect(card.block).toBeGreaterThanOrEqual(0);
            });
        });
    });
    describe('卡牌数量统计', () => {
        it('卡牌总数应该至少为 10 张', () => {
            expect(db.getCardCount()).toBeGreaterThanOrEqual(10);
        });
        it('卡牌总数应该等于攻击卡 + 技能卡', () => {
            const total = db.getCardCount();
            const attackCount = db.getCardsByType(CardType.ATTACK).length;
            const skillCount = db.getCardsByType(CardType.SKILL).length;
            expect(total).toBe(attackCount + skillCount);
        });
    });
    describe('升级卡牌', () => {
        it('UpgradedCard 类型应该包含 isUpgraded 字段', () => {
            const upgradedCard = {
                id: 'strike_plus',
                name: '打击+',
                description: '造成 9 点伤害',
                type: CardType.ATTACK,
                rarity: CardRarity.COMMON,
                cost: 1,
                blockType: 'I',
                shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
                color: '#00ffff',
                damage: 9,
                block: 0,
                tags: ['basic', 'melee'],
                flavor: '强化版打击',
                isUpgraded: true,
                upgradedName: '打击+',
            };
            expect(upgradedCard.isUpgraded).toBe(true);
            expect(upgradedCard.upgradedName).toBe('打击+');
        });
    });
    describe('边界情况', () => {
        it('获取不存在的卡牌应返回 undefined', () => {
            const card = db.getCard('nonexistent_card_id');
            expect(card).toBeUndefined();
        });
        it('getAllCards 应该返回新数组而非引用', () => {
            const cards1 = db.getAllCards();
            const cards2 = db.getAllCards();
            expect(cards1).not.toBe(cards2); // 确保是副本
            expect(cards1).toEqual(cards2); // 但内容相同
        });
        it('空字符串 ID 应该抛出错误', () => {
            expect(() => db.getCard('')).toThrow();
        });
    });
});

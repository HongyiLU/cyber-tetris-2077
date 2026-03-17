/**
 * 装备配置表
 * 包含 15+ 种装备，分布在 3 个槽位
 */
export const EQUIPMENT_CONFIG = [
    // ==================== 头部装备 (Head) ====================
    {
        id: 'head_001',
        name: '士兵头盔',
        description: '基础防护头盔，提供少量伤害减免',
        icon: '🪖',
        type: 'Head',
        rarity: 'Common',
        effects: [
            { type: 'damageReduction', value: 10, unit: '%' },
        ],
    },
    {
        id: 'head_002',
        name: '骑士头盔',
        description: '中级防护头盔，提供更好的伤害减免',
        icon: '🛡️',
        type: 'Head',
        rarity: 'Uncommon',
        effects: [
            { type: 'damageReduction', value: 20, unit: '%' },
        ],
    },
    {
        id: 'head_003',
        name: '龙鳞头盔',
        description: '由龙鳞制成的高级头盔，提供极强的防护',
        icon: '🐉',
        type: 'Head',
        rarity: 'Rare',
        effects: [
            { type: 'damageReduction', value: 30, unit: '%' },
            { type: 'healthBoost', value: 50, unit: 'flat' },
        ],
    },
    {
        id: 'head_004',
        name: '战术目镜',
        description: '增强专注力，延长连击时间窗口',
        icon: '🥽',
        type: 'Head',
        rarity: 'Uncommon',
        effects: [
            { type: 'comboTimeBoost', value: 1, unit: 'seconds' },
        ],
    },
    {
        id: 'head_005',
        name: '思维增幅器',
        description: '高科技装置，大幅提升连击时间',
        icon: '🧠',
        type: 'Head',
        rarity: 'Epic',
        effects: [
            { type: 'comboTimeBoost', value: 3, unit: 'seconds' },
            { type: 'comboBoost', value: 5, unit: '%' },
        ],
    },
    // ==================== 身体装备 (Body) ====================
    {
        id: 'body_001',
        name: '皮甲',
        description: '基础防护装备，提供少量生命值加成',
        icon: '🦺',
        type: 'Body',
        rarity: 'Common',
        effects: [
            { type: 'healthBoost', value: 50, unit: 'flat' },
        ],
    },
    {
        id: 'body_002',
        name: '锁子甲',
        description: '中级防护装备，提供更好的生命值加成',
        icon: '⛓️',
        type: 'Body',
        rarity: 'Uncommon',
        effects: [
            { type: 'healthBoost', value: 100, unit: 'flat' },
            { type: 'damageReduction', value: 10, unit: '%' },
        ],
    },
    {
        id: 'body_003',
        name: '板甲',
        description: '重型防护装备，提供极高的生命值',
        icon: '🛡️',
        type: 'Body',
        rarity: 'Rare',
        effects: [
            { type: 'healthBoost', value: 150, unit: 'flat' },
            { type: 'damageReduction', value: 15, unit: '%' },
        ],
    },
    {
        id: 'body_004',
        name: '战斗背心',
        description: '轻便战斗装备，提升伤害输出',
        icon: '🎽',
        type: 'Body',
        rarity: 'Uncommon',
        effects: [
            { type: 'damageBoost', value: 10, unit: '%' },
        ],
    },
    {
        id: 'body_005',
        name: '战神铠甲',
        description: '传奇战士的铠甲，大幅提升攻击力',
        icon: '⚔️',
        type: 'Body',
        rarity: 'Epic',
        effects: [
            { type: 'damageBoost', value: 20, unit: '%' },
            { type: 'healthBoost', value: 50, unit: 'flat' },
        ],
    },
    {
        id: 'body_006',
        name: '再生斗篷',
        description: '魔法斗篷，提供持续治疗效果',
        icon: '🧙',
        type: 'Body',
        rarity: 'Legendary',
        effects: [
            { type: 'healAura', value: 10, unit: 'flat' },
            { type: 'healthBoost', value: 100, unit: 'flat' },
        ],
    },
    // ==================== 饰品装备 (Accessory) ====================
    {
        id: 'acc_001',
        name: '攻击徽章',
        description: '基础攻击徽章，小幅提升伤害',
        icon: '🎖️',
        type: 'Accessory',
        rarity: 'Common',
        effects: [
            { type: 'damageBoost', value: 10, unit: '%' },
        ],
    },
    {
        id: 'acc_002',
        name: '力量戒指',
        description: '注入力量的戒指，提升攻击力',
        icon: '💍',
        type: 'Accessory',
        rarity: 'Uncommon',
        effects: [
            { type: 'damageBoost', value: 20, unit: '%' },
        ],
    },
    {
        id: 'acc_003',
        name: '毁灭指环',
        description: '蕴含毁灭力量的指环，大幅提升伤害',
        icon: '💥',
        type: 'Accessory',
        rarity: 'Rare',
        effects: [
            { type: 'damageBoost', value: 30, unit: '%' },
        ],
    },
    {
        id: 'acc_004',
        name: '连击护符',
        description: '增强连击效果的护符',
        icon: '🔥',
        type: 'Accessory',
        rarity: 'Rare',
        effects: [
            { type: 'comboBoost', value: 10, unit: '%' },
        ],
    },
    {
        id: 'acc_005',
        name: '时间沙漏',
        description: '神秘的沙漏，延长连击时间窗口',
        icon: '⏳',
        type: 'Accessory',
        rarity: 'Epic',
        effects: [
            { type: 'comboTimeBoost', value: 2, unit: 'seconds' },
            { type: 'comboBoost', value: 5, unit: '%' },
        ],
    },
    {
        id: 'acc_006',
        name: '生命水晶',
        description: '蕴含生命能量的水晶',
        icon: '💎',
        type: 'Accessory',
        rarity: 'Uncommon',
        effects: [
            { type: 'healthBoost', value: 50, unit: 'flat' },
        ],
    },
    {
        id: 'acc_007',
        name: '治疗之环',
        description: '提供持续治疗的魔法戒指',
        icon: '✨',
        type: 'Accessory',
        rarity: 'Legendary',
        effects: [
            { type: 'healAura', value: 15, unit: 'flat' },
        ],
    },
    {
        id: 'acc_008',
        name: '传奇徽章',
        description: '传奇战士的证明，全属性提升',
        icon: '👑',
        type: 'Accessory',
        rarity: 'Legendary',
        effects: [
            { type: 'damageBoost', value: 15, unit: '%' },
            { type: 'healthBoost', value: 50, unit: 'flat' },
            { type: 'comboBoost', value: 10, unit: '%' },
        ],
    },
];
/**
 * 按类型获取装备
 */
export function getEquipmentByType(type) {
    return EQUIPMENT_CONFIG.filter(eq => eq.type === type);
}
/**
 * 按稀有度获取装备
 */
export function getEquipmentByRarity(rarity) {
    return EQUIPMENT_CONFIG.filter(eq => eq.rarity === rarity);
}
/**
 * 根据 ID 获取装备
 */
export function getEquipmentById(id) {
    return EQUIPMENT_CONFIG.find(eq => eq.id === id);
}
/**
 * 获取所有装备
 */
export function getAllEquipment() {
    return EQUIPMENT_CONFIG;
}

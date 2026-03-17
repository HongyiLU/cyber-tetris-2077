// ==================== 敌人配置 ====================
/**
 * 所有敌人类型配置
 */
export const ENEMY_TYPES = [
    {
        id: 'slime',
        name: '史莱姆',
        emoji: '🦠',
        hp: 200,
        attackInterval: 10000, // 10 秒
        attackDamage: 10,
        garbageRows: 1,
        description: '最基础的敌人，行动缓慢',
        rarity: 'common',
    },
    {
        id: 'goblin',
        name: '哥布林',
        emoji: '👺',
        hp: 150,
        attackInterval: 8000, // 8 秒
        attackDamage: 15,
        garbageRows: 2,
        description: '敏捷但脆弱的敌人',
        rarity: 'common',
    },
    {
        id: 'orc',
        name: '兽人',
        emoji: '👹',
        hp: 300,
        attackInterval: 12000, // 12 秒
        attackDamage: 20,
        garbageRows: 2,
        description: '强大但缓慢的敌人',
        rarity: 'uncommon',
    },
    {
        id: 'ghost',
        name: '幽灵',
        emoji: '👻',
        hp: 180,
        attackInterval: 6000, // 6 秒
        attackDamage: 8,
        garbageRows: 1,
        description: '快速攻击的幽灵',
        rarity: 'uncommon',
    },
    {
        id: 'dragon',
        name: '巨龙',
        emoji: '🐉',
        hp: 500,
        attackInterval: 15000, // 15 秒
        attackDamage: 25,
        garbageRows: 3,
        description: '强大的 Boss 级敌人',
        rarity: 'legendary',
    },
];
/**
 * 根据 ID 获取敌人类型
 */
export function getEnemyType(enemyId) {
    return ENEMY_TYPES.find(enemy => enemy.id === enemyId);
}
/**
 * 获取所有可用敌人（按稀有度排序）
 */
export function getAllEnemies() {
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    return [...ENEMY_TYPES].sort((a, b) => {
        return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
    });
}
/**
 * 根据稀有度筛选敌人
 */
export function getEnemiesByRarity(rarity) {
    return ENEMY_TYPES.filter(enemy => enemy.rarity === rarity);
}

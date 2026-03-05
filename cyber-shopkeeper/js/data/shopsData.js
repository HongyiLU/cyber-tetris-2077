// 赛博朋克商店数据

const SHOPS_DATA = [
    {
        id: 'noodle',
        name: '义体拉面',
        emoji: '🍜',
        description: '赛博朋克世界最受欢迎的快餐',
        unlocked: true,
        level: 1,
        upgradeCost: 5000,
        baseProfit: 200,
        products: [
            { id: 'basic_ramen', name: '基础拉面', price: 15, profit: 8 },
            { id: 'cyber_ramen', name: '义体拉面', price: 35, profit: 20 },
            { id: 'neon_ramen', name: '霓虹拉面', price: 60, profit: 35 }
        ]
    },
    {
        id: 'clinic',
        name: '义体诊所',
        emoji: '💊',
        description: '维护和升级义体的专业诊所',
        unlocked: true,
        level: 1,
        upgradeCost: 8000,
        baseProfit: 350,
        products: [
            { id: 'basic_repair', name: '基础维修', price: 50, profit: 25 },
            { id: 'upgrade', name: '义体升级', price: 150, profit: 80 },
            { id: 'tuneup', name: '系统调优', price: 300, profit: 160 }
        ]
    },
    {
        id: 'weapon',
        name: '武器商店',
        emoji: '🔫',
        description: '赛博朋克世界的武器供应商',
        unlocked: false,
        unlockLevel: 5,
        unlockCost: 15000,
        level: 1,
        upgradeCost: 12000,
        baseProfit: 500,
        products: [
            { id: 'pistol', name: '等离子手枪', price: 200, profit: 100 },
            { id: 'rifle', name: '激光步枪', price: 500, profit: 260 },
            { id: 'heavy', name: '重型武器', price: 1200, profit: 600 }
        ]
    },
    {
        id: 'bar',
        name: '霓虹酒吧',
        emoji: '🍸',
        description: '赛博朋克风格的夜店酒吧',
        unlocked: false,
        unlockLevel: 8,
        unlockCost: 25000,
        level: 1,
        upgradeCost: 20000,
        baseProfit: 450,
        products: [
            { id: 'neon_drink', name: '霓虹饮料', price: 25, profit: 12 },
            { id: 'cocktail', name: '赛博鸡尾酒', price: 80, profit: 40 },
            { id: 'vip_pack', name: 'VIP套餐', price: 500, profit: 260 }
        ]
    },
    {
        id: 'clothing',
        name: '光污染时装',
        emoji: '👕',
        description: '赛博朋克时尚服装品牌',
        unlocked: false,
        unlockLevel: 12,
        unlockCost: 40000,
        level: 1,
        upgradeCost: 35000,
        baseProfit: 600,
        products: [
            { id: 'basic_wear', name: '基础服饰', price: 60, profit: 28 },
            { id: 'neon_gear', name: '霓虹装备', price: 180, profit: 90 },
            { id: 'legendary_set', name: '传说套装', price: 800, profit: 400 }
        ]
    }
];

function getShopById(id) {
    return SHOPS_DATA.find(shop => shop.id === id);
}

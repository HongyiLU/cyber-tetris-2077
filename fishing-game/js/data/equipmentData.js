// 装备数据 - 优化版

// 钓鱼竿数据
const ROD_DATA = [
    {
        id: 'basic_rod',
        name: '竹竿',
        description: '最基础的竹竿，适合新手练习。',
        price: 0,
        controlBonus: 0,
        maxTension: 55,
        castDistance: 100
    },
    {
        id: 'standard_rod',
        name: '玻璃钢竿',
        description: '升级后的钓鱼竿，韧性和控制都更好。',
        price: 180,
        controlBonus: 12,
        maxTension: 70,
        castDistance: 125
    },
    {
        id: 'advanced_rod',
        name: '碳素竿',
        description: '专业级碳素钓鱼竿，轻量化且手感一流！',
        price: 680,
        controlBonus: 28,
        maxTension: 85,
        castDistance: 155
    },
    {
        id: 'master_rod',
        name: '大师典藏竿',
        description: '传说中的大师级钓鱼竿，完美的控制和感觉！',
        price: 2680,
        controlBonus: 45,
        maxTension: 98,
        castDistance: 200
    }
];

// 鱼线数据
const LINE_DATA = [
    {
        id: 'thin_line',
        name: '尼龙细线',
        description: '不易吓鱼，但张力较低，容易断。',
        price: 0,
        tensionMultiplier: 0.75,
        spookiness: 0.5
    },
    {
        id: 'medium_line',
        name: '优质鱼线',
        description: '平衡的选择，性价比很高！',
        price: 90,
        tensionMultiplier: 1,
        spookiness: 1
    },
    {
        id: 'thick_line',
        name: '大力马线',
        description: '非常坚韧，但比较粗，容易吓走鱼。',
        price: 280,
        tensionMultiplier: 1.35,
        spookiness: 1.6
    }
];

// 鱼饵数据
const BAIT_DATA = [
    {
        id: 'bread',
        name: '面包虫',
        description: '普通鱼类喜欢的基础饵料。',
        price: 0,
        attractBonus: {
            'common': 25,
            'uncommon': 8,
            'rare': -5,
            'epic': -10,
            'legendary': -15
        }
    },
    {
        id: 'worm',
        name: '红蚯蚓',
        description: '大多数鱼都喜欢的万能饵料！',
        price: 45,
        attractBonus: {
            'common': 15,
            'uncommon': 20,
            'rare': 8,
            'epic': 0,
            'legendary': -5
        }
    },
    {
        id: 'minnow',
        name: '小鱼苗',
        description: '掠食性鱼类的最爱！对大鱼效果很好。',
        price: 130,
        attractBonus: {
            'common': -15,
            'uncommon': 5,
            'rare': 25,
            'epic': 15,
            'legendary': 8
        }
    },
    {
        id: 'special',
        name: '秘制饵料',
        description: '专门吸引稀有鱼类的神秘配方！',
        price: 480,
        attractBonus: {
            'common': -35,
            'uncommon': -15,
            'rare': 20,
            'epic': 35,
            'legendary': 30
        }
    }
];

// 获取装备数据
function getRodById(id) {
    return ROD_DATA.find(rod => rod.id === id);
}

function getLineById(id) {
    return LINE_DATA.find(line => line.id === id);
}

function getBaitById(id) {
    return BAIT_DATA.find(bait => bait.id === id);
}

// 获取初始装备
function getInitialEquipment() {
    return {
        rod: 'basic_rod',
        line: 'thin_line',
        bait: 'bread',
        ownedRods: ['basic_rod'],
        ownedLines: ['thin_line'],
        ownedBaits: ['bread']
    };
}

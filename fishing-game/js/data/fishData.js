// 鱼类数据 - 优化版

const FISH_DATA = [
    {
        id: 'crucian',
        name: '小鲫鱼',
        rarity: 'common',
        weightMin: 30,
        weightMax: 180,
        difficulty: 1,
        behavior: 'calm',
        habitat: 'shallow',
        description: '最常见的小鱼，适合新手练习。性格温和，容易上钩。',
        baseValue: 8,
        icon: '🐟'
    },
    {
        id: 'carp',
        name: '鲤鱼',
        rarity: 'common',
        weightMin: 250,
        weightMax: 1200,
        difficulty: 2,
        behavior: 'normal',
        habitat: 'medium',
        description: '淡水鱼中的代表，力气不小，是钓鱼爱好者的常客。',
        baseValue: 22,
        icon: '🐠'
    },
    {
        id: 'grasscarp',
        name: '草鱼',
        rarity: 'uncommon',
        weightMin: 400,
        weightMax: 2500,
        difficulty: 3,
        behavior: 'strong',
        habitat: 'medium',
        description: '大型草食性鱼类，挣扎有力，钓上来很有成就感！',
        baseValue: 40,
        icon: '🐡'
    },
    {
        id: 'perch',
        name: '鲈鱼',
        rarity: 'rare',
        weightMin: 350,
        weightMax: 1800,
        difficulty: 4,
        behavior: 'aggressive',
        habitat: 'deep',
        description: '凶猛的掠食者，手感很棒！喜欢在深水区活动。',
        baseValue: 75,
        icon: '🐋'
    },
    {
        id: 'snakehead',
        name: '黑鱼',
        rarity: 'rare',
        weightMin: 500,
        weightMax: 3000,
        difficulty: 5,
        behavior: 'wild',
        habitat: 'deep',
        description: '水中霸主，极其凶猛的家伙！钓它需要真正的技术！',
        baseValue: 110,
        icon: '🐊'
    },
    {
        id: 'catfish',
        name: '鲶鱼',
        rarity: 'uncommon',
        weightMin: 600,
        weightMax: 3500,
        difficulty: 3,
        behavior: 'slow',
        habitat: 'deep',
        description: '底栖鱼类，个头很大，喜欢在夜间活动。',
        baseValue: 45,
        icon: '🐱'
    },
    {
        id: 'trout',
        name: '鳟鱼',
        rarity: 'rare',
        weightMin: 200,
        weightMax: 800,
        difficulty: 4,
        behavior: 'skittish',
        habitat: 'medium',
        description: '美丽而敏感的鱼，对饵料非常挑剔。',
        baseValue: 85,
        icon: '🍣'
    },
    {
        id: 'goldfish',
        name: '金鱼',
        rarity: 'epic',
        weightMin: 80,
        weightMax: 350,
        difficulty: 3,
        behavior: 'skittish',
        habitat: 'shallow',
        description: '美丽的观赏鱼，非常罕见！据说能带来好运。',
        baseValue: 180,
        icon: '✨'
    },
    {
        id: 'koi',
        name: '锦鲤',
        rarity: 'epic',
        weightMin: 500,
        weightMax: 2000,
        difficulty: 5,
        behavior: 'calm',
        habitat: 'medium',
        description: '华丽的锦鲤，色彩斑斓，是水中的艺术品！',
        baseValue: 280,
        icon: '🎨'
    },
    {
        id: 'dragonfish',
        name: '金龙鱼',
        rarity: 'legendary',
        weightMin: 800,
        weightMax: 4000,
        difficulty: 6,
        behavior: 'legendary',
        habitat: 'deep',
        description: '传说中的鱼中之龙，见过的人寥寥无几！钓上它是钓鱼人的终极梦想！',
        baseValue: 888,
        icon: '🐲'
    },
    {
        id: 'rainbowtrout',
        name: '虹鳟',
        rarity: 'epic',
        weightMin: 300,
        weightMax: 1200,
        difficulty: 5,
        behavior: 'wild',
        habitat: 'deep',
        description: '像彩虹一样美丽的鳟鱼，力气惊人！',
        baseValue: 220,
        icon: '🌈'
    },
    {
        id: 'pike',
        name: '狗鱼',
        rarity: 'rare',
        weightMin: 400,
        weightMax: 2500,
        difficulty: 5,
        behavior: 'aggressive',
        habitat: 'deep',
        description: '水中豺狼，凶猛异常，是真正的挑战！',
        baseValue: 95,
        icon: '🦈'
    }
];

// 稀有度权重 - 优化版
const RARITY_WEIGHTS = {
    'common': 45,
    'uncommon': 28,
    'rare': 17,
    'epic': 7.5,
    'legendary': 2.5
};

// 根据稀有度获取鱼类列表
function getFishByRarity(rarity) {
    return FISH_DATA.filter(fish => fish.rarity === rarity);
}

// 根据ID获取鱼类
function getFishById(id) {
    return FISH_DATA.find(fish => fish.id === id);
}

// 随机选择一条鱼（考虑稀有度权重）- 优化版
function getRandomFish(levelBonus = 0) {
    // 根据玩家等级调整稀有度权重
    const adjustedWeights = { ...RARITY_WEIGHTS };
    
    // 等级越高，稀有鱼出现概率略有提升
    if (levelBonus > 0) {
        adjustedWeights['rare'] += levelBonus * 0.8;
        adjustedWeights['epic'] += levelBonus * 0.4;
        adjustedWeights['legendary'] += levelBonus * 0.15;
    }
    
    // 选择稀有度
    const rarities = Object.keys(adjustedWeights);
    const weights = Object.values(adjustedWeights);
    const selectedRarity = weightedRandomChoice(rarities, weights);
    
    // 从该稀有度中随机选择一条鱼
    const fishOfRarity = getFishByRarity(selectedRarity);
    if (fishOfRarity.length === 0) {
        return FISH_DATA[0]; // fallback
    }
    
    return { ...randomChoice(fishOfRarity) };
}

// 生成随机重量 - 优化版
function generateFishWeight(fish, levelBonus = 0) {
    const baseWeight = random(fish.weightMin, fish.weightMax);
    // 等级加成可以稍微增加重量
    const levelMultiplier = 1 + (levelBonus * 0.06);
    // 随机变化
    const randomMultiplier = random(0.85, 1.25);
    return Math.round(baseWeight * levelMultiplier * randomMultiplier);
}

// 计算鱼的价值 - 优化版
function calculateFishValue(fish, weight) {
    const weightRatio = weight / ((fish.weightMin + fish.weightMax) / 2);
    const rarityMultiplier = {
        'common': 1,
        'uncommon': 1.6,
        'rare': 2.3,
        'epic': 3.5,
        'legendary': 6
    };
    // 大鱼加成
    const sizeBonus = weight > fish.weightMax * 0.8 ? 1.3 : (weight > fish.weightMax * 0.5 ? 1.1 : 1);
    return Math.round(fish.baseValue * weightRatio * (rarityMultiplier[fish.rarity] || 1) * sizeBonus);
}

// 计算经验值 - 优化版
function calculateExp(fish, weight) {
    const baseExp = {
        'common': 12,
        'uncommon': 28,
        'rare': 55,
        'epic': 120,
        'legendary': 300
    };
    const weightBonus = Math.floor(weight / 80);
    return (baseExp[fish.rarity] || 12) + weightBonus;
}

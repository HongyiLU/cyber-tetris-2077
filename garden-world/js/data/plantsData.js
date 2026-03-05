// 植物数据

const PLANTS_DATA = [
    {
        id: 'tulip',
        name: '郁金香',
        emoji: '🌷',
        description: '美丽的郁金香，适合新手种植',
        seedPrice: 10,
        sellPrice: 25,
        growTime: 2,
        stages: 4,
        exp: 5
    },
    {
        id: 'sunflower',
        name: '向日葵',
        emoji: '🌻',
        description: '阳光般的向日葵，产量稳定',
        seedPrice: 20,
        sellPrice: 45,
        growTime: 3,
        stages: 4,
        exp: 10
    },
    {
        id: 'rose',
        name: '玫瑰',
        emoji: '🌹',
        description: '高贵的玫瑰，价值不菲',
        seedPrice: 35,
        sellPrice: 80,
        growTime: 4,
        stages: 4,
        exp: 18
    },
    {
        id: 'carrot',
        name: '胡萝卜',
        emoji: '🥕',
        description: '营养丰富的胡萝卜',
        seedPrice: 15,
        sellPrice: 38,
        growTime: 3,
        stages: 4,
        exp: 8
    },
    {
        id: 'eggplant',
        name: '茄子',
        emoji: '🍆',
        description: '紫色的茄子，销量很好',
        seedPrice: 40,
        sellPrice: 95,
        growTime: 5,
        stages: 4,
        exp: 22
    },
    {
        id: 'corn',
        name: '玉米',
        emoji: '🌽',
        description: '金黄的玉米，产量大',
        seedPrice: 25,
        sellPrice: 55,
        growTime: 4,
        stages: 4,
        exp: 14
    },
    {
        id: 'strawberry',
        name: '草莓',
        emoji: '🍓',
        description: '甜蜜的草莓，非常受欢迎',
        seedPrice: 50,
        sellPrice: 120,
        growTime: 5,
        stages: 4,
        exp: 28
    },
    {
        id: 'watermelon',
        name: '西瓜',
        emoji: '🍉',
        description: '大西瓜，收获满满',
        seedPrice: 80,
        sellPrice: 200,
        growTime: 7,
        stages: 4,
        exp: 45
    },
    {
        id: 'cherry',
        name: '樱桃',
        emoji: '🍒',
        description: '珍贵的樱桃，价格高昂',
        seedPrice: 100,
        sellPrice: 280,
        growTime: 8,
        stages: 4,
        exp: 60
    },
    {
        id: 'rainbow',
        name: '彩虹花',
        emoji: '🌈',
        description: '传说中的彩虹花，极其珍贵！',
        seedPrice: 200,
        sellPrice: 500,
        growTime: 10,
        stages: 4,
        exp: 100
    }
];

function getPlantById(id) {
    return PLANTS_DATA.find(plant => plant.id === id);
}

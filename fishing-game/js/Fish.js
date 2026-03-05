// 鱼类类

class Fish {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.rarity = data.rarity;
        this.weightMin = data.weightMin;
        this.weightMax = data.weightMax;
        this.difficulty = data.difficulty;
        this.behavior = data.behavior;
        this.habitat = data.habitat;
        this.description = data.description;
        this.baseValue = data.baseValue;
        this.icon = data.icon;
    }

    // 生成随机重量
    generateWeight(levelBonus = 0) {
        const baseWeight = random(this.weightMin, this.weightMax);
        const levelMultiplier = 1 + (levelBonus * 0.05);
        return Math.round(baseWeight * levelMultiplier);
    }

    // 计算价值
    calculateValue(weight) {
        const weightRatio = weight / ((this.weightMin + this.weightMax) / 2);
        const rarityMultiplier = {
            'common': 1,
            'uncommon': 1.5,
            'rare': 2,
            'epic': 3,
            'legendary': 5
        };
        return Math.round(this.baseValue * weightRatio * (rarityMultiplier[this.rarity] || 1));
    }

    // 计算经验值
    calculateExp(weight) {
        const baseExp = {
            'common': 10,
            'uncommon': 25,
            'rare': 50,
            'epic': 100,
            'legendary': 250
        };
        const weightBonus = Math.floor(weight / 100);
        return (baseExp[this.rarity] || 10) + weightBonus;
    }

    // 获取稀有度名称
    getRarityName() {
        return getRarityName(this.rarity);
    }

    // 获取行为模式描述
    getBehaviorDescription() {
        const behaviors = {
            'calm': '温和',
            'normal': '普通',
            'strong': '有力',
            'aggressive': '凶猛',
            'wild': '狂野',
            'skittish': '胆小',
            'legendary': '传说'
        };
        return behaviors[this.behavior] || this.behavior;
    }

    // 获取栖息地描述
    getHabitatDescription() {
        const habitats = {
            'shallow': '浅水区',
            'medium': '中等深度',
            'deep': '深水区'
        };
        return habitats[this.habitat] || this.habitat;
    }
}

// 装备类

class Equipment {
    constructor(type, data) {
        this.type = type;
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.price = data.price;
        
        // 根据类型设置特定属性
        if (type === 'rod') {
            this.controlBonus = data.controlBonus;
            this.maxTension = data.maxTension;
            this.castDistance = data.castDistance;
        } else if (type === 'line') {
            this.tensionMultiplier = data.tensionMultiplier;
            this.spookiness = data.spookiness;
        } else if (type === 'bait') {
            this.attractBonus = data.attractBonus;
        }
    }

    // 获取装备描述
    getFullDescription() {
        let desc = this.description + '\n\n';
        
        if (this.type === 'rod') {
            desc += `控制加成: +${this.controlBonus}%\n`;
            desc += `最大张力: ${this.maxTension}%\n`;
            desc += `抛竿距离: ${this.castDistance}%`;
        } else if (this.type === 'line') {
            desc += `张力倍率: ${this.tensionMultiplier}x\n`;
            desc += `惊吓度: ${this.spookiness}x`;
        } else if (this.type === 'bait') {
            desc += '吸引加成:\n';
            for (const [rarity, bonus] of Object.entries(this.attractBonus)) {
                if (bonus !== 0) {
                    const sign = bonus > 0 ? '+' : '';
                    desc += `  ${getRarityName(rarity)}: ${sign}${bonus}%\n`;
                }
            }
        }
        
        return desc;
    }

    // 检查是否比另一个装备好
    isBetterThan(other) {
        if (!other) return true;
        if (this.type !== other.type) return false;
        
        if (this.type === 'rod') {
            return this.controlBonus > other.controlBonus;
        } else if (this.type === 'line') {
            // 平衡的线更好
            const thisBalance = 1 / Math.abs(1 - this.tensionMultiplier);
            const otherBalance = 1 / Math.abs(1 - other.tensionMultiplier);
            return thisBalance > otherBalance;
        } else if (this.type === 'bait') {
            // 稀有鱼加成总和
            const thisRareBonus = (this.attractBonus['rare'] || 0) + 
                                   (this.attractBonus['epic'] || 0) + 
                                   (this.attractBonus['legendary'] || 0);
            const otherRareBonus = (other.attractBonus['rare'] || 0) + 
                                    (other.attractBonus['epic'] || 0) + 
                                    (other.attractBonus['legendary'] || 0);
            return thisRareBonus > otherRareBonus;
        }
        
        return false;
    }

    // 获取等级评分
    getRating() {
        if (this.type === 'rod') {
            return Math.floor((this.controlBonus / 40) * 5) + 1;
        } else if (this.type === 'line') {
            // 平衡评分
            const balance = 1 - Math.abs(1 - this.tensionMultiplier);
            return Math.floor(balance * 4) + 1;
        } else if (this.type === 'bait') {
            const rareBonus = (this.attractBonus['rare'] || 0) + 
                               (this.attractBonus['epic'] || 0) + 
                               (this.attractBonus['legendary'] || 0);
            return Math.floor(Math.min(rareBonus / 10, 4)) + 1;
        }
        return 1;
    }

    // 获取星级显示
    getStars() {
        const rating = this.getRating();
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    }
}

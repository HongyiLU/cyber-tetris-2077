// 游戏状态管理类 - 优化版

class GameState {
    constructor() {
        this.load();
    }

    // 初始化新游戏
    initNewGame() {
        this.coins = 100;
        this.level = 1;
        this.exp = 0;
        this.expNeeded = 100;
        this.totalFishCaught = 0;
        this.biggestFish = null;
        this.discoveredFish = [];
        this.equipment = getInitialEquipment();
        this.inventory = [];
        this.achievements = [];
        this.playTime = 0;
        this.totalGoldEarned = 0;
        this.totalExpEarned = 0;
        this.biggestCatch = null;
        this.save();
    }

    // 保存游戏状态
    save() {
        const data = {
            coins: this.coins,
            level: this.level,
            exp: this.exp,
            expNeeded: this.expNeeded,
            totalFishCaught: this.totalFishCaught,
            biggestFish: this.biggestFish,
            discoveredFish: this.discoveredFish,
            equipment: this.equipment,
            inventory: this.inventory,
            achievements: this.achievements,
            playTime: this.playTime,
            totalGoldEarned: this.totalGoldEarned,
            totalExpEarned: this.totalExpEarned,
            biggestCatch: this.biggestCatch,
            lastSave: Date.now()
        };
        saveData('gamestate', data);
    }

    // 加载游戏状态
    load() {
        const data = loadData('gamestate');
        if (data) {
            this.coins = data.coins || 100;
            this.level = data.level || 1;
            this.exp = data.exp || 0;
            this.expNeeded = data.expNeeded || 100;
            this.totalFishCaught = data.totalFishCaught || 0;
            this.biggestFish = data.biggestFish || null;
            this.discoveredFish = data.discoveredFish || [];
            this.equipment = data.equipment || getInitialEquipment();
            this.inventory = data.inventory || [];
            this.achievements = data.achievements || [];
            this.playTime = data.playTime || 0;
            this.totalGoldEarned = data.totalGoldEarned || 0;
            this.totalExpEarned = data.totalExpEarned || 0;
            this.biggestCatch = data.biggestCatch || null;
        } else {
            this.initNewGame();
        }
    }

    // 增加金币
    addCoins(amount) {
        this.coins += amount;
        this.totalGoldEarned += amount;
        this.checkAchievements();
        this.save();
    }

    // 减少金币
    spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            this.save();
            return true;
        }
        return false;
    }

    // 增加经验
    addExp(amount) {
        this.exp += amount;
        this.totalExpEarned += amount;
        while (this.exp >= this.expNeeded) {
            this.levelUp();
        }
        this.checkAchievements();
        this.save();
    }

    // 升级
    levelUp() {
        this.exp -= this.expNeeded;
        this.level++;
        this.expNeeded = Math.floor(this.expNeeded * 1.4);
        // 升级奖励
        const bonusCoins = this.level * 20;
        this.coins += bonusCoins;
        this.totalGoldEarned += bonusCoins;
        
        if (game && game.ui) {
            game.ui.showMessage(`🎉 升级了！现在是 ${this.level} 级！获得 ${bonusCoins} 金币！`, 'success');
        }
        this.checkAchievements();
    }

    // 记录钓到的鱼
    recordFishCaught(fish, weight) {
        this.totalFishCaught++;
        
        // 更新最大鱼
        if (!this.biggestFish || weight > this.biggestFish.weight) {
            this.biggestFish = { fishId: fish.id, weight: weight };
        }
        
        // 更新最大单条记录
        const value = calculateFishValue(fish, weight);
        if (!this.biggestCatch || value > this.biggestCatch.value) {
            this.biggestCatch = { fishId: fish.id, weight: weight, value: value };
        }
        
        // 记录发现的鱼
        if (!this.discoveredFish.includes(fish.id)) {
            this.discoveredFish.push(fish.id);
            if (game && game.ui) {
                game.ui.showMessage(`📖 新发现：${fish.name}！`, 'info');
            }
        }
        
        this.checkAchievements();
        this.save();
    }

    // 添加到背包
    addToInventory(fish, weight, value) {
        this.inventory.push({
            fishId: fish.id,
            weight: weight,
            value: value,
            timestamp: Date.now()
        });
        this.save();
    }

    // 从背包移除
    removeFromInventory(index) {
        if (index >= 0 && index < this.inventory.length) {
            this.inventory.splice(index, 1);
            this.save();
        }
    }

    // 清空背包
    clearInventory() {
        this.inventory = [];
        this.save();
    }

    // 购买装备
    buyEquipment(type, itemId) {
        let item, ownedList, price;
        
        switch (type) {
            case 'rod':
                item = getRodById(itemId);
                ownedList = this.equipment.ownedRods;
                break;
            case 'line':
                item = getLineById(itemId);
                ownedList = this.equipment.ownedLines;
                break;
            case 'bait':
                item = getBaitById(itemId);
                ownedList = this.equipment.ownedBaits;
                break;
        }
        
        if (!item) return false;
        if (ownedList.includes(itemId)) return false;
        if (this.coins < item.price) return false;
        
        this.spendCoins(item.price);
        ownedList.push(itemId);
        this.checkAchievements();
        this.save();
        return true;
    }

    // 装备物品
    equipItem(type, itemId) {
        let ownedList;
        
        switch (type) {
            case 'rod':
                ownedList = this.equipment.ownedRods;
                if (ownedList.includes(itemId)) {
                    this.equipment.rod = itemId;
                    this.save();
                    return true;
                }
                break;
            case 'line':
                ownedList = this.equipment.ownedLines;
                if (ownedList.includes(itemId)) {
                    this.equipment.line = itemId;
                    this.save();
                    return true;
                }
                break;
            case 'bait':
                ownedList = this.equipment.ownedBaits;
                if (ownedList.includes(itemId)) {
                    this.equipment.bait = itemId;
                    this.save();
                    return true;
                }
                break;
        }
        return false;
    }

    // 获取当前装备
    getCurrentEquipment() {
        return {
            rod: getRodById(this.equipment.rod),
            line: getLineById(this.equipment.line),
            bait: getBaitById(this.equipment.bait)
        };
    }

    // 成就列表
    getAchievementList() {
        return [
            { id: 'first_catch', name: '初出茅庐', desc: '钓到第一条鱼', check: () => this.totalFishCaught >= 1, reward: 50 },
            { id: 'ten_catch', name: '小有收获', desc: '累计钓到10条鱼', check: () => this.totalFishCaught >= 10, reward: 100 },
            { id: 'hundred_catch', name: '钓鱼达人', desc: '累计钓到100条鱼', check: () => this.totalFishCaught >= 100, reward: 500 },
            { id: 'first_rare', name: '稀有发现', desc: '钓到第一条稀有鱼', check: () => this.discoveredFish.some(id => { const f = getFishById(id); return f && f.rarity === 'rare'; }), reward: 150 },
            { id: 'first_epic', name: '史诗捕获', desc: '钓到第一条史诗鱼', check: () => this.discoveredFish.some(id => { const f = getFishById(id); return f && f.rarity === 'epic'; }), reward: 300 },
            { id: 'first_legendary', name: '传说降临', desc: '钓到传说级鱼类', check: () => this.discoveredFish.some(id => { const f = getFishById(id); return f && f.rarity === 'legendary'; }), reward: 1000 },
            { id: 'full_collection', name: '鱼类学家', desc: '发现所有鱼类', check: () => this.discoveredFish.length >= FISH_DATA.length, reward: 2000 },
            { id: 'level_5', name: '渐入佳境', desc: '达到5级', check: () => this.level >= 5, reward: 200 },
            { id: 'level_10', name: '炉火纯青', desc: '达到10级', check: () => this.level >= 10, reward: 500 },
            { id: 'rich', name: '富甲一方', desc: '累计获得5000金币', check: () => this.totalGoldEarned >= 5000, reward: 300 },
            { id: 'big_fish', name: '大鱼上钩', desc: '钓到2kg以上的大鱼', check: () => this.biggestFish && this.biggestFish.weight >= 2000, reward: 250 }
        ];
    }

    // 检查成就
    checkAchievements() {
        const achievements = this.getAchievementList();
        let newAchievement = null;
        
        for (const achievement of achievements) {
            if (!this.achievements.includes(achievement.id) && achievement.check()) {
                this.achievements.push(achievement.id);
                this.coins += achievement.reward;
                this.totalGoldEarned += achievement.reward;
                newAchievement = achievement;
                break; // 一次只解锁一个
            }
        }
        
        if (newAchievement && game && game.ui) {
            setTimeout(() => {
                game.ui.showMessage(`🏆 成就解锁：${newAchievement.name}！+${newAchievement.reward}金币`, 'success');
            }, 500);
        }
    }

    // 获取统计信息
    getStats() {
        return {
            totalFishCaught: this.totalFishCaught,
            discoveredCount: this.discoveredFish.length,
            totalFishTypes: FISH_DATA.length,
            biggestFish: this.biggestFish,
            biggestCatch: this.biggestCatch,
            totalGoldEarned: this.totalGoldEarned,
            totalExpEarned: this.totalExpEarned,
            achievementCount: this.achievements.length,
            totalAchievements: this.getAchievementList().length
        };
    }

    // 重置游戏
    reset() {
        if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
            this.initNewGame();
            if (game && game.ui) {
                game.ui.showMessage('游戏已重置！', 'info');
                game.ui.updateStatus();
            }
            return true;
        }
        return false;
    }
}

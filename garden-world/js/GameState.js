// 游戏状态管理类

class GameState {
    constructor() {
        this.load();
    }

    initNewGame() {
        this.coins = 150;
        this.level = 1;
        this.exp = 0;
        this.expNeeded = 100;
        this.day = 1;
        this.energy = 100;
        this.maxEnergy = 100;
        this.totalHarvested = 0;
        this.totalPlanted = 0;
        this.totalEarned = 0;
        this.inventory = {};
        this.selectedSeed = 'tulip';
        this.selectedTool = 'water';
        this.unlockedPlants = ['tulip', 'sunflower', 'carrot'];
        this.garden = this.createEmptyGarden();
        this.save();
    }

    createEmptyGarden() {
        const garden = [];
        for (let i = 0; i < 48; i++) {
            garden.push({
                tilled: false,
                watered: false,
                plant: null,
                plantStage: 0,
                plantDays: 0
            });
        }
        return garden;
    }

    save() {
        const data = {
            coins: this.coins,
            level: this.level,
            exp: this.exp,
            expNeeded: this.expNeeded,
            day: this.day,
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            totalHarvested: this.totalHarvested,
            totalPlanted: this.totalPlanted,
            totalEarned: this.totalEarned,
            inventory: this.inventory,
            selectedSeed: this.selectedSeed,
            selectedTool: this.selectedTool,
            unlockedPlants: this.unlockedPlants,
            garden: this.garden
        };
        saveData('gamestate', data);
    }

    load() {
        const data = loadData('gamestate');
        if (data) {
            this.coins = data.coins || 150;
            this.level = data.level || 1;
            this.exp = data.exp || 0;
            this.expNeeded = data.expNeeded || 100;
            this.day = data.day || 1;
            this.energy = data.energy !== undefined ? data.energy : 100;
            this.maxEnergy = data.maxEnergy || 100;
            this.totalHarvested = data.totalHarvested || 0;
            this.totalPlanted = data.totalPlanted || 0;
            this.totalEarned = data.totalEarned || 0;
            this.inventory = data.inventory || {};
            this.selectedSeed = data.selectedSeed || 'tulip';
            this.selectedTool = data.selectedTool || 'water';
            this.unlockedPlants = data.unlockedPlants || ['tulip', 'sunflower', 'carrot'];
            this.garden = data.garden || this.createEmptyGarden();
        } else {
            this.initNewGame();
        }
    }

    addCoins(amount) {
        this.coins += amount;
        this.totalEarned += amount;
        this.checkUnlocks();
        this.save();
    }

    spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            this.save();
            return true;
        }
        return false;
    }

    addExp(amount) {
        this.exp += amount;
        while (this.exp >= this.expNeeded) {
            this.levelUp();
        }
        this.checkUnlocks();
        this.save();
    }

    levelUp() {
        this.exp -= this.expNeeded;
        this.level++;
        this.expNeeded = Math.floor(this.expNeeded * 1.4);
        this.maxEnergy += 10;
        this.energy = this.maxEnergy;
        if (game && game.ui) {
            game.ui.showMessage(`🎉 升级了！现在是 ${this.level} 级！`, 'success');
        }
    }

    useEnergy(amount) {
        if (this.energy >= amount) {
            this.energy -= amount;
            this.save();
            return true;
        }
        return false;
    }

    restoreEnergy() {
        this.energy = this.maxEnergy;
        this.save();
    }

    nextDay() {
        this.day++;
        this.restoreEnergy();
        this.growPlants();
        this.save();
    }

    growPlants() {
        for (let i = 0; i < this.garden.length; i++) {
            const plot = this.garden[i];
            if (plot.plant && plot.watered) {
                plot.plantDays++;
                plot.watered = false;
                
                const plantData = getPlantById(plot.plant);
                if (plantData) {
                    const daysPerStage = plantData.growTime / (plantData.stages - 1);
                    plot.plantStage = Math.min(
                        Math.floor(plot.plantDays / daysPerStage) + 1,
                        plantData.stages
                    );
                }
            }
        }
    }

    addToInventory(itemId, count = 1) {
        if (!this.inventory[itemId]) {
            this.inventory[itemId] = 0;
        }
        this.inventory[itemId] += count;
        this.save();
    }

    removeFromInventory(itemId, count = 1) {
        if (this.inventory[itemId]) {
            this.inventory[itemId] -= count;
            if (this.inventory[itemId] <= 0) {
                delete this.inventory[itemId];
            }
            this.save();
            return true;
        }
        return false;
    }

    checkUnlocks() {
        const unlockLevelMap = {
            3: ['rose', 'corn'],
            5: ['eggplant'],
            7: ['strawberry'],
            10: ['watermelon'],
            15: ['cherry'],
            20: ['rainbow']
        };

        for (const level in unlockLevelMap) {
            if (this.level >= parseInt(level)) {
                for (const plantId of unlockLevelMap[level]) {
                    if (!this.unlockedPlants.includes(plantId)) {
                        this.unlockedPlants.push(plantId);
                        if (game && game.ui) {
                            const plant = getPlantById(plantId);
                            game.ui.showMessage(`🔓 解锁新植物：${plant.emoji} ${plant.name}！`, 'info');
                        }
                    }
                }
            }
        }
    }

    getStats() {
        return {
            coins: this.coins,
            level: this.level,
            day: this.day,
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            totalHarvested: this.totalHarvested,
            totalPlanted: this.totalPlanted,
            totalEarned: this.totalEarned,
            unlockedCount: this.unlockedPlants.length,
            totalPlants: PLANTS_DATA.length
        };
    }
}

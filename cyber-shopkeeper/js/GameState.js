// 赛博朋克掌柜 - 游戏状态管理

class GameState {
    constructor() {
        this.load();
    }

    initNewGame() {
        this.cash = 10000;
        this.reputation = 0;
        this.level = 1;
        this.exp = 0;
        this.expNeeded = 500;
        this.day = 1;
        this.energy = 100;
        this.maxEnergy = 100;
        this.totalEarned = 0;
        
        // 商店状态
        this.shops = {};
        SHOPS_DATA.forEach(shop => {
            this.shops[shop.id] = {
                unlocked: shop.unlocked || false,
                level: shop.level || 1,
                staff: null,
                active: shop.unlocked || false
            };
        });
        
        // 员工
        this.staff = [];
        this.maxStaff = 3;
        
        // 库存
        this.inventory = {};
        
        this.save();
    }

    save() {
        const data = {
            cash: this.cash,
            reputation: this.reputation,
            level: this.level,
            exp: this.exp,
            expNeeded: this.expNeeded,
            day: this.day,
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            totalEarned: this.totalEarned,
            shops: this.shops,
            staff: this.staff,
            maxStaff: this.maxStaff,
            inventory: this.inventory
        };
        saveData('gamestate', data);
    }

    load() {
        const data = loadData('gamestate');
        if (data) {
            this.cash = data.cash || 10000;
            this.reputation = data.reputation || 0;
            this.level = data.level || 1;
            this.exp = data.exp || 0;
            this.expNeeded = data.expNeeded || 500;
            this.day = data.day || 1;
            this.energy = data.energy !== undefined ? data.energy : 100;
            this.maxEnergy = data.maxEnergy || 100;
            this.totalEarned = data.totalEarned || 0;
            this.shops = data.shops || this.initShops();
            this.staff = data.staff || [];
            this.maxStaff = data.maxStaff || 3;
            this.inventory = data.inventory || {};
        } else {
            this.initNewGame();
        }
    }

    initShops() {
        const shops = {};
        SHOPS_DATA.forEach(shop => {
            shops[shop.id] = {
                unlocked: shop.unlocked || false,
                level: shop.level || 1,
                staff: null,
                active: shop.unlocked || false
            };
        });
        return shops;
    }

    addCash(amount) {
        this.cash += amount;
        this.totalEarned += amount;
        this.addExp(Math.floor(amount / 100));
        this.save();
    }

    spendCash(amount) {
        if (this.cash >= amount) {
            this.cash -= amount;
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
        this.save();
    }

    levelUp() {
        this.exp -= this.expNeeded;
        this.level++;
        this.expNeeded = Math.floor(this.expNeeded * 1.5);
        this.maxEnergy += 10;
        this.energy = this.maxEnergy;
        
        if (game && game.ui) {
            game.ui.showMessage(`🎉 升级了！现在是 ${this.level} 级！`, 'success');
        }
        
        this.checkUnlocks();
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
        
        let dailyIncome = 0;
        SHOPS_DATA.forEach(shopData => {
            const shop = this.shops[shopData.id];
            if (shop && shop.unlocked && shop.active) {
                const baseProfit = shopData.baseProfit * shop.level;
                let staffBonus = 1;
                
                if (shop.staff) {
                    const staffData = getStaffById(shop.staff);
                    if (staffData) {
                        staffBonus = staffData.efficiency;
                    }
                }
                
                const profit = Math.floor(baseProfit * staffBonus * random(0.8, 1.3));
                dailyIncome += profit;
                this.reputation += Math.floor(profit / 50);
            }
        });
        
        let salaryCost = 0;
        this.staff.forEach(staffId => {
            const staffData = getStaffById(staffId);
            if (staffData) {
                salaryCost += staffData.salary;
            }
        });
        
        const netProfit = dailyIncome - salaryCost;
        
        if (netProfit > 0) {
            this.addCash(netProfit);
        } else {
            this.cash += netProfit;
        }
        
        this.save();
        return netProfit;
    }

    unlockShop(shopId) {
        const shopData = getShopById(shopId);
        if (!shopData) return false;
        
        if (this.shops[shopId].unlocked) return false;
        if (shopData.unlockLevel && this.level < shopData.unlockLevel) return false;
        if (shopData.unlockCost && !this.spendCash(shopData.unlockCost)) return false;
        
        this.shops[shopId].unlocked = true;
        this.shops[shopId].active = true;
        this.save();
        return true;
    }

    upgradeShop(shopId) {
        const shopData = getShopById(shopId);
        if (!shopData) return false;
        
        const shop = this.shops[shopId];
        if (!shop.unlocked) return false;
        
        const upgradeCost = shopData.upgradeCost * shop.level;
        if (!this.spendCash(upgradeCost)) return false;
        
        shop.level++;
        this.save();
        return true;
    }

    hireStaff(staffId) {
        if (this.staff.length >= this.maxStaff) return false;
        if (this.staff.includes(staffId)) return false;
        
        const staffData = getStaffById(staffId);
        if (!staffData) return false;
        
        if (!this.spendCash(staffData.cost)) return false;
        
        this.staff.push(staffId);
        this.save();
        return true;
    }

    assignStaff(shopId, staffId) {
        if (!this.staff.includes(staffId)) return false;
        
        SHOPS_DATA.forEach(s => {
            if (this.shops[s.id]) {
                if (this.shops[s.id].staff === staffId) {
                    this.shops[s.id].staff = null;
                }
            }
        });
        
        if (shopId && this.shops[shopId]) {
            this.shops[shopId].staff = staffId;
        }
        
        this.save();
        return true;
    }

    checkUnlocks() {
        SHOPS_DATA.forEach(shopData => {
            if (!this.shops[shopData.id].unlocked && 
                shopData.unlockLevel && 
                this.level >= shopData.unlockLevel) {
                if (game && game.ui) {
                    game.ui.showMessage(`🔓 新商店解锁：${shopData.emoji} ${shopData.name}！`, 'info');
                }
            }
        });
    }

    getStats() {
        return {
            cash: this.cash,
            reputation: this.reputation,
            level: this.level,
            day: this.day,
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            totalEarned: this.totalEarned,
            staffCount: this.staff.length,
            maxStaff: this.maxStaff
        };
    }
}

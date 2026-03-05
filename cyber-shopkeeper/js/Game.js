// 赛博朋克掌柜 - 主游戏类

class Game {
    constructor() {
        this.state = new GameState();
        this.ui = null;
        this.shop = null;
    }

    init() {
        this.ui = new UI(this);
        this.shop = new Shop(this);
        
        this.ui.init();
        
        console.log('🌃 赛博朋克掌柜 2077 已启动！');
    }

    nextDay() {
        const netProfit = this.state.nextDay();
        this.ui.updateUI();
        this.ui.renderShopPanel();
        this.ui.renderStaffPanel();
        
        if (netProfit > 0) {
            this.ui.showMessage(`🌙 第 ${this.state.day} 天结束！盈利 ₵${formatCash(netProfit)}`, 'success');
        } else {
            this.ui.showMessage(`🌙 第 ${this.state.day} 天结束！亏损 ₵${formatCash(Math.abs(netProfit))}`, 'error');
        }
    }

    unlockShop(shopId) {
        if (this.state.unlockShop(shopId)) {
            const shopData = getShopById(shopId);
            this.ui.updateUI();
            this.ui.renderShopPanel();
            this.ui.closeModal();
            this.ui.showMessage(`🔓 商店已解锁：${shopData.emoji} ${shopData.name}！`, 'success');
        } else {
            this.ui.showMessage('❌ 解锁失败！', 'error');
        }
    }

    upgradeShop(shopId) {
        if (this.state.upgradeShop(shopId)) {
            const shopData = getShopById(shopId);
            this.ui.updateUI();
            this.ui.renderShopPanel();
            this.ui.closeModal();
            this.ui.showMessage(`⬆️ 商店升级成功！`, 'success');
        } else {
            this.ui.showMessage('❌ 升级失败！金币不足？', 'error');
        }
    }

    hireStaff(staffId) {
        if (this.state.hireStaff(staffId)) {
            const staffData = getStaffById(staffId);
            this.ui.renderStaffPanel();
            this.ui.showMessage(`👥 已招聘：${staffData.emoji} ${staffData.name}！`, 'success');
        } else {
            this.ui.showMessage('❌ 招聘失败！', 'error');
        }
    }

    assignStaff(shopId, staffId) {
        if (this.state.assignStaff(shopId, staffId)) {
            this.ui.showMessage('✅ 员工已分配！', 'success');
        }
    }
}

let game;

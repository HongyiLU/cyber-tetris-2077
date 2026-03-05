// 赛博朋克掌柜 - UI管理

class UI {
    constructor(game) {
        this.game = game;
        this.elements = {};
        this.cacheElements();
    }

    cacheElements() {
        this.elements = {
            cashCount: document.getElementById('cash-count'),
            reputationCount: document.getElementById('reputation-count'),
            playerLevel: document.getElementById('player-level'),
            dayCount: document.getElementById('day-count'),
            energyCount: document.getElementById('energy-count'),
            shopContent: document.getElementById('shop-content'),
            staffContent: document.getElementById('staff-content'),
            modalContainer: document.getElementById('modal-container'),
            messageContainer: document.getElementById('message-container'),
            btnNextDay: document.getElementById('btn-next-day'),
            btnSave: document.getElementById('btn-save')
        };
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
        this.renderShopPanel();
        this.renderStaffPanel();
    }

    setupEventListeners() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.dataset.tool;
                this.selectTool(tool);
            });
        });

        document.querySelectorAll('.building').forEach(building => {
            building.addEventListener('click', () => {
                const shopId = building.dataset.shop;
                this.openShopDetail(shopId);
            });
        });

        this.elements.btnNextDay.addEventListener('click', () => this.game.nextDay());
        this.elements.btnSave.addEventListener('click', () => this.saveGame());
    }

    selectTool(tool) {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        
        const toolNames = {
            'manage': '🏪 商店管理',
            'staff': '👥 员工管理',
            'market': '📊 市场',
            'tasks': '📋 任务'
        };
        this.showMessage(`已选择：${toolNames[tool]}`, 'info');
    }

    updateUI() {
        const state = this.game.state;
        this.elements.cashCount.textContent = formatCash(state.cash);
        this.elements.reputationCount.textContent = formatCash(state.reputation);
        this.elements.playerLevel.textContent = state.level;
        this.elements.dayCount.textContent = state.day;
        this.elements.energyCount.textContent = state.energy;
        this.updateBuildings();
    }

    updateBuildings() {
        SHOPS_DATA.forEach(shopData => {
            const building = document.getElementById(`shop-${SHOPS_DATA.indexOf(shopData) + 1}`);
            if (building) {
                const shop = this.game.state.shops[shopData.id];
                if (shop) {
                    const levelEl = building.querySelector('.shop-level');
                    if (levelEl) {
                        if (shop.unlocked) {
                            levelEl.textContent = `Lv.${shop.level}`;
                        } else {
                            levelEl.textContent = '🔒';
                        }
                    }
                }
            }
        });
    }

    renderShopPanel() {
        const content = this.elements.shopContent;
        content.innerHTML = '';

        SHOPS_DATA.forEach(shopData => {
            const shop = this.game.state.shops[shopData.id];
            if (!shop) return;

            const item = document.createElement('div');
            item.className = 'shop-item';
            
            if (shop.unlocked) {
                item.innerHTML = `
                    <div class="shop-item-name">${shopData.emoji} ${shopData.name}</div>
                    <div class="shop-item-desc">Lv.${shop.level}</div>
                    <div class="shop-item-price">收益: ₵${shopData.baseProfit * shop.level}/天</div>
                `;
                item.addEventListener('click', () => this.openShopDetail(shopData.id));
            } else {
                item.innerHTML = `
                    <div class="shop-item-name">🔒 ???</div>
                    <div class="shop-item-desc">Lv.${shopData.unlockLevel}解锁</div>
                `;
                item.style.opacity = '0.5';
            }
            
            content.appendChild(item);
        });
    }

    renderStaffPanel() {
        const content = this.elements.staffContent;
        content.innerHTML = '';

        content.innerHTML += '<div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid var(--cyber-pink);">';
        content.innerHTML += `<div style="color: var(--cyber-yellow); font-weight: bold;">📋 招聘市场</div>`;
        content.innerHTML += '</div>';

        STAFF_DATA.forEach(staffData => {
            const owned = this.game.state.staff.includes(staffData.id);
            
            const item = document.createElement('div');
            item.className = 'shop-item';
            
            if (!owned) {
                item.innerHTML = `
                    <div class="shop-item-name">${staffData.emoji} ${staffData.name}</div>
                    <div class="shop-item-desc">${staffData.description}</div>
                    <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="color: var(--cyber-cyan); font-size: 0.85rem;">效率 ×${staffData.efficiency} | 魅力 ×${staffData.charisma}</div>
                        <div class="shop-item-price">₵${staffData.cost}</div>
                    </div>
                    <button style="margin-top: 10px; width: 100%; padding: 8px; background: var(--cyber-green); border: none; color: var(--cyber-dark); cursor: pointer; font-family: 'Courier New', monospace; font-weight: bold;" 
                            onclick="game.hireStaff('${staffData.id}')">
                        📝 招聘
                    </button>
                `;
            } else {
                item.innerHTML = `
                    <div class="shop-item-name">${staffData.emoji} ${staffData.name} ✓</div>
                    <div class="shop-item-desc">已招聘</div>
                    <div style="margin-top: 8px; color: var(--cyber-green);">工资: ₵${staffData.salary}/天</div>
                `;
                item.style.opacity = '0.7';
            }
            
            content.appendChild(item);
        });

        content.innerHTML += '<div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid var(--cyber-cyan);">';
        content.innerHTML += `<div style="color: var(--cyber-yellow); font-weight: bold; margin-bottom: 10px;">👥 我的员工 (${this.game.state.staff.length}/${this.game.state.maxStaff})</div>`;
        
        if (this.game.state.staff.length === 0) {
            content.innerHTML += '<p style="color: #888; text-align: center;">还没有员工</p>';
        } else {
            this.game.state.staff.forEach(staffId => {
                const staffData = getStaffById(staffId);
                if (!staffData) return;
                content.innerHTML += `
                    <div style="background: rgba(0,255,255,0.1); border: 2px solid var(--cyber-cyan); padding: 10px; margin-bottom: 8px;">
                        <div style="font-weight: bold;">${staffData.emoji} ${staffData.name}</div>
                        <div style="font-size: 0.85rem; color: #888;">效率 ×${staffData.efficiency} | 工资 ₵${staffData.salary}/天</div>
                    </div>
                `;
            });
        }
        content.innerHTML += '</div>';
    }

    openShopDetail(shopId) {
        const shopData = getShopById(shopId);
        const shop = this.game.state.shops[shopId];
        
        if (!shopData || !shop) return;

        let content = `<h2>${shopData.emoji} ${shopData.name}</h2>`;
        
        if (!shop.unlocked) {
            if (shopData.unlockLevel && this.game.state.level < shopData.unlockLevel) {
                content += `
                    <div style="text-align: center; padding: 30px;">
                        <p style="color: #ff5555; font-size: 1.2rem;">🔒 需要等级 ${shopData.unlockLevel}</p>
                        <p style="color: #888; margin-top: 10px;">当前等级: ${this.game.state.level}</p>
                    </div>
                `;
            } else {
                content += `
                    <div style="text-align: center; padding: 30px;">
                        <p style="margin-bottom: 20px;">解锁费用: ₵${formatCash(shopData.unlockCost)}</p>
                        <button class="btn-primary" onclick="game.unlockShop('${shopId}')">🔓 解锁商店</button>
                    </div>
                `;
            }
        } else {
            const dailyProfit = shopData.baseProfit * shop.level;
            const upgradeCost = shopData.upgradeCost * shop.level;
            
            content += `
                <div style="background: rgba(0,255,255,0.1); border: 2px solid var(--cyber-cyan); padding: 20px; margin: 20px 0; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">${shopData.emoji}</div>
                    <div style="font-size: 1.4rem; font-weight: bold;">Lv.${shop.level}</div>
                    <div style="color: var(--cyber-green); margin-top: 10px;">预计收益: ₵${dailyProfit}/天</div>
                </div>
                
                <div style="margin-top: 20px;">
                    <h3 style="color: var(--cyber-yellow); margin-bottom: 15px;">📦 商品</h3>
            `;
            
            shopData.products.forEach(product => {
                content += `
                    <div style="background: rgba(0,255,255,0.05); padding: 12px; margin-bottom: 10px; border-left: 4px solid var(--cyber-cyan);">
                        <div style="font-weight: bold;">${product.name}</div>
                        <div style="color: #888; font-size: 0.9rem;">售价: ₵${product.price} | 利润: ₵${product.profit}</div>
                    </div>
                `;
            });
            
            content += `
                </div>
                
                <div style="text-align: center; margin-top: 25px;">
                    <button class="btn-secondary" onclick="game.ui.closeModal()">关闭</button>
                    <button class="btn-primary" onclick="game.upgradeShop('${shopId}')" style="margin-left: 10px;">
                        ⬆️ 升级 (₵${formatCash(upgradeCost)})
                    </button>
                </div>
            `;
        }
        
        this.showModal(content);
    }

    showMessage(text, type = 'info') {
        const oldMessages = this.elements.messageContainer.querySelectorAll('.message');
        oldMessages.forEach(msg => {
            msg.style.opacity = '0';
            setTimeout(() => msg.remove(), 300);
        });

        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        this.elements.messageContainer.appendChild(message);

        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 2500);
    }

    saveGame() {
        this.game.state.save();
        this.showMessage('💾 游戏已保存！', 'success');
    }

    showModal(content) {
        this.elements.modalContainer.innerHTML = `
            <div class="modal-overlay" onclick="game.ui.closeModal(event)">
                <div class="modal" onclick="event.stopPropagation()">
                    <button class="modal-close" onclick="game.ui.closeModal()">&times;</button>
                    ${content}
                </div>
            </div>
        `;
        this.elements.modalContainer.classList.remove('hidden');
    }

    closeModal(event) {
        if (event && event.target !== event.currentTarget) return;
        this.elements.modalContainer.classList.add('hidden');
        this.elements.modalContainer.innerHTML = '';
    }
}

function showMessage(text, type) {
    if (game && game.ui) {
        game.ui.showMessage(text, type);
    }
}

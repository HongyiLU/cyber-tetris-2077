// 用户界面管理类

class UI {
    constructor(game) {
        this.game = game;
        this.elements = {};
        this.cacheElements();
    }

    cacheElements() {
        this.elements = {
            coinCount: document.getElementById('coin-count'),
            playerLevel: document.getElementById('player-level'),
            dayCount: document.getElementById('day-count'),
            energyCount: document.getElementById('energy-count'),
            gardenGrid: document.getElementById('garden-grid'),
            shopContent: document.getElementById('shop-content'),
            inventoryContent: document.getElementById('inventory-content'),
            modalContainer: document.getElementById('modal-container'),
            messageContainer: document.getElementById('message-container'),
            btnNextDay: document.getElementById('btn-next-day'),
            btnSave: document.getElementById('btn-save'),
            btnStats: document.getElementById('btn-stats')
        };
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
        this.renderShop();
        this.renderInventory();
    }

    setupEventListeners() {
        // 工具按钮
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.dataset.tool;
                this.selectTool(tool);
            });
        });

        // 操作按钮
        this.elements.btnNextDay.addEventListener('click', () => this.game.nextDay());
        this.elements.btnSave.addEventListener('click', () => this.saveGame());
        this.elements.btnStats.addEventListener('click', () => this.showStats());
    }

    selectTool(tool) {
        this.game.state.selectedTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        
        const toolNames = {
            'water': '💧 浇水',
            'plant': '🌱 种植',
            'harvest': '✂️ 收获',
            'remove': '🪓 清除'
        };
        this.showMessage(`已选择：${toolNames[tool]}`, 'info');
    }

    updateUI() {
        const state = this.game.state;
        this.elements.coinCount.textContent = formatCoins(state.coins);
        this.elements.playerLevel.textContent = state.level;
        this.elements.dayCount.textContent = state.day;
        this.elements.energyCount.textContent = state.energy;
    }

    renderShop() {
        const state = this.game.state;
        const content = this.elements.shopContent;
        content.innerHTML = '';

        PLANTS_DATA.forEach(plant => {
            const unlocked = state.unlockedPlants.includes(plant.id);
            const selected = state.selectedSeed === plant.id;
            
            const item = document.createElement('div');
            item.className = `shop-item ${selected ? 'selected' : ''} ${!unlocked ? 'locked' : ''}`;
            
            if (unlocked) {
                item.innerHTML = `
                    <div class="shop-item-name">${plant.emoji} ${plant.name}</div>
                    <div class="shop-item-price">💰 ${plant.seedPrice}</div>
                `;
                item.addEventListener('click', () => this.selectSeed(plant.id));
            } else {
                item.innerHTML = `
                    <div class="shop-item-name">🔒 ???</div>
                    <div class="shop-item-price">等级解锁</div>
                `;
                item.style.opacity = '0.5';
            }
            
            content.appendChild(item);
        });
    }

    selectSeed(seedId) {
        const plant = getPlantById(seedId);
        if (!plant) return;
        
        this.game.state.selectedSeed = seedId;
        this.game.state.save();
        this.renderShop();
        this.showMessage(`已选择：${plant.emoji} ${plant.name}`, 'info');
    }

    renderInventory() {
        const state = this.game.state;
        const content = this.elements.inventoryContent;
        content.innerHTML = '';

        const items = Object.entries(state.inventory);
        
        if (items.length === 0) {
            content.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">背包是空的<br>快去收获吧！</p>';
            return;
        }

        items.forEach(([itemId, count]) => {
            const plant = getPlantById(itemId);
            if (!plant) return;

            const item = document.createElement('div');
            item.className = 'inventory-item';
            item.innerHTML = `
                <div class="inventory-item-name">${plant.emoji} ${plant.name}</div>
                <div class="inventory-item-count">×${count}</div>
            `;
            content.appendChild(item);
        });
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

    showStats() {
        const stats = this.game.state.getStats();
        
        const content = `
            <h2>📊 游戏统计</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background: #2a2a2a; border: 3px solid #4a4a4a; padding: 15px; text-align: center;">
                    <div style="font-size: 2rem;">💰</div>
                    <div style="font-size: 1.4rem; font-weight: bold;">${formatCoins(stats.coins)}</div>
                    <div style="font-size: 0.9rem; color: #888;">金币</div>
                </div>
                <div style="background: #2a2a2a; border: 3px solid #4a4a4a; padding: 15px; text-align: center;">
                    <div style="font-size: 2rem;">⭐</div>
                    <div style="font-size: 1.4rem; font-weight: bold;">${stats.level}</div>
                    <div style="font-size: 0.9rem; color: #888;">等级</div>
                </div>
                <div style="background: #2a2a2a; border: 3px solid #4a4a4a; padding: 15px; text-align: center;">
                    <div style="font-size: 2rem;">📅</div>
                    <div style="font-size: 1.4rem; font-weight: bold;">第${stats.day}天</div>
                    <div style="font-size: 0.9rem; color: #888;">天数</div>
                </div>
                <div style="background: #2a2a2a; border: 3px solid #4a4a4a; padding: 15px; text-align: center;">
                    <div style="font-size: 2rem;">🌱</div>
                    <div style="font-size: 1.4rem; font-weight: bold;">${stats.totalPlanted}</div>
                    <div style="font-size: 0.9rem; color: #888;">种植数</div>
                </div>
                <div style="background: #2a2a2a; border: 3px solid #4a4a4a; padding: 15px; text-align: center;">
                    <div style="font-size: 2rem;">✂️</div>
                    <div style="font-size: 1.4rem; font-weight: bold;">${stats.totalHarvested}</div>
                    <div style="font-size: 0.9rem; color: #888;">收获数</div>
                </div>
                <div style="background: #2a2a2a; border: 3px solid #4a4a4a; padding: 15px; text-align: center;">
                    <div style="font-size: 2rem;">🌻</div>
                    <div style="font-size: 1.4rem; font-weight: bold;">${stats.unlockedCount}/${stats.totalPlants}</div>
                    <div style="font-size: 0.9rem; color: #888;">植物解锁</div>
                </div>
            </div>
            <div style="text-align: center;">
                <div style="color: #888; margin-bottom: 10px;">累计赚取：💰 ${formatCoins(stats.totalEarned)} 金币</div>
                <button class="btn-secondary" onclick="game.ui.closeModal()">关闭</button>
            </div>
        `;
        
        this.showModal(content);
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

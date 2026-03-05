// 用户界面管理类 - 优化版

class UI {
    constructor(game) {
        this.game = game;
        this.elements = {};
        this.cacheElements();
    }

    // 缓存DOM元素
    cacheElements() {
        this.elements = {
            coinCount: document.getElementById('coin-count'),
            playerLevel: document.getElementById('player-level'),
            playerExp: document.getElementById('player-exp'),
            expNeeded: document.getElementById('exp-needed'),
            float: document.getElementById('float'),
            linePath: document.getElementById('line-path'),
            fishContainer: document.getElementById('fish-container'),
            tensionMeter: document.getElementById('tension-meter'),
            tensionFill: document.getElementById('tension-fill'),
            castMeter: document.getElementById('cast-meter'),
            castFill: document.getElementById('cast-fill'),
            fishingRod: document.getElementById('fishing-rod'),
            btnCast: document.getElementById('btn-cast'),
            btnReel: document.getElementById('btn-reel'),
            btnInventory: document.getElementById('btn-inventory'),
            btnShop: document.getElementById('btn-shop'),
            btnGuide: document.getElementById('btn-guide'),
            btnStats: document.getElementById('btn-stats'),
            modalContainer: document.getElementById('modal-container'),
            messageContainer: document.getElementById('message-container'),
            waterScene: document.getElementById('water-scene')
        };
        
        // 绑定统计按钮
        if (this.elements.btnStats) {
            this.elements.btnStats.addEventListener('click', () => this.showStats());
        }
    }

    // 更新状态显示
    updateStatus() {
        const state = this.game.state;
        this.elements.coinCount.textContent = formatCoins(state.coins);
        this.elements.playerLevel.textContent = state.level;
        this.elements.playerExp.textContent = state.exp;
        this.elements.expNeeded.textContent = state.expNeeded;
    }

    // 更新抛竿按钮状态
    updateCastButton(canCast) {
        this.elements.btnCast.disabled = !canCast;
    }

    // 更新收线按钮状态
    updateReelButton(canReel) {
        this.elements.btnReel.disabled = !canReel;
    }

    // 显示抛竿力度条
    showCastMeter() {
        this.elements.castMeter.classList.remove('hidden');
        // 添加最佳位置标记
        if (!this.elements.castMeter.querySelector('.optimal-marker')) {
            const marker = document.createElement('div');
            marker.className = 'optimal-marker';
            marker.style.cssText = 'position: absolute; top: 0; left: 60%; width: 3px; height: 100%; background: white; z-index: 5;';
            this.elements.castMeter.querySelector('.cast-bar').appendChild(marker);
        }
    }

    // 隐藏抛竿力度条
    hideCastMeter() {
        this.elements.castMeter.classList.add('hidden');
    }

    // 更新抛竿力度
    updateCastMeter(progress) {
        this.elements.castFill.style.width = `${progress * 100}%`;
        // 颜色随进度变化
        const hue = progress < 0.5 ? 120 : (progress < 0.7 ? 60 : 0);
        this.elements.castFill.style.background = `linear-gradient(to right, hsl(${hue}, 70%, 50%), hsl(${hue + 30}, 70%, 50%))`;
    }

    // 显示张力计
    showTensionMeter() {
        this.elements.tensionMeter.classList.remove('hidden');
    }

    // 隐藏张力计
    hideTensionMeter() {
        this.elements.tensionMeter.classList.add('hidden');
    }

    // 更新张力计
    updateTensionMeter(tension) {
        this.elements.tensionFill.style.height = `${tension * 100}%`;
        // 颜色变化
        const hue = tension < 0.5 ? 120 : (tension < 0.75 ? 45 : 0);
        this.elements.tensionFill.style.background = `linear-gradient(to top, hsl(${hue}, 70%, 50%), hsl(${hue + 15}, 70%, 60%))`;
    }

    // 设置浮漂位置
    setFloatPosition(x, y) {
        const scene = this.elements.waterScene;
        const rect = scene.getBoundingClientRect();
        const sceneWidth = rect.width;
        const sceneHeight = rect.height;
        
        const percentX = (x / sceneWidth) * 100;
        const percentY = (y / (sceneHeight * 0.4)) * 100;
        
        this.elements.float.style.left = `${clamp(percentX, 10, 90)}%`;
        this.elements.float.style.top = `${clamp(percentY, 0, 80)}%`;
    }

    // 重置浮漂位置
    resetFloatPosition() {
        this.elements.float.style.left = '50%';
        this.elements.float.style.top = '0';
        this.elements.float.style.transform = 'translateX(-50%)';
    }

    // 播放咬钩动画
    startBitingAnimation() {
        this.elements.float.classList.add('biting');
    }

    // 停止咬钩动画
    stopBitingAnimation() {
        this.elements.float.classList.remove('biting');
    }

    // 播放抛竿动画
    playCastAnimation() {
        this.elements.fishingRod.classList.add('casting');
        setTimeout(() => {
            this.elements.fishingRod.classList.remove('casting');
        }, 500);
    }

    // 更新鱼线
    updateFishingLine() {
        const rod = this.elements.fishingRod;
        const float = this.elements.float;
        
        if (!rod || !float) return;
        
        const rodRect = rod.getBoundingClientRect();
        const floatRect = float.getBoundingClientRect();
        const container = this.elements.waterScene;
        const containerRect = container.getBoundingClientRect();
        
        const startX = rodRect.left - containerRect.left + 10;
        const startY = rodRect.top - containerRect.top + 10;
        const endX = floatRect.left - containerRect.left + floatRect.width / 2;
        const endY = floatRect.top - containerRect.top + floatRect.height / 2;
        
        const midX = (startX + endX) / 2;
        const sag = Math.min(Math.abs(endX - startX) / 3, 50);
        const midY = Math.max(startY, endY) + sag;
        
        const path = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
        this.elements.linePath.setAttribute('d', path);
    }

    // 添加游动的鱼（装饰用）- 优化版
    addSwimmingFish() {
        const container = this.elements.fishContainer;
        if (!container) return;
        
        const fish = document.createElement('div');
        const goRight = Math.random() > 0.5;
        fish.className = 'fish' + (!goRight ? ' flipped' : '');
        
        const startY = random(15, 65);
        const duration = random(6, 12);
        const size = random(0.6, 1.4);
        
        fish.style.top = `${startY}%`;
        fish.style.left = goRight ? '-60px' : 'calc(100% + 60px)';
        fish.style.transform = `scale(${size})`;
        fish.style.opacity = random(0.3, 0.7);
        
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        const color = randomChoice(colors);
        
        if (goRight) {
            fish.style.animation = `swimRight ${duration}s linear forwards`;
        } else {
            fish.style.animation = `swimLeft ${duration}s linear forwards`;
        }
        
        fish.innerHTML = `
            <div class="fish-body">
                <div class="fish-main" style="background: linear-gradient(135deg, ${color} 0%, ${this.adjustColor(color, -20)} 100%);"></div>
                <div class="fish-tail" style="border-left-color: ${color};"></div>
                <div class="fish-eye"></div>
            </div>
        `;
        
        container.appendChild(fish);
        
        setTimeout(() => {
            if (fish.parentNode) {
                fish.parentNode.removeChild(fish);
            }
        }, duration * 1000);
    }

    // 调整颜色亮度
    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // 显示弹窗
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

    // 关闭弹窗
    closeModal(event) {
        if (event && event.target !== event.currentTarget) return;
        this.elements.modalContainer.classList.add('hidden');
        this.elements.modalContainer.innerHTML = '';
    }

    // 显示背包 - 优化版
    showInventory() {
        const state = this.game.state;
        let content = '<h2>🎒 背包</h2>';
        
        if (state.inventory.length === 0) {
            content += '<p class="text-center" style="color: #7f8c8d; margin: 30px 0;">背包是空的，快去钓鱼吧！</p>';
        } else {
            let totalValue = 0;
            let totalWeight = 0;
            
            state.inventory.forEach((item, index) => {
                const fish = getFishById(item.fishId);
                if (fish) {
                    totalValue += item.value;
                    totalWeight += item.weight;
                    content += `
                        <div class="fish-card" style="margin: 10px 0; padding: 15px;">
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="font-size: 2.5rem;">${fish.icon}</div>
                                <div style="flex: 1; text-align: left;">
                                    <h3 style="margin: 0 0 5px 0;">${fish.name}</h3>
                                    <span class="rarity rarity-${fish.rarity}" style="font-size: 0.8rem;">${getRarityName(fish.rarity)}</span>
                                    <div style="margin-top: 8px; color: #636e72; font-size: 0.9rem;">
                                        ${formatWeight(item.weight)} · 💰 ${item.value}
                                    </div>
                                </div>
                                <button class="btn-primary" onclick="game.sellFish(${index})" style="padding: 8px 15px; font-size: 0.9rem;">出售</button>
                            </div>
                        </div>
                    `;
                }
            });
            
            content += `
                <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; margin-top: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>鱼类数量:</span>
                        <strong>${state.inventory.length} 条</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>总重量:</span>
                        <strong>${formatWeight(totalWeight)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <span>总价值:</span>
                        <strong style="color: #f39c12;">💰 ${totalValue} 金币</strong>
                    </div>
                    <button class="btn-primary" onclick="game.sellAllFish()" style="width: 100%;">全部出售</button>
                </div>
            `;
        }
        
        this.showModal(content);
    }

    // 显示商店 - 优化版
    showShop() {
        const state = this.game.state;
        let content = '<h2>🏪 渔具商店</h2>';
        
        // 当前装备信息
        const currentEquip = state.getCurrentEquipment();
        content += `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                <div style="font-size: 0.9rem; opacity: 0.9;">当前装备</div>
                <div style="margin-top: 8px; display: flex; gap: 15px; font-size: 0.9rem;">
                    <span>🎣 ${currentEquip.rod.name}</span>
                    <span>🪢 ${currentEquip.line.name}</span>
                    <span>🦐 ${currentEquip.bait.name}</span>
                </div>
            </div>
        `;
        
        // 钓鱼竿
        content += '<h3 style="margin-top: 10px; color: #2d3436;">🎣 钓鱼竿</h3>';
        ROD_DATA.forEach(rod => {
            const owned = state.equipment.ownedRods.includes(rod.id);
            const equipped = state.equipment.rod === rod.id;
            content += this.createShopItem('rod', rod, owned, equipped);
        });
        
        // 鱼线
        content += '<h3 style="margin-top: 20px; color: #2d3436;">🪢 鱼线</h3>';
        LINE_DATA.forEach(line => {
            const owned = state.equipment.ownedLines.includes(line.id);
            const equipped = state.equipment.line === line.id;
            content += this.createShopItem('line', line, owned, equipped);
        });
        
        // 鱼饵
        content += '<h3 style="margin-top: 20px; color: #2d3436;">🦐 鱼饵</h3>';
        BAIT_DATA.forEach(bait => {
            const owned = state.equipment.ownedBaits.includes(bait.id);
            const equipped = state.equipment.bait === bait.id;
            content += this.createShopItem('bait', bait, owned, equipped);
        });
        
        this.showModal(content);
    }

    // 创建商店物品 - 优化版
    createShopItem(type, item, owned, equipped) {
        let buttonText = '';
        let buttonClass = '';
        let disabled = false;
        
        if (equipped) {
            buttonText = '✓ 已装备';
            buttonClass = 'owned';
            disabled = true;
        } else if (owned) {
            buttonText = '装备';
            buttonClass = 'owned';
        } else if (item.price === 0) {
            buttonText = '免费';
            disabled = false;
        } else {
            buttonText = `购买 💰${item.price}`;
            disabled = this.game.state.coins < item.price;
        }
        
        const equipAction = owned && !equipped ? 
            `game.equipItem('${type}', '${item.id}')` :
            owned && equipped ? '' :
            `game.buyEquipment('${type}', '${item.id}')`;
        
        // 额外属性显示
        let extraInfo = '';
        if (type === 'rod') {
            extraInfo = `<div style="font-size: 0.8rem; color: #95a5a6;">控制+${item.controlBonus}% | 抛竿${item.castDistance}%</div>`;
        } else if (type === 'line') {
            extraInfo = `<div style="font-size: 0.8rem; color: #95a5a6;">张力${item.tensionMultiplier}x | 惊吓${item.spookiness}x</div>`;
        }
        
        return `
            <div class="shop-item" style="border: ${equipped ? '2px solid #3498db' : 'none'};">
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-desc">${item.description}</div>
                    ${extraInfo}
                </div>
                ${item.price > 0 && !owned ? `<div class="shop-item-price">💰 ${item.price}</div>` : ''}
                <button class="shop-item-btn ${buttonClass}" 
                        onclick="${equipAction}" 
                        ${disabled ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            </div>
        `;
    }

    // 显示图鉴 - 优化版
    showGuide() {
        const state = this.game.state;
        let content = '<h2>📖 鱼类图鉴</h2>';
        
        content += '<div class="guide-grid">';
        
        FISH_DATA.forEach(fish => {
            const discovered = state.discoveredFish.includes(fish.id);
            content += `
                <div class="guide-item ${discovered ? 'discovered' : 'undiscovered'}" 
                     onclick="game.ui.showFishDetail('${fish.id}')"
                     style="cursor: ${discovered ? 'pointer' : 'default'};">
                    <div class="guide-fish-icon">${discovered ? fish.icon : '❓'}</div>
                    <div class="guide-fish-name">${discovered ? fish.name : '???'}</div>
                    ${discovered ? `<div style="font-size: 0.7rem; margin-top: 5px;" class="rarity rarity-${fish.rarity}">${getRarityName(fish.rarity)}</div>` : ''}
                </div>
            `;
        });
        
        content += '</div>';
        
        const progress = Math.round((state.discoveredFish.length / FISH_DATA.length) * 100);
        content += `
            <div style="margin-top: 20px; text-align: center;">
                <div style="background: #ecf0f1; border-radius: 10px; height: 20px; overflow: hidden; margin-bottom: 10px;">
                    <div style="background: linear-gradient(90deg, #3498db, #2ecc71); height: 100%; width: ${progress}%; transition: width 0.5s;"></div>
                </div>
                <p>已发现: ${state.discoveredFish.length} / ${FISH_DATA.length} (${progress}%)</p>
            </div>
        `;
        
        this.showModal(content);
    }

    // 显示鱼类详情
    showFishDetail(fishId) {
        const fish = getFishById(fishId);
        if (!fish) return;
        
        const state = this.game.state;
        
        const content = `
            <div class="text-center">
                <div style="font-size: 4rem; margin-bottom: 10px;">${fish.icon}</div>
                <h2>${fish.name}</h2>
                <span class="rarity rarity-${fish.rarity}" style="font-size: 1rem;">${getRarityName(fish.rarity)}</span>
                <div style="margin-top: 20px; text-align: left; background: #f8f9fa; border-radius: 10px; padding: 15px;">
                    <p><strong>重量范围:</strong> ${formatWeight(fish.weightMin)} - ${formatWeight(fish.weightMax)}</p>
                    <p><strong>难度:</strong> ${'★'.repeat(fish.difficulty)}</p>
                    <p><strong>栖息地:</strong> ${fish.habitat === 'shallow' ? '浅水区' : fish.habitat === 'medium' ? '中等深度' : '深水区'}</p>
                    <p style="margin-top: 15px; color: #636e72;">${fish.description}</p>
                </div>
                <div class="mt-20">
                    <button class="btn-secondary" onclick="game.ui.showGuide()">返回图鉴</button>
                </div>
            </div>
        `;
        
        this.showModal(content);
    }

    // 显示钓鱼成功弹窗 - 优化版
    showFishCaughtModal(fish, weight, value, comboBonus = '') {
        const content = `
            <div class="text-center">
                <h2>🎉 钓到了！${comboBonus}</h2>
                <div class="fish-card">
                    <div style="font-size: 5rem; margin-bottom: 15px; animation: bounce 0.5s ease infinite alternate;">${fish.icon}</div>
                    <h3>${fish.name}</h3>
                    <span class="rarity rarity-${fish.rarity}">${getRarityName(fish.rarity)}</span>
                    <div class="weight" style="font-size: 1.3rem; margin: 10px 0;">${formatWeight(weight)}</div>
                    <div class="value" style="font-size: 1.5rem;">💰 ${value} 金币</div>
                    <p style="margin-top: 15px; color: #636e72; line-height: 1.6;">${fish.description}</p>
                </div>
                <div class="mt-20" style="display: flex; gap: 10px; justify-content: center;">
                    <button class="btn-secondary" onclick="game.releaseFish()">🌊 放生 (2倍经验)</button>
                    <button class="btn-primary" onclick="game.keepFish()">✅ 放入背包</button>
                </div>
            </div>
        `;
        this.showModal(content);
    }

    // 显示统计
    showStats() {
        const state = this.game.state;
        const stats = state.getStats();
        const achievements = state.getAchievementList();
        
        let content = '<h2>📊 游戏统计</h2>';
        
        // 基本统计
        content += `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 5px;">🎣</div>
                    <div style="font-size: 1.5rem; font-weight: bold;">${stats.totalFishCaught}</div>
                    <div style="font-size: 0.9rem; color: #636e72;">总钓获</div>
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 5px;">📖</div>
                    <div style="font-size: 1.5rem; font-weight: bold;">${stats.discoveredCount}/${stats.totalFishTypes}</div>
                    <div style="font-size: 0.9rem; color: #636e72;">图鉴完成</div>
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 5px;">💰</div>
                    <div style="font-size: 1.5rem; font-weight: bold;">${formatCoins(stats.totalGoldEarned)}</div>
                    <div style="font-size: 0.9rem; color: #636e72;">累计金币</div>
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 5px;">🏆</div>
                    <div style="font-size: 1.5rem; font-weight: bold;">${stats.achievementCount}/${stats.totalAchievements}</div>
                    <div style="font-size: 0.9rem; color: #636e72;">成就解锁</div>
                </div>
            </div>
        `;
        
        // 最大鱼记录
        if (stats.biggestFish) {
            const fish = getFishById(stats.biggestFish.fishId);
            if (fish) {
                content += `
                    <div style="background: linear-gradient(135deg, #f39c12, #e67e22); color: white; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                        <div style="text-align: center;">
                            <div style="font-size: 1.2rem; margin-bottom: 8px;">🏅 最大钓获</div>
                            <div style="font-size: 2.5rem;">${fish.icon}</div>
                            <div style="font-size: 1.3rem; font-weight: bold;">${fish.name}</div>
                            <div style="font-size: 1.1rem;">${formatWeight(stats.biggestFish.weight)}</div>
                        </div>
                    </div>
                `;
            }
        }
        
        // 成就列表
        content += '<h3 style="margin-bottom: 15px;">🏆 成就</h3>';
        content += '<div style="max-height: 200px; overflow-y: auto;">';
        
        achievements.forEach(ach => {
            const unlocked = state.achievements.includes(ach.id);
            content += `
                <div style="display: flex; align-items: center; padding: 12px; background: ${unlocked ? '#e8f5e9' : '#f5f5f5'}; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid ${unlocked ? '#4caf50' : '#ccc'};">
                    <div style="font-size: 1.5rem; margin-right: 12px;">${unlocked ? '✅' : '🔒'}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: ${unlocked ? '#2d3436' : '#999'};">${ach.name}</div>
                        <div style="font-size: 0.85rem; color: #636e72;">${ach.desc}</div>
                    </div>
                    <div style="color: #f39c12; font-weight: bold;">${unlocked ? '+' + ach.reward : '💰' + ach.reward}</div>
                </div>
            `;
        });
        
        content += '</div>';
        
        this.showModal(content);
    }

    // 显示消息 - 优化版
    showMessage(text, type = 'info') {
        // 移除旧消息
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
}

// 添加弹跳动画
const bounceStyle = document.createElement('style');
bounceStyle.textContent = `
    @keyframes bounce {
        from { transform: translateY(0) scale(1); }
        to { transform: translateY(-10px) scale(1.1); }
    }
`;
document.head.appendChild(bounceStyle);

// 全局消息显示函数
function showMessage(text, type) {
    if (game && game.ui) {
        game.ui.showMessage(text, type);
    }
}

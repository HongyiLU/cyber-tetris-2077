// 主游戏类 - 优化版

class Game {
    constructor() {
        this.state = new GameState();
        this.ui = null;
        this.phase = 'idle'; // idle, casting, waiting, biting, reeling
        this.currentFish = null;
        this.currentWeight = 0;
        this.currentValue = 0;
        this.tension = 0;
        this.fishDistance = 0;
        this.castProgress = 0;
        this.castDirection = 1;
        this.lastTime = 0;
        this.gameLoopId = null;
        this.isReeling = false;
        this.castPower = 0;
        this.fishStrugglePhase = 0;
        this.comboCount = 0;
        this.lastCatchTime = 0;
    }

    // 初始化游戏
    init() {
        this.ui = new UI(this);
        this.setupEventListeners();
        this.ui.updateStatus();
        this.startDecorationLoop();
        this.startAmbientAnimation();
        console.log('🎣 宁静钓鱼已启动！(优化版)');
    }

    // 设置事件监听
    setupEventListeners() {
        // 抛竿按钮 - 按住蓄力，释放抛竿
        this.ui.elements.btnCast.addEventListener('mousedown', () => this.startCasting());
        this.ui.elements.btnCast.addEventListener('mouseup', () => this.cast());
        this.ui.elements.btnCast.addEventListener('mouseleave', () => this.cast());
        
        // 触摸支持
        this.ui.elements.btnCast.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startCasting();
        });
        this.ui.elements.btnCast.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.cast();
        });
        
        // 收线按钮
        this.ui.elements.btnReel.addEventListener('mousedown', () => this.startReeling());
        this.ui.elements.btnReel.addEventListener('mouseup', () => this.stopReeling());
        this.ui.elements.btnReel.addEventListener('mouseleave', () => this.stopReeling());
        
        // 触摸支持
        this.ui.elements.btnReel.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startReeling();
        });
        this.ui.elements.btnReel.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopReeling();
        });
        
        // 其他按钮
        this.ui.elements.btnInventory.addEventListener('click', () => this.ui.showInventory());
        this.ui.elements.btnShop.addEventListener('click', () => this.ui.showShop());
        this.ui.elements.btnGuide.addEventListener('click', () => this.ui.showGuide());
        
        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // 防止页面滚动
        document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }

    // 键盘按下
    handleKeyDown(e) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                if (this.phase === 'idle' && !e.repeat) {
                    this.startCasting();
                }
                break;
            case 'KeyE':
                if (this.phase === 'idle') {
                    this.ui.showInventory();
                }
                break;
            case 'KeyR':
                if (this.phase === 'biting' || this.phase === 'reeling') {
                    this.startReeling();
                }
                break;
            case 'Escape':
                this.ui.closeModal();
                break;
        }
    }

    // 键盘松开
    handleKeyUp(e) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                if (this.phase === 'casting') {
                    this.cast();
                }
                break;
            case 'KeyR':
                this.stopReeling();
                break;
        }
    }

    // 开始抛竿蓄力
    startCasting() {
        if (this.phase !== 'idle') return;
        
        this.phase = 'casting';
        this.castProgress = 0;
        this.castDirection = 1;
        this.ui.showCastMeter();
        this.ui.updateCastButton(false);
        this.ui.elements.btnCast.textContent = '🎣 释放抛竿';
        
        // 开始蓄力动画 - 更快的节奏
        this.startCastingLoop();
    }

    // 抛竿蓄力循环 - 优化版
    startCastingLoop() {
        const animate = () => {
            if (this.phase !== 'casting') return;
            
            // 更快的蓄力速度
            this.castProgress += this.castDirection * 0.035;
            if (this.castProgress >= 1) {
                this.castProgress = 1;
                this.castDirection = -1;
            } else if (this.castProgress <= 0) {
                this.castProgress = 0;
                this.castDirection = 1;
            }
            
            this.ui.updateCastMeter(this.castProgress);
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    // 完成抛竿 - 优化版
    cast() {
        if (this.phase !== 'casting') return;
        
        this.phase = 'waiting';
        this.ui.hideCastMeter();
        this.ui.playCastAnimation();
        this.ui.elements.btnCast.textContent = '🎣 抛竿';
        
        // 优化力度计算 - 中间最好
        const optimalPower = 1 - Math.abs(this.castProgress - 0.6) * 1.5; // 60%力度最优
        this.castPower = clamp(optimalPower, 0.3, 1);
        
        // 设置浮漂位置 - 更自然的落点
        const scene = document.getElementById('water-scene');
        const rect = scene.getBoundingClientRect();
        const centerBias = 0.5 + Math.sin(Date.now() / 1000) * 0.1;
        const targetX = rect.width * (0.25 + random(0, 0.5));
        const targetY = rect.height * 0.4 * (0.4 + this.castProgress * 0.5);
        
        this.ui.setFloatPosition(targetX, targetY);
        
        // 更新鱼线
        setTimeout(() => {
            this.ui.updateFishingLine();
        }, 100);
        
        // 更短的等待时间 - 根据抛竿质量调整
        const baseWait = random(1500, 4000);
        const qualityBonus = this.castPower * 0.5; // 抛得好，鱼来得快
        const levelBonus = this.state.level * 0.03;
        const waitTime = baseWait / (1 + qualityBonus + levelBonus);
        
        // 显示消息
        if (this.castPower > 0.8) {
            this.ui.showMessage('🎯 完美抛竿！', 'success');
        } else if (this.castPower > 0.5) {
            this.ui.showMessage('不错的抛竿！等待鱼儿上钩...', 'info');
        } else {
            this.ui.showMessage('等待鱼儿上钩...', 'info');
        }
        this.ui.updateReelButton(false);
        
        // 开始等待咬钩
        setTimeout(() => {
            if (this.phase === 'waiting') {
                this.startBiting();
            }
        }, waitTime);
        
        // 开始鱼线更新循环
        this.startLineUpdateLoop();
    }

    // 开始咬钩 - 优化版
    startBiting() {
        this.phase = 'biting';
        this.ui.startBitingAnimation();
        this.ui.showMessage('🎣 有鱼咬钩了！快收线！', 'success');
        this.ui.updateReelButton(true);
        
        // 生成咬钩的鱼
        const equipment = this.state.getCurrentEquipment();
        const levelBonus = this.state.level - 1;
        
        // 根据装备调整 - 优化稀有度选择
        let selectedFish = getRandomFish(levelBonus);
        
        // 抛竿质量影响鱼的质量
        if (this.castPower > 0.7 && Math.random() < 0.3) {
            const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
            const currentIndex = rarities.indexOf(selectedFish.rarity);
            if (currentIndex < rarities.length - 1) {
                const upgradeFish = getFishByRarity(rarities[currentIndex + 1]);
                if (upgradeFish.length > 0) {
                    selectedFish = { ...randomChoice(upgradeFish) };
                }
            }
        }
        
        // 鱼饵效果 - 增强版
        if (equipment.bait && equipment.bait.attractBonus) {
            const bonus = equipment.bait.attractBonus[selectedFish.rarity] || 0;
            if (random(0, 100) < Math.abs(bonus)) {
                if (bonus > 0) {
                    // 升级稀有度
                    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
                    const currentIndex = rarities.indexOf(selectedFish.rarity);
                    if (currentIndex < rarities.length - 1) {
                        const upgradeFish = getFishByRarity(rarities[currentIndex + 1]);
                        if (upgradeFish.length > 0) {
                            selectedFish = { ...randomChoice(upgradeFish) };
                        }
                    }
                }
            }
        }
        
        this.currentFish = selectedFish;
        this.currentWeight = generateFishWeight(selectedFish, levelBonus + this.castPower * 2);
        this.currentValue = calculateFishValue(selectedFish, this.currentWeight);
        
        // 更长的咬钩窗口 - 更友好
        const biteWindowTime = 2500 - selectedFish.difficulty * 150;
        
        // 如果不在时间内收线，鱼就跑了
        setTimeout(() => {
            if (this.phase === 'biting') {
                this.fishEscaped();
            }
        }, Math.max(biteWindowTime, 1000));
    }

    // 开始收线
    startReeling() {
        if (this.phase !== 'biting' && this.phase !== 'reeling') return;
        
        if (this.phase === 'biting') {
            this.phase = 'reeling';
            this.ui.stopBitingAnimation();
            this.ui.showTensionMeter();
            this.tension = 0.25;
            this.fishDistance = 1;
            this.fishStrugglePhase = 0;
            this.startGameLoop();
        }
        
        this.isReeling = true;
        this.ui.elements.btnReel.textContent = '⏹️ 收线中...';
    }

    // 停止收线
    stopReeling() {
        this.isReeling = false;
        if (this.phase === 'reeling') {
            this.ui.elements.btnReel.textContent = '⏹️ 按住收线';
        }
    }

    // 游戏主循环（收线阶段）- 大幅优化
    startGameLoop() {
        this.lastTime = performance.now();
        
        const gameLoop = (currentTime) => {
            if (this.phase !== 'reeling') return;
            
            const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.05); // 限制最大delta
            this.lastTime = currentTime;
            
            this.updateReeling(deltaTime);
            
            this.gameLoopId = requestAnimationFrame(gameLoop);
        };
        
        this.gameLoopId = requestAnimationFrame(gameLoop);
    }

    // 更新收线逻辑 - 完全重写，更平衡
    updateReeling(deltaTime) {
        const equipment = this.state.getCurrentEquipment();
        const fish = this.currentFish;
        
        // 装备效果
        const rodBonus = equipment.rod ? equipment.rod.controlBonus / 100 : 0;
        const lineMultiplier = equipment.line ? equipment.line.tensionMultiplier : 1;
        
        // 收线增加张力，拉近鱼 - 更平滑
        if (this.isReeling) {
            const baseReelSpeed = 0.4 + rodBonus * 0.3;
            this.tension += baseReelSpeed * deltaTime * lineMultiplier;
            this.fishDistance -= 0.2 * deltaTime * (1 + rodBonus * 0.5);
        }
        
        // 鱼挣扎 - 更有节奏感的模式
        this.fishStrugglePhase += deltaTime * (1 + fish.difficulty * 0.3);
        const struggleCycle = Math.sin(this.fishStrugglePhase * 3) * 0.5 + 
                              Math.sin(this.fishStrugglePhase * 1.7 + 1) * 0.3 +
                              Math.sin(this.fishStrugglePhase * 0.8 + 2) * 0.2;
        
        const struggleIntensity = 0.08 + fish.difficulty * 0.06;
        const struggle = struggleCycle * struggleIntensity;
        this.tension += struggle * deltaTime;
        
        // 张力自然衰减 - 更快
        this.tension -= 0.35 * deltaTime;
        
        // 不收线时衰减更快
        if (!this.isReeling) {
            this.tension -= 0.15 * deltaTime;
        }
        
        // 限制张力范围
        this.tension = clamp(this.tension, 0, 1);
        
        // 更新UI
        this.ui.updateTensionMeter(this.tension);
        
        // 更新浮漂位置（模拟鱼挣扎）- 更动态
        const scene = document.getElementById('water-scene');
        const rect = scene.getBoundingClientRect();
        const baseX = rect.width * 0.5;
        const baseY = rect.height * 0.2;
        
        const wobbleX = struggleCycle * 30 * fish.difficulty;
        const wobbleY = Math.cos(this.fishStrugglePhase * 2.5) * 15 * fish.difficulty;
        
        this.ui.setFloatPosition(
            baseX + wobbleX * this.fishDistance,
            baseY + wobbleY + (1 - this.fishDistance) * 60
        );
        
        this.ui.updateFishingLine();
        
        // 检查鱼线是否断了 - 更宽容
        const maxTension = 0.88 - rodBonus * 0.15;
        if (this.tension >= maxTension) {
            this.lineBroken();
            return;
        }
        
        // 检查鱼是否逃脱（张力太小持续一段时间）
        if (this.tension <= 0.08 && this.fishDistance > 0.4) {
            // 给一个缓冲
            if (!this.escapeTimer) {
                this.escapeTimer = Date.now();
            } else if (Date.now() - this.escapeTimer > 1500) {
                this.fishEscaped();
                return;
            }
        } else {
            this.escapeTimer = null;
        }
        
        // 检查是否成功钓上来
        if (this.fishDistance <= 0) {
            this.fishCaught();
        }
    }

    // 鱼线断了
    lineBroken() {
        this.phase = 'idle';
        this.cleanup();
        this.comboCount = 0;
        this.ui.showMessage('💔 鱼线断了！鱼跑了...', 'error');
        this.resetState();
    }

    // 鱼跑了
    fishEscaped() {
        this.phase = 'idle';
        this.cleanup();
        this.comboCount = 0;
        this.ui.stopBitingAnimation();
        this.ui.showMessage('😢 鱼跑掉了...', 'error');
        this.resetState();
    }

    // 钓到鱼了 - 优化版
    fishCaught() {
        this.phase = 'idle';
        this.cleanup();
        
        const fish = this.currentFish;
        const weight = this.currentWeight;
        const value = this.currentValue;
        
        // 检查连击
        const now = Date.now();
        if (now - this.lastCatchTime < 30000) { // 30秒内
            this.comboCount++;
        } else {
            this.comboCount = 1;
        }
        this.lastCatchTime = now;
        
        // 连击奖励
        let comboBonus = '';
        let expMultiplier = 1;
        let coinMultiplier = 1;
        
        if (this.comboCount >= 3) {
            comboBonus = ` 🔥 ${this.comboCount}连击！`;
            expMultiplier = 1 + (this.comboCount - 1) * 0.2;
            coinMultiplier = 1 + (this.comboCount - 1) * 0.1;
        }
        
        // 记录
        this.state.recordFishCaught(fish, weight);
        this.state.addExp(Math.floor(calculateExp(fish, weight) * expMultiplier));
        
        // 更新价值
        const finalValue = Math.floor(value * coinMultiplier);
        this.currentValue = finalValue;
        
        // 显示成功弹窗
        this.ui.showFishCaughtModal(fish, weight, finalValue, comboBonus);
        this.ui.updateStatus();
    }

    // 放生
    releaseFish() {
        this.ui.closeModal();
        const expGain = calculateExp(this.currentFish, this.currentWeight) * 2;
        this.state.addExp(expGain);
        this.ui.showMessage(`🌊 已将鱼放生！获得 ${expGain} 经验！`, 'success');
        this.ui.updateStatus();
        this.resetState();
    }

    // 保留鱼
    keepFish() {
        this.state.addToInventory(this.currentFish, this.currentWeight, this.currentValue);
        this.ui.closeModal();
        this.ui.showMessage('✅ 已放入背包！', 'success');
        this.resetState();
    }

    // 出售一条鱼
    sellFish(index) {
        const item = this.state.inventory[index];
        if (!item) return;
        
        this.state.addCoins(item.value);
        this.state.removeFromInventory(index);
        this.ui.updateStatus();
        this.ui.showMessage(`💰 出售成功！获得 ${item.value} 金币`, 'success');
        this.ui.showInventory();
    }

    // 出售所有鱼
    sellAllFish() {
        const total = this.state.inventory.reduce((sum, item) => sum + item.value, 0);
        const count = this.state.inventory.length;
        this.state.addCoins(total);
        this.state.clearInventory();
        this.ui.updateStatus();
        this.ui.closeModal();
        this.ui.showMessage(`💰 出售 ${count} 条鱼！获得 ${total} 金币`, 'success');
    }

    // 购买装备
    buyEquipment(type, itemId) {
        if (this.state.buyEquipment(type, itemId)) {
            this.ui.updateStatus();
            this.ui.showMessage('✅ 购买成功！', 'success');
            this.ui.showShop();
        } else {
            this.ui.showMessage('❌ 金币不足！', 'error');
        }
    }

    // 装备物品
    equipItem(type, itemId) {
        if (this.state.equipItem(type, itemId)) {
            this.ui.showMessage('✅ 装备成功！', 'success');
            this.ui.showShop();
        }
    }

    // 清理
    cleanup() {
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
        this.ui.hideTensionMeter();
        this.ui.hideCastMeter();
        this.escapeTimer = null;
    }

    // 重置状态
    resetState() {
        this.currentFish = null;
        this.currentWeight = 0;
        this.currentValue = 0;
        this.tension = 0;
        this.fishDistance = 0;
        this.isReeling = false;
        this.ui.resetFloatPosition();
        this.ui.updateFishingLine();
        this.ui.updateCastButton(true);
        this.ui.updateReelButton(false);
        this.ui.elements.btnCast.textContent = '🎣 抛竿';
        this.ui.elements.btnReel.textContent = '⏹️ 收线';
    }

    // 鱼线更新循环
    startLineUpdateLoop() {
        const update = () => {
            if (this.phase === 'waiting' || this.phase === 'biting') {
                this.ui.updateFishingLine();
                requestAnimationFrame(update);
            }
        };
        requestAnimationFrame(update);
    }

    // 装饰性鱼群循环
    startDecorationLoop() {
        const addFish = () => {
            if (this.phase === 'idle' || this.phase === 'waiting') {
                if (Math.random() < 0.4) {
                    this.ui.addSwimmingFish();
                }
            }
            setTimeout(addFish, random(1500, 4000));
        };
        addFish();
    }

    // 环境动画
    startAmbientAnimation() {
        // 浮漂轻微晃动
        const animateFloat = () => {
            if (this.phase === 'idle') {
                const float = this.ui.elements.float;
                if (float) {
                    const wobble = Math.sin(Date.now() / 1000) * 3;
                    float.style.transform = `translateX(-50%) translateY(${wobble}px)`;
                }
            }
            requestAnimationFrame(animateFloat);
        };
        animateFloat();
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes swimRight {
        from { transform: translateX(-50px); }
        to { transform: translateX(calc(100vw + 50px)); }
    }
    @keyframes swimLeft {
        from { transform: translateX(calc(100vw + 50px)); }
        to { transform: translateX(-50px); }
    }
`;
document.head.appendChild(style);

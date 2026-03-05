// 花园管理类

class Garden {
    constructor(game) {
        this.game = game;
    }

    init() {
        this.renderGarden();
    }

    renderGarden() {
        const grid = document.getElementById('garden-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        for (let i = 0; i < 48; i++) {
            const plot = this.game.state.garden[i];
            const plotEl = document.createElement('div');
            plotEl.className = 'plot';
            plotEl.dataset.index = i;
            
            if (plot.tilled) {
                plotEl.classList.add('tilled');
            }
            if (plot.watered) {
                plotEl.classList.add('watered');
            }
            if (plot.plant) {
                plotEl.classList.add('has-plant');
                const plantEl = document.createElement('div');
                plantEl.className = `plant plant-stage-${plot.plantStage}`;
                plotEl.appendChild(plantEl);
            }
            
            plotEl.addEventListener('click', () => this.handlePlotClick(i));
            grid.appendChild(plotEl);
        }
    }

    handlePlotClick(index) {
        const plot = this.game.state.garden[index];
        const tool = this.game.state.selectedTool;
        const seed = this.game.state.selectedSeed;
        
        switch (tool) {
            case 'water':
                this.waterPlot(index);
                break;
            case 'plant':
                this.plantSeed(index, seed);
                break;
            case 'harvest':
                this.harvestPlot(index);
                break;
            case 'remove':
                this.removePlant(index);
                break;
        }
    }

    waterPlot(index) {
        const plot = this.game.state.garden[index];
        
        if (!plot.tilled) {
            if (this.game.state.useEnergy(2)) {
                plot.tilled = true;
                this.game.ui.showMessage('✓ 已耕地！', 'success');
                this.game.state.save();
                this.renderGarden();
            } else {
                this.game.ui.showMessage('❌ 体力不足！', 'error');
            }
            return;
        }
        
        if (!plot.plant) {
            this.game.ui.showMessage('💡 这里没有植物', 'info');
            return;
        }
        
        if (plot.watered) {
            this.game.ui.showMessage('💧 已经浇过水了', 'info');
            return;
        }
        
        if (this.game.state.useEnergy(3)) {
            plot.watered = true;
            this.game.ui.showMessage('💧 浇水成功！', 'success');
            this.game.state.save();
            this.renderGarden();
        } else {
            this.game.ui.showMessage('❌ 体力不足！', 'error');
        }
    }

    plantSeed(index, seedId) {
        const plot = this.game.state.garden[index];
        const seedData = getPlantById(seedId);
        
        if (!seedData) return;
        
        if (!plot.tilled) {
            this.game.ui.showMessage('💡 请先耕地！', 'info');
            return;
        }
        
        if (plot.plant) {
            this.game.ui.showMessage('💡 这里已经有植物了！', 'info');
            return;
        }
        
        if (!this.game.state.unlockedPlants.includes(seedId)) {
            this.game.ui.showMessage('🔒 这个植物还未解锁！', 'error');
            return;
        }
        
        if (!this.game.state.spendCoins(seedData.seedPrice)) {
            this.game.ui.showMessage('❌ 金币不足！', 'error');
            return;
        }
        
        if (!this.game.state.useEnergy(5)) {
            this.game.state.addCoins(seedData.seedPrice);
            this.game.ui.showMessage('❌ 体力不足！', 'error');
            return;
        }
        
        plot.plant = seedId;
        plot.plantStage = 1;
        plot.plantDays = 0;
        plot.watered = false;
        
        this.game.state.totalPlanted++;
        this.game.state.addExp(3);
        
        this.game.ui.showMessage(`🌱 种下了 ${seedData.emoji} ${seedData.name}！`, 'success');
        this.game.state.save();
        this.renderGarden();
        this.game.ui.updateUI();
    }

    harvestPlot(index) {
        const plot = this.game.state.garden[index];
        
        if (!plot.plant) {
            this.game.ui.showMessage('💡 这里没有植物', 'info');
            return;
        }
        
        const plantData = getPlantById(plot.plant);
        if (!plantData) return;
        
        if (plot.plantStage < plantData.stages) {
            this.game.ui.showMessage(`⏳ 还没成熟，再等${plantData.growTime - plot.plantDays}天`, 'info');
            return;
        }
        
        if (!this.game.state.useEnergy(8)) {
            this.game.ui.showMessage('❌ 体力不足！', 'error');
            return;
        }
        
        const harvestAmount = randomInt(1, 3);
        const totalValue = plantData.sellPrice * harvestAmount;
        
        this.game.state.addCoins(totalValue);
        this.game.state.addExp(plantData.exp);
        this.game.state.totalHarvested += harvestAmount;
        this.game.state.addToInventory(plot.plant, harvestAmount);
        
        plot.plant = null;
        plot.plantStage = 0;
        plot.plantDays = 0;
        plot.watered = false;
        plot.tilled = false;
        
        this.game.ui.showMessage(
            `🎉 收获了 ${harvestAmount} 个 ${plantData.emoji} ${plantData.name}！获得 ${totalValue} 金币！`, 
            'success'
        );
        
        this.game.state.save();
        this.renderGarden();
        this.game.ui.updateUI();
    }

    removePlant(index) {
        const plot = this.game.state.garden[index];
        
        if (!plot.plant && !plot.tilled) {
            this.game.ui.showMessage('💡 这里什么都没有', 'info');
            return;
        }
        
        if (!this.game.state.useEnergy(2)) {
            this.game.ui.showMessage('❌ 体力不足！', 'error');
            return;
        }
        
        const hadPlant = plot.plant !== null;
        
        plot.plant = null;
        plot.plantStage = 0;
        plot.plantDays = 0;
        plot.watered = false;
        plot.tilled = false;
        
        this.game.ui.showMessage(
            hadPlant ? '🪓 已清除植物' : '🪓 已恢复草地', 
            'info'
        );
        
        this.game.state.save();
        this.renderGarden();
    }
}

// 主游戏类

class Game {
    constructor() {
        this.state = new GameState();
        this.garden = null;
        this.ui = null;
    }

    init() {
        this.ui = new UI(this);
        this.garden = new Garden(this);
        
        this.garden.init();
        this.ui.init();
        
        console.log('🌻 我的花园世界已启动！');
    }

    nextDay() {
        this.state.nextDay();
        this.garden.renderGarden();
        this.ui.updateUI();
        this.ui.renderInventory();
        this.ui.showMessage(`🌙 第 ${this.state.day} 天开始了！体力已恢复！`, 'info');
    }
}

let game;

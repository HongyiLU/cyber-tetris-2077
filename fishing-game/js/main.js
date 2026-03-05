// 游戏入口文件

// 全局游戏实例
let game;

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 初始化游戏
    game = new Game();
    game.init();
    
    // 显示欢迎消息
    setTimeout(() => {
        showWelcomeMessage();
    }, 500);
});

// 显示欢迎消息
function showWelcomeMessage() {
    const isFirstTime = !loadData('welcomed');
    
    if (isFirstTime) {
        showMessage('🎣 欢迎来到宁静钓鱼！点击"抛竿"开始游戏！', 'info');
        saveData('welcomed', true);
    } else {
        showMessage('🎣 欢迎回来！继续你的钓鱼之旅吧！', 'info');
    }
}

// 暴露一些全局函数给按钮使用
window.game = null; // 会在init后设置

// 延迟设置全局game引用
setTimeout(() => {
    window.game = game;
}, 100);

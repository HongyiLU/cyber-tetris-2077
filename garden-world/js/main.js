// 游戏入口文件

document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    game.init();
    
    setTimeout(() => {
        showWelcomeMessage();
    }, 500);
});

function showWelcomeMessage() {
    const isFirstTime = !loadData('welcomed');
    
    if (isFirstTime) {
        if (game && game.ui) {
            game.ui.showMessage('🌻 欢迎来到我的花园世界！点击格子开始玩吧！', 'info');
        }
        saveData('welcomed', true);
    } else {
        if (game && game.ui) {
            game.ui.showMessage('🌻 欢迎回来！继续你的花园经营吧！', 'info');
        }
    }
}

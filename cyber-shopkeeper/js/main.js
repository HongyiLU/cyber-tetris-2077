// 赛博朋克掌柜 - 入口文件

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
            game.ui.showMessage('🌃 欢迎来到赛博朋克掌柜 2077！点击建筑开始！', 'info');
        }
        saveData('welcomed', true);
    } else {
        if (game && game.ui) {
            game.ui.showMessage('🌃 欢迎回来！继续你的赛博朋克生意！', 'info');
        }
    }
}

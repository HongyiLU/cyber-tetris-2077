// ==================== 键盘控制 Hook ====================
import { useEffect, useCallback, useRef } from 'react';
/**
 * 键盘控制 Hook
 * 处理玩家输入
 *
 * 修复说明：
 * 1. 使用 useRef 存储游戏状态，避免键盘事件监听器捕获旧状态
 * 2. 只绑定一次事件监听器，使用 ref 访问最新状态
 */
export const useKeyboardControl = ({ gameStarted, gameState, gameEngine, onGameStateChange, }) => {
    // 使用 ref 存储游戏状态，避免键盘事件监听器捕获旧状态
    const gameStateRef = useRef(null);
    const gameStartedRef = useRef(false);
    // 同步 ref 和 state
    useEffect(() => {
        gameStateRef.current = gameState;
        gameStartedRef.current = gameStarted;
    }, [gameState, gameStarted]);
    const handleKeyDown = useCallback((e) => {
        // 使用 ref 访问最新状态
        const currentState = gameStateRef.current;
        const isStarted = gameStartedRef.current;
        if (!isStarted || !currentState || currentState.gameOver || currentState.paused)
            return;
        let needsUpdate = false;
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                needsUpdate = gameEngine.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                e.preventDefault();
                needsUpdate = gameEngine.movePiece(1, 0);
                break;
            case 'ArrowDown':
                e.preventDefault();
                needsUpdate = gameEngine.movePiece(0, 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                needsUpdate = gameEngine.rotatePiece();
                break;
            case ' ':
                e.preventDefault();
                gameEngine.hardDrop();
                needsUpdate = true;
                break;
            case 'p':
            case 'P':
                e.preventDefault();
                gameEngine.togglePause();
                needsUpdate = true;
                break;
            default:
                return;
        }
        if (needsUpdate) {
            onGameStateChange(gameEngine.getGameState());
        }
    }, [gameEngine, onGameStateChange]);
    // 只绑定一次键盘事件监听器，使用 ref 访问最新状态
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
};

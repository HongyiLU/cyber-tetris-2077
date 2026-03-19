// ==================== 游戏循环 Hook ====================

import { useEffect, useRef, useCallback } from 'react';
import type { GameEngine } from '../engine/GameEngine';
import type { GameState } from '../types';
import { BattleState } from '../types';

interface UseGameLoopOptions {
  gameStarted: boolean;
  gameState: GameState | null;
  gameEngine: GameEngine;
  paused?: boolean;
  onGameStateChange?: () => void;
  /** P0-2 Fix: 跳过 GameEnd 检查（卡牌战斗模式下由 BattleScene 独立处理） */
  skipGameEndCheck?: boolean;
}

/**
 * 游戏循环 Hook
 * 管理方块自动下落
 * 
 * 修复说明：
 * 1. 使用 useRef 存储 interval ID，避免内存泄漏
 * 2. 在清理函数中正确清除 interval
 */
export const useGameLoop = ({
  gameStarted,
  gameState,
  gameEngine,
  paused = false,
  onGameStateChange,
}: UseGameLoopOptions) => {
  // 使用 ref 存储 interval ID，避免内存泄漏
  const intervalRef = useRef<number | null>(null);

  const dropPiece = useCallback(() => {
    if (!gameState || gameState.gameOver || paused) return;

    const moved = gameEngine.movePiece(0, 1);
    if (!moved) {
      gameEngine.lockPiece();
    }
    
    // 更新敌人 AI（战斗状态）
    const state = gameEngine.getGameState();
    if (state.battleState === BattleState.FIGHTING) {
      gameEngine.updateEnemyAI(Date.now());
    }
    
    // 通知状态变化
    if (onGameStateChange) {
      onGameStateChange();
    }
  }, [gameState, gameEngine, paused, onGameStateChange]);

  useEffect(() => {
    if (!gameStarted || !gameState || gameState.gameOver || paused) {
      // 清理之前的 interval
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 清除旧的 interval（如果有）
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }

    const dropInterval = Math.max(100, 1000 - (gameState.level - 1) * 100);
    // 存储 interval ID 到 ref
    intervalRef.current = window.setInterval(dropPiece, dropInterval);

    // 清理函数
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [gameStarted, gameState?.level, gameState?.gameOver, paused, dropPiece]);

  return null;
};

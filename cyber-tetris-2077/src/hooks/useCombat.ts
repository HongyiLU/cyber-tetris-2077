/**
 * @fileoverview 战斗 Hook v2.0.0
 * 提供战斗相关的 React Hook
 */

import { useState, useCallback, useEffect } from 'react';
import { Card } from '../types/card.v2';
import { CombatManager, CombatState, CombatPhase } from '../core/CombatManager';
import { deckBuilder } from '../core/DeckBuilder';
import { GameStage } from '../types/deck-builder';

/**
 * useCombat Hook 返回类型
 */
export interface UseCombatReturn {
  // 状态
  combatState: CombatState;
  hand: Card[];
  pileCounts: { draw: number; discard: number };
  gameStage: GameStage;

  // 动作
  playCard: (cardId: string, linesCleared: number) => {
    success: boolean;
    damage: number;
    shield: number;
    heal: number;
    poison: number;
    message: string;
  };
  endTurn: () => void;

  // 状态检查
  canPlayCard: (cardId: string) => boolean;
  isPlayerTurn: () => boolean;
  isBattleOver: () => boolean;
  hasWon: () => boolean;
}

/**
 * 战斗 Hook
 * @param onVictory 胜利回调
 * @param onDefeat 失败回调
 */
export function useCombat(
  onVictory?: () => void,
  onDefeat?: () => void
): UseCombatReturn {
  const [combatState, setCombatState] = useState<CombatState>(
    CombatManager.generateEnemy(1) as unknown as CombatState
  );
  const [hand, setHand] = useState<Card[]>([]);
  const [pileCounts, setPileCounts] = useState({ draw: 0, discard: 0 });
  const [gameStage, setGameStage] = useState<GameStage>(GameStage.MENU);

  // 同步状态
  const syncState = useCallback(() => {
    const dbState = deckBuilder.getState();
    setGameStage(dbState.gameStage);
    setHand(deckBuilder.getDeck()); // TODO: 应该返回手牌而非卡组
  }, []);

  // 开始战斗
  const startBattle = useCallback(() => {
    deckBuilder.startBattle();
    syncState();
  }, [syncState]);

  // 使用卡牌
  const playCard = useCallback(
    (cardId: string, linesCleared: number) => {
      // 通过 deckBuilder 处理，但这需要重构
      // 暂时返回失败
      return {
        success: false as const,
        damage: 0,
        shield: 0,
        heal: 0,
        poison: 0,
        message: '请通过战斗界面使用卡牌',
      };
    },
    []
  );

  // 结束回合
  const endTurn = useCallback(() => {
    // 通过 deckBuilder 处理
  }, []);

  // 检查是否可以出牌
  const canPlayCard = useCallback(
    (cardId: string) => {
      if (gameStage !== GameStage.BATTLE) return false;
      const card = hand.find((c) => c.id === cardId);
      if (!card) return false;
      return combatState.energy >= card.cost;
    },
    [hand, combatState.energy, gameStage]
  );

  // 是否为玩家回合
  const isPlayerTurn = useCallback(
    () => combatState.phase === CombatPhase.PLAYER_ACTION,
    [combatState.phase]
  );

  // 战斗是否结束
  const isBattleOver = useCallback(
    () =>
      combatState.phase === CombatPhase.VICTORY ||
      combatState.phase === CombatPhase.DEFEAT,
    [combatState.phase]
  );

  // 是否获胜
  const hasWon = useCallback(
    () => combatState.phase === CombatPhase.VICTORY,
    [combatState.phase]
  );

  // 监听 deckBuilder 状态变化
  useEffect(() => {
    deckBuilder.registerStateChangeCallback((state) => {
      setGameStage(state.gameStage);

      // 如果进入奖励阶段，触发胜利回调
      if (state.gameStage === GameStage.REWARD_SELECT) {
        onVictory?.();
      }

      // 如果进入失败阶段
      if (state.gameStage === GameStage.DEFEAT) {
        onDefeat?.();
      }
    });
  }, [onVictory, onDefeat]);

  // 初始同步
  useEffect(() => {
    syncState();
  }, [syncState]);

  return {
    combatState,
    hand,
    pileCounts,
    gameStage,
    playCard,
    endTurn,
    canPlayCard,
    isPlayerTurn,
    isBattleOver,
    hasWon,
  };
}

export default useCombat;

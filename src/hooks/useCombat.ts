// ==================== useCombat - 战斗 UI Hook ====================
// v2.0.0 Day 5 - UI 集成

import { useState, useCallback, useEffect, useRef } from 'react';
import { CombatManager, CombatState } from '../core/CombatManager';
import { EnemyAI } from '../core/EnemyAI';
import { HandManager } from '../core/HandManager';
import { CardDatabase } from '../core/CardDatabase';
import type { Card } from '../types/card.v2';
import type { CardData } from '../types';
import { ENEMY_CONFIGS } from '../config/enemy-config';

/**
 * 卡牌详细信息
 */
export interface CardDetails {
  cost: number;
  damage: number;
  block: number;
  type: 'attack' | 'skill' | 'power';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

/**
 * useCombat Hook 返回类型
 */
export interface UseCombatReturn {
  // 状态
  combatState: CombatState;
  isPlayerTurn: boolean;
  isEnemyTurn: boolean;
  isCombatOver: boolean;
  isVictory: boolean;

  // 数据
  playerHP: number;
  playerMaxHP: number;
  playerBlock: number;
  enemyHP: number;
  enemyMaxHP: number;
  enemyName: string;
  hand: CardData[];
  energy: number;
  maxEnergy: number;
  turnCount: number;
  enemyEmoji: string;

  // 卡牌详情 Map（用于 UI 显示）
  cardDetails: Map<string, CardDetails>;

  // 操作
  startCombat: (enemyId: string) => void;
  playCard: (handIndex: number) => boolean;
  endTurn: () => void;
  resetCombat: () => void;
}

/**
 * 战斗 UI Hook
 * 管理战斗状态、回合流程、卡牌出牌
 */
export function useCombat(): UseCombatReturn {
  // 状态
  const [combatState, setCombatState] = useState<CombatState>(CombatState.IDLE);
  const [playerHP, setPlayerHP] = useState(50);
  const [playerMaxHP] = useState(50);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [enemyHP, setEnemyHP] = useState(0);
  const [enemyMaxHP, setEnemyMaxHP] = useState(0);
  const [enemyBlock, setEnemyBlock] = useState(0);
  const [enemyName, setEnemyName] = useState('敌人');
  const [enemyEmoji, setEnemyEmoji] = useState('👹');
  const [hand, setHand] = useState<CardData[]>([]);
  const [energy, setEnergy] = useState(0);
  const [maxEnergy, setMaxEnergy] = useState(3);
  const [turnCount, setTurnCount] = useState(1);

  // 卡牌详情 Map
  const [cardDetails, setCardDetails] = useState<Map<string, CardDetails>>(new Map());

  // Refs 用于避免闭包问题
  const combatManagerRef = useRef<CombatManager | null>(null);
  const enemyAIRef = useRef<EnemyAI | null>(null);
  const handManagerRef = useRef<HandManager | null>(null);
  const cardDatabaseRef = useRef<CardDatabase | null>(null);
  const turnCountRef = useRef(1);

  // 初始化单例
  useEffect(() => {
    combatManagerRef.current = CombatManager.getInstance();
    enemyAIRef.current = EnemyAI.getInstance();
    handManagerRef.current = HandManager.getInstance();
    cardDatabaseRef.current = CardDatabase.getInstance();

    // 构建卡牌详情 Map
    if (cardDatabaseRef.current) {
      const allCards = cardDatabaseRef.current.getAllCards();
      const detailsMap = new Map<string, CardDetails>();
      for (const card of allCards) {
        detailsMap.set(card.id, {
          cost: card.cost,
          damage: card.damage,
          block: card.block,
          type: card.type as 'attack' | 'skill' | 'power',
          rarity: card.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
        });
      }
      setCardDetails(detailsMap);
    }
  }, []);

  /**
   * 同步状态到 React 状态
   */
  const syncState = useCallback(() => {
    const cm = combatManagerRef.current;
    const hm = handManagerRef.current;

    if (!cm || !hm) return;

    const state = cm.getState();
    const pHP = cm.getPlayerHP();
    const eHP = cm.getEnemyHP();

    setCombatState(state);
    setPlayerHP(pHP.current);
    setPlayerBlock(cm.getPlayerBlock());
    setEnemyHP(eHP.current);
    setEnemyMaxHP(eHP.max);
    setEnemyBlock(cm.getEnemyBlock());
    setHand(hm.getHand());
    setEnergy(hm.getEnergy());
    setMaxEnergy(hm.getMaxEnergy());
    setTurnCount(turnCountRef.current);
  }, []);

  /**
   * 开始战斗
   */
  const startCombat = useCallback((enemyId: string) => {
    const cm = combatManagerRef.current;
    const ai = enemyAIRef.current;
    const hm = handManagerRef.current;

    if (!cm || !ai || !hm) return;

    const enemyConfig = ENEMY_CONFIGS[enemyId];
    if (!enemyConfig) {
      console.warn(`未找到敌人配置: ${enemyId}`);
      return;
    }

    // 设置敌人
    ai.setEnemy(enemyConfig);
    setEnemyName(enemyConfig.name);
    setEnemyEmoji(enemyConfig.emoji || '👹');

    // 开始战斗
    cm.startCombat(enemyConfig.maxHP, enemyConfig.attack);

    // 初始化抽牌堆
    hm.initializeWithDefaultDeck();

    // 重置回合计数
    turnCountRef.current = 1;

    // 同步状态
    syncState();
  }, [syncState]);

  /**
   * 出牌
   */
  const playCard = useCallback((handIndex: number): boolean => {
    const cm = combatManagerRef.current;

    if (!cm) return false;

    const success = cm.playCard(handIndex);

    if (success) {
      syncState();

      // 检查战斗是否结束
      const state = cm.getState();
      if (state === CombatState.VICTORY || state === CombatState.DEFEAT) {
        // 战斗结束，不做额外处理
      }
    }

    return success;
  }, [syncState]);

  /**
   * 结束回合
   */
  const endTurn = useCallback(() => {
    const cm = combatManagerRef.current;
    const ai = enemyAIRef.current;

    if (!cm || !ai) return;

    // 玩家结束回合
    cm.endPlayerTurn();

    // 敌人回合开始
    setCombatState(CombatState.ENEMY_TURN);
    syncState();

    // 敌人行动（延迟以显示动画）
    setTimeout(() => {
      if (cm && ai) {
        // 敌人执行回合
        ai.executeTurn();

        // 敌人回合结束，玩家回合开始
        cm.startPlayerTurn();

        // 敌人防御清除
        ai.startPlayerTurn();

        syncState();
      }
    }, 800);
  }, [syncState]);

  /**
   * 重置战斗
   */
  const resetCombat = useCallback(() => {
    // 重置状态（不重置单例，避免 ref 失效）
    setCombatState(CombatState.IDLE);
    setPlayerHP(50);
    setPlayerBlock(0);
    setEnemyHP(0);
    setEnemyMaxHP(0);
    setEnemyName('敌人');
    setEnemyEmoji('👹');
    setHand([]);
    setEnergy(0);
    setMaxEnergy(3);
    turnCountRef.current = 1;
  }, []);

  return {
    // 状态
    combatState,
    isPlayerTurn: combatState === CombatState.PLAYER_TURN,
    isEnemyTurn: combatState === CombatState.ENEMY_TURN,
    isCombatOver: combatState === CombatState.VICTORY || combatState === CombatState.DEFEAT,
    isVictory: combatState === CombatState.VICTORY,

    // 数据
    playerHP,
    playerMaxHP,
    playerBlock,
    enemyHP,
    enemyMaxHP,
    enemyBlock,
    enemyName,
    hand,
    energy,
    maxEnergy,
    turnCount,
    enemyEmoji,

    // 卡牌详情
    cardDetails,

    // 操作
    startCombat,
    playCard,
    endTurn,
    resetCombat,
  };
}

export default useCombat;

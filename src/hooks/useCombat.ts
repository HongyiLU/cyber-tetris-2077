// ==================== useCombat - 战斗 UI Hook ====================
// v2.0.0 Day 5 - UI 集成
// v2.0.0 Day 6 - 音效和特效集成

import { useState, useCallback, useEffect, useRef } from 'react';
import { CombatManager, CombatState } from '../core/CombatManager';
import { CombatSoundManager } from '../core/CombatSoundManager';
import { CombatEffectManager } from '../core/CombatEffectManager';
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
 * 战斗特效位置配置
 */
export interface EffectPosition {
  x: number;
  y: number;
}

/**
 * 战斗特效回调接口 (v2.0.0 Day 6)
 */
export interface CombatEffectCallbacks {
  onCardPlayed?: (handIndex: number, cardData: CardData) => void;
  onPlayerDamaged?: (damage: number, blocked: boolean) => void;
  onEnemyDamaged?: (damage: number) => void;
  onPlayerHealed?: (amount: number) => void;
  onPlayerBuffed?: () => void;
  onPlayerDebuffed?: () => void;
  onEnemyAttacking?: () => void;
  onVictory?: () => void;
  onDefeat?: () => void;
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

  // 特效管理器（用于 UI 渲染粒子和伤害数字）
  effectManager: CombatEffectManager;

  // 操作
  startCombat: (enemyId: string) => void;
  playCard: (handIndex: number) => boolean;
  endTurn: () => void;
  resetCombat: () => void;

  // v2.0.0 Day 8: 事件驱动的能量和抽牌
  gainEnergy: (amount: number) => void;
  drawCards: (count: number) => void;

  // 音效触发 (v2.0.0 Day 6)
  playSound: {
    cardPlay: () => void;
    cardDraw: () => void;
    damagePlayer: () => void;
    damageEnemy: () => void;
    heal: () => void;
    buff: () => void;
    debuff: () => void;
    enemyAttack: () => void;
    block: () => void;
    energy: () => void;
    victory: () => void;
    defeat: () => void;
  };

  // 特效触发 (v2.0.0 Day 6)
  playEffect: {
    // P1-3: blockedDamage = actual amount blocked (0 if no block)
    playerDamage: (damage: number, pos?: EffectPosition, blockedDamage?: number) => void;
    enemyDamage: (damage: number, pos?: EffectPosition) => void;
    heal: (amount: number, pos?: EffectPosition) => void;
    buff: (pos?: EffectPosition) => void;
    debuff: (pos?: EffectPosition) => void;
    victory: (pos?: EffectPosition) => void;
    defeat: (pos?: EffectPosition) => void;
  };
}

/**
 * useCombat Hook 配置
 */
export interface UseCombatConfig {
  enableSound?: boolean;        // 是否启用音效
  enableEffects?: boolean;     // 是否启用粒子特效
  defaultEffectX?: number;     // 默认特效 X 坐标
  defaultEffectY?: number;     // 默认特效 Y 坐标
  effectCallbacks?: CombatEffectCallbacks; // 特效回调
}

/**
 * 战斗 UI Hook
 * 管理战斗状态、回合流程、卡牌出牌
 */
export function useCombat(config?: UseCombatConfig): UseCombatReturn {
  const enableSound = config?.enableSound ?? true;
  const enableEffects = config?.enableEffects ?? true;
  const defaultX = config?.defaultEffectX ?? 200;
  const defaultY = config?.defaultEffectY ?? 200;
  const callbacks = config?.effectCallbacks;

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

  // 音效和特效管理器 (v2.0.0 Day 6)
  const soundManagerRef = useRef<CombatSoundManager | null>(null);
  const effectManagerRef = useRef<CombatEffectManager | null>(null);

  // P1-2: 重置战斗时的 timeout 引用，用于 cleanup
  const enemyTurnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 初始化单例
  useEffect(() => {
    combatManagerRef.current = CombatManager.getInstance();
    enemyAIRef.current = EnemyAI.getInstance();
    handManagerRef.current = HandManager.getInstance();
    cardDatabaseRef.current = CardDatabase.getInstance();

    // 初始化音效管理器 (v2.0.0 Day 6)
    soundManagerRef.current = CombatSoundManager.getInstance();

    // 初始化特效管理器 (v2.0.0 Day 6)
    effectManagerRef.current = CombatEffectManager.getInstance();

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

    // P1-1: 启动特效 update loop（使用 RAF + deltaTime）
    let lastTime = performance.now();
    let rafId: number;

    const tick = () => {
      const now = performance.now();
      const deltaTime = now - lastTime;
      lastTime = now;
      effectManagerRef.current?.update(deltaTime);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
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
    const hm = handManagerRef.current;
    const sm = soundManagerRef.current;

    if (!cm) return false;

    const success = cm.playCard(handIndex);

    if (success) {
      syncState();

      // v2.0.0 Day 6: 触发出牌音效
      if (enableSound && sm) {
        sm.playCardPlay();
      }

      // 获取卡牌数据触发回调
      if (hm) {
        const handData = hm.getHand();
        const cardData = handData[handIndex];
        if (cardData && callbacks?.onCardPlayed) {
          callbacks.onCardPlayed(handIndex, cardData);
        }
      }

      // 检查战斗是否结束
      const state = cm.getState();
      if (state === CombatState.VICTORY || state === CombatState.DEFEAT) {
        // 战斗结束
      }
    }

    return success;
  }, [syncState, enableSound, callbacks]);

  /**
   * 结束回合
   */
  const endTurn = useCallback(() => {
    const cm = combatManagerRef.current;
    const ai = enemyAIRef.current;
    const sm = soundManagerRef.current;

    if (!cm || !ai) return;

    // 玩家结束回合
    cm.endPlayerTurn();

    // 敌人回合开始
    setCombatState(CombatState.ENEMY_TURN);
    syncState();

    // v2.0.0 Day 6: 敌人攻击音效
    if (enableSound && sm) {
      sm.playEnemyAttack();
    }
    callbacks?.onEnemyAttacking?.();

    // 敌人行动（延迟以显示动画）
    // P2-2: 使用 ref 存储 timeout ID，以便 cleanup
    if (enemyTurnTimeoutRef.current) {
      clearTimeout(enemyTurnTimeoutRef.current);
    }
    enemyTurnTimeoutRef.current = setTimeout(() => {
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
  }, [syncState, enableSound, callbacks]);

  /**
   * 重置战斗
   */
  const resetCombat = useCallback(() => {
    // P1-2: 清理特效管理器（粒子和伤害数字）
    effectManagerRef.current?.clear();

    // P2-2: 清理未执行的 enemy turn timeout
    if (enemyTurnTimeoutRef.current) {
      clearTimeout(enemyTurnTimeoutRef.current);
      enemyTurnTimeoutRef.current = null;
    }

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

  // ==================== 音效触发函数 (v2.0.0 Day 6) ====================

  const playSound = {
    cardPlay: () => {
      if (enableSound && soundManagerRef.current) {
        soundManagerRef.current.playCardPlay();
      }
    },
    cardDraw: () => {
      if (enableSound && soundManagerRef.current) {
        soundManagerRef.current.playCardDraw();
      }
    },
    damagePlayer: () => {
      if (enableSound && soundManagerRef.current) {
        soundManagerRef.current.playDamagePlayer();
      }
    },
    damageEnemy: () => {
      if (enableSound && soundManagerRef.current) {
        soundManagerRef.current.playDamageEnemy();
      }
    },
    heal: () => {
      if (enableSound && soundManagerRef.current) {
        soundManagerRef.current.playHeal();
      }
    },
    buff: () => {
      if (enableSound && soundManagerRef.current) {
        soundManagerRef.current.playBuff();
      }
    },
    debuff: () => {
      if (enableSound && soundManagerRef.current) {
        soundManagerRef.current.playDebuff();
      }
    },
    enemyAttack: () => {
      if (enableSound && soundManagerRef.current) {
        soundManagerRef.current.playEnemyAttack();
      }
    },
    block: () => {
      if (enableSound && soundManagerRef.current) {
        soundManagerRef.current.playBlock();
      }
    },
    energy: () => {
      if (enableSound && soundManagerRef.current) {
        soundManagerRef.current.playEnergy();
      }
    },
    victory: () => {
      if (enableSound && soundManagerRef.current) {
        soundManagerRef.current.playVictoryBattle();
      }
    },
    defeat: () => {
      if (enableSound && soundManagerRef.current) {
        soundManagerRef.current.playDefeatBattle();
      }
    },
  };

  // ==================== 特效触发函数 (v2.0.0 Day 6) ====================

  const playEffect = {
    // P1-3: blockedDamage = actual amount blocked (0 if no block)
    playerDamage: (damage: number, pos?: EffectPosition, blockedDamage: number = 0) => {
      if (!enableEffects || !effectManagerRef.current) return;
      const x = pos?.x ?? defaultX;
      const y = pos?.y ?? defaultY;
      effectManagerRef.current.playPlayerDamageEffect(damage, x, y, blockedDamage);
      if (callbacks?.onPlayerDamaged) {
        callbacks.onPlayerDamaged(damage, blockedDamage > 0);
      }
    },
    enemyDamage: (damage: number, pos?: EffectPosition) => {
      if (!enableEffects || !effectManagerRef.current) return;
      const x = pos?.x ?? defaultX;
      const y = pos?.y ?? defaultY;
      effectManagerRef.current.playEnemyDamageEffect(damage, x, y);
      if (callbacks?.onEnemyDamaged) {
        callbacks.onEnemyDamaged(damage);
      }
    },
    heal: (amount: number, pos?: EffectPosition) => {
      if (!enableEffects || !effectManagerRef.current) return;
      const x = pos?.x ?? defaultX;
      const y = pos?.y ?? defaultY;
      effectManagerRef.current.playHealEffect(amount, x, y);
      if (callbacks?.onPlayerHealed) {
        callbacks.onPlayerHealed(amount);
      }
    },
    buff: (pos?: EffectPosition) => {
      if (!enableEffects || !effectManagerRef.current) return;
      const x = pos?.x ?? defaultX;
      const y = pos?.y ?? defaultY;
      effectManagerRef.current.playBuffEffect(x, y);
      if (callbacks?.onPlayerBuffed) {
        callbacks.onPlayerBuffed();
      }
    },
    debuff: (pos?: EffectPosition) => {
      if (!enableEffects || !effectManagerRef.current) return;
      const x = pos?.x ?? defaultX;
      const y = pos?.y ?? defaultY;
      effectManagerRef.current.playDebuffEffect(x, y);
      if (callbacks?.onPlayerDebuffed) {
        callbacks.onPlayerDebuffed();
      }
    },
    victory: (pos?: EffectPosition) => {
      if (!enableEffects || !effectManagerRef.current) return;
      const x = pos?.x ?? defaultX;
      const y = pos?.y ?? defaultY;
      effectManagerRef.current.playVictoryEffect(x, y);
      if (callbacks?.onVictory) {
        callbacks.onVictory();
      }
    },
    defeat: (pos?: EffectPosition) => {
      if (!enableEffects || !effectManagerRef.current) return;
      const x = pos?.x ?? defaultX;
      const y = pos?.y ?? defaultY;
      effectManagerRef.current.playDefeatEffect(x, y);
      if (callbacks?.onDefeat) {
        callbacks.onDefeat();
      }
    },
  };

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

    // 特效管理器
    effectManager: effectManagerRef.current ?? CombatEffectManager.getInstance(),

    // 操作
    startCombat,
    playCard,
    endTurn,
    resetCombat,

    // v2.0.0 Day 8: 事件驱动的能量和抽牌
    gainEnergy: (amount: number) => {
      handManagerRef.current?.gainEnergy(amount);
      syncState();
    },
    drawCards: (count: number) => {
      handManagerRef.current?.drawCards(count);
      syncState();
    },

    // 音效触发
    playSound,

    // 特效触发
    playEffect,
  };
}

export default useCombat;

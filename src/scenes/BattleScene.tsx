// ==================== BattleScene - 战斗场景 ====================
// v2.0.0 Day 8 - 深度集成

import React, { useState, useEffect, useCallback } from 'react';
import GameCanvas from '../components/game/GameCanvas';
import GameInfo from '../components/game/GameInfo';
import { useCombat } from '../hooks/useCombat';
import { CombatUI } from '../components/ui/CombatUI';
import { EnemyDisplay } from '../components/ui/EnemyDisplay';
import { CombatState } from '../core/CombatManager';
import type { GameState } from '../types';
import type { CardData } from '../types';
import type { GameEndResult } from '../types/game';
import './BattleScene.css';

interface BattleSceneProps {
  /** 初始敌人 ID */
  enemyId: string;
  /** 初始卡组 ID */
  deckId: string;
  /** 游戏引擎实例（外部传入） */
  gameEngine: any;
  /** 游戏状态（外部传入） */
  gameState: GameState;
  /** 音频管理器 */
  audioManager: any;
  /** 战斗结束回调 */
  onBattleEnd: (result: GameEndResult) => void;
  /** 返回主菜单回调 */
  onBackToMenu: () => void;
}

/**
 * 将 Card 转换为 CardData 格式
 */
function cardToCardData(card: any): CardData {
  return {
    id: card.id,
    name: card.name,
    type: card.type === 0 ? 'basic' : 'special',
    rarity: card.rarity || 'common',
    color: card.color || '#888888',
  };
}

export const BattleScene: React.FC<BattleSceneProps> = ({
  enemyId,
  deckId,
  gameEngine,
  gameState,
  audioManager,
  onBattleEnd,
  onBackToMenu,
}) => {
  // 使用 useCombat hook 管理战斗
  const combat = useCombat({
    enableSound: true,
    enableEffects: true,
    defaultEffectX: 200,
    defaultEffectY: 200,
    effectCallbacks: {
      onCardPlayed: (handIndex: number, cardData: CardData) => {
        console.log('[BattleScene] 卡牌打出:', handIndex, cardData);
      },
      onEnemyDamaged: (damage: number) => {
        console.log('[BattleScene] 敌人受伤:', damage);
      },
      onPlayerDamaged: (damage: number, blocked: boolean) => {
        console.log('[BattleScene] 玩家受伤:', damage, blocked ? '(已格挡)' : '');
      },
      onVictory: () => {
        console.log('[BattleScene] 战斗胜利!');
      },
      onDefeat: () => {
        console.log('[BattleScene] 战斗失败!');
      },
    },
  });

  // 内部游戏状态
  const [localGameState, setLocalGameState] = useState<GameState | null>(gameState);

  // 开始战斗
  useEffect(() => {
    combat.startCombat(enemyId);
    console.log('[BattleScene] 战斗开始:', enemyId);
  }, [enemyId, combat]);

  // 监听游戏状态变化
  useEffect(() => {
    if (gameState) {
      setLocalGameState(gameState);
    }
  }, [gameState]);

  // 处理方块消除事件 - 连接 GameEngine 和 Combat 系统
  // 方块消除时：每消除 1 行 = 1 能量 + 1 抽牌
  const handleLinesCleared = useCallback((lines: number) => {
    if (lines > 0) {
      console.log(`[BattleScene] 方块消除 ${lines} 行，触发能量和抽牌`);
      
      // v2.0.0 Day 8: 触发能量和抽牌
      combat.gainEnergy(lines);
      combat.drawCards(lines);
      
      // 播放音效
      combat.playSound.energy();
      combat.playSound.cardDraw();
    }
  }, [combat]);

  // 注册消行回调到 GameEngine（通过 props 传递的 gameEngine）
  useEffect(() => {
    if (gameEngine && typeof gameEngine.setOnLinesCleared === 'function') {
      gameEngine.setOnLinesCleared(handleLinesCleared);
    }
  }, [gameEngine, handleLinesCleared]);

  // 出牌处理
  const handleCardPlay = useCallback((handIndex: number) => {
    const success = combat.playCard(handIndex);
    if (success) {
      console.log('[BattleScene] 出牌成功:', handIndex);
    }
  }, [combat]);

  // 结束回合处理
  const handleEndTurn = useCallback(() => {
    combat.endTurn();
    console.log('[BattleScene] 回合结束');
  }, [combat]);

  // 重置战斗
  const handleReset = useCallback(() => {
    combat.resetCombat();
    setIsGameOver(false);
    setBattleResult(null);
  }, [combat]);

  // 返回主菜单
  const handleBack = useCallback(() => {
    handleReset();
    onBackToMenu();
  }, [handleReset, onBackToMenu]);

  // 获取手牌的 CardData 格式
  const handCards: CardData[] = combat.hand.map(card => ({
    id: card.id,
    name: card.name,
    type: 'basic',
    rarity: card.rarity || 'common',
    color: card.color || '#888888',
  }));

  // 构建卡牌详情 Map
  const cardDetailsMap = new Map<string, { cost: number; damage: number; block: number }>();
  combat.cardDetails.forEach((details, cardId) => {
    cardDetailsMap.set(cardId, {
      cost: details.cost,
      damage: details.damage,
      block: details.block,
    });
  });

  // 敌人是否在攻击动画中
  const isEnemyAttacking = combat.combatState === CombatState.ENEMY_TURN;

  return (
    <div className="battle-scene">
      {/* 顶部：敌人显示 */}
      <div className="battle-top">
        <EnemyDisplay
          enemyName={combat.enemyName}
          enemyHP={combat.enemyHP}
          enemyMaxHP={combat.enemyMaxHP}
          enemyBlock={combat.enemyBlock}
          enemyEmoji={combat.enemyEmoji}
          combatState={combat.combatState}
          turnCount={combat.turnCount}
          isAttacking={isEnemyAttacking}
        />
      </div>

      {/* 中间：游戏画布区域 */}
      <div className="battle-middle">
        {/* 俄罗斯方块画布 */}
        <div className="game-canvas-wrapper">
          <GameCanvas gameState={localGameState} />
        </div>
        
        {/* 游戏信息 */}
        <div className="game-info-wrapper">
          <GameInfo gameState={localGameState} />
        </div>
      </div>

      {/* 底部：战斗 UI（能量、手牌、结束回合） */}
      <div className="battle-bottom">
        <CombatUI
          playerHP={combat.playerHP}
          playerMaxHP={combat.playerMaxHP}
          playerBlock={combat.playerBlock}
          enemyHP={combat.enemyHP}
          enemyMaxHP={combat.enemyMaxHP}
          enemyBlock={combat.enemyBlock}
          enemyName={combat.enemyName}
          enemyEmoji={combat.enemyEmoji}
          combatState={combat.combatState}
          hand={handCards}
          energy={combat.energy}
          maxEnergy={combat.maxEnergy}
          turnCount={combat.turnCount}
          onCardPlay={handleCardPlay}
          onEndTurn={handleEndTurn}
          cardDetails={cardDetailsMap}
        />
      </div>

      {/* 战斗结束遮罩 */}
      {combat.isCombatOver && (
        <div className={`battle-end-overlay ${combat.isVictory ? 'victory' : 'defeat'}`}>
          <div className="end-overlay-content">
            <span className="end-icon">{combat.isVictory ? '🏆' : '💀'}</span>
            <h2 className="end-title">{combat.isVictory ? '胜利!' : '失败'}</h2>
            <p className="end-subtitle">
              {combat.isVictory 
                ? `你击败了 ${combat.enemyName}!` 
                : '下次一定能赢!'
              }
            </p>
            <div className="end-stats">
              <div className="stat-item">
                <span className="stat-label">回合数</span>
                <span className="stat-value">{combat.turnCount}</span>
              </div>
            </div>
            <div className="end-buttons">
              <button className="end-btn primary" onClick={handleBack}>
                返回主菜单
              </button>
              <button className="end-btn secondary" onClick={handleReset}>
                再来一局
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 返回按钮（悬浮） */}
      <button className="back-to-menu-btn" onClick={handleBack}>
        ← 主菜单
      </button>
    </div>
  );
};

export default BattleScene;

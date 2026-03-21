/**
 * @fileoverview 赛博方块2077 - 主应用 v2.0.0 Phase 4
 * 完整游戏流程整合：
 * 主菜单 -> 选择卡组 -> 第1关战斗 -> 奖励选择 -> 第2关战斗 -> ... -> Boss战 -> 胜利/失败
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card } from './types/card.v2';
import { GameStage, RewardOption } from './types/deck-builder';
import { CombatPhase } from './core/CombatManager';
import { GameFlowManager, gameFlowManager } from './core/GameFlowManager';
import { StageManager } from './core/StageManager';
import BattleUI from './components/ui/BattleUI';
import RewardSelect from './components/ui/RewardSelect';
import './App.css';

/**
 * App 组件 - 整合完整游戏流程
 */
const App: React.FC = () => {
  // 游戏状态
  const [gameStage, setGameStage] = useState<GameStage>(GameStage.MENU);
  const [currentStage, setCurrentStage] = useState(1);
  const [deck, setDeck] = useState<Card[]>([]);

  // 战斗状态
  const [combatState, setCombatState] = useState<ReturnType<GameFlowManager['getState']>['combatState']>(null);
  const [hand, setHand] = useState<Card[]>([]);

  // 奖励状态
  const [rewardOptions, setRewardOptions] = useState<RewardOption[]>([]);

  // 伤害数字动画
  const [damageNumbers, setDamageNumbers] = useState<
    { id: number; value: number; isPlayer: boolean }[]
  >([]);

  // 伤害数字ID计数器
  const damageIdRef = useRef(0);

  /**
   * 添加伤害数字动画
   */
  const addDamageNumber = useCallback((value: number, isPlayer: boolean) => {
    const id = ++damageIdRef.current;
    setDamageNumbers((prev) => [...prev, { id, value, isPlayer }]);
    setTimeout(() => {
      setDamageNumbers((prev) => prev.filter((d) => d.id !== id));
    }, 1000);
  }, []);

  /**
   * 初始化游戏流程管理器
   */
  useEffect(() => {
    gameFlowManager.setCallbacks({
      onStateChange: (state) => {
        setGameStage(state.gameStage);
        setCurrentStage(state.currentStage);
        setDeck(state.currentDeck);
        setCombatState(state.combatState);
        setHand(state.hand);
        setRewardOptions(state.rewardOptions);
      },
      onVictory: () => {
        console.log('[App] 战斗胜利');
      },
      onDefeat: () => {
        console.log('[App] 战斗失败');
      },
      onGameComplete: () => {
        console.log('[App] 游戏通关！');
      },
      onDamageNumber: (value, isPlayer) => {
        addDamageNumber(value, isPlayer);
      },
    });

    // 初始化游戏
    gameFlowManager.startNewGame();

    return () => {
      gameFlowManager.dispose();
    };
  }, [addDamageNumber]);

  /**
   * 开始新游戏
   */
  const handleStartGame = useCallback(() => {
    gameFlowManager.startNewGame();
  }, []);

  /**
   * 开始战斗
   */
  const handleStartBattle = useCallback(() => {
    gameFlowManager.startBattle();
  }, []);

  /**
   * 使用卡牌
   */
  const handleCardPlay = useCallback(
    (card: Card, linesCleared: number) => {
      if (gameStage !== GameStage.BATTLE) return;
      if (!combatState || combatState.phase !== CombatPhase.PLAYER_ACTION) return;
      if (combatState.energy < card.cost) return;

      const result = gameFlowManager.playCard(card.id, linesCleared);
      if (result.success) {
        console.log(`[App] 使用卡牌 ${card.name}: ${result.message}`);
      }
    },
    [gameStage, combatState]
  );

  /**
   * 结束回合
   */
  const handleEndTurn = useCallback(() => {
    if (gameStage !== GameStage.BATTLE) return;
    gameFlowManager.endTurn();
  }, [gameStage]);

  /**
   * 选择奖励
   */
  const handleSelectReward = useCallback((option: RewardOption) => {
    // 使用选项的ID进行查找，避免数组重建后indexOf返回-1的问题
    const index = rewardOptions.findIndex((o) => o.id === option.id);
    if (index !== -1) {
      gameFlowManager.selectReward(index);
    }
  }, [rewardOptions]);

  /**
   * 跳过奖励
   */
  const handleSkipReward = useCallback(() => {
    gameFlowManager.skipReward();
  }, []);

  /**
   * 返回主菜单
   */
  const handleReturnToMenu = useCallback(() => {
    gameFlowManager.returnToMenu();
  }, []);

  /**
   * 进入下一关
   */
  const handleNextStage = useCallback(() => {
    gameFlowManager.nextStage();
  }, []);

  /**
   * 重新挑战
   */
  const handleRetryBattle = useCallback(() => {
    gameFlowManager.restartBattle();
  }, []);

  /**
   * 战斗胜利回调（由BattleUI触发）
   */
  const handleVictory = useCallback(() => {
    console.log('[App] handleVictory called');
  }, []);

  /**
   * 战斗失败回调（由BattleUI触发）
   */
  const handleDefeat = useCallback(() => {
    console.log('[App] handleDefeat called');
  }, []);

  /**
   * 渲染主菜单
   */
  const renderMenu = () => (
    <div className="app-menu">
      <div className="app-menu__content">
        <h1 className="app-menu__title">
          <span className="app-menu__title-icon">🎮</span>
          赛博方块 2077
        </h1>
        <p className="app-menu__subtitle">卡组构筑 · Roguelike · 完整流程</p>

        {/* 关卡进度 */}
        {currentStage > 1 && (
          <div className="app-menu__stage-progress">
            <span className="app-menu__stage-label">
              当前进度：第 {currentStage} 关 / {StageManager.TOTAL_STAGES} 关
            </span>
          </div>
        )}

        <div className="app-menu__buttons">
          <button
            className="app-menu__btn app-menu__btn--primary"
            onClick={handleStartGame}
          >
            {currentStage === 1 && deck.length === 0 ? '开始游戏' : '重新开始'}
          </button>

          {deck.length > 0 && (
            <button
              className="app-menu__btn app-menu__btn--battle"
              onClick={handleStartBattle}
            >
              ⚔️ {StageManager.isBossStage(currentStage) ? 'BOSS战' : `第${currentStage}关`}
            </button>
          )}
        </div>

        {/* 卡组预览 */}
        {deck.length > 0 && (
          <div className="app-menu__deck-preview">
            <h3 className="app-menu__deck-title">当前卡组</h3>
            <div className="app-menu__deck-info">
              <span>卡牌数量: {deck.length}</span>
              <span>第 {currentStage} 关</span>
              {StageManager.isBossStage(currentStage) && (
                <span className="app-menu__boss-indicator">🔥 BOSS关</span>
              )}
            </div>
            <div className="app-menu__deck-cards">
              {deck.slice(0, 10).map((card) => (
                <div
                  key={card.id}
                  className="app-menu__deck-card"
                  title={`${card.name} (${card.cost}能量)`}
                >
                  {card.name.charAt(0)}
                </div>
              ))}
              {deck.length > 10 && (
                <div className="app-menu__deck-more">+{deck.length - 10}</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="app-menu__footer">
        <p>v2.0.0 Phase 4 - 完整流程整合</p>
      </div>
    </div>
  );

  /**
   * 渲染战斗界面
   */
  const renderBattle = () => {
    if (!combatState) {
      return <div className="app-loading">加载战斗中...</div>;
    }

    return (
      <BattleUI
        playerHealth={combatState.playerHealth}
        playerMaxHealth={combatState.playerMaxHealth}
        playerShield={combatState.playerShield}
        energy={combatState.energy}
        maxEnergy={combatState.maxEnergy}
        enemyName={combatState.enemy?.name}
        enemyHealth={combatState.enemy?.health}
        enemyMaxHealth={combatState.enemy?.maxHealth}
        enemyAttack={combatState.enemy?.attack}
        enemyIsStunned={combatState.enemy?.isStunned}
        hand={hand}
        combatPhase={combatState.phase}
        turnCount={combatState.turnCount}
        comboCount={combatState.comboCount}
        onCardPlay={handleCardPlay}
        onEndTurn={handleEndTurn}
        onVictory={handleVictory}
        onDefeat={handleDefeat}
        damageNumbers={damageNumbers}
      />
    );
  };

  /**
   * 渲染奖励选择
   */
  const renderRewardSelect = () => (
    <RewardSelect
      options={rewardOptions}
      onSelect={handleSelectReward}
      onSkip={handleSkipReward}
      stage={currentStage}
    />
  );

  /**
   * 渲染胜利画面
   */
  const renderVictory = () => {
    const isFinalBoss = StageManager.isBossStage(currentStage);
    const isGameComplete = StageManager.isGameComplete(currentStage);

    return (
      <div className="app-victory">
        <div className="app-victory__content">
          <h1 className="app-victory__title">
            {isFinalBoss ? '🎉🎉🎉' : '🎉'} 通关！
          </h1>
          <p className="app-victory__subtitle">
            {isFinalBoss
              ? '恭喜你击败了恶魔领主！游戏通关！'
              : `你成功完成了第 ${currentStage} 关的挑战`}
          </p>

          {isGameComplete || isFinalBoss ? (
            <div className="app-victory__complete">
              <p className="app-victory__complete-text">
                🏆 恭喜你完成了赛博方块2077的所有关卡！
              </p>
              <div className="app-victory__buttons">
                <button
                  className="app-victory__btn"
                  onClick={handleStartGame}
                >
                  再玩一次
                </button>
                <button
                  className="app-victory__btn app-victory__btn--secondary"
                  onClick={handleReturnToMenu}
                >
                  返回主菜单
                </button>
              </div>
            </div>
          ) : (
            <div className="app-victory__buttons">
              <button
                className="app-victory__btn"
                onClick={handleNextStage}
              >
                进入第 {currentStage + 1} 关
              </button>
              <button
                className="app-victory__btn app-victory__btn--secondary"
                onClick={handleReturnToMenu}
              >
                返回主菜单
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * 渲染失败画面
   */
  const renderDefeat = () => (
    <div className="app-defeat">
      <div className="app-defeat__content">
        <h1 className="app-defeat__title">💀 挑战失败</h1>
        <p className="app-defeat__subtitle">
          你在第 {currentStage} 关倒下了
        </p>
        <div className="app-defeat__buttons">
          <button
            className="app-defeat__btn"
            onClick={handleRetryBattle}
          >
            重新挑战
          </button>
          <button
            className="app-defeat__btn app-defeat__btn--secondary"
            onClick={handleReturnToMenu}
          >
            返回主菜单
          </button>
        </div>
      </div>
    </div>
  );

  /**
   * 渲染当前游戏阶段
   */
  const renderCurrentStage = () => {
    switch (gameStage) {
      case GameStage.MENU:
        return renderMenu();
      case GameStage.BATTLE:
        return renderBattle();
      case GameStage.REWARD_SELECT:
        return (
          <>
            {renderMenu()}
            {renderRewardSelect()}
          </>
        );
      case GameStage.VICTORY:
        return renderVictory();
      case GameStage.DEFEAT:
        return renderDefeat();
      default:
        return renderMenu();
    }
  };

  return <div className="app">{renderCurrentStage()}</div>;
};

export default App;

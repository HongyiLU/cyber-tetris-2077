// ==================== 主应用组件 ====================

import React, { useState, useCallback, useEffect } from 'react';
import { GameEngine } from './engine/GameEngine';
import { DeckManager } from './engine/DeckManager';
import { EquipmentSystem } from './systems/EquipmentSystem';
import { AchievementSystem } from './systems/AchievementSystem';
import { LeaderboardSystem } from './systems/LeaderboardSystem';
import { GameCanvas, GameInfo } from './components/game';
import { CardDeck, MobileControls, ResponsiveLayout, BattleUI, EnemySelect, DamageNumber, ComboCounter, EquipmentSelect, AchievementPanel, LeaderboardPanel, AchievementNotification } from './components/ui';
import { useGameLoop, useKeyboardControl } from './hooks';
import { GAME_CONFIG } from './config/game-config';
import type { GameState } from './types';
import { BattleState } from './types';
import type { DamageType } from './components/ui/DamageNumber';

interface DamageNumberData {
  id: number;
  value: number;
  type: DamageType;
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [deckManager] = useState(() => new DeckManager());
  const [gameEngine] = useState(() => new GameEngine(GAME_CONFIG.GAME.COLS, GAME_CONFIG.GAME.ROWS, deckManager));
  const [equipmentSystem] = useState(() => {
    // 从 localStorage 加载装备状态
    const saved = EquipmentSystem.loadFromStorage();
    return saved || new EquipmentSystem();
  });
  const [achievementSystem] = useState(() => {
    // 从 localStorage 加载成就状态
    const saved = AchievementSystem.loadFromStorage();
    return saved || new AchievementSystem();
  });
  const [leaderboardSystem] = useState(() => {
    // 从 localStorage 加载排行榜状态
    const saved = LeaderboardSystem.loadFromStorage();
    return saved || new LeaderboardSystem();
  });
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showDeck, setShowDeck] = useState(false);
  const [showEnemySelect, setShowEnemySelect] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedEnemy, setSelectedEnemy] = useState('slime');
  const [damageNumbers, setDamageNumbers] = useState<DamageNumberData[]>([]);
  const [notificationAchievement, setNotificationAchievement] = useState<{
    id: string;
    name: string;
    description: string;
    goldReward: number;
    icon?: string;
  } | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // 使用游戏循环 Hook
  useGameLoop({
    gameStarted,
    gameState,
    gameEngine,
    paused: gameState?.paused ?? false,
    onGameStateChange: () => {
      const state = gameEngine.getGameState();
      setGameState(state);
      // battleState 直接从 state.battleState 读取，无需单独状态
    },
  });

  // 移除伤害数字
  const removeDamageNumber = useCallback((id: number) => {
    setDamageNumbers(prev => prev.filter(d => d.id !== id));
  }, []);

  // 显示伤害数字（示例：敌人受伤时）
  const showDamageNumber = useCallback((value: number, type: DamageType) => {
    const id = Date.now() + Math.random();
    // 居中显示
    const x = window.innerWidth / 2 - 50 + (Math.random() - 0.5) * 100;
    const y = window.innerHeight / 3;
    setDamageNumbers(prev => [...prev, { id, value, type, x, y }]);
  }, []);

  // 设置成就解锁回调
  useEffect(() => {
    achievementSystem.setOnAchievementUnlocked((achievement) => {
      setNotificationAchievement({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        goldReward: achievement.reward.value as number,
        icon: achievement.icon,
      });
      setShowNotification(true);
    });
  }, [achievementSystem]);

  // 保存系统状态
  useEffect(() => {
    if (gameStarted) {
      equipmentSystem.saveToStorage();
      achievementSystem.saveToStorage();
      leaderboardSystem.saveToStorage();
    }
  }, [gameStarted, equipmentSystem, achievementSystem, leaderboardSystem]);

  // 使用键盘控制 Hook（桌面端）
  useKeyboardControl({
    gameStarted,
    gameState,
    gameEngine,
    onGameStateChange: setGameState,
  });

  const startGame = useCallback(() => {
    // 显示敌人选择界面
    setShowEnemySelect(true);
  }, [gameEngine]);

  const handleEnemySelect = useCallback((enemyId: string) => {
    setSelectedEnemy(enemyId);
  }, []);

  const handleStartBattle = useCallback(() => {
    gameEngine.initBattle(selectedEnemy);
    gameEngine.init();
    setGameState(gameEngine.getGameState());
    setGameStarted(true);
    setShowEnemySelect(false);
  }, [gameEngine, selectedEnemy]);

  // 移动端控制回调 - 让 GameEngine 自己检查状态
  const handleMoveLeft = useCallback(() => {
    gameEngine.movePiece(-1, 0);
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);

  const handleMoveRight = useCallback(() => {
    gameEngine.movePiece(1, 0);
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);

  const handleRotate = useCallback(() => {
    gameEngine.rotatePiece();
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);

  const handleSoftDrop = useCallback(() => {
    gameEngine.movePiece(0, 1);
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);

  const handleHardDrop = useCallback(() => {
    // 硬降：直接到底部并锁定
    gameEngine.hardDrop();
    gameEngine.lockPiece();
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);

  const handlePause = useCallback(() => {
    gameEngine.togglePause();
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);

  return (
    <ResponsiveLayout
      gameCanvas={<GameCanvas gameState={gameState} />}
      gameInfo={<GameInfo gameState={gameState} />}
      mobileControls={gameStarted ? (
        <MobileControls
          onMoveLeft={handleMoveLeft}
          onMoveRight={handleMoveRight}
          onRotate={handleRotate}
          onSoftDrop={handleSoftDrop}
          onHardDrop={handleHardDrop}
          onPause={handlePause}
          disabled={!gameStarted || gameState?.gameOver === true || gameState?.paused === true}
        />
      ) : null}
    >
      <h1 style={{
        fontSize: 'clamp(24px, 8vw, 48px)',
        color: 'var(--neon-cyan, #00ffff)',
        textShadow: '0 0 10px var(--neon-cyan, #00ffff), 0 0 20px var(--neon-cyan, #00ffff)',
        marginBottom: '20px',
        letterSpacing: '4px',
        textAlign: 'center',
      }}>
        赛博方块 2077
      </h1>

      {!gameStarted ? (
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          flexDirection: 'column', 
          alignItems: 'center',
          width: '100%',
        }}>
          {/* 金币显示 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 20px',
            background: 'rgba(243, 156, 18, 0.15)',
            border: '2px solid rgba(243, 156, 18, 0.5)',
            borderRadius: '12px',
            boxShadow: '0 0 15px rgba(243, 156, 18, 0.3)',
            marginBottom: '10px',
          }}>
            <span style={{ fontSize: '24px' }}>💰</span>
            <span style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: 'clamp(18px, 5vw, 24px)',
              color: '#f39c12',
              fontWeight: 'bold',
              textShadow: '0 0 10px rgba(243, 156, 18, 0.5)',
            }}>
              {achievementSystem.getTotalGold().toLocaleString()}
            </span>
            <span style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: 'clamp(12px, 3vw, 14px)',
              color: '#f39c12',
              opacity: 0.8,
            }}>
              金币
            </span>
          </div>

          <button
            onClick={startGame}
            style={{
              padding: 'clamp(12px, 3vw, 15px) clamp(30px, 8vw, 40px)',
              fontSize: 'clamp(18px, 5vw, 24px)',
              background: 'rgba(0, 255, 255, 0.1)',
              border: '2px solid var(--neon-cyan, #00ffff)',
              borderRadius: '8px',
              color: 'var(--neon-cyan, #00ffff)',
              cursor: 'pointer',
              fontFamily: 'Orbitron, monospace',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
              transition: 'all 0.3s',
              width: '100%',
              maxWidth: '300px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
            }}
          >
            开始游戏
          </button>
          
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '500px',
          }}>
            <button
              onClick={() => setShowEquipment(true)}
              style={{
                padding: 'clamp(8px, 2vw, 10px) clamp(20px, 5vw, 25px)',
                fontSize: 'clamp(12px, 3vw, 14px)',
                background: 'rgba(243, 156, 18, 0.1)',
                border: '2px solid #f39c12',
                borderRadius: '8px',
                color: '#f39c12',
                cursor: 'pointer',
                fontFamily: 'Orbitron, monospace',
                boxShadow: '0 0 10px rgba(243, 156, 18, 0.3)',
                transition: 'all 0.3s',
                flex: '1',
                minWidth: '120px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(243, 156, 18, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(243, 156, 18, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(243, 156, 18, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(243, 156, 18, 0.3)';
              }}
            >
              🎒 装备
            </button>
            
            <button
              onClick={() => setShowAchievement(true)}
              style={{
                padding: 'clamp(8px, 2vw, 10px) clamp(20px, 5vw, 25px)',
                fontSize: 'clamp(12px, 3vw, 14px)',
                background: 'rgba(155, 89, 182, 0.1)',
                border: '2px solid #9b59b6',
                borderRadius: '8px',
                color: '#9b59b6',
                cursor: 'pointer',
                fontFamily: 'Orbitron, monospace',
                boxShadow: '0 0 10px rgba(155, 89, 182, 0.3)',
                transition: 'all 0.3s',
                flex: '1',
                minWidth: '120px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(155, 89, 182, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(155, 89, 182, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(155, 89, 182, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(155, 89, 182, 0.3)';
              }}
            >
              🏆 成就
            </button>
            
            <button
              onClick={() => setShowLeaderboard(true)}
              style={{
                padding: 'clamp(8px, 2vw, 10px) clamp(20px, 5vw, 25px)',
                fontSize: 'clamp(12px, 3vw, 14px)',
                background: 'rgba(52, 152, 219, 0.1)',
                border: '2px solid #3498db',
                borderRadius: '8px',
                color: '#3498db',
                cursor: 'pointer',
                fontFamily: 'Orbitron, monospace',
                boxShadow: '0 0 10px rgba(52, 152, 219, 0.3)',
                transition: 'all 0.3s',
                flex: '1',
                minWidth: '120px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(52, 152, 219, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(52, 152, 219, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(52, 152, 219, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(52, 152, 219, 0.3)';
              }}
            >
              📊 排行榜
            </button>

            <button
              disabled
              style={{
                padding: 'clamp(8px, 2vw, 10px) clamp(20px, 5vw, 25px)',
                fontSize: 'clamp(12px, 3vw, 14px)',
                background: 'rgba(100, 100, 100, 0.1)',
                border: '2px solid #666',
                borderRadius: '8px',
                color: '#666',
                cursor: 'not-allowed',
                fontFamily: 'Orbitron, monospace',
                opacity: 0.6,
                flex: '1',
                minWidth: '120px',
              }}
              title="商店系统开发中，敬请期待！"
            >
              🛒 商店
              <span style={{
                display: 'block',
                fontSize: '9px',
                marginTop: '2px',
                opacity: 0.7,
              }}>开发中</span>
            </button>
          </div>
          
          <button
            onClick={() => setShowDeck(true)}
            style={{
              padding: 'clamp(10px, 3vw, 12px) clamp(25px, 6vw, 30px)',
              fontSize: 'clamp(14px, 4vw, 18px)',
              background: 'rgba(255, 0, 255, 0.1)',
              border: '2px solid #ff00ff',
              borderRadius: '8px',
              color: '#ff00ff',
              cursor: 'pointer',
              fontFamily: 'Orbitron, monospace',
              boxShadow: '0 0 15px rgba(255, 0, 255, 0.3)',
              transition: 'all 0.3s',
              width: '100%',
              maxWidth: '300px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 0, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 0, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 0, 255, 0.1)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 255, 0.3)';
            }}
          >
            🎴 卡组管理
          </button>
        </div>
      ) : (
        <>
          {/* 游戏主区域：棋盘 + 信息面板 */}
          <div style={{ 
            position: 'relative',
            display: 'flex', 
            gap: '20px', 
            alignItems: 'flex-start', 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            marginBottom: '10px',
          }}>
            <GameCanvas gameState={gameState} />
            <GameInfo gameState={gameState} />
            
            {/* 连击计数器 */}
            {gameState && gameState.combo > 1 && (
              <ComboCounter
                combo={gameState.combo}
                maxCombo={gameState.maxCombo}
                visible={true}
              />
            )}
            
            {/* 伤害数字 */}
            {damageNumbers.map(dn => (
              <DamageNumber
                key={dn.id}
                value={dn.value}
                type={dn.type}
                position={{ x: dn.x, y: dn.y }}
                onComplete={() => removeDamageNumber(dn.id)}
              />
            ))}
          </div>
          
          {/* 战斗 UI - 放在棋盘下方，不遮挡 */}
          {gameState && gameState.battleState !== BattleState.IDLE && (
            <div style={{
              width: '100%',
              maxWidth: '800px',
              margin: '10px auto',
            }}>
              <BattleUI
                playerHp={gameState.playerHp}
                playerMaxHp={gameState.playerMaxHp}
                enemyHp={gameState.enemyHp}
                enemyMaxHp={gameState.enemyMaxHp}
                battleState={gameState.battleState}
              />
            </div>
          )}
          
          {/* 开始战斗按钮 - 修改为使用敌人选择 */}
          <button
            className="start-battle-btn"
            onClick={handleStartBattle}
            style={{
              marginTop: '15px',
              padding: 'clamp(10px, 3vw, 12px) clamp(25px, 6vw, 30px)',
              fontSize: 'clamp(14px, 4vw, 18px)',
              background: 'rgba(255, 68, 68, 0.1)',
              border: '2px solid #ff4444',
              borderRadius: '8px',
              color: '#ff4444',
              cursor: 'pointer',
              fontFamily: 'Orbitron, monospace',
              boxShadow: '0 0 15px rgba(255, 68, 68, 0.3)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 68, 68, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 68, 68, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 68, 68, 0.3)';
            }}
          >
            ⚔️ 选择敌人开始战斗
          </button>
          
          <div style={{
            marginTop: '15px',
            fontSize: 'clamp(10px, 3vw, 12px)',
            color: 'var(--neon-cyan, #00ffff)',
            textAlign: 'center',
            opacity: 0.7,
            lineHeight: '1.6',
          }}>
            <div>← → 移动 | ↑ 旋转 | ↓ 加速 | 空格 落下 | P 暂停</div>
            <div style={{ marginTop: '5px' }}>📱 或滑动屏幕 / 点击按钮</div>
          </div>
        </>
      )}

      <div style={{
        marginTop: '10px',
        fontSize: 'clamp(9px, 2.5vw, 10px)',
        color: '#666',
      }}>
        v1.6.0 - 游戏内容扩展版
      </div>

      {/* 卡组管理界面 */}
      {showDeck && (
        <CardDeck 
          deckManager={deckManager}
          onClose={() => setShowDeck(false)}
        />
      )}

      {/* 装备选择界面 */}
      {showEquipment && (
        <EquipmentSelect
          onSelect={(equipmentId) => {
            equipmentSystem.equipEquipment(equipmentId);
          }}
          onClose={() => setShowEquipment(false)}
          selectedEquipment={{
            head: equipmentSystem.getEquipmentSlots().head?.id || null,
            body: equipmentSystem.getEquipmentSlots().body?.id || null,
            accessory: equipmentSystem.getEquipmentSlots().accessory?.id || null,
          }}
          unlockedEquipment={equipmentSystem.getUnlockedEquipment().map(e => e.id)}
        />
      )}

      {/* 成就面板 */}
      {showAchievement && (
        <AchievementPanel
          progress={achievementSystem.getAllProgress()}
          totalGold={achievementSystem.getTotalGold()}
          onClose={() => setShowAchievement(false)}
        />
      )}

      {/* 排行榜面板 */}
      {showLeaderboard && (
        <LeaderboardPanel
          leaderboards={leaderboardSystem.getAllLeaderboards()}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* 敌人选择界面 */}
      {showEnemySelect && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <EnemySelect
              onEnemySelect={handleEnemySelect}
              selectedEnemyId={selectedEnemy}
            />
            <button
              onClick={handleStartBattle}
              style={{
                display: 'block',
                margin: '20px auto 0',
                padding: '15px 40px',
                fontSize: '18px',
                background: 'rgba(0, 255, 255, 0.2)',
                border: '2px solid #00ffff',
                borderRadius: '8px',
                color: '#00ffff',
                cursor: 'pointer',
                fontFamily: 'Orbitron, monospace',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.3)';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5)';
              }}
            >
              开始战斗
            </button>
            <button
              onClick={() => setShowEnemySelect(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '10px 20px',
                fontSize: '14px',
                background: 'rgba(255, 68, 68, 0.2)',
                border: '2px solid #ff4444',
                borderRadius: '8px',
                color: '#ff4444',
                cursor: 'pointer',
                fontFamily: 'Orbitron, monospace',
              }}
            >
              ✕ 关闭
            </button>
          </div>
        </div>
      )}

      {/* 成就解锁通知 */}
      <AchievementNotification
        achievement={notificationAchievement}
        visible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </ResponsiveLayout>
  );
};

export default App;

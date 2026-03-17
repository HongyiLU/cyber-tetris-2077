import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// ==================== 主应用组件 ====================
import { useState, useCallback, useEffect } from 'react';
import { GameEngine } from './engine/GameEngine';
import { DeckManager } from './engine/DeckManager';
import { EquipmentSystem } from './systems/EquipmentSystem';
import { AchievementSystem } from './systems/AchievementSystem';
import { LeaderboardSystem } from './systems/LeaderboardSystem';
import { AudioManager } from './systems/AudioManagerSynth';
import { SoundId } from './systems/AudioManagerSynth';
import { GameCanvas, GameInfo } from './components/game';
import { CardDeck, ResponsiveLayout, BattleUI, EnemySelect, DamageNumber, ComboCounter, EquipmentSelect, AchievementPanel, LeaderboardPanel, AchievementNotification, ParticleCanvas, GameStartCountdown, GameEndModal } from './components/ui';
import { useGameLoop, useKeyboardControl } from './hooks';
import { GAME_CONFIG } from './config/game-config';
import { BattleState } from './types';
const App = () => {
    const [deckManager] = useState(() => new DeckManager());
    const [audioManager] = useState(() => new AudioManager());
    const [gameEngine] = useState(() => new GameEngine(GAME_CONFIG.GAME.COLS, GAME_CONFIG.GAME.ROWS, deckManager, audioManager));
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
    const [gameState, setGameState] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameEndVisible, setGameEndVisible] = useState(false);
    const [gameEndResult, setGameEndResult] = useState(null);
    const [showCountdown, setShowCountdown] = useState(false);
    const [showDeck, setShowDeck] = useState(false);
    const [showEnemySelect, setShowEnemySelect] = useState(false);
    const [showEquipment, setShowEquipment] = useState(false);
    const [showAchievement, setShowAchievement] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedEnemy, setSelectedEnemy] = useState('slime');
    const [damageNumbers, setDamageNumbers] = useState([]);
    const [notificationAchievement, setNotificationAchievement] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    // 粒子系统状态
    const [particleSystem, setParticleSystem] = useState(null);
    // 音频状态
    const [masterVolume, setMasterVolume] = useState(audioManager.getMasterVolume());
    const [gameVolume, setGameVolume] = useState(audioManager.getGameVolume());
    const [isMuted, setIsMuted] = useState(audioManager.isMuted());
    // P0-003: 游戏开始时防误触保护（已移除虚拟按键，保留触摸控制）
    const [controlsDisabled, setControlsDisabled] = useState(false);
    // 设置游戏结束回调
    useEffect(() => {
        gameEngine.setOnGameEnd((result) => {
            // 停止 BGM
            if (audioManager.isBGMPlaying()) {
                audioManager.stopBGM();
            }
            // 显示游戏结束弹窗
            setGameEndResult(result);
            setGameEndVisible(true);
        });
    }, [gameEngine, audioManager]);
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
            // 检查游戏结束/胜利
            gameEngine.checkGameEnd();
        },
    });
    // 移除伤害数字
    const removeDamageNumber = useCallback((id) => {
        setDamageNumbers(prev => prev.filter(d => d.id !== id));
    }, []);
    // 显示伤害数字（示例：敌人受伤时）
    const showDamageNumber = useCallback((value, type) => {
        const id = Date.now() + Math.random();
        // 居中显示
        const x = window.innerWidth / 2 - 50 + (Math.random() - 0.5) * 100;
        const y = window.innerHeight / 3;
        setDamageNumbers(prev => [...prev, { id, value, type, x, y }]);
    }, []);
    // 获取粒子系统实例的回调
    const handleGetParticleSystem = useCallback((system) => {
        setParticleSystem(system);
        // 将粒子系统传递给 GameEngine
        gameEngine.setParticleSystem(system);
        // 设置粒子生成回调（从 ParticleCanvas 获取 spawnEffect 方法）
        setTimeout(() => {
            const canvas = document.querySelector('.particle-canvas');
            if (canvas?.spawnEffect) {
                gameEngine.setParticleSpawnCallback(canvas.spawnEffect);
                console.log('[App] 粒子特效回调已设置');
            }
        }, 100);
    }, [gameEngine]);
    // 初始化音频管理器
    useEffect(() => {
        audioManager.initialize().catch(console.warn);
        // 组件卸载时清理
        return () => {
            audioManager.dispose();
        };
    }, [audioManager]);
    // 设置成就解锁回调
    useEffect(() => {
        achievementSystem.setOnAchievementUnlocked((achievement) => {
            setNotificationAchievement({
                id: achievement.id,
                name: achievement.name,
                description: achievement.description,
                goldReward: achievement.reward.value,
                icon: achievement.icon,
            });
            setShowNotification(true);
            // 播放成就解锁音效
            audioManager.playSound(SoundId.ACHIEVEMENT);
        });
    }, [achievementSystem, audioManager]);
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
    const handleEnemySelect = useCallback((enemyId) => {
        setSelectedEnemy(enemyId);
    }, []);
    const handleStartBattle = useCallback(() => {
        // 关闭敌人选择界面，显示倒计时
        setShowEnemySelect(false);
        setShowCountdown(true);
    }, []);
    const handleCountdownComplete = useCallback(() => {
        setShowCountdown(false);
        // P0-003: 游戏开始后 500ms 内禁用虚拟按键，防止误触
        setControlsDisabled(true);
        setTimeout(() => setControlsDisabled(false), 500);
        gameEngine.initBattle(selectedEnemy);
        gameEngine.init();
        setGameState(gameEngine.getGameState());
        setGameStarted(true);
        setGameEndVisible(false);
        setGameEndResult(null);
        // 开始播放 BGM（需要用户交互后才能播放）
        setTimeout(() => {
            audioManager.playBGM();
            console.log('[App] BGM 开始播放');
        }, 500);
    }, [gameEngine, selectedEnemy, audioManager]);
    // 移动端控制回调（触摸手势）
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
        // 硬降：直接到底部并锁定（hardDrop 内部已调用 lockPiece，无需重复调用）
        gameEngine.hardDrop();
        setGameState(gameEngine.getGameState());
    }, [gameEngine]);
    const handlePause = useCallback(() => {
        gameEngine.togglePause();
        setGameState(gameEngine.getGameState());
    }, [gameEngine]);
    const handleRestart = useCallback(() => {
        // 重新开始游戏：重置引擎并初始化
        gameEngine.init();
        setGameState(gameEngine.getGameState());
        // 播放旋转音效作为反馈
        audioManager.playSound(SoundId.ROTATE);
    }, [gameEngine, audioManager]);
    // 游戏结束后的重新挑战
    const handleRestartGame = useCallback(() => {
        setGameEndVisible(false);
        setGameEndResult(null);
        setGameStarted(false);
        // 重置游戏引擎
        gameEngine.init();
        setGameState(gameEngine.getGameState());
        // 显示敌人选择界面
        setShowEnemySelect(true);
    }, [gameEngine]);
    // 返回标题页
    const handleBackToTitle = useCallback(() => {
        setGameEndVisible(false);
        setGameEndResult(null);
        setGameStarted(false);
        // 重置游戏引擎
        gameEngine.init();
        setGameState(gameEngine.getGameState());
    }, [gameEngine]);
    // 挑战下一关卡
    const handleNextLevel = useCallback(() => {
        setGameEndVisible(false);
        setGameEndResult(null);
        // 保持游戏开始状态，进入下一关
        gameEngine.init();
        setGameState(gameEngine.getGameState());
        // 显示敌人选择界面（可以选择下一关的敌人）
        setShowEnemySelect(true);
    }, [gameEngine]);
    // 音频控制回调
    const handleSetMasterVolume = useCallback((volume) => {
        setMasterVolume(volume);
        audioManager.setMasterVolume(volume);
    }, [audioManager]);
    const handleSetGameVolume = useCallback((volume) => {
        setGameVolume(volume);
        audioManager.setGameVolume(volume);
    }, [audioManager]);
    const handleToggleMute = useCallback(() => {
        const muted = audioManager.toggleMute();
        setIsMuted(muted);
    }, [audioManager]);
    return (_jsxs(ResponsiveLayout, { gameCanvas: _jsx(GameCanvas, { gameState: gameState, onMoveLeft: handleMoveLeft, onMoveRight: handleMoveRight, onRotate: handleRotate, onSoftDrop: handleSoftDrop, onHardDrop: handleHardDrop, onPause: handlePause }), gameInfo: _jsx(GameInfo, { gameState: gameState }), showGameArea: gameStarted, children: [_jsx("h1", { style: {
                    fontSize: 'clamp(24px, 8vw, 48px)',
                    color: 'var(--neon-cyan, #00ffff)',
                    textShadow: '0 0 10px var(--neon-cyan, #00ffff), 0 0 20px var(--neon-cyan, #00ffff)',
                    marginBottom: '20px',
                    letterSpacing: '4px',
                    textAlign: 'center',
                }, children: "\u8D5B\u535A\u65B9\u5757 2077" }), !gameStarted ? (_jsxs("div", { style: {
                    display: 'flex',
                    gap: '15px',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 20px',
                            background: 'rgba(243, 156, 18, 0.15)',
                            border: '2px solid rgba(243, 156, 18, 0.5)',
                            borderRadius: '12px',
                            boxShadow: '0 0 15px rgba(243, 156, 18, 0.3)',
                            marginBottom: '10px',
                        }, children: [_jsx("span", { style: { fontSize: '24px' }, children: "\uD83D\uDCB0" }), _jsx("span", { style: {
                                    fontFamily: 'Orbitron, monospace',
                                    fontSize: 'clamp(18px, 5vw, 24px)',
                                    color: '#f39c12',
                                    fontWeight: 'bold',
                                    textShadow: '0 0 10px rgba(243, 156, 18, 0.5)',
                                }, children: achievementSystem.getTotalGold().toLocaleString() }), _jsx("span", { style: {
                                    fontFamily: 'Orbitron, monospace',
                                    fontSize: 'clamp(12px, 3vw, 14px)',
                                    color: '#f39c12',
                                    opacity: 0.8,
                                }, children: "\u91D1\u5E01" })] }), _jsx("button", { onClick: startGame, style: {
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
                        }, onMouseEnter: (e) => {
                            e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
                            e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.6)';
                        }, onMouseLeave: (e) => {
                            e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
                            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
                        }, children: "\u5F00\u59CB\u6E38\u620F" }), _jsxs("div", { style: {
                            display: 'flex',
                            gap: '10px',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            width: '100%',
                            maxWidth: '500px',
                        }, children: [_jsx("button", { onClick: () => setShowSettings(true), style: {
                                    padding: 'clamp(8px, 2vw, 10px) clamp(20px, 5vw, 25px)',
                                    fontSize: 'clamp(12px, 3vw, 14px)',
                                    background: 'rgba(46, 204, 113, 0.1)',
                                    border: '2px solid #2ecc71',
                                    borderRadius: '8px',
                                    color: '#2ecc71',
                                    cursor: 'pointer',
                                    fontFamily: 'Orbitron, monospace',
                                    boxShadow: '0 0 10px rgba(46, 204, 113, 0.3)',
                                    transition: 'all 0.3s',
                                    flex: '1',
                                    minWidth: '120px',
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.background = 'rgba(46, 204, 113, 0.2)';
                                    e.currentTarget.style.boxShadow = '0 0 20px rgba(46, 204, 113, 0.6)';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.background = 'rgba(46, 204, 113, 0.1)';
                                    e.currentTarget.style.boxShadow = '0 0 10px rgba(46, 204, 113, 0.3)';
                                }, children: "\u2699\uFE0F \u8BBE\u7F6E" }), _jsx("button", { onClick: () => setShowEquipment(true), style: {
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
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.background = 'rgba(243, 156, 18, 0.2)';
                                    e.currentTarget.style.boxShadow = '0 0 20px rgba(243, 156, 18, 0.6)';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.background = 'rgba(243, 156, 18, 0.1)';
                                    e.currentTarget.style.boxShadow = '0 0 10px rgba(243, 156, 18, 0.3)';
                                }, children: "\uD83C\uDF92 \u88C5\u5907" }), _jsx("button", { onClick: () => setShowAchievement(true), style: {
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
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.background = 'rgba(155, 89, 182, 0.2)';
                                    e.currentTarget.style.boxShadow = '0 0 20px rgba(155, 89, 182, 0.6)';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.background = 'rgba(155, 89, 182, 0.1)';
                                    e.currentTarget.style.boxShadow = '0 0 10px rgba(155, 89, 182, 0.3)';
                                }, children: "\uD83C\uDFC6 \u6210\u5C31" }), _jsx("button", { onClick: () => setShowLeaderboard(true), style: {
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
                                }, onMouseEnter: (e) => {
                                    e.currentTarget.style.background = 'rgba(52, 152, 219, 0.2)';
                                    e.currentTarget.style.boxShadow = '0 0 20px rgba(52, 152, 219, 0.6)';
                                }, onMouseLeave: (e) => {
                                    e.currentTarget.style.background = 'rgba(52, 152, 219, 0.1)';
                                    e.currentTarget.style.boxShadow = '0 0 10px rgba(52, 152, 219, 0.3)';
                                }, children: "\uD83D\uDCCA \u6392\u884C\u699C" }), _jsxs("button", { disabled: true, style: {
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
                                }, title: "\u5546\u5E97\u7CFB\u7EDF\u5F00\u53D1\u4E2D\uFF0C\u656C\u8BF7\u671F\u5F85\uFF01", children: ["\uD83D\uDED2 \u5546\u5E97", _jsx("span", { style: {
                                            display: 'block',
                                            fontSize: '9px',
                                            marginTop: '2px',
                                            opacity: 0.7,
                                        }, children: "\u5F00\u53D1\u4E2D" })] })] }), _jsx("button", { onClick: () => setShowDeck(true), style: {
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
                        }, onMouseEnter: (e) => {
                            e.currentTarget.style.background = 'rgba(255, 0, 255, 0.2)';
                            e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 0, 255, 0.6)';
                        }, onMouseLeave: (e) => {
                            e.currentTarget.style.background = 'rgba(255, 0, 255, 0.1)';
                            e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 255, 0.3)';
                        }, children: "\uD83C\uDFB4 \u5361\u7EC4\u7BA1\u7406" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { style: {
                            position: 'relative',
                            display: 'flex',
                            gap: '20px',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            marginBottom: '10px',
                        }, children: [_jsxs("div", { style: { position: 'relative', display: 'inline-block' }, children: [_jsx(GameCanvas, { gameState: gameState }), _jsx(ParticleCanvas, { width: GAME_CONFIG.GAME.COLS * GAME_CONFIG.GAME.BLOCK_SIZE, height: GAME_CONFIG.GAME.ROWS * GAME_CONFIG.GAME.BLOCK_SIZE, visible: gameStarted, onGetParticleSystem: handleGetParticleSystem, style: {
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            zIndex: 10, // 确保在 GameCanvas 上方
                                            pointerEvents: 'none', // 让点击穿透到下层
                                        } })] }), _jsx(GameInfo, { gameState: gameState }), gameState && gameState.combo > 1 && (_jsx(ComboCounter, { combo: gameState.combo, maxCombo: gameState.maxCombo, visible: true })), damageNumbers.map(dn => (_jsx(DamageNumber, { value: dn.value, type: dn.type, position: { x: dn.x, y: dn.y }, onComplete: () => removeDamageNumber(dn.id) }, dn.id)))] }), gameState && gameState.battleState !== BattleState.IDLE && (_jsx("div", { style: {
                            width: '100%',
                            maxWidth: '800px',
                            margin: '10px auto',
                        }, children: _jsx(BattleUI, { playerHp: gameState.playerHp, playerMaxHp: gameState.playerMaxHp, enemyHp: gameState.enemyHp, enemyMaxHp: gameState.enemyMaxHp, battleState: gameState.battleState }) })), _jsx("button", { className: "start-battle-btn", onClick: handleStartBattle, style: {
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
                        }, onMouseEnter: (e) => {
                            e.currentTarget.style.background = 'rgba(255, 68, 68, 0.2)';
                            e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 68, 68, 0.6)';
                        }, onMouseLeave: (e) => {
                            e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)';
                            e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 68, 68, 0.3)';
                        }, children: "\u2694\uFE0F \u9009\u62E9\u654C\u4EBA\u5F00\u59CB\u6218\u6597" }), _jsxs("div", { style: {
                            marginTop: '15px',
                            fontSize: 'clamp(10px, 3vw, 12px)',
                            color: 'var(--neon-cyan, #00ffff)',
                            textAlign: 'center',
                            opacity: 0.7,
                            lineHeight: '1.6',
                        }, children: [_jsx("div", { children: "\u2190 \u2192 \u79FB\u52A8 | \u2191 \u65CB\u8F6C | \u2193 \u52A0\u901F | \u7A7A\u683C \u843D\u4E0B | P \u6682\u505C" }), _jsx("div", { style: { marginTop: '5px' }, children: "\uD83D\uDCF1 \u6ED1\u52A8\u5C4F\u5E55\u63A7\u5236" })] })] })), _jsx("div", { style: {
                    marginTop: '10px',
                    fontSize: 'clamp(9px, 2.5vw, 10px)',
                    color: '#666',
                }, children: "v1.9.11 - \u5361\u7EC4\u7F16\u8F91\u529F\u80FD\uFF08\u5220\u9664\u7F16\u8F91\u9875\u7B7E\u5E76\u6DFB\u52A0\u5F39\u7A97\uFF09" }), showDeck && (_jsx(CardDeck, { deckManager: deckManager, onClose: () => setShowDeck(false) })), showEquipment && (_jsx(EquipmentSelect, { onSelect: (equipmentId) => {
                    equipmentSystem.equipEquipment(equipmentId);
                }, onClose: () => setShowEquipment(false), selectedEquipment: {
                    head: equipmentSystem.getEquipmentSlots().head?.id || null,
                    body: equipmentSystem.getEquipmentSlots().body?.id || null,
                    accessory: equipmentSystem.getEquipmentSlots().accessory?.id || null,
                }, unlockedEquipment: equipmentSystem.getUnlockedEquipment().map(e => e.id) })), showAchievement && (_jsx(AchievementPanel, { progress: achievementSystem.getAllProgress(), totalGold: achievementSystem.getTotalGold(), onClose: () => setShowAchievement(false) })), showLeaderboard && (_jsx(LeaderboardPanel, { leaderboards: leaderboardSystem.getAllLeaderboards(), onClose: () => setShowLeaderboard(false) })), showEnemySelect && (_jsx("div", { style: {
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
                    padding: '20px',
                }, children: _jsxs("div", { style: {
                        position: 'relative',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '85vh',
                        display: 'flex',
                        flexDirection: 'column',
                    }, children: [_jsxs("div", { style: {
                                display: 'flex',
                                gap: '10px',
                                marginBottom: '15px',
                                flexShrink: '0',
                            }, children: [_jsx("button", { onClick: handleStartBattle, style: {
                                        flex: '1',
                                        padding: '15px 30px',
                                        fontSize: '16px',
                                        background: 'rgba(0, 255, 255, 0.2)',
                                        border: '2px solid #00ffff',
                                        borderRadius: '8px',
                                        color: '#00ffff',
                                        cursor: 'pointer',
                                        fontFamily: 'Orbitron, monospace',
                                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
                                        transition: 'all 0.3s',
                                        fontWeight: 'bold',
                                    }, onMouseEnter: (e) => {
                                        e.currentTarget.style.background = 'rgba(0, 255, 255, 0.3)';
                                        e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.8)';
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
                                        e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5)';
                                    }, children: "\u2694\uFE0F \u5F00\u59CB\u6218\u6597" }), _jsx("button", { onClick: () => setShowEnemySelect(false), style: {
                                        padding: '15px 25px',
                                        fontSize: '14px',
                                        background: 'rgba(255, 68, 68, 0.2)',
                                        border: '2px solid #ff4444',
                                        borderRadius: '8px',
                                        color: '#ff4444',
                                        cursor: 'pointer',
                                        fontFamily: 'Orbitron, monospace',
                                        fontWeight: 'bold',
                                    }, children: "\u2715" })] }), _jsx("div", { style: {
                                flex: '1',
                                overflow: 'auto',
                                padding: '10px',
                                background: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: '8px',
                                border: '1px solid rgba(0, 255, 255, 0.2)',
                            }, children: _jsx(EnemySelect, { onEnemySelect: handleEnemySelect, selectedEnemyId: selectedEnemy }) })] }) })), _jsx(AchievementNotification, { achievement: notificationAchievement, visible: showNotification, onClose: () => setShowNotification(false) }), showSettings && (_jsx("div", { style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }, children: _jsxs("div", { style: {
                        background: 'rgba(0, 20, 40, 0.95)',
                        border: '2px solid var(--neon-cyan, #00ffff)',
                        borderRadius: '16px',
                        padding: '30px',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 0 40px rgba(0, 255, 255, 0.3)',
                    }, children: [_jsx("h2", { style: {
                                fontSize: '24px',
                                color: 'var(--neon-cyan, #00ffff)',
                                fontFamily: 'Orbitron, monospace',
                                marginBottom: '25px',
                                textAlign: 'center',
                                textShadow: '0 0 10px var(--neon-cyan, #00ffff)',
                            }, children: "\uD83D\uDD0A \u97F3\u6548\u8BBE\u7F6E" }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsxs("label", { style: {
                                        display: 'block',
                                        color: '#fff',
                                        fontFamily: 'Orbitron, monospace',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                    }, children: ["\u4E3B\u97F3\u91CF\uFF1A", masterVolume, "%"] }), _jsx("input", { type: "range", min: "0", max: "100", value: masterVolume, onChange: (e) => handleSetMasterVolume(Number(e.target.value)), style: {
                                        width: '100%',
                                        height: '8px',
                                        borderRadius: '4px',
                                        background: 'rgba(0, 255, 255, 0.2)',
                                        outline: 'none',
                                        cursor: 'pointer',
                                    } })] }), _jsxs("div", { style: { marginBottom: '20px' }, children: [_jsxs("label", { style: {
                                        display: 'block',
                                        color: '#fff',
                                        fontFamily: 'Orbitron, monospace',
                                        marginBottom: '8px',
                                        fontSize: '14px',
                                    }, children: ["\u6E38\u620F\u97F3\u6548\uFF1A", gameVolume, "%"] }), _jsx("input", { type: "range", min: "0", max: "100", value: gameVolume, onChange: (e) => handleSetGameVolume(Number(e.target.value)), style: {
                                        width: '100%',
                                        height: '8px',
                                        borderRadius: '4px',
                                        background: 'rgba(0, 255, 255, 0.2)',
                                        outline: 'none',
                                        cursor: 'pointer',
                                    } })] }), _jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '25px',
                                padding: '15px',
                                background: 'rgba(0, 255, 255, 0.1)',
                                borderRadius: '8px',
                            }, children: [_jsx("span", { style: {
                                        color: '#fff',
                                        fontFamily: 'Orbitron, monospace',
                                        fontSize: '14px',
                                    }, children: "\uD83D\uDD07 \u9759\u97F3" }), _jsx("button", { onClick: handleToggleMute, style: {
                                        padding: '8px 20px',
                                        fontSize: '14px',
                                        background: isMuted ? 'rgba(255, 68, 68, 0.3)' : 'rgba(46, 204, 113, 0.3)',
                                        border: `2px solid ${isMuted ? '#ff4444' : '#2ecc71'}`,
                                        borderRadius: '8px',
                                        color: isMuted ? '#ff4444' : '#2ecc71',
                                        cursor: 'pointer',
                                        fontFamily: 'Orbitron, monospace',
                                        transition: 'all 0.3s',
                                    }, children: isMuted ? '已静音' : '开启' })] }), _jsxs("div", { style: {
                                display: 'flex',
                                gap: '10px',
                                flexWrap: 'wrap',
                                marginBottom: '25px',
                            }, children: [_jsx("button", { onClick: () => audioManager.playSound(SoundId.MOVE), style: {
                                        padding: '8px 15px',
                                        fontSize: '12px',
                                        background: 'rgba(0, 255, 255, 0.1)',
                                        border: '1px solid var(--neon-cyan, #00ffff)',
                                        borderRadius: '6px',
                                        color: 'var(--neon-cyan, #00ffff)',
                                        cursor: 'pointer',
                                        fontFamily: 'Orbitron, monospace',
                                    }, children: "\u6D4B\u8BD5\u79FB\u52A8" }), _jsx("button", { onClick: () => audioManager.playSound(SoundId.ROTATE), style: {
                                        padding: '8px 15px',
                                        fontSize: '12px',
                                        background: 'rgba(0, 255, 255, 0.1)',
                                        border: '1px solid var(--neon-cyan, #00ffff)',
                                        borderRadius: '6px',
                                        color: 'var(--neon-cyan, #00ffff)',
                                        cursor: 'pointer',
                                        fontFamily: 'Orbitron, monospace',
                                    }, children: "\u6D4B\u8BD5\u65CB\u8F6C" }), _jsx("button", { onClick: () => audioManager.playClearSound(1), style: {
                                        padding: '8px 15px',
                                        fontSize: '12px',
                                        background: 'rgba(0, 255, 255, 0.1)',
                                        border: '1px solid var(--neon-cyan, #00ffff)',
                                        borderRadius: '6px',
                                        color: 'var(--neon-cyan, #00ffff)',
                                        cursor: 'pointer',
                                        fontFamily: 'Orbitron, monospace',
                                    }, children: "\u6D4B\u8BD5\u6D88\u884C" })] }), _jsx("button", { onClick: () => setShowSettings(false), style: {
                                width: '100%',
                                padding: '12px',
                                fontSize: '16px',
                                background: 'rgba(0, 255, 255, 0.2)',
                                border: '2px solid var(--neon-cyan, #00ffff)',
                                borderRadius: '8px',
                                color: 'var(--neon-cyan, #00ffff)',
                                cursor: 'pointer',
                                fontFamily: 'Orbitron, monospace',
                                boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
                                transition: 'all 0.3s',
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.3)';
                                e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.6)';
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
                                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
                            }, children: "\u5173\u95ED" })] }) })), _jsx(GameStartCountdown, { visible: showCountdown, duration: 3, onComplete: handleCountdownComplete, onCancel: () => {
                    setShowCountdown(false);
                    setShowEnemySelect(true);
                } }), _jsx(GameEndModal, { visible: gameEndVisible, result: gameEndResult, onRetry: handleRestartGame, onNextLevel: handleNextLevel, onBackToTitle: handleBackToTitle })] }));
};
export default App;

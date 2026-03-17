import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==================== 游戏信息面板组件 ====================
import { useState, useEffect } from 'react';
import { GAME_CONFIG } from '../../config/game-config';
const GameInfo = ({ gameState }) => {
    if (!gameState)
        return null;
    // 检测移动端 - 使用 useState + useEffect 避免 SSR hydration 不匹配
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    // 根据方块类型获取卡牌数据
    const getCardData = (pieceType) => {
        return GAME_CONFIG.CARDS.find(card => card.id === pieceType);
    };
    // 移动端紧凑布局
    if (isMobile) {
        return (_jsxs("div", { style: {
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
            }, children: [gameState.nextPiece && (() => {
                    const cardData = getCardData(gameState.nextPiece.type);
                    const isSpecial = cardData?.type === 'special';
                    return (_jsxs("div", { style: {
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: isSpecial ? '2px solid var(--neon-pink)' : '1px solid var(--neon-cyan)',
                            borderRadius: '4px',
                            padding: '8px',
                            boxShadow: isSpecial ? '0 0 8px rgba(255, 105, 180, 0.4)' : '0 0 5px rgba(0, 255, 255, 0.2)',
                            minWidth: '80px',
                            maxWidth: '120px',
                        }, children: [_jsx("div", { style: { fontSize: '10px', color: 'var(--neon-cyan)', marginBottom: '5px', textAlign: 'center' }, children: "\u4E0B\u4E00\u4E2A" }), _jsx("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${gameState.nextPiece.shape[0].length}, 15px)`,
                                    gap: '1px',
                                    justifyContent: 'center',
                                    marginBottom: isSpecial ? '5px' : '0',
                                }, children: gameState.nextPiece.shape.map((row, rowIndex) => row.map((cell, colIndex) => (_jsx("div", { style: {
                                        width: '15px',
                                        height: '15px',
                                        background: cell ? gameState.nextPiece.color : 'transparent',
                                        borderRadius: '1px',
                                    } }, `${rowIndex}-${colIndex}`)))) }), isSpecial && cardData && (_jsxs("div", { style: { fontSize: '9px', color: '#fff', textAlign: 'center' }, children: [_jsx("div", { style: { fontWeight: 'bold', color: cardData.color, marginBottom: '2px' }, children: cardData.name }), _jsx("div", { style: { color: '#aaa', fontSize: '8px' }, children: cardData.desc })] }))] }));
                })(), _jsxs("div", { style: {
                        background: 'rgba(0, 0, 0, 0.6)',
                        border: '1px solid var(--neon-cyan)',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        boxShadow: '0 0 5px rgba(0, 255, 255, 0.2)',
                        minWidth: '70px',
                    }, children: [_jsx("div", { style: { fontSize: '10px', color: 'var(--neon-cyan)', marginBottom: '3px' }, children: "\u5206\u6570" }), _jsx("div", { style: { fontSize: '14px', color: 'var(--neon-yellow)', fontWeight: 'bold' }, children: gameState.score.toLocaleString() })] }), _jsxs("div", { style: {
                        background: 'rgba(0, 0, 0, 0.6)',
                        border: '1px solid var(--neon-cyan)',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        boxShadow: '0 0 5px rgba(0, 255, 255, 0.2)',
                        minWidth: '50px',
                    }, children: [_jsx("div", { style: { fontSize: '10px', color: 'var(--neon-cyan)', marginBottom: '3px' }, children: "\u6D88\u9664" }), _jsx("div", { style: { fontSize: '14px', color: 'var(--neon-yellow)', fontWeight: 'bold' }, children: gameState.lines })] }), _jsxs("div", { style: {
                        background: 'rgba(0, 0, 0, 0.6)',
                        border: '1px solid var(--neon-cyan)',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        boxShadow: '0 0 5px rgba(0, 255, 255, 0.2)',
                        minWidth: '40px',
                    }, children: [_jsx("div", { style: { fontSize: '10px', color: 'var(--neon-cyan)', marginBottom: '3px' }, children: "\u7B49\u7EA7" }), _jsx("div", { style: { fontSize: '14px', color: 'var(--neon-yellow)', fontWeight: 'bold' }, children: gameState.level })] }), gameState.gameOver && (_jsx("div", { style: {
                        background: 'rgba(255, 0, 0, 0.2)',
                        border: '2px solid var(--neon-pink)',
                        borderRadius: '4px',
                        padding: '8px',
                        textAlign: 'center',
                        width: '100%',
                    }, children: _jsx("div", { style: { fontSize: '14px', color: 'var(--neon-pink)', fontWeight: 'bold' }, children: "\u6E38\u620F\u7ED3\u675F" }) })), gameState.paused && !gameState.gameOver && (_jsx("div", { style: {
                        background: 'rgba(255, 255, 0, 0.2)',
                        border: '2px solid var(--neon-yellow)',
                        borderRadius: '4px',
                        padding: '8px',
                        textAlign: 'center',
                        width: '100%',
                    }, children: _jsx("div", { style: { fontSize: '14px', color: 'var(--neon-yellow)', fontWeight: 'bold' }, children: "\u5DF2\u6682\u505C" }) }))] }));
    }
    // 桌面端布局（保持不变）
    return (_jsxs("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            minWidth: '150px'
        }, children: [gameState.nextPiece && (() => {
                const cardData = getCardData(gameState.nextPiece.type);
                const isSpecial = cardData?.type === 'special';
                return (_jsxs("div", { style: {
                        background: 'rgba(0, 0, 0, 0.6)',
                        border: isSpecial ? '2px solid var(--neon-pink)' : '1px solid var(--neon-cyan)',
                        borderRadius: '4px',
                        padding: '15px',
                        boxShadow: isSpecial ? '0 0 15px rgba(255, 105, 180, 0.4)' : '0 0 10px rgba(0, 255, 255, 0.3)',
                    }, children: [_jsx("div", { style: { fontSize: '12px', color: 'var(--neon-cyan)', marginBottom: '10px' }, children: "\u4E0B\u4E00\u4E2A" }), _jsx("div", { style: {
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: '60px'
                            }, children: _jsx("svg", { width: "80", height: "60", style: { background: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px' }, children: gameState.nextPiece.shape.map((row, rowIndex) => (row.map((cell, colIndex) => {
                                    if (cell) {
                                        const previewSize = 20;
                                        return (_jsx("rect", { x: colIndex * previewSize + (80 - gameState.nextPiece.shape[0].length * previewSize) / 2, y: rowIndex * previewSize + (60 - gameState.nextPiece.shape.length * previewSize) / 2, width: previewSize - 2, height: previewSize - 2, fill: gameState.nextPiece.color, style: {
                                                filter: `drop-shadow(0 0 3px ${gameState.nextPiece.color})`,
                                            } }, `${rowIndex}-${colIndex}`));
                                    }
                                    return null;
                                }))) }) }), isSpecial && cardData && (_jsxs("div", { style: { marginTop: '10px', textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '13px', fontWeight: 'bold', color: cardData.color, marginBottom: '5px' }, children: cardData.name }), _jsx("div", { style: { fontSize: '11px', color: '#ccc' }, children: cardData.desc })] }))] }));
            })(), _jsxs("div", { style: {
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid var(--neon-cyan)',
                    borderRadius: '4px',
                    padding: '15px',
                    boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                }, children: [_jsx("div", { style: { fontSize: '12px', color: 'var(--neon-cyan)', marginBottom: '5px' }, children: "\u5206\u6570" }), _jsx("div", { style: { fontSize: '24px', color: 'var(--neon-yellow)', fontWeight: 'bold' }, children: gameState.score.toLocaleString() })] }), _jsxs("div", { style: {
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid var(--neon-cyan)',
                    borderRadius: '4px',
                    padding: '15px',
                    boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                }, children: [_jsx("div", { style: { fontSize: '12px', color: 'var(--neon-cyan)', marginBottom: '5px' }, children: "\u6D88\u9664\u884C\u6570" }), _jsx("div", { style: { fontSize: '24px', color: 'var(--neon-yellow)', fontWeight: 'bold' }, children: gameState.lines })] }), _jsxs("div", { style: {
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid var(--neon-cyan)',
                    borderRadius: '4px',
                    padding: '15px',
                    boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                }, children: [_jsx("div", { style: { fontSize: '12px', color: 'var(--neon-cyan)', marginBottom: '5px' }, children: "\u7B49\u7EA7" }), _jsx("div", { style: { fontSize: '24px', color: 'var(--neon-yellow)', fontWeight: 'bold' }, children: gameState.level })] }), gameState.gameOver && (_jsx("div", { style: {
                    background: 'rgba(255, 0, 0, 0.2)',
                    border: '2px solid var(--neon-pink)',
                    borderRadius: '4px',
                    padding: '15px',
                    textAlign: 'center',
                    boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)',
                }, children: _jsx("div", { style: { fontSize: '18px', color: 'var(--neon-pink)', fontWeight: 'bold' }, children: "\u6E38\u620F\u7ED3\u675F" }) })), gameState.paused && !gameState.gameOver && (_jsx("div", { style: {
                    background: 'rgba(255, 255, 0, 0.2)',
                    border: '2px solid var(--neon-yellow)',
                    borderRadius: '4px',
                    padding: '15px',
                    textAlign: 'center',
                    boxShadow: '0 0 20px rgba(255, 255, 0, 0.5)',
                }, children: _jsx("div", { style: { fontSize: '18px', color: 'var(--neon-yellow)', fontWeight: 'bold' }, children: "\u5DF2\u6682\u505C" }) }))] }));
};
export default GameInfo;

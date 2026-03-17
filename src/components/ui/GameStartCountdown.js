import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==================== 游戏开始倒计时组件 ====================
import { useEffect, useState, useCallback, useRef } from 'react';
const GameStartCountdown = ({ duration = 3, onComplete, onCancel, visible, }) => {
    const [count, setCount] = useState(duration);
    const intervalRef = useRef(null);
    // 清理定时器
    const clearInterval = useCallback(() => {
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);
    // 开始倒计时
    useEffect(() => {
        if (visible) {
            setCount(duration);
            intervalRef.current = window.setInterval(() => {
                setCount((prev) => {
                    const next = prev - 1;
                    if (next <= 0) {
                        clearInterval();
                        onComplete();
                        return 0;
                    }
                    return next;
                });
            }, 1000);
        }
        else {
            setCount(duration);
            clearInterval();
        }
        // 清理函数
        return () => {
            clearInterval();
        };
    }, [visible, duration, onComplete, clearInterval]);
    // 处理取消
    const handleCancel = useCallback(() => {
        clearInterval();
        if (onCancel) {
            onCancel();
        }
    }, [onCancel, clearInterval]);
    if (!visible)
        return null;
    return (_jsxs("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-out',
        }, onClick: handleCancel, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }, children: [_jsx("div", { style: {
                            fontSize: 'clamp(80px, 20vw, 200px)',
                            fontFamily: 'Orbitron, monospace',
                            fontWeight: 'bold',
                            color: 'var(--neon-cyan, #00ffff)',
                            textShadow: '0 0 20px var(--neon-cyan, #00ffff), 0 0 40px var(--neon-cyan, #00ffff), 0 0 60px var(--neon-cyan, #00ffff)',
                            animation: 'countdownPulse 1s ease-in-out infinite, countdownZoom 1s ease-out',
                            cursor: 'pointer',
                            userSelect: 'none',
                        }, children: count > 0 ? count : 'GO!' }), _jsxs("div", { style: {
                            padding: '20px 30px',
                            background: 'rgba(0, 255, 255, 0.1)',
                            border: '2px solid rgba(0, 255, 255, 0.5)',
                            borderRadius: '12px',
                            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
                            animation: 'fadeIn 0.5s ease-out',
                            textAlign: 'center',
                        }, children: [_jsx("div", { style: {
                                    fontSize: 'clamp(12px, 3vw, 16px)',
                                    color: 'var(--neon-cyan, #00ffff)',
                                    fontFamily: 'Orbitron, monospace',
                                    marginBottom: '10px',
                                    textShadow: '0 0 5px rgba(0, 255, 255, 0.5)',
                                }, children: "\uD83C\uDFAE \u64CD\u4F5C\u65B9\u5F0F" }), _jsxs("div", { style: {
                                    fontSize: 'clamp(11px, 2.5vw, 14px)',
                                    color: 'rgba(0, 255, 255, 0.8)',
                                    fontFamily: 'Orbitron, monospace',
                                    lineHeight: '1.8',
                                }, children: [_jsx("div", { children: "\u2190 \u2192 \u79FB\u52A8 | \u2191 \u65CB\u8F6C | \u2193 \u52A0\u901F" }), _jsx("div", { children: "\u7A7A\u683C \u786C\u964D | P \u6682\u505C" }), _jsx("div", { style: { marginTop: '8px', fontSize: 'clamp(10px, 2vw, 12px)', opacity: 0.7 }, children: "\uD83D\uDCF1 \u6ED1\u52A8\u63A7\u5236 | \u957F\u6309\u786C\u964D | \u70B9\u51FB\u65CB\u8F6C" })] })] })] }), _jsx("div", { style: {
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    right: '20px',
                    bottom: '20px',
                    border: '2px solid rgba(0, 255, 255, 0.3)',
                    borderRadius: '16px',
                    pointerEvents: 'none',
                    boxShadow: 'inset 0 0 40px rgba(0, 255, 255, 0.1)',
                } }), _jsx("div", { style: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    height: '80%',
                    border: '1px dashed rgba(0, 255, 255, 0.2)',
                    borderRadius: '12px',
                    pointerEvents: 'none',
                } }), _jsx("style", { children: `
        @keyframes countdownPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        
        @keyframes countdownZoom {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      ` })] }));
};
export default GameStartCountdown;

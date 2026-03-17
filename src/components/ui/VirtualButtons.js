import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==================== v1.9.3 长按硬降版虚拟按键组件 ====================
// 轻量级移动端控制组件 - 专注于核心功能
import { useCallback, useEffect, useRef, useState } from 'react';
import './VirtualButtons.css';
const VirtualButtons = ({ onMoveLeft, onMoveRight, onRotate, onSoftDrop, onHardDrop, disabled = false, size = 'medium', opacity = 0.9, longPressConfig = {}, }) => {
    const touchStartRef = useRef(null);
    const [activeButton, setActiveButton] = useState(null);
    const longPressTimerRef = useRef(null);
    const repeatIntervalRef = useRef(null);
    // v1.9.3 新增：长按硬降计时器
    const longPressHardDropTimerRef = useRef(null);
    const hardDropRepeatTimerRef = useRef(null);
    // v1.9.3 长按硬降配置（必须在 callbacks 之前定义）
    const LONG_PRESS_TRIGGER_TIME = longPressConfig.triggerTime ?? 300; // 默认 300ms
    const LONG_PRESS_REPEAT_INTERVAL = longPressConfig.repeatInterval ?? 200; // 默认 200ms
    const isLongPressEnabled = longPressConfig.enabled ?? true;
    const isRepeatEnabled = longPressConfig.repeatEnabled ?? true;
    // 触觉反馈
    const vibrate = useCallback((pattern = 10) => {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(pattern);
            }
            catch {
                // 忽略错误
            }
        }
    }, []);
    // 清理定时器（包括长按硬降定时器）
    const clearTimers = useCallback(() => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        if (repeatIntervalRef.current) {
            clearInterval(repeatIntervalRef.current);
            repeatIntervalRef.current = null;
        }
        // v1.9.3 新增：清理长按硬降定时器
        if (longPressHardDropTimerRef.current) {
            clearTimeout(longPressHardDropTimerRef.current);
            longPressHardDropTimerRef.current = null;
        }
        if (hardDropRepeatTimerRef.current) {
            clearInterval(hardDropRepeatTimerRef.current);
            hardDropRepeatTimerRef.current = null;
        }
    }, []);
    // 开始长按连发
    const startLongPress = useCallback((action, buttonId) => {
        if (disabled)
            return;
        setActiveButton(buttonId);
        vibrate(10);
        action();
        // 长按后开始连发
        longPressTimerRef.current = window.setTimeout(() => {
            action();
            repeatIntervalRef.current = window.setInterval(action, 100);
        }, 300);
    }, [disabled, vibrate]);
    // 释放按钮
    const endPress = useCallback(() => {
        clearTimers();
        setActiveButton(null);
    }, [clearTimers]);
    // 按钮按下处理
    const handlePressStart = useCallback((action, buttonId, enableRepeat = false) => {
        if (disabled)
            return;
        if (enableRepeat) {
            startLongPress(action, buttonId);
        }
        else {
            setActiveButton(buttonId);
            vibrate(10);
            action();
        }
    }, [disabled, startLongPress, vibrate]);
    // v1.9.3 触摸滑动处理（集成长按硬降）
    const handleTouchStart = useCallback((e) => {
        if (disabled)
            return;
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        // v1.9.3 新增：启动长按硬降计时器
        if (isLongPressEnabled) {
            longPressHardDropTimerRef.current = window.setTimeout(() => {
                vibrate([20, 10, 20]); // 硬降震动反馈
                onHardDrop();
                // v1.9.3 新增：长按连发
                if (isRepeatEnabled) {
                    hardDropRepeatTimerRef.current = window.setInterval(() => {
                        vibrate(10);
                        onHardDrop();
                    }, LONG_PRESS_REPEAT_INTERVAL);
                }
            }, LONG_PRESS_TRIGGER_TIME);
        }
    }, [disabled, isLongPressEnabled, isRepeatEnabled, vibrate, onHardDrop, LONG_PRESS_TRIGGER_TIME, LONG_PRESS_REPEAT_INTERVAL]);
    const handleTouchMove = useCallback((e) => {
        if (!touchStartRef.current || disabled)
            return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        e.preventDefault();
        // v1.9.3 优化：滑动时取消长按硬降
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            if (longPressHardDropTimerRef.current) {
                clearTimeout(longPressHardDropTimerRef.current);
                longPressHardDropTimerRef.current = null;
            }
            if (hardDropRepeatTimerRef.current) {
                clearInterval(hardDropRepeatTimerRef.current);
                hardDropRepeatTimerRef.current = null;
            }
        }
        if (Math.abs(deltaX) > 30) {
            deltaX > 0 ? onMoveRight() : onMoveLeft();
            vibrate(8);
            touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        }
        if (deltaY > 30) {
            onSoftDrop();
            vibrate(8);
            touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        }
    }, [disabled, onMoveLeft, onMoveRight, onSoftDrop, vibrate]);
    const handleTouchEnd = useCallback(() => {
        touchStartRef.current = null;
        // v1.9.3 新增：清理长按硬降定时器
        if (longPressHardDropTimerRef.current) {
            clearTimeout(longPressHardDropTimerRef.current);
            longPressHardDropTimerRef.current = null;
        }
        if (hardDropRepeatTimerRef.current) {
            clearInterval(hardDropRepeatTimerRef.current);
            hardDropRepeatTimerRef.current = null;
        }
    }, []);
    // 组件卸载时清理
    useEffect(() => {
        return () => clearTimers();
    }, [clearTimers]);
    // 按钮配置
    const buttons = [
        { id: 'left', label: '左移', icon: '⬅️', action: onMoveLeft, color: 'cyan', span: 1 },
        { id: 'rotate', label: '旋转', icon: '🔄', action: onRotate, color: 'pink', span: 1 },
        { id: 'right', label: '右移', icon: '➡️', action: onMoveRight, color: 'cyan', span: 1 },
        { id: 'softDrop', label: '软降', icon: '⬇️', action: onSoftDrop, color: 'green', span: 1 },
        { id: 'hardDrop', label: '硬降', icon: '💥', action: onHardDrop, color: 'orange', span: 1 },
    ];
    const colorClasses = {
        cyan: 'btn-cyan',
        pink: 'btn-pink',
        green: 'btn-green',
        orange: 'btn-orange',
    };
    return (_jsxs("div", { className: `virtual-buttons size-${size}`, style: { opacity }, children: [_jsx("div", { className: "touch-area", onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd, 
                // v1.9.3 移除 onClick，改为单击立即旋转
                onClick: () => {
                    if (!disabled) {
                        vibrate(10);
                        onRotate();
                    }
                }, children: _jsx("div", { className: "touch-hint", children: "\u6ED1\u52A8\u63A7\u5236 | \u957F\u6309\u786C\u964D" }) }), _jsx("div", { className: "button-row", children: buttons.slice(0, 3).map(btn => (_jsx("button", { className: `btn ${colorClasses[btn.color]} ${activeButton === btn.id ? 'active' : ''}`, onTouchStart: () => handlePressStart(btn.action, btn.id, btn.id === 'left' || btn.id === 'right'), onTouchEnd: endPress, onMouseDown: () => handlePressStart(btn.action, btn.id, btn.id === 'left' || btn.id === 'right'), onMouseUp: endPress, onMouseLeave: endPress, disabled: disabled, children: btn.icon }, btn.id))) }), _jsx("div", { className: "button-row", children: buttons.slice(3).map(btn => (_jsx("button", { className: `btn ${colorClasses[btn.color]} ${activeButton === btn.id ? 'active' : ''}`, onTouchStart: () => handlePressStart(btn.action, btn.id), onTouchEnd: endPress, onMouseDown: () => handlePressStart(btn.action, btn.id), onMouseUp: endPress, onMouseLeave: endPress, disabled: disabled, children: btn.icon }, btn.id))) })] }));
};
export default VirtualButtons;

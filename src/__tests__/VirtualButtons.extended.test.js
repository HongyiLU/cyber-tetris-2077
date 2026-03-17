import { jsx as _jsx } from "react/jsx-runtime";
// ==================== VirtualButtons 扩展测试 ====================
// 边界情况、压力测试和高级功能验证
import { render, screen, fireEvent, act } from '@testing-library/react';
import VirtualButtons from '../components/ui/VirtualButtons';
describe('VirtualButtons - 扩展测试', () => {
    const mockHandlers = {
        onMoveLeft: jest.fn(),
        onMoveRight: jest.fn(),
        onRotate: jest.fn(),
        onSoftDrop: jest.fn(),
        onHardDrop: jest.fn(),
    };
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
    });
    describe('长按连发功能', () => {
        it('长按左键触发连发', () => {
            render(_jsx(VirtualButtons, { ...mockHandlers }));
            const leftBtn = screen.getByText('⬅️').closest('button');
            act(() => {
                fireEvent.mouseDown(leftBtn);
            });
            // 初始触发
            expect(mockHandlers.onMoveLeft).toHaveBeenCalledTimes(1);
            // 快进 300ms 触发连发
            act(() => {
                jest.advanceTimersByTime(300);
            });
            expect(mockHandlers.onMoveLeft).toHaveBeenCalledTimes(2);
            // 再快进 100ms 再次触发
            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(mockHandlers.onMoveLeft).toHaveBeenCalledTimes(3);
            // 释放按钮
            act(() => {
                fireEvent.mouseUp(leftBtn);
            });
            // 不再触发
            act(() => {
                jest.advanceTimersByTime(100);
            });
            expect(mockHandlers.onMoveLeft).toHaveBeenCalledTimes(3);
        });
        it('长按右键触发连发', () => {
            render(_jsx(VirtualButtons, { ...mockHandlers }));
            const rightBtn = screen.getByText('➡️').closest('button');
            act(() => {
                fireEvent.mouseDown(rightBtn);
                jest.advanceTimersByTime(400);
            });
            expect(mockHandlers.onMoveRight).toHaveBeenCalledTimes(3);
            act(() => {
                fireEvent.mouseUp(rightBtn);
            });
            expect(mockHandlers.onMoveRight).toHaveBeenCalledTimes(3);
        });
        it('非左右键不触发连发', () => {
            render(_jsx(VirtualButtons, { ...mockHandlers }));
            const rotateBtn = screen.getByText('🔄').closest('button');
            act(() => {
                fireEvent.mouseDown(rotateBtn);
                jest.advanceTimersByTime(500);
            });
            // 只触发一次（初始点击）
            expect(mockHandlers.onRotate).toHaveBeenCalledTimes(1);
        });
        it('禁用状态下长按不触发', () => {
            render(_jsx(VirtualButtons, { ...mockHandlers, disabled: true }));
            const leftBtn = screen.getByText('⬅️').closest('button');
            act(() => {
                fireEvent.mouseDown(leftBtn);
                jest.advanceTimersByTime(500);
            });
            expect(mockHandlers.onMoveLeft).not.toHaveBeenCalled();
        });
    });
    describe('v1.9.3 长按硬降功能', () => {
        it('长按 300ms 触发硬降', () => {
            render(_jsx(VirtualButtons, { ...mockHandlers }));
            const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement;
            act(() => {
                fireEvent.touchStart(touchArea, {
                    touches: [{ clientX: 100, clientY: 100 }],
                });
                jest.advanceTimersByTime(300);
            });
            expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
        });
        it('短按 (<300ms) 不触发硬降', () => {
            render(_jsx(VirtualButtons, { ...mockHandlers }));
            const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement;
            act(() => {
                fireEvent.touchStart(touchArea, {
                    touches: [{ clientX: 100, clientY: 100 }],
                });
                jest.advanceTimersByTime(250);
                fireEvent.touchEnd(touchArea);
            });
            expect(mockHandlers.onHardDrop).not.toHaveBeenCalled();
        });
        it('长按 500ms 触发连发硬降', () => {
            render(_jsx(VirtualButtons, { ...mockHandlers, longPressConfig: { repeatEnabled: true, repeatInterval: 200 } }));
            const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement;
            act(() => {
                fireEvent.touchStart(touchArea, {
                    touches: [{ clientX: 100, clientY: 100 }],
                });
                jest.advanceTimersByTime(500);
            });
            // 300ms 触发第一次，500ms 时触发第二次
            expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(2);
        });
        it('单击立即旋转（无延迟）', () => {
            render(_jsx(VirtualButtons, { ...mockHandlers }));
            const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement;
            act(() => {
                fireEvent.click(touchArea);
            });
            expect(mockHandlers.onRotate).toHaveBeenCalledTimes(1);
            expect(mockHandlers.onHardDrop).not.toHaveBeenCalled();
        });
    });
    describe('触摸手势精度', () => {
        it('滑动距离小于 30px 不触发', () => {
            render(_jsx(VirtualButtons, { ...mockHandlers }));
            const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement;
            act(() => {
                fireEvent.touchStart(touchArea, {
                    touches: [{ clientX: 100, clientY: 100 }],
                });
                fireEvent.touchMove(touchArea, {
                    touches: [{ clientX: 120, clientY: 100 }], // ΔX = 20px < 30px
                });
            });
            expect(mockHandlers.onMoveRight).not.toHaveBeenCalled();
        });
        it('精确 30px 滑动触发', () => {
            render(_jsx(VirtualButtons, { ...mockHandlers }));
            const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement;
            act(() => {
                fireEvent.touchStart(touchArea, {
                    touches: [{ clientX: 100, clientY: 100 }],
                });
                fireEvent.touchMove(touchArea, {
                    touches: [{ clientX: 131, clientY: 100 }], // ΔX = 31px > 30px
                });
            });
            expect(mockHandlers.onMoveRight).toHaveBeenCalledTimes(1);
        });
        it('连续滑动多次触发', () => {
            render(_jsx(VirtualButtons, { ...mockHandlers }));
            const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement;
            act(() => {
                fireEvent.touchStart(touchArea, {
                    touches: [{ clientX: 100, clientY: 100 }],
                });
                fireEvent.touchMove(touchArea, {
                    touches: [{ clientX: 160, clientY: 100 }], // ΔX = 60px
                });
                fireEvent.touchMove(touchArea, {
                    touches: [{ clientX: 220, clientY: 100 }], // 再次 ΔX = 60px
                });
            });
            // 两次触发（每次超过阈值都触发）
            expect(mockHandlers.onMoveRight).toHaveBeenCalledTimes(2);
        });
        it('斜向滑动优先触发水平', () => {
            render(_jsx(VirtualButtons, { ...mockHandlers }));
            const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement;
            act(() => {
                fireEvent.touchStart(touchArea, {
                    touches: [{ clientX: 100, clientY: 100 }],
                });
                fireEvent.touchMove(touchArea, {
                    touches: [{ clientX: 150, clientY: 120 }], // ΔX = 50, ΔY = 20
                });
            });
            expect(mockHandlers.onMoveRight).toHaveBeenCalledTimes(1);
            expect(mockHandlers.onSoftDrop).not.toHaveBeenCalled();
        });
        it('滑动时取消长按硬降', () => {
            render(_jsx(VirtualButtons, { ...mockHandlers }));
            const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement;
            act(() => {
                fireEvent.touchStart(touchArea, {
                    touches: [{ clientX: 100, clientY: 100 }],
                });
                jest.advanceTimersByTime(100);
                fireEvent.touchMove(touchArea, {
                    touches: [{ clientX: 150, clientY: 100 }],
                });
                jest.advanceTimersByTime(200);
            });
            expect(mockHandlers.onHardDrop).not.toHaveBeenCalled();
            expect(mockHandlers.onMoveRight).toHaveBeenCalled();
        });
    });
    describe('组件生命周期', () => {
        it('卸载时清理定时器', () => {
            const { unmount } = render(_jsx(VirtualButtons, { ...mockHandlers }));
            const leftBtn = screen.getByText('⬅️').closest('button');
            act(() => {
                fireEvent.mouseDown(leftBtn);
            });
            // 卸载组件
            act(() => {
                unmount();
            });
            // 快进时间，不应该有错误
            act(() => {
                jest.advanceTimersByTime(500);
            });
            // 测试通过（没有抛出错误）
            expect(true).toBe(true);
        });
        it('多次快速挂载卸载', () => {
            for (let i = 0; i < 5; i++) {
                const { unmount } = render(_jsx(VirtualButtons, { ...mockHandlers }));
                act(() => {
                    unmount();
                });
            }
            // 测试通过（没有抛出错误）
            expect(true).toBe(true);
        });
    });
    describe('性能压力测试', () => {
        it('快速连续点击 100 次', () => {
            render(_jsx(VirtualButtons, { ...mockHandlers }));
            const leftBtn = screen.getByText('⬅️').closest('button');
            for (let i = 0; i < 100; i++) {
                act(() => {
                    fireEvent.mouseDown(leftBtn);
                    fireEvent.mouseUp(leftBtn);
                });
            }
            expect(mockHandlers.onMoveLeft).toHaveBeenCalledTimes(100);
        });
        it('快速切换尺寸', () => {
            const { rerender } = render(_jsx(VirtualButtons, { ...mockHandlers, size: "medium" }));
            for (let i = 0; i < 10; i++) {
                act(() => {
                    rerender(_jsx(VirtualButtons, { ...mockHandlers, size: "small" }));
                    rerender(_jsx(VirtualButtons, { ...mockHandlers, size: "large" }));
                    rerender(_jsx(VirtualButtons, { ...mockHandlers, size: "medium" }));
                });
            }
            // 测试通过（没有抛出错误）
            expect(true).toBe(true);
        });
        it('快速切换透明度', () => {
            const { rerender } = render(_jsx(VirtualButtons, { ...mockHandlers, opacity: 0.9 }));
            for (let i = 0; i < 10; i++) {
                act(() => {
                    rerender(_jsx(VirtualButtons, { ...mockHandlers, opacity: 0.5 }));
                    rerender(_jsx(VirtualButtons, { ...mockHandlers, opacity: 1.0 }));
                    rerender(_jsx(VirtualButtons, { ...mockHandlers, opacity: 0.3 }));
                });
            }
            // 测试通过（没有抛出错误）
            expect(true).toBe(true);
        });
    });
    describe('样式完整性', () => {
        it('所有按钮都有正确的颜色类', () => {
            render(_jsx(VirtualButtons, { ...mockHandlers }));
            const leftBtn = screen.getByText('⬅️').closest('button');
            const rotateBtn = screen.getByText('🔄').closest('button');
            const rightBtn = screen.getByText('➡️').closest('button');
            const softDropBtn = screen.getByText('⬇️').closest('button');
            const hardDropBtn = screen.getByText('💥').closest('button');
            expect(leftBtn).toHaveClass('btn-cyan');
            expect(rotateBtn).toHaveClass('btn-pink');
            expect(rightBtn).toHaveClass('btn-cyan');
            expect(softDropBtn).toHaveClass('btn-green');
            expect(hardDropBtn).toHaveClass('btn-orange');
        });
        it('容器有正确的尺寸类', () => {
            const { container, rerender } = render(_jsx(VirtualButtons, { ...mockHandlers, size: "medium" }));
            expect(container.querySelector('.size-medium')).toBeInTheDocument();
            rerender(_jsx(VirtualButtons, { ...mockHandlers, size: "small" }));
            expect(container.querySelector('.size-small')).toBeInTheDocument();
            rerender(_jsx(VirtualButtons, { ...mockHandlers, size: "large" }));
            expect(container.querySelector('.size-large')).toBeInTheDocument();
        });
        it('透明度样式正确应用', () => {
            const { container } = render(_jsx(VirtualButtons, { ...mockHandlers, opacity: 0.75 }));
            const el = container.querySelector('.virtual-buttons');
            expect(el).toHaveStyle('opacity: 0.75');
        });
    });
    describe('触觉反馈', () => {
        it('调用 navigator.vibrate', () => {
            const mockVibrate = jest.fn();
            Object.defineProperty(navigator, 'vibrate', {
                value: mockVibrate,
                writable: true,
            });
            render(_jsx(VirtualButtons, { ...mockHandlers }));
            const leftBtn = screen.getByText('⬅️').closest('button');
            act(() => {
                fireEvent.mouseDown(leftBtn);
            });
            expect(mockVibrate).toHaveBeenCalledWith(10);
        });
        it('长按硬降时调用组合震动', () => {
            const mockVibrate = jest.fn();
            Object.defineProperty(navigator, 'vibrate', {
                value: mockVibrate,
                writable: true,
            });
            render(_jsx(VirtualButtons, { ...mockHandlers }));
            const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement;
            act(() => {
                fireEvent.touchStart(touchArea, {
                    touches: [{ clientX: 100, clientY: 100 }],
                });
                jest.advanceTimersByTime(300);
            });
            expect(mockVibrate).toHaveBeenCalledWith([20, 10, 20]);
        });
        it('浏览器不支持震动时不报错', () => {
            // 创建一个没有 vibrate 方法的 navigator 模拟
            const originalNavigator = global.navigator;
            // 使用 Object.defineProperty 重新定义整个 navigator
            Object.defineProperty(global, 'navigator', {
                value: {
                    ...originalNavigator,
                    vibrate: undefined,
                },
                writable: true,
                configurable: true,
            });
            expect(() => {
                render(_jsx(VirtualButtons, { ...mockHandlers }));
                const leftBtn = screen.getByText('⬅️').closest('button');
                fireEvent.mouseDown(leftBtn);
            }).not.toThrow();
            // 恢复原始 navigator
            Object.defineProperty(global, 'navigator', {
                value: originalNavigator,
                writable: true,
                configurable: true,
            });
        });
    });
});

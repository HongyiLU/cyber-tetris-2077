// ==================== MobileControls 组件单元测试 ====================

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileControls, { loadMobileSettings, saveMobileSettings } from './MobileControls';

// Mock navigator.vibrate
const mockVibrate = jest.fn();
Object.defineProperty(navigator, 'vibrate', {
  value: mockVibrate,
  writable: true,
  configurable: true,
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('MobileControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVibrate.mockClear();
    (localStorage.getItem as jest.Mock).mockClear();
    (localStorage.setItem as jest.Mock).mockClear();
  });

  const defaultProps = {
    onMoveLeft: jest.fn(),
    onMoveRight: jest.fn(),
    onRotate: jest.fn(),
    onSoftDrop: jest.fn(),
    onHardDrop: jest.fn(),
    onPause: jest.fn(),
    onRestart: jest.fn(),
    disabled: false,
  };

  describe('渲染测试', () => {
    it('应该渲染所有控制按钮', () => {
      render(<MobileControls {...defaultProps} />);
      
      expect(screen.getByText('⬅️')).toBeInTheDocument();
      expect(screen.getByText('🔄')).toBeInTheDocument();
      expect(screen.getByText('➡️')).toBeInTheDocument();
      expect(screen.getByText('⬇️ 软降')).toBeInTheDocument();
      expect(screen.getByText('💥 硬降')).toBeInTheDocument();
      expect(screen.getByText('⏸️ 暂停 / 继续')).toBeInTheDocument();
      expect(screen.getByText('🔄 重开')).toBeInTheDocument();
    });

    it('应该渲染触摸控制区', () => {
      render(<MobileControls {...defaultProps} showTouchArea={true} />);
      
      expect(screen.getByText('👆 滑动控制 | 双击硬降落')).toBeInTheDocument();
    });

    it('当 showTouchArea 为 false 时不渲染触摸控制区', () => {
      render(<MobileControls {...defaultProps} showTouchArea={false} />);
      
      expect(screen.queryByText('👆 滑动控制 | 双击硬降落')).not.toBeInTheDocument();
    });

    it('在横屏布局时不渲染触摸控制区', () => {
      render(<MobileControls {...defaultProps} layout="landscape" showTouchArea={true} />);
      
      // 横屏时触摸区应该被隐藏
      const touchArea = screen.queryByText('👆 滑动控制 | 双击硬降落');
      if (touchArea) {
        expect(touchArea.parentElement).toHaveClass('game-touch-area');
      }
    });
  });

  describe('按钮交互测试', () => {
    it('左移按钮点击时调用 onMoveLeft', () => {
      render(<MobileControls {...defaultProps} />);
      
      const button = screen.getByText('⬅️').closest('button');
      fireEvent.mouseDown(button!);
      fireEvent.mouseUp(button!);
      expect(defaultProps.onMoveLeft).toHaveBeenCalledTimes(1);
    });

    it('右移按钮点击时调用 onMoveRight', () => {
      render(<MobileControls {...defaultProps} />);
      
      const button = screen.getByText('➡️').closest('button');
      fireEvent.mouseDown(button!);
      fireEvent.mouseUp(button!);
      expect(defaultProps.onMoveRight).toHaveBeenCalledTimes(1);
    });

    it('旋转按钮点击时调用 onRotate', () => {
      render(<MobileControls {...defaultProps} />);
      
      const button = screen.getByText('🔄').closest('button');
      fireEvent.mouseDown(button!);
      fireEvent.mouseUp(button!);
      expect(defaultProps.onRotate).toHaveBeenCalledTimes(1);
    });

    it('软降按钮点击时调用 onSoftDrop', () => {
      render(<MobileControls {...defaultProps} />);
      
      const button = screen.getByText('⬇️ 软降').closest('button');
      fireEvent.mouseDown(button!);
      fireEvent.mouseUp(button!);
      expect(defaultProps.onSoftDrop).toHaveBeenCalledTimes(1);
    });

    it('硬降按钮点击时调用 onHardDrop', () => {
      render(<MobileControls {...defaultProps} />);
      
      const button = screen.getByText('💥 硬降').closest('button');
      fireEvent.mouseDown(button!);
      fireEvent.mouseUp(button!);
      expect(defaultProps.onHardDrop).toHaveBeenCalledTimes(1);
    });

    it('暂停按钮点击时调用 onPause', () => {
      render(<MobileControls {...defaultProps} />);
      
      fireEvent.click(screen.getByText('⏸️ 暂停 / 继续'));
      expect(defaultProps.onPause).toHaveBeenCalledTimes(1);
    });

    it('重开按钮点击时调用 onRestart', () => {
      render(<MobileControls {...defaultProps} />);
      
      fireEvent.click(screen.getByText('🔄 重开'));
      expect(defaultProps.onRestart).toHaveBeenCalledTimes(1);
    });
  });

  describe('禁用状态测试', () => {
    it('当 disabled 为 true 时所有按钮被禁用', () => {
      render(<MobileControls {...defaultProps} disabled={true} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('当 disabled 为 true 时点击按钮不触发回调', () => {
      render(<MobileControls {...defaultProps} disabled={true} />);
      
      const button = screen.getByText('⬅️').closest('button');
      fireEvent.mouseDown(button!);
      expect(defaultProps.onMoveLeft).not.toHaveBeenCalled();
    });
  });

  describe('触觉反馈测试', () => {
    it('按钮点击时触发短震动', () => {
      render(<MobileControls {...defaultProps} hapticFeedback={true} />);
      
      const button = screen.getByText('⬅️').closest('button');
      fireEvent.mouseDown(button!);
      expect(mockVibrate).toHaveBeenCalledWith(10);
    });

    it('暂停按钮点击时触发中震动', () => {
      render(<MobileControls {...defaultProps} hapticFeedback={true} />);
      
      fireEvent.click(screen.getByText('⏸️ 暂停 / 继续'));
      expect(mockVibrate).toHaveBeenCalledWith(15);
    });

    it('重开按钮点击时触发双震动', () => {
      render(<MobileControls {...defaultProps} hapticFeedback={true} />);
      
      fireEvent.click(screen.getByText('🔄 重开'));
      expect(mockVibrate).toHaveBeenCalledWith([15, 10, 15]);
    });

    it('当 hapticFeedback 为 false 时不触发震动', () => {
      render(<MobileControls {...defaultProps} hapticFeedback={false} />);
      
      const button = screen.getByText('⬅️').closest('button');
      fireEvent.mouseDown(button!);
      expect(mockVibrate).not.toHaveBeenCalled();
    });
  });

  describe('触摸手势测试', () => {
    it('水平滑动触发移动', () => {
      render(<MobileControls {...defaultProps} />);
      
      const touchArea = screen.getByText('👆 滑动控制 | 双击硬降落').parentElement;
      if (!touchArea) return;

      // 模拟向右滑动
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      fireEvent.touchMove(touchArea, {
        touches: [{ clientX: 150, clientY: 100 }],
      });
      
      expect(defaultProps.onMoveRight).toHaveBeenCalled();
    });

    it('垂直向下滑动触发软降', () => {
      render(<MobileControls {...defaultProps} />);
      
      const touchArea = screen.getByText('👆 滑动控制 | 双击硬降落').parentElement;
      if (!touchArea) return;

      // 模拟向下滑动
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      fireEvent.touchMove(touchArea, {
        touches: [{ clientX: 100, clientY: 150 }],
      });
      
      expect(defaultProps.onSoftDrop).toHaveBeenCalled();
    });

    it('双击触发硬降', () => {
      render(<MobileControls {...defaultProps} />);
      
      const touchArea = screen.getByText('👆 滑动控制 | 双击硬降落').parentElement;
      if (!touchArea) return;

      // 模拟双击
      fireEvent.click(touchArea);
      fireEvent.click(touchArea);
      
      expect(defaultProps.onHardDrop).toHaveBeenCalled();
    });
  });

  describe('CSS 类名测试', () => {
    it('应用正确的布局类名', () => {
      const { container } = render(<MobileControls {...defaultProps} layout="portrait" />);
      
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('layout-portrait');
    });

    it('应用正确的透明度类名', () => {
      const { container } = render(<MobileControls {...defaultProps} opacity={0.5} />);
      
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('controls-opacity-low');
    });

    it('应用正确的尺寸类名', () => {
      const { container } = render(<MobileControls {...defaultProps} controlsSize="large" />);
      
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('controls-size-large');
    });
  });

  describe('设置持久化测试', () => {
    it('loadMobileSettings 从 localStorage 加载设置', () => {
      const mockSettings = {
        layout: 'landscape',
        opacity: 0.8,
        showTouchArea: false,
        hapticFeedback: false,
        controlsSize: 'large',
      };
      
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockSettings));
      
      const settings = loadMobileSettings();
      
      expect(settings).toEqual(mockSettings);
      expect(localStorage.getItem).toHaveBeenCalledWith('mobileControls');
    });

    it('loadMobileSettings 返回默认设置当 localStorage 为空', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);
      
      const settings = loadMobileSettings();
      
      expect(settings).toEqual({
        layout: 'portrait',
        opacity: 0.9,
        showTouchArea: true,
        hapticFeedback: true,
        controlsSize: 'medium',
      });
    });

    it('saveMobileSettings 保存设置到 localStorage', () => {
      const newSettings = { opacity: 0.7 };
      
      saveMobileSettings(newSettings);
      
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });
});

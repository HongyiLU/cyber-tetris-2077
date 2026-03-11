// ==================== MobileControls 组件测试 ====================

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MobileControls from '../components/ui/MobileControls';

describe('MobileControls', () => {
  const mockHandlers = {
    onMoveLeft: jest.fn(),
    onMoveRight: jest.fn(),
    onRotate: jest.fn(),
    onSoftDrop: jest.fn(),
    onHardDrop: jest.fn(),
    onPause: jest.fn(),
    onRestart: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('渲染所有方向按钮', () => {
    render(<MobileControls {...mockHandlers} />);
    
    expect(screen.getByText('⬅️')).toBeInTheDocument();
    expect(screen.getByText('🔄')).toBeInTheDocument();
    expect(screen.getByText('➡️')).toBeInTheDocument();
  });

  it('渲染降落按钮', () => {
    render(<MobileControls {...mockHandlers} />);
    
    expect(screen.getByText('⬇️ 软降')).toBeInTheDocument();
    expect(screen.getByText('💥 硬降')).toBeInTheDocument();
  });

  it('渲染暂停按钮', () => {
    render(<MobileControls {...mockHandlers} />);
    
    expect(screen.getByText('⏸️ 暂停')).toBeInTheDocument();
  });

  it('渲染重开按钮（当提供 onRestart 时）', () => {
    render(<MobileControls {...mockHandlers} />);
    
    expect(screen.getByText('🔄 重开')).toBeInTheDocument();
  });

  it('不渲染重开按钮（当未提供 onRestart 时）', () => {
    const { onRestart, ...handlers } = mockHandlers;
    render(<MobileControls {...handlers} />);
    
    expect(screen.queryByText('🔄 重开')).not.toBeInTheDocument();
  });

  it('渲染触摸提示', () => {
    render(<MobileControls {...mockHandlers} />);
    
    expect(screen.getByText('滑动控制 | 长按硬降')).toBeInTheDocument();
  });

  it('点击左移按钮触发回调', () => {
    render(<MobileControls {...mockHandlers} />);
    
    const button = screen.getByText('⬅️').closest('button') as HTMLButtonElement;
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    expect(mockHandlers.onMoveLeft).toHaveBeenCalled();
  });

  it('点击右移按钮触发回调', () => {
    render(<MobileControls {...mockHandlers} />);
    
    const button = screen.getByText('➡️').closest('button') as HTMLButtonElement;
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    expect(mockHandlers.onMoveRight).toHaveBeenCalled();
  });

  it('点击旋转按钮触发回调', () => {
    render(<MobileControls {...mockHandlers} />);
    
    const button = screen.getByText('🔄').closest('button') as HTMLButtonElement;
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    expect(mockHandlers.onRotate).toHaveBeenCalled();
  });

  it('点击软降按钮触发回调', () => {
    render(<MobileControls {...mockHandlers} />);
    
    const button = screen.getByText('⬇️ 软降').closest('button') as HTMLButtonElement;
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    expect(mockHandlers.onSoftDrop).toHaveBeenCalled();
  });

  it('点击硬降按钮触发回调', () => {
    render(<MobileControls {...mockHandlers} />);
    
    const button = screen.getByText('💥 硬降').closest('button') as HTMLButtonElement;
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    expect(mockHandlers.onHardDrop).toHaveBeenCalled();
  });

  it('点击暂停按钮触发回调', () => {
    render(<MobileControls {...mockHandlers} />);
    
    const button = screen.getByText('⏸️ 暂停').closest('button') as HTMLButtonElement;
    fireEvent.click(button);
    expect(mockHandlers.onPause).toHaveBeenCalled();
  });

  it('点击重开按钮触发回调', () => {
    render(<MobileControls {...mockHandlers} />);
    
    const button = screen.getByText('🔄 重开').closest('button') as HTMLButtonElement;
    fireEvent.click(button);
    expect(mockHandlers.onRestart).toHaveBeenCalled();
  });

  it('disabled 状态下按钮不触发回调', () => {
    render(<MobileControls {...mockHandlers} disabled />);
    
    const button = screen.getByText('⬅️').closest('button') as HTMLButtonElement;
    fireEvent.mouseDown(button);
    expect(mockHandlers.onMoveLeft).not.toHaveBeenCalled();
  });

  it('应用正确的尺寸类名', () => {
    const { container: small } = render(<MobileControls {...mockHandlers} size="small" />);
    expect(small.querySelector('.size-small')).toBeInTheDocument();

    const { container: medium } = render(<MobileControls {...mockHandlers} size="medium" />);
    expect(medium.querySelector('.size-medium')).toBeInTheDocument();

    const { container: large } = render(<MobileControls {...mockHandlers} size="large" />);
    expect(large.querySelector('.size-large')).toBeInTheDocument();
  });

  it('应用正确的透明度', () => {
    const { container } = render(<MobileControls {...mockHandlers} opacity={0.7} />);
    const el = container.querySelector('.mobile-controls');
    expect(el).toHaveStyle('opacity: 0.7');
  });

  it('触摸区域存在', () => {
    render(<MobileControls {...mockHandlers} />);
    
    expect(screen.getByText('滑动控制 | 长按硬降').parentElement).toHaveClass('touch-area');
  });

  it('按钮按下时添加 active 类', async () => {
    render(<MobileControls {...mockHandlers} />);
    
    const button = screen.getByText('⬅️').closest('button') as HTMLButtonElement;
    fireEvent.mouseDown(button);
    await waitFor(() => {
      expect(button).toHaveClass('active');
    });
  });

  it('鼠标离开按钮时清理状态', async () => {
    render(<MobileControls {...mockHandlers} />);
    
    const button = screen.getByText('⬅️').closest('button') as HTMLButtonElement;
    fireEvent.mouseDown(button);
    fireEvent.mouseLeave(button);
    await waitFor(() => {
      expect(button).not.toHaveClass('active');
    });
  });

  // ==================== v1.9.3 长按硬降功能测试 ====================

  describe('v1.9.3 长按硬降功能', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('短按（<300ms）不触发硬降', () => {
      render(<MobileControls {...mockHandlers} />);
      
      const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
      
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      jest.advanceTimersByTime(250);
      fireEvent.touchEnd(touchArea);
      
      expect(mockHandlers.onHardDrop).not.toHaveBeenCalled();
    });

    it('长按 300ms 触发硬降', () => {
      render(<MobileControls {...mockHandlers} />);
      
      const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
      
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      jest.advanceTimersByTime(300);
      
      expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
    });

    it('长按 500ms 触发连发硬降', () => {
      render(<MobileControls {...mockHandlers} longPressConfig={{ repeatEnabled: true, repeatInterval: 200 }} />);
      
      const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
      
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      jest.advanceTimersByTime(300);
      expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(200);
      expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(2);
      
      jest.advanceTimersByTime(200);
      expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(3);
    });

    it('松开手指停止连发', () => {
      render(<MobileControls {...mockHandlers} longPressConfig={{ repeatEnabled: true, repeatInterval: 200 }} />);
      
      const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
      
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      jest.advanceTimersByTime(300);
      expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(200);
      expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(2);
      
      fireEvent.touchEnd(touchArea);
      
      jest.advanceTimersByTime(200);
      expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(2);
    });

    it('滑动时取消长按硬降', () => {
      render(<MobileControls {...mockHandlers} />);
      
      const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
      
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      jest.advanceTimersByTime(100);
      
      fireEvent.touchMove(touchArea, {
        touches: [{ clientX: 150, clientY: 100 }],
      });
      
      jest.advanceTimersByTime(200);
      
      expect(mockHandlers.onHardDrop).not.toHaveBeenCalled();
      expect(mockHandlers.onMoveRight).toHaveBeenCalled();
    });

    it('单击立即旋转（无延迟）', () => {
      render(<MobileControls {...mockHandlers} />);
      
      const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
      
      fireEvent.click(touchArea);
      
      expect(mockHandlers.onRotate).toHaveBeenCalledTimes(1);
    });

    it('自定义长按触发时间 200ms', () => {
      render(<MobileControls {...mockHandlers} longPressConfig={{ triggerTime: 200 }} />);
      
      const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
      
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      jest.advanceTimersByTime(200);
      
      expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
    });

    it('自定义长按触发时间 500ms', () => {
      render(<MobileControls {...mockHandlers} longPressConfig={{ triggerTime: 500 }} />);
      
      const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
      
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      jest.advanceTimersByTime(300);
      expect(mockHandlers.onHardDrop).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(200);
      expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
    });

    it('自定义连发间隔 100ms', () => {
      render(<MobileControls {...mockHandlers} longPressConfig={{ repeatEnabled: true, repeatInterval: 100 }} />);
      
      const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
      
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      jest.advanceTimersByTime(300);
      expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(100);
      expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(2);
    });

    it('禁用长按硬降', () => {
      render(<MobileControls {...mockHandlers} longPressConfig={{ enabled: false }} />);
      
      const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
      
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      jest.advanceTimersByTime(1000);
      
      expect(mockHandlers.onHardDrop).not.toHaveBeenCalled();
    });

    it('禁用连发功能', () => {
      render(<MobileControls {...mockHandlers} longPressConfig={{ repeatEnabled: false }} />);
      
      const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
      
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      jest.advanceTimersByTime(300);
      expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(1000);
      expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
    });

    it('快速连续单击只触发旋转', () => {
      render(<MobileControls {...mockHandlers} />);
      
      const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
      
      fireEvent.click(touchArea);
      fireEvent.click(touchArea);
      fireEvent.click(touchArea);
      
      expect(mockHandlers.onRotate).toHaveBeenCalledTimes(3);
      expect(mockHandlers.onHardDrop).not.toHaveBeenCalled();
    });

    it('组件卸载时清理计时器', () => {
      const { unmount } = render(<MobileControls {...mockHandlers} longPressConfig={{ repeatEnabled: true }} />);
      
      const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
      
      fireEvent.touchStart(touchArea, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      jest.advanceTimersByTime(300);
      
      unmount();
      
      expect(() => {
        jest.advanceTimersByTime(200);
      }).not.toThrow();
    });
  });
  // ==================== v1.9.3 测试结束 ====================
});

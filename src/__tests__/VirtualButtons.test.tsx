// ==================== VirtualButtons 组件测试 ====================

import { render, screen, fireEvent } from '@testing-library/react';
import VirtualButtons from '../components/ui/VirtualButtons';

describe('VirtualButtons', () => {
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

  it('渲染所有按钮', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    expect(screen.getByText('⬅️')).toBeInTheDocument();
    expect(screen.getByText('🔄')).toBeInTheDocument();
    expect(screen.getByText('➡️')).toBeInTheDocument();
    expect(screen.getByText('⬇️')).toBeInTheDocument();
    expect(screen.getByText('💥')).toBeInTheDocument();
  });

  it('渲染触摸提示', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    expect(screen.getByText('滑动控制 | 长按硬降')).toBeInTheDocument();
  });

  it('点击左移按钮触发回调', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const button = screen.getByText('⬅️').closest('button') as HTMLButtonElement;
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    expect(mockHandlers.onMoveLeft).toHaveBeenCalledTimes(1);
  });

  it('点击右移按钮触发回调', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const button = screen.getByText('➡️').closest('button') as HTMLButtonElement;
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    expect(mockHandlers.onMoveRight).toHaveBeenCalledTimes(1);
  });

  it('点击旋转按钮触发回调', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const button = screen.getByText('🔄').closest('button') as HTMLButtonElement;
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    expect(mockHandlers.onRotate).toHaveBeenCalledTimes(1);
  });

  it('点击软降按钮触发回调', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const softDropBtn = screen.getByText('⬇️').closest('button') as HTMLButtonElement;
    fireEvent.mouseDown(softDropBtn);
    fireEvent.mouseUp(softDropBtn);
    expect(mockHandlers.onSoftDrop).toHaveBeenCalledTimes(1);
  });

  it('点击硬降按钮触发回调', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const hardDropBtn = screen.getByText('💥').closest('button') as HTMLButtonElement;
    fireEvent.mouseDown(hardDropBtn);
    fireEvent.mouseUp(hardDropBtn);
    expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
  });

  it('disabled 状态下按钮不触发回调', () => {
    render(<VirtualButtons {...mockHandlers} disabled />);
    
    const button = screen.getByText('⬅️').closest('button') as HTMLButtonElement;
    fireEvent.click(button);
    expect(mockHandlers.onMoveLeft).not.toHaveBeenCalled();
  });

  it('应用正确的尺寸类名', () => {
    const { container: small } = render(<VirtualButtons {...mockHandlers} size="small" />);
    expect(small.querySelector('.size-small')).toBeInTheDocument();

    const { container: medium } = render(<VirtualButtons {...mockHandlers} size="medium" />);
    expect(medium.querySelector('.size-medium')).toBeInTheDocument();

    const { container: large } = render(<VirtualButtons {...mockHandlers} size="large" />);
    expect(large.querySelector('.size-large')).toBeInTheDocument();
  });

  it('应用正确的透明度', () => {
    const { container } = render(<VirtualButtons {...mockHandlers} opacity={0.7} />);
    const el = container.querySelector('.virtual-buttons');
    expect(el).toHaveStyle('opacity: 0.7');
  });

  it('触摸开始事件设置起始点', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement;
    fireEvent.touchStart(touchArea!, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
  });

  it('水平滑动触发移动', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement;
    
    fireEvent.touchStart(touchArea!, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    
    fireEvent.touchMove(touchArea!, {
      touches: [{ clientX: 150, clientY: 100 }],
    });
    
    expect(mockHandlers.onMoveRight).toHaveBeenCalled();
  });

  it('垂直滑动触发软降', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement;
    
    fireEvent.touchStart(touchArea!, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    
    fireEvent.touchMove(touchArea!, {
      touches: [{ clientX: 100, clientY: 150 }],
    });
    
    expect(mockHandlers.onSoftDrop).toHaveBeenCalled();
  });

  it('单击触发旋转', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement;
    
    fireEvent.click(touchArea!);
    
    expect(mockHandlers.onRotate).toHaveBeenCalled();
  });

  it('长按触发硬降', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
    
    // 模拟触摸开始
    fireEvent.touchStart(touchArea, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    
    // 等待 300ms 后触发硬降
    jest.advanceTimersByTime(300);
    
    expect(mockHandlers.onHardDrop).toHaveBeenCalled();
  });

  // ==================== v1.9.3 长按硬降功能测试 ====================

  it('v1.9.3 - 短按（<300ms）不触发硬降', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
    
    fireEvent.touchStart(touchArea, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    
    // 只等待 250ms 就松开
    jest.advanceTimersByTime(250);
    fireEvent.touchEnd(touchArea);
    
    expect(mockHandlers.onHardDrop).not.toHaveBeenCalled();
  });

  it('v1.9.3 - 长按 300ms 触发硬降', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
    
    fireEvent.touchStart(touchArea, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    
    jest.advanceTimersByTime(300);
    
    expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
  });

  it('v1.9.3 - 长按 500ms 触发连发硬降', () => {
    render(<VirtualButtons {...mockHandlers} longPressConfig={{ repeatEnabled: true, repeatInterval: 200 }} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
    
    fireEvent.touchStart(touchArea, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    
    // 300ms 触发第一次硬降
    jest.advanceTimersByTime(300);
    expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
    
    // 再等 200ms 触发连发
    jest.advanceTimersByTime(200);
    expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(2);
    
    // 再等 200ms 再次连发
    jest.advanceTimersByTime(200);
    expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(3);
  });

  it('v1.9.3 - 松开手指停止连发', () => {
    render(<VirtualButtons {...mockHandlers} longPressConfig={{ repeatEnabled: true, repeatInterval: 200 }} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
    
    fireEvent.touchStart(touchArea, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    
    // 300ms 触发第一次硬降
    jest.advanceTimersByTime(300);
    expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
    
    // 再等 200ms 触发连发
    jest.advanceTimersByTime(200);
    expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(2);
    
    // 松开手指
    fireEvent.touchEnd(touchArea);
    
    // 再等 200ms，不应该继续连发
    jest.advanceTimersByTime(200);
    expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(2);
  });

  it('v1.9.3 - 滑动时取消长按硬降', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
    
    fireEvent.touchStart(touchArea, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    
    // 等待 100ms 后滑动
    jest.advanceTimersByTime(100);
    
    fireEvent.touchMove(touchArea, {
      touches: [{ clientX: 150, clientY: 100 }],
    });
    
    // 即使再过 200ms 达到 300ms，也不应该触发硬降
    jest.advanceTimersByTime(200);
    
    expect(mockHandlers.onHardDrop).not.toHaveBeenCalled();
    expect(mockHandlers.onMoveRight).toHaveBeenCalled();
  });

  it('v1.9.3 - 单击立即旋转（无延迟）', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
    
    fireEvent.click(touchArea);
    
    expect(mockHandlers.onRotate).toHaveBeenCalledTimes(1);
  });

  it('v1.9.3 - 自定义长按触发时间 200ms', () => {
    render(<VirtualButtons {...mockHandlers} longPressConfig={{ triggerTime: 200 }} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
    
    fireEvent.touchStart(touchArea, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    
    // 200ms 触发硬降
    jest.advanceTimersByTime(200);
    
    expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
  });

  it('v1.9.3 - 自定义长按触发时间 500ms', () => {
    render(<VirtualButtons {...mockHandlers} longPressConfig={{ triggerTime: 500 }} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
    
    fireEvent.touchStart(touchArea, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    
    // 300ms 时不应该触发
    jest.advanceTimersByTime(300);
    expect(mockHandlers.onHardDrop).not.toHaveBeenCalled();
    
    // 500ms 时才触发
    jest.advanceTimersByTime(200);
    expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
  });

  it('v1.9.3 - 自定义连发间隔 100ms', () => {
    render(<VirtualButtons {...mockHandlers} longPressConfig={{ repeatEnabled: true, repeatInterval: 100 }} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
    
    fireEvent.touchStart(touchArea, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    
    // 300ms 触发第一次
    jest.advanceTimersByTime(300);
    expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
    
    // 100ms 后触发连发
    jest.advanceTimersByTime(100);
    expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(2);
  });

  it('v1.9.3 - 禁用长按硬降', () => {
    render(<VirtualButtons {...mockHandlers} longPressConfig={{ enabled: false }} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
    
    fireEvent.touchStart(touchArea, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    
    // 即使等待很久也不触发
    jest.advanceTimersByTime(1000);
    
    expect(mockHandlers.onHardDrop).not.toHaveBeenCalled();
  });

  it('v1.9.3 - 禁用连发功能', () => {
    render(<VirtualButtons {...mockHandlers} longPressConfig={{ repeatEnabled: false }} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
    
    fireEvent.touchStart(touchArea, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    
    // 300ms 触发第一次
    jest.advanceTimersByTime(300);
    expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
    
    // 再等很久也不连发
    jest.advanceTimersByTime(1000);
    expect(mockHandlers.onHardDrop).toHaveBeenCalledTimes(1);
  });

  it('v1.9.3 - 快速连续单击只触发旋转', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
    
    // 快速点击 3 次
    fireEvent.click(touchArea);
    fireEvent.click(touchArea);
    fireEvent.click(touchArea);
    
    expect(mockHandlers.onRotate).toHaveBeenCalledTimes(3);
    expect(mockHandlers.onHardDrop).not.toHaveBeenCalled();
  });

  it('v1.9.3 - 组件卸载时清理计时器', () => {
    const { unmount } = render(<VirtualButtons {...mockHandlers} longPressConfig={{ repeatEnabled: true }} />);
    
    const touchArea = screen.getByText('滑动控制 | 长按硬降').parentElement!;
    
    fireEvent.touchStart(touchArea, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    
    // 等待 300ms 触发硬降
    jest.advanceTimersByTime(300);
    
    // 卸载组件
    unmount();
    
    // 不应该有错误抛出
    expect(() => {
      jest.advanceTimersByTime(200);
    }).not.toThrow();
  });

  // ==================== v1.9.3 测试结束 ====================

  it('按钮按下时添加 active 类', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const button = screen.getByText('⬅️').closest('button') as HTMLButtonElement;
    
    fireEvent.mouseDown(button);
    expect(button).toHaveClass('active');
    
    fireEvent.mouseUp(button);
    expect(button).not.toHaveClass('active');
  });

  it('鼠标离开按钮时清理状态', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const button = screen.getByText('⬅️').closest('button') as HTMLButtonElement;
    
    fireEvent.mouseDown(button);
    fireEvent.mouseLeave(button);
    expect(button).not.toHaveClass('active');
  });
});

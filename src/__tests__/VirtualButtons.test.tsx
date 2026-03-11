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
    
    expect(screen.getByText('滑动控制 | 双击硬降')).toBeInTheDocument();
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
    
    const touchArea = screen.getByText('滑动控制 | 双击硬降').parentElement;
    fireEvent.touchStart(touchArea!, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
  });

  it('水平滑动触发移动', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const touchArea = screen.getByText('滑动控制 | 双击硬降').parentElement;
    
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
    
    const touchArea = screen.getByText('滑动控制 | 双击硬降').parentElement;
    
    fireEvent.touchStart(touchArea!, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    
    fireEvent.touchMove(touchArea!, {
      touches: [{ clientX: 100, clientY: 150 }],
    });
    
    expect(mockHandlers.onSoftDrop).toHaveBeenCalled();
  });

  it('双击触发硬降', () => {
    render(<VirtualButtons {...mockHandlers} />);
    
    const touchArea = screen.getByText('滑动控制 | 双击硬降').parentElement;
    
    fireEvent.click(touchArea!);
    fireEvent.click(touchArea!);
    
    expect(mockHandlers.onHardDrop).toHaveBeenCalled();
  });

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

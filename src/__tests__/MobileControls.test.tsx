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
    
    expect(screen.getByText('滑动控制 | 双击硬降')).toBeInTheDocument();
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
    
    expect(screen.getByText('滑动控制 | 双击硬降').parentElement).toHaveClass('touch-area');
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
});

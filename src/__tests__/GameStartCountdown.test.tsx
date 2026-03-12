// ==================== GameStartCountdown 组件测试 ====================

import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameStartCountdown from '../components/ui/GameStartCountdown';

describe('GameStartCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    // Don't call cleanup here - let it run automatically
  });

  // 测试 1: 不显示时渲染 null
  test('renders null when not visible', () => {
    const { container } = render(
      <GameStartCountdown
        visible={false}
        onComplete={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  // 测试 2: 显示时渲染倒计时容器
  test('renders countdown container when visible', () => {
    render(
      <GameStartCountdown
        visible={true}
        duration={3}
        onComplete={() => {}}
      />
    );
    const countdownElement = screen.getByText('3');
    expect(countdownElement).toBeInTheDocument();
  });

  // 测试 3: 显示正确的初始倒计时数字
  test('displays correct initial countdown number', () => {
    render(
      <GameStartCountdown
        visible={true}
        duration={5}
        onComplete={() => {}}
      />
    );
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  // 测试 4: 默认持续时间为 3 秒
  test('uses default duration of 3 seconds', () => {
    render(
      <GameStartCountdown
        visible={true}
        onComplete={() => {}}
      />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  // 测试 5: 倒计时递减到 2
  test('countdown decrements to 2', async () => {
    render(
      <GameStartCountdown
        visible={true}
        duration={3}
        onComplete={() => {}}
      />
    );
    
    // 前进 1 秒
    jest.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  // 测试 6: 倒计时递减到 1
  test('countdown decrements to 1', async () => {
    render(
      <GameStartCountdown
        visible={true}
        duration={3}
        onComplete={() => {}}
      />
    );
    
    // 前进 2 秒
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  // 测试 7: 倒计时完成时调用 onComplete
  test('calls onComplete when countdown reaches 0', async () => {
    const onCompleteMock = jest.fn();
    render(
      <GameStartCountdown
        visible={true}
        duration={3}
        onComplete={onCompleteMock}
      />
    );
    
    // 前进 3 秒
    jest.advanceTimersByTime(3000);
    
    await waitFor(() => {
      expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
  });

  // 测试 8: 倒计时结束时显示 GO!
  test('displays GO! when countdown completes', async () => {
    render(
      <GameStartCountdown
        visible={true}
        duration={3}
        onComplete={() => {}}
      />
    );
    
    // 前进 3 秒
    jest.advanceTimersByTime(3000);
    
    await waitFor(() => {
      expect(screen.getByText('GO!')).toBeInTheDocument();
    });
  });

  // 测试 9: 点击时调用 onCancel
  test('calls onCancel when clicked', () => {
    const onCancelMock = jest.fn();
    render(
      <GameStartCountdown
        visible={true}
        duration={3}
        onComplete={() => {}}
        onCancel={onCancelMock}
      />
    );
    
    // 点击倒计时
    screen.getByText('3').click();
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  // 测试 10: 点击后隐藏倒计时
  test('hides countdown after click', () => {
    const { rerender } = render(
      <GameStartCountdown
        visible={true}
        duration={3}
        onComplete={() => {}}
        onCancel={() => {}}
      />
    );
    
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // 模拟 visible 变为 false
    rerender(
      <GameStartCountdown
        visible={false}
        duration={3}
        onComplete={() => {}}
        onCancel={() => {}}
      />
    );
    
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  // 测试 11: 应用正确的赛博朋克样式
  test('applies cyberpunk styling', () => {
    render(
      <GameStartCountdown
        visible={true}
        duration={3}
        onComplete={() => {}}
      />
    );
    
    const countdownElement = screen.getByText('3');
    expect(countdownElement).toHaveStyle('font-family: Orbitron, monospace');
    expect(countdownElement).toHaveStyle('font-weight: bold');
  });

  // 测试 12: 容器具有正确的 z-index
  test('container has correct z-index', () => {
    render(
      <GameStartCountdown
        visible={true}
        duration={3}
        onComplete={() => {}}
      />
    );
    
    const container = screen.getByText('3').parentElement;
    expect(container).toHaveStyle('z-index: 3000');
  });

  // 测试 13: 自定义持续时间
  test('respects custom duration', () => {
    render(
      <GameStartCountdown
        visible={true}
        duration={10}
        onComplete={() => {}}
      />
    );
    
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  // 测试 14: 倒计时过程中 visible 变为 false 时停止
  test('stops countdown when visible becomes false', () => {
    const onCompleteMock = jest.fn();
    const { rerender } = render(
      <GameStartCountdown
        visible={true}
        duration={3}
        onComplete={onCompleteMock}
      />
    );
    
    // 前进 1 秒
    jest.advanceTimersByTime(1000);
    
    // 设置 visible 为 false
    rerender(
      <GameStartCountdown
        visible={false}
        duration={3}
        onComplete={onCompleteMock}
      />
    );
    
    // 再前进 5 秒
    jest.advanceTimersByTime(5000);
    
    expect(onCompleteMock).not.toHaveBeenCalled();
  });

  // 测试 15: 组件在 visible=false 时不渲染
  test('does not render when visible is false', () => {
    const { container } = render(
      <GameStartCountdown
        visible={false}
        duration={3}
        onComplete={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  // 测试 16: 装饰元素存在
  test('renders decorative elements', () => {
    render(
      <GameStartCountdown
        visible={true}
        duration={3}
        onComplete={() => {}}
      />
    );
    
    const container = screen.getByText('3').parentElement;
    // 应该至少有装饰边框
    expect(container?.querySelector('div')).toBeInTheDocument();
  });

  // 测试 17: 响应式字体大小
  test('has responsive font size', () => {
    render(
      <GameStartCountdown
        visible={true}
        duration={3}
        onComplete={() => {}}
      />
    );
    
    const countdownElement = screen.getByText('3');
    expect(countdownElement).toHaveStyle('font-size: clamp(80px, 20vw, 200px)');
  });

  // 测试 18: 文本阴影效果
  test('has neon text shadow', () => {
    render(
      <GameStartCountdown
        visible={true}
        duration={3}
        onComplete={() => {}}
      />
    );
    
    const countdownElement = screen.getByText('3');
    expect(countdownElement).toHaveStyle('text-shadow: 0 0 20px var(--neon-cyan, #00ffff), 0 0 40px var(--neon-cyan, #00ffff), 0 0 60px var(--neon-cyan, #00ffff)');
  });

  // 测试 19: 背景半透明
  test('has semi-transparent background', () => {
    render(
      <GameStartCountdown
        visible={true}
        duration={3}
        onComplete={() => {}}
      />
    );
    
    const container = screen.getByText('3').parentElement;
    expect(container).toHaveStyle('background: rgba(0, 0, 0, 0.85)');
  });

  // 测试 20: 点击可取消
  test('is clickable for cancellation', () => {
    render(
      <GameStartCountdown
        visible={true}
        duration={3}
        onComplete={() => {}}
        onCancel={() => {}}
      />
    );
    
    const countdownElement = screen.getByText('3');
    expect(countdownElement).toHaveStyle('cursor: pointer');
  });

  // 测试 21: 防止文本选择
  test('prevents text selection', () => {
    render(
      <GameStartCountdown
        visible={true}
        duration={3}
        onComplete={() => {}}
      />
    );
    
    const countdownElement = screen.getByText('3');
    expect(countdownElement).toHaveStyle('user-select: none');
  });

  // 测试 22: 倒计时从正确数字开始
  test('starts countdown from specified duration', () => {
    const { rerender } = render(
      <GameStartCountdown
        visible={true}
        duration={7}
        onComplete={() => {}}
      />
    );
    
    expect(screen.getByText('7')).toBeInTheDocument();
    
    // 重新渲染，改变 duration
    rerender(
      <GameStartCountdown
        visible={true}
        duration={2}
        onComplete={() => {}}
      />
    );
    
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

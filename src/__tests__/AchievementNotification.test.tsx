/**
 * AchievementNotification 组件测试
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { AchievementNotification } from '../components/ui/AchievementNotification';

describe('AchievementNotification', () => {
  const mockAchievement = {
    id: 'test_achievement',
    name: '测试成就',
    description: '这是一个测试成就',
    goldReward: 100,
    icon: '🏆',
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not render when achievement is null', () => {
    const { container } = render(
      <AchievementNotification
        achievement={null}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render when visible is false', () => {
    const { container } = render(
      <AchievementNotification
        achievement={mockAchievement}
        visible={false}
        onClose={mockOnClose}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render achievement information when visible', () => {
    render(
      <AchievementNotification
        achievement={mockAchievement}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('成就解锁!')).toBeInTheDocument();
    expect(screen.getByText('测试成就')).toBeInTheDocument();
    expect(screen.getByText('这是一个测试成就')).toBeInTheDocument();
    expect(screen.getByText('💰 奖励：100 金币')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <AchievementNotification
        achievement={mockAchievement}
        visible={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /关闭通知/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should auto-close after 3 seconds', () => {
    render(
      <AchievementNotification
        achievement={mockAchievement}
        visible={true}
        onClose={mockOnClose}
      />
    );

    act(() => {
      // 3 秒显示
      jest.advanceTimersByTime(3000);
    });

    // 触发 transitionend 事件完成关闭动画
    const notification = screen.getByRole('alertdialog').querySelector('.achievement-notification');
    if (notification) {
      fireEvent.transitionEnd(notification);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should start with slide-in animation', () => {
    const { container } = render(
      <AchievementNotification
        achievement={mockAchievement}
        visible={true}
        onClose={mockOnClose}
      />
    );

    const notification = container.querySelector('.achievement-notification');
    expect(notification).toHaveClass('slide-in');
  });

  it('should apply slide-out animation before closing', () => {
    const { container } = render(
      <AchievementNotification
        achievement={mockAchievement}
        visible={true}
        onClose={mockOnClose}
      />
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    const notification = container.querySelector('.achievement-notification');
    expect(notification).toHaveClass('slide-out');
  });

  it('should close on Escape key press', () => {
    render(
      <AchievementNotification
        achievement={mockAchievement}
        visible={true}
        onClose={mockOnClose}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should clear timer on unmount', () => {
    const { unmount } = render(
      <AchievementNotification
        achievement={mockAchievement}
        visible={true}
        onClose={mockOnClose}
      />
    );

    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('should use default icon if not provided', () => {
    const achievementWithoutIcon = {
      ...mockAchievement,
      icon: undefined,
    };

    render(
      <AchievementNotification
        achievement={achievementWithoutIcon}
        visible={true}
        onClose={mockOnClose}
      />
    );

    // Should show default emoji 🏅
    const iconElement = screen.getByText('🏅');
    expect(iconElement).toBeInTheDocument();
  });

  it('should show custom icon when provided', () => {
    const achievementWithCustomIcon = {
      ...mockAchievement,
      icon: '🎉',
    };

    render(
      <AchievementNotification
        achievement={achievementWithCustomIcon}
        visible={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('🎉')).toBeInTheDocument();
  });
});

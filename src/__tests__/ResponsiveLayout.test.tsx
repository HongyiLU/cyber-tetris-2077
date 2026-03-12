// ==================== ResponsiveLayout 组件单元测试 ====================

import React from 'react';
import { render, screen } from '@testing-library/react';
import ResponsiveLayout from '../components/ui/ResponsiveLayout';

// Mock window.innerWidth
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

// Mock touch support
const mockTouchSupport = (hasTouch: boolean) => {
  if (hasTouch) {
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: () => {},
    });
  } else {
    delete (window as any).ontouchstart;
  }
};

describe('ResponsiveLayout', () => {
  beforeEach(() => {
    // 重置所有 mock
    mockInnerWidth(1024);
    mockTouchSupport(false);
  });

  describe('移动端布局', () => {
    test('移动端游戏画布最大宽度应为 360px', () => {
      // 模拟移动端环境
      mockInnerWidth(375);
      mockTouchSupport(true);

      const { container } = render(
        <ResponsiveLayout showGameArea={true} gameCanvas={<div data-testid="game-canvas">Game</div>}>
          <div>Menu</div>
        </ResponsiveLayout>
      );

      // 查找游戏画布容器
      const canvasContainer = container.querySelector('div[style*="max-width: 360px"]');
      expect(canvasContainer).toBeInTheDocument();
    });

    test('移动端布局容器最大宽度应为 500px', () => {
      // 模拟移动端环境
      mockInnerWidth(375);
      mockTouchSupport(true);

      const { container } = render(
        <ResponsiveLayout showGameArea={true} gameCanvas={<div data-testid="game-canvas">Game</div>}>
          <div>Menu</div>
        </ResponsiveLayout>
      );

      // 查找布局容器（应该包含 500px 的 maxWidth）
      const layoutContainers = container.querySelectorAll('div[style*="max-width"]');
      const has500pxContainer = Array.from(layoutContainers).some(div =>
        div.getAttribute('style')?.includes('500px')
      );
      
      expect(has500pxContainer).toBe(true);
    });

    test('移动端主菜单容器最大宽度应为 500px', () => {
      // 模拟移动端环境
      mockInnerWidth(375);
      mockTouchSupport(true);

      const { container } = render(
        <ResponsiveLayout showGameArea={false}>
          <div data-testid="menu-content">Menu</div>
        </ResponsiveLayout>
      );

      // 查找主菜单容器
      const menuContainers = container.querySelectorAll('div[style*="max-width"]');
      const has500pxMenuContainer = Array.from(menuContainers).some(div =>
        div.getAttribute('style')?.includes('500px')
      );
      
      expect(has500pxMenuContainer).toBe(true);
    });

    test('移动端游戏区域正确显示游戏画布', () => {
      // 模拟移动端环境
      mockInnerWidth(375);
      mockTouchSupport(true);

      render(
        <ResponsiveLayout showGameArea={true} gameCanvas={<div data-testid="game-canvas">Game Canvas</div>}>
          <div>Menu</div>
        </ResponsiveLayout>
      );

      const gameCanvas = screen.getByTestId('game-canvas');
      expect(gameCanvas).toBeInTheDocument();
    });
  });

  describe('桌面端布局', () => {
    test('桌面端布局不受移动端优化影响', () => {
      // 模拟桌面端环境
      mockInnerWidth(1920);
      mockTouchSupport(false);

      const { container } = render(
        <ResponsiveLayout showGameArea={false}>
          <div data-testid="desktop-content">Desktop Content</div>
        </ResponsiveLayout>
      );

      // 桌面端应该使用 flex column 布局，居中显示
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveStyle('display: flex');
      expect(mainContainer).toHaveStyle('flex-direction: column');
      expect(mainContainer).toHaveStyle('align-items: center');
      expect(mainContainer).toHaveStyle('justify-content: center');
    });

    test('桌面端不应用移动端特定的 maxWidth 限制', () => {
      // 模拟桌面端环境
      mockInnerWidth(1920);
      mockTouchSupport(false);

      const { container } = render(
        <ResponsiveLayout showGameArea={true} gameCanvas={<div data-testid="game-canvas">Game</div>}>
          <div>Content</div>
        </ResponsiveLayout>
      );

      // 桌面端容器不应该有 360px 或 500px 的限制
      const containers = container.querySelectorAll('div');
      const hasMobileMaxWidth = Array.from(containers).some(div =>
        div.getAttribute('style')?.match(/max-width:\s*'(360|500)px'/)
      );
      
      expect(hasMobileMaxWidth).toBe(false);
    });
  });

  describe('游戏区域显示逻辑', () => {
    test('showGameArea=false 时显示主菜单内容', () => {
      mockInnerWidth(375);
      
      render(
        <ResponsiveLayout showGameArea={false}>
          <div data-testid="menu-content">Main Menu</div>
        </ResponsiveLayout>
      );

      expect(screen.getByTestId('menu-content')).toBeInTheDocument();
      expect(screen.queryByTestId('game-canvas')).not.toBeInTheDocument();
    });

    test('showGameArea=true 时显示游戏区域', () => {
      mockInnerWidth(375);
      
      render(
        <ResponsiveLayout 
          showGameArea={true} 
          gameCanvas={<div data-testid="game-canvas">Game</div>}
          gameInfo={<div data-testid="game-info">Info</div>}
        >
          <div data-testid="menu-content">Menu</div>
        </ResponsiveLayout>
      );

      expect(screen.getByTestId('game-canvas')).toBeInTheDocument();
      expect(screen.getByTestId('game-info')).toBeInTheDocument();
      // 主菜单内容在 showGameArea=true 时不显示
      expect(screen.queryByTestId('menu-content')).not.toBeInTheDocument();
    });

    test('游戏画布和游戏信息都应用相同的 maxWidth 限制', () => {
      mockInnerWidth(375);
      mockTouchSupport(true);

      const { container } = render(
        <ResponsiveLayout 
          showGameArea={true} 
          gameCanvas={<div data-testid="game-canvas">Game</div>}
          gameInfo={<div data-testid="game-info">Info</div>}
        >
          <div>Content</div>
        </ResponsiveLayout>
      );

      // 查找所有应用了 360px maxWidth 的容器
      const canvasContainers = container.querySelectorAll('div[style*="max-width: 360px"]');
      // 应该至少有两个容器（游戏画布和游戏信息）
      expect(canvasContainers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('响应式检测', () => {
    test('窗口宽度小于 768px 时识别为移动端', () => {
      mockInnerWidth(767);
      
      const { container } = render(
        <ResponsiveLayout showGameArea={false}>
          <div>Content</div>
        </ResponsiveLayout>
      );

      // 移动端应该使用 column 布局
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveStyle('flex-direction: column');
    });

    test('有触摸支持时识别为移动端', () => {
      mockInnerWidth(1024);
      mockTouchSupport(true);
      
      const { container } = render(
        <ResponsiveLayout showGameArea={false}>
          <div>Content</div>
        </ResponsiveLayout>
      );

      // 有触摸支持应该使用移动端布局
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveStyle('flex-direction: column');
    });
  });
});

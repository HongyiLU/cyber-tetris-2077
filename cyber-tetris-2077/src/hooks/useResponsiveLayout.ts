import { useState, useEffect } from 'react';

export interface ResponsiveLayoutConfig {
  columns: number;
  cardSize: 'small' | 'medium' | 'large';
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}

export interface ResponsiveLayoutOptions {
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
}

const defaultOptions: ResponsiveLayoutOptions = {
  mobileColumns: 3,
  tabletColumns: 5,
  desktopColumns: 8,
  mobileBreakpoint: 640,
  tabletBreakpoint: 1024,
};

/**
 * 响应式布局 Hook
 * 根据屏幕宽度自动调整列数和卡片尺寸
 * 
 * @param options 配置选项
 * @returns 响应式布局配置
 */
export const useResponsiveLayout = (
  options: ResponsiveLayoutOptions = {}
): ResponsiveLayoutConfig => {
  const config = { ...defaultOptions, ...options };
  const [layout, setLayout] = useState<ResponsiveLayoutConfig>({
    columns: config.desktopColumns!,
    cardSize: 'medium',
    breakpoint: 'desktop',
  });

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      let newLayout: ResponsiveLayoutConfig;

      if (width < config.mobileBreakpoint!) {
        // 移动端
        newLayout = {
          columns: config.mobileColumns!,
          cardSize: 'small',
          breakpoint: 'mobile',
        };
      } else if (width < config.tabletBreakpoint!) {
        // 平板端
        newLayout = {
          columns: config.tabletColumns!,
          cardSize: 'medium',
          breakpoint: 'tablet',
        };
      } else {
        // 桌面端
        newLayout = {
          columns: config.desktopColumns!,
          cardSize: 'medium',
          breakpoint: 'desktop',
        };
      }

      setLayout(newLayout);
    };

    // 初始设置
    updateLayout();

    // 监听窗口大小变化（带防抖）
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(updateLayout, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    config.mobileColumns,
    config.tabletColumns,
    config.desktopColumns,
    config.mobileBreakpoint,
    config.tabletBreakpoint,
  ]);

  return layout;
};

/**
 * 获取当前断点
 */
export const getBreakpoint = (width: number): 'mobile' | 'tablet' | 'desktop' => {
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * 根据断点获取推荐的列数
 */
export const getRecommendedColumns = (breakpoint: 'mobile' | 'tablet' | 'desktop'): number => {
  switch (breakpoint) {
    case 'mobile':
      return 3;
    case 'tablet':
      return 5;
    case 'desktop':
      return 8;
  }
};

/**
 * 根据断点获取推荐的卡片尺寸
 */
export const getRecommendedCardSize = (
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): 'small' | 'medium' | 'large' => {
  switch (breakpoint) {
    case 'mobile':
      return 'small';
    case 'tablet':
      return 'medium';
    case 'desktop':
      return 'medium';
  }
};

export default useResponsiveLayout;

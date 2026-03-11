// ==================== 移动端布局检测 Hook ====================

import { useState, useEffect } from 'react';

export type MobileLayout = 'portrait' | 'landscape' | 'tablet';

export interface UseMobileLayoutReturn {
  layout: MobileLayout;
  isMobile: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  isTablet: boolean;
  controlsSize: 'small' | 'medium' | 'large';
  screenWidth: number;
  screenHeight: number;
}

/**
 * 移动端布局检测 Hook
 * 
 * 自动检测屏幕方向、设备类型，推荐合适的控件尺寸
 */
export function useMobileLayout(): UseMobileLayoutReturn {
  const [layout, setLayout] = useState<MobileLayout>('portrait');
  const [isMobile, setIsMobile] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setScreenWidth(width);
      setScreenHeight(height);
      setIsMobile(width < 768 || isTouch);
      
      if (width < 768) {
        // 移动设备
        if (height > width) {
          setLayout('portrait');
        } else {
          setLayout('landscape');
        }
      } else {
        // 平板/桌面
        setLayout('tablet');
      }
    };

    // 初始检测
    updateLayout();

    // 监听窗口大小变化
    window.addEventListener('resize', updateLayout);
    
    // 监听方向变化
    window.addEventListener('orientationchange', updateLayout);

    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
    };
  }, []);

  // 根据屏幕宽度推荐控件尺寸
  const controlsSize: 'small' | 'medium' | 'large' = (() => {
    if (screenWidth < 360) return 'small';
    if (screenWidth < 768) return 'medium';
    return 'large';
  })();

  return {
    layout,
    isMobile,
    isPortrait: layout === 'portrait',
    isLandscape: layout === 'landscape',
    isTablet: layout === 'tablet',
    controlsSize,
    screenWidth,
    screenHeight,
  };
}

/**
 * 快速检测设备类型
 */
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'phone' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      if (width < 768 && isTouch) {
        setDeviceType('phone');
      } else if (width < 1024 && isTouch) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  return deviceType;
}

/**
 * 检测是否为横屏模式
 */
export function useIsLandscape(): boolean {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return isLandscape;
}

/**
 * 检测是否为触摸设备
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
}

export default useMobileLayout;

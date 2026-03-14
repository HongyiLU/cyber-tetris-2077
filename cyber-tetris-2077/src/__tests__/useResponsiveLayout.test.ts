import { renderHook, act } from '@testing-library/react';
import { useResponsiveLayout, getBreakpoint, getRecommendedColumns, getRecommendedCardSize } from '../hooks/useResponsiveLayout';

// Mock window.innerWidth
const mockWindowWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

// Enable fake timers for debounce testing
beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe('useResponsiveLayout', () => {
  beforeEach(() => {
    mockWindowWidth(1200); // Default to desktop
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('移动端布局 (< 640px)', () => {
    it('应该返回移动端配置当屏幕宽度 < 640px', () => {
      mockWindowWidth(375); // iPhone width
      
      const { result } = renderHook(() => useResponsiveLayout());
      
      expect(result.current).toEqual({
        columns: 3,
        cardSize: 'small',
        breakpoint: 'mobile',
      });
    });

    it('应该返回移动端配置当屏幕宽度 = 639px', () => {
      mockWindowWidth(639);
      
      const { result } = renderHook(() => useResponsiveLayout());
      
      expect(result.current.breakpoint).toBe('mobile');
      expect(result.current.cardSize).toBe('small');
    });

    it('应该使用自定义移动端列数', () => {
      mockWindowWidth(400);
      
      const { result } = renderHook(() =>
        useResponsiveLayout({ mobileColumns: 2 })
      );
      
      expect(result.current.columns).toBe(2);
    });
  });

  describe('平板端布局 (640px - 1024px)', () => {
    it('应该返回平板端配置当屏幕宽度在 640px - 1024px 之间', () => {
      mockWindowWidth(768); // iPad width
      
      const { result } = renderHook(() => useResponsiveLayout());
      
      expect(result.current).toEqual({
        columns: 5,
        cardSize: 'medium',
        breakpoint: 'tablet',
      });
    });

    it('应该返回平板端配置当屏幕宽度 = 640px', () => {
      mockWindowWidth(640);
      
      const { result } = renderHook(() => useResponsiveLayout());
      
      expect(result.current.breakpoint).toBe('tablet');
      expect(result.current.cardSize).toBe('medium');
    });

    it('应该返回平板端配置当屏幕宽度 = 1023px', () => {
      mockWindowWidth(1023);
      
      const { result } = renderHook(() => useResponsiveLayout());
      
      expect(result.current.breakpoint).toBe('tablet');
    });

    it('应该使用自定义平板端列数', () => {
      mockWindowWidth(800);
      
      const { result } = renderHook(() =>
        useResponsiveLayout({ tabletColumns: 4 })
      );
      
      expect(result.current.columns).toBe(4);
    });
  });

  describe('桌面端布局 (> 1024px)', () => {
    it('应该返回桌面端配置当屏幕宽度 > 1024px', () => {
      mockWindowWidth(1440);
      
      const { result } = renderHook(() => useResponsiveLayout());
      
      expect(result.current).toEqual({
        columns: 8,
        cardSize: 'medium',
        breakpoint: 'desktop',
      });
    });

    it('应该返回桌面端配置当屏幕宽度 = 1024px', () => {
      mockWindowWidth(1024);
      
      const { result } = renderHook(() => useResponsiveLayout());
      
      expect(result.current.breakpoint).toBe('desktop');
      expect(result.current.cardSize).toBe('medium');
    });

    it('应该返回桌面端配置当屏幕宽度 = 1920px', () => {
      mockWindowWidth(1920);
      
      const { result } = renderHook(() => useResponsiveLayout());
      
      expect(result.current.breakpoint).toBe('desktop');
      expect(result.current.columns).toBe(8);
    });

    it('应该使用自定义桌面端列数', () => {
      mockWindowWidth(1600);
      
      const { result } = renderHook(() =>
        useResponsiveLayout({ desktopColumns: 10 })
      );
      
      expect(result.current.columns).toBe(10);
    });
  });

  describe('响应式更新', () => {
    it('应该更新布局当窗口大小改变', () => {
      mockWindowWidth(1200);
      
      const { result } = renderHook(() => useResponsiveLayout());
      
      expect(result.current.breakpoint).toBe('desktop');
      
      // 改变窗口大小到平板并等待防抖
      act(() => {
        mockWindowWidth(800);
        window.dispatchEvent(new Event('resize'));
        jest.advanceTimersByTime(150);
      });
      
      expect(result.current.breakpoint).toBe('tablet');
      
      // 改变窗口大小到手机并等待防抖
      act(() => {
        mockWindowWidth(400);
        window.dispatchEvent(new Event('resize'));
        jest.advanceTimersByTime(150);
      });
      
      expect(result.current.breakpoint).toBe('mobile');
    });

    it('应该有防抖处理当窗口频繁调整大小', () => {
      mockWindowWidth(1200);
      
      const { result } = renderHook(() => useResponsiveLayout());
      
      // 快速触发多次 resize
      act(() => {
        mockWindowWidth(800);
        window.dispatchEvent(new Event('resize'));
        window.dispatchEvent(new Event('resize'));
        window.dispatchEvent(new Event('resize'));
        jest.advanceTimersByTime(150);
      });
      
      expect(result.current.breakpoint).toBe('tablet');
    });
  });

  describe('自定义配置', () => {
    it('应该使用所有自定义断点配置', () => {
      mockWindowWidth(700);
      
      const { result } = renderHook(() =>
        useResponsiveLayout({
          mobileBreakpoint: 700,
          tabletBreakpoint: 1200,
        })
      );
      
      // 700px 在 mobileBreakpoint(700) 和 tabletBreakpoint(1200) 之间，应该是 tablet
      expect(result.current.breakpoint).toBe('tablet');
    });

    it('应该部分使用自定义配置', () => {
      mockWindowWidth(500);
      
      const { result } = renderHook(() =>
        useResponsiveLayout({
          mobileColumns: 2,
        })
      );
      
      expect(result.current.columns).toBe(2);
      expect(result.current.cardSize).toBe('small');
    });
  });
});

describe('辅助函数', () => {
  describe('getBreakpoint', () => {
    it('应该返回 mobile 当宽度 < 640', () => {
      expect(getBreakpoint(375)).toBe('mobile');
      expect(getBreakpoint(639)).toBe('mobile');
    });

    it('应该返回 tablet 当宽度在 640-1023 之间', () => {
      expect(getBreakpoint(640)).toBe('tablet');
      expect(getBreakpoint(768)).toBe('tablet');
      expect(getBreakpoint(1023)).toBe('tablet');
    });

    it('应该返回 desktop 当宽度 >= 1024', () => {
      expect(getBreakpoint(1024)).toBe('desktop');
      expect(getBreakpoint(1440)).toBe('desktop');
      expect(getBreakpoint(1920)).toBe('desktop');
    });
  });

  describe('getRecommendedColumns', () => {
    it('应该返回移动端推荐列数', () => {
      expect(getRecommendedColumns('mobile')).toBe(3);
    });

    it('应该返回平板端推荐列数', () => {
      expect(getRecommendedColumns('tablet')).toBe(5);
    });

    it('应该返回桌面端推荐列数', () => {
      expect(getRecommendedColumns('desktop')).toBe(8);
    });
  });

  describe('getRecommendedCardSize', () => {
    it('应该返回 small 尺寸给移动端', () => {
      expect(getRecommendedCardSize('mobile')).toBe('small');
    });

    it('应该返回 medium 尺寸给平板端', () => {
      expect(getRecommendedCardSize('tablet')).toBe('medium');
    });

    it('应该返回 medium 尺寸给桌面端', () => {
      expect(getRecommendedCardSize('desktop')).toBe('medium');
    });
  });
});

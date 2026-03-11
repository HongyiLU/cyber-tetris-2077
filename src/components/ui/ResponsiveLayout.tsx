// ==================== 响应式布局组件 ====================

import React, { useState, useEffect } from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  gameCanvas?: React.ReactNode;
  gameInfo?: React.ReactNode;
  mobileControls?: React.ReactNode;
  showGameArea?: boolean;  // 控制是否显示游戏区域
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  gameCanvas,
  gameInfo,
  mobileControls,
  showGameArea = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    /**
     * 检测设备类型
     */
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 'ontouchstart' in window;
      setIsMobile(mobile);
      
      // 设置视口
      if (mobile) {
        document.documentElement.style.setProperty('--is-mobile', 'true');
      } else {
        document.documentElement.style.removeProperty('--is-mobile');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100vh',
        background: 'var(--dark-bg, linear-gradient(135deg, #0a0a0f 0%, #16213e 50%, #0f3460 100%))',
        padding: '10px',
        gap: '10px',
        overflowX: 'hidden',
      }}>
        {/* 子内容（如战斗 UI、开始按钮等）- 仅在游戏未开始时显示 */}
        {!showGameArea && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'center',
            width: '100%',
            maxWidth: '400px',
            zIndex: 10,
          }}>
            {children}
          </div>
        )}

        {/* 游戏区域 - 仅在游戏开始后显示 */}
        {showGameArea && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            maxWidth: '400px',
          }}>
            {/* 游戏画布 - 移动端缩小显示，确保虚拟按键可见 */}
            <div style={{
              width: '100%',
              maxWidth: '280px',
              transform: 'scale(0.9)',
              transformOrigin: 'top center',
            }}>
              {gameCanvas}
            </div>

            {/* 游戏信息 */}
            <div style={{
              width: '100%',
              maxWidth: '280px',
            }}>
              {gameInfo}
            </div>
          </div>
        )}

        {/* 移动端控制 - 放在最底部 */}
        {mobileControls && (
          <div style={{
            width: '100%',
            maxWidth: '400px',
            marginTop: '10px',
          }}>
            {mobileControls}
          </div>
        )}
      </div>
    );
  }

  // 桌面端布局
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--dark-bg, linear-gradient(135deg, #0a0a0f 0%, #16213e 50%, #0f3460 100%))',
      fontFamily: 'Orbitron, monospace',
      padding: '20px',
    }}>
      {children}
    </div>
  );
};

export default ResponsiveLayout;

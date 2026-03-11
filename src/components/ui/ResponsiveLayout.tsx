// ==================== 响应式布局组件 ====================

import React, { useState, useEffect } from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  gameCanvas?: React.ReactNode;
  gameInfo?: React.ReactNode;
  showGameArea?: boolean;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  gameCanvas,
  gameInfo,
  showGameArea = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 'ontouchstart' in window;
      setIsMobile(mobile);
      
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
        minHeight: '100vh',
        background: 'var(--dark-bg, linear-gradient(135deg, #0a0a0f 0%, #16213e 50%, #0f3460 100%))',
        padding: '10px',
        overflowX: 'hidden',
      }}>
        {/* 主菜单内容 - 仅在游戏未开始时显示 */}
        {!showGameArea && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'center',
            width: '100%',
            maxWidth: '400px',
            padding: '20px 10px',
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
            gap: '10px',
            width: '100%',
            maxWidth: '400px',
            padding: '10px',
          }}>
            {/* 游戏画布 */}
            <div style={{
              width: '100%',
              maxWidth: '240px',
            }}>
              {gameCanvas}
            </div>

            {/* 游戏信息 */}
            <div style={{
              width: '100%',
              maxWidth: '240px',
            }}>
              {gameInfo}
            </div>
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

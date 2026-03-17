import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==================== 响应式布局组件 ====================
import { useState, useEffect } from 'react';
const ResponsiveLayout = ({ children, gameCanvas, gameInfo, showGameArea = false, }) => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768 || 'ontouchstart' in window;
            setIsMobile(mobile);
            if (mobile) {
                document.documentElement.style.setProperty('--is-mobile', 'true');
            }
            else {
                document.documentElement.style.removeProperty('--is-mobile');
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    if (isMobile) {
        return (_jsxs("div", { style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'var(--dark-bg, linear-gradient(135deg, #0a0a0f 0%, #16213e 50%, #0f3460 100%))',
                padding: '10px',
                overflowX: 'hidden',
            }, children: [!showGameArea && (_jsx("div", { style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: '500px',
                        padding: '20px 10px',
                    }, children: children })), showGameArea && (_jsxs("div", { style: {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        maxWidth: '500px',
                        padding: '10px',
                    }, children: [_jsx("div", { style: {
                                width: '100%',
                                maxWidth: '360px',
                            }, children: gameCanvas }), _jsx("div", { style: {
                                width: '100%',
                                maxWidth: '360px',
                            }, children: gameInfo })] }))] }));
    }
    // 桌面端布局
    return (_jsx("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--dark-bg, linear-gradient(135deg, #0a0a0f 0%, #16213e 50%, #0f3460 100%))',
            fontFamily: 'Orbitron, monospace',
            padding: '20px',
        }, children: children }));
};
export default ResponsiveLayout;

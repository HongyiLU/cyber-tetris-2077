import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==================== 错误边界组件 ====================
import { Component } from 'react';
/**
 * 错误边界组件 - 捕获并处理 React 组件树中的错误
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<div>出错了！</div>}>
 *   <GameApp />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        Object.defineProperty(this, "handleReset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.setState({ hasError: false, error: undefined });
            }
        });
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        // 记录错误日志
        console.error('🔴 ErrorBoundary caught an error:', error);
        console.error('Component Stack:', errorInfo.componentStack);
        // 可以发送到错误监控服务
        // logErrorToService(error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (_jsxs("div", { style: {
                    padding: '20px',
                    textAlign: 'center',
                    color: '#ff0040',
                    backgroundColor: 'rgba(255, 0, 64, 0.1)',
                    borderRadius: '8px',
                    margin: '20px',
                }, children: [_jsx("h2", { children: "\u26A0\uFE0F \u51FA\u9519\u4E86\uFF01" }), _jsx("p", { children: "\u6E38\u620F\u9047\u5230\u4E86\u4E00\u4E9B\u95EE\u9898\uFF0C\u8BF7\u5C1D\u8BD5\u91CD\u65B0\u5F00\u59CB\u3002" }), this.state.error && (_jsxs("details", { style: {
                            marginTop: '10px',
                            textAlign: 'left',
                            fontSize: '12px',
                            color: '#888',
                        }, children: [_jsx("summary", { children: "\u9519\u8BEF\u8BE6\u60C5" }), _jsx("pre", { style: {
                                    backgroundColor: '#1a1a1a',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    overflow: 'auto',
                                }, children: this.state.error.toString() })] })), _jsx("button", { onClick: this.handleReset, style: {
                            marginTop: '15px',
                            padding: '10px 20px',
                            backgroundColor: '#00d9ff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                        }, children: "\u91CD\u65B0\u5F00\u59CB" })] }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;

// ==================== 错误边界组件 ====================

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

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
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误日志
    console.error('🔴 ErrorBoundary caught an error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    
    // 可以发送到错误监控服务
    // logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#ff0040',
          backgroundColor: 'rgba(255, 0, 64, 0.1)',
          borderRadius: '8px',
          margin: '20px',
        }}>
          <h2>⚠️ 出错了！</h2>
          <p>游戏遇到了一些问题，请尝试重新开始。</p>
          {this.state.error && (
            <details style={{
              marginTop: '10px',
              textAlign: 'left',
              fontSize: '12px',
              color: '#888',
            }}>
              <summary>错误详情</summary>
              <pre style={{
                backgroundColor: '#1a1a1a',
                padding: '10px',
                borderRadius: '4px',
                overflow: 'auto',
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#00d9ff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            重新开始
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

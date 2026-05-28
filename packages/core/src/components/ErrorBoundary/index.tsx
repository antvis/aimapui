import React, { Component } from 'react';

interface ErrorBoundaryProps {
  /** 出错时的降级 UI，默认显示错误信息 */
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  /** 错误回调 */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 错误边界组件
 *
 * 捕获子组件树中的 JS 错误，防止整个应用崩溃。
 * 适用于第三方地图 SDK 可能抛出异常的场景（如 key 失效、网络阻断等）。
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      const { error } = this.state;

      if (typeof fallback === 'function') {
        return fallback(error!);
      }

      if (fallback) {
        return fallback;
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: 32,
          color: '#666',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 16, color: '#e53e3e' }}>
            error
          </span>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>地图加载失败</p>
          <p style={{ fontSize: 13, color: '#999' }}>{error?.message ?? '未知错误'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

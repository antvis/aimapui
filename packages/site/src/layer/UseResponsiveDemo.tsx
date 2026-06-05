import React from 'react';
import { AiMap, ResponsiveProvider, useResponsive } from '@antv/aimapui';

/**
 * useResponsive — 响应式 Hook 示例
 *
 * 通过 ResponsiveProvider 注入断点配置，子组件用 useResponsive() 实时拿到窗口宽度与 isMobile 标记，
 * 并据此切换 PC / Mobile 两种布局。可拖动调整浏览器宽度观察效果。
 */
function ResponsiveStatus() {
  const { isMobile, breakpoint, width } = useResponsive();
  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.94)',
        borderRadius: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        fontSize: 13,
        lineHeight: 1.8,
        zIndex: 10,
        minWidth: 200,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>useResponsive</div>
      <div>width: <b>{width}px</b></div>
      <div>breakpoint: <b>{breakpoint}px</b></div>
      <div>
        isMobile:{' '}
        <b style={{ color: isMobile ? '#ef4444' : '#10b981' }}>{String(isMobile)}</b>
      </div>
      <div style={{ marginTop: 6, color: '#666' }}>
        当前布局：{isMobile ? '📱 移动端' : '💻 桌面端'}
      </div>
    </div>
  );
}

export default function UseResponsiveDemo() {
  return (
    <ResponsiveProvider responsive={{ breakpoint: 768 }}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <AiMap
          autoFit
          map={{
            basemap: 'gaode',
            center: [116.397, 39.909],
            zoom: 10,
            style: 'light',
          }}
        />
        <ResponsiveStatus />
      </div>
    </ResponsiveProvider>
  );
}

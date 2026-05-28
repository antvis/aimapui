import React from 'react';

/**
 * Demo 通用悬浮信息面板
 *
 * 遵循 Material Design 3 玻璃态风格：
 * - bg: surface/92 + backdrop-blur
 * - border: outline-variant/30
 * - 圆角 8px
 * - 文字使用 on-surface / on-surface-variant 配色
 */
export interface DemoPanelProps {
  /** 面板标题 */
  title: string;
  /** 面板描述文字 */
  description?: string;
  /** 位置 */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** 面板内容 */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function DemoPanel({
  title,
  description,
  position = 'top-left',
  children,
  className,
  style,
}: DemoPanelProps) {
  const posStyle: React.CSSProperties = (() => {
    switch (position) {
      case 'top-left': return { top: 12, left: 12 };
      case 'top-right': return { top: 12, right: 12 };
      case 'bottom-left': return { bottom: 12, left: 12 };
      case 'bottom-right': return { bottom: 12, right: 12 };
    }
  })();

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        ...posStyle,
        zIndex: 100,
        background: 'rgba(248,249,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(195,198,215,0.3)',
        borderRadius: 10,
        padding: '14px 18px',
        minWidth: 180,
        maxWidth: 320,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        ...style,
      }}
    >
      <div style={{
        fontWeight: 600,
        fontSize: 14,
        lineHeight: '20px',
        color: 'var(--color-on-surface, #121c2a)',
        marginBottom: description ? 4 : 8,
      }}>
        {title}
      </div>
      {description && (
        <div style={{
          fontSize: 12,
          lineHeight: '16px',
          color: 'var(--color-on-surface-variant, #434655)',
          marginBottom: 8,
        }}>
          {description}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * DemoPanel 内部的信息行
 */
export interface PanelRowProps {
  label: string;
  value: string | number;
  color?: string;
}

export function PanelRow({ label, value, color }: PanelRowProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '3px 0',
    }}>
      <span style={{
        fontSize: 11,
        color: 'var(--color-on-surface-variant, #434655)',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 12,
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontWeight: 450,
        color: color ?? 'var(--color-on-surface, #121c2a)',
      }}>
        {value}
      </span>
    </div>
  );
}
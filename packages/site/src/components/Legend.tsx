import React from 'react';

/** 分类图例项 */
export interface LegendCategoryItem {
  color: string;
  label: string;
}

/** 分类图例 */
export interface LegendCategoriesProps {
  type: 'categories';
  title?: string;
  items: LegendCategoryItem[];
}

/** 连续色带图例 */
export interface LegendRampProps {
  type: 'ramp';
  title?: string;
  colors: string[];
  labels?: [string, string];
}

/** 大小图例 */
export interface LegendSizeProps {
  type: 'size';
  title?: string;
  color: string;
  items: Array<{ size: number; label: string }>;
}

/** 线宽图例 */
export interface LegendLineWidthProps {
  type: 'lineWidth';
  title?: string;
  color: string;
  items: Array<{ width: number; label: string }>;
}

export type LegendProps =
  | LegendCategoriesProps
  | LegendRampProps
  | LegendSizeProps
  | LegendLineWidthProps;

/**
 * 通用图例组件
 *
 * 支持 4 种图例类型：
 * - categories: 分类色块图例
 * - ramp: 连续色带图例
 * - size: 离散大小图例
 * - lineWidth: 线宽图例
 */
export function Legend(props: LegendProps) {
  return (
    <div style={{
      background: 'rgba(248,249,255,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(195,198,215,0.3)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 12,
      lineHeight: '16px',
      color: 'var(--color-on-surface, #121c2a)',
      minWidth: 100,
    }}>
      {props.title && (
        <div style={{
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: '0.05em',
          textTransform: 'uppercase' as const,
          color: 'var(--color-on-surface-variant, #434655)',
          marginBottom: 8,
        }}>
          {props.title}
        </div>
      )}
      {props.type === 'categories' && <LegendCategoriesContent items={props.items} />}
      {props.type === 'ramp' && <LegendRampContent colors={props.colors} labels={props.labels} />}
      {props.type === 'size' && <LegendSizeContent color={props.color} items={props.items} />}
      {props.type === 'lineWidth' && <LegendLineWidthContent color={props.color} items={props.items} />}
    </div>
  );
}

function LegendCategoriesContent({ items }: { items: LegendCategoryItem[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%', background: item.color,
            flexShrink: 0, boxShadow: `0 0 0 1px rgba(0,0,0,0.08)`,
          }} />
          <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant, #434655)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function LegendRampContent({ colors, labels }: { colors: string[]; labels?: [string, string] }) {
  return (
    <div>
      <div style={{
        display: 'flex', height: 10, borderRadius: 4, overflow: 'hidden',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.06)',
      }}>
        {colors.map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>
      {labels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-on-surface-variant, #434655)' }}>{labels[0]}</span>
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-on-surface-variant, #434655)' }}>{labels[1]}</span>
        </div>
      )}
    </div>
  );
}

function LegendSizeContent({ color, items }: { color: string; items: Array<{ size: number; label: string }> }) {
  const maxSize = Math.max(...items.map((it) => it.size));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 3 }}>
          <div style={{
            width: item.size, height: item.size, borderRadius: '50%', background: color,
            opacity: 0.8, boxShadow: `0 0 0 1px rgba(0,0,0,0.06)`,
            marginTop: maxSize - item.size,
          }} />
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-on-surface-variant, #434655)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function LegendLineWidthContent({ color, items }: { color: string; items: Array<{ width: number; label: string }> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: item.width, background: color, borderRadius: item.width / 2,
            opacity: 0.8, flexShrink: 0,
          }} />
          <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant, #434655)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
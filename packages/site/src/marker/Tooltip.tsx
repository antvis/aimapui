import React, { useState } from 'react';
import { AiMap, Tooltip, Marker, ZoomControl } from '@antv/aimapui';
import type { TooltipItem } from '@antv/aimapui';

/**
 * Tooltip 设计规范展示 — Cartographic Precision System v1.2.0
 *
 * 展示内容:
 * 1. 深色变体 (Dark) — 默认高对比度，适用于亮色底图
 * 2. 玻璃变体 (Glass) — 毛玻璃效果，适用于数据地图
 * 3. 浅色变体 (Light) — 白底，适用于深色底图
 * 4. 结构化键值对 — 多行数据展示
 * 5. 不同方向 — top / right / bottom / left
 *
 * 交互方式: 鼠标悬停 Marker 即时显示 Tooltip
 */

// ── 数据定义 ──

const POINTS = [
  {
    id: 'dark-top',
    lng: 116.391,
    lat: 39.916,
    variant: 'icon' as const,
    color: 'primary' as const,
    icon: 'router',
    tooltipVariant: 'dark' as const,
    placement: 'top' as const,
    title: 'Node #552-RT',
    items: [
      { label: 'Uptime', value: '99.8%' },
      { label: 'Temp', value: '42°C' },
      { label: 'Load', value: '0.12ms' },
    ] as TooltipItem[],
  },
  {
    id: 'glass-right',
    lng: 116.397,
    lat: 39.909,
    variant: 'icon' as const,
    color: 'primary' as const,
    icon: 'park',
    tooltipVariant: 'glass' as const,
    placement: 'right' as const,
    title: 'Urban Park Area',
    content: 'Zone 4A-North',
  },
  {
    id: 'light-bottom',
    lng: 116.403,
    lat: 39.905,
    variant: 'icon' as const,
    color: 'success' as const,
    icon: 'local_shipping',
    tooltipVariant: 'light' as const,
    placement: 'bottom' as const,
    title: 'Logistics Hub B',
    items: [
      { label: 'Capacity', value: '84%' },
      { label: 'Vehicles', value: '36' },
    ] as TooltipItem[],
  },
  {
    id: 'dark-left',
    lng: 116.410,
    lat: 39.912,
    variant: 'icon' as const,
    color: 'warning' as const,
    icon: 'cell_tower',
    tooltipVariant: 'dark' as const,
    placement: 'left' as const,
    title: 'Signal Tower #18',
    items: [
      { label: 'Frequency', value: '2.4GHz' },
      { label: 'Strength', value: '-42dBm' },
    ] as TooltipItem[],
  },
  {
    id: 'simple',
    lng: 116.385,
    lat: 39.908,
    variant: 'pin' as const,
    color: 'primary' as const,
    icon: undefined,
    tooltipVariant: 'dark' as const,
    placement: 'top' as const,
    title: undefined,
    content: '天安门广场',
  },
];

export default function DemoTooltip() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        autoFit
        map={{
          basemap: 'gaode',
          center: [116.397, 39.909],
          zoom: 13,
          style: 'light',
        }}
      >
        {POINTS.map((point) => (
          <React.Fragment key={point.id}>
            <Marker
              longitude={point.lng}
              latitude={point.lat}
              variant={point.variant}
              color={point.color}
              icon={point.icon}
              onMouseEnter={() => setHoveredId(point.id)}
              onMouseLeave={() => setHoveredId(null)}
            />

            <Tooltip
              longitude={point.lng}
              latitude={point.lat}
              variant={point.tooltipVariant}
              placement={point.placement}
              visible={hoveredId === point.id}
              title={point.title}
              items={'items' in point ? (point as any).items : undefined}
              content={'content' in point && !point.title ? (point as any).content : undefined}
              offset={12}
            />
          </React.Fragment>
        ))}

        <ZoomControl />
      </AiMap>

      {/* 图例面板 */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        background: 'rgba(248, 249, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(195, 198, 215, 0.3)',
        borderRadius: 12,
        padding: '12px 16px',
        fontSize: 12,
        lineHeight: 1.8,
        color: '#121c2a',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        pointerEvents: 'auto',
      }}>
        <div style={{
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: '0.05em',
          color: '#004ac6',
          marginBottom: 4,
          textTransform: 'uppercase' as const,
        }}>
          Tooltip 设计规范 v1.2
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div>🌑 <strong>Dark</strong> — 深色高对比度 (top)</div>
          <div>🪟 <strong>Glass</strong> — 毛玻璃拟态 (right)</div>
          <div>☀️ <strong>Light</strong> — 浅色背景 (bottom)</div>
          <div>📡 <strong>Dark</strong> — 键值对数据 (left)</div>
          <div>📍 <strong>Simple</strong> — 纯文本</div>
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: '#434655' }}>
          悬停 Marker 查看不同变体的 Tooltip
        </div>
      </div>
    </div>
  );
}

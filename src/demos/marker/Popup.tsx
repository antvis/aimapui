import React, { useState, useCallback } from 'react';
import { Aimap, Popup, Marker, ZoomControl } from '../../index';
import type { PopupHeader, PopupAttribute, PopupAction } from '../../index';

/**
 * Popup 设计规范展示 — Cartographic Precision System v1.2.0
 *
 * 展示内容:
 * 1. 紧凑型 (Compact) — 简单文字标注
 * 2. 标准型 (Standard) — 带属性列表的 POI 信息
 * 3. 宽幅型 (Detailed) — 带封面图 + 统计信息 + 操作按钮
 * 4. 简单内容模式 — 纯文本 / HTML 字符串
 *
 * 交互方式: 点击 Marker 显示 Popup，同一时间仅显示一个
 * 新特性: placement 自动翻转、offset 偏移、singleton 互斥、
 *         点击地图空白关闭、ESC 关闭、退场动效
 */

// ── 数据定义 ──

const MARKERS = [
  { id: 'compact', lng: 116.391, lat: 39.916, variant: 'circle' as const, color: 'primary' as const, icon: undefined },
  { id: 'standard', lng: 116.397, lat: 39.909, variant: 'icon' as const, color: 'primary' as const, icon: 'warehouse' },
  { id: 'detailed', lng: 116.403, lat: 39.905, variant: 'icon' as const, color: 'success' as const, icon: 'local_shipping' },
  { id: 'simple', lng: 116.410, lat: 39.912, variant: 'pin' as const, color: 'primary' as const, icon: undefined },
];

const compactHeader: PopupHeader = {
  title: 'Sensor Node 04',
  statusDot: '#10b981',
};
const compactAttrs: PopupAttribute[] = [
  { label: 'Temperature', value: '22°C' },
  { label: 'Battery', value: '92%', valueColor: '#00854d' },
];

const standardHeader: PopupHeader = {
  title: 'Logistics Hub A-12',
};
const standardAttrs: PopupAttribute[] = [
  { label: 'Uptime', value: '99.8%', valueColor: '#00854d' },
  { label: 'Capacity', value: '85%' },
  { label: 'Vehicles', value: '48' },
  { label: 'Personnel', value: '142' },
];
const standardActions: PopupAction[] = [
  { label: '查看详情', variant: 'primary' },
  { label: '路线导航', variant: 'secondary' },
];

const detailedHeader: PopupHeader = {
  title: 'Regional Distribution Center',
  coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6r8OCR2bUtKe_tYBjg-lI4fGe2ueSPxwX42e9luYmhMeFQi5HD9xgLu1Neoii5swS0AQkJDJicOG2oplMaLP0XoTofc_n0JEH_6WqcTluzOjWsJeBc2xf3Bvjf2refK8QmMsOe_mKsqFQs9yDP7mGe3OQ8vheLAfABYXCqLs0fmpM3AI4NmvlVlp6fOELhaYD75mC9pLQmXmME_d7pz_pmIFOxYTnhGF8hR4EVuJFzHVnMlntyR6CS2xAniReaM58wVKNe7WmTQ',
  statusLabel: 'Active',
  statusColor: '#10b981',
};
const detailedAttrs: PopupAttribute[] = [
  { label: 'Personnel', value: '142', icon: 'groups' },
  { label: 'Vehicles', value: '48', icon: 'local_shipping' },
  { label: 'Throughput', value: '2.4K/h', icon: 'trending_up' },
  { label: 'Availability', value: '99.8%', icon: 'check_circle' },
];
const detailedActions: PopupAction[] = [
  { label: 'Analytics', variant: 'primary' },
  { label: 'Export', variant: 'secondary' },
];

export default function Demo11Popup() {
  // 当前显示的 Popup ID，null 表示都不显示
  const [activePopup, setActivePopup] = useState<string | null>('detailed');

  // 点击 Marker 时显示对应 Popup，关闭其他 Popup
  const showPopup = useCallback((id: string) => {
    setActivePopup((prev) => (prev === id ? null : id));
  }, []);

  // 关闭当前 Popup
  const closePopup = useCallback(() => {
    setActivePopup(null);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'gaode',
          center: [116.397, 39.909],
          zoom: 13,
          style: 'light',
        }}
      >
        {/* ── 1. 紧凑型 Popup (Compact) — 简单属性标注 ── */}
        <Popup
          longitude={116.391}
          latitude={39.916}
          size="compact"
          header={compactHeader}
          attributes={compactAttrs}
          closeButton
          visible={activePopup === 'compact'}
          onClose={closePopup}
          offset={8}
        />

        {/* ── 2. 标准型 Popup (Standard) — 属性列表 + 操作按钮 ── */}
        <Popup
          longitude={116.397}
          latitude={39.909}
          size="standard"
          header={standardHeader}
          attributes={standardAttrs}
          actions={standardActions}
          closeButton
          visible={activePopup === 'standard'}
          onClose={closePopup}
          offset={8}
        />

        {/* ── 3. 宽幅型 Popup (Detailed) — 封面图 + 统计 + 操作 ── */}
        <Popup
          longitude={116.403}
          latitude={39.905}
          size="detailed"
          header={detailedHeader}
          attributes={detailedAttrs}
          actions={detailedActions}
          closeButton
          visible={activePopup === 'detailed'}
          onClose={closePopup}
          offset={8}
        />

        {/* ── 4. 简单内容模式 — HTML 字符串 ── */}
        <Popup
          longitude={116.410}
          latitude={39.912}
          content="<div><strong style='color:#121c2a'>天安门广场</strong><br/><span style='color:#434655'>中国首都中心地标</span></div>"
          size="compact"
          closeButton
          visible={activePopup === 'simple'}
          onClose={closePopup}
          offset={8}
        />

        {/* Markers — 点击显示对应 Popup，关闭其他 Popup */}
        {MARKERS.map((m) => (
          <Marker
            key={m.id}
            longitude={m.lng}
            latitude={m.lat}
            variant={m.variant}
            color={m.color}
            icon={m.icon}
            onClick={() => showPopup(m.id)}
          />
        ))}

        <ZoomControl />
      </Aimap>

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
        <div style={{ fontWeight: 600, fontSize: 11, letterSpacing: '0.05em', color: '#004ac6', marginBottom: 4, textTransform: 'uppercase' as const }}>
          Popup 设计规范 v1.2
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div><span style={{ color: '#2563eb' }}>■</span> Compact (280px) — 传感器标注</div>
          <div><span style={{ color: '#2563eb' }}>■</span> Standard (320px) — 站点信息</div>
          <div><span style={{ color: '#00854d' }}>■</span> Detailed (400px) — 物流中心详情</div>
          <div><span style={{ color: '#737686' }}>□</span> 简单文本 — HTML 字符串</div>
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: '#434655' }}>
          点击 Marker → 弹出 Popup<br/>
          点击地图空白 / ESC → 关闭<br/>
          箭头自动翻转 · 退场动效
        </div>
      </div>
    </div>
  );
}
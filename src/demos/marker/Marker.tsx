import React, { useState } from 'react';
import { AiMap, Marker } from '../../index';
import type { MarkerVariant, MarkerColor } from '../../index';
/**
 * Marker 设计规范展示 — Cartographic Precision System v1.2.0
 *
 * 展示内容:
 * 1. 基础形态: Pin, Circle, Icon, Dot
 * 2. 交互状态: Default, Hover, Selected, Inactive
 * 3. 语义颜色: Primary, Success, Warning, Error
 * 4. 缩放适配: 高缩放完整 Marker + Label / 中缩放仅图标 / 低缩放圆点
 * 5. 文本标注: Label + 白色光晕
 */
export default function Demo05Marker() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 基础位置数据
  const baseLng = 116.397;
  const baseLat = 39.909;

  // 选中切换
  const toggleSelected = (id: string) => {
    setSelectedId(prev => prev === id ? null : id);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'gaode',
          center: [116.397, 39.909],
          zoom: 14,
          style: 'light',
        }}
      >
        {/* ============================================================
            1. 基础形态 — Base Forms
            ============================================================ */}

        {/* 水滴型 Pin — 默认业务点 */}
        <Marker
          longitude={baseLng - 0.015}
          latitude={baseLat + 0.008}
          variant="pin"
          color="primary"
          label="站点 A"
          onClick={() => toggleSelected('pin-default')}
          selected={selectedId === 'pin-default'}
        />

        {/* 圆型 Circle — 移动/轻量点 */}
        <Marker
          longitude={baseLng - 0.005}
          latitude={baseLat + 0.008}
          variant="circle"
          color="primary"
          label="传感器"
          onClick={() => toggleSelected('circle-default')}
          selected={selectedId === 'circle-default'}
        />

        {/* 图标型 Icon — 带图标的 Pin */}
        <Marker
          longitude={baseLng + 0.005}
          latitude={baseLat + 0.008}
          variant="icon"
          color="primary"
          icon="local_shipping"
          label="物流车"
          onClick={() => toggleSelected('icon-default')}
          selected={selectedId === 'icon-default'}
        />

        {/* 简化点 Dot — 低缩放级降级 */}
        <Marker
          longitude={baseLng + 0.015}
          latitude={baseLat + 0.008}
          variant="dot"
          color="primary"
        />

        {/* ============================================================
            2. 交互状态 — Interaction States
            ============================================================ */}

        {/* 默认状态 */}
        <Marker
          longitude={baseLng - 0.015}
          latitude={baseLat}
          variant="icon"
          color="primary"
          icon="location_on"
          label="Default"
        />

        {/* 选中状态 (Selected) — 呼吸脉冲动画 */}
        <Marker
          longitude={baseLng - 0.005}
          latitude={baseLat}
          variant="icon"
          color="primary"
          icon="star"
          selected={true}
          label="Selected"
        />

        {/* 禁用/离线状态 (Inactive) — 灰度 + 50% 透明 */}
        <Marker
          longitude={baseLng + 0.005}
          latitude={baseLat}
          variant="icon"
          color="primary"
          icon="block"
          inactive={true}
          label="Inactive"
        />

        {/* ============================================================
            3. 语义颜色 — Semantic Colors
            ============================================================ */}

        {/* Primary 蓝 — 信息/默认 */}
        <Marker
          longitude={baseLng - 0.015}
          latitude={baseLat - 0.008}
          variant="icon"
          color="primary"
          icon="info"
          label="Primary"
          onClick={() => toggleSelected('color-primary')}
          selected={selectedId === 'color-primary'}
        />

        {/* Success 绿 — 完成/安全 */}
        <Marker
          longitude={baseLng - 0.005}
          latitude={baseLat - 0.008}
          variant="icon"
          color="success"
          icon="check_circle"
          label="Success"
          onClick={() => toggleSelected('color-success')}
          selected={selectedId === 'color-success'}
        />

        {/* Warning 橙 — 预警/高负载 */}
        <Marker
          longitude={baseLng + 0.005}
          latitude={baseLat - 0.008}
          variant="icon"
          color="warning"
          icon="warning"
          label="Warning"
          onClick={() => toggleSelected('color-warning')}
          selected={selectedId === 'color-warning'}
        />

        {/* Error 红 — 故障/危险 */}
        <Marker
          longitude={baseLng + 0.015}
          latitude={baseLat - 0.008}
          variant="icon"
          color="error"
          icon="error"
          label="Error"
          onClick={() => toggleSelected('color-error')}
          selected={selectedId === 'color-error'}
        />

        {/* ============================================================
            4. 语义颜色 × 基础形态组合
            ============================================================ */}

        {/* Success Pin */}
        <Marker
          longitude={baseLng - 0.025}
          latitude={baseLat - 0.018}
          variant="pin"
          color="success"
        />

        {/* Warning Circle */}
        <Marker
          longitude={baseLng - 0.015}
          latitude={baseLat - 0.018}
          variant="circle"
          color="warning"
        />

        {/* Error Dot */}
        <Marker
          longitude={baseLng - 0.005}
          latitude={baseLat - 0.018}
          variant="dot"
          color="error"
        />

        {/* Success Icon with label */}
        <Marker
          longitude={baseLng + 0.005}
          latitude={baseLat - 0.018}
          variant="icon"
          color="success"
          icon="task_alt"
          label="ASSET-9942"
        />

        {/* ============================================================
            5. 高缩放级详细视图 (Zoom 15+)
            Marker + 文本标注 + 点击交互
            ============================================================ */}

        <Marker
          longitude={baseLng + 0.025}
          latitude={baseLat + 0.008}
          variant="icon"
          color="primary"
          icon="warehouse"
          label="Terminal A-12"
          onClick={() => toggleSelected('terminal')}
          selected={selectedId === 'terminal'}
        />
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
        <div style={{ fontWeight: 600, fontSize: 11, letterSpacing: '0.05em', color: '#004ac6', marginBottom: 4, textTransform: 'uppercase' as const }}>
          Marker 设计规范 v1.2
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px' }}>
          <div><span style={{ color: '#2563eb' }}>●</span> Pin 水滴型</div>
          <div><span style={{ color: '#2563eb' }}>○</span> Circle 圆型</div>
          <div><span style={{ color: '#2563eb' }}>◆</span> Icon 图标型</div>
          <div><span style={{ color: '#2563eb' }}>·</span> Dot 简化点</div>
          <div><span style={{ color: '#00854d' }}>●</span> Success</div>
          <div><span style={{ color: '#943700' }}>●</span> Warning</div>
          <div><span style={{ color: '#ba1a1a' }}>●</span> Error</div>
          <div>📍 点击选中</div>
        </div>
      </div>
    </div>
  );
}
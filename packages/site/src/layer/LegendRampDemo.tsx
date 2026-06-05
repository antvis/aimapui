import React from 'react';
import { AiMap, LegendRamp } from '@antv/aimapui';

/**
 * 色带图例 — LegendRamp
 *
 * 连续渐变 + 刻度线 + 范围刷选，适合数值型字段的色阶映射。
 */
export default function LegendRampDemo() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        autoFit
        map={{
          basemap: 'gaode',
          center: [116.397, 39.909],
          zoom: 4,
          style: 'light',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 16,
          bottom: 16,
          padding: '12px 14px',
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          minWidth: 220,
        }}
      >
        <LegendRamp
          type="ramp"
          title="人口密度 (人/km²)"
          labels={['0', '500', '1000', '2000', '5000']}
          colors={['#eff6ff', '#bfdbfe', '#60a5fa', '#2563eb', '#1e3a8a']}
          isContinuous
          showTicks
        />
      </div>
    </div>
  );
}

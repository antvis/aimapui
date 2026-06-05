import React from 'react';
import { AiMap, LegendThreshold } from '@antv/aimapui';

/**
 * 阈值图例 — LegendThreshold
 *
 * 自定义区间分段，每个 [min, max) 配一种颜色，常用于空气质量等级、灾害风险等级等。
 */
export default function LegendThresholdDemo() {
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
          minWidth: 180,
        }}
      >
        <LegendThreshold
          type="threshold"
          title="AQI 等级"
          ranges={[
            [0, 50],
            [50, 100],
            [100, 150],
            [150, 200],
            [200, 300],
          ]}
          colors={['#10b981', '#facc15', '#f97316', '#ef4444', '#7c3aed']}
        />
      </div>
    </div>
  );
}

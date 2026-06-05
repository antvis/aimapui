import React from 'react';
import { AiMap, LegendSize } from '@antv/aimapui';

/**
 * 比例大小图例 — LegendSize
 *
 * 用圆的直径编码数值大小，常用于气泡图、人口规模等。
 */
export default function LegendSizeDemo() {
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
        }}
      >
        <LegendSize
          type="size"
          title="城市人口（万）"
          fillColor="#2563eb"
          items={[
            { size: 8, label: '100' },
            { size: 16, label: '500' },
            { size: 26, label: '1000' },
            { size: 38, label: '2000' },
          ]}
        />
      </div>
    </div>
  );
}

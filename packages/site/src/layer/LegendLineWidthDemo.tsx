import React from 'react';
import { AiMap, LegendLineWidth } from '@antv/aimapui';

/**
 * 线宽图例 — LegendLineWidth
 *
 * 用线的粗细编码数值大小，常用于道路等级、流量带宽、OD 流向粗细等。
 */
export default function LegendLineWidthDemo() {
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
        <LegendLineWidth
          type="lineWidth"
          title="日均流量（万车次）"
          color="#2563eb"
          items={[
            { width: 1, label: '< 1' },
            { width: 3, label: '1 ~ 5' },
            { width: 6, label: '5 ~ 10' },
            { width: 10, label: '> 10' },
          ]}
        />
      </div>
    </div>
  );
}

import React from 'react';
import { AiMap, LegendProportion } from '@antv/aimapui';

/**
 * 比例图例 — LegendProportion
 *
 * 以分段比例的方式展示数值区间，常用于柱状/比例尺等场景。
 */
export default function LegendProportionDemo() {
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
        <LegendProportion
          type="proportion"
          title="销售额区间（万元）"
          fillColor="#10b981"
          labels={[
            [0, 100],
            [100, 500],
            [500, 1000],
            [1000, 5000],
          ]}
        />
      </div>
    </div>
  );
}

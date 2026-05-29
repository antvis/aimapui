import React from 'react';
import { AiMap, LegendDiverging } from '@antv/aimapui';

/**
 * 发散图例 — LegendDiverging
 *
 * 双极渐变：偏离中性值（如均值、0）两端使用不同色调，常用于增长率、温差等场景。
 */
export default function LegendDivergingDemo() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
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
          minWidth: 240,
        }}
      >
        <LegendDiverging
          type="diverging"
          title="GDP 同比增长率"
          colors={['#ef4444', '#f3f4f6', '#10b981']}
          labels={['-10%', '+10%']}
          middleLabel="0%"
        />
      </div>
    </div>
  );
}

import React from 'react';
import { AiMap, LegendIcon } from '@antv/aimapui';

/**
 * 图标图例 — LegendIcon
 *
 * 以图标 + 文字的方式展示符号语义，常用于 POI 类别、专题图层标注等。
 */
export default function LegendIconDemo() {
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
        }}
      >
        <LegendIcon
          type="icon"
          title="POI 类型"
          items={[
            { icon: '🍜', label: '餐饮' },
            { icon: '🛍️', label: '购物' },
            { icon: '🚇', label: '交通' },
            { icon: '🏨', label: '住宿' },
            { icon: '⛰️', label: '景点' },
          ]}
        />
      </div>
    </div>
  );
}

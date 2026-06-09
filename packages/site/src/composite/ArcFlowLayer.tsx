import React from 'react';
import { AiMap, ZoomControl } from '@antv/aimapui';
import { ArcFlowLayer } from '@antv/aimapui';
import { LegendCategories } from '@antv/aimapui';

const odData = [
  { fromLng: 116.4, fromLat: 39.9, toLng: 121.5, toLat: 31.2, weight: 95, fromName: '北京', toName: '上海' },
  { fromLng: 116.4, fromLat: 39.9, toLng: 113.3, toLat: 23.1, weight: 80, fromName: '北京', toName: '广州' },
  { fromLng: 116.4, fromLat: 39.9, toLng: 104.1, toLat: 30.6, weight: 60, fromName: '北京', toName: '成都' },
  { fromLng: 121.5, fromLat: 31.2, toLng: 114.1, toLat: 22.5, weight: 75, fromName: '上海', toName: '深圳' },
  { fromLng: 121.5, fromLat: 31.2, toLng: 120.2, toLat: 30.3, weight: 50, fromName: '上海', toName: '杭州' },
  { fromLng: 113.3, fromLat: 23.1, toLng: 114.1, toLat: 22.5, weight: 85, fromName: '广州', toName: '深圳' },
  { fromLng: 104.1, fromLat: 30.6, toLng: 106.6, toLat: 29.6, weight: 45, fromName: '成都', toName: '重庆' },
  { fromLng: 116.4, fromLat: 39.9, toLng: 114.3, toLat: 30.6, weight: 55, fromName: '北京', toName: '武汉' },
  { fromLng: 121.5, fromLat: 31.2, toLng: 118.8, toLat: 32.1, weight: 40, fromName: '上海', toName: '南京' },
  { fromLng: 113.3, fromLat: 23.1, toLng: 108.3, toLat: 22.8, weight: 35, fromName: '广州', toName: '南宁' },
  { fromLng: 116.4, fromLat: 39.9, toLng: 108.9, toLat: 34.3, weight: 50, fromName: '北京', toName: '西安' },
  { fromLng: 104.1, fromLat: 30.6, toLng: 107.9, toLat: 30.8, weight: 30, fromName: '成都', toName: '达州' },
];

/**
 * 弧线流向复合图层 Demo — 使用 ArcFlowLayer 组件
 */
export default function ArcFlowLayerDemo() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        autoFit
        map={{
          basemap: 'gaode',
          center: [112, 32],
          zoom: 4.5,
          pitch: 0,
          style: 'dark',
        }}
      >
        <ArcFlowLayer
          source={odData}
          shape="arc"
          color="#60a5fa"
          lineWidthRange={[1, 4]}
          weightField="weight"
          opacity={0.85}
          showNodes
          nodeColor="#60a5fa"
          nodeSizeRange={[4, 10]}
          activeColor="#fbbf24"
        />

        <ZoomControl position="bottomright" />

        <LegendCategories
          type="categories"
          title="流量等级"
          labels={['核心枢纽 (80+)', '标准流向 (40~80)', '基础关联 (<40)']}
          colors={['#2563eb', '#60a5fa', '#93c5fd']}
        />
      </AiMap>
    </div>
  );
}

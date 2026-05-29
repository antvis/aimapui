import React from 'react';
import { AiMap, MobileSheetLegend } from '@antv/aimapui';

/**
 * 移动端弹出式图例 — MobileSheetLegend
 *
 * 玻璃拟态面板，点击标题栏展开/收起，支持同时承载多个不同类型的图例。
 */
export default function MobileSheetLegendDemo() {
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
      <MobileSheetLegend
        legends={[
          {
            type: 'categories',
            title: 'POI 类型',
            labels: ['餐饮', '购物', '交通', '住宿', '景点'],
            colors: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'],
            swatchShape: 'circle',
          },
          {
            type: 'ramp',
            title: '人口密度 (人/km²)',
            labels: ['0', '500', '1000', '2000', '5000'],
            colors: ['#eff6ff', '#bfdbfe', '#60a5fa', '#2563eb', '#1e3a8a'],
            isContinuous: true,
          },
        ]}
      />
    </div>
  );
}

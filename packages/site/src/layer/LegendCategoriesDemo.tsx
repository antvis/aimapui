import React from 'react';
import { AiMap, LegendCategories } from '@antv/aimapui';

/**
 * 分类图例 — LegendCategories
 *
 * 离散色块列表，常用于 POI 分类、土地利用类型等离散字段映射。
 */
export default function LegendCategoriesDemo() {
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
        <LegendCategories
          type="categories"
          title="POI 类型"
          labels={['餐饮', '购物', '交通', '住宿', '景点']}
          colors={['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6']}
          swatchShape="circle"
        />
      </div>
    </div>
  );
}

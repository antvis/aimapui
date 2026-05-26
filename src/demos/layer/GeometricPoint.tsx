import React, { useState, useCallback } from 'react';
import { Aimap, PointLayer, ZoomControl } from '../../index';
import { Tooltip } from '../../components/Interaction/Tooltip';
import { LegendCategories } from '../../components/Legend/LegendCategories';
import type { LayerEventPayload } from '../../schema/types';

/**
 * 模拟多类型 POI 数据：
 * - circle: 仓库（连续、中性）
 * - triangle: 风险监控点（警告、方向）
 * - hexagon: 基站节点（技术、结构化）
 * - square: 行政机构（稳固、静态）
 */
const poiData = [
  // 仓库 — circle
  { lng: 116.46, lat: 39.92, name: '北京仓库', category: 'warehouse', weight: 90 },
  { lng: 121.47, lat: 31.23, name: '上海仓库', category: 'warehouse', weight: 85 },
  { lng: 113.26, lat: 23.13, name: '广州仓库', category: 'warehouse', weight: 78 },
  { lng: 104.07, lat: 30.67, name: '成都仓库', category: 'warehouse', weight: 70 },
  // 风险点 — triangle
  { lng: 117.0, lat: 36.67, name: '济南监控', category: 'risk', weight: 60 },
  { lng: 112.98, lat: 28.21, name: '长沙监控', category: 'risk', weight: 55 },
  { lng: 106.55, lat: 29.56, name: '重庆监控', category: 'risk', weight: 65 },
  { lng: 120.15, lat: 30.28, name: '杭州监控', category: 'risk', weight: 50 },
  // 基站 — hexagon
  { lng: 114.06, lat: 22.54, name: '深圳基站A', category: 'station', weight: 80 },
  { lng: 114.41, lat: 30.52, name: '武汉基站B', category: 'station', weight: 72 },
  { lng: 108.95, lat: 34.27, name: '西安基站C', category: 'station', weight: 58 },
  { lng: 118.78, lat: 32.06, name: '南京基站D', category: 'station', weight: 62 },
  // 行政机构 — square
  { lng: 115.97, lat: 40.45, name: '延庆行政', category: 'admin', weight: 40 },
  { lng: 121.75, lat: 31.05, name: '浦东行政', category: 'admin', weight: 45 },
  { lng: 113.65, lat: 34.76, name: '郑州行政', category: 'admin', weight: 42 },
  { lng: 110.35, lat: 20.02, name: '海口行政', category: 'admin', weight: 38 },
];

const SHAPE_MAP: Record<string, string> = {
  warehouse: 'circle',
  risk: 'triangle',
  station: 'hexagon',
  admin: 'square',
};

const COLOR_MAP: Record<string, string> = {
  warehouse: '#2563eb',
  risk: '#ef4444',
  station: '#10b981',
  admin: '#f59e0b',
};

const CATEGORY_LABELS = ['仓库 (Circle)', '风险点 (Triangle)', '基站 (Hexagon)', '行政 (Square)'];
const CATEGORY_COLORS = ['#2563eb', '#ef4444', '#10b981', '#f59e0b'];

/**
 * 几何点位图 Demo
 *
 * 遵循设计规范：
 * - 形状作为分类编码（圆/三角/六边形/方形）
 * - 尺寸按权重映射 (8~48px)
 * - 描边确保轮廓清晰
 * - Hover 高亮反馈
 */
export default function GeometricPointDemo() {
  const [tooltipInfo, setTooltipInfo] = useState<{
    visible: boolean; lng: number; lat: number; name: string; category: string; weight: number;
  }>({ visible: false, lng: 0, lat: 0, name: '', category: '', weight: 0 });

  const handleMouseMove = useCallback((payload: LayerEventPayload) => {
    const feature = payload.feature;
    if (!feature) return;
    setTooltipInfo({
      visible: true,
      lng: payload.lng,
      lat: payload.lat,
      name: String(feature.name ?? ''),
      category: String(feature.category ?? ''),
      weight: Number(feature.weight ?? 0),
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltipInfo((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'gaode',
          center: [112, 32],
          zoom: 4.2,
          style: 'light',
        }}
      >
        {/* 按类型分层渲染不同形状 */}
        {Object.entries(SHAPE_MAP).map(([category, shape]) => (
          <PointLayer
            key={category}
            source={poiData.filter((d) => d.category === category)}
            shape={shape}
            color={COLOR_MAP[category]}
            size={12}
            sizeField="weight"
            sizeValues={[8, 28]}
            style={{
              opacity: 0.85,
              strokeWidth: 1.5,
              stroke: '#ffffff',
            }}
            active={{ color: '#fbbf24' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        ))}

        <Tooltip
          longitude={tooltipInfo.lng}
          latitude={tooltipInfo.lat}
          variant="glass"
          visible={tooltipInfo.visible}
          items={[
            { label: '名称', value: tooltipInfo.name },
            { label: '类型', value: tooltipInfo.category },
            { label: '权重', value: tooltipInfo.weight },
          ]}
        />

        <ZoomControl position="bottomright" />

        <LegendCategories
          type="categories"
          title="POI 类型"
          labels={CATEGORY_LABELS}
          colors={CATEGORY_COLORS}
        />
      </Aimap>
    </div>
  );
}

import React, { useState } from 'react';
import { Aimap, PointLayer, LineLayer, HeatmapLayer, ZoomControl } from '../../index';
const cities = [
  { lng: 116.4, lat: 39.9, name: '北京', pop: 2189 },
  { lng: 121.5, lat: 31.2, name: '上海', pop: 2487 },
  { lng: 113.3, lat: 23.1, name: '广州', pop: 1868 },
  { lng: 114.1, lat: 22.5, name: '深圳', pop: 1756 },
  { lng: 104.1, lat: 30.6, name: '成都', pop: 2119 },
  { lng: 106.6, lat: 29.6, name: '重庆', pop: 3212 },
  { lng: 120.2, lat: 30.3, name: '杭州', pop: 1237 },
  { lng: 114.3, lat: 30.6, name: '武汉', pop: 1121 },
  { lng: 108.9, lat: 34.3, name: '西安', pop: 1295 },
  { lng: 118.8, lat: 32.1, name: '南京', pop: 942 },
];

const flows = [
  { lng: 121.5, lat: 31.2, lng1: 116.4, lat1: 39.9, volume: 500 },
  { lng: 113.3, lat: 23.1, lng1: 116.4, lat1: 39.9, volume: 350 },
  { lng: 104.1, lat: 30.6, lng1: 116.4, lat1: 39.9, volume: 280 },
  { lng: 114.1, lat: 22.5, lng1: 113.3, lat1: 23.1, volume: 420 },
  { lng: 106.6, lat: 29.6, lng1: 104.1, lat1: 30.6, volume: 300 },
  { lng: 120.2, lat: 30.3, lng1: 121.5, lat1: 31.2, volume: 450 },
];

const heatData = Array.from({ length: 150 }, () => ({
  lng: 116.0 + Math.random() * 0.8,
  lat: 39.6 + Math.random() * 0.6,
  value: Math.random() * 100,
}));

type LayerKey = 'points' | 'lines' | 'heatmap';

/**
 * 多图层叠加 — 动态增删图层
 */
export default function Demo13MultiLayer() {
  const [visible, setVisible] = useState<Record<LayerKey, boolean>>({
    points: true,
    lines: true,
    heatmap: false,
  });

  const toggle = (key: LayerKey) => setVisible((v) => ({ ...v, [key]: !v[key] }));

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{ basemap: 'gaode', center: [108, 32], zoom: 4, style: visible.heatmap ? 'dark' : 'light' }}
      >
        {visible.points && (
          <PointLayer
            source={cities}
            colorField="pop"
            colorValues={['#5B8FF9', '#5AD8A6', '#F6BD16', '#E8684A']}
            sizeField="pop"
            sizeValues={[8, 24]}
            active={{ color: '#fff' }}
          />
        )}
        {visible.lines && (
          <LineLayer
            source={flows}
            sourceConfig={{ x: 'lng', y: 'lat', x1: 'lng1', y1: 'lat1' }}
            color="#5B8FF9"
            size={1.5}
            animate={{ enable: true, duration: 3, trailLength: 1 }}
          />
        )}
        {visible.heatmap && (
          <HeatmapLayer source={heatData} sizeField="value" />
        )}
        <ZoomControl />
      </Aimap>

      {/* 控制面板 */}
      </div>
  );
}
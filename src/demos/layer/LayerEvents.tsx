import React, { useState } from 'react';
import { Aimap, PointLayer, ZoomControl, ScaleControl } from '../../index';
import type { LayerEventPayload } from '../../index';
const cities = [
  { lng: 116.4, lat: 39.9, name: '北京', value: 100, category: 'A' },
  { lng: 121.5, lat: 31.2, name: '上海', value: 90, category: 'A' },
  { lng: 113.3, lat: 23.1, name: '广州', value: 80, category: 'B' },
  { lng: 114.1, lat: 22.5, name: '深圳', value: 85, category: 'B' },
  { lng: 104.1, lat: 30.6, name: '成都', value: 70, category: 'C' },
  { lng: 106.6, lat: 29.6, name: '重庆', value: 75, category: 'C' },
  { lng: 120.2, lat: 30.3, name: '杭州', value: 65, category: 'B' },
  { lng: 114.3, lat: 30.6, name: '武汉', value: 60, category: 'C' },
];

/**
 * 图层事件 — onClick / onMouseEnter / onMouseLeave
 */
export default function Demo14LayerEvents() {
  const [selected, setSelected] = useState<{ name: string; value: number; category: string } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const handleClick = (payload: LayerEventPayload) => {
    if (payload.feature) {
      setSelected({
        name: payload.feature.name as string,
        value: payload.feature.value as number,
        category: payload.feature.category as string,
      });
    }
  };

  const handleMouseEnter = (payload: LayerEventPayload) => {
    if (payload.feature?.name) {
      setHovered(payload.feature.name as string);
    }
  };

  const handleMouseLeave = () => {
    setHovered(null);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{ basemap: 'gaode', center: [112, 30], zoom: 5, style: 'light' }}
      >
        <PointLayer
          source={cities}
          colorField="category"
          colorValues={['#5B8FF9', '#5AD8A6', '#F6BD16']}
          size={16}
          active={{ color: '#E8684A' }}
          select={{ color: '#E8684A' }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        <ZoomControl />
        <ScaleControl />
      </Aimap>

      {/* 信息面板 */}
      </div>
  );
}
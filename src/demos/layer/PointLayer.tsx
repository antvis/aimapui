import React from 'react';
import { Aimap, PointLayer, ZoomControl } from '../../index';
const cities = [
  { lng: 116.4, lat: 39.9, name: '北京', value: 100 },
  { lng: 121.5, lat: 31.2, name: '上海', value: 90 },
  { lng: 113.3, lat: 23.1, name: '广州', value: 80 },
  { lng: 114.1, lat: 22.5, name: '深圳', value: 85 },
  { lng: 104.1, lat: 30.6, name: '成都', value: 70 },
  { lng: 106.6, lat: 29.6, name: '重庆', value: 75 },
  { lng: 120.2, lat: 30.3, name: '杭州', value: 65 },
  { lng: 114.3, lat: 30.6, name: '武汉', value: 60 },
  { lng: 108.9, lat: 34.3, name: '西安', value: 55 },
  { lng: 118.8, lat: 32.1, name: '南京', value: 58 },
];

/**
 * 点图层 — PointLayer 基础用法
 */
export default function Demo08PointLayer() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'gaode',
          center: [105, 35],
          zoom: 4,
          style: 'light',
        }}
      >
        <PointLayer
          source={cities}
          color="#5B8FF9"
          size={12}
          active={{ color: '#F6BD16' }}
        />
        <ZoomControl />
      </Aimap>
</div>
  );
}
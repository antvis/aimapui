import React from 'react';
import { Aimap, PointLayer, ExportImageControl } from '../../index';
const cities = [
  { lng: 116.4, lat: 39.9, name: '北京', value: 100 },
  { lng: 121.5, lat: 31.2, name: '上海', value: 90 },
  { lng: 113.3, lat: 23.1, name: '广州', value: 80 },
  { lng: 114.1, lat: 22.5, name: '深圳', value: 85 },
  { lng: 104.1, lat: 30.6, name: '成都', value: 70 },
];

/**
 * 导出图片控件 — ExportImageControl
 * 将当前地图视图导出为 PNG 图片
 */
export default function Demo08ExportImage() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'gaode',
          center: [108, 32],
          zoom: 4,
          style: 'light',
        }}
      >
        <PointLayer source={cities} color="#5B8FF9" size={12} />
        <ExportImageControl />
      </Aimap>
</div>
  );
}
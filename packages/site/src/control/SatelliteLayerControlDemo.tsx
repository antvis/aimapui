import React, { useState } from 'react';
import {
  AiMap,
  SatelliteLayer,
  SatelliteLayerControl,
  PointLayer,
} from '@antv/aimapui';
import type { SatelliteProvider } from '@antv/aimapui';

const cities = [
  { lng: 116.4, lat: 39.9, name: '北京' },
  { lng: 121.5, lat: 31.2, name: '上海' },
  { lng: 113.3, lat: 23.1, name: '广州' },
  { lng: 114.1, lat: 22.5, name: '深圳' },
  { lng: 104.1, lat: 30.6, name: '成都' },
  { lng: 120.2, lat: 30.3, name: '杭州' },
];

/**
 * SatelliteLayerControl Demo
 *
 * 演示卫星影像控件的完整功能：
 * - 提供商切换（高德/天地图/谷歌）
 * - 可见性开关
 * - 透明度调节
 */
export default function SatelliteLayerControlDemo() {
  const [provider, setProvider] = useState<SatelliteProvider>('gaode');
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(0.8);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        autoFit
        map={{
          basemap: 'map',
          center: [108, 32],
          zoom: 4,
          style: 'light',
        }}
      >
        {/* 卫星影像图层 */}
        <SatelliteLayer
          provider={provider}
          visible={visible}
          opacity={opacity}
        />

        {/* 城市点位（叠加在卫星影像上） */}
        <PointLayer
          source={cities}
          sourceType="json"
          sourceConfig={{ x: 'lng', y: 'lat' }}
          color="#ef4444"
          size={8}
          shape="circle"
          style={{ stroke: '#fff', strokeWidth: 2 }}
        />

        {/* 卫星影像控件 */}
        <SatelliteLayerControl
          position="topright"
          activeProvider={provider}
          visible={visible}
          opacity={opacity}
          providers={['gaode', 'tianditu', 'google']}
          onProviderChange={setProvider}
          onVisibleChange={setVisible}
          onOpacityChange={setOpacity}
        />
      </AiMap>
    </div>
  );
}

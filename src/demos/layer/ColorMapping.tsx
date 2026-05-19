import React from 'react';
import { Aimap, PointLayer, ZoomControl } from '../../index';
const points = Array.from({ length: 40 }, () => ({
  lng: 116.1 + Math.random() * 0.6,
  lat: 39.7 + Math.random() * 0.4,
  value: Math.round(Math.random() * 500),
}));

/**
 * 颜色映射 — colorField + colorValues
 */
export default function Demo09ColorMapping() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'gaode',
          center: [116.397, 39.909],
          zoom: 10,
          style: 'light',
        }}
      >
        <PointLayer
          source={points}
          colorField="value"
          colorValues={['#2166AC', '#67A9CF', '#D1E5F0', '#FDDBC7', '#EF8A62', '#B2182B']}
          size={16}
        />
        <ZoomControl />
      </Aimap>
</div>
  );
}
import React from 'react';
import { Aimap, PointLayer, ZoomControl } from '../../index';
const points = Array.from({ length: 30 }, () => ({
  lng: 121.3 + Math.random() * 0.5,
  lat: 31.1 + Math.random() * 0.3,
  value: Math.round(Math.random() * 400 + 10),
}));

/**
 * 大小映射 — sizeField + sizeValues
 */
export default function Demo10SizeMapping() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'gaode',
          center: [121.473, 31.23],
          zoom: 10,
          style: 'light',
        }}
      >
        <PointLayer
          source={points}
          color="#5B8FF9"
          sizeField="value"
          sizeValues={[6, 30]}
        />
        <ZoomControl />
      </Aimap>
</div>
  );
}
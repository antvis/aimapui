import React from 'react';
import { AiMap, GeoLocateControl } from '../../index';
/**
 * 定位控件 — GeoLocateControl
 */
export default function Demo05GeoLocate() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'gaode',
          center: [116.397, 39.909],
          zoom: 10,
          style: 'light',
        }}
      >
        <GeoLocateControl />
      </AiMap>
</div>
  );
}
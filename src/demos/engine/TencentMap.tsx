import React from 'react';
import { AiMap, ZoomControl, ScaleControl, GeoLocateControl } from '../../index';

/**
 * 腾讯地图 — 基础地图展示
 *
 * 使用腾讯地图引擎，包含：缩放、比例尺、定位控件
 */
export default function TencentMap() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'tencent',
          token: 'VZ2BZ-EZ7KZ-D4RXM-TZQDP-Q3PQH-TVF5L',
          center: [116.397, 39.909],
          zoom: 10,
          style: 'light',
        }}
      >
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />
        <GeoLocateControl position="topright" />
      </AiMap>
    </div>
  );
}

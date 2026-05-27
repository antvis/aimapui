import React from 'react';
import { AiMap, ZoomControl, ScaleControl, GeoLocateControl, MapThemeControl, OPENFREEMAP_THEME_PRESETS } from '../../index';

/**
 * Mapbox 地图 — 完整地图控件展示
 *
 * 包含：放大缩小、定位、比例尺、地图样式切换
 * 使用 Mapbox GL JS 引擎，需要配置 token
 */
export default function MapboxMap() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'mapbox',
          center: [116.397, 39.909],
          zoom: 10,
          style: 'light',
        }}
      >
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />
        <GeoLocateControl position="topright" />
        <MapThemeControl position="topleft" options={OPENFREEMAP_THEME_PRESETS} />
      </AiMap>
    </div>
  );
}

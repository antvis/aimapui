import React from 'react';
import { AiMap, PointLayer, ZoomControl, ScaleControl, GeoLocateControl, MapThemeControl, OPENFREEMAP_THEME_PRESETS } from '@antv/aimapui';
import { CHINA_CITIES } from './data';

/**
 * Maplibre 地图 — 完整地图控件展示 + 城市点图层
 *
 * 使用开源 Maplibre GL JS 引擎，支持自定义矢量瓦片样式
 */
export default function MaplibreMap() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'maplibre',
          center: [105, 35],
          zoom: 4,
          style: 'light',
        }}
      >
        <PointLayer
          source={CHINA_CITIES}
          color="#5B8FF9"
          size={12}
          active={{ color: '#F6BD16' }}
        />
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />
        <GeoLocateControl position="topright" />
        <MapThemeControl position="topleft" options={OPENFREEMAP_THEME_PRESETS} />
      </AiMap>
    </div>
  );
}

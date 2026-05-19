import React from 'react';
import { Aimap, ZoomControl, ScaleControl, GeoLocateControl, MapThemeControl, OPENFREEMAP_THEME_PRESETS } from '../../index';

/**
 * Maplibre 地图 — 完整地图控件展示
 *
 * 包含：放大缩小、定位、比例尺、地图样式切换
 * 使用开源 Maplibre GL JS 引擎，支持自定义矢量瓦片样式
 */
export default function MaplibreMap() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'maplibre',
          center: [116.397, 39.909],
          zoom: 10,
          style: 'light',
        }}
      >
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />
        <GeoLocateControl position="topright" />
        <MapThemeControl position="topleft" options={OPENFREEMAP_THEME_PRESETS} />
      </Aimap>
    </div>
  );
}

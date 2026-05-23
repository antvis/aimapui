import React from 'react';
import { Aimap, ZoomControl, ScaleControl, GeoLocateControl, MapThemeControl, GAODE_THEME_PRESETS } from '../../index';

/**
 * 高德地图 — 完整地图控件展示
 *
 * 包含：放大缩小、定位、比例尺、地图样式切换
 */
export default function GaodeMap() {
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
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />
        <GeoLocateControl position="topright" />
        <MapThemeControl position="topleft" options={GAODE_THEME_PRESETS} />
      </Aimap>
    </div>
  );
}

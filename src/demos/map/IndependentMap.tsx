import React from 'react';
import { Aimap, ZoomControl, ScaleControl, GeoLocateControl, MapThemeControl, INDEPENDENT_MAP_THEME_PRESETS } from '../../index';

/**
 * 独立 Map — 完整地图控件展示
 *
 * 包含：放大缩小、定位、比例尺、地图样式切换
 * 使用 L7 内置地图引擎，无需第三方地图服务和 token
 */
export default function IndependentMap() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'map',
          center: [116.397, 39.909],
          zoom: 10,
          style: 'light',
        }}
      >
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />
        <GeoLocateControl position="topright" />
        <MapThemeControl position="topleft" options={INDEPENDENT_MAP_THEME_PRESETS} />
      </Aimap>
    </div>
  );
}

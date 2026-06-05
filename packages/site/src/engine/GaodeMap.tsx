import React from 'react';
import { AiMap, PointLayer, ZoomControl, ScaleControl, GeoLocateControl, MapThemeControl, GAODE_THEME_PRESETS } from '@antv/aimapui';
import { CHINA_CITIES } from './data';

/**
 * 高德地图 — 完整地图控件展示 + 城市点图层
 *
 * 包含：放大缩小、定位、比例尺、地图样式切换、城市可视化图层
 */
export default function GaodeMap() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        autoFit
        map={{
          basemap: 'gaode',
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
        <MapThemeControl position="topleft" options={GAODE_THEME_PRESETS} />
      </AiMap>
    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { AiMap, PointLayer, RasterLayer, ZoomControl, ScaleControl, GeoLocateControl, MapThemeControl } from '@antv/aimapui';
import type { ThemeOption } from '@antv/aimapui';
import { CHINA_CITIES } from './data';

const TDT_TOKEN = 'b88bfb160c81dab8d9d20aaa74846360';

/** 天地图底图样式配置 */
const TIANDITU_STYLES: ThemeOption[] = [
  {
    text: '矢量底图',
    value: 'vec',
    preview: 'linear-gradient(135deg, #e8e8e8 0%, #c8d8e8 40%, #a8c8d8 100%)',
  },
  {
    text: '卫星影像',
    value: 'img',
    preview: 'linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 40%, #1d4a2d 100%)',
  },
  {
    text: '地形渲染',
    value: 'ter',
    preview: 'linear-gradient(135deg, #c8b88a 0%, #a8c878 40%, #98b868 100%)',
  },
];

/** value → 对应的文字标注图层 key */
const LABEL_LAYER_MAP: Record<string, string> = {
  vec: 'cva',
  img: 'cia',
  ter: 'cta',
};

/** 生成天地图 WMTS 瓦片 URL（支持多域名负载均衡） */
function getTiandituTileUrl(layerType: string): string {
  return `https://t{1-7}.tianditu.gov.cn/${layerType}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layerType}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${TDT_TOKEN}`;
}

const RASTER_TILE_PARSER = { parser: { type: 'rasterTile' as const, tileSize: 256, zoomOffset: 1 } };

/**
 * 独立 Map — 天地图底图展示
 *
 * 使用 L7 内置地图引擎 + RasterLayer 加载天地图 WMTS 瓦片服务
 * 使用 MapThemeControl 支持三种底图切换：矢量底图、卫星影像、地形渲染
 * 每种底图自动叠加对应的文字标注图层
 */
export default function IndependentMap() {
  const [activeStyle, setActiveStyle] = useState('vec');

  const handleThemeChange = useCallback((value: string) => {
    setActiveStyle(value);
  }, []);

  const labelKey = LABEL_LAYER_MAP[activeStyle] ?? 'cva';

  return (
    <AiMap
      autoFit
      key={activeStyle}
      map={{
        basemap: 'map',
        center: [105, 35],
        zoom: 4,
        style: 'blank',
      }}
    >
      {/* 城市点图层 */}
      <PointLayer
        source={CHINA_CITIES}
        color="#5B8FF9"
        size={12}
        active={{ color: '#F6BD16' }}
        zIndex={2}
      />
      {/* 底图瓦片层 */}
      <RasterLayer
        source={getTiandituTileUrl(activeStyle)}
        sourceType="rasterTile"
        sourceConfig={RASTER_TILE_PARSER}
        zIndex={0}
      />
      {/* 文字标注层 */}
      <RasterLayer
        source={getTiandituTileUrl(labelKey)}
        sourceType="rasterTile"
        sourceConfig={RASTER_TILE_PARSER}
        zIndex={1}
      />
      <ZoomControl position="bottomright" />
      <ScaleControl position="bottomleft" />
      <GeoLocateControl position="topright" />
      <MapThemeControl
        position="topright"
        options={TIANDITU_STYLES}
        defaultValue={activeStyle}
        onThemeChange={handleThemeChange}
      />
    </AiMap>
  );
}
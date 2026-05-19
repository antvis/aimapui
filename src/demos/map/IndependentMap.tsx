import React from 'react';
import { Aimap, RasterLayer, ZoomControl, ScaleControl, GeoLocateControl } from '../../index';

const TDT_TOKEN = 'b88bfb160c81dab8d9d20aaa74846360';

/** 生成天地图 WMTS 瓦片 URL（支持多域名负载均衡） */
function getTiandituTileUrl(layerType: string): string {
  return `https://t{1-7}.tianditu.gov.cn/${layerType}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layerType}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${TDT_TOKEN}`;
}

const RASTER_TILE_PARSER = { parser: { type: 'rasterTile' as const, tileSize: 256, zoomOffset: 0 } };

/**
 * 独立 Map — 天地图卫星影像
 *
 * 使用 L7 内置地图引擎 + RasterLayer 加载天地图卫星影像瓦片
 * 包含：放大缩小、定位、比例尺
 */
export default function IndependentMap() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'map',
          center: [116.397, 39.909],
          zoom: 10,
          style: 'blank',
        }}
      >
        {/* 天地图卫星影像底图 */}
        <RasterLayer
          source={getTiandituTileUrl('img')}
          sourceType="rasterTile"
          sourceConfig={RASTER_TILE_PARSER}
          zIndex={0}
        />
        {/* 天地图影像标注层 */}
        <RasterLayer
          source={getTiandituTileUrl('cia')}
          sourceType="rasterTile"
          sourceConfig={RASTER_TILE_PARSER}
          zIndex={1}
        />
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />
        <GeoLocateControl position="topright" />
      </Aimap>
    </div>
  );
}

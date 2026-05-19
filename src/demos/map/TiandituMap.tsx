import React, { useState } from 'react';
import { Aimap, RasterLayer, ZoomControl, ScaleControl, GeoLocateControl } from '../../index';

const TDT_TOKEN = 'b88bfb160c81dab8d9d20aaa74846360';

/**
 * 天地图底图类型配置
 *
 * 天地图 WMTS 瓦片服务（通过 L7 RasterLayer 加载）：
 * - vec_w: 矢量底图     + cva_w: 矢量标注
 * - img_w: 卫星影像     + cia_w: 影像标注
 * - ter_w: 地形渲染     + cta_w: 地形标注
 */
const TIANDITU_STYLES = [
  {
    key: 'vec',
    label: '矢量底图',
    labelLayer: 'cva',
    preview: 'linear-gradient(135deg, #e8e8e8 0%, #c8d8e8 40%, #a8c8d8 100%)',
  },
  {
    key: 'img',
    label: '卫星影像',
    labelLayer: 'cia',
    preview: 'linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 40%, #1d4a2d 100%)',
  },
  {
    key: 'ter',
    label: '地形渲染',
    labelLayer: 'cta',
    preview: 'linear-gradient(135deg, #c8b88a 0%, #a8c878 40%, #98b868 100%)',
  },
];

/** 生成天地图 WMTS 瓦片 URL（支持多域名负载均衡） */
function getTiandituTileUrl(layerType: string): string {
  return `https://t{1-7}.tianditu.gov.cn/${layerType}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layerType}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${TDT_TOKEN}`;
}

const RASTER_TILE_PARSER = { parser: { type: 'rasterTile' as const, tileSize: 256, zoomOffset: 0 } };

/**
 * 天地图 — 完整地图控件展示
 *
 * 使用 L7 独立 Map + RasterLayer 加载天地图 WMTS 瓦片服务
 * 包含：放大缩小、定位、比例尺、底图样式切换
 * 支持三种底图：矢量底图、卫星影像、地形渲染
 * 每种底图自动叠加对应的文字标注图层
 */
export default function TiandituMap() {
  const [activeStyle, setActiveStyle] = useState(TIANDITU_STYLES[0]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        key={activeStyle.key}
        map={{
          basemap: 'map',
          center: [116.397, 39.909],
          zoom: 10,
          style: 'blank',
        }}
      >
        {/* 底图瓦片层 */}
        <RasterLayer
          source={getTiandituTileUrl(activeStyle.key)}
          sourceType="rasterTile"
          sourceConfig={RASTER_TILE_PARSER}
          zIndex={0}
        />
        {/* 文字标注层 */}
        <RasterLayer
          source={getTiandituTileUrl(activeStyle.labelLayer)}
          sourceType="rasterTile"
          sourceConfig={RASTER_TILE_PARSER}
          zIndex={1}
        />
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />
        <GeoLocateControl position="topright" />
      </Aimap>

      {/* 天地图底图切换面板 */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 999,
          display: 'flex',
          gap: 6,
          padding: 6,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        {TIANDITU_STYLES.map((item) => {
          const isActive = activeStyle.key === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveStyle(item)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 12px',
                border: isActive ? '2px solid #1677ff' : '2px solid transparent',
                borderRadius: 6,
                background: isActive ? '#e6f4ff' : '#f5f5f5',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: 72,
              }}
              title={item.label}
            >
              <div
                style={{
                  width: 48,
                  height: 32,
                  borderRadius: 4,
                  background: item.preview,
                }}
              />
              <span style={{ fontSize: 11, color: isActive ? '#1677ff' : '#666', fontWeight: isActive ? 600 : 400 }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

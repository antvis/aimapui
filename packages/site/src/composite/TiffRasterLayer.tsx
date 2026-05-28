import React, { useState } from 'react';
import { AiMap, ZoomControl } from '@antv/aimapui';
import { TiffRasterLayer } from '@antv/aimapui';
import { Legend } from '../components/Legend';

/** 夜光色带 */
const NIGHTLIGHT_RAMP = {
  type: 'linear' as const,
  colors: [
    'rgba(92,58,16,0)',
    'rgba(92,58,16,0)',
    '#fabd08',
    '#f1e93f',
    '#f1ff8f',
    '#fcfff7',
  ],
  positions: [0, 3, 9, 22.5, 45, 90],
};

/** NDVI 色带 — 植被指数 */
const NDVI_RAMP = {
  colors: ['#ce4a2e', '#f0a875', '#fff8ba', '#bddd8a', '#5da73e', '#235117'],
  positions: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
};

type DemoMode = 'nightlight' | 'rgb' | 'ndvi';

/** 各模式的地图配置 */
const MAP_CONFIG: Record<DemoMode, { center: [number, number]; zoom: number }> = {
  nightlight: { center: [105, 37.5], zoom: 3 },
  rgb: { center: [105, 37.5], zoom: 3 },
  ndvi: { center: [130.5, 47], zoom: 10 },
};

/**
 * GeoTIFF 栅格可视化 Demo
 *
 * - 夜光模式：单波段伪彩色映射
 * - RGB 模式：多波段真彩色合成 + 中国边界遮罩
 * - NDVI 模式：归一化植被指数（NDI bands [3,4]）
 */
export default function TiffRasterLayerDemo() {
  const [mode, setMode] = useState<DemoMode>('nightlight');

  const mapCfg = MAP_CONFIG[mode];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        map={{
          basemap: 'gaode',
          center: mapCfg.center,
          zoom: mapCfg.zoom,
          style: 'dark',
        }}
      >
        {mode === 'nightlight' && (
          <TiffRasterLayer
            url="https://gw.alipayobjects.com/zos/antvdemo/assets/light_clip/lightF182013.tiff"
            renderMode="raster"
            domain={[0, 90]}
            noDataValue={0}
            rampColors={NIGHTLIGHT_RAMP}
            opacity={0.8}
          />
        )}

        {mode === 'rgb' && (
          <TiffRasterLayer
            url="https://gw.alipayobjects.com/zos/raptor/1667920165972/china.tif"
            renderMode="rgb"
            bands={[0, 1, 2]}
            rMinMax={[0, 255]}
            gMinMax={[0, 255]}
            bMinMax={[0, 255]}
            opacity={1}
            mask
            maskData="https://gw.alipayobjects.com/os/basement_prod/d2e0e930-fd44-4fca-8872-c1037b0fee7b.json"
          />
        )}

        {mode === 'ndvi' && (
          <TiffRasterLayer
            url="https://gw.alipayobjects.com/zos/raptor/1667832825992/LC08_3857_clip_2.tif"
            renderMode="ndi"
            bands={[3, 4]}
            domain={[-0.3, 0.5]}
            rampColors={NDVI_RAMP}
            extent={[130.39565357746957, 46.905730725742366, 130.73364094187343, 47.10217234153133]}
            opacity={0.9}
          />
        )}

        <ZoomControl position="bottomright" />
      </AiMap>

      {/* 模式切换 */}
      <div style={{
        position: 'absolute', top: 16, left: 16, zIndex: 10,
        display: 'flex', gap: 6, flexWrap: 'wrap',
      }}>
        {([
          { key: 'nightlight' as DemoMode, label: '夜光（单波段）' },
          { key: 'rgb' as DemoMode, label: '卫星（RGB）' },
          { key: 'ndvi' as DemoMode, label: 'NDVI（植被指数）' },
        ]).map((item) => (
          <button
            key={item.key}
            onClick={() => setMode(item.key)}
            style={{
              padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              background: mode === item.key ? 'rgba(6,182,212,0.2)' : 'rgba(15,23,42,0.8)',
              color: mode === item.key ? '#67e8f9' : '#94a3b8',
              backdropFilter: 'blur(8px)',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 图例 */}
      {mode === 'nightlight' && (
        <div style={{ position: 'absolute', bottom: 32, left: 16, zIndex: 10 }}>
          <Legend
            type="ramp"
            title="夜光强度"
            colors={['#1a1a00', '#fabd08', '#f1e93f', '#f1ff8f', '#fcfff7']}
            labels={['低', '高']}
          />
        </div>
      )}
      {mode === 'ndvi' && (
        <div style={{ position: 'absolute', bottom: 32, left: 16, zIndex: 10 }}>
          <Legend
            type="ramp"
            title="NDVI 植被指数"
            colors={['#ce4a2e', '#f0a875', '#fff8ba', '#bddd8a', '#5da73e', '#235117']}
            labels={['-0.3', '0.5']}
          />
        </div>
      )}
    </div>
  );
}

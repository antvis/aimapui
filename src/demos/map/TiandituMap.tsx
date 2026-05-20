import React, { useCallback, useRef, useState } from 'react';
import type { Scene } from '@antv/l7';
import { Aimap, ZoomControl, ScaleControl, GeoLocateControl } from '../../index';

const TDT_TOKEN = 'b88bfb160c81dab8d9d20aaa74846360';

/** 天地图底图类型配置 */
const TIANDITU_MAP_TYPES = [
  {
    key: 'normal',
    label: '矢量底图',
    typeConst: 'TMAP_NORMAL_MAP',
    preview: 'linear-gradient(135deg, #e8e8e8 0%, #c8d8e8 40%, #a8c8d8 100%)',
  },
  {
    key: 'satellite',
    label: '卫星影像',
    typeConst: 'TMAP_SATELLITE_MAP',
    preview: 'linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 40%, #1d4a2d 100%)',
  },
  {
    key: 'hybrid',
    label: '混合底图',
    typeConst: 'TMAP_HYBRID_MAP',
    preview: 'linear-gradient(135deg, #1a3a2a 0%, #3d6a3d 40%, #2d5a3d 100%)',
  },
  {
    key: 'terrain',
    label: '地形底图',
    typeConst: 'TMAP_TERRAIN_MAP',
    preview: 'linear-gradient(135deg, #c8b88a 0%, #a8c878 40%, #98b868 100%)',
  },
  {
    key: 'terrainHybrid',
    label: '地形混合',
    typeConst: 'TMAP_TERRAIN_HYBRID_MAP',
    preview: 'linear-gradient(135deg, #b8a87a 0%, #98b878 40%, #88a868 100%)',
  },
];

/**
 * 天地图 — 使用天地图原生引擎
 *
 * 通过 @antv/l7-maps 的 TMap（天地图引擎）直接加载天地图底图
 * 支持五种底图切换：矢量底图、卫星影像、混合底图、地形底图、地形混合
 * 包含：放大缩小、定位、比例尺
 */
export default function TiandituMap() {
  const nativeMapRef = useRef<any>(null);
  const [activeKey, setActiveKey] = useState('normal');

  const handleSceneReady = useCallback((scene: Scene) => {
    try {
      const mapService = (scene as any).mapService;
      const nativeMap = mapService?.map;
      nativeMapRef.current = nativeMap;

      // 移除天地图引擎自带的 Zoom 控件
      if (nativeMap) {
        const container = nativeMap.getContainer?.();
        if (container) {
          const zoomControls = container.querySelectorAll('.tdt-control-zoom');
          zoomControls.forEach((el: Element) => el.remove());
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleMapTypeChange = useCallback((typeConst: string, key: string) => {
    setActiveKey(key);
    try {
      const nativeMap = nativeMapRef.current;
      const TWindow = window as any;
      if (nativeMap && TWindow[typeConst] !== undefined) {
        nativeMap.setMapType(TWindow[typeConst]);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Aimap
        map={{
          basemap: 'tianditu',
          token: TDT_TOKEN,
          center: [116.397, 39.909],
          zoom: 10,
        }}
        onSceneReady={handleSceneReady}
      >
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
        {TIANDITU_MAP_TYPES.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleMapTypeChange(item.typeConst, item.key)}
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

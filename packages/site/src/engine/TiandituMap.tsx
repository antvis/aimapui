import React, { useCallback, useRef, useState } from 'react';
import type { Scene } from '@antv/l7';
import { AiMap, PointLayer, ZoomControl, ScaleControl, GeoLocateControl, MapThemeControl } from '@antv/aimapui';
import type { ThemeOption } from '@antv/aimapui';
import { CHINA_CITIES } from './data';

const TDT_TOKEN = 'b88bfb160c81dab8d9d20aaa74846360';

/** 天地图底图主题选项 */
const TIANDITU_THEME_OPTIONS: ThemeOption[] = [
  {
    text: '矢量底图',
    value: 'TMAP_NORMAL_MAP',
    preview: 'linear-gradient(135deg, #e8e8e8 0%, #c8d8e8 40%, #a8c8d8 100%)',
  },
  {
    text: '卫星影像',
    value: 'TMAP_SATELLITE_MAP',
    preview: 'linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 40%, #1d4a2d 100%)',
  },
  {
    text: '混合底图',
    value: 'TMAP_HYBRID_MAP',
    preview: 'linear-gradient(135deg, #1a3a2a 0%, #3d6a3d 40%, #2d5a3d 100%)',
  },
  {
    text: '地形底图',
    value: 'TMAP_TERRAIN_MAP',
    preview: 'linear-gradient(135deg, #c8b88a 0%, #a8c878 40%, #98b868 100%)',
  },
  {
    text: '地形混合',
    value: 'TMAP_TERRAIN_HYBRID_MAP',
    preview: 'linear-gradient(135deg, #b8a87a 0%, #98b878 40%, #88a868 100%)',
  },
];

/**
 * 天地图 — 使用天地图原生引擎
 *
 * 通过 @antv/l7-maps 的 TMap（天地图引擎）直接加载天地图底图
 * 使用 MapThemeControl 支持五种底图切换：矢量底图、卫星影像、混合底图、地形底图、地形混合
 * 包含：放大缩小、定位、比例尺、主题切换
 */
export default function TiandituMap() {
  const nativeMapRef = useRef<any>(null);
  const [currentTheme, setCurrentTheme] = useState('TMAP_NORMAL_MAP');

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

  const handleThemeChange = useCallback((value: string) => {
    setCurrentTheme(value);
    try {
      const nativeMap = nativeMapRef.current;
      const TWindow = window as any;
      if (nativeMap && TWindow[value] !== undefined) {
        nativeMap.setMapType(TWindow[value]);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <AiMap
      autoFit
      map={{
        basemap: 'tianditu',
        token: TDT_TOKEN,
        center: [105, 35],
        zoom: 4,
      }}
      onSceneReady={handleSceneReady}
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
      <MapThemeControl
        position="topright"
        options={TIANDITU_THEME_OPTIONS}
        defaultValue={currentTheme}
        onThemeChange={handleThemeChange}
      />
    </AiMap>
  );
}
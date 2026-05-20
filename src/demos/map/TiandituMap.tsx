import React, { useCallback } from 'react';
import type { Scene } from '@antv/l7';
import { Aimap, ZoomControl, ScaleControl, GeoLocateControl } from '../../index';

const TDT_TOKEN = 'b88bfb160c81dab8d9d20aaa74846360';

/**
 * 天地图 — 使用天地图原生引擎
 *
 * 通过 @antv/l7-maps 的 TMap（天地图引擎）直接加载天地图底图
 * 包含：放大缩小、定位、比例尺
 */
export default function TiandituMap() {
  const handleSceneReady = useCallback((scene: Scene) => {
    // 移除天地图引擎自带的 Zoom 控件，使用 AimapKit 统一的 ZoomControl
    try {
      const mapService = (scene as any).mapService;
      const nativeMap = mapService?.map;
      if (nativeMap && typeof window !== 'undefined' && (window as any).T) {
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
    </div>
  );
}

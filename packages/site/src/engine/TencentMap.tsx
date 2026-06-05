import React, { useCallback, useRef, useState } from 'react';
import type { Scene } from '@antv/l7';
import { AiMap, PointLayer, ZoomControl, ScaleControl, GeoLocateControl, MapThemeControl } from '@antv/aimapui';
import { ErrorBoundary } from '@antv/aimapui';
import { CHINA_CITIES } from './data';
import { TENCENT_THEME_OPTIONS } from './tencent-styles';

/**
 * 腾讯地图 — 基础地图展示 + 城市点图层 + 主题切换占位
 *
 * 使用腾讯地图 TMap 引擎，主题切换通过 nativeMap.setMapStyleId(value) 调用原生 API。
 *
 * ⚠️ 腾讯地图样式需要先在腾讯位置服务后台
 *    https://lbs.qq.com/dev/console/personalStyles/
 * 创建并发布个性化样式后获得 styleId，再替换 TENCENT_THEME_OPTIONS。
 * 此处仅保留默认 style1 作为占位说明。
 *
 * 使用 ErrorBoundary 防止腾讯 SDK 异常影响其他页面
 */
export default function TencentMap() {
  const nativeMapRef = useRef<any>(null);
  const [currentTheme, setCurrentTheme] = useState('style1');

  const handleSceneReady = useCallback((scene: Scene) => {
    try {
      const mapService = (scene as any).mapService;
      nativeMapRef.current = mapService?.map;
    } catch {
      // ignore
    }
  }, []);

  const handleThemeChange = useCallback((value: string) => {
    setCurrentTheme(value);
    try {
      const nativeMap = nativeMapRef.current;
      if (nativeMap && typeof nativeMap.setMapStyleId === 'function') {
        nativeMap.setMapStyleId(value);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <ErrorBoundary>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <AiMap
          autoFit
          map={{
            basemap: 'tencent',
            token: 'VZ2BZ-EZ7KZ-D4RXM-TZQDP-Q3PQH-TVF5L',
            center: [105, 35],
            zoom: 4,
            style: 'light',
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
            position="topleft"
            options={TENCENT_THEME_OPTIONS}
            defaultValue={currentTheme}
            onThemeChange={handleThemeChange}
          />
        </AiMap>
      </div>
    </ErrorBoundary>
  );
}

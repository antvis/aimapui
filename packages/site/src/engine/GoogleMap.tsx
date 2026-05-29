import React, { useCallback, useRef, useState } from 'react';
import type { Scene } from '@antv/l7';
import { AiMap, PointLayer, ZoomControl, ScaleControl, GeoLocateControl, MapThemeControl } from '@antv/aimapui';
import { ErrorBoundary } from '@antv/aimapui';
import { CHINA_CITIES } from './data';
import { GOOGLE_THEME_OPTIONS } from './google-styles';

/**
 * Google 地图 — 基础地图展示 + 城市点图层 + 主题切换
 *
 * 使用 Google Maps JavaScript API，需要配置有效的 API Key
 * 主题切换通过 nativeMap.setMapTypeId(value) 直接调用原生 API，
 * 支持 roadmap / satellite / hybrid / terrain 4 种内置类型
 *
 * 使用 ErrorBoundary 防止 Google SDK 加载失败影响其他页面
 *
 * 申请 API Key: https://console.cloud.google.com/google/maps-apis
 */
export default function GoogleMap() {
  const nativeMapRef = useRef<any>(null);
  const [currentTheme, setCurrentTheme] = useState('roadmap');

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
      if (nativeMap && typeof nativeMap.setMapTypeId === 'function') {
        nativeMap.setMapTypeId(value);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <ErrorBoundary>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <AiMap
          map={{
            basemap: 'google',
            token: 'AIzaSyA6U7oKLKbPVUicuCaGQ25_zIMep-zGBcU',
            center: [105, 35],
            zoom: 4,
            style: 'normal',
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
            options={GOOGLE_THEME_OPTIONS}
            defaultValue={currentTheme}
            onThemeChange={handleThemeChange}
          />
        </AiMap>
      </div>
    </ErrorBoundary>
  );
}

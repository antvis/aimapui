import React, { useCallback, useRef, useState } from 'react';
import type { Scene } from '@antv/l7';
import { AiMap, PointLayer, ZoomControl, ScaleControl, GeoLocateControl, MapThemeControl } from '@antv/aimapui';
import { ErrorBoundary } from '@antv/aimapui';
import { CHINA_CITIES } from './data';
import { BAIDU_THEME_OPTIONS, BAIDU_STYLE_MAP } from './baidu-styles';

/**
 * 百度地图 — 基础地图展示 + 城市点图层 + 主题切换
 *
 * 使用百度地图 BMapGL 引擎，主题切换通过 nativeMap.setMapStyleV2({ styleJson })
 * 调用原生 API，使用本地 JSON 配置实现 标准/灰阶/暗色/蓝调 4 种主题，
 * 无需在百度后台申请 styleId 即可生效。
 *
 * 使用 ErrorBoundary 防止百度 SDK key 阻断影响其他页面
 */
export default function BaiduMap() {
  const nativeMapRef = useRef<any>(null);
  const [currentTheme, setCurrentTheme] = useState('normal');

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
      const styleJson = BAIDU_STYLE_MAP[value];
      if (nativeMap && typeof nativeMap.setMapStyleV2 === 'function' && styleJson) {
        nativeMap.setMapStyleV2({ styleJson });
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
            basemap: 'baidu',
            token: 'ShSrOHgrilK8rvaXV6kHC8vwxgnvF3CV',
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
            options={BAIDU_THEME_OPTIONS}
            defaultValue={currentTheme}
            onThemeChange={handleThemeChange}
          />
        </AiMap>
      </div>
    </ErrorBoundary>
  );
}

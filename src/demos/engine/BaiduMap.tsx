import React from 'react';
import { AiMap, ZoomControl, ScaleControl, GeoLocateControl } from '../../index';
import { ErrorBoundary } from '../../components/ErrorBoundary';

/**
 * 百度地图 — 基础地图展示
 *
 * 使用百度地图引擎，包含：缩放、比例尺、定位控件
 * 使用 ErrorBoundary 防止百度 SDK key 阻断影响其他页面
 */
export default function BaiduMap() {
  return (
    <ErrorBoundary>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <AiMap
          map={{
            basemap: 'baidu',
            token: 'ShSrOHgrilK8rvaXV6kHC8vwxgnvF3CV',
            center: [116.397, 39.909],
            zoom: 10,
            style: 'light',
          }}
        >
          <ZoomControl position="bottomright" />
          <ScaleControl position="bottomleft" />
          <GeoLocateControl position="topright" />
        </AiMap>
      </div>
    </ErrorBoundary>
  );
}

import React from 'react';
import { AiMap, PointLayer, ZoomControl, ScaleControl, GeoLocateControl } from '../../index';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { CHINA_CITIES } from './data';

/**
 * 百度地图 — 基础地图展示 + 城市点图层
 *
 * 使用百度地图引擎，包含：缩放、比例尺、定位控件、城市可视化图层
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
            center: [105, 35],
            zoom: 4,
            style: 'light',
          }}
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
        </AiMap>
      </div>
    </ErrorBoundary>
  );
}

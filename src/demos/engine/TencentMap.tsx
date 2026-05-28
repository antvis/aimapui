import React from 'react';
import { AiMap, PointLayer, ZoomControl, ScaleControl, GeoLocateControl } from '../../index';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { CHINA_CITIES } from './data';

/**
 * 腾讯地图 — 基础地图展示 + 城市点图层
 *
 * 使用腾讯地图引擎，包含：缩放、比例尺、定位控件、城市可视化图层
 * 使用 ErrorBoundary 防止腾讯 SDK 异常影响其他页面
 */
export default function TencentMap() {
  return (
    <ErrorBoundary>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <AiMap
          map={{
            basemap: 'tencent',
            token: 'VZ2BZ-EZ7KZ-D4RXM-TZQDP-Q3PQH-TVF5L',
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

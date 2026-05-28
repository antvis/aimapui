import React from 'react';
import { AiMap, PointLayer, ZoomControl, ScaleControl, GeoLocateControl } from '@antv/aimapui';
import { ErrorBoundary } from '@antv/aimapui';
import { CHINA_CITIES } from './data';

/**
 * Google 地图 — 基础地图展示 + 城市点图层
 *
 * 使用 Google Maps JavaScript API，需要配置有效的 API Key
 * 使用 ErrorBoundary 防止 Google SDK 加载失败影响其他页面
 *
 * 注意：此处使用的是占位 Key，实际使用请替换为你自己的 Google Maps API Key
 * 申请地址：https://console.cloud.google.com/google/maps-apis
 */
export default function GoogleMap() {
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

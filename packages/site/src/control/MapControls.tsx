import React from 'react';
import {
  AiMap,
  PointLayer,
  ZoomControl,
  ScaleControl,
  FullscreenControl,
  GeoLocateControl,
  MapThemeControl,
  MouseLocationControl,
  ExportImageControl,
  LogoControl,
} from '@antv/aimapui';

const cities = [
  { lng: 116.4, lat: 39.9, name: '北京', value: 100 },
  { lng: 121.5, lat: 31.2, name: '上海', value: 90 },
  { lng: 113.3, lat: 23.1, name: '广州', value: 80 },
  { lng: 114.1, lat: 22.5, name: '深圳', value: 85 },
  { lng: 104.1, lat: 30.6, name: '成都', value: 70 },
  { lng: 120.2, lat: 30.3, name: '杭州', value: 75 },
  { lng: 114.3, lat: 30.6, name: '武汉', value: 72 },
  { lng: 106.6, lat: 29.6, name: '重庆', value: 68 },
];

/**
 * 地图控件全览 — 在同一地图上展示所有内置控件
 *
 * 控件分布：
 * - ZoomControl：右下角缩放按钮
 * - ScaleControl：左下角比例尺
 * - FullscreenControl：右上角全屏按钮
 * - GeoLocateControl：右下角定位按钮
 * - MapThemeControl：右上角主题切换
 * - MouseLocationControl：底部中央鼠标坐标显示
 * - ExportImageControl：右上角导出图片按钮
 * - LogoControl：左下角品牌 Logo
 */
export default function MapControlsDemo() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AiMap
        autoFit
        map={{
          basemap: 'gaode',
          center: [108, 32],
          zoom: 4,
          style: 'light',
        }}
      >
        <PointLayer source={cities} color="#5B8FF9" size={10} />
        <ZoomControl />
        <ScaleControl position="bottomleft" maxWidth={120} metric imperial />
        <FullscreenControl />
        <GeoLocateControl />
        <MapThemeControl />
        <MouseLocationControl position="bottomcenter" />
        <ExportImageControl />
        <LogoControl
          position="bottomleft"
          logos={[
            { src: 'https://gw.alipayobjects.com/mdn/rms_816329/afts/img/A*GRb1TKp4HcMAAAAAAAAAAAAAARQnAQ', alt: 'AntV', width: 20 },
          ]}
        />
      </AiMap>
    </div>
  );
}

import React from 'react';
import { RasterLayer } from '../Layer/RasterLayer';

/** 卫星影像数据源类型 */
export type SatelliteProvider = 'gaode' | 'tianditu' | 'google';

/** 卫星影像图层配置 */
export interface SatelliteLayerProps {
  /** 影像提供商，默认 'gaode' */
  provider?: SatelliteProvider;
  /** 图层层级，默认 -1（最底层，确保不覆盖矢量图层） */
  zIndex?: number;
  /** 图层透明度 0~1，默认 1 */
  opacity?: number;
  /** 天地图 token（仅 tianditu 需要，有内置默认值） */
  tiandituToken?: string;
  /** 图层可见性，默认 true */
  visible?: boolean;
}

/** 各提供商的瓦片 URL 模板（使用 L7 的 {min-max} 范围语法） */
const SATELLITE_SOURCES: Record<SatelliteProvider, (token?: string) => string> = {
  gaode: () =>
    'https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
  google: () =>
    'https://gwxc.shipxy.com/tile.g?z={z}&x={x}&y={y}',
  tianditu: (token = '4043dde46add842282bacc412299311d') =>
    `https://t{0-7}.tianditu.gov.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}&tk=${token}`,
};

/** 提供商显示名称 */
export const SATELLITE_PROVIDER_NAMES: Record<SatelliteProvider, string> = {
  gaode: '高德卫星',
  tianditu: '天地图卫星',
  google: '谷歌卫星',
};

/**
 * 卫星影像图层 — 复合组件
 *
 * 支持高德、天地图、谷歌三种卫星影像切换，默认高德。
 *
 * ```tsx
 * <AiMap map={{ basemap: 'map', center: [116.39, 39.9], zoom: 10 }}>
 *   <SatelliteLayer provider="gaode" />
 * </AiMap>
 * ```
 */
export function SatelliteLayer({
  provider = 'gaode',
  zIndex = -1,
  opacity = 1,
  tiandituToken,
  visible = true,
}: SatelliteLayerProps) {
  if (!visible) return null;

  const source = SATELLITE_SOURCES[provider](tiandituToken);

  return (
    <RasterLayer
      source={source}
      sourceType="rasterTile"
      sourceConfig={{ parser: { type: 'rasterTile', tileSize: 256, zoomOffset: 1 } }}
      zIndex={zIndex}
      opacity={opacity}
    />
  );
}

export default SatelliteLayer;

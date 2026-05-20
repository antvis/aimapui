import type { MapSchema, BasemapType } from '../../schema/types';
import { DEFAULT_MAP } from '../../schema/defaults';

/**
 * 底图工厂 — 根据配置创建 L7 Map 实例
 * 动态导入各底图模块，避免未使用时打包
 */
export async function createBasemap(schema: MapSchema) {
  const basemap: BasemapType = schema.basemap ?? DEFAULT_MAP.basemap;
  const token = schema.token ?? '';
  const style = schema.style ?? 'normal';

  const commonOptions = {
    center: schema.center ?? DEFAULT_MAP.center,
    zoom: schema.zoom ?? DEFAULT_MAP.zoom,
    pitch: schema.pitch ?? DEFAULT_MAP.pitch,
    rotation: schema.rotation ?? DEFAULT_MAP.rotation,
    minZoom: schema.minZoom,
    maxZoom: schema.maxZoom,
    dragEnable: schema.gestureConfig?.dragPan ?? true,
    zoomEnable: schema.gestureConfig?.pinchZoom ?? true,
    rotateEnable: schema.gestureConfig?.dragRotate ?? true,
  };

  switch (basemap) {
    case 'gaode': {
      const { GaodeMap } = await import('@antv/l7-maps');
      return new GaodeMap({
        ...commonOptions,
        style: mapStyleToGaode(style),
        token,
      });
    }

    case 'mapbox': {
      const { Mapbox } = await import('@antv/l7-maps');
      return new Mapbox({
        ...commonOptions,
        style: mapStyleToMapbox(style),
        token,
      });
    }

    case 'tianditu': {
      const { TMap } = await import('@antv/l7-maps');
      return new TMap({
        ...commonOptions,
        token,
      });
    }

    case 'tencent': {
      const { TencentMap } = await import('@antv/l7-maps');
      return new TencentMap({
        ...commonOptions,
        token,
      });
    }

    case 'baidu': {
      const { BaiduMap } = await import('@antv/l7-maps');
      return new BaiduMap({
        ...commonOptions,
        style: mapStyleToBaidu(style),
        token,
      });
    }

    case 'maplibre': {
      const { MapLibre } = await import('@antv/l7-maps');
      return new MapLibre({
        ...commonOptions,
        style: mapStyleToMaplibre(style),
        token,
      });
    }

    case 'map':
    default: {
      const { Map } = await import('@antv/l7-maps');
      return new Map({
        center: schema.center ?? DEFAULT_MAP.center,
        zoom: schema.zoom ?? DEFAULT_MAP.zoom,
      });
    }
  }
}

function isUrl(s: string): boolean {
  return s.startsWith('http://') || s.startsWith('https://') || s.startsWith('mapbox://');
}

function mapStyleToGaode(style: string): string {
  const map: Record<string, string> = {
    light: 'light',
    dark: 'dark',
    normal: 'normal',
    darkblue: 'dark',
    satellite: 'satellite',
  };
  return map[style] ?? style;
}

function mapStyleToMapbox(style: string): string {
  const map: Record<string, string> = {
    light: 'https://tiles.openfreemap.org/styles/positron',
    dark: 'https://tiles.openfreemap.org/styles/dark',
    normal: 'https://tiles.openfreemap.org/styles/bright',
    liberty: 'https://tiles.openfreemap.org/styles/liberty',
    fiord: 'https://tiles.openfreemap.org/styles/fiord',
  };
  return map[style] ?? style;
}

function mapStyleToBaidu(style: string): string {
  const map: Record<string, string> = {
    light: 'light',
    dark: 'dark',
    normal: 'normal',
    darkblue: 'dark',
    satellite: 'satellite',
  };
  return map[style] ?? style;
}

function mapStyleToMaplibre(style: string): string {
  const map: Record<string, string> = {
    light: 'https://tiles.openfreemap.org/styles/positron',
    dark: 'https://tiles.openfreemap.org/styles/dark',
    normal: 'https://tiles.openfreemap.org/styles/bright',
    liberty: 'https://tiles.openfreemap.org/styles/liberty',
    fiord: 'https://tiles.openfreemap.org/styles/fiord',
  };
  return map[style] ?? style;
}

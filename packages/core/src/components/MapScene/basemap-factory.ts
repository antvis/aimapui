import type { MapSchema, BasemapType } from '../../schema/types';
import { DEFAULT_MAP } from '../../schema/defaults';

// 底图引擎统一从已 external 的 @antv/l7 导入，避免把 @antv/l7-maps 各引擎适配层
// （mapbox-gl / maplibre-gl / AMap loader 等）及 GLSL 着色器打包进产物
import {
  GaodeMap,
  Mapbox,
  TMap,
  TencentMap,
  BaiduMap,
  MapLibre,
  GoogleMap,
  Map,
} from '@antv/l7';

/**
 * 底图工厂 — 根据配置创建 L7 Map 实例
 */
export function createBasemap(schema: MapSchema) {
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

  // 外部注入的引擎构造函数 — 跳过动态 import
  if (schema.engine) {
    return new schema.engine({ ...commonOptions, style, token });
  }

  switch (basemap) {
    case 'gaode':
      return new GaodeMap({
        ...commonOptions,
        style: mapStyleToGaode(style),
        token,
      });

    case 'mapbox':
      return new Mapbox({
        ...commonOptions,
        style: mapStyleToMapbox(style),
        token,
      });

    case 'tianditu':
      return new TMap({
        ...commonOptions,
        token,
      });

    case 'tencent':
      return new TencentMap({
        ...commonOptions,
        token,
      });

    case 'baidu':
      return new BaiduMap({
        ...commonOptions,
        style: mapStyleToBaidu(style),
        token,
      });

    case 'maplibre':
      return new MapLibre({
        ...commonOptions,
        style: mapStyleToMaplibre(style),
        token,
      });

    case 'google': {
      const instance = new GoogleMap({
        ...commonOptions,
        style: mapStyleToGoogle(style),
        token,
      });
      suppressGoogleNativeControls(instance);
      return instance;
    }

    case 'map':
    default:
      return new Map({
        center: schema.center ?? DEFAULT_MAP.center,
        zoom: schema.zoom ?? DEFAULT_MAP.zoom,
      });
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

/** Google Maps mapTypeId 映射：normal → roadmap，satellite → satellite，dark/light → roadmap（颜色样式由 styles 控制） */
function mapStyleToGoogle(style: string): string {
  const map: Record<string, string> = {
    light: 'roadmap',
    dark: 'roadmap',
    normal: 'roadmap',
    darkblue: 'roadmap',
    satellite: 'satellite',
    hybrid: 'hybrid',
    terrain: 'terrain',
  };
  return map[style] ?? 'roadmap';
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

/**
 * 移除 Google Maps 原生 UI 控件
 *
 * L7 GMapService 虽然初始化时设置了 disableDefaultUI: true，但 init 完成后会根据
 * zoomEnable 选项调用 setMapStatus，重新打开原生的 zoomControl。为了让三方地图
 * 统一使用 L7 控件（ZoomControl / ScaleControl 等），这里在底图实例上挂一个补丁：
 *
 * 1. 轮询等待 L7 内部 this.map（原生 google.maps.Map 实例）就绪
 * 2. 强制 setOptions 关闭所有原生 UI
 * 3. 拦截后续 L7 触发的 setOptions 调用，过滤掉 zoomControl 等原生 UI 字段
 */
function suppressGoogleNativeControls(instance: unknown): void {
  const NATIVE_UI_KEYS = [
    'zoomControl',
    'mapTypeControl',
    'streetViewControl',
    'fullscreenControl',
    'scaleControl',
    'rotateControl',
    'panControl',
  ] as const;

  const nativeUiOff: Record<string, false> = {};
  for (const key of NATIVE_UI_KEYS) {
    nativeUiOff[key] = false;
  }

  const tryPatch = (): boolean => {
    const nativeMap = (instance as { map?: unknown }).map as
      | { setOptions?: (opts: Record<string, unknown>) => void }
      | undefined;
    if (!nativeMap || typeof nativeMap.setOptions !== 'function') return false;

    // 第一次强制覆盖
    nativeMap.setOptions(nativeUiOff);

    // 拦截后续 L7 内部的 setOptions，过滤掉原生 UI 字段
    const originalSetOptions = nativeMap.setOptions.bind(nativeMap);
    nativeMap.setOptions = (opts: Record<string, unknown>) => {
      const filtered: Record<string, unknown> = { ...opts };
      for (const key of NATIVE_UI_KEYS) {
        if (key in filtered) {
          delete filtered[key];
        }
      }
      originalSetOptions(filtered);
    };
    return true;
  };

  if (tryPatch()) return;

  // 原生 Map 尚未创建，轮询等待
  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if (tryPatch() || attempts > 100) {
      clearInterval(timer);
    }
  }, 50);
}

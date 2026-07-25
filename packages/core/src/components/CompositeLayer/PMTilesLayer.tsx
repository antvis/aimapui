import { useEffect, useRef } from 'react';
import * as L7 from '@antv/l7';
import { PMTiles, Protocol, TileType } from 'pmtiles';
import type { Header, RangeResponse } from 'pmtiles';
import { useScene } from '../../context/SceneContext';

/**
 * PMTiles 源类型
 * - `raster`：栅格影像瓦片（PNG/JPEG/WebP/AVIF）—— 当前实现支持
 * - `raster-dem`：地形高程瓦片（TerrainRGB）—— 当前实现支持
 * - `vector`：矢量瓦片（MVT）—— 暂不支持（后续按 L7 矢量瓦片路径实现）
 * - `auto`：读取 PMTiles 文件头 `tileType` 自动判断（默认）
 *
 * > `vector` 当前会报错提示，请勿用于矢量归档。
 */
export type PMTilesSourceType = 'raster' | 'raster-dem' | 'vector' | 'auto';

/**
 * 色带配置（raster-dem 模式下将高程值映射为颜色）。
 *
 * `positions` 约定与 L7 `IColorRamp` 一致：
 * - **省略 `type`**（默认）：`positions` 为 **归一化 0~1**（如 `[0, 0.2, 0.4, 0.6, 0.8, 1]`），与 `domain` 无关。
 * - `type: 'linear'`：`positions` 为与 `domain` **同量纲的绝对值**（如 domain `[0,7000]` 时 `positions: [0, 200, 7000]`）。
 */
export interface PMTilesRampColors {
  /** 插值类型，省略时按归一化 positions 生成色带（推荐） */
  type?: 'linear' | 'quantize' | 'custom';
  /** 色值数组 */
  colors: string[];
  /** 对应位置（含义随 `type` 不同，见上方说明） */
  positions?: number[];
}

/**
 * PMTiles 复合图层 Props
 *
 * 基于 L7 的瓦片栅格图层（`RasterLayer` + 瓦片 `Source`）实现，整条渲染链路运行在
 * L7 的 WebGL 渲染层，**与底图引擎无关**：高德（GaodeMap）/ MapLibre / Mapbox 等
 * 任意底图下均可工作，使用高德底图时无需配置 token（组件内置默认 token 可用）。
 *
 * 当前支持栅格影像瓦片与地形高程瓦片（TerrainRGB）；矢量瓦片（MVT）暂不支持。
 */
export interface PMTilesLayerProps {
  /**
   * PMTiles 文件 URL，例如 `https://example.com/tiles.pmtiles`。
   * 组件内部按 (z,x,y) 调用 `PMTiles.getZxy` 取瓦片字节，不依赖 `pmtiles://` 协议。
   */
  url: string;

  /** 源类型，默认 `auto`（读取文件头 `tileType` 自动判断 raster / raster-dem） */
  sourceType?: PMTilesSourceType;

  /**
   * 高程值域 [min, max]，仅 raster-dem 模式生效，用于色带映射。
   * 例如地形 `[0, 7000]`、海深 `[-12000, 0]`。
   */
  domain?: [number, number];

  /** 色带配置，仅 raster-dem 模式生效 */
  rampColors?: PMTilesRampColors;

  /** 无数据值，仅 raster-dem 模式生效，默认 0 */
  noDataValue?: number;
  /** 低值截断，仅 raster-dem 模式生效，默认 false */
  clampLow?: boolean;
  /** 高值截断，仅 raster-dem 模式生效，默认 false */
  clampHigh?: boolean;

  /** 源 minzoom 覆盖 */
  minzoom?: number;
  /** 源 maxzoom 覆盖 */
  maxzoom?: number;

  /** 栅格瓦片大小（px），默认 256 */
  tileSize?: number;

  /** 是否在加载完成后自动 fitBounds 到 PMTiles 文件范围，默认 false */
  fitBounds?: boolean;
  /** fitBounds 内边距（px），默认 20 */
  fitBoundsPadding?: number;

  /** 是否可见，默认 true */
  visible?: boolean;

  /** 整体不透明度 0-1，默认 1 */
  opacity?: number;

  /** 图层 z 序，默认 1 */
  zIndex?: number;

  /** 图层就绪后回调 */
  onReady?: (info: { header?: Header; sourceType: 'raster' | 'raster-dem' }) => void;

  /** 出错回调 */
  onError?: (error: Error) => void;
}

// ─── pmtiles 协议注册（L7 层，全局幂等）────────────────────────────────
// L7 的瓦片取数走 `@antv/l7-utils` 的 ajax + SceneConfig.REGISTERED_PROTOCOLS，
// 与底图引擎无关。组件本身不依赖 `pmtiles://` URL（直接用 getZxy 取数），
// 但仍注册协议，便于与 L7 自有 protocol 路径互通 / 未来扩展。
let protocolRegistered = false;

function ensurePmtilesProtocol(): void {
  if (protocolRegistered) return;
  try {
    if (typeof L7.Scene.addProtocol === 'function') {
      L7.Scene.addProtocol(
        'pmtiles',
        new Protocol().tile as unknown as Parameters<typeof L7.Scene.addProtocol>[1],
      );
    }
  } catch {
    // ignore — 注册失败不影响 getCustomData 主路径
  }
  protocolRegistered = true;
}

/**
 * 默认地形色带（红→绿，0~7000m）。
 * 省略 `type`：positions 为归一化 0~1，与 L7 terrainRGB 规范一致。
 */

const DEFAULT_TERRAIN_RAMP: PMTilesRampColors = {
  colors: ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850'],
  positions: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
};

// ─── 透明占位瓦片 ─────────────────────────────────────────────────────
// 1×1 全透明 RGBA PNG（已校验 68 字节）。PMTiles 归档未覆盖的边缘瓦片
// 会触发 getZxy 返回 undefined；若回调 cb(null, null)，L7 SourceTile.loadData
// 命中 `if (error || !tileData) onError(undefined, this)` → BaseLayer.tileError
// 无条件 console.warn，造成控制台 `error: {error: undefined, tile}` 刷屏。
// 改为返回透明占位图，让瓦片走 onLoad（ImageTile/image 解码透明像素），
// 从源头不触发 tile-error；边缘无数据区视觉上仍为透明，与不渲染效果一致。
// 1×1 PNG 解码开销可忽略。
const TRANSPARENT_PNG_BYTES =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=';

function decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
  // 浏览器侧 atob；Node 侧 Buffer 兜底（SSR / 测试环境）。
  if (typeof atob === 'function') {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const B = (globalThis as any).Buffer;
  if (B) {
    return B.from(base64, 'base64').buffer.slice(
      0,
      B.from(base64, 'base64').length,
    ) as ArrayBuffer;
  }
  return new ArrayBuffer(0);
}

/** 透明占位瓦片 ArrayBuffer（模块级缓存，避免每帧重复解码）。 */
const TRANSPARENT_TILE: ArrayBuffer = decodeBase64ToArrayBuffer(TRANSPARENT_PNG_BYTES);

/**
 * 根据 PMTiles 文件头 `tileType` 解析源类型。
 *
 * PMTiles 头只能区分矢量（Mvt）与栅格图像（Png/Jpeg/Webp/Avif），
 * 无法区分普通栅格与地形栅格（raster-dem 也是图像编码，仅按用途区分）。
 * 因此 `auto` 模式统一回退为 `raster`；`raster-dem` 需用户显式指定 `sourceType`。
 */
function resolveSourceType(
  header: Header,
  sourceType: PMTilesSourceType,
): 'raster' | 'raster-dem' | 'vector' {
  if (sourceType !== 'auto') return sourceType;
  switch (header.tileType) {
    case TileType.Mvt:
      return 'vector';
    case TileType.Png:
    case TileType.Jpeg:
    case TileType.Webp:
    case TileType.Avif:
      return 'raster';
    default:
      return 'raster';
  }
}

/**
 * PMTiles 栅格/地形瓦片图层（底图无关）
 *
 * 通过 `PMTiles.getZxy(z, x, y)` 获取瓦片字节（返回 `RangeResponse`，取其 `.data`
 * 作为 `ArrayBuffer`），交由 L7 `RasterLayer` 瓦片源的 `getCustomData` 钩子消费。
 * 整条渲染链路在 L7 WebGL 层，不依赖 maplibre / mapbox / 高德的底层 source/layer
 * API，因此可在任意底图下工作；使用高德底图时无需配置 token。
 *
 * - 栅格影像：`dataType: 'customImage'` → `CustomImageRasterLoader`（getCustomData 取数）
 *   + `ImageTile`（普通图像贴片渲染）。
 * - 地形高程：`dataType: 'customTerrainRGB'` → `CustomImageRasterLoader`（getCustomData
 *   取数）+ `RasterTerrainRGBTile`（TerrainRGB 解码 + 色带映射）。
 *
 * 矢量瓦片（MVT）暂不支持。
 *
 * @example 栅格影像（高德底图，无需 token）
 * ```tsx
 * <AiMap map={{ basemap: 'gaode', center: [121.5, 25.0], zoom: 18 }}>
 *   <PMTilesLayer url="https://example.com/satellite.pmtiles" opacity={0.9} fitBounds />
 * </AiMap>
 * ```
 *
 * @example 地形高程（TerrainRGB，任意底图）
 * ```tsx
 * <PMTilesLayer
 *   url="https://example.com/dem.pmtiles"
 *   sourceType="raster-dem"
 *   domain={[0, 7000]}
 *   rampColors={{ colors: ['#d73027', '#1a9850'], positions: [0, 1] }}
 * />
 * ```
 */
export function PMTilesLayer({
  url,
  sourceType = 'auto',
  domain,
  rampColors,
  noDataValue = 0,
  clampLow = false,
  clampHigh = false,
  minzoom,
  maxzoom,
  tileSize = 256,
  fitBounds = false,
  fitBoundsPadding = 20,
  visible = true,
  opacity = 1,
  zIndex = 1,
  onReady,
  onError,
}: PMTilesLayerProps) {
  const scene = useScene();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (!scene) return;
    const sc = scene;

    // 注册 L7 层 pmtiles 协议（幂等；不影响 getCustomData 主路径）
    ensurePmtilesProtocol();

    let disposed = false;
    const pmtiles = new PMTiles(url);

    async function build() {
      if (disposed) return;

      // 读文件头：解析类型 + 提供范围
      let header: Header;
      try {
        header = await pmtiles.getHeader();
      } catch (e) {
        const err = e as Error;
        console.error('[PMTilesLayer] 读取文件头失败:', err?.message);
        onError?.(err);
        return;
      }
      if (disposed) return;

      const resolved = resolveSourceType(header, sourceType);
      if (resolved === 'vector') {
        const err = new Error(
          '[PMTilesLayer] 矢量瓦片（MVT）暂不支持，本组件当前仅支持栅格影像/地形栅格瓦片。',
        );
        console.warn(err.message);
        onError?.(err);
        return;
      }

      // getCustomData：按 (z,x,y) 取瓦片字节，交给 L7 解码。
      // pmtiles.getZxy 返回 `RangeResponse | undefined`，其 `.data` 为瓦片 `ArrayBuffer`：
      // - 返回 ArrayBuffer：L7 CustomImageRasterLoader 经 formatImage 解码为图像；
      // - 返回 undefined/空（归档未覆盖的边缘瓦片）：回退透明占位图（见 TRANSPARENT_TILE），
      //   走 onLoad 而非 onError，避免 L7 BaseLayer.tileError 无条件 console.warn 刷屏。
      // 注意：getZxy(z,x,y) 使用 XYZ 约定，与 L7 默认瓦片索引一致。
      const getCustomData = (
        tile: { x: number; y: number; z: number },
        cb: (err: unknown, data: ArrayBuffer | null) => void,
      ) => {
        pmtiles
          .getZxy(tile.z, tile.x, tile.y)
          .then((res: RangeResponse | undefined) => {
            const data = res?.data;
            // 归档未覆盖的边缘瓦片（无数据）：返回透明占位图而非 null。
            // null 会触发 L7 SourceTile.onError(undefined) → BaseLayer.tileError
            // 无条件 console.warn 刷屏；透明图走 onLoad，视觉无差异、控制台静默。
            cb(null, data && data.byteLength > 0 ? data : TRANSPARENT_TILE);
          })
          .catch((e: unknown) => cb(e as Error, null));
      };

      // 构建 source parser
      const isDem = resolved === 'raster-dem';
      // 栅格影像 → 'customImage'（走 getCustomData 取数 + ImageTile 渲染）；
      // 地形高程 → 'customTerrainRGB'（走 getCustomData 取数 + RasterTerrainRGBTile 渲染）。
      // ⚠️ DEM 不能用 'terrainRGB'：该值走 URL 取数（ImageRasterLoader），会忽略 getCustomData。
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parser: Record<string, any> = {
        type: 'rasterTile',
        dataType: isDem ? 'customTerrainRGB' : 'customImage',
        tileSize,
        getCustomData,
      };
      if (typeof minzoom === 'number') parser.minZoom = minzoom;
      if (typeof maxzoom === 'number') parser.maxZoom = maxzoom;

      // 构建 source（data 为占位 URL，实际取数由 getCustomData 接管）
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const source = new L7.Source(url, { parser } as any);

      // 构建 layer
      const layer = new L7.RasterLayer({ zIndex });
      layer.source(source);

      if (isDem) {
        // 地形高程：色带映射（positions 归一化 0~1，与 domain 配合）
        const finalRamp = rampColors ?? DEFAULT_TERRAIN_RAMP;
        layer.style({
          clampLow,
          clampHigh,
          domain: domain ?? [0, 7000],
          noDataValue,
          rampColors: finalRamp,
          opacity,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      } else {
        // 普通栅格影像：直接贴片
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        layer.style({ opacity } as any);
      }

      if (!visible) layer.hide();

      // 销毁旧图层（重建场景下）
      if (layerRef.current) {
        try {
          sc.removeLayer(layerRef.current);
        } catch {
          // ignore
        }
        layerRef.current = null;
      }

      try {
        sc.addLayer(layer);
        layerRef.current = layer;
      } catch (e) {
        const err = e as Error;
        console.error('[PMTilesLayer] addLayer 失败:', err?.message);
        onError?.(err);
        return;
      }

      // 自动定位到归档范围
      // ⚠️ 关键时序问题（实测复现）：
      //  1. 高德（AMap JSAPI）在 L7 scene 'loaded' 触发后，JSAPI 本身仍在异步鉴权/初始化
      //     （如 FlyDataAuthTask 域名校验）。此时 scene.fitBounds 可能**静默无效**。
      //  2. 即便 fitBounds 成功把相机移到归档中心（getCenter 同步反映新值），AMap JSAPI
      //     完成初始化后仍会把相机**重置回构造时传入的默认 center/zoom**（不经 scene.setCenter，
      //     故无法靠监听拦截），表现为「定位后又被拉回默认视角、影像不显示」。
      // 因此单次 fitBounds 或「检测到移动即停止」都不够。这里采用**稳定态轮询**：
      //   - 周期性检查 center 是否落在目标范围内；若不在则重新 fitBounds（覆盖被重置的情形）；
      //   - 当 center 连续 2 次保持在目标范围内（≈1s 未被重置）才视为稳定并停止；
      //   - 整个过程有上限（≈8s），避免无限循环 / 干扰用户后续交互；dispose 后立即停止。
      // 对 MapLibre/Mapbox 同样鲁棒（animate:false 使 getCenter 同步反映结果）。
      if (fitBounds) {
        const target: [[number, number], [number, number]] = [
          [header.minLon, header.minLat],
          [header.maxLon, header.maxLat],
        ];
        const getCenter = (): { lng: number; lat: number } | null => {
          try {
            const c = sc.getCenter();
            return c && typeof c.lng === 'number' ? { lng: c.lng, lat: c.lat } : null;
          } catch {
            return null;
          }
        };
        const inBounds = (c: { lng: number; lat: number } | null): boolean =>
          !!c &&
          c.lng >= target[0][0] - 1e-9 &&
          c.lng <= target[1][0] + 1e-9 &&
          c.lat >= target[0][1] - 1e-9 &&
          c.lat <= target[1][1] + 1e-9;

        let stable = 0;
        let attempts = 0;
        const MAX_ATTEMPTS = 16; // 500ms * 16 ≈ 8s 上限
        const doFit = () => {
          if (disposed) return;
          if (!inBounds(getCenter())) {
            // 相机不在目标范围（未生效 / 被 AMap 重置回默认）→ 重新定位
            try {
              // animate:false → 各底图同步应用，便于本轮立即复检；
              // padding 供 MapLibre/Mapbox 使用（高德 amap-next 忽略 padding，按 bounds 填充）。
              sc.fitBounds(target, { padding: fitBoundsPadding, animate: false });
            } catch {
              // 部分 basemap 可能不支持该 options 形态，忽略后靠下一轮继续尝试
            }
            stable = 0;
          } else {
            // 已在目标范围内；连续 2 次保持（≈1s 未被重置）才停止
            stable++;
            if (stable >= 2) {
              return;
            }
          }
          attempts++;
          if (attempts < MAX_ATTEMPTS) {
            setTimeout(doFit, 500);
          }
        };
        doFit();
        if (!sc.loaded) {
          try {
            sc.once?.('loaded', () => setTimeout(doFit, 0));
          } catch {
            // once 不可用时退化为短延迟兜底
            setTimeout(doFit, 300);
          }
        }
      }

      onReady?.({ header, sourceType: isDem ? 'raster-dem' : 'raster' });
    }

    build();

    return () => {
      disposed = true;
      if (layerRef.current) {
        try {
          sc.removeLayer(layerRef.current);
        } catch {
          // ignore
        }
        layerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    scene,
    url,
    sourceType,
    domain,
    rampColors,
    noDataValue,
    clampLow,
    clampHigh,
    minzoom,
    maxzoom,
    tileSize,
    fitBounds,
    fitBoundsPadding,
    zIndex,
  ]);

  // ─── visible 增量更新（避免重建图层）───
  useEffect(() => {
    if (!scene || !layerRef.current) return;
    try {
      if (visible) {
        layerRef.current.show?.();
      } else {
        layerRef.current.hide?.();
      }
    } catch {
      // ignore
    }
  }, [scene, visible]);

  // ─── opacity 增量更新（L7 layer.style 支持重新设置样式属性）───
  useEffect(() => {
    if (!scene || !layerRef.current) return;
    try {
      layerRef.current.style?.({ opacity });
      scene.render?.();
    } catch {
      // ignore
    }
  }, [scene, opacity]);

  return null;
}

export default PMTilesLayer;

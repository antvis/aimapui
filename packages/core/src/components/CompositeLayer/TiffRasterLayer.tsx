import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as L7 from '@antv/l7';
import { useScene } from '../../context/SceneContext';

/**
 * 色带配置
 */
export interface RampColors {
  /** 插值类型 */
  type?: 'linear' | 'quantize' | 'custom';
  /** 色值数组 */
  colors: string[];
  /** 对应位置（与 domain 对齐） */
  positions?: number[];
}

/**
 * 渲染模式
 * - raster: 单波段伪彩色（默认）
 * - rgb: 多波段真彩色/假彩色合成
 * - ndi: 归一化差异指数（如 NDVI、NDBI、NDWI）
 */
export type RasterRenderMode = 'raster' | 'rgb' | 'ndi';

export interface TiffRasterLayerProps {
  /** TIFF 文件 URL */
  url: string;
  /** 地理范围 [minLng, minLat, maxLng, maxLat] */
  extent?: [number, number, number, number];

  // ===== 渲染模式 =====
  /** 渲染模式，默认 'raster'（单波段伪彩色） */
  renderMode?: RasterRenderMode;

  // ===== 单波段模式 (raster) =====
  /** 波段索引，默认 0 */
  bandIndex?: number;
  /** 数据值域 [min, max]，用于色带映射 */
  domain?: [number, number];
  /** 无数据值，默认 0 */
  noDataValue?: number;
  /** 色带配置 */
  rampColors?: RampColors;
  /** 低值截断，默认 false */
  clampLow?: boolean;
  /** 高值截断，默认 false */
  clampHigh?: boolean;

  // ===== 多波段模式 (rgb / ndi) =====
  /** RGB 波段索引 [R, G, B]，默认 [0, 1, 2] */
  bands?: [number, number] | [number, number, number];
  /** RGB 模式：百分位裁剪 [low, high]，默认 [2, 98]。设为 [0, 100] 可跳过裁剪 */
  countCut?: [number, number];
  /** RGB 模式：R 通道值域 [min, max]，传入后跳过 percentile 计算（避免大数据栈溢出） */
  rMinMax?: [number, number];
  /** RGB 模式：G 通道值域 [min, max] */
  gMinMax?: [number, number];
  /** RGB 模式：B 通道值域 [min, max] */
  bMinMax?: [number, number];

  // ===== 通用 =====
  /** 不透明度，默认 0.8 */
  opacity?: number;
  /** 遮罩 GeoJSON URL 或对象 */
  maskData?: string | Record<string, unknown>;
  /** 是否启用遮罩，默认 false */
  mask?: boolean;
}

/** 默认中国区域 extent */
const DEFAULT_EXTENT: [number, number, number, number] = [
  73.4821902409999979, 3.8150178409999995, 135.1066187319999869, 57.6300459959999998,
];

/** 默认夜光色带 */
const DEFAULT_RAMP_COLORS: RampColors = {
  type: 'linear',
  colors: [
    'rgba(92,58,16,0)',
    'rgba(92,58,16,0)',
    '#fabd08',
    '#f1e93f',
    '#f1ff8f',
    '#fcfff7',
  ],
  positions: [0, 3, 9, 22.5, 45, 90],
};

/**
 * 墨卡托坐标转经纬度
 */
function metersToLngLat(meters: [number, number]): [number, number] {
  const lng = (meters[0] / 20037508.34) * 180;
  let lat = (meters[1] / 20037508.34) * 180;
  lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);
  return [lng, lat];
}

/**
 * GeoTIFF 栅格复合图层
 *
 * 内置 GeoTIFF 解析能力，支持两种渲染模式：
 * - raster: 单波段伪彩色映射（NDVI、DEM、夜光等）
 * - rgb: 多波段真彩色/假彩色合成（卫星影像）
 *
 * 遵循设计规范：
 * - 伪彩色映射（自定义色带）
 * - 多波段 RGB 合成
 * - WebGL 加速渲染
 * - NoData 透明化
 * - 可选地理遮罩
 *
 * @example 单波段伪彩色
 * ```tsx
 * <TiffRasterLayer
 *   url="https://example.com/ndvi.tif"
 *   renderMode="raster"
 *   domain={[0, 0.8]}
 *   rampColors={{ colors: ['#78350f', '#059669'], positions: [0, 0.8] }}
 * />
 * ```
 *
 * @example 多波段 RGB 合成
 * ```tsx
 * <TiffRasterLayer
 *   url="https://example.com/china.tif"
 *   renderMode="rgb"
 *   bands={[0, 1, 2]}
 *   mask
 *   maskData="https://example.com/china-boundary.json"
 * />
 * ```
 */
export function TiffRasterLayer({
  url,
  extent = DEFAULT_EXTENT,
  renderMode = 'raster',
  bandIndex = 0,
  domain = [0, 90],
  noDataValue = 0,
  rampColors = DEFAULT_RAMP_COLORS,
  clampLow = false,
  clampHigh = false,
  bands = [0, 1, 2],
  countCut,
  rMinMax,
  gMinMax,
  bMinMax,
  opacity = 0.8,
  mask = false,
  maskData,
}: TiffRasterLayerProps) {
  const [tiffResult, setTiffResult] = useState<{
    rasters: unknown;
    width: number;
    height: number;
    // 从 TIFF 元数据读取的 extent（墨卡托或经纬度）
    tiffExtent?: [number, number, number, number];
  } | null>(null);
  const [maskGeoJSON, setMaskGeoJSON] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 加载 TIFF 数据
  useEffect(() => {
    let cancelled = false;

    async function loadTiff() {
      try {
        const GeoTIFF = await import('geotiff');
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const width = image.getWidth();
        const height = image.getHeight();
        const rasters = await image.readRasters();

        // 尝试从 TIFF 元数据中获取 bbox
        let tiffExtent: [number, number, number, number] | undefined;
        try {
          const bbox = image.getBoundingBox();
          if (bbox && bbox.length === 4) {
            tiffExtent = bbox as [number, number, number, number];
          }
        } catch {
          // ignore — 部分 TIFF 可能没有地理元数据
        }

        if (!cancelled) {
          setTiffResult({ rasters, width, height, tiffExtent });
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load TIFF');
          console.error('[TiffRasterLayer] Load error:', err);
        }
      }
    }

    loadTiff();
    return () => { cancelled = true; };
  }, [url]);

  // 加载遮罩数据
  useEffect(() => {
    if (!mask || !maskData) return;
    let cancelled = false;

    if (typeof maskData === 'string') {
      fetch(maskData)
        .then((res) => res.json())
        .then((json) => { if (!cancelled) setMaskGeoJSON(json); })
        .catch((err) => console.error('[TiffRasterLayer] Mask load error:', err));
    } else {
      setMaskGeoJSON(maskData);
    }

    return () => { cancelled = true; };
  }, [mask, maskData]);

  // 解析最终 extent（支持墨卡托投影的 TIFF 自动转换）
  const resolvedExtent = useMemo(() => {
    if (extent !== DEFAULT_EXTENT) return extent;
    if (tiffResult?.tiffExtent) {
      const [xMin, yMin, xMax, yMax] = tiffResult.tiffExtent;
      // 判断是否是墨卡托坐标（值大于 180 则认为是墨卡托）
      if (Math.abs(xMin) > 180 || Math.abs(xMax) > 180) {
        const sw = metersToLngLat([xMin, yMin]);
        const ne = metersToLngLat([xMax, yMax]);
        return [sw[0], sw[1], ne[0], ne[1]] as [number, number, number, number];
      }
      return tiffResult.tiffExtent;
    }
    return extent;
  }, [extent, tiffResult?.tiffExtent]);

  // 构建 source parser 配置
  const sourceConfig = useMemo(() => {
    if (!tiffResult) return null;

    if (renderMode === 'rgb') {
      // 传入 RMinMax/GMinMax/BMinMax 避免 L7 内部 percentile/quickselect 对大数据栈溢出
      const rgbParser: Record<string, unknown> = {
        type: 'rgb',
        width: tiffResult.width,
        height: tiffResult.height,
        bands,
        extent: resolvedExtent,
      };
      if (rMinMax) rgbParser.RMinMax = rMinMax;
      if (gMinMax) rgbParser.GMinMax = gMinMax;
      if (bMinMax) rgbParser.BMinMax = bMinMax;
      if (countCut) rgbParser.countCut = countCut;
      return { parser: rgbParser };
    }

    if (renderMode === 'ndi') {
      return {
        parser: {
          type: 'ndi',
          width: tiffResult.width,
          height: tiffResult.height,
          bands,
          extent: resolvedExtent,
        },
      };
    }

    return {
      parser: {
        type: 'raster',
        width: tiffResult.width,
        height: tiffResult.height,
        extent: resolvedExtent,
      },
    };
  }, [tiffResult, renderMode, bands, resolvedExtent]);

  // 构建样式
  const layerStyle = useMemo(() => {
    if (renderMode === 'rgb') {
      return { opacity };
    }
    if (renderMode === 'ndi') {
      return { domain, rampColors, opacity };
    }
    return {
      clampLow,
      clampHigh,
      domain,
      noDataValue,
      rampColors,
      opacity,
    };
  }, [renderMode, clampLow, clampHigh, domain, noDataValue, rampColors, opacity]);

  // 获取 source data
  const sourceData = useMemo(() => {
    if (!tiffResult) return null;
    if (renderMode === 'rgb' || renderMode === 'ndi') {
      // rgb/ndi 模式传入完整 rasters 对象（包含多波段）
      return tiffResult.rasters;
    }
    // 单波段模式取指定波段
    const rasters = tiffResult.rasters as ArrayLike<number>[];
    return rasters[bandIndex];
  }, [tiffResult, renderMode, bandIndex]);

  // 直接使用 L7 API 创建图层（绕过 SchemaLayer 的序列化对大型栅格数据的问题）
  const scene = useScene();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);
  const createdRef = useRef(false);

  // 如果启用了 mask，需要等 maskGeoJSON 加载完再创建图层
  const maskReady = !mask || !!maskGeoJSON;

  useEffect(() => {
    if (!scene || !sourceConfig || !sourceData || !maskReady) return;

    // 销毁旧图层（mask 数据变化时重建）
    if (layerRef.current) {
      scene.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    const layerOptions: Record<string, unknown> = { zIndex: 10 };
    if (mask && maskGeoJSON) {
      layerOptions.mask = true;
      layerOptions.maskfence = maskGeoJSON;
    }

    const layer = new L7.RasterLayer(layerOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    layer.source(sourceData, { parser: sourceConfig.parser } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    layer.style(layerStyle as any);

    scene.addLayer(layer);
    layerRef.current = layer;

    return () => {
      if (layerRef.current && scene) {
        scene.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [scene, sourceConfig, sourceData, maskReady, maskGeoJSON]);

  return null;
}

export default TiffRasterLayer;

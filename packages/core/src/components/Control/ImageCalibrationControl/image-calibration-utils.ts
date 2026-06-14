import type { GeoCorners, ImageSource } from './image-calibration-types';

export interface ImageInfo {
  url: string;
  width: number;
  height: number;
  revokeUrl?: () => void;
}

/**
 * 读取图片源，返回可用的 URL 和尺寸信息
 */
export async function loadImageSource(source: ImageSource): Promise<ImageInfo> {
  let url: string;
  let revokeUrl: (() => void) | undefined;

  if (source instanceof File) {
    url = URL.createObjectURL(source);
    revokeUrl = () => URL.revokeObjectURL(url);
  } else {
    url = source;
  }

  const { width, height } = await getImageDimensions(url);
  return { url, width, height, revokeUrl };
}

/**
 * 获取图片尺寸
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Failed to load image'));
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

/**
 * 加载图片为 HTMLImageElement
 */
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

/**
 * 根据当前地图视口计算初始角点
 * 图片居中放置在视口中央，占据视口约 60% 的范围
 */
export function computeInitialCorners(
  center: [number, number],
  zoom: number,
  imageAspect: number,
): GeoCorners {
  // 根据 zoom 估算视口跨度 (度)
  const span = 360 / Math.pow(2, zoom) * 0.3;
  const halfW = (span * imageAspect) / 2;
  const halfH = span / 2;

  const [lng, lat] = center;
  return [
    [lng - halfW, lat + halfH], // topLeft
    [lng + halfW, lat + halfH], // topRight
    [lng + halfW, lat - halfH], // bottomRight
    [lng - halfW, lat - halfH], // bottomLeft
  ];
}

/**
 * 从角点计算轴对齐包围盒 extent
 */
export function cornersToExtent(corners: GeoCorners): [number, number, number, number] {
  const lngs = corners.map((c) => c[0]);
  const lats = corners.map((c) => c[1]);
  return [
    Math.min(...lngs), // minLng
    Math.min(...lats), // minLat
    Math.max(...lngs), // maxLng
    Math.max(...lats), // maxLat
  ];
}

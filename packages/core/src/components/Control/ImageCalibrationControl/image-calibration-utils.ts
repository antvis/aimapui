import type { GeoCorners, ImageSource, CropRegion } from './image-calibration-types';

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
 * 裁剪图片：根据 CropRegion 从原图裁剪出指定区域，返回裁剪后的 Blob 和 URL
 */
export async function cropImage(
  imageUrl: string,
  cropRegion: CropRegion,
  format = 'image/png',
  quality = 0.92,
): Promise<{ blob: Blob; url: string; revokeUrl: () => void; width: number; height: number }> {
  const img = await loadImage(imageUrl);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(cropRegion.width);
  canvas.height = Math.round(cropRegion.height);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.drawImage(
    img,
    Math.round(cropRegion.x),
    Math.round(cropRegion.y),
    Math.round(cropRegion.width),
    Math.round(cropRegion.height),
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => b ? resolve(b) : reject(new Error('Canvas toBlob failed')),
      format,
      quality,
    );
  });

  const url = URL.createObjectURL(blob);
  const revokeUrl = () => URL.revokeObjectURL(url);

  return {
    blob,
    url,
    revokeUrl,
    width: canvas.width,
    height: canvas.height,
  };
}

/**
 * 将裁剪区域约束在图片范围内
 */
export function clampCropRegion(region: CropRegion, imageWidth: number, imageHeight: number): CropRegion {
  const x = Math.max(0, Math.min(region.x, imageWidth - region.width));
  const y = Math.max(0, Math.min(region.y, imageHeight - region.height));
  const width = Math.max(1, Math.min(region.width, imageWidth - x));
  const height = Math.max(1, Math.min(region.height, imageHeight - y));
  return { x, y, width, height };
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

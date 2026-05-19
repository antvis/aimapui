import React, { useCallback } from 'react';
import { useMapControl, type ControlPosition } from '../../hooks/useMapControl';

/**
 * ExportImage 导出图片控件
 *
 * 遵循 L7 的 ButtonControl 规范 + Material Design 3 玻璃态风格：
 * - CSS 类名: .l7-control .l7-button-control
 * - 玻璃态: glass-effect + surface/90 背景
 * - 位置默认: topright
 * - API: mapsService.exportMap() + scene.exportPng()，然后合并图片
 */
export interface ExportImageControlProps {
  /** 控件位置，默认 topright */
  position?: ControlPosition;
  /** 图片格式，默认 png */
  format?: 'png' | 'jpg';
  className?: string;
  style?: React.CSSProperties;
  /** 导出回调 */
  onExport?: (base64: string) => void;
}

export function ExportImageControl({
  position = 'topright',
  format = 'png',
  onExport,
  className,
  style,
}: ExportImageControlProps) {
  const { scene, mapsService, positionClassName } = useMapControl(position);

  const imageType = format === 'jpg' ? 'jpeg' : 'png';

  const getImage = useCallback(async (): Promise<string | undefined> => {
    try {
      const mapImage = mapsService ? await mapsService.exportMap?.(imageType) : undefined;
      const layerImage = scene ? await (scene as any).exportPng?.(imageType) : undefined;
      const images = [mapImage, layerImage].filter((img): img is string => !!img);
      if (images.length === 0) return undefined;
      if (images.length === 1) return images[0];
      return mergeImages(images, imageType);
    } catch {
      return undefined;
    }
  }, [scene, mapsService, imageType]);

  const handleClick = useCallback(async () => {
    const base64 = await getImage();
    if (onExport && base64) {
      onExport(base64);
      return;
    }
    // 默认行为：下载
    if (base64) {
      const link = document.createElement('a');
      link.download = `aimap-export.${imageType === 'jpeg' ? 'jpg' : 'png'}`;
      link.href = base64;
      link.click();
    } else {
      // fallback: 尝试直接从 canvas 导出
      try {
        if (mapsService) {
          const container = mapsService.getContainer?.();
          const canvas = container?.querySelector('canvas');
          if (canvas && typeof canvas.toDataURL === 'function') {
            const dataUrl = canvas.toDataURL(`image/${imageType}`);
            const link = document.createElement('a');
            link.download = `aimap-export.${imageType === 'jpeg' ? 'jpg' : 'png'}`;
            link.href = dataUrl;
            link.click();
          }
        }
      } catch (err) {
        console.warn('[AimapKit] Export image failed:', err);
      }
    }
  }, [getImage, onExport, imageType, mapsService]);

  return (
    <div className={`l7-control-anchor ${positionClassName}`}>
      <div className={`l7-control l7-control--glass${className ? ` ${className}` : ''}`} style={style}>
        <button
          className="l7-button-control"
          onClick={handleClick}
          title="导出图片"
          aria-label="导出图片"
        >
          <span className="material-symbols-outlined">photo_camera</span>
        </button>
      </div>
    </div>
  );
}

/**
 * 合并多张 base64 图片
 */
async function mergeImages(base64List: string[], imageType: string): Promise<string> {
  const container = document.querySelector('.l7-map') || document.documentElement;
  const { width = 0, height = 0 } = container.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  const imgList = await Promise.all(
    base64List.map(
      (base64) =>
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = base64;
        }),
    ),
  );
  imgList.forEach((img) => {
    context?.drawImage(img, 0, 0, width, height);
  });
  return canvas.toDataURL(`image/${imageType}`);
}

export default ExportImageControl;
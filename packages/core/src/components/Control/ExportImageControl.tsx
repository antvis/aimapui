import React, { useCallback, forwardRef, useImperativeHandle } from 'react';
import { useMapControl, type ControlPosition } from '../../hooks/useMapControl';
import { useControlContainer, ControlRegistry } from './ControlContainer';

/**
 * ExportImage 导出图片控件
 *
 * 导图为底图（高德）和可视化图层（L7）的合并图。
 * 优先使用 L7 API（exportMap + exportPng），
 * 失败时回退到直接抓取 map 容器内的所有 canvas 合并。
 *
 * ```tsx
 * const ref = useRef<ExportImageHandle>(null);
 * <ExportImageControl ref={ref} />
 * const base64 = await ref.current?.exportImage();
 * ```
 */
export interface ExportImageControlProps {
  position?: ControlPosition;
  format?: 'png' | 'jpg';
  className?: string;
  style?: React.CSSProperties;
  onExport?: (base64: string) => void;
}

export interface ExportImageHandle {
  exportImage(format?: 'png' | 'jpg'): Promise<string | undefined>;
}

export const ExportImageControl = forwardRef<ExportImageHandle, ExportImageControlProps>(
  function ExportImageControl(
    { position = 'topright', format = 'png', onExport, className, style },
    ref,
  ) {
    const { scene, mapsService, positionClassName } = useMapControl(position);
    const isInContainer = useControlContainer();

    const exportImage = useCallback(
      async (fmt?: 'png' | 'jpg'): Promise<string | undefined> => {
        const imageType = fmt === 'jpg' ? 'jpeg' : 'png';
        try {
          // 方式一：L7 API
          const mapImage = mapsService
            ? await mapsService.exportMap?.(imageType)
            : undefined;
          const layerImage = scene
            ? await (scene as any).exportPng?.(imageType)
            : undefined;
          const images = [mapImage, layerImage].filter((img): img is string => !!img);
          if (images.length === 2) return mergeImages(images, imageType);
          if (images.length === 1) return images[0];
        } catch { /* fall through */ }

        // 方式二：直接抓取 map 容器内的所有 canvas
        try {
          const container = mapsService?.getContainer?.() ?? scene?.getContainer?.();
          if (!container) return undefined;
          const canvases = container.querySelectorAll('canvas');
          if (canvases.length === 0) return undefined;
          if (canvases.length === 1) return canvases[0].toDataURL(`image/${imageType}`);
          return mergeCanvases(Array.from(canvases), imageType);
        } catch {
          return undefined;
        }
      },
      [scene, mapsService],
    );

    useImperativeHandle(ref, () => ({ exportImage }));

    const handleClick = useCallback(async () => {
      const base64 = await exportImage(format);
      if (onExport && base64) { onExport(base64); return; }
      if (base64) {
        const link = document.createElement('a');
        link.download = `aimap-export.${format === 'jpg' ? 'jpg' : 'png'}`;
        link.href = base64;
        link.click();
      }
    }, [exportImage, format, onExport]);

    const controlContent = (
      <div className={`l7-control l7-control--glass${className ? ` ${className}` : ''}`} style={style}>
        <button className="l7-button-control" onClick={handleClick} title="导出图片" aria-label="导出图片">
          <span className="material-symbols-outlined">photo_camera</span>
        </button>
      </div>
    );

    if (isInContainer) return controlContent;
    return <div className={`l7-control-anchor ${positionClassName}`}>{controlContent}</div>;
  },
);

/** 合并 base64 图片 */
async function mergeImages(base64List: string[], imageType: string): Promise<string> {
  const container = document.querySelector('.l7-map') || document.documentElement;
  const { width, height } = container.getBoundingClientRect();
  if (!width || !height) return base64List[0];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imgs = await Promise.all(base64List.map(toImage));
  imgs.forEach((img) => ctx?.drawImage(img, 0, 0, width, height));
  return canvas.toDataURL(`image/${imageType}`);
}

/** 合并多个 canvas 元素 */
function mergeCanvases(canvases: HTMLCanvasElement[], imageType: string): string {
  const { width, height } = canvases[0];
  const merged = document.createElement('canvas');
  merged.width = width;
  merged.height = height;
  const ctx = merged.getContext('2d');
  canvases.forEach((c) => ctx?.drawImage(c, 0, 0));
  return merged.toDataURL(`image/${imageType}`);
}

function toImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = base64;
  });
}

ControlRegistry.mark(ExportImageControl);
export default ExportImageControl;
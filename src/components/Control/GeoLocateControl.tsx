import React, { useCallback } from 'react';
import { useMapControl, type ControlPosition } from '../../hooks/useMapControl';
import { useControlContainer, ControlRegistry } from './ControlContainer';

/**
 * GeoLocate 定位控件
 *
 * 遵循 L7 的 ButtonControl 规范 + Material Design 3 玻璃态风格：
 * - CSS 类名: .l7-control .l7-button-control
 * - 玻璃态: glass-effect + surface/90 背景
 * - 位置默认: topright
 * - API: navigator.geolocation + mapsService.setZoomAndCenter()
 * - transform 回调支持坐标转换
 */
export interface GeoLocateControlProps {
  /** 控件位置，默认 topright */
  position?: ControlPosition;
  /** 坐标转换函数 */
  transform?: (position: [number, number]) => [number, number] | Promise<[number, number]>;
  className?: string;
  style?: React.CSSProperties;
}

export function GeoLocateControl({
  position = 'topright',
  transform,
  className,
  style,
}: GeoLocateControlProps) {
  const { mapsService, positionClassName } = useMapControl(position);
  const isInContainer = useControlContainer();

  const handleClick = useCallback(async () => {
    if (!window.navigator.geolocation) {
      console.warn('[AimapKit] Geolocation is not supported by this browser');
      return;
    }
    if (!mapsService) return;

    try {
      const pos = await new Promise<GeolocationCoordinates>((resolve, reject) => {
        window.navigator.geolocation.getCurrentPosition(
          ({ coords }) => resolve(coords),
          (e) => reject(e),
        );
      });

      const { longitude, latitude } = pos;
      if (isNaN(longitude) || isNaN(latitude)) return;

      const lngLat: [number, number] = [longitude, latitude];
      const finalPos = transform ? await transform(lngLat) : lngLat;
      const currentZoom = mapsService.getZoom();
      mapsService.setZoomAndCenter(
        currentZoom > 15 ? currentZoom : 15,
        finalPos,
      );
    } catch (e) {
      console.warn('[AimapKit] Geolocation error:', e);
    }
  }, [mapsService, transform]);

  const controlContent = (
    <div className={`l7-control l7-control--glass${className ? ` ${className}` : ''}`} style={style}>
      <button
        className="l7-button-control"
        onClick={handleClick}
        title="定位"
        aria-label="定位"
      >
        <span className="material-symbols-outlined">my_location</span>
      </button>
    </div>
  );

  if (isInContainer) return controlContent;

  return (
    <div className={`l7-control-anchor ${positionClassName}`}>
      {controlContent}
    </div>
  );
}

// 注册为控件类型，供 ControlContainer 识别
ControlRegistry.mark(GeoLocateControl);

export default GeoLocateControl;
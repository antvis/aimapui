import React, { useEffect, useRef } from 'react';
import { useMapControl, type ControlPosition } from '../../hooks/useMapControl';
import { useControlContainer, ControlRegistry } from './ControlContainer';

/**
 * MouseLocation 鼠标坐标控件
 *
 * 遵循 L7 的 Control 规范 + Material Design 3 玻璃态风格：
 * - CSS 类名: .l7-control .l7-control-mouse-location
 * - 玻璃态: glass-effect + inverse-surface 背景
 * - 位置默认: bottomleft
 * - API: mapsService.on('mousemove', handler), e.lngLat || e.lnglat
 * - transform 回调支持坐标转换
 * - 直接操作 DOM innerText，与 L7 一致
 */
export interface MouseLocationControlProps {
  /** 控件位置，默认 bottomleft */
  position?: ControlPosition;
  /** 精度（小数位数），默认 6 */
  precision?: number;
  /** 坐标转换函数，设置后 precision 无效 */
  transform?: (position: [number, number]) => [number, number];
  className?: string;
  style?: React.CSSProperties;
}

export function MouseLocationControl({
  position = 'bottomleft',
  precision = 6,
  transform,
  className,
  style,
}: MouseLocationControlProps) {
  const defaultTransform = ([lng, lat]: [number, number]) => [+lng.toFixed(precision), +lat.toFixed(precision)] as [number, number];
  const actualTransform = transform ?? defaultTransform;
  const { mapsService, positionClassName } = useMapControl(position);
  const isInContainer = useControlContainer();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapsService) return;

    const onMouseMove = (e: any) => {
      const lngLat = e.lngLat ?? e.lnglat;
      if (!lngLat) return;
      const pos: [number, number] = [lngLat.lng, lngLat.lat];
      const transformed = actualTransform(pos);
      if (containerRef.current) {
        containerRef.current.innerText = transformed.join(', ');
      }
    };

    mapsService.on('mousemove', onMouseMove);
    return () => {
      mapsService.off('mousemove', onMouseMove);
    };
  }, [mapsService, actualTransform]);

  const controlContent = (
    <div
      ref={containerRef}
      className={`l7-control l7-control-mouse-location l7-control--glass${className ? ` ${className}` : ''}`}
      style={style}
    >
      &nbsp;
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
ControlRegistry.mark(MouseLocationControl);

export default MouseLocationControl;
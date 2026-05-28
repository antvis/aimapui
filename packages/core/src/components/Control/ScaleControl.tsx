import React, { useEffect, useRef, useState } from 'react';
import { useMapControl, type ControlPosition } from '../../hooks/useMapControl';
import { useControlContainer, ControlRegistry } from './ControlContainer';

/**
 * Scale 比例尺控件
 *
 * 遵循 L7 的 Control 规范 + Material Design 3 玻璃态风格：
 * - CSS 类名: .l7-control .l7-control-scale
 * - 玻璃态: glass-effect + surface/90 背景
 * - 位置默认: bottomleft
 * - API: mapsService.containerToLngLat() + lnglatDistance() 算法
 * - 事件: mapsService.on('mapmove') / mapsService.on('zoomchange')
 */
export interface ScaleControlProps {
  /** 控件位置，默认 bottomleft */
  position?: ControlPosition;
  /** 比例尺最大像素宽度，默认 100 */
  maxWidth?: number;
  /** 是否显示公制单位，默认 true */
  metric?: boolean;
  /** 是否显示英制单位，默认 false */
  imperial?: boolean;
  /** 是否在地图移动结束后才更新，默认 false（实时更新） */
  updateWhenIdle?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 计算 two point 之间距离 (Haversine)
 * 与 L7 的 lnglatDistance 算法一致
 */
function lnglatDistance(p1: [number, number], p2: [number, number]): number {
  const [lng1, lat1] = p1;
  const [lng2, lat2] = p2;
  const R = 6371008.8; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getRoundNum(num: number): number {
  const pow10 = Math.pow(10, Math.floor(Math.abs(num)).toString().length - 1);
  let d = num / pow10;
  d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;
  return pow10 * d;
}

export function ScaleControl({
  position = 'bottomleft',
  maxWidth = 100,
  metric = true,
  imperial = false,
  updateWhenIdle = false,
  className,
  style,
}: ScaleControlProps) {
  const { mapsService, positionClassName } = useMapControl(position);
  const isInContainer = useControlContainer();
  const [lines, setLines] = useState<{ text: string; width: number }[]>([]);

  const updateScale = useRef(() => {
    if (!mapsService) return;
    try {
      const size = mapsService.getSize();
      const y = size[1] / 2;
      const p1 = mapsService.containerToLngLat([0, y]);
      const p2 = mapsService.containerToLngLat([maxWidth, y]);
      if (!p1 || !p2) return;
      const maxMeters = lnglatDistance([p1.lng, p1.lat], [p2.lng, p2.lat]);

      const newLines: { text: string; width: number }[] = [];
      if (metric && maxMeters) {
        const meters = getRoundNum(maxMeters);
        const label = meters < 1000 ? `${meters} m` : `${meters / 1000} km`;
        newLines.push({ text: label, width: Math.round(maxWidth * (meters / maxMeters)) });
      }
      if (imperial && maxMeters) {
        const maxFeet = maxMeters * 3.2808399;
        if (maxFeet > 5280) {
          const maxMiles = maxFeet / 5280;
          const miles = getRoundNum(maxMiles);
          newLines.push({ text: `${miles} mi`, width: Math.round(maxWidth * (miles / maxMiles)) });
        } else {
          const feet = getRoundNum(maxFeet);
          newLines.push({ text: `${feet} ft`, width: Math.round(maxWidth * (feet / maxFeet)) });
        }
      }
      setLines(newLines);
    } catch {
      // 场景可能未就绪
    }
  });

  useEffect(() => {
    if (!mapsService) return;
    updateScale.current();
    const handler = () => updateScale.current();
    const moveEvent = updateWhenIdle ? 'moveend' : 'mapmove';
    const zoomEvent = updateWhenIdle ? 'zoomend' : 'zoomchange';
    mapsService.on(moveEvent, handler);
    mapsService.on(zoomEvent, handler);
    return () => {
      mapsService.off(moveEvent, handler);
      mapsService.off(zoomEvent, handler);
    };
  }, [mapsService, maxWidth, metric, imperial, updateWhenIdle]);

  const controlContent = (
    <div className={`l7-control l7-control-scale l7-control--glass${className ? ` ${className}` : ''}`} style={style}>
      {lines.map((line, i) => (
        <div key={i} className="l7-control-scale-line" style={{ width: line.width }}>
          {line.text}
        </div>
      ))}
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
ControlRegistry.mark(ScaleControl);

export default ScaleControl;
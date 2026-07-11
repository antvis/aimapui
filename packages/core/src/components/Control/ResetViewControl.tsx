import React, { useCallback } from 'react';
import { useMapControl, type ControlPosition } from '../../hooks/useMapControl';
import { useControlContainer, ControlRegistry } from './ControlContainer';

/**
 * ResetView 控件 — 一键重置地图到初始视图
 *
 * 遵循 L7 Control 规范 + Material Design 3 玻璃态风格。
 * 点击后将地图中心、缩放级别、旋转角、俯仰角恢复到初始状态。
 */
export interface ResetViewControlProps {
  /** 控件位置，默认 bottomright */
  position?: ControlPosition;
  /** 按钮图标，默认 Material Symbols "center_focus_strong" */
  icon?: React.ReactNode;
  /** 按钮标题/tooltip */
  title?: string;
  /** 自定义初始视图参数。不传时使用 scene 创建时的初始值 */
  initialView?: {
    center?: [number, number];
    zoom?: number;
    pitch?: number;
    rotation?: number;
  };
  className?: string;
  style?: React.CSSProperties;
}

export function ResetViewControl({
  position = 'bottomright',
  icon,
  title = 'Reset view',
  initialView,
  className,
  style,
}: ResetViewControlProps) {
  const { scene, mapsService, positionClassName } = useMapControl(position);
  const isInContainer = useControlContainer();

  const handleReset = useCallback(() => {
    if (!scene || !mapsService) return;

    const center = initialView?.center ?? [104.0, 35.0];
    const zoom = initialView?.zoom ?? 4;
    const pitch = initialView?.pitch ?? 0;
    const rotation = initialView?.rotation ?? 0;

    scene.setCenter(center);
    scene.setZoom(zoom);
    scene.setPitch(pitch);
    scene.setRotation(rotation);
  }, [scene, mapsService, initialView]);

  const controlContent = (
    <div
      className={`l7-control l7-control-reset l7-control--glass${className ? ` ${className}` : ''}`}
      style={style}
    >
      <button
        className="l7-button-control"
        onClick={handleReset}
        title={title}
        aria-label={title}
      >
        {icon ?? <span className="material-symbols-outlined">center_focus_strong</span>}
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

ControlRegistry.mark(ResetViewControl);

export default ResetViewControl;

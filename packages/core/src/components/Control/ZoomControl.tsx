import React, { useEffect, useRef, useState } from 'react';
import { useMapControl, type ControlPosition } from '../../hooks/useMapControl';
import { useControlContainer, ControlRegistry } from './ControlContainer';

/**
 * Zoom 控件
 *
 * 遵循 L7 的 Control 规范 + Material Design 3 玻璃态风格：
 * - CSS 类名: .l7-control .l7-control-zoom
 * - 按钮: .l7-button-control
 * - 玻璃态: glass-effect + surface/90 背景
 * - 位置默认: bottomright
 * - API: mapsService.zoomIn() / zoomOut() / getZoom() / getMinZoom() / getMaxZoom()
 * - 事件: mapsService.on('zoomend', 'zoomchange')
 */
export interface ZoomControlProps {
  /** 控件位置，默认 bottomright */
  position?: ControlPosition;
  /** 缩放按钮图标/文本，默认使用 Material Symbols Outlined */
  zoomInText?: React.ReactNode;
  zoomInTitle?: string;
  zoomOutText?: React.ReactNode;
  zoomOutTitle?: string;
  /** 是否显示当前缩放级别数字 */
  showZoom?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function ZoomControl({
  position = 'bottomright',
  zoomInText,
  zoomInTitle = 'Zoom in',
  zoomOutText,
  zoomOutTitle = 'Zoom out',
  showZoom = false,
  className,
  style,
}: ZoomControlProps) {
  const { mapsService, positionClassName } = useMapControl(position);
  const isInContainer = useControlContainer();
  const [zoom, setZoom] = useState<number>(0);
  const [canZoomIn, setCanZoomIn] = useState(true);
  const [canZoomOut, setCanZoomOut] = useState(true);

  const updateDisabled = useRef(() => {
    if (!mapsService) return;
    const currentZoom = Math.floor(mapsService.getZoom());
    setZoom(currentZoom);
    setCanZoomIn(mapsService.getZoom() < mapsService.getMaxZoom());
    setCanZoomOut(mapsService.getZoom() > mapsService.getMinZoom());
  });

  useEffect(() => {
    if (!mapsService) return;
    updateDisabled.current();
    const handler = () => updateDisabled.current();
    mapsService.on('zoomend', handler);
    mapsService.on('zoomchange', handler);
    return () => {
      mapsService.off('zoomend', handler);
      mapsService.off('zoomchange', handler);
    };
  }, [mapsService]);

  const handleZoomIn = () => {
    if (!mapsService || !scene) return;
    const currentZoom = mapsService.getZoom();
    const maxZoom = mapsService.getMaxZoom();
    if (currentZoom < maxZoom) {
      const newZoom = Math.min(currentZoom + 1, maxZoom);
      scene.setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (!mapsService || !scene) return;
    const currentZoom = mapsService.getZoom();
    const minZoom = mapsService.getMinZoom();
    if (currentZoom > minZoom) {
      const newZoom = Math.max(currentZoom - 1, minZoom);
      scene.setZoom(newZoom);
    }
  };

  const controlContent = (
    <div
      className={`l7-control l7-control-zoom l7-control--glass${className ? ` ${className}` : ''}`}
      style={style}
    >
      <button
        className="l7-button-control"
        onClick={handleZoomIn}
        disabled={!canZoomIn}
        title={zoomInTitle}
        aria-label={zoomInTitle}
      >
        {zoomInText ?? <span className="material-symbols-outlined">add</span>}
      </button>
      {showZoom && (
        <button className="l7-button-control l7-control-zoom__number" disabled>
          {zoom}
        </button>
      )}
      <button
        className="l7-button-control"
        onClick={handleZoomOut}
        disabled={!canZoomOut}
        title={zoomOutTitle}
        aria-label={zoomOutTitle}
      >
        {zoomOutText ?? <span className="material-symbols-outlined">remove</span>}
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
ControlRegistry.mark(ZoomControl);

export default ZoomControl;
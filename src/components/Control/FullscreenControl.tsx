import React, { useEffect, useState, useCallback } from 'react';
import { useMapControl, type ControlPosition } from '../../hooks/useMapControl';

/**
 * Fullscreen 全屏控件
 *
 * 遵循 L7 的 ButtonControl 规范 + Material Design 3 玻璃态风格：
 * - CSS 类名: .l7-control .l7-button-control
 * - 玻璃态: glass-effect + surface/90 背景
 * - 位置默认: topright
 * - API: ScreenFull.toggle(container)
 * - 事件: document.fullscreenchange
 */
export interface FullscreenControlProps {
  /** 控件位置，默认 topright */
  position?: ControlPosition;
  /** 全屏目标容器，默认使用地图容器 */
  container?: HTMLElement | null;
  className?: string;
  style?: React.CSSProperties;
}

export function FullscreenControl({
  position = 'topright',
  container,
  className,
  style,
}: FullscreenControlProps) {
  const { getMapContainer, positionClassName } = useMapControl(position);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getTarget = useCallback(() => {
    return container ?? getMapContainer() ?? document.documentElement;
  }, [container, getMapContainer]);

  const handleToggle = useCallback(() => {
    const target = getTarget();
    if (!isFullscreen) {
      if (target.requestFullscreen) {
        target.requestFullscreen();
      } else if ((target as any).webkitRequestFullscreen) {
        (target as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  }, [isFullscreen, getTarget]);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  return (
    <div className={`l7-control-anchor ${positionClassName}`}>
      <div className={`l7-control l7-control--glass${className ? ` ${className}` : ''}`} style={style}>
        <button
          className="l7-button-control"
          onClick={handleToggle}
          title={isFullscreen ? '退出全屏' : '全屏'}
          aria-label={isFullscreen ? '退出全屏' : '全屏'}
        >
          <span className="material-symbols-outlined">
            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
          </span>
        </button>
      </div>
    </div>
  );
}

export default FullscreenControl;
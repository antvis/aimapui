import React, { useState, useEffect, useRef } from 'react';
import { useMapControl } from '../../hooks/useMapControl';
import type { ControlPosition } from '../../hooks/useMapControl';
import { useControlContainer, ControlRegistry } from './ControlContainer';

/**
 * 图层配置项 — 支持可见性切换 + 透明度
 */
export interface LayerItem {
  /** 图层 ID */
  id: string;
  /** 图层名称 */
  name?: string;
  /** 是否可见，默认 true */
  visible?: boolean;
  /** 透明度 0~1，默认 1 */
  opacity?: number;
  /** 图层图标 (Material Symbols Outlined 名称)，默认 layers */
  icon?: string;
}

export interface LayerSwitchControlProps {
  /** 控件位置，默认 topright */
  position?: ControlPosition;
  /** 图层列表 */
  layers: LayerItem[];
  /** 可见性切换回调 */
  onToggle: (layerId: string, visible: boolean) => void;
  /** 透明度变化回调 */
  onOpacityChange?: (layerId: string, opacity: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function LayerSwitchControl({
  position = 'topright',
  layers,
  onToggle,
  onOpacityChange,
  className,
  style,
}: LayerSwitchControlProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 每个图层的本地透明度状态
  const [opacities, setOpacities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    layers.forEach((l) => {
      init[l.id] = l.opacity ?? 1;
    });
    return init;
  });

  // 同步外部 opacity 变化
  useEffect(() => {
    setOpacities((prev) => {
      const next = { ...prev };
      layers.forEach((l) => {
        if (l.opacity !== undefined) next[l.id] = l.opacity;
      });
      return next;
    });
  }, [layers]);

  const { positionClassName } = useMapControl(position);
  const isInContainer = useControlContainer();

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!layers.length) return null;

  const popperClass = getPopperDirection(position);

  const handleOpacityChange = (layerId: string, value: number) => {
    setOpacities((prev) => ({ ...prev, [layerId]: value }));
    onOpacityChange?.(layerId, value);
  };

  const controlContent = (
    <div
      ref={containerRef}
      className={`l7-control l7-control--glass${className ? ` ${className}` : ''}`}
      style={style}
    >
      <button
        className="l7-button-control"
        onClick={() => setOpen(!open)}
        title="图层控制"
        aria-label="图层控制"
      >
        <span className="material-symbols-outlined">layers</span>
      </button>
      {open && (
        <div className={`l7-popper ${popperClass}`}>
          <div className="l7-popper-content l7-layer-panel">
            <div className="l7-layer-panel__title">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>layers</span>
              Layers
            </div>
            <div className="l7-layer-panel__list">
              {layers.map((layer) => {
                const isVisible = layer.visible !== false;
                const opacity = opacities[layer.id] ?? layer.opacity ?? 1;
                const iconName = layer.icon ?? 'layers';
                return (
                  <div
                    key={layer.id}
                    className={`l7-layer-item${!isVisible ? ' l7-layer-item--disabled' : ''}`}
                  >
                    <div className="l7-layer-item__header">
                      <span className="material-symbols-outlined l7-layer-item__icon">
                        {iconName}
                      </span>
                      <span className="l7-layer-item__name">{layer.name ?? layer.id}</span>
                      {/* Toggle Switch */}
                      <label className="l7-layer-toggle">
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => onToggle(layer.id, !isVisible)}
                        />
                        <span className="l7-layer-toggle__track" />
                      </label>
                    </div>
                    {onOpacityChange && (
                      <div className="l7-layer-item__slider">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                          opacity
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={Math.round(opacity * 100)}
                          onChange={(e) => handleOpacityChange(layer.id, +e.target.value / 100)}
                          className="l7-layer-slider"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isInContainer) return controlContent;

  return (
    <div className={`l7-control-anchor ${positionClassName}`}>
      {controlContent}
    </div>
  );
}

function getPopperDirection(pos: ControlPosition): string {
  switch (pos) {
    case 'topleft': return 'l7-popper-right l7-popper-start';
    case 'topright': return 'l7-popper-left l7-popper-start';
    case 'bottomleft': return 'l7-popper-right l7-popper-end';
    case 'bottomright': return 'l7-popper-left l7-popper-end';
    case 'lefttop': return 'l7-popper-bottom l7-popper-start';
    case 'leftbottom': return 'l7-popper-top l7-popper-start';
    case 'righttop': return 'l7-popper-bottom l7-popper-end';
    case 'rightbottom': return 'l7-popper-top l7-popper-end';
    default: return 'l7-popper-bottom';
  }
}

// 注册为控件类型，供 ControlContainer 识别
ControlRegistry.mark(LayerSwitchControl);

export default LayerSwitchControl;
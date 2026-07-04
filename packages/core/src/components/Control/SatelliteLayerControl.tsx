import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMapControl, type ControlPosition } from '../../hooks/useMapControl';
import { usePopperPosition } from '../../hooks/usePopperPosition';
import { useControlContainer, ControlRegistry } from './ControlContainer';
import type { SatelliteProvider } from '../CompositeLayer/SatelliteLayer';
import { SATELLITE_PROVIDER_NAMES } from '../CompositeLayer/SatelliteLayer';

/**
 * 卫星影像控件配置
 */
export interface SatelliteLayerControlProps {
  /** 控件位置，默认 topright */
  position?: ControlPosition;
  /** 当前激活的提供商 */
  activeProvider?: SatelliteProvider;
  /** 是否可见，默认 true */
  visible?: boolean;
  /** 透明度 0~1，默认 1 */
  opacity?: number;
  /** 提供商切换回调 */
  onProviderChange?: (provider: SatelliteProvider) => void;
  /** 可见性切换回调 */
  onVisibleChange?: (visible: boolean) => void;
  /** 透明度变化回调 */
  onOpacityChange?: (opacity: number) => void;
  /** 支持的提供商列表，默认全部 */
  providers?: SatelliteProvider[];
  className?: string;
  style?: React.CSSProperties;
}

/** 所有可用提供商 */
const ALL_PROVIDERS: SatelliteProvider[] = ['gaode', 'tianditu', 'google'];

/**
 * 卫星影像图层控件
 *
 * 提供卫星影像提供商切换、可见性开关和透明度调节功能。
 * 通常与 SatelliteLayer 组件配合使用。
 *
 * @example
 * ```tsx
 * const [provider, setProvider] = useState<SatelliteProvider>('gaode');
 * const [visible, setVisible] = useState(true);
 * const [opacity, setOpacity] = useState(1);
 *
 * <AiMap map={{ basemap: 'map' }}>
 *   <SatelliteLayer provider={provider} visible={visible} opacity={opacity} />
 *   <SatelliteLayerControl
 *     activeProvider={provider}
 *     visible={visible}
 *     opacity={opacity}
 *     onProviderChange={setProvider}
 *     onVisibleChange={setVisible}
 *     onOpacityChange={setOpacity}
 *   />
 * </AiMap>
 * ```
 */
export function SatelliteLayerControl({
  position = 'topright',
  activeProvider = 'gaode',
  visible = true,
  opacity = 1,
  onProviderChange,
  onVisibleChange,
  onOpacityChange,
  providers = ALL_PROVIDERS,
  className,
  style,
}: SatelliteLayerControlProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { positionClassName } = useMapControl(position);
  const isInContainer = useControlContainer();
  const { popperRef, popperClass } = usePopperPosition(position, open, containerRef);

  // 点击外部关闭面板
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

  const handleProviderSelect = useCallback((provider: SatelliteProvider) => {
    onProviderChange?.(provider);
  }, [onProviderChange]);

  const handleVisibleToggle = useCallback(() => {
    onVisibleChange?.(!visible);
  }, [visible, onVisibleChange]);

  const handleOpacityChange = useCallback((value: number) => {
    onOpacityChange?.(value);
  }, [onOpacityChange]);

  const controlContent = (
    <div
      ref={containerRef}
      className={`l7-control l7-control--glass${open ? ' l7-control--popper-open' : ''}${className ? ` ${className}` : ''}`}
      style={style}
    >
      <button
        className="l7-button-control"
        onClick={() => setOpen(!open)}
        title="卫星影像"
        aria-label="卫星影像控制"
      >
        <span className="material-symbols-outlined">satellite_alt</span>
      </button>
      {open && (
        <div ref={popperRef} className={`l7-popper ${popperClass}`}>
          <div className="l7-popper-content l7-satellite-panel">
            {/* 标题 */}
            <div className="l7-satellite-panel__title">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>satellite_alt</span>
              Satellite
            </div>

            {/* 可见性开关 */}
            <div className="l7-satellite-panel__row">
              <span className="l7-satellite-panel__label">Visible</span>
              <label className="l7-layer-toggle">
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={handleVisibleToggle}
                />
                <span className="l7-layer-toggle__track" />
              </label>
            </div>

            {/* 透明度滑块 */}
            <div className="l7-satellite-panel__row">
              <span className="l7-satellite-panel__label">
                <span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4 }}>opacity</span>
                Opacity
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(opacity * 100)}
                onChange={(e) => handleOpacityChange(+e.target.value / 100)}
                className="l7-layer-slider"
                disabled={!visible}
              />
              <span className="l7-satellite-panel__value">{Math.round(opacity * 100)}%</span>
            </div>

            {/* 提供商选择 */}
            <div className="l7-satellite-panel__providers">
              {providers.map((provider) => {
                const isActive = activeProvider === provider;
                const displayName = SATELLITE_PROVIDER_NAMES[provider] ?? provider;
                return (
                  <button
                    key={provider}
                    className={`l7-satellite-provider${isActive ? ' l7-satellite-provider--active' : ''}`}
                    onClick={() => handleProviderSelect(provider)}
                    disabled={!visible}
                    title={displayName}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {isActive ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                    <span className="l7-satellite-provider__name">{displayName}</span>
                  </button>
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

// 注册为控件类型，供 ControlContainer 识别
ControlRegistry.mark(SatelliteLayerControl);

export default SatelliteLayerControl;

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMapControl, type ControlPosition } from '../../hooks/useMapControl';
import { usePopperPosition } from '../../hooks/usePopperPosition';
import { useControlContainer, ControlRegistry } from './ControlContainer';

/**
 * 地图主题选项 — 支持预览色块
 */
export interface ThemeOption {
  /** 主题显示名称 */
  text: string;
  /** 主题值（传给 mapsService.setMapStyle） */
  value: string;
  /** 主题预览色块，支持 CSS 渐变 */
  preview?: string;
}

/**
 * 内置高德地图主题预设
 */
export const GAODE_THEME_PRESETS: ThemeOption[] = [
  { text: 'Standard', value: 'normal', preview: 'linear-gradient(135deg, #e8e8e8 0%, #c8d8e8 40%, #a8c8d8 100%)' },
  { text: 'Light', value: 'light', preview: 'linear-gradient(135deg, #f0f4f8 0%, #d6e4f0 40%, #e8eff5 100%)' },
  { text: 'Dark', value: 'dark', preview: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 40%, #162032 100%)' },
  { text: 'Dark Blue', value: 'darkblue', preview: 'linear-gradient(135deg, #0a1628 0%, #0f2040 40%, #091a30 100%)' },
  { text: 'Satellite', value: 'satellite', preview: 'linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 40%, #1d4a2d 100%)' },
  { text: 'Fresh', value: 'fresh', preview: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 40%, #d4edda 100%)' },
];

/**
 * Mapbox / Maplibre 主题预设 — 基于 openfreemap 样式
 */
export const OPENFREEMAP_THEME_PRESETS: ThemeOption[] = [
  { text: 'Positron', value: 'https://tiles.openfreemap.org/styles/positron', preview: 'linear-gradient(135deg, #f2f3f0 0%, #d8dcd6 40%, #e8ebe5 100%)' },
  { text: 'Bright', value: 'https://tiles.openfreemap.org/styles/bright', preview: 'linear-gradient(135deg, #e8e8e8 0%, #c8d8e8 40%, #a8c8d8 100%)' },
  { text: 'Dark', value: 'https://tiles.openfreemap.org/styles/dark', preview: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)' },
  { text: 'Liberty', value: 'https://tiles.openfreemap.org/styles/liberty', preview: 'linear-gradient(135deg, #f0ece2 0%, #dfd7c8 40%, #c8bfad 100%)' },
  { text: 'Fiord', value: 'https://tiles.openfreemap.org/styles/fiord', preview: 'linear-gradient(135deg, #2c3e50 0%, #34495e 40%, #415b76 100%)' },
];

/**
 * 独立 Map (L7 内置) 主题预设
 */
export const INDEPENDENT_MAP_THEME_PRESETS: ThemeOption[] = [
  { text: 'Light', value: 'light', preview: 'linear-gradient(135deg, #f0f4f8 0%, #d6e4f0 40%, #e8eff5 100%)' },
  { text: 'Dark', value: 'dark', preview: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 40%, #162032 100%)' },
  { text: 'Normal', value: 'normal', preview: 'linear-gradient(135deg, #e8e8e8 0%, #c8d8e8 40%, #a8c8d8 100%)' },
];

export interface MapThemeControlProps {
  /** 控件位置，默认 topright */
  position?: ControlPosition;
  /** 自定义主题选项，默认自动获取 */
  options?: ThemeOption[];
  /** 默认选中的主题值 */
  defaultValue?: string;
  /** 主题切换回调 */
  onThemeChange?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function MapThemeControl({
  position = 'topright',
  options: propOptions,
  defaultValue,
  onThemeChange,
  className,
  style,
}: MapThemeControlProps) {
  const { mapsService, positionClassName } = useMapControl(position);
  const isInContainer = useControlContainer();
  const [open, setOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState<string>(defaultValue ?? '');
  const [options, setOptions] = useState<ThemeOption[]>(propOptions ?? []);
  const containerRef = useRef<HTMLDivElement>(null);

  const { popperRef, popperClass } = usePopperPosition(position, open, containerRef);

  // 自动获取地图样式选项
  useEffect(() => {
    if (propOptions && propOptions.length > 0) {
      setOptions(propOptions);
      return;
    }
    if (!mapsService) return;
    try {
      const styleConfig = mapsService.getMapStyleConfig?.();
      if (styleConfig && typeof styleConfig === 'object') {
        const opts = Object.entries(styleConfig)
          .filter(([, value]) => typeof value === 'string')
          .map(([key, value]) => {
            const preset = GAODE_THEME_PRESETS.find((p) => p.value === value);
            return {
              text: key,
              value: value as string,
              preview: preset?.preview,
            };
          });
        if (opts.length > 0) {
          setOptions(opts);
          return;
        }
      }
    } catch {
      // 某些底图可能不支持
    }
    setOptions(GAODE_THEME_PRESETS);
  }, [mapsService, propOptions]);

  // 获取当前地图样式
  useEffect(() => {
    if (defaultValue) {
      setCurrentValue(defaultValue);
      return;
    }
    if (!mapsService) return;
    try {
      const currentStyle = mapsService.getMapStyle?.();
      if (currentStyle) {
        setCurrentValue(currentStyle);
      }
    } catch {
      // ignore
    }
  }, [mapsService, defaultValue]);

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

  const handleSelect = useCallback((value: string) => {
    setCurrentValue(value);
    if (mapsService) {
      try {
        mapsService.setMapStyle(value);
      } catch {
        // 部分底图可能不支持
      }
    }
    onThemeChange?.(value);
  }, [mapsService, onThemeChange]);

  const controlContent = (
    <div
      ref={containerRef}
      className={`l7-control l7-control--glass${open ? ' l7-control--popper-open' : ''}${className ? ` ${className}` : ''}`}
      style={style}
    >
      <button
        className="l7-button-control"
        onClick={() => setOpen(!open)}
        title="地图样式"
        aria-label="地图样式"
      >
        <span className="material-symbols-outlined">palette</span>
      </button>
      {open && options.length > 0 && (
        <div ref={popperRef} className={`l7-popper ${popperClass}`}>
          <div className="l7-popper-content l7-theme-panel">
            <div className="l7-theme-chips">
              {options.map((opt) => {
                const isActive = currentValue === opt.value;
                const dotBg = opt.preview ?? 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)';
                return (
                  <button
                    key={opt.value}
                    className={`l7-theme-chip${isActive ? ' l7-theme-chip--active' : ''}`}
                    onClick={() => handleSelect(opt.value)}
                    title={opt.text}
                  >
                    <span
                      className="l7-theme-chip__dot"
                      style={{ background: dotBg }}
                    />
                    <span className="l7-theme-chip__label">{opt.text}</span>
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
ControlRegistry.mark(MapThemeControl);

export default MapThemeControl;

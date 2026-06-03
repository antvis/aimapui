import React from 'react';
import { useScene } from '../../context/SceneContext';
import { cx } from '../../utils/style';
import type { MobileToolbarConfig } from '../../schema/types';

export interface MobileToolbarProps {
  config: MobileToolbarConfig;
  className?: string;
}

/**
 * 移动端底部工具栏
 */
export function MobileToolbar({ config, className }: MobileToolbarProps) {
  const scene = useScene();
  const { items, position = 'bottom' } = config;

  const handleAction = (action: string) => {
    switch (action) {
      case 'zoomIn':
        scene?.zoomIn();
        break;
      case 'zoomOut':
        scene?.zoomOut();
        break;
      case 'locate':
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            scene?.setCenter([pos.coords.longitude, pos.coords.latitude]);
            scene?.setZoom(14);
          });
        }
        break;
      case 'reset':
        scene?.setCenter([105, 35]);
        scene?.setZoom(4);
        break;
      case 'layers':
        // 图层控制由上层处理
        break;
      default:
        break;
    }
  };

  const ACTION_ICONS: Record<string, React.ReactNode> = {
    zoomIn: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 5v14m-7-7h14" />
      </svg>
    ),
    zoomOut: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M5 12h14" />
      </svg>
    ),
    locate: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
      </svg>
    ),
    reset: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 12a9 9 0 1 1 3.3 6.9" />
        <path d="M3 22v-7h7" />
      </svg>
    ),
    layers: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  };

  const ACTION_LABELS: Record<string, string> = {
    zoomIn: '放大',
    zoomOut: '缩小',
    locate: '定位',
    reset: '复位',
    layers: '图层',
  };

  const wrapperPosition =
    position === 'bottom'
      ? 'bottom-0 left-0 right-0 flex justify-center pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-2'
      : 'top-0 left-0 right-0 flex justify-center pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-2';

  return (
    <div
      className={cx(
        'aimapui-mobile-toolbar pointer-events-none',
        position === 'bottom'
          ? 'aimapui-mobile-toolbar--bottom'
          : 'aimapui-mobile-toolbar--top',
        className,
      )}
    >
      <div className="aimapui-mobile-toolbar__bar pointer-events-auto">
        {items.map((item, index) => (
          <button
            key={`${item}-${index}`}
            onClick={() => handleAction(item)}
            className="aimapui-mobile-toolbar__button group"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            aria-label={ACTION_LABELS[item] ?? item}
            title={ACTION_LABELS[item] ?? item}
          >
            <span className="aimapui-mobile-toolbar__icon">
              {ACTION_ICONS[item]}
            </span>
            <span className="aimapui-mobile-toolbar__label">
              {ACTION_LABELS[item] ?? item}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MobileToolbar;
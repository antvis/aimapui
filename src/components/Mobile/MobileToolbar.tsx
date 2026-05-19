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

  const positionClasses = position === 'top'
    ? 'top-0 left-0 right-0'
    : 'bottom-0 left-0 right-0';

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
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 5v14m-7-7h14" />
      </svg>
    ),
    zoomOut: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M5 12h14" />
      </svg>
    ),
    locate: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
      </svg>
    ),
    reset: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 12a9 9 0 1 1 3.3 6.9" />
        <path d="M3 22v-7h7" />
      </svg>
    ),
    layers: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  };

  return (
    <div
      className={cx(
        'absolute z-40 bg-surface/80 backdrop-blur-md border-t border-outline-variant/30 safe-area-inset shadow-lg',
        positionClasses,
        className,
      )}
    >
      <div className="flex items-center justify-around py-3 px-4">
        {items.map((item, index) => (
          <button
            key={`${item}-${index}`}
            onClick={() => handleAction(item)}
            className="flex flex-col items-center gap-1 p-2 text-on-surface hover:bg-surface-variant transition-colors rounded-lg"
            aria-label={item}
          >
            {ACTION_ICONS[item] ?? <span className="text-label-caps font-label-caps">{item}</span>}
            <span className="text-label-caps font-label-caps">{item}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MobileToolbar;
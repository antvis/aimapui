import React, { useState, useCallback, useRef } from 'react';
import type { LegendRampSchema, LegendInteractionCallbacks } from '../../schema/types';
import { cx } from '../../utils/style';

export interface LegendRampProps extends LegendRampSchema {
  className?: string;
  /** 交互回调 */
  interaction?: LegendInteractionCallbacks;
}

/**
 * 连续/分级色带图例
 *
 * 视觉规范:
 * - 色条高度 12px，圆角 4px
 * - isContinuous: 无级渐变 (linear-gradient)，否则分段色块
 * - 标签: 两侧 min/max，多标签时显示中间值
 * - showTicks: 刻度线
 * - brushable: 范围刷选手柄，支持拖动筛选数据范围
 *
 * @see legend.md §3 连续与分级图例
 */
export function LegendRamp({
  title,
  labels,
  colors,
  isContinuous = false,
  showTicks = false,
  brushable = false,
  className,
  interaction,
}: LegendRampProps) {
  const [brushRange, setBrushRange] = useState<[number, number]>([0, 100]);
  const barRef = useRef<HTMLDivElement>(null);

  const gradient = colors.join(', ');

  const handleBrushMouseDown = useCallback(
    (handle: 'left' | 'right') => (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const bar = barRef.current;
      if (!bar) return;

      const barWidth = bar.getBoundingClientRect().width;

      const onMove = (moveEvent: MouseEvent) => {
        const rect = bar!.getBoundingClientRect();
        const x = moveEvent.clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / barWidth) * 100));

        setBrushRange((prev) => {
          let next: [number, number];
          if (handle === 'left') {
            next = [Math.min(percent, prev[1] - 5), prev[1]];
          } else {
            next = [prev[0], Math.max(percent, prev[0] + 5)];
          }
          interaction?.onBrush?.(next);
          return next;
        });
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [interaction, barRef],
  );

  return (
    <div className={cx(className)}>
      {title && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          {title}
        </div>
      )}

      {/* 色条 */}
      <div className="flex flex-col gap-1" ref={barRef}>
        <div
          className={cx(
            'flex h-3 rounded overflow-hidden shadow-inset-outline',
            isContinuous && 'bg-[length:100%_100%]',
          )}
          style={
            isContinuous
              ? { background: `linear-gradient(to right, ${gradient})` }
              : undefined
          }
        >
          {!isContinuous &&
            colors.map((color, i) => (
              <div
                key={i}
                className="flex-1 relative"
                style={{ backgroundColor: color }}
              />
            ))}
        </div>

        {/* 刻度线 */}
        {showTicks && (
          <div className="flex justify-between h-1.5 mt-0.5">
            {colors.map((_, i) =>
              i === 0 ? null : (
                <div
                  key={i}
                  className="w-px h-full bg-outline-variant"
                  style={{
                    position: 'absolute',
                    left: `${(i / (colors.length - 1)) * 100}%`,
                  }}
                />
              ),
            )}
          </div>
        )}

        {/* 标签 */}
        <div className="flex justify-between font-mono text-legend-value text-on-surface-variant">
          <span>{labels[0]}</span>
          {labels.length > 2 && (
            <span>{labels[Math.floor(labels.length / 2)]}</span>
          )}
          <span>{labels[labels.length - 1]}</span>
        </div>

        {/* 范围刷选 */}
        {brushable && (
          <div className="relative h-3 mt-1 cursor-ew-resize">
            <div
              className="absolute top-0 h-full border-2 border-primary rounded-sm bg-primary/10 pointer-events-none"
              style={{
                left: `${brushRange[0]}%`,
                width: `${brushRange[1] - brushRange[0]}%`,
              }}
            />
            <div
              className="absolute top-1/2 w-2 h-4 bg-primary rounded-sm -translate-x-1/2 -translate-y-1/2 cursor-ew-resize shadow-sm hover:shadow-md hover:shadow-primary/30 transition-shadow duration-150"
              style={{ left: `${brushRange[0]}%` }}
              onMouseDown={handleBrushMouseDown('left')}
            />
            <div
              className="absolute top-1/2 w-2 h-4 bg-primary rounded-sm -translate-x-1/2 -translate-y-1/2 cursor-ew-resize shadow-sm hover:shadow-md hover:shadow-primary/30 transition-shadow duration-150"
              style={{ left: `${brushRange[1]}%` }}
              onMouseDown={handleBrushMouseDown('right')}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default LegendRamp;
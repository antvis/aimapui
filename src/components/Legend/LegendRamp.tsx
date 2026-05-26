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
    <div className={cx('aimapui-legend-section', className)}>
      {title && <div className="aimapui-legend-title">{title}</div>}

      {/* 色条 */}
      <div className="aimapui-legend-ramp" ref={barRef}>
        <div
          className={cx(
            'aimapui-legend-ramp-bar',
            isContinuous && 'aimapui-legend-ramp-bar--continuous',
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
                className="aimapui-legend-ramp-segment"
                style={{ backgroundColor: color }}
              />
            ))}
        </div>

        {/* 刻度线 */}
        {showTicks && (
          <div className="aimapui-legend-ramp-ticks">
            {colors.map((_, i) =>
              i === 0 ? null : (
                <div
                  key={i}
                  className="aimapui-legend-ramp-tick"
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
        <div className="aimapui-legend-ramp-labels">
          <span>{labels[0]}</span>
          {labels.length > 2 && (
            <span>{labels[Math.floor(labels.length / 2)]}</span>
          )}
          <span>{labels[labels.length - 1]}</span>
        </div>

        {/* 范围刷选 */}
        {brushable && (
          <div className="aimapui-legend-ramp-brush">
            <div
              className="aimapui-legend-ramp-brush-range"
              style={{
                left: `${brushRange[0]}%`,
                width: `${brushRange[1] - brushRange[0]}%`,
              }}
            />
            <div
              className="aimapui-legend-ramp-brush-handle"
              style={{ left: `${brushRange[0]}%` }}
              onMouseDown={handleBrushMouseDown('left')}
            />
            <div
              className="aimapui-legend-ramp-brush-handle"
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
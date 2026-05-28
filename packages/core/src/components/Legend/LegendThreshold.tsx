import React, { useState } from 'react';
import type { LegendThresholdSchema, LegendInteractionCallbacks } from '../../schema/types';
import { cx } from '../../utils/style';

export interface LegendThresholdProps extends LegendThresholdSchema {
  className?: string;
  interaction?: LegendInteractionCallbacks;
}

/**
 * 阈值图例 — 自定义分段垂直列表
 *
 * 根据业务需求定义的非等间距区间，以垂直列表展示。
 * 每项显示色块 + [min, max) 区间文本，支持悬停高亮与点击显隐切换。
 *
 * 视觉规范:
 * - 色块 24×12px，圆角 2px
 * - 区间标签使用 JetBrains Mono 等宽字体
 * - 悬停其余项 dimmed，点击切换显隐
 *
 * @see legend.md §3.3 Threshold 自定义分段
 */
export function LegendThreshold({
  title,
  ranges,
  colors,
  className,
  interaction,
}: LegendThresholdProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const [hiddenIndices, setHiddenIndices] = useState<Set<number>>(new Set());

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    interaction?.onHover?.(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(-1);
    interaction?.onHover?.(-1);
  };

  const handleClick = (index: number) => {
    setHiddenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
    interaction?.onToggle?.(index);
  };

  return (
    <div className={cx(className)}>
      {title && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          {title}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {ranges.map(([min, max], i) => {
          const isDimmed =
            hoveredIndex >= 0
              ? hoveredIndex !== i
              : hiddenIndices.has(i);

          return (
            <div
              key={i}
              className={cx(
                'flex items-center gap-2 cursor-pointer select-none transition-opacity duration-150 hover:opacity-80',
                isDimmed && 'opacity-35',
              )}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(i)}
            >
              <span
                className="w-6 h-3 shrink-0 rounded-sm shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
                style={{ backgroundColor: colors[i] ?? '#ccc' }}
              />
              <span className="font-mono text-[11px] leading-3.5 text-on-surface-variant">
                [{min}, {max})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LegendThreshold;
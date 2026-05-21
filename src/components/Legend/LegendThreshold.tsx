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
    <div className={cx('aimapkit-legend-section', className)}>
      {title && <div className="aimapkit-legend-title">{title}</div>}

      <div className="aimapkit-legend-threshold">
        {ranges.map(([min, max], i) => {
          const isDimmed =
            hoveredIndex >= 0
              ? hoveredIndex !== i
              : hiddenIndices.has(i);

          return (
            <div
              key={i}
              className={cx(
                'aimapkit-legend-threshold-item',
                isDimmed && 'aimapkit-legend-threshold-item--dimmed',
              )}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(i)}
            >
              <span
                className="aimapkit-legend-threshold-swatch"
                style={{ backgroundColor: colors[i] ?? '#ccc' }}
              />
              <span className="aimapkit-legend-threshold-range">
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
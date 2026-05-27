import React, { useState } from 'react';
import type { LegendLineWidthSchema, LegendInteractionCallbacks } from '../../schema/types';
import { cx } from '../../utils/style';

export interface LegendLineWidthProps extends LegendLineWidthSchema {
  className?: string;
  interaction?: LegendInteractionCallbacks;
}

/**
 * 线宽图例 — 路径粗细映射
 *
 * 展示不同宽度的线条与对应数值的映射关系。
 * 适用于路径、轨迹、流向等线要素的图例说明。
 *
 * 视觉规范:
 * - 线宽为实际像素值，长度 28px，圆角 pill 形
 * - 标签在右侧
 * - 支持悬停高亮和点击显隐切换
 *
 * @see legend.md — LineWidth 类型图例
 */
export function LegendLineWidth({
  title,
  color = '#4A90D9',
  items,
  className,
  interaction,
}: LegendLineWidthProps) {
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
        {items.map((item, i) => {
          const isDimmed =
            hoveredIndex >= 0
              ? hoveredIndex !== i
              : hiddenIndices.has(i);

          return (
            <div
              key={i}
              className={cx(
                'flex items-center gap-2.5 py-0.5 cursor-pointer select-none transition-opacity duration-150 hover:opacity-80',
                isDimmed && 'opacity-35',
              )}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(i)}
            >
              <div
                className="w-7 shrink-0 rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
                style={{
                  height: item.width,
                  backgroundColor: color,
                  opacity: 0.85,
                }}
              />
              <span className="text-xs leading-4 text-on-surface whitespace-nowrap">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LegendLineWidth;
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
    <div className={cx('aimapkit-legend-section', className)}>
      {title && <div className="aimapkit-legend-title">{title}</div>}

      <div className="aimapkit-legend-linewidth">
        {items.map((item, i) => {
          const isDimmed =
            hoveredIndex >= 0
              ? hoveredIndex !== i
              : hiddenIndices.has(i);

          return (
            <div
              key={i}
              className={cx(
                'aimapkit-legend-linewidth-item',
                isDimmed && 'aimapkit-legend-linewidth-item--dimmed',
              )}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(i)}
            >
              <div
                className="aimapkit-legend-linewidth-line"
                style={{
                  height: item.width,
                  backgroundColor: color,
                  opacity: 0.85,
                }}
              />
              <span className="aimapkit-legend-linewidth-label">
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
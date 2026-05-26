import React, { useState } from 'react';
import type { LegendCategoriesSchema, LegendInteractionCallbacks } from '../../schema/types';
import { cx } from '../../utils/style';

export interface LegendCategoriesProps extends LegendCategoriesSchema {
  className?: string;
  /** 交互回调 */
  interaction?: LegendInteractionCallbacks;
}

/**
 * 分类图例 — 离散色块列表
 *
 * 视觉规范:
 * - 色块 12×12px，支持 square (rounded-sm) 和 circle 两种形状
 * - 垂直列表或两列网格布局（grid）
 * - 悬停高亮：其余项 dimmed (opacity 0.35)
 * - 点击切换：dimmed 态表示该项在地图上被隐藏
 *
 * @see legend.md §2 分类与枚举图例
 */
export function LegendCategories({
  title,
  labels,
  colors,
  swatchShape = 'square',
  grid = false,
  className,
  interaction,
}: LegendCategoriesProps) {
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
    <div className={cx('aimapui-legend-section', className)}>
      {title && <div className="aimapui-legend-title">{title}</div>}
      <div
        className={cx(
          'aimapui-legend-categories',
          grid && 'aimapui-legend-categories--grid',
        )}
      >
        {labels.map((label, i) => {
          const isDimmed =
            hoveredIndex >= 0
              ? hoveredIndex !== i
              : hiddenIndices.has(i);

          return (
            <div
              key={i}
              className={cx(
                'aimapui-legend-cat-item',
                isDimmed && 'aimapui-legend-cat-item--dimmed',
              )}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(i)}
            >
              <span
                className={cx(
                  'aimapui-legend-cat-swatch',
                  swatchShape === 'circle' && 'aimapui-legend-cat-swatch--circle',
                )}
                style={{ backgroundColor: colors[i] ?? '#ccc' }}
              />
              <span className="aimapui-legend-cat-label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LegendCategories;
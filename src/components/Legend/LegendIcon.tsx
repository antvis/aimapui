import React, { useState } from 'react';
import type { LegendIconSchema, LegendInteractionCallbacks } from '../../schema/types';
import { cx } from '../../utils/style';

export interface LegendIconProps extends LegendIconSchema {
  className?: string;
  interaction?: LegendInteractionCallbacks;
}

/**
 * 图标图例 — 图标 + 标签列表
 *
 * 使用自定义图标（URL 图片）和标签文本。
 * 图片加载失败时显示 fallback 文字。
 *
 * 视觉规范:
 * - 图标 20×20px
 * - 列表项 hover 高亮，点击切换显隐
 *
 * @see legend.md §2 分类与枚举图例 (图标变体)
 */
export function LegendIcon({ title, items, className, interaction }: LegendIconProps) {
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
      <div className="aimapkit-legend-icon">
        {items.map((item, i) => {
          const isDimmed =
            hoveredIndex >= 0
              ? hoveredIndex !== i
              : hiddenIndices.has(i);

          return (
            <div
              key={i}
              className={cx(
                'aimapkit-legend-icon-item',
                isDimmed && 'aimapkit-legend-icon-item--dimmed',
              )}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(i)}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="aimapkit-legend-icon-img"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <span className="aimapkit-legend-icon-fallback" style={{ display: 'none' }}>
                □
              </span>
              <span className="aimapkit-legend-icon-label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LegendIcon;
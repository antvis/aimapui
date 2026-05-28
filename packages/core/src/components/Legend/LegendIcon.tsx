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
    <div className={cx(className)}>
      {title && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          {title}
        </div>
      )}
      <div className="flex flex-col gap-1">
        {items.map((item, i) => {
          const isDimmed =
            hoveredIndex >= 0
              ? hoveredIndex !== i
              : hiddenIndices.has(i);

          return (
            <div
              key={i}
              className={cx(
                'flex items-center gap-2 px-1 py-0.5 rounded cursor-pointer select-none transition-[background,opacity] duration-150 hover:bg-primary/[0.06]',
                isDimmed && 'opacity-35',
              )}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(i)}
            >
              <img
                src={item.icon}
                alt={item.label}
                className="size-5 object-contain shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <span
                className="size-5 hidden items-center justify-center shrink-0 text-base leading-none text-on-surface-variant"
              >
                □
              </span>
              <span className="text-xs leading-4 text-on-surface">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LegendIcon;
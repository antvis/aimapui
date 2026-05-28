import React from 'react';
import type { LegendSizeSchema, LegendInteractionCallbacks } from '../../schema/types';
import { cx } from '../../utils/style';

export interface LegendSizeProps extends LegendSizeSchema {
  className?: string;
  interaction?: LegendInteractionCallbacks;
}

/**
 * 比例大小图例 — 圆形大小映射
 *
 * 使用一组递增大小的圆形来展示数值与视觉尺寸的映射关系。
 * 圆形底部对齐，圆直径与数据值成正比。
 *
 * 视觉规范:
 * - 最大圆直径 24px，最小 6px
 * - 圆形带 1px 内嵌阴影以区分重叠
 * - 标签在圆下方，等宽字体
 *
 * @see legend.md — Size / Proportion 类型图例
 */
export function LegendSize({
  title,
  fillColor = '#4A90D9',
  items,
  className,
}: LegendSizeProps) {
  const maxSize = Math.max(...items.map((it) => it.size), 1);

  return (
    <div className={cx(className)}>
      {title && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          {title}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-end gap-2 px-1">
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: maxSize,
              }}
            >
              <div
                className="rounded-full shrink-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
                style={{
                  width: item.size,
                  height: item.size,
                  backgroundColor: fillColor,
                  opacity: 0.85,
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-end gap-2 mt-1">
          {items.map((item, i) => (
            <span key={i} className="font-mono text-[11px] leading-3.5 text-on-surface-variant whitespace-nowrap">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LegendSize;
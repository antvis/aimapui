import React from 'react';
import type { LegendDivergingSchema, LegendInteractionCallbacks } from '../../schema/types';
import { cx } from '../../utils/style';

export interface LegendDivergingProps extends LegendDivergingSchema {
  className?: string;
  interaction?: LegendInteractionCallbacks;
}

/**
 * 发散图例 — 双极渐变色条
 *
 * 展示偏离中心点（如 0 或平均值）的对称变化。
 * 中间位置显示中性点标签，两端向不同色调延伸。
 *
 * 视觉规范:
 * - 色条高度 12px，圆角 4px
 * - 中间竖线标记中性点
 * - 三标签布局：左端标签、中间标签、右端标签
 *
 * @see legend.md §4 离散与发散图例
 */
export function LegendDiverging({
  title,
  colors,
  labels,
  middleLabel,
  className,
}: LegendDivergingProps) {
  const gradient = colors.join(', ');

  return (
    <div className={cx(className)}>
      {title && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          {title}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div style={{ position: 'relative' }}>
          <div
            className="flex h-3 rounded overflow-hidden shadow-inset-outline"
            style={{
              background: `linear-gradient(to right, ${gradient})`,
            }}
          />
          {/* 中间标记线 */}
          <div
            style={{
              position: 'absolute',
              top: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 1,
              height: 20,
              background: 'var(--color-outline-variant, #c3c6d7)',
            }}
          />
          {middleLabel && (
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-[18px] font-mono text-legend-value text-on-surface-variant whitespace-nowrap">
              {middleLabel}
            </div>
          )}
        </div>

        {/* 标签行：间距留出中间标签空间 */}
        <div
          className="flex justify-between font-mono text-legend-value text-on-surface-variant"
          style={middleLabel ? { marginBottom: 12 } : undefined}
        >
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      </div>
    </div>
  );
}

export default LegendDiverging;
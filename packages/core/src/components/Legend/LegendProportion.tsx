import React from 'react';
import type { LegendProportionSchema, LegendInteractionCallbacks } from '../../schema/types';
import { cx } from '../../utils/style';

export interface LegendProportionProps extends LegendProportionSchema {
  className?: string;
  interaction?: LegendInteractionCallbacks;
}

/**
 * 比例图例 — 数值区间与等比圆
 *
 * 使用 [min, max] 区间标签和等比递增的圆形展示数据分布。
 * 底部对齐，大小从最小到最大递增。
 *
 * 视觉规范（向后兼容）:
 * - 圆直径 6px ~ 24px
 * - 等宽字体标签
 *
 * @see LegendSize 为新版推荐的替代组件，提供更灵活的 items 配置
 */
export function LegendProportion({
  title,
  labels,
  fillColor = '#4A90D9',
  className,
}: LegendProportionProps) {
  const maxSize = 24;
  const minSize = 6;

  return (
    <div className={cx(className)}>
      {title && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          {title}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex items-end gap-2 px-1">
          {labels.map(([min, max], i) => {
            const ratio = i / Math.max(labels.length - 1, 1);
            const size = minSize + ratio * (maxSize - minSize);
            return (
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
                  className="rounded-full shrink-0 shadow-inset-outline"
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: fillColor,
                    opacity: 0.85,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex items-end gap-2 mt-1">
          {labels.map(([min, max], i) => (
            <span key={i} className="font-mono text-legend-value leading-3.5 text-on-surface-variant whitespace-nowrap">
              {min}–{max}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LegendProportion;
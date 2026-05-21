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
    <div className={cx('aimapkit-legend-section', className)}>
      {title && <div className="aimapkit-legend-title">{title}</div>}
      <div className="aimapkit-legend-size">
        <div className="aimapkit-legend-size-row">
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
                  className="aimapkit-legend-size-circle"
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
        <div className="aimapkit-legend-size-labels">
          {labels.map(([min, max], i) => (
            <span key={i} className="aimapkit-legend-size-label">
              {min}–{max}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LegendProportion;
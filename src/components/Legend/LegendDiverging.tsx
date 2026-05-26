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
    <div className={cx('aimapui-legend-section', className)}>
      {title && <div className="aimapui-legend-title">{title}</div>}

      <div className="aimapui-legend-diverging">
        <div style={{ position: 'relative' }}>
          <div
            className="aimapui-legend-diverging-bar"
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
            <div className="aimapui-legend-diverging-middle-label">
              {middleLabel}
            </div>
          )}
        </div>

        {/* 标签行：间距留出中间标签空间 */}
        <div
          className="aimapui-legend-diverging-labels"
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
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
    <div className={cx('aimapui-legend-section', className)}>
      {title && <div className="aimapui-legend-title">{title}</div>}

      <div className="aimapui-legend-size">
        <div className="aimapui-legend-size-row">
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
                className="aimapui-legend-size-circle"
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
        <div className="aimapui-legend-size-labels">
          {items.map((item, i) => (
            <span key={i} className="aimapui-legend-size-label">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LegendSize;
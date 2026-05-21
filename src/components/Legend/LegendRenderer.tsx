import React from 'react';
import type { LegendSchema, LegendInteractionCallbacks } from '../../schema/types';
import { LegendCategories } from './LegendCategories';
import { LegendRamp } from './LegendRamp';
import { LegendDiverging } from './LegendDiverging';
import { LegendThreshold } from './LegendThreshold';
import { LegendSize } from './LegendSize';
import { LegendLineWidth } from './LegendLineWidth';
import { LegendProportion } from './LegendProportion';
import { LegendIcon } from './LegendIcon';
import { cx } from '../../utils/style';

export interface LegendRendererProps {
  legends: LegendSchema[];
  /** 图例面板位置样式，默认左下角 */
  className?: string;
  style?: React.CSSProperties;
  /** 图例交互回调 */
  interaction?: LegendInteractionCallbacks;
}

/**
 * 图例面板渲染器 — 统一管理多个图例的容器
 *
 * 功能:
 * - 玻璃拟态面板 (bg-surface/80 backdrop-blur-md)
 * - 自动根据 schema.type 分派到对应子组件
 * - 多图例间自动分隔
 * - 支持交互回调 (hover 高亮 / toggle 显隐 / brush 范围)
 *
 * @see legend.md §1 基础视觉准则
 */
export function LegendRenderer({
  legends,
  className,
  style,
  interaction,
}: LegendRendererProps) {
  if (!legends.length) return null;

  return (
    <div
      className={cx('aimapkit-legend', className)}
      style={style}
    >
      <div className="aimapkit-legend-group">
        {legends.map((legend, index) => (
          <LegendItem
            key={`legend-${index}`}
            legend={legend}
            interaction={interaction}
          />
        ))}
      </div>
    </div>
  );
}

function LegendItem({
  legend,
  interaction,
}: {
  legend: LegendSchema;
  interaction?: LegendInteractionCallbacks;
}) {
  switch (legend.type) {
    case 'categories':
      return <LegendCategories {...legend} interaction={interaction} />;
    case 'ramp':
      return <LegendRamp {...legend} interaction={interaction} />;
    case 'diverging':
      return <LegendDiverging {...legend} interaction={interaction} />;
    case 'threshold':
      return <LegendThreshold {...legend} interaction={interaction} />;
    case 'size':
      return <LegendSize {...legend} interaction={interaction} />;
    case 'lineWidth':
      return <LegendLineWidth {...legend} interaction={interaction} />;
    case 'proportion':
      return <LegendProportion {...legend} interaction={interaction} />;
    case 'icon':
      return <LegendIcon {...legend} interaction={interaction} />;
    default:
      return null;
  }
}

export default LegendRenderer;
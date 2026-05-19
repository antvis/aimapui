import React from 'react';
import type { LegendSchema } from '../../schema/types';
import { LegendCategories } from './LegendCategories';
import { LegendRamp } from './LegendRamp';
import { LegendProportion } from './LegendProportion';
import { LegendIcon } from './LegendIcon';
import { cx } from '../../utils/style';

export interface LegendRendererProps {
  legends: LegendSchema[];
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 图例批量渲染组件
 */
export function LegendRenderer({ legends, className, style }: LegendRendererProps) {
  if (!legends.length) return null;

  return (
    <div
      className={cx(
        'absolute bottom-3 left-3 glass-panel rounded-xl p-4 z-20 max-h-[40%] overflow-y-auto custom-scrollbar',
        className,
      )}
      style={style}
    >
      <div className="space-y-4">
        {legends.map((legend, index) => (
          <LegendItem key={`legend-${index}`} legend={legend} />
        ))}
      </div>
    </div>
  );
}

function LegendItem({ legend }: { legend: LegendSchema }) {
  switch (legend.type) {
    case 'categories':
      return <LegendCategories {...legend} />;
    case 'ramp':
      return <LegendRamp {...legend} />;
    case 'proportion':
      return <LegendProportion {...legend} />;
    case 'icon':
      return <LegendIcon {...legend} />;
    default:
      return null;
  }
}

export default LegendRenderer;
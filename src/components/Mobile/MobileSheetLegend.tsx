import React, { useState } from 'react';
import type { LegendSchema, LegendInteractionCallbacks } from '../../schema/types';
import { LegendCategories } from '../Legend/LegendCategories';
import { LegendRamp } from '../Legend/LegendRamp';
import { LegendDiverging } from '../Legend/LegendDiverging';
import { LegendThreshold } from '../Legend/LegendThreshold';
import { LegendSize } from '../Legend/LegendSize';
import { LegendLineWidth } from '../Legend/LegendLineWidth';
import { LegendProportion } from '../Legend/LegendProportion';
import { LegendIcon } from '../Legend/LegendIcon';
import { cx } from '../../utils/style';

export interface MobileSheetLegendProps {
  legends: LegendSchema[];
  className?: string;
  interaction?: LegendInteractionCallbacks;
}

/**
 * 移动端底部弹出式图例
 *
 * 功能:
 * - 玻璃拟态面板
 * - 点击标题栏展开/收起
 * - 展开时 max-h-[65vh]，收起时 max-h-14
 * - 支持所有图例类型
 */
export function MobileSheetLegend({
  legends,
  className,
  interaction,
}: MobileSheetLegendProps) {
  const [expanded, setExpanded] = useState(false);

  if (!legends.length) return null;

  return (
    <div
      className={cx(
        'absolute bottom-3 left-3 right-3 z-30 transition-all duration-300',
        expanded ? 'max-h-[65vh]' : 'max-h-14',
        className,
      )}
    >
      <div className="aimapui-legend" style={{ maxHeight: 'none', position: 'static' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-0 py-3 text-label-caps font-label-caps uppercase"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-primary, #004ac6)',
          }}
        >
          <span>图例</span>
          <svg
            viewBox="0 0 24 24"
            className={cx(
              'w-5 h-5 transition-transform',
              expanded ? 'rotate-180' : '',
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {expanded && (
          <div className="aimapui-legend-group custom-scrollbar" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
            {legends.map((legend, index) => (
              <LegendItem
                key={`mobile-legend-${index}`}
                legend={legend}
                interaction={interaction}
              />
            ))}
          </div>
        )}
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

export default MobileSheetLegend;
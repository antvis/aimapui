import React, { useState } from 'react';
import type { LegendSchema } from '../../schema/types';
import { LegendCategories } from '../Legend/LegendCategories';
import { LegendRamp } from '../Legend/LegendRamp';
import { LegendProportion } from '../Legend/LegendProportion';
import { LegendIcon } from '../Legend/LegendIcon';
import { cx } from '../../utils/style';

export interface MobileSheetLegendProps {
  legends: LegendSchema[];
  className?: string;
}

/**
 * 移动端底部弹出式图例
 */
export function MobileSheetLegend({ legends, className }: MobileSheetLegendProps) {
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
      <div className="glass-panel rounded-xl overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-3 text-label-caps font-label-caps text-primary uppercase"
        >
          <span>图例</span>
          <svg
            viewBox="0 0 24 24"
            className={cx(
              'w-5 h-5 transition-transform text-primary',
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
          <div className="px-4 pb-4 space-y-4 overflow-y-auto custom-scrollbar">
            {legends.map((legend, index) => (
              <LegendItem key={`mobile-legend-${index}`} legend={legend} />
            ))}
          </div>
        )}
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

export default MobileSheetLegend;
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
        'aimapui-mobile-sheet-legend',
        className,
      )}
    >
      <div className="aimapui-mobile-sheet-legend__panel">
        <div className="aimapui-mobile-sheet-legend__handle" aria-hidden="true" />
        <button
          onClick={() => setExpanded(!expanded)}
          className="aimapui-mobile-sheet-legend__toggle"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span className="aimapui-mobile-sheet-legend__toggle-copy">
            <span className="aimapui-mobile-sheet-legend__eyebrow">Legend Panel</span>
            <span className="aimapui-mobile-sheet-legend__title-row">
              <span className="aimapui-mobile-sheet-legend__title">图例</span>
              <span className="aimapui-mobile-sheet-legend__badge">{legends.length} 项</span>
            </span>
          </span>
          <span className="aimapui-mobile-sheet-legend__chevron-shell" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              className={cx(
                'aimapui-mobile-sheet-legend__chevron',
                expanded && 'aimapui-mobile-sheet-legend__chevron--expanded',
              )}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>
        <div
          className={cx(
            'aimapui-mobile-sheet-legend__content custom-scrollbar',
            expanded
              ? 'aimapui-mobile-sheet-legend__content--expanded'
              : 'aimapui-mobile-sheet-legend__content--collapsed',
          )}
        >
          {legends.map((legend, index) => (
            <div key={`mobile-legend-${index}`} className="aimapui-mobile-sheet-legend__section">
              <LegendItem
                legend={legend}
                interaction={interaction}
              />
            </div>
          ))}
        </div>
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
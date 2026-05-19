import React from 'react';
import type { LegendProportionSchema } from '../../schema/types';
import { cx } from '../../utils/style';

export interface LegendProportionProps extends LegendProportionSchema {
  className?: string;
}

export function LegendProportion({ title, labels, fillColor = '#4A90D9', className }: LegendProportionProps) {
  const maxSize = 24;
  const minSize = 6;

  return (
    <div className={cx('space-y-2', className)}>
      {title && (
        <div className="text-label-caps font-label-caps text-on-surface-variant mb-3">{title}</div>
      )}
      <div className="flex items-end gap-3 py-1">
        {labels.map(([min, max], i) => {
          const ratio = i / Math.max(labels.length - 1, 1);
          const size = minSize + ratio * (maxSize - minSize);
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="rounded-full"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: fillColor,
                  opacity: 0.85,
                }}
              />
              <span className="text-mono-data text-on-surface whitespace-nowrap">
                {min}–{max}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LegendProportion;
import React from 'react';
import type { LegendCategoriesSchema } from '../../schema/types';
import { cx } from '../../utils/style';

export interface LegendCategoriesProps extends LegendCategoriesSchema {
  className?: string;
}

export function LegendCategories({ title, labels, colors, className }: LegendCategoriesProps) {
  return (
    <div className={cx('space-y-2', className)}>
      {title && (
        <div className="text-label-caps font-label-caps text-on-surface-variant mb-3">{title}</div>
      )}
      {labels.map((label, i) => (
        <div key={i} className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded shrink-0"
            style={{ backgroundColor: colors[i] ?? '#ccc' }}
          />
          <span className="text-body-md">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default LegendCategories;
import React from 'react';
import type { LegendIconSchema } from '../../schema/types';
import { cx } from '../../utils/style';

export interface LegendIconProps extends LegendIconSchema {
  className?: string;
}

export function LegendIcon({ title, items, className }: LegendIconProps) {
  return (
    <div className={cx('space-y-2', className)}>
      {title && (
        <div className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">{title}</div>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-5 h-5 flex items-center justify-center shrink-0">
            <img
              src={item.icon}
              alt={item.label}
              className="w-5 h-5"
              onError={(e) => {
                // 加载失败时显示替代文本
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </span>
          <span className="text-sm text-gray-700 font-medium truncate">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default LegendIcon;
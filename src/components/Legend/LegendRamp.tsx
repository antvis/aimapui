import React from 'react';
import type { LegendRampSchema } from '../../schema/types';
import { cx } from '../../utils/style';

export interface LegendRampProps extends LegendRampSchema {
  className?: string;
}

export function LegendRamp({ title, labels, colors, isContinuous, className }: LegendRampProps) {
  const gradient = colors.join(', ');

  return (
    <div className={cx('space-y-2', className)}>
      {title && (
        <div className="text-label-caps font-label-caps text-on-surface-variant mb-3">{title}</div>
      )}
      <div
        className="h-4 w-full rounded"
        style={{
          background: isContinuous
            ? `linear-gradient(to right, ${gradient})`
            : undefined,
          backgroundColor: isContinuous ? undefined : 'transparent',
        }}
      >
        {!isContinuous &&
          colors.map((color, i) => (
            <div
              key={i}
              className="inline-block h-full"
              style={{
                backgroundColor: color,
                width: `${100 / colors.length}%`,
              }}
            />
          ))}
      </div>
      <div className="flex justify-between text-mono-data opacity-70">
        <span>{labels[0]}</span>
        {labels.length > 2 && (
          <span>{labels[Math.floor(labels.length / 2)]}</span>
        )}
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
}

export default LegendRamp;
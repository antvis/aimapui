import React from 'react';
import { useMapControl, type ControlPosition } from '../../hooks/useMapControl';
import { useControlContainer, ControlRegistry } from './ControlContainer';

export interface LegendControlProps {
  position?: ControlPosition;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function LegendControl({
  position = 'bottomleft',
  className,
  style,
  children,
}: LegendControlProps) {
  const { positionClassName } = useMapControl(position);
  const isInContainer = useControlContainer();

  if (!children) return null;

  const controlContent = (
    <div
      className={`l7-control l7-control-legend l7-control--glass${className ? ` ${className}` : ''}`}
      style={{
        padding: '12px 14px',
        borderRadius: 8,
        maxHeight: '40%',
        overflowY: 'auto',
        ...style,
      }}
    >
      {children}
    </div>
  );

  if (isInContainer) return controlContent;

  return (
    <div className={`l7-control-anchor ${positionClassName}`}>
      {controlContent}
    </div>
  );
}

ControlRegistry.mark(LegendControl);

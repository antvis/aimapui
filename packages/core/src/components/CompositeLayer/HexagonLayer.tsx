import React from 'react';
import type { LayerSchema, LayerEventPayload } from '../../schema/types';
import { HeatmapLayer } from '../Layer/HeatmapLayer';

export interface HexagonLayerProps
  extends Omit<LayerSchema, 'type' | 'shape' | 'source' | 'sourceType' | 'sourceConfig'> {
  source: LayerSchema['source'];
  sourceType?: LayerSchema['sourceType'];
  sourceConfig?: LayerSchema['sourceConfig'];
  hexSize?: number;
  weightField?: string;
  weightMethod?: 'sum' | 'mean' | 'min' | 'max' | 'count';
  onClick?: (payload: LayerEventPayload) => void;
  onMouseMove?: (payload: LayerEventPayload) => void;
}

/**
 * 蜂窝热力图（六边形聚合）
 */
export function HexagonLayer({
  source,
  sourceType = 'json',
  sourceConfig,
  hexSize = 100,
  weightField = 'h12',
  weightMethod = 'sum',
  onClick,
  onMouseMove,
  style,
  ...rest
}: HexagonLayerProps) {
  const transforms = [
    {
      type: 'hexagon',
      size: hexSize,
      field: weightField,
      method: weightMethod,
    },
  ];

  return (
    <HeatmapLayer
      {...rest}
      source={source}
      sourceType={sourceType}
      sourceConfig={{ ...sourceConfig, transforms }}
      shape="hexagonColumn"
      style={{ coverage: 0.8, angle: 0, ...(style ?? {}) }}
      onClick={onClick}
      onMouseMove={onMouseMove}
    />
  );
}

export default HexagonLayer;

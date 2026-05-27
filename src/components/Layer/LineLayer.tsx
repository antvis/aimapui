import React from 'react';
import type { LayerSchema, LayerEventPayload } from '../../schema/types';
import { useScene } from '../../context/SceneContext';
import { SchemaLayer, type LayerEventHandlers } from './SchemaLayer';

export interface LineLayerProps
  extends Omit<LayerSchema, 'type' | 'source' | 'sourceType' | 'sourceConfig'> {
  source: LayerSchema['source'];
  sourceType?: LayerSchema['sourceType'];
  sourceConfig?: LayerSchema['sourceConfig'];

  onClick?: (payload: LayerEventPayload) => void;
  onMouseMove?: (payload: LayerEventPayload) => void;
  onMouseEnter?: (payload: LayerEventPayload) => void;
  onMouseLeave?: (payload: LayerEventPayload) => void;
}

/**
 * 线图层组件
 *
 * ```tsx
 * <AiMap map={{ basemap: 'gaode' }}>
 *   <LineLayer source={flowData} sourceConfig={{ x: 'lng', y: 'lat', x1: 'lng1', y1: 'lat1' }} color="#5B8FF9" />
 * </AiMap>
 * ```
 */
export function LineLayer({
  source,
  sourceType,
  sourceConfig,
  onClick,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: LineLayerProps) {
  const scene = useScene();
  if (!scene) return null;

  const schema: LayerSchema = {
    ...rest,
    type: 'line',
    source,
    sourceType: sourceType ?? 'json',
    sourceConfig,
  };

  const eventHandlers: LayerEventHandlers | undefined =
    onClick || onMouseMove || onMouseEnter || onMouseLeave
      ? { onClick, onMouseMove, onMouseEnter, onMouseLeave }
      : undefined;

  return <SchemaLayer schema={schema} scene={scene} eventHandlers={eventHandlers} />;
}
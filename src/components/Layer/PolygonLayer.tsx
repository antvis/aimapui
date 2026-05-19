import React from 'react';
import type { LayerSchema, LayerEventPayload } from '../../schema/types';
import { useScene } from '../../context/SceneContext';
import { SchemaLayer, type LayerEventHandlers } from './SchemaLayer';

export interface PolygonLayerProps
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
 * 面图层组件
 */
export function PolygonLayer({
  source,
  sourceType,
  sourceConfig,
  onClick,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: PolygonLayerProps) {
  const scene = useScene();
  if (!scene) return null;

  const schema: LayerSchema = {
    ...rest,
    type: 'polygon',
    source,
    sourceType: sourceType ?? 'geojson',
    sourceConfig,
  };

  const eventHandlers: LayerEventHandlers | undefined =
    onClick || onMouseMove || onMouseEnter || onMouseLeave
      ? { onClick, onMouseMove, onMouseEnter, onMouseLeave }
      : undefined;

  return <SchemaLayer schema={schema} scene={scene} eventHandlers={eventHandlers} />;
}
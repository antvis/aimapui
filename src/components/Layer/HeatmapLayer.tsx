import React from 'react';
import type { LayerSchema, LayerEventPayload } from '../../schema/types';
import { useScene } from '../../context/SceneContext';
import { SchemaLayer, type LayerEventHandlers } from './SchemaLayer';

export interface HeatmapLayerProps
  extends Omit<LayerSchema, 'type' | 'source' | 'sourceType' | 'sourceConfig'> {
  source: LayerSchema['source'];
  sourceType?: LayerSchema['sourceType'];
  sourceConfig?: LayerSchema['sourceConfig'];

  onClick?: (payload: LayerEventPayload) => void;
  onMouseMove?: (payload: LayerEventPayload) => void;
}

/**
 * 热力图图层组件
 */
export function HeatmapLayer({
  source,
  sourceType,
  sourceConfig,
  onClick,
  onMouseMove,
  ...rest
}: HeatmapLayerProps) {
  const scene = useScene();
  if (!scene) return null;

  const schema: LayerSchema = {
    ...rest,
    type: 'heatmap',
    source,
    sourceType: sourceType ?? 'json',
    sourceConfig,
  };

  const eventHandlers: LayerEventHandlers | undefined =
    onClick || onMouseMove
      ? { onClick, onMouseMove }
      : undefined;

  return <SchemaLayer schema={schema} scene={scene} eventHandlers={eventHandlers} />;
}
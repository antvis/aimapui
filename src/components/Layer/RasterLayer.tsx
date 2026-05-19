import React from 'react';
import type { LayerSchema, LayerEventPayload } from '../../schema/types';
import { useScene } from '../../context/SceneContext';
import { SchemaLayer, type LayerEventHandlers } from './SchemaLayer';

export interface RasterLayerProps
  extends Omit<LayerSchema, 'type' | 'source' | 'sourceType' | 'sourceConfig'> {
  source: LayerSchema['source'];
  sourceType?: LayerSchema['sourceType'];
  sourceConfig?: LayerSchema['sourceConfig'];

  onClick?: (payload: LayerEventPayload) => void;
}

/**
 * 栅格图层组件
 */
export function RasterLayer({
  source,
  sourceType,
  sourceConfig,
  onClick,
  ...rest
}: RasterLayerProps) {
  const scene = useScene();
  if (!scene) return null;

  const schema: LayerSchema = {
    ...rest,
    type: 'raster',
    source,
    sourceType: sourceType ?? 'raster',
    sourceConfig,
  };

  const eventHandlers: LayerEventHandlers | undefined =
    onClick ? { onClick } : undefined;

  return <SchemaLayer schema={schema} scene={scene} eventHandlers={eventHandlers} />;
}
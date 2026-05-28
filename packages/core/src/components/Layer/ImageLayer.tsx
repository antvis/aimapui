import React from 'react';
import type { LayerSchema, LayerEventPayload } from '../../schema/types';
import { useScene } from '../../context/SceneContext';
import { SchemaLayer, type LayerEventHandlers } from './SchemaLayer';

export interface ImageLayerProps
  extends Omit<LayerSchema, 'type' | 'source' | 'sourceType' | 'sourceConfig'> {
  source: LayerSchema['source'];
  sourceType?: LayerSchema['sourceType'];
  sourceConfig?: LayerSchema['sourceConfig'];

  onClick?: (payload: LayerEventPayload) => void;
}

/**
 * 图片图层组件
 */
export function ImageLayer({
  source,
  sourceType,
  sourceConfig,
  onClick,
  ...rest
}: ImageLayerProps) {
  const scene = useScene();
  if (!scene) return null;

  const schema: LayerSchema = {
    ...rest,
    type: 'image',
    source,
    sourceType: sourceType ?? 'image',
    sourceConfig,
  };

  const eventHandlers: LayerEventHandlers | undefined =
    onClick ? { onClick } : undefined;

  return <SchemaLayer schema={schema} scene={scene} eventHandlers={eventHandlers} />;
}
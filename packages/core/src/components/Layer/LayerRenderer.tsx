import React from 'react';
import type { LayerSchema } from '../../schema/types';
import { useScene } from '../../context/SceneContext';
import { SchemaLayer, type LayerEventHandlers } from './SchemaLayer';

export interface LayerRendererProps {
  layers: LayerSchema[];
  /** 图层事件回调集合 */
  eventHandlers?: LayerEventHandlers;
}

/**
 * 批量渲染图层
 */
export function LayerRenderer({ layers, eventHandlers }: LayerRendererProps) {
  const scene = useScene();

  if (!scene) return null;

  return (
    <>
      {layers.map((layer, index) => (
        <SchemaLayer
          key={layer.id ?? `layer-${index}`}
          schema={layer}
          scene={scene}
          eventHandlers={eventHandlers}
        />
      ))}
    </>
  );
}

export default LayerRenderer;
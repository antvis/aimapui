import React from 'react';
import type { LayerSchema, LayerEventPayload } from '../../schema/types';
import { useScene } from '../../context/SceneContext';
import { SchemaLayer, type LayerEventHandlers } from './SchemaLayer';

export interface HeatmapLayerProps
  extends Omit<LayerSchema, 'type' | 'source' | 'sourceType' | 'sourceConfig'> {
  source: LayerSchema['source'];
  sourceType?: LayerSchema['sourceType'];
  sourceConfig?: LayerSchema['sourceConfig'];

  /** 点击事件 */
  onClick?: (payload: LayerEventPayload) => void;
  /** 鼠标移动事件 */
  onMouseMove?: (payload: LayerEventPayload) => void;
  /** 鼠标进入事件 */
  onMouseEnter?: (payload: LayerEventPayload) => void;
  /** 鼠标离开事件 */
  onMouseLeave?: (payload: LayerEventPayload) => void;
}

/**
 * 热力图图层组件
 *
 * 支持悬停高亮交互（对齐蜂窝热力图设计规范）
 */
export function HeatmapLayer({
  source,
  sourceType,
  sourceConfig,
  onClick,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
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
    onClick || onMouseMove || onMouseEnter || onMouseLeave
      ? { onClick, onMouseMove, onMouseEnter, onMouseLeave }
      : undefined;

  return <SchemaLayer schema={schema} scene={scene} eventHandlers={eventHandlers} />;
}
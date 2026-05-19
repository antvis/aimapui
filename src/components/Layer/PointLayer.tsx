import React from 'react';
import type { LayerSchema, LayerEventPayload } from '../../schema/types';
import { useScene } from '../../context/SceneContext';
import { SchemaLayer, type LayerEventHandlers } from './SchemaLayer';

export interface PointLayerProps
  extends Omit<LayerSchema, 'type' | 'source' | 'sourceType' | 'sourceConfig'> {
  /** 数据源 — JSON 数组、GeoJSON 或 URL */
  source: LayerSchema['source'];
  /** 数据源类型，默认 'json' */
  sourceType?: LayerSchema['sourceType'];
  /** 经纬度字段配置 */
  sourceConfig?: LayerSchema['sourceConfig'];

  // ===== 事件回调 =====
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
 * 点图层组件
 *
 * ```tsx
 * <Aimap map={{ basemap: 'gaode' }}>
 *   <PointLayer source={data} color="#5B8FF9" size={12} />
 * </Aimap>
 * ```
 */
export function PointLayer({
  source,
  sourceType,
  sourceConfig,
  onClick,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: PointLayerProps) {
  const scene = useScene();
  if (!scene) return null;

  const schema: LayerSchema = {
    ...rest,
    type: 'point',
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
import type { LayerSchema } from '../../../schema/types';
import { buildCommonSourceConfig, buildVisualConfig } from './common';

/**
 * Point 图层适配器
 * 将 LayerSchema 转换为 L7 PointLayer 配置
 */
export function adaptPointLayer(schema: LayerSchema) {
  return {
    type: 'PointLayer' as const,
    sourceConfig: buildCommonSourceConfig(schema),
    visual: buildVisualConfig(schema),
    schema,
  };
}

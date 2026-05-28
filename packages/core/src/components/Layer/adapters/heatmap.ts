import type { LayerSchema } from '../../../schema/types';
import { buildColorConfig, buildShapeConfig } from './common';

/**
 * Heatmap 图层适配器
 */
export function adaptHeatmapLayer(schema: LayerSchema) {
  return {
    type: 'HeatmapLayer' as const,
    sourceConfig: buildHeatmapSourceConfig(schema),
    visual: buildHeatmapVisual(schema),
    schema,
  };
}

function buildHeatmapSourceConfig(schema: LayerSchema) {
  if (schema.sourceConfig?.parser) {
    return {
      data: schema.source,
      options: {
        parser: schema.sourceConfig.parser,
        ...(schema.sourceConfig.transforms ? { transforms: schema.sourceConfig.transforms } : {}),
      },
    };
  }

  if (schema.sourceType === 'geojson') {
    return {
      data: schema.source,
      options: schema.sourceConfig?.transforms
        ? { transforms: schema.sourceConfig.transforms }
        : undefined,
    };
  }
  if (schema.sourceType === 'csv') {
    return {
      data: schema.source,
      options: {
        parser: { type: 'csv', x: schema.sourceConfig?.x, y: schema.sourceConfig?.y },
        ...(schema.sourceConfig?.transforms ? { transforms: schema.sourceConfig.transforms } : {}),
      },
    };
  }
  return {
    data: schema.source,
    options: {
      parser: {
        type: 'json',
        x: schema.sourceConfig?.x ?? 'lng',
        y: schema.sourceConfig?.y ?? 'lat',
      },
      ...(schema.sourceConfig?.transforms ? { transforms: schema.sourceConfig.transforms } : {}),
    },
  };
}

function buildHeatmapVisual(schema: LayerSchema) {
  // 热力图 size 通常用于权重字段，仅支持 field 模式
  const size = schema.sizeField
    ? { field: schema.sizeField, values: schema.sizeValues }
    : undefined;

  const color = buildColorConfig(schema);
  const shape = buildShapeConfig(schema);
  const style = schema.style ? { ...schema.style } : undefined;

  return { color, size, shape, style };
}

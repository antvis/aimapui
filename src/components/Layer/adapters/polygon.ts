import type { LayerSchema } from '../../../schema/types';

/**
 * Polygon 图层适配器
 */
export function adaptPolygonLayer(schema: LayerSchema) {
  return {
    type: 'PolygonLayer' as const,
    sourceConfig: buildSourceConfig(schema),
    visual: buildVisual(schema),
    schema,
  };
}

function buildSourceConfig(schema: LayerSchema) {
  if (schema.sourceType === 'geojson') {
    return { data: schema.source, options: undefined };
  }
  // json 使用 coordinates 字段
  return {
    data: schema.source,
    options: {
      parser: {
        type: 'json',
        coordinates: schema.sourceConfig?.coordinates ?? 'coordinates',
      },
    },
  };
}

function buildVisual(schema: LayerSchema) {
  const color = schema.colorField
    ? { field: schema.colorField, values: schema.colorValues }
    : schema.color
      ? { values: schema.color }
      : undefined;

  const size = schema.size !== undefined
    ? { values: schema.size }
    : undefined;

  const shape = schema.shapeField
    ? { field: schema.shapeField, values: schema.shapeValues }
    : schema.shape
      ? { values: schema.shape }
      : undefined;

  const style = schema.style ? { ...schema.style } : undefined;

  return { color, size, shape, style };
}

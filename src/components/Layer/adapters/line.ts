import type { LayerSchema } from '../../../schema/types';

/**
 * Line 图层适配器
 */
export function adaptLineLayer(schema: LayerSchema) {
  return {
    type: 'LineLayer' as const,
    sourceConfig: buildSourceConfig(schema),
    visual: buildVisual(schema),
    schema,
  };
}

function buildSourceConfig(schema: LayerSchema) {
  if (schema.sourceConfig?.parser) {
    return { data: schema.source, options: { parser: schema.sourceConfig.parser } };
  }

  if (schema.sourceType === 'geojson') {
    return { data: schema.source, options: undefined };
  }
  if (schema.sourceType === 'csv') {
    return {
      data: schema.source,
      options: {
        parser: {
          type: 'csv',
          x: schema.sourceConfig?.x,
          y: schema.sourceConfig?.y,
          x1: schema.sourceConfig?.x1,
          y1: schema.sourceConfig?.y1,
        },
      },
    };
  }
  // json — 支持弧线 x1/y1
  return {
    data: schema.source,
    options: {
      parser: {
        type: 'json',
        x: schema.sourceConfig?.x ?? 'lng',
        y: schema.sourceConfig?.y ?? 'lat',
        x1: schema.sourceConfig?.x1,
        y1: schema.sourceConfig?.y1,
        coordinates: schema.sourceConfig?.coordinates,
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

  const size = schema.sizeField
    ? { field: schema.sizeField, values: schema.sizeValues }
    : schema.size !== undefined
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

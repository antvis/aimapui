import type { LayerSchema } from '../../../schema/types';

/**
 * Point 图层适配器
 * 将 LayerSchema 转换为 L7 PointLayer 配置
 */
export function adaptPointLayer(schema: LayerSchema) {
  return {
    type: 'PointLayer' as const,
    sourceConfig: buildSourceConfig(schema),
    visual: buildVisual(schema),
    schema,
  };
}

function buildSourceConfig(schema: LayerSchema) {
  if (schema.sourceType === 'geojson') {
    return { data: schema.source, options: undefined };
  }
  if (schema.sourceType === 'csv') {
    return {
      data: schema.source,
      options: { parser: { type: 'csv', x: schema.sourceConfig?.x, y: schema.sourceConfig?.y } },
    };
  }
  // 默认 json
  return {
    data: schema.source,
    options: {
      parser: {
        type: 'json',
        x: schema.sourceConfig?.x ?? 'lng',
        y: schema.sourceConfig?.y ?? 'lat',
      },
    },
  };
}

function buildVisual(schema: LayerSchema) {
  const color = buildColorConfig(schema);
  const size = buildSizeConfig(schema);
  const shape = buildShapeConfig(schema);
  const style = schema.style ? { ...schema.style } : undefined;

  return { color, size, shape, style };
}

function buildColorConfig(schema: LayerSchema) {
  if (schema.colorField) {
    return { field: schema.colorField, values: schema.colorValues };
  }
  if (schema.color) {
    return { values: schema.color };
  }
  return undefined;
}

function buildSizeConfig(schema: LayerSchema) {
  if (schema.sizeField) {
    return { field: schema.sizeField, values: schema.sizeValues };
  }
  if (schema.size !== undefined) {
    return { values: schema.size };
  }
  return undefined;
}

function buildShapeConfig(schema: LayerSchema) {
  if (schema.shapeField) {
    return { field: schema.shapeField, values: schema.shapeValues };
  }
  if (schema.shape) {
    return { values: schema.shape };
  }
  return undefined;
}

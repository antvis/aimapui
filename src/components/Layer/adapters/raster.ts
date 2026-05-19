import type { LayerSchema } from '../../../schema/types';

/**
 * Raster 图层适配器
 */
export function adaptRasterLayer(schema: LayerSchema) {
  return {
    type: 'RasterLayer' as const,
    sourceConfig: buildSourceConfig(schema),
    visual: buildVisual(schema),
    schema,
  };
}

function buildSourceConfig(schema: LayerSchema) {
  if (schema.sourceConfig?.parser) {
    return {
      data: schema.source,
      options: { parser: schema.sourceConfig.parser },
    };
  }

  return {
    data: schema.source,
    options:
      schema.sourceType === 'raster'
        ? { parser: { type: 'raster', extent: [73.482190241, 3.82501784112, 135.106618732, 53.557926206] } }
        : schema.sourceType === 'rasterTile'
          ? { parser: { type: 'rasterTile', tileSize: 256, zoomOffset: 0 } }
          : undefined,
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

  const style = schema.style ? { ...schema.style } : undefined;

  return { color, size, shape: undefined, style };
}

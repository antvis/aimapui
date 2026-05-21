import type { LayerSchema } from '../../../schema/types';
import { buildColorConfig, buildSizeConfig } from './common';

/**
 * Raster 图层适配器
 */
export function adaptRasterLayer(schema: LayerSchema) {
  return {
    type: 'RasterLayer' as const,
    sourceConfig: buildRasterSourceConfig(schema),
    visual: buildRasterVisual(schema),
    schema,
  };
}

function buildRasterSourceConfig(schema: LayerSchema) {
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
          ? { parser: { type: 'rasterTile', tileSize: 256, zoomOffset: 1 } }
          : undefined,
  };
}

function buildRasterVisual(schema: LayerSchema) {
  const color = buildColorConfig(schema);
  const size = buildSizeConfig(schema);
  const style = schema.style ? { ...schema.style } : undefined;

  return { color, size, shape: undefined, style };
}

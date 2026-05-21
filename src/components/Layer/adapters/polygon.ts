import type { LayerSchema } from '../../../schema/types';
import { buildVisualConfig, buildGeojsonSourceConfig } from './common';

/**
 * Polygon 图层适配器
 */
export function adaptPolygonLayer(schema: LayerSchema) {
  return {
    type: 'PolygonLayer' as const,
    sourceConfig: buildPolygonSourceConfig(schema),
    visual: buildVisualConfig(schema),
    schema,
  };
}

function buildPolygonSourceConfig(schema: LayerSchema) {
  if (schema.sourceType === 'geojson') {
    return buildGeojsonSourceConfig(schema);
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

import type { LayerSchema } from '../../../schema/types';
import { buildVisualConfig, buildGeojsonSourceConfig } from './common';

/**
 * Line 图层适配器
 */
export function adaptLineLayer(schema: LayerSchema) {
  return {
    type: 'LineLayer' as const,
    sourceConfig: buildLineSourceConfig(schema),
    visual: buildVisualConfig(schema),
    schema,
  };
}

function buildLineSourceConfig(schema: LayerSchema) {
  if (schema.sourceConfig?.parser) {
    return { data: schema.source, options: { parser: schema.sourceConfig.parser } };
  }

  if (schema.sourceType === 'geojson') {
    return buildGeojsonSourceConfig(schema);
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

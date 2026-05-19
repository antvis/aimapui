import type { AimapSchema, LayerSchema, MapSchema } from '../schema/types';
import { applySchemaDefaults } from '../schema/defaults';

/**
 * 解析并规范化 Schema，填充默认值
 */
export function parseSchema(schema: AimapSchema): AimapSchema {
  return applySchemaDefaults(schema);
}

/**
 * 从 source 数据推断 sourceType
 */
export function inferSourceType(source: unknown, explicitType?: string): string {
  if (explicitType) return explicitType;

  if (typeof source === 'string') {
    const lower = source.toLowerCase();
    if (lower.endsWith('.csv') || lower.includes('format=csv')) return 'csv';
    if (lower.endsWith('.geojson') || lower.endsWith('.json')) return 'geojson';
    return 'geojson';
  }

  if (typeof source === 'object' && source !== null) {
    const obj = source as Record<string, unknown>;
    // GeoJSON feature collection
    if (obj.type === 'FeatureCollection' || obj.type === 'Feature') return 'geojson';
    // Array of objects => json
    if (Array.isArray(obj)) return 'json';
  }

  return 'json';
}

/**
 * 从 LayerSchema 提取颜色配置
 */
export function extractColorConfig(layer: LayerSchema): {
  field?: string;
  values?: string[] | string;
  fixed?: string;
} {
  if (layer.colorField) {
    return { field: layer.colorField, values: layer.colorValues };
  }
  if (layer.color) {
    return { fixed: layer.color };
  }
  return {};
}

/**
 * 从 LayerSchema 提取尺寸配置
 */
export function extractSizeConfig(layer: LayerSchema): {
  field?: string;
  values?: number[];
  fixed?: number;
} {
  if (layer.sizeField) {
    return { field: layer.sizeField, values: layer.sizeValues };
  }
  if (layer.size !== undefined) {
    return { fixed: layer.size };
  }
  return {};
}

/**
 * 从 LayerSchema 提取形状配置
 */
export function extractShapeConfig(layer: LayerSchema): {
  field?: string;
  values?: string[] | string;
  fixed?: string;
} {
  if (layer.shapeField) {
    return { field: layer.shapeField, values: layer.shapeValues };
  }
  if (layer.shape) {
    return { fixed: layer.shape };
  }
  return {};
}

/**
 * 验证 MapSchema 必要字段
 */
export function validateMapSchema(map: MapSchema): string[] {
  const errors: string[] = [];
  if (!map.basemap) {
    errors.push('map.basemap is required');
  }
  if (map.center) {
    const [lng, lat] = map.center;
    if (lng < -180 || lng > 180) errors.push('map.center[0] (longitude) must be between -180 and 180');
    if (lat < -90 || lat > 90) errors.push('map.center[1] (latitude) must be between -90 and 90');
  }
  return errors;
}

/**
 * 验证 LayerSchema 必要字段
 */
export function validateLayerSchema(layer: LayerSchema, index: number): string[] {
  const errors: string[] = [];
  if (!layer.type) {
    errors.push(`layers[${index}].type is required`);
  }
  if (layer.source === undefined && layer.source !== null) {
    // allow null for raster/url sources
  }
  if (layer.colorField && !layer.colorValues && !layer.color) {
    // colorField without colorValues — ok, L7 will use default scale
  }
  return errors;
}

/**
 * 验证整个 Schema
 */
export function validateSchema(schema: AimapSchema): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  errors.push(...validateMapSchema(schema.map));
  (schema.layers ?? []).forEach((layer, i) => {
    errors.push(...validateLayerSchema(layer, i));
  });

  return { valid: errors.length === 0, errors };
}

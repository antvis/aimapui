import type { AimapSchema, MapSchema, LayerSchema } from './types';

/**
 * Schema 校验器
 * 提供友好的错误消息，帮助 AI 修正 Schema
 */
export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export function validateAimapSchema(schema: AimapSchema): ValidationError[] {
  const errors: ValidationError[] = [];

  // 校验 map
  if (!schema.map) {
    errors.push({ path: 'map', message: 'map is required', severity: 'error' });
  } else {
    errors.push(...validateMapSchema(schema.map));
  }

  // 校验 layers
  if (!schema.layers || !Array.isArray(schema.layers)) {
    errors.push({ path: 'layers', message: 'layers must be an array', severity: 'error' });
  } else {
    schema.layers.forEach((layer, i) => {
      errors.push(...validateLayerSchema(layer, i));
    });
  }

  // 校验 controls
  if (schema.controls) {
    if (!Array.isArray(schema.controls)) {
      errors.push({ path: 'controls', message: 'controls must be an array', severity: 'error' });
    } else {
      schema.controls.forEach((control, i) => {
        if (!control.type) {
          errors.push({ path: `controls[${i}].type`, message: 'control type is required', severity: 'error' });
        }
      });
    }
  }

  // 校验 interactions
  if (schema.interactions) {
    if (!Array.isArray(schema.interactions)) {
      errors.push({ path: 'interactions', message: 'interactions must be an array', severity: 'error' });
    } else {
      schema.interactions.forEach((interaction, i) => {
        if (interaction.type === 'marker' || interaction.type === 'popup') {
          if (typeof interaction.longitude !== 'number' || typeof interaction.latitude !== 'number') {
            errors.push({
              path: `interactions[${i}]`,
              message: 'marker/popup requires longitude and latitude as numbers',
              severity: 'error',
            });
          }
        }
      });
    }
  }

  // 校验 legends
  if (schema.legends) {
    if (!Array.isArray(schema.legends)) {
      errors.push({ path: 'legends', message: 'legends must be an array', severity: 'error' });
    } else {
      schema.legends.forEach((legend, i) => {
        if (!legend.type) {
          errors.push({ path: `legends[${i}].type`, message: 'legend type is required', severity: 'error' });
        }
      });
    }
  }

  return errors;
}

function validateMapSchema(map: MapSchema): ValidationError[] {
  const errors: ValidationError[] = [];

  const validBasemaps = ['gaode', 'mapbox', 'tianditu', 'tencent', 'baidu', 'map'];
  if (!validBasemaps.includes(map.basemap)) {
    errors.push({
      path: 'map.basemap',
      message: `Invalid basemap "${map.basemap}". Valid values: ${validBasemaps.join(', ')}`,
      severity: 'error',
    });
  }

  if (map.center) {
    const [lng, lat] = map.center;
    if (lng < -180 || lng > 180) {
      errors.push({
        path: 'map.center[0]',
        message: 'Longitude must be between -180 and 180',
        severity: 'error',
      });
    }
    if (lat < -90 || lat > 90) {
      errors.push({
        path: 'map.center[1]',
        message: 'Latitude must be between -90 and 90',
        severity: 'error',
      });
    }
  }

  if (map.zoom !== undefined && (map.zoom < 0 || map.zoom > 22)) {
    errors.push({
      path: 'map.zoom',
      message: 'Zoom must be between 0 and 22',
      severity: 'warning',
    });
  }

  // 需要 Token 的底图
  if (['gaode', 'mapbox', 'tianditu', 'tencent', 'baidu'].includes(map.basemap) && !map.token) {
    errors.push({
      path: 'map.token',
      message: `basemap "${map.basemap}" requires a token`,
      severity: 'warning',
    });
  }

  return errors;
}

function validateLayerSchema(layer: LayerSchema, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const path = `layers[${index}]`;

  const validTypes = ['point', 'line', 'polygon', 'heatmap', 'raster', 'image'];
  if (!layer.type) {
    errors.push({ path: `${path}.type`, message: 'layer type is required', severity: 'error' });
  } else if (!validTypes.includes(layer.type)) {
    errors.push({
      path: `${path}.type`,
      message: `Invalid layer type "${layer.type}". Valid values: ${validTypes.join(', ')}`,
      severity: 'error',
    });
  }

  if (layer.source === undefined && layer.source !== null) {
    // source 可以为 string URL
  }

  // colorField + colorValues 一致性提示
  if (layer.colorField && !layer.colorValues && !layer.color) {
    errors.push({
      path: `${path}.colorValues`,
      message: 'colorField is set but colorValues is not. L7 will use default scale.',
      severity: 'warning',
    });
  }

  // sizeField + sizeValues 一致性提示
  if (layer.sizeField && !layer.sizeValues && layer.size === undefined) {
    errors.push({
      path: `${path}.sizeValues`,
      message: 'sizeField is set but sizeValues is not. L7 will use default scale.',
      severity: 'warning',
    });
  }

  return errors;
}
import type { LayerSchema } from '../../../schema/types';

/**
 * 公共 Adapter 工具函数
 * 抽取各 Layer Adapter 中重复的视觉映射和数据源构建逻辑
 */

export interface ColorConfig {
  field?: string;
  values?: string[] | string;
}

export interface SizeConfig {
  field?: string;
  values?: number[] | number;
  /** 连续数值尺寸范围 [min, max]，与 field 配合使用 */
  range?: [number, number];
}

export interface ShapeConfig {
  field?: string;
  values?: string[] | string;
}

export interface VisualConfig {
  color?: ColorConfig;
  size?: SizeConfig;
  shape?: ShapeConfig;
  style?: Record<string, unknown>;
}

export interface SourceOutput {
  data: unknown;
  options?: Record<string, unknown>;
}

/**
 * 构建颜色映射配置
 */
export function buildColorConfig(schema: LayerSchema): ColorConfig | undefined {
  if (schema.colorField) {
    return { field: schema.colorField, values: schema.colorValues };
  }
  if (schema.color) {
    return { values: schema.color };
  }
  return undefined;
}

/**
 * 构建尺寸映射配置
 */
export function buildSizeConfig(schema: LayerSchema): SizeConfig | undefined {
  if (schema.sizeField) {
    return { field: schema.sizeField, values: schema.sizeValues, range: schema.sizeRange };
  }
  if (schema.size !== undefined) {
    return { values: schema.size };
  }
  return undefined;
}

/**
 * 构建形状映射配置
 */
export function buildShapeConfig(schema: LayerSchema): ShapeConfig | undefined {
  if (schema.shapeField) {
    return { field: schema.shapeField, values: schema.shapeValues };
  }
  if (schema.shape) {
    return { values: schema.shape };
  }
  return undefined;
}

/**
 * 构建完整的视觉映射配置（color + size + shape + style）
 */
export function buildVisualConfig(schema: LayerSchema): VisualConfig {
  return {
    color: buildColorConfig(schema),
    size: buildSizeConfig(schema),
    shape: buildShapeConfig(schema),
    style: schema.style ? { ...schema.style } : undefined,
  };
}

/**
 * 构建 JSON 类型数据源配置
 */
export function buildJsonSourceConfig(schema: LayerSchema): SourceOutput {
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

/**
 * 构建 CSV 类型数据源配置
 */
export function buildCsvSourceConfig(schema: LayerSchema): SourceOutput {
  return {
    data: schema.source,
    options: {
      parser: {
        type: 'csv',
        x: schema.sourceConfig?.x,
        y: schema.sourceConfig?.y,
      },
    },
  };
}

/**
 * 构建 GeoJSON 类型数据源配置
 */
export function buildGeojsonSourceConfig(schema: LayerSchema): SourceOutput {
  return {
    data: schema.source,
    options: {
      parser: {
        type: 'geojson',
        // 保留所有原始 properties，确保事件回调中能获取完整 feature 数据
        ...(schema.sourceConfig?.parser ?? {}),
      },
    },
  };
}

/**
 * 通用数据源构建（json / csv / geojson 三选一）
 */
export function buildCommonSourceConfig(schema: LayerSchema): SourceOutput {
  if (schema.sourceConfig?.parser) {
    return { data: schema.source, options: { parser: schema.sourceConfig.parser } };
  }
  if (schema.sourceType === 'geojson') {
    return buildGeojsonSourceConfig(schema);
  }
  if (schema.sourceType === 'csv') {
    return buildCsvSourceConfig(schema);
  }
  return buildJsonSourceConfig(schema);
}

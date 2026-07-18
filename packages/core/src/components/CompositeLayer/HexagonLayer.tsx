import React from 'react';
import type { LayerSchema, LayerEventPayload } from '../../schema/types';
import { HeatmapLayer } from '../Layer/HeatmapLayer';
import { getColorPalette, type ColorScheme } from '../../constants/colorPalettes';

/**
 * 蜂窝热力图渲染模式
 * - 2d: 平面六边形，适合密度分布展示
 * - 3d: 立体挤压柱体，高度映射权重，增强视觉对比
 */
export type HexagonMode = '2d' | '3d';

export interface HexagonLayerProps
  extends Omit<LayerSchema, 'type' | 'shape' | 'source' | 'sourceType' | 'sourceConfig'> {
  source: LayerSchema['source'];
  sourceType?: LayerSchema['sourceType'];
  sourceConfig?: LayerSchema['sourceConfig'];

  /** 渲染模式，默认 '3d'（立体挤压） */
  mode?: HexagonMode;
  /** 六边形半径（像素），默认 20（符合规范 20-40px 范围） */
  hexSize?: number;
  /** 权重字段，默认 'value' */
  weightField?: string;
  /** 聚合方法，默认 'sum' */
  weightMethod?: 'sum' | 'mean' | 'min' | 'max' | 'count';

  /** 是否显示描边，默认 false（2D 模式可开启） */
  showStroke?: boolean;
  /** 描边颜色，默认 'rgba(255,255,255,0.3)' */
  strokeColor?: string;
  /** 描边宽度，默认 0.5 */
  strokeWidth?: number;

  /** 是否启用 hover 高亮，默认 true */
  hoverEffect?: boolean;
  /** hover 高亮色，默认 '#fbbf24' (secondary) */
  activeColor?: string;

  /** 色板预设，默认 'sequential'。用于生成 heatmap rampColors */
  colorScheme?: ColorScheme;

  onClick?: (payload: LayerEventPayload) => void;
  onMouseMove?: (payload: LayerEventPayload) => void;
  onMouseEnter?: (payload: LayerEventPayload) => void;
  onMouseLeave?: (payload: LayerEventPayload) => void;
}

/**
 * 蜂窝热力图（六边形聚合）
 *
 * 遵循设计规范：
 * - 2D 模式：平面正六边形，可选描边
 * - 3D 模式：立体挤压柱体，高度映射权重
 * - 默认 hexSize=20（屏幕空间 20-40px 范围）
 * - 支持 hover 高亮反馈
 */
export function HexagonLayer({
  source,
  sourceType = 'json',
  sourceConfig,
  mode = '3d',
  hexSize = 20,
  weightField = 'value',
  weightMethod = 'sum',
  showStroke = false,
  strokeColor = 'rgba(255,255,255,0.3)',
  strokeWidth = 0.5,
  hoverEffect = false,
  activeColor = '#fbbf24',
  colorScheme = 'sequential',
  onClick,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  style,
  ...rest
}: HexagonLayerProps) {
  const transforms = [
    {
      type: 'hexagon',
      size: hexSize,
      field: weightField,
      method: weightMethod,
    },
  ];

  // 根据模式选择 shape
  const shape = mode === '3d' ? 'hexagonColumn' : 'hexagon';

  // 构建样式配置
  const palette = getColorPalette(colorScheme);
  const rampColors: Record<number, string> = {};
  palette.forEach((c, i) => {
    rampColors[i / (palette.length - 1)] = c;
  });

  const resolvedStyle: Record<string, unknown> = {
    coverage: 0.8,
    angle: 0,
    rampColors,
    ...(style ?? {}),
  };

  // 2D 模式下添加描边
  if (mode === '2d' && showStroke) {
    resolvedStyle.stroke = strokeColor;
    resolvedStyle.strokeWidth = strokeWidth;
  }

  return (
    <HeatmapLayer
      {...rest}
      source={source}
      sourceType={sourceType}
      sourceConfig={{ ...sourceConfig, transforms }}
      shape={shape}
      style={resolvedStyle}
      active={hoverEffect ? { color: activeColor, duration: 150 } : undefined}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
}

export default HexagonLayer;

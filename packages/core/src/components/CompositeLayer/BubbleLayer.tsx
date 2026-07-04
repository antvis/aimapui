import React, { useState, useEffect } from 'react';
import type { ActiveConfig, LayerSchema, SelectConfig, LayerEventPayload } from '../../schema/types';
import { PointLayer } from '../Layer/PointLayer';

export const BUBBLE_SIZE_LEVELS = [8, 16, 32, 48, 64] as const;

export const BUBBLE_QUALITATIVE_COLORS = {
  primary: '#2563eb',
  warning: '#f59e0b',
  error: '#ef4444',
  success: '#10b981',
} as const;

export type BubbleAnchor =
  | 'center'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface BubbleLayerProps extends Omit<LayerSchema, 'type' | 'source' | 'sourceType' | 'sourceConfig'> {
  source: LayerSchema['source'];
  sourceType?: LayerSchema['sourceType'];
  sourceConfig?: LayerSchema['sourceConfig'];

  /** 文本标签字段，默认 name */
  labelField?: string;
  labelColor?: string;
  labelSize?: number;
  showLabel?: boolean;
  /** 文本偏移量，默认根据气泡最大半径自动计算 */
  labelOffset?: [number, number];
  /** sizeField 为离散值时，对应每个 sizeValues 的域值顺序（默认 1..N） */
  sizeDomain?: Array<string | number>;
  /** 气泡锚点，决定标签相对气泡的连接参考点 */
  bubbleAnchor?: BubbleAnchor;
  /** 文本锚点，映射到 textAnchor */
  labelAnchor?: BubbleAnchor;

  /** 是否启用默认 hover 强化（opacity + 边框强调） */
  hoverEffect?: boolean;
  /** 是否启用默认 click 选中反馈 */
  clickEffect?: boolean;
  /** 是否启用默认 tooltip/popup（点击气泡弹出） */
  tooltipEffect?: boolean;
  /** tooltip 展示字段，不传则自动展示常见字段 */
  tooltipFields?: string[];
  /** tooltip 模板，支持 {{field}} 占位符 */
  tooltipTemplate?: string;

  /** 语义色板映射字段，例如 status: primary|warning|error|success */
  semanticColorField?: string;

  // ===== 事件回调 =====
  /** 点击事件 */
  onClick?: (payload: LayerEventPayload) => void;
  /** 鼠标移动事件 */
  onMouseMove?: (payload: LayerEventPayload) => void;
  /** 鼠标进入事件 */
  onMouseEnter?: (payload: LayerEventPayload) => void;
  /** 鼠标离开事件 */
  onMouseLeave?: (payload: LayerEventPayload) => void;
}

/**
 * 气泡图组件（Bubble Map）
 * 默认遵循设计规范：
 * - 圆形 + 半透明填充 + 实色描边
 * - 五级尺寸映射（8/16/32/48/64）
 * - 默认启用 hover/click 交互反馈
 * - 利用 L7 2.28+ anchor 参数自动布局标签，避免与气泡重叠
 *
 * 推荐锚点组合：
 * - bubbleAnchor='center', labelAnchor='center' — 标签居中覆盖气泡（适合短文本）
 * - bubbleAnchor='bottom', labelAnchor='top' — 标签在气泡上方（经典布局）
 */
export function BubbleLayer({
  source,
  sourceType = 'geojson',
  sourceConfig,
  labelField = 'name',
  labelColor = '#0b3b8c',
  labelSize = 12,
  showLabel = true,
  labelOffset,
  sizeDomain,
  bubbleAnchor = 'bottom',
  labelAnchor = 'top',
  hoverEffect = true,
  clickEffect = true,
  tooltipEffect = true,
  tooltipFields,
  tooltipTemplate,
  semanticColorField,
  color = '#2563eb',
  size = 16,
  sizeField,
  sizeValues,
  style,
  active,
  select,
  onClick,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: BubbleLayerProps) {
  const mappedColorField = semanticColorField ?? rest.colorField;
  const mappedColorValues =
    rest.colorValues
      ?? (semanticColorField
        ? [
            BUBBLE_QUALITATIVE_COLORS.primary,
            BUBBLE_QUALITATIVE_COLORS.warning,
            BUBBLE_QUALITATIVE_COLORS.error,
            BUBBLE_QUALITATIVE_COLORS.success,
          ]
        : undefined);

  const mappedSizeValues = sizeField
    ? (sizeValues ?? [...BUBBLE_SIZE_LEVELS])
    : sizeValues;

  const defaultActive: ActiveConfig = { color: '#60a5fa' };
  const defaultSelect: SelectConfig = { color: '#1d4ed8' };

  const resolvedEvents = (() => {
    const origin = rest.events;
    if (!tooltipEffect) return origin;
    return {
      ...origin,
      enablePopup: origin?.enablePopup ?? true,
      popupFields: origin?.popupFields ?? tooltipFields,
      popupTemplate: origin?.popupTemplate ?? tooltipTemplate,
    };
  })();

  // 延迟渲染标签图层，确保气泡圆图层先完成 addLayer
  const [bubbleReady, setBubbleReady] = useState(false);
  useEffect(() => {
    const timer = requestAnimationFrame(() => setBubbleReady(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const shouldShowLabel = showLabel && bubbleReady;

  // 气泡圆图层的 size 配置：当有 sizeField 时不传固定 size 避免冲突
  const bubbleSizeProps = sizeField
    ? { sizeField, sizeValues: mappedSizeValues }
    : { size };

  return (
    <>
      {/* 气泡圆图层 — 始终渲染 */}
      <PointLayer
        source={source}
        sourceType={sourceType}
        sourceConfig={sourceConfig}
        shape="circle"
        color={color}
        colorField={mappedColorField}
        colorValues={mappedColorValues}
        {...bubbleSizeProps}
        opacity={0.4}
        active={hoverEffect ? (active ?? defaultActive) : active}
        select={clickEffect ? (select ?? defaultSelect) : select}
        events={resolvedEvents}
        zIndex={rest.zIndex ?? 0}
        autoFit={rest.autoFit}
        visible={rest.visible}
        name={rest.name ?? 'bubble-circle'}
        onClick={onClick}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          stroke: color ?? '#004ac6',
          strokeWidth: 1,
          strokeOpacity: 1,
          ...(style ?? {}),
        }}
      />

      {/* 文字标签图层 */}
      {shouldShowLabel && (
        <PointLayer
          source={source}
          sourceType={sourceType}
          sourceConfig={sourceConfig}
          shapeField={labelField}
          shapeValues="text"
          color={labelColor}
          size={labelSize}
          zIndex={(rest.zIndex ?? 0) + 1}
          style={{
            textAnchor: labelAnchor,
            textOffset: labelOffset ?? [0, 0],
            stroke: '#fff',
            strokeWidth: 2,
            textAllowOverlap: true,
          }}
        />
      )}
    </>
  );
}

export default BubbleLayer;

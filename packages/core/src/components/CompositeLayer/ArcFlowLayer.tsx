import React, { useCallback, useMemo, useState } from 'react';
import type { LayerSchema, LayerEventPayload, AnimateConfig } from '../../schema/types';
import { LineLayer } from '../Layer/LineLayer';
import { PointLayer } from '../Layer/PointLayer';
import { Tooltip } from '../Interaction/Tooltip';
import { Popup } from '../Interaction/Popup';

/**
 * 弧线形态
 * - arc: 2D 贝塞尔弧线（默认）
 * - arc3d: 3D 弧线（适合倾斜视角）
 * - greatcircle: 大圆航线（跨洲长距离）
 */
export type ArcShape = 'arc' | 'arc3d' | 'greatcircle';

/**
 * 弧线流向色彩模式
 * - single: 单色模式（默认 primary）
 * - gradient: 起点色 → 终点色渐变
 * - field: 按字段映射色板
 */
export type ArcColorMode = 'single' | 'gradient' | 'field';

/**
 * OD 数据项
 */
export interface ArcFlowDataItem {
  /** 起点经度 */
  fromLng: number;
  /** 起点纬度 */
  fromLat: number;
  /** 终点经度 */
  toLng: number;
  /** 终点纬度 */
  toLat: number;
  /** 权重/流量值 */
  weight?: number;
  /** 起点名称 */
  fromName?: string;
  /** 终点名称 */
  toName?: string;
  [key: string]: unknown;
}

export interface ArcFlowLayerProps {
  /** OD 数据源 — JSON 数组 */
  source: ArcFlowDataItem[] | string;
  /** 数据源类型 */
  sourceType?: 'json' | 'csv';
  /** 字段映射配置（覆盖默认 fromLng/fromLat/toLng/toLat） */
  sourceConfig?: {
    x?: string;
    y?: string;
    x1?: string;
    y1?: string;
  };

  // ===== 弧线视觉 =====
  /** 弧线形态，默认 'arc' */
  shape?: ArcShape;
  /** 弧线颜色（单色模式），默认 '#2563EB' */
  color?: string;
  /** 渐变色（gradient 模式）：[起点色, 终点色] */
  gradientColors?: [string, string];
  /** 颜色模式，默认 'single' */
  colorMode?: ArcColorMode;
  /** 字段映射色板时的字段名 */
  colorField?: string;
  /** 字段映射色板值 */
  colorValues?: string[];
  /** 弧线宽度，默认 1.5 */
  lineWidth?: number;
  /** 按权重映射宽度范围 [min, max]，例如 [1, 5] */
  lineWidthRange?: [number, number];
  /** 权重字段名，默认 'weight' */
  weightField?: string;
  /** 弧线透明度，默认 0.8 */
  opacity?: number;
  /** 弧线模糊度，默认 0.6（增加柔和感） */
  blur?: number;

  // ===== 流动动画 =====
  /** 是否启用流动动画，默认 false */
  animate?: boolean;
  /** 动画速度（数值越大越快），默认 1 */
  animateSpeed?: number;
  /** 动画尾迹长度 0~1，默认 0.3 */
  animateTrailLength?: number;
  /** 动画持续时间(ms)，默认 2000 */
  animateDuration?: number;

  // ===== 节点可视化 =====
  /** 是否显示起终点节点，默认 true */
  showNodes?: boolean;
  /** 节点颜色，默认跟随弧线色 */
  nodeColor?: string;
  /** 节点大小，默认 4 */
  nodeSize?: number;
  /** 节点大小按权重映射范围，例如 [3, 12] */
  nodeSizeRange?: [number, number];
  /** 是否显示节点呼吸脉冲动画，默认 false */
  nodePulse?: boolean;

  // ===== 交互 =====
  /** 是否在 hover 弧线时显示 Tooltip，默认 true */
  showTooltip?: boolean;
  /** 是否在点击节点时显示 Popup，默认 true */
  showNodePopup?: boolean;
  /** hover 高亮色 */
  activeColor?: string;
  /** 弧线 hover 事件 */
  onArcHover?: (payload: LayerEventPayload) => void;
  /** 弧线点击事件 */
  onArcClick?: (payload: LayerEventPayload) => void;
  /** 节点点击事件 */
  onNodeClick?: (payload: LayerEventPayload) => void;

  /** 额外 style */
  style?: Record<string, unknown>;
}

/**
 * 弧线流向复合图层 (Arc & OD Flow Map)
 *
 * 遵循设计规范：
 * - 弧线形态：贝塞尔 / 3D / 大圆航线
 * - 线宽按权重映射（1~5px）
 * - 渐变色强化流向感
 * - 粒子/轨迹流动动画
 * - 节点锚点 + 脉冲波纹
 * - Hover 高亮路径 + 其余置灰
 *
 * @example
 * ```tsx
 * <ArcFlowLayer
 *   source={odData}
 *   shape="arc3d"
 *   colorMode="gradient"
 *   gradientColors={['#93c5fd', '#2563eb']}
 *   lineWidthRange={[1, 4]}
 *   animate
 *   showNodes
 *   nodePulse
 * />
 * ```
 */
export function ArcFlowLayer({
  source,
  sourceType = 'json',
  sourceConfig,
  shape = 'arc',
  color = '#2563EB',
  gradientColors,
  colorMode = 'single',
  colorField,
  colorValues,
  lineWidth = 1.5,
  lineWidthRange,
  weightField = 'weight',
  opacity = 0.8,
  blur = 0.6,
  animate = false,
  animateSpeed = 1,
  animateTrailLength = 0.3,
  animateDuration = 2000,
  showNodes = true,
  nodeColor,
  nodeSize = 4,
  nodeSizeRange,
  nodePulse = false,
  showTooltip = true,
  showNodePopup = true,
  activeColor = '#FFD93D',
  onArcHover,
  onArcClick,
  onNodeClick,
  style: extraStyle,
}: ArcFlowLayerProps) {
  // 构建弧线 sourceConfig
  const arcSourceConfig = useMemo(() => {
    return sourceConfig ?? {
      x: 'fromLng',
      y: 'fromLat',
      x1: 'toLng',
      y1: 'toLat',
    };
  }, [sourceConfig]);

  // 弧线颜色
  const arcColor = useMemo(() => {
    if (colorMode === 'gradient' && gradientColors) {
      return gradientColors as unknown as string;
    }
    return color;
  }, [colorMode, gradientColors, color]);

  // 弧线宽度
  const arcSize = useMemo(() => {
    if (lineWidthRange) return lineWidth;
    return lineWidth;
  }, [lineWidth, lineWidthRange]);

  // 动画配置
  const animateConfig: AnimateConfig | undefined = useMemo(() => {
    if (!animate) return undefined;
    return {
      enable: true,
      speed: animateSpeed,
      duration: animateDuration,
      trailLength: animateTrailLength,
    };
  }, [animate, animateSpeed, animateDuration, animateTrailLength]);

  // 弧线样式
  const arcStyle = useMemo(() => ({
    opacity,
    blur,
    ...extraStyle,
  }), [opacity, blur, extraStyle]);

  // 节点数据（从 OD 数据中提取唯一节点）
  const nodeData = useMemo(() => {
    if (!showNodes || typeof source === 'string') return [];
    const nodes = new Map<string, { lng: number; lat: number; degree: number; name?: string }>();
    const xField = arcSourceConfig.x ?? 'fromLng';
    const yField = arcSourceConfig.y ?? 'fromLat';
    const x1Field = arcSourceConfig.x1 ?? 'toLng';
    const y1Field = arcSourceConfig.y1 ?? 'toLat';

    (source as ArcFlowDataItem[]).forEach((item) => {
      const fromKey = `${item[xField]}_${item[yField]}`;
      const toKey = `${item[x1Field]}_${item[y1Field]}`;
      if (!nodes.has(fromKey)) {
        nodes.set(fromKey, {
          lng: Number(item[xField]),
          lat: Number(item[yField]),
          degree: 0,
          name: item.fromName as string | undefined,
        });
      }
      if (!nodes.has(toKey)) {
        nodes.set(toKey, {
          lng: Number(item[x1Field]),
          lat: Number(item[y1Field]),
          degree: 0,
          name: item.toName as string | undefined,
        });
      }
      nodes.get(fromKey)!.degree++;
      nodes.get(toKey)!.degree++;
    });
    return Array.from(nodes.values());
  }, [source, showNodes, arcSourceConfig]);

  // 节点颜色
  const resolvedNodeColor = nodeColor ?? color;

  // 内置 Tooltip 状态（hover 弧线）
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean; lng: number; lat: number; from: string; to: string; weight: number;
  }>({ visible: false, lng: 0, lat: 0, from: '', to: '', weight: 0 });

  const handleArcHoverInternal = useCallback((payload: LayerEventPayload) => {
    onArcHover?.(payload);
    if (!showTooltip) return;
    const f = payload.feature;
    if (!f) return;
    setTooltipState({
      visible: true,
      lng: payload.lng,
      lat: payload.lat,
      from: String(f.fromName ?? ''),
      to: String(f.toName ?? ''),
      weight: Number(f[weightField] ?? 0),
    });
  }, [onArcHover, showTooltip, weightField]);

  const handleArcMouseLeave = useCallback(() => {
    setTooltipState((prev) => ({ ...prev, visible: false }));
  }, []);

  // 内置 Popup 状态（点击节点）
  const [popupState, setPopupState] = useState<{
    visible: boolean; lng: number; lat: number; name: string; degree: number;
  }>({ visible: false, lng: 0, lat: 0, name: '', degree: 0 });

  const handleNodeClickInternal = useCallback((payload: LayerEventPayload) => {
    onNodeClick?.(payload);
    if (!showNodePopup) return;
    const f = payload.feature;
    if (!f) return;
    setPopupState({
      visible: true,
      lng: payload.lng,
      lat: payload.lat,
      name: String(f.name ?? ''),
      degree: Number(f.degree ?? 0),
    });
  }, [onNodeClick, showNodePopup]);

  return (
    <>
      {/* 弧线层 */}
      <LineLayer
        source={source}
        sourceType={sourceType}
        sourceConfig={arcSourceConfig}
        shape={shape}
        color={arcColor}
        colorField={colorMode === 'field' ? colorField : undefined}
        colorValues={colorMode === 'field' ? colorValues : undefined}
        size={arcSize}
        sizeField={lineWidthRange ? weightField : undefined}
        sizeValues={lineWidthRange ? lineWidthRange : undefined}
        animate={animateConfig}
        active={activeColor ? { color: activeColor } : false}
        style={arcStyle}
        onMouseMove={handleArcHoverInternal}
        onMouseLeave={handleArcMouseLeave}
        onClick={onArcClick}
      />

      {/* 节点层 */}
      {showNodes && nodeData.length > 0 && (
        <PointLayer
          source={nodeData}
          sourceConfig={{ x: 'lng', y: 'lat' }}
          color={resolvedNodeColor}
          size={nodeSizeRange ? nodeSize : nodeSize}
          sizeField={nodeSizeRange ? 'degree' : undefined}
          sizeValues={nodeSizeRange}
          shape="circle"
          style={{
            opacity: 0.9,
            strokeWidth: 1,
            stroke: '#fff',
          }}
          animate={nodePulse ? { enable: true, speed: 0.6 } : undefined}
          active={activeColor ? { color: activeColor } : false}
          onClick={handleNodeClickInternal}
        />
      )}

      {/* 内置 Tooltip — hover 弧线时展示 */}
      {showTooltip && tooltipState.visible && (
        <Tooltip
          longitude={tooltipState.lng}
          latitude={tooltipState.lat}
          visible
          variant="dark"
          items={[
            { label: '起点', value: tooltipState.from },
            { label: '终点', value: tooltipState.to },
            { label: '流量', value: tooltipState.weight },
          ]}
        />
      )}

      {/* 内置 Popup — 点击节点时展示 */}
      {showNodePopup && popupState.visible && (
        <Popup
          longitude={popupState.lng}
          latitude={popupState.lat}
          content={`<div style="min-width:80px"><div style="font-weight:700;font-size:13px;margin-bottom:4px">${popupState.name || '节点'}</div><div style="font-size:12px;color:#64748b">连接数: ${popupState.degree}</div></div>`}
          closeButton
          size="compact"
          onClose={() => setPopupState((prev) => ({ ...prev, visible: false }))}
        />
      )}
    </>
  );
}

export default ArcFlowLayer;

import React, { useMemo } from 'react';
import type { LayerEventPayload } from '../../schema/types';
import { LineLayer } from '../Layer/LineLayer';
import { PointLayer } from '../Layer/PointLayer';

/**
 * 途经点数据
 */
export interface RouteStop {
  /** 经度 */
  lng: number;
  /** 纬度 */
  lat: number;
  /** 名称 */
  name: string;
  /** 序号（自动生成，也可手动指定） */
  index?: number;
  /** 类型：start / end / waypoint */
  type?: 'start' | 'end' | 'waypoint';
}

/**
 * 路径分段数据
 */
export interface RouteSegment {
  /** 坐标序列 [[lng, lat], [lng, lat], ...] */
  coordinates: [number, number][];
  /** 分段颜色（如路况着色） */
  color?: string;
  /** 分段宽度 */
  width?: number;
}

export interface RouteLayerProps {
  /** 路径坐标 — 完整线坐标或分段 */
  path?: [number, number][];
  /** 分段路径（优先级高于 path） */
  segments?: RouteSegment[];
  /** 途经点列表 */
  stops?: RouteStop[];

  // ===== 路径视觉 =====
  /** 路径颜色，默认 '#2563eb' */
  color?: string;
  /** 路径宽度，默认 4 */
  lineWidth?: number;
  /** 路径透明度，默认 0.9 */
  opacity?: number;
  /** 是否显示发光效果，默认 true */
  glow?: boolean;
  /** 是否启用流动动画，默认 false */
  animate?: boolean;
  /** 动画速度，默认 1 */
  animateSpeed?: number;

  // ===== 途经点视觉 =====
  /** 途经点大小，默认 14 */
  stopSize?: number;
  /** 途经点颜色（默认跟随路径色） */
  stopColor?: string;
  /** 终点颜色，默认 '#10b981' */
  endColor?: string;
  /** 是否显示途经点序号，默认 true */
  showStopIndex?: boolean;

  // ===== 交互 =====
  /** hover 高亮色 */
  activeColor?: string;
  /** 路径点击 */
  onPathClick?: (payload: LayerEventPayload) => void;
  /** 途经点点击 */
  onStopClick?: (payload: LayerEventPayload) => void;
}

/**
 * 路径地图复合图层 (Route Map)
 *
 * 遵循设计规范：
 * - 序列化途经点 (Numbered Stops)
 * - 路径发光效果
 * - 分段着色（路况/属性）
 * - 流动动画
 *
 * @example
 * ```tsx
 * <RouteLayer
 *   path={[[120.15, 30.28], [120.17, 30.25], ...]}
 *   stops={[
 *     { lng: 120.15, lat: 30.28, name: '西湖' },
 *     { lng: 120.17, lat: 30.25, name: '灵隐寺' },
 *   ]}
 *   animate
 *   glow
 * />
 * ```
 */
export function RouteLayer({
  path,
  segments,
  stops = [],
  color = '#2563eb',
  lineWidth = 4,
  opacity = 0.9,
  glow = true,
  animate = false,
  animateSpeed = 1,
  stopSize = 14,
  stopColor,
  endColor = '#10b981',
  showStopIndex = true,
  activeColor = '#fbbf24',
  onPathClick,
  onStopClick,
}: RouteLayerProps) {
  // 构建路径 GeoJSON
  const pathGeoJSON = useMemo(() => {
    if (segments && segments.length > 0) {
      return {
        type: 'FeatureCollection' as const,
        features: segments.map((seg, idx) => ({
          type: 'Feature' as const,
          properties: { color: seg.color || color, width: seg.width || lineWidth, index: idx },
          geometry: { type: 'LineString' as const, coordinates: seg.coordinates },
        })),
      };
    }
    if (path && path.length > 1) {
      return {
        type: 'FeatureCollection' as const,
        features: [{
          type: 'Feature' as const,
          properties: { color, width: lineWidth },
          geometry: { type: 'LineString' as const, coordinates: path },
        }],
      };
    }
    return null;
  }, [path, segments, color, lineWidth]);

  // 发光层 GeoJSON（同路径但宽度更大）
  const hasSegmentColors = segments && segments.some((s) => s.color);

  // 途经点数据（增加序号和类型）
  const stopsWithIndex = useMemo(() => {
    return stops.map((stop, idx) => ({
      ...stop,
      index: stop.index ?? idx + 1,
      type: stop.type ?? (idx === 0 ? 'start' : idx === stops.length - 1 ? 'end' : 'waypoint'),
      stopColor: (stop.type === 'end' || (!stop.type && idx === stops.length - 1))
        ? endColor
        : (stopColor ?? color),
    }));
  }, [stops, color, stopColor, endColor]);

  if (!pathGeoJSON) return null;

  return (
    <>
      {/* 发光层（底层，更宽更透明） */}
      {glow && (
        <LineLayer
          source={pathGeoJSON}
          sourceType="geojson"
          shape="line"
          color={hasSegmentColors ? undefined : color}
          colorField={hasSegmentColors ? 'color' : undefined}
          colorValues={hasSegmentColors ? segments!.map((s) => s.color || color) : undefined}
          size={lineWidth * 2.5}
          style={{ opacity: 0.15 }}
        />
      )}

      {/* 主路径层 */}
      <LineLayer
        source={pathGeoJSON}
        sourceType="geojson"
        shape="line"
        color={hasSegmentColors ? undefined : color}
        colorField={hasSegmentColors ? 'color' : undefined}
        colorValues={hasSegmentColors ? segments!.map((s) => s.color || color) : undefined}
        size={hasSegmentColors ? undefined : lineWidth}
        sizeField={hasSegmentColors ? 'width' : undefined}
        sizeValues={hasSegmentColors ? segments!.map((s) => s.width || lineWidth) : undefined}
        style={{ opacity }}
        animate={animate ? { enable: true, speed: animateSpeed, trailLength: 0.3, duration: 2000 } : undefined}
        active={activeColor ? { color: activeColor } : false}
        onClick={onPathClick}
      />

      {/* 途经点层 */}
      {stopsWithIndex.length > 0 && (
        <PointLayer
          source={stopsWithIndex}
          sourceConfig={{ x: 'lng', y: 'lat' }}
          colorField="stopColor"
          colorValues={[...new Set(stopsWithIndex.map((s) => s.stopColor))]}
          size={stopSize}
          shape="circle"
          style={{
            opacity: 1,
            strokeWidth: 2,
            stroke: '#ffffff',
          }}
          active={activeColor ? { color: activeColor } : false}
          onClick={onStopClick}
        />
      )}
    </>
  );
}

export default RouteLayer;

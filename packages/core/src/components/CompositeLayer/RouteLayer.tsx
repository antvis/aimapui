import React, { useCallback, useMemo, useState } from 'react';
import type { LayerEventPayload } from '../../schema/types';
import { LineLayer } from '../Layer/LineLayer';
import { PointLayer } from '../Layer/PointLayer';
import { IconLayer, type IconAnchor } from './IconLayer';
import { Popup } from '../Interaction/Popup';
import { Marker, type MarkerColor, type MarkerVariant } from '../Interaction/Marker';
import { createMakiPinMap } from '../Interaction/maki-icons';

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
  /** 停留点图标名，供 stopRenderer='icon' 或 marker icon 变体使用 */
  icon?: string;
  /** marker 模式下的自定义变体 */
  markerVariant?: MarkerVariant;
  /** marker 模式下的语义颜色 */
  markerColor?: MarkerColor;
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
  /** 停留点渲染模式，默认 'point' */
  stopRenderer?: 'point' | 'marker' | 'icon';
  /** marker 模式下的默认变体，默认 'circle' */
  stopMarkerVariant?: MarkerVariant;
  /** icon 模式下的图标资源映射；不传时会基于 stop.icon 自动生成 Maki pin 图标 */
  stopIconMap?: Record<string, string>;
  /** icon 模式下的图标字段名，默认 'iconValue' */
  stopIconField?: string;
  /** icon 模式下的图标尺寸，默认 16 */
  stopIconSize?: number;
  /** icon 模式下的图标锚点，默认 'bottom' */
  stopIconAnchor?: IconAnchor;

  // ===== 交互 =====
  /** 是否在点击途经点时显示 Popup，默认 true */
  showStopPopup?: boolean;
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
  stopRenderer = 'point',
  stopMarkerVariant = 'circle',
  stopIconMap,
  stopIconField = 'iconValue',
  stopIconSize = 16,
  stopIconAnchor = 'bottom',
  showStopPopup = true,
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
  // 自动补全路径起终点：如果 stops 中没有覆盖 path 的首尾坐标，则自动添加
  const stopsWithIndex = useMemo(() => {
    const effectivePath = path ?? (segments && segments.length > 0
      ? [...segments[0].coordinates.slice(0, 1), ...segments[segments.length - 1].coordinates.slice(-1)]
      : null);

    let merged = [...stops];

    if (effectivePath && effectivePath.length >= 2) {
      const [startLng, startLat] = effectivePath[0];
      const [endLng, endLat] = effectivePath[effectivePath.length - 1];
      const hasStart = stops.some((s) => Math.abs(s.lng - startLng) < 1e-6 && Math.abs(s.lat - startLat) < 1e-6);
      const hasEnd = stops.some((s) => Math.abs(s.lng - endLng) < 1e-6 && Math.abs(s.lat - endLat) < 1e-6);

      if (!hasStart) {
        merged = [{ lng: startLng, lat: startLat, name: '起点', type: 'start' as const }, ...merged];
      }
      if (!hasEnd) {
        merged = [...merged, { lng: endLng, lat: endLat, name: '终点', type: 'end' as const }];
      }
    }

    return merged.map((stop, idx) => ({
      ...stop,
      index: stop.index ?? idx + 1,
      type: stop.type ?? (idx === 0 ? 'start' : idx === merged.length - 1 ? 'end' : 'waypoint'),
      stopColor: (stop.type === 'end' || (!stop.type && idx === merged.length - 1))
        ? endColor
        : (stopColor ?? color),
      iconValue: stop.icon ?? 'marker',
      indexLabel: String(stop.index ?? idx + 1),
      markerColorValue: stop.markerColor ?? resolveMarkerColor(stop.type ?? (idx === 0 ? 'start' : idx === merged.length - 1 ? 'end' : 'waypoint')),
    }));
  }, [stops, path, segments, color, stopColor, endColor]);

  const resolvedStopIconMap = useMemo(() => {
    if (stopRenderer !== 'icon') return undefined;
    if (stopIconMap) return stopIconMap;

    const names = [...new Set(stopsWithIndex.map((stop) => stop.iconValue).filter(Boolean))] as string[];
    if (!names.length) return undefined;

    return createMakiPinMap(names, {
      fill: stopColor ?? color,
      size: Math.max(24, stopIconSize + 8),
    });
  }, [stopRenderer, stopIconMap, stopsWithIndex, stopColor, color, stopIconSize]);

  // 内置 Popup 状态
  const [popupState, setPopupState] = useState<{
    visible: boolean; lng: number; lat: number; name: string; index: string;
  }>({ visible: false, lng: 0, lat: 0, name: '', index: '' });

  const handleStopClickInternal = useCallback((payload: LayerEventPayload) => {
    onStopClick?.(payload);
    if (!showStopPopup) return;
    const feature = payload.feature;
    if (!feature) return;
    setPopupState({
      visible: true,
      lng: payload.lng,
      lat: payload.lat,
      name: String(feature.name ?? ''),
      index: String(feature.indexLabel ?? feature.index ?? ''),
    });
  }, [onStopClick, showStopPopup]);

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
        active={activeColor ? { color: activeColor } : false}
        onClick={onPathClick}
      />

      {/* 流动粒子层 — 白色半透明虚线沿路径流动，指示行驶方向 */}
      {animate && (
        <LineLayer
          source={pathGeoJSON}
          sourceType="geojson"
          shape="line"
          color="#ffffff"
          size={Math.max(1.5, lineWidth * 0.5)}
          style={{ opacity: 0.6, lineType: 'dash', lineDash: [8, 16] }}
          animate={{ enable: true, speed: animateSpeed, duration: 1500 }}
          zIndex={10}
        />
      )}

      {/* 途经点层 */}
      {stopsWithIndex.length > 0 && stopRenderer === 'point' && (
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
          onClick={handleStopClickInternal}
        />
      )}

      {stopsWithIndex.length > 0 && stopRenderer === 'point' && showStopIndex && (
        <PointLayer
          source={stopsWithIndex}
          sourceConfig={{ x: 'lng', y: 'lat' }}
          shapeField="indexLabel"
          shapeValues="text"
          color="#ffffff"
          size={Math.max(10, Math.round(stopSize * 0.75))}
          style={{
            textAnchor: 'center',
            stroke: 'rgba(18, 28, 42, 0.28)',
            strokeWidth: 1.5,
            fontWeight: '700',
            textAllowOverlap: true,
          }}
        />
      )}

      {stopsWithIndex.length > 0 && stopRenderer === 'icon' && resolvedStopIconMap && (
        <IconLayer
          source={stopsWithIndex}
          sourceType="json"
          sourceConfig={{ x: 'lng', y: 'lat' }}
          iconField={stopIconField}
          iconMap={resolvedStopIconMap}
          iconSize={stopIconSize}
          iconAnchor={stopIconAnchor}
          showLabel={showStopIndex}
          labelField="indexLabel"
          labelColor="#ffffff"
          labelSize={11}
          labelAnchor="top"
          labelOffset={[0, stopIconAnchor === 'bottom' ? Math.max(10, Math.round(stopIconSize * 0.6)) : 0]}
          labelHaloColor="rgba(18, 28, 42, 0.35)"
          labelHaloWidth={2}
          onClick={handleStopClickInternal}
        />
      )}

      {stopsWithIndex.length > 0 && stopRenderer === 'marker' && stopsWithIndex.map((stop, index) => {
        const variant = stop.markerVariant ?? stopMarkerVariant;
        const markerColor = stop.markerColorValue as MarkerColor;
        const markerContent = createMarkerStopContent(stop.indexLabel, stop.stopColor, showStopIndex, variant);

        return (
          <Marker
            key={`route-stop-marker-${index}`}
            longitude={stop.lng}
            latitude={stop.lat}
            variant={variant}
            color={markerColor}
            icon={stop.icon}
            content={markerContent}
            label={markerContent ? undefined : (showStopIndex ? stop.indexLabel : undefined)}
            onClick={(event) => {
              handleStopClickInternal({
                layerId: 'route-stop-marker',
                layerType: 'point',
                originalEvent: event,
                lng: stop.lng,
                lat: stop.lat,
                feature: stop,
              });
            }}
          />
        );
      })}
      {/* 内置 Popup — 点击途经点时展示 */}
      {showStopPopup && popupState.visible && (
        <Popup
          longitude={popupState.lng}
          latitude={popupState.lat}
          content={`<div style="min-width:100px"><div style="font-weight:700;font-size:13px;margin-bottom:4px">${popupState.name}</div><div style="font-size:12px;color:#64748b">第 ${popupState.index} 站</div></div>`}
          closeButton
          size="compact"
          onClose={() => setPopupState((prev) => ({ ...prev, visible: false }))}
        />
      )}
    </>
  );
}

function resolveMarkerColor(type: RouteStop['type']): MarkerColor {
  switch (type) {
    case 'start':
      return 'success';
    case 'end':
      return 'error';
    default:
      return 'primary';
  }
}

function createMarkerStopContent(
  indexLabel: string,
  fill: string,
  showStopIndex: boolean,
  variant: MarkerVariant,
): React.ReactNode | undefined {
  if (!showStopIndex) return undefined;
  if (variant !== 'circle' && variant !== 'dot') return undefined;

  const size = variant === 'circle' ? 24 : 18;
  const fontSize = variant === 'circle' ? 11 : 10;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '9999px',
        border: '2px solid #ffffff',
        background: fill,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        lineHeight: 1,
        fontWeight: 700,
        boxShadow: '0 6px 12px rgba(0,0,0,0.14)',
      }}
    >
      {indexLabel}
    </div>
  );
}

export default RouteLayer;

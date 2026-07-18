import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

/** 路径类型 */
export type RouteType = 'straight' | 'arc' | 'walking' | 'cycling' | 'driving' | 'transit';

/** 交通路线查询参数 */
export interface RouteQueryParams {
  origin: [number, number];
  destination: [number, number];
  waypoints?: [number, number][];
  routeType: 'walking' | 'cycling' | 'driving' | 'transit';
}

/** 交通路线查询结果 */
export interface RouteQueryResult {
  /** 完整路径坐标 */
  path: [number, number][];
  /** 分段路径（可选，如返回多段路况着色路径） */
  segments?: RouteSegment[];
  /** 途中补充站点（可选，如公交换乘站） */
  stops?: RouteStop[];
  /** 路线信息 */
  info?: { distance?: number; duration?: number; description?: string };
}

export interface RouteLayerProps {
  /** 路径坐标 — 完整线坐标或分段 */
  path?: [number, number][];
  /** 分段路径（优先级高于 path） */
  segments?: RouteSegment[];
  /** 途经点列表 */
  stops?: RouteStop[];

  // ===== 路径模式 =====
  /** 路径类型，默认 'straight' */
  routeType?: RouteType;
  /** 路线查询回调 — routeType 为 walking/cycling/driving/transit 时使用 */
  onRouteQuery?: (params: RouteQueryParams) => Promise<RouteQueryResult>;
  /** 路线查询完成回调 */
  onRouteResult?: (result: RouteQueryResult) => void;

  // ===== 路径视觉 =====
  /** 路径颜色，默认 '#2563eb' */
  color?: string;
  /** 路径宽度，默认 4 */
  lineWidth?: number;
  /** 路径透明度，默认 0.9 */
  opacity?: number;

  // ===== 途经点视觉 =====
  /** 途经点大小，默认 14 */
  stopSize?: number;
  /** 途经点颜色（默认跟随路径色） */
  stopColor?: string;
  /** 终点颜色，默认 '#10b981' */
  endColor?: string;
  /** 是否显示途经点序号，默认 true */
  showStopIndex?: boolean;
  /** 是否显示途经点名称，默认 true */
  showStopName?: boolean;
  /** 名称文字颜色，默认 '#334155' */
  stopNameColor?: string;
  /** 名称文字大小，默认 11 */
  stopNameSize?: number;
  /** 停留点渲染模式，默认 'marker'（优先使用 marker 类型标注） */
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
  /** 是否在点击途经点时显示 Popup，默认 false */
  showStopPopup?: boolean;
  /** hover 高亮色 */
  activeColor?: string;
  /** 路径点击 */
  onPathClick?: (payload: LayerEventPayload) => void;
  /** 途经点点击 */
  onStopClick?: (payload: LayerEventPayload) => void;
  /** 图层层级 */
  zIndex?: number;
}

/**
 * 路径地图复合图层 (Route Map)
 *
 * 遵循设计规范：
 * - 序列化途经点 (Numbered Stops)
 * - 分段着色（路况/属性）
 *
 * @example
 * ```tsx
 * <RouteLayer
 *   path={[[120.15, 30.28], [120.17, 30.25], ...]}
 *   stops={[
 *     { lng: 120.15, lat: 30.28, name: '西湖' },
 *     { lng: 120.17, lat: 30.25, name: '灵隐寺' },
 *   ]}
 * />
 * ```
 */
export function RouteLayer({
  path,
  segments,
  stops = [],
  routeType = 'straight',
  onRouteQuery,
  onRouteResult,
  color = '#2563eb',
  lineWidth = 3,
  opacity = 0.9,
  stopSize = 8,
  stopColor,
  endColor = '#10b981',
  showStopIndex = true,
  showStopName = true,
  stopNameColor = '#334155',
  stopNameSize = 11,
  stopRenderer = 'marker',
  stopMarkerVariant = 'circle',
  stopIconMap,
  stopIconField = 'iconValue',
  stopIconSize = 16,
  stopIconAnchor = 'bottom',
  showStopPopup = false,
  activeColor = '#fbbf24',
  onPathClick,
  onStopClick,
  zIndex,
  ...rest
}: RouteLayerProps) {
  // 交通路线查询结果
  const [routeQueryResult, setRouteQueryResult] = useState<RouteQueryResult | null>(null);
  const queryVersionRef = useRef(0);

  const isTransportMode = routeType === 'walking' || routeType === 'cycling' || routeType === 'driving' || routeType === 'transit';

  useEffect(() => {
    if (!isTransportMode || !onRouteQuery || stops.length < 2) {
      setRouteQueryResult(null);
      return;
    }
    const origin: [number, number] = [stops[0].lng, stops[0].lat];
    const destination: [number, number] = [stops[stops.length - 1].lng, stops[stops.length - 1].lat];
    const waypoints: [number, number][] = stops.length > 2
      ? stops.slice(1, -1).map((s) => [s.lng, s.lat])
      : [];

    const version = ++queryVersionRef.current;
    onRouteQuery({ origin, destination, waypoints: waypoints.length > 0 ? waypoints : undefined, routeType })
      .then((result) => {
        if (queryVersionRef.current !== version) return;
        setRouteQueryResult(result);
        onRouteResult?.(result);
      })
      .catch(() => {
        if (queryVersionRef.current !== version) return;
        setRouteQueryResult(null);
      });
  }, [isTransportMode, onRouteQuery, stops, routeType]);

  // 实际使用的路径和分段数据
  const effectivePath = isTransportMode && routeQueryResult ? routeQueryResult.path : path;
  const effectiveSegments = isTransportMode && routeQueryResult?.segments ? routeQueryResult.segments : segments;
  const extraStops = isTransportMode && routeQueryResult?.stops ? routeQueryResult.stops : [];

  // 线形状：arc 模式用 'arc'，其余用 'line'
  const lineShape = routeType === 'arc' ? 'arc' : 'line';

  // 构建路径 GeoJSON
  const pathGeoJSON = useMemo(() => {
    if (effectiveSegments && effectiveSegments.length > 0) {
      return {
        type: 'FeatureCollection' as const,
        features: effectiveSegments.map((seg, idx) => ({
          type: 'Feature' as const,
          properties: { color: seg.color || color, width: seg.width || lineWidth, index: idx },
          geometry: { type: 'LineString' as const, coordinates: seg.coordinates },
        })),
      };
    }
    if (effectivePath && effectivePath.length > 1) {
      return {
        type: 'FeatureCollection' as const,
        features: [{
          type: 'Feature' as const,
          properties: { color, width: lineWidth },
          geometry: { type: 'LineString' as const, coordinates: effectivePath },
        }],
      };
    }
    return null;
  }, [effectivePath, effectiveSegments, color, lineWidth]);

  // 是否存在分段颜色（用于主路径分段色/宽渲染）
  const hasSegmentColors = effectiveSegments && effectiveSegments.some((s) => s.color);

  // 途经点数据（增加序号和类型）
  // 自动补全路径起终点：如果 stops 中没有覆盖 path 的首尾坐标，则自动添加
  const stopsWithIndex = useMemo(() => {
    const effectivePathForStops = effectivePath ?? (effectiveSegments && effectiveSegments.length > 0
      ? [...effectiveSegments[0].coordinates.slice(0, 1), ...effectiveSegments[effectiveSegments.length - 1].coordinates.slice(-1)]
      : null);

    let merged = [...stops, ...extraStops];

    if (effectivePathForStops && effectivePathForStops.length >= 2) {
      const startCoord = effectivePathForStops[0];
      const endCoord = effectivePathForStops[effectivePathForStops.length - 1];
      
      // 防御性检查：确保坐标有效
      if (!startCoord || !endCoord || startCoord.length < 2 || endCoord.length < 2) {
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
      }
      
      const [startLng, startLat] = startCoord;
      const [endLng, endLat] = endCoord;
      
      // 检查坐标值是否为有效数字
      if (typeof startLng !== 'number' || typeof startLat !== 'number' || 
          typeof endLng !== 'number' || typeof endLat !== 'number' ||
          !isFinite(startLng) || !isFinite(startLat) || 
          !isFinite(endLng) || !isFinite(endLat)) {
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
      }
      
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
  }, [stops, extraStops, effectivePath, effectiveSegments, color, stopColor, endColor]);

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
      {/* 主路径层 */}
      <LineLayer
        source={pathGeoJSON}
        sourceType="geojson"
        shape={lineShape}
        color={hasSegmentColors ? undefined : color}
        colorField={hasSegmentColors ? 'color' : undefined}
        colorValues={hasSegmentColors ? effectiveSegments!.map((s) => s.color || color) : undefined}
        size={hasSegmentColors ? undefined : lineWidth}
        sizeField={hasSegmentColors ? 'width' : undefined}
        sizeValues={hasSegmentColors ? effectiveSegments!.map((s) => s.width || lineWidth) : undefined}
        style={{ opacity }}
        active={activeColor ? { color: activeColor } : false}
        onClick={onPathClick}
      />

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

      {stopsWithIndex.length > 0 && stopRenderer === 'point' && showStopName && (
        <PointLayer
          source={stopsWithIndex}
          sourceConfig={{ x: 'lng', y: 'lat' }}
          shapeField="name"
          shapeValues="text"
          color={stopNameColor}
          size={stopNameSize}
          style={{
            textAnchor: 'top',
            textOffset: [0, -3 * stopSize],
            stroke: '#ffffff',
            strokeWidth: 2,
            fontWeight: '500',
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

      {stopsWithIndex.length > 0 && stopRenderer === 'icon' && showStopName && (
        <PointLayer
          source={stopsWithIndex}
          sourceConfig={{ x: 'lng', y: 'lat' }}
          shapeField="name"
          shapeValues="text"
          color={stopNameColor}
          size={stopNameSize}
          style={{
            textAnchor: 'top',
            stroke: '#ffffff',
            strokeWidth: 2,
            fontWeight: '500',
          }}
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

      {stopsWithIndex.length > 0 && stopRenderer === 'marker' && showStopName && (
        <PointLayer
          source={stopsWithIndex}
          sourceConfig={{ x: 'lng', y: 'lat' }}
          shapeField="name"
          shapeValues="text"
          color={stopNameColor}
          size={stopNameSize}
          style={{
            textAnchor: 'top',
            textOffset: [0, -((MARKER_SIZE_CONFIG[stopMarkerVariant]?.size ?? 18) / 2 + 4)],
            stroke: '#ffffff',
            strokeWidth: 2,
            fontWeight: '500',
          }}
        />
      )}
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

/** Marker 内容尺寸配置 */
const MARKER_SIZE_CONFIG: Record<string, { size: number; fontSize: number }> = {
  circle: { size: 18, fontSize: 12 },
  dot: { size: 18, fontSize: 10 },
  pin: { size: 24, fontSize: 11 },
  icon: { size: 24, fontSize: 11 },
};

function createMarkerStopContent(
  indexLabel: string,
  fill: string,
  showStopIndex: boolean,
  variant: MarkerVariant,
): React.ReactNode | undefined {
  if (!showStopIndex) return undefined;
  if (variant !== 'circle' && variant !== 'dot') return undefined;

  const config = MARKER_SIZE_CONFIG[variant];

  return (
    <div
      style={{
        width: config.size,
        height: config.size,
        borderRadius: '9999px',
        border: '1.5px solid #ffffff',
        background: fill,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        lineHeight: 1,
        fontWeight: 700,
      }}
    >
      {indexLabel}
    </div>
  );
}

export default RouteLayer;

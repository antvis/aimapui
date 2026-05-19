import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ActiveConfig, LayerEventPayload, LayerSchema, SelectConfig } from '../../schema/types';
import { useScene } from '../../context/SceneContext';
import { PolygonLayer } from '../Layer/PolygonLayer';
import { LineLayer } from '../Layer/LineLayer';
import { PointLayer } from '../Layer/PointLayer';

export type FillColorMapping = 'sequential' | 'diverging' | 'categorical';

export const CHOROPLETH_SEQUENTIAL_COLORS = ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb'] as const;

export const CHOROPLETH_DIVERGING_COLORS = ['#dc2626', '#fca5a5', '#e5e7eb', '#86efac', '#16a34a'] as const;

export const CHOROPLETH_CATEGORICAL_COLORS = ['#2563eb', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#14b8a6', '#f97316', '#64748b'] as const;

export interface FillLayerProps extends Omit<LayerSchema, 'type' | 'source' | 'sourceType' | 'sourceConfig'> {
  source: LayerSchema['source'];
  sourceType?: LayerSchema['sourceType'];

  colorMapping?: FillColorMapping;

  showStroke?: boolean;
  strokeColor?: string;
  strokeWidth?: number;

  hoverEffect?: boolean;
  clickEffect?: boolean;
  stickySelection?: boolean;
  tooltipEffect?: boolean;
  tooltipFields?: string[];
  tooltipTemplate?: string;

  regionIdField?: string;
  highlightStrokeColor?: string;
  highlightStrokeWidth?: number;

  zoomToRegionOnClick?: boolean;
  clickZoomPadding?: number;
  clickZoomDelta?: number;

  onRegionClick?: (payload: LayerEventPayload) => void;
  onDrilldown?: (feature: Record<string, unknown>) => void;

  showLabel?: boolean;
  labelField?: string;
  labelColor?: string;
  labelSize?: number;
  labelAreaThreshold?: number;
  labelHaloWidth?: number;
  minLabelZoom?: number;

  valueField?: string;
  percentageField?: string;
  nameField?: string;
}

/**
 * 填充图组件（填充 + 描边 + 文字）
 */
export function FillLayer({
  source,
  sourceType = 'geojson',
  colorMapping = 'sequential',
  showStroke = true,
  strokeColor = 'rgba(255,255,255,0.30)',
  strokeWidth = 0.5,
  hoverEffect = true,
  clickEffect = true,
  stickySelection = true,
  tooltipEffect = true,
  tooltipFields,
  tooltipTemplate,
  regionIdField = 'name',
  highlightStrokeColor = '#2563eb',
  highlightStrokeWidth = 2,
  zoomToRegionOnClick = true,
  clickZoomPadding = 40,
  clickZoomDelta = 1.2,
  onRegionClick,
  onDrilldown,
  showLabel = false,
  labelField = 'name',
  labelColor = '#0f172a',
  labelSize = 11,
  labelAreaThreshold = 0.00005,
  labelHaloWidth = 2,
  minLabelZoom,
  valueField,
  percentageField,
  nameField,
  color,
  colorField,
  colorValues,
  active,
  select,
  events,
  style,
  ...rest
}: FillLayerProps) {
  const scene = useScene();

  const [hoveredRegionId, setHoveredRegionId] = useState<string | number | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | number | null>(null);
  const [zoom, setZoom] = useState<number>(() => {
    if (!scene) return 0;
    try {
      return scene.getZoom();
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (!scene) return;

    const syncZoom = () => {
      try {
        setZoom(scene.getZoom());
      } catch {
        // ignore
      }
    };

    syncZoom();
    scene.on('zoomchange', syncZoom);

    return () => {
      scene.off('zoomchange', syncZoom);
    };
  }, [scene]);

  const shouldShowLabelByZoom = minLabelZoom === undefined || zoom >= minLabelZoom;

  const mappedColorValues = useMemo(() => {
    if (colorValues) return colorValues;
    switch (colorMapping) {
      case 'diverging':
        return [...CHOROPLETH_DIVERGING_COLORS];
      case 'categorical':
        return [...CHOROPLETH_CATEGORICAL_COLORS];
      case 'sequential':
      default:
        return [...CHOROPLETH_SEQUENTIAL_COLORS];
    }
  }, [colorValues, colorMapping]);

  const tooltipValueField = valueField ?? colorField ?? 'value';
  const tooltipNameField = nameField ?? labelField;
  const resolvedTooltipTemplate = useMemo(
    () => tooltipTemplate ?? buildDefaultTooltipTemplate(tooltipNameField, tooltipValueField, percentageField),
    [tooltipTemplate, tooltipNameField, tooltipValueField, percentageField],
  );

  const defaultActive: ActiveConfig = { color: '#ffffff' };
  const defaultSelect: SelectConfig = { color: '#0f172a' };

  const labelSource = useMemo(
    () => buildLabelSourceFromGeoJSON(source, sourceType, labelField, regionIdField, labelAreaThreshold),
    [source, sourceType, labelField, regionIdField, labelAreaThreshold],
  );

  const handleClick = useCallback((payload: LayerEventPayload) => {
    onRegionClick?.(payload);

    const regionId = resolveRegionId(payload.feature, regionIdField);
    if (regionId !== null && clickEffect) {
      setSelectedRegionId((prev) => {
        if (!stickySelection && prev === regionId) {
          return null;
        }
        return regionId;
      });
    }

    if (payload.feature) {
      onDrilldown?.(payload.feature);
    }

    if (!scene || !zoomToRegionOnClick) return;

    const center =
      Number.isFinite(payload.lng) && Number.isFinite(payload.lat)
        ? ([payload.lng, payload.lat] as [number, number])
        : extractEventCenter(payload.originalEvent);

    if (!center) return;

    try {
      const currentZoom = scene.getZoom();
      const zoomDelta = Math.abs(clickZoomDelta);
      scene.setCenter(center);
      scene.setZoom(currentZoom + zoomDelta);
    } catch {
      // ignore
    }
  }, [onRegionClick, regionIdField, clickEffect, stickySelection, onDrilldown, scene, zoomToRegionOnClick, clickZoomDelta]);

  const handleMouseEnter = useCallback((payload: LayerEventPayload) => {
    if (!hoverEffect) return;
    const regionId = resolveRegionId(payload.feature, regionIdField);
    setHoveredRegionId(regionId);
  }, [hoverEffect, regionIdField]);

  const handleMouseLeave = useCallback(() => {
    if (!hoverEffect) return;
    setHoveredRegionId(null);
  }, [hoverEffect]);

  const resolvedEvents = useMemo(() => {
    const origin = events;
    if (!tooltipEffect) return origin;

    return {
      ...origin,
      enablePopup: origin?.enablePopup ?? true,
      popupTrigger: origin?.popupTrigger ?? 'hover',
      popupFields: origin?.popupFields ?? tooltipFields,
      popupTemplate: origin?.popupTemplate ?? resolvedTooltipTemplate,
    };
  }, [events, tooltipEffect, tooltipFields, resolvedTooltipTemplate]);

  return (
    <>
      <PolygonLayer
        {...rest}
        source={source}
        sourceType={sourceType}
        shape={rest.shape ?? 'fill'}
        color={color ?? '#2563eb'}
        colorField={colorField}
        colorValues={mappedColorValues}
        active={hoverEffect ? (active ?? defaultActive) : active}
        select={clickEffect ? (select ?? defaultSelect) : select}
        events={resolvedEvents}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ opacity: 0.8, ...(style ?? {}) }}
      />

      {showStroke && <LineLayer source={source} sourceType={sourceType} color={strokeColor} size={strokeWidth} zIndex={2} />}

      {hoverEffect && hoveredRegionId !== null && (
        <>
          <LineLayer
            source={source}
            sourceType={sourceType}
            color={withAlpha(highlightStrokeColor, 0.35)}
            size={highlightStrokeWidth + 2}
            filterField={regionIdField}
            filterValues={[hoveredRegionId]}
            zIndex={3}
          />
          <LineLayer
            source={source}
            sourceType={sourceType}
            color={highlightStrokeColor}
            size={highlightStrokeWidth}
            filterField={regionIdField}
            filterValues={[hoveredRegionId]}
            zIndex={4}
          />
        </>
      )}

      {clickEffect && selectedRegionId !== null && (
        <LineLayer
          source={source}
          sourceType={sourceType}
          color={withAlpha(highlightStrokeColor, 0.9)}
          size={Math.max(1.5, highlightStrokeWidth)}
          filterField={regionIdField}
          filterValues={[selectedRegionId]}
          zIndex={5}
        />
      )}

      {showLabel && shouldShowLabelByZoom && (
        <PointLayer
          source={labelSource.data}
          sourceType={labelSource.sourceType}
          sourceConfig={labelSource.sourceConfig}
          shapeField={labelField}
          shapeValues="text"
          color={labelColor}
          size={labelSize}
          style={{
            textAllowOverlap: false,
            stroke: '#ffffff',
            strokeWidth: labelHaloWidth,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
          }}
        />
      )}
    </>
  );
}

function buildDefaultTooltipTemplate(nameField: string, valueField: string, percentageField?: string): string {
  const percentageRow = percentageField
    ? `<tr><td style="padding-right:8px;color:#64748b">占比</td><td style="font-weight:600">{{${percentageField}}}%</td></tr>`
    : '';

  return [
    '<div style="min-width:160px">',
    `<div style="font-weight:700;margin-bottom:6px">{{${nameField}}}</div>`,
    '<table style="font-size:12px;line-height:1.4">',
    `<tr><td style="padding-right:8px;color:#64748b">指标</td><td style="font-weight:600">{{${valueField}}}</td></tr>`,
    percentageRow,
    '</table>',
    '</div>',
  ].join('');
}

function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const full = hex.length === 3
      ? `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
      : hex;

    if (full.length === 6) {
      const r = parseInt(full.slice(0, 2), 16);
      const g = parseInt(full.slice(2, 4), 16);
      const b = parseInt(full.slice(4, 6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
  }

  return color;
}

function resolveRegionId(feature: Record<string, unknown> | undefined, regionIdField: string): string | number | null {
  if (!feature) return null;
  const id = feature[regionIdField] ?? feature.id ?? feature.name;
  if (typeof id === 'string' || typeof id === 'number') return id;
  return null;
}

function buildLabelSourceFromGeoJSON(
  source: LayerSchema['source'],
  sourceType: LayerSchema['sourceType'],
  labelField: string,
  regionIdField: string,
  labelAreaThreshold: number,
): { data: LayerSchema['source']; sourceType: LayerSchema['sourceType']; sourceConfig?: LayerSchema['sourceConfig'] } {
  if (sourceType !== 'geojson' || !isFeatureCollection(source)) {
    return { data: source, sourceType };
  }

  const points = source.features
    .map((feature) => {
      if (!feature || !feature.geometry || !feature.properties) return null;
      const center = getGeometryCentroid(feature.geometry);
      const area = getGeometryArea(feature.geometry);
      if (!center) return null;
      if (area < labelAreaThreshold) return null;

      const properties = feature.properties as Record<string, unknown>;
      return {
        lng: center[0],
        lat: center[1],
        [labelField]: properties[labelField],
        [regionIdField]: properties[regionIdField],
      };
    })
    .filter((item): item is LabelPoint => item !== null);

  return {
    data: points,
    sourceType: 'json',
    sourceConfig: { x: 'lng', y: 'lat' },
  };
}

function isFeatureCollection(source: LayerSchema['source']): source is GeoJSONFeatureCollection {
  if (!source || typeof source !== 'object') return false;
  const maybe = source as { type?: unknown; features?: unknown };
  return maybe.type === 'FeatureCollection' && Array.isArray(maybe.features);
}

function extractEventBounds(evt: unknown): [[number, number], [number, number]] | null {
  const geometry = extractEventGeometry(evt);
  if (!geometry) return null;
  return getGeometryBounds(geometry);
}

function extractEventCenter(evt: unknown): [number, number] | null {
  const geometry = extractEventGeometry(evt);
  if (!geometry) return null;
  return getGeometryCentroid(geometry);
}

function extractEventGeometry(evt: unknown): GeoJSONGeometry | null {
  const e = evt as {
    feature?: { geometry?: GeoJSONGeometry };
    data?: { geometry?: GeoJSONGeometry };
  };

  return e?.feature?.geometry ?? e?.data?.geometry ?? null;
}

function getGeometryBounds(geometry: GeoJSONGeometry): [[number, number], [number, number]] | null {
  const coords = flattenGeometryCoordinates(geometry);
  if (coords.length === 0) return null;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  coords.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  });

  if (!Number.isFinite(minLng) || !Number.isFinite(minLat) || !Number.isFinite(maxLng) || !Number.isFinite(maxLat)) {
    return null;
  }

  return [[minLng, minLat], [maxLng, maxLat]];
}

function getGeometryCentroid(geometry: GeoJSONGeometry): [number, number] | null {
  if (geometry.type === 'Polygon') {
    return getPolygonCentroid(geometry.coordinates[0]);
  }

  if (geometry.type === 'MultiPolygon') {
    let bestArea = 0;
    let bestCentroid: [number, number] | null = null;

    geometry.coordinates.forEach((polygon) => {
      const ring = polygon[0];
      const area = Math.abs(getRingArea(ring));
      if (area > bestArea) {
        bestArea = area;
        bestCentroid = getPolygonCentroid(ring);
      }
    });

    return bestCentroid;
  }

  return null;
}

function getGeometryArea(geometry: GeoJSONGeometry): number {
  if (geometry.type === 'Polygon') {
    return Math.abs(getRingArea(geometry.coordinates[0]));
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.reduce((sum, polygon) => sum + Math.abs(getRingArea(polygon[0])), 0);
  }

  return 0;
}

function getPolygonCentroid(ring: Position[]): [number, number] | null {
  if (!ring || ring.length < 3) return null;

  let areaAcc = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const f = x1 * y2 - x2 * y1;
    areaAcc += f;
    cx += (x1 + x2) * f;
    cy += (y1 + y2) * f;
  }

  const area = areaAcc / 2;
  if (Math.abs(area) < 1e-12) {
    const first = ring[0];
    return first ? [first[0], first[1]] : null;
  }

  return [cx / (6 * area), cy / (6 * area)];
}

function getRingArea(ring: Position[]): number {
  if (!ring || ring.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

function flattenGeometryCoordinates(geometry: GeoJSONGeometry): Position[] {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.flat();
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.flat(2);
  }

  return [];
}

type Position = [number, number];

interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: Position[][];
}

interface GeoJSONMultiPolygon {
  type: 'MultiPolygon';
  coordinates: Position[][][];
}

type GeoJSONGeometry = GeoJSONPolygon | GeoJSONMultiPolygon;

interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties: Record<string, unknown>;
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

type LabelPoint = Record<string, unknown> & {
  lng: number;
  lat: number;
};

export default FillLayer;

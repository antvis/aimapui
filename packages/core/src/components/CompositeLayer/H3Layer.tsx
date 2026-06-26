import React, { useMemo, useState, useCallback } from 'react';
import { cellToBoundary, cellToLatLng, isValidCell } from 'h3-js';
import type { LayerSchema, LayerEventPayload } from '../../schema/types';
import { PolygonLayer } from '../Layer/PolygonLayer';
import { LineLayer } from '../Layer/LineLayer';
import { PointLayer } from '../Layer/PointLayer';

export const H3_SEQUENTIAL_COLORS = ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb'] as const;

export interface H3DataItem {
  [key: string]: unknown;
}

export interface H3LayerProps
  extends Omit<LayerSchema, 'type' | 'source' | 'sourceType' | 'sourceConfig' | 'shape' | 'shapeField' | 'shapeValues'> {
  source: H3DataItem[];
  h3Field?: string;

  showStroke?: boolean;
  strokeColor?: string;
  strokeWidth?: number;

  hoverEffect?: boolean;
  clickEffect?: boolean;

  showLabel?: boolean;
  labelField?: string;
  labelColor?: string;
  labelSize?: number;

  onClick?: (payload: LayerEventPayload) => void;
  onMouseMove?: (payload: LayerEventPayload) => void;
  onMouseEnter?: (payload: LayerEventPayload) => void;
  onMouseLeave?: (payload: LayerEventPayload) => void;
}

export function H3Layer({
  source,
  h3Field = 'h3',
  color,
  colorField,
  colorValues,
  opacity = 0.8,
  showStroke = true,
  strokeColor = 'rgba(255,255,255,0.3)',
  strokeWidth = 0.5,
  hoverEffect = true,
  clickEffect = false,
  showLabel = false,
  labelField,
  labelColor = '#333',
  labelSize = 12,
  active,
  select,
  style,
  onClick,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: H3LayerProps) {
  const geojson = useMemo(() => {
    if (!source || source.length === 0) return { type: 'FeatureCollection' as const, features: [] };

    const features = source
      .filter((item) => {
        const h3Index = item[h3Field];
        return typeof h3Index === 'string' && isValidCell(h3Index);
      })
      .map((item) => {
        const h3Index = item[h3Field] as string;
        const boundary = cellToBoundary(h3Index, true);
        const coords = [...boundary, boundary[0]];

        const properties: Record<string, unknown> = {};
        for (const key of Object.keys(item)) {
          if (key !== h3Field) properties[key] = item[key];
        }
        properties._h3Index = h3Index;

        return {
          type: 'Feature' as const,
          geometry: { type: 'Polygon' as const, coordinates: [coords] },
          properties,
        };
      });

    return { type: 'FeatureCollection' as const, features };
  }, [source, h3Field]);

  const labelSource = useMemo(() => {
    if (!showLabel || !source || source.length === 0) return { type: 'FeatureCollection' as const, features: [] };

    const features = source
      .filter((item) => {
        const h3Index = item[h3Field];
        return typeof h3Index === 'string' && isValidCell(h3Index);
      })
      .map((item) => {
        const h3Index = item[h3Field] as string;
        const [lat, lng] = cellToLatLng(h3Index);

        const properties: Record<string, unknown> = {};
        for (const key of Object.keys(item)) {
          if (key !== h3Field) properties[key] = item[key];
        }
        properties._h3Index = h3Index;

        return {
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [lng, lat] },
          properties,
        };
      });

    return { type: 'FeatureCollection' as const, features };
  }, [source, h3Field, showLabel]);

  const resolvedActive = active ?? (hoverEffect ? { color: '#2563eb' } : false);
  const resolvedSelect = select ?? (clickEffect ? { color: '#1d4ed8' } : false);

  return (
    <>
      <PolygonLayer
        {...rest}
        source={geojson}
        sourceType="geojson"
        color={color}
        colorField={colorField}
        colorValues={colorValues}
        opacity={opacity}
        active={resolvedActive}
        select={resolvedSelect}
        style={style}
        onClick={onClick}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
      {showStroke && (
        <LineLayer
          source={geojson}
          sourceType="geojson"
          color={strokeColor}
          size={strokeWidth}
          style={{ opacity: 1 }}
        />
      )}
      {showLabel && labelField && (
        <PointLayer
          source={labelSource}
          sourceType="geojson"
          shapeField={labelField}
          shapeValues="text"
          color={labelColor}
          size={labelSize}
          style={{
            textAnchor: 'center',
            textOffset: [0, 0],
            fontWeight: 400,
            stroke: '#fff',
            strokeWidth: 2,
          }}
        />
      )}
    </>
  );
}

export default H3Layer;

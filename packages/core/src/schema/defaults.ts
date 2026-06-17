import type {
  AiMapSchema,
  MapSchema,
  LayerSchema,
  ControlSchema,
  ResponsiveSchema,
} from './types';

// ============================================================
// Map 默认值
// ============================================================

export const DEFAULT_MAP: Required<
  Pick<MapSchema, 'basemap' | 'center' | 'zoom' | 'pitch' | 'rotation'>
> = {
  basemap: 'map',
  center: [105, 35],
  zoom: 4,
  pitch: 0,
  rotation: 0,
};

export type ResolvedMapSchema = MapSchema & {
  basemap: NonNullable<MapSchema['basemap']>;
  center: NonNullable<MapSchema['center']>;
  zoom: NonNullable<MapSchema['zoom']>;
  pitch: NonNullable<MapSchema['pitch']>;
  rotation: NonNullable<MapSchema['rotation']>;
};

export function applyMapDefaults(map: MapSchema): ResolvedMapSchema {
  return {
    basemap: map.basemap ?? DEFAULT_MAP.basemap,
    engine: map.engine,
    token: map.token,
    style: map.style,
    center: map.center ?? [...DEFAULT_MAP.center] as [number, number],
    zoom: map.zoom ?? DEFAULT_MAP.zoom,
    pitch: map.pitch ?? DEFAULT_MAP.pitch,
    rotation: map.rotation ?? DEFAULT_MAP.rotation,
    minZoom: map.minZoom,
    maxZoom: map.maxZoom,
    bounds: map.bounds,
    gestureConfig: map.gestureConfig,
  };
}

// ============================================================
// Layer 默认值
// ============================================================

let layerIdCounter = 0;

export function generateLayerId(): string {
  return `aimap-layer-${++layerIdCounter}`;
}

export function applyLayerDefaults(layer: LayerSchema): LayerSchema {
  return {
    id: layer.id ?? generateLayerId(),
    type: layer.type,
    name: layer.name ?? layer.type,
    visible: layer.visible ?? true,
    zIndex: layer.zIndex ?? 0,
    minZoom: layer.minZoom,
    maxZoom: layer.maxZoom,
    autoFit: layer.autoFit ?? false,
    source: layer.source,
    sourceType: layer.sourceType,
    sourceConfig: layer.sourceConfig,
    color: layer.color,
    colorField: layer.colorField,
    colorValues: layer.colorValues,
    size: layer.size,
    sizeField: layer.sizeField,
    sizeValues: layer.sizeValues,
    shape: layer.shape,
    shapeField: layer.shapeField,
    shapeValues: layer.shapeValues,
    style: layer.style,
    filterField: layer.filterField,
    filterValues: layer.filterValues,
    animate: layer.animate,
    active: layer.active,
    select: layer.select,
    events: layer.events,
  };
}

// ============================================================
// Control 默认值
// ============================================================

const CONTROL_DEFAULT_POSITIONS: Record<string, ControlSchema['position']> = {
  zoom: 'topright',
  scale: 'bottomleft',
  fullscreen: 'topright',
  geoLocate: 'topright',
  mapTheme: 'topright',
  mouseLocation: 'bottomright',
  exportImage: 'topright',
  layerSwitch: 'topright',
  draw: 'topright',
};

export function applyControlDefaults(control: ControlSchema): ControlSchema {
  return {
    type: control.type,
    position: control.position ?? CONTROL_DEFAULT_POSITIONS[control.type] ?? 'topright',
    options: control.options,
  };
}

// ============================================================
// Responsive 默认值
// ============================================================

export const DEFAULT_RESPONSIVE: Required<Pick<ResponsiveSchema, 'breakpoint'>> = {
  breakpoint: 768,
};

export type ResolvedResponsiveSchema = ResponsiveSchema & {
  breakpoint: NonNullable<ResponsiveSchema['breakpoint']>;
};

export function applyResponsiveDefaults(
  responsive?: ResponsiveSchema,
): ResolvedResponsiveSchema {
  return {
    breakpoint: responsive?.breakpoint ?? DEFAULT_RESPONSIVE.breakpoint,
    mobile: responsive?.mobile,
  };
}

// ============================================================
// AiMapSchema 默认值
// ============================================================

export function applySchemaDefaults(schema: AiMapSchema): AiMapSchema {
  return {
    map: applyMapDefaults(schema.map) as MapSchema,
    layers: (schema.layers ?? []).map(applyLayerDefaults),
    controls: (schema.controls ?? []).map(applyControlDefaults),
    interactions: schema.interactions ?? [],
    legends: schema.legends ?? [],
    responsive: schema.responsive
      ? applyResponsiveDefaults(schema.responsive)
      : undefined,
    events: schema.events,
  };
}
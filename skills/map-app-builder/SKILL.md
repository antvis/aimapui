---
name: map-app-builder
description: >-
  Build production-ready map applications using @antv/aimapui. Covers layout architecture, layer z-index hierarchy, UI overlay stacking, theme system, interaction patterns, and data-type-to-component mapping. Use this skill whenever the user asks to create a map application, build a geographic visualization, design a map dashboard, or needs guidance on aimapui component selection, layer ordering, or map UI architecture. Triggers on: "create a map app", "build a map", "map visualization", "geographic dashboard", "map layout", "layer hierarchy", "map theme", "which aimapui component for X data".
---

# Map Application Builder

Build complete map applications with @antv/aimapui following established conventions for layout, layering, theming, and interaction.

## Prerequisites

```bash
pnpm add @antv/aimapui @antv/l7 @antv/l7-maps
```

```tsx
import '@antv/aimapui/style.css'; // Required — controls, popups, legends won't render without it
```

L7 version must be ≥ 2.28.14.

## Scene References (load as needed)

根据应用场景加载对应的详细指南，SKILL.md 本体提供通用规范，reference 文件提供场景专属的布局、组件选型和交互模式。

| 场景 | Reference File | When to load |
|------|---------------|-------------|
| PC 分析地图 / 数据仪表盘 / 监控大屏 | [pc-analytics.md](references/pc-analytics.md) | 桌面端数据分析、多图层叠加、侧边面板联动、精细 hover/click 交互 |
| 移动端地图应用 | [mobile-map.md](references/mobile-map.md) | 手机/平板端、BottomSheet 面板、MobileToolbar、触屏 tap 交互、手势友好设计 |
| 旅游地图 / 景区导览 / 城市探索 | [vertical-tourism.md](references/vertical-tourism.md) | POI 标注、游览路线串联、Maki 图标映射、图文混排详情面板、分类筛选 |

## 1. Base Layout

Every map app follows this DOM structure:

```tsx
<div style={{ position: 'relative', width: '100%', height: '100vh' }}>
  {/* Map canvas — fills entire container */}
  <AiMap
    map={{ basemap: 'gaode', center: [120, 30], zoom: 5, style: 'dark' }}
    autoFit
    onSceneReady={handleSceneReady}
  >
    {/* Layers ordered by zIndex (see §2) */}
    {/* Controls rendered inside AiMap or via ControlContainer */}
  </AiMap>

  {/* DOM overlays — positioned absolutely above map canvas */}
  <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }}>
    {/* Title bar, side panels, floating cards */}
  </div>
</div>
```

Key rules:
- Parent container **must** have explicit height (`100vh`, `600px`, etc.)
- `map` and `schema` props are mutually exclusive — never pass both
- Use `autoFit` when data bounds should determine initial viewport
- Use `onSceneReady` to access the L7 Scene instance for advanced operations

## 2. Layer Z-Index Hierarchy

Layers are stacked bottom-to-top. All composite layers use **relative offsets** from their base `zIndex` prop.

### Global Layer Stack

| Z-Index Range | Category | Components | Purpose |
|---------------|----------|------------|---------|
| -3 ~ -2 | Basemap overlay | `SatelliteLayer` | Satellite imagery beneath all data |
| -1 | Environmental coverage | `ImageLayer` (cloud/radar), `FillLayer` (rain) | Continuous weather/environmental data |
| 0 | Base data | `FillLayer`, `H3Layer`, `HexagonLayer`, `RouteLayer` path | Core geographic features |
| N+2 | Stroke/border | `LineLayer` (composite internal) | Region outlines, always above fill |
| N+3~4 | Hover feedback | `LineLayer` (composite internal) | Only when `hoverEffect=true` |
| N+5 | Select feedback | `LineLayer` (composite internal) | Only when `clickEffect=true` |
| 6~9 | Point features | `PointLayer`, `BubbleLayer`, `IconLayer`, `MarkerClusterLayer` | Discrete point data |
| N+10 | Labels/text | `PointLayer` (text shape), `GlyphLayer` | Text always above graphics |
| 20+ | Route stops/markers | `RouteLayer` stops, `Marker` | Path nodes above path lines |

### Composite Layer Internal Offsets

When a composite layer receives `zIndex=N`, its internal sub-layers are automatically offset:

```
FillLayer(zIndex=N)
├── PolygonLayer  fill        → N
├── LineLayer     stroke      → N+2
├── LineLayer     hover halo  → N+3  (hoverEffect only)
├── LineLayer     hover edge  → N+4  (hoverEffect only)
├── LineLayer     select edge → N+5  (clickEffect only)
└── PointLayer    label       → N+10 (showLabel only)
```

**Rule**: Never use absolute zIndex values inside composite layers. Always compute as `(baseZIndex ?? 0) + offset`.

## 3. UI Overlay Stacking (DOM z-index)

DOM elements float above the L7 canvas and use a separate z-index scale:

| z-index | Element Type | Position Convention |
|---------|-------------|-------------------|
| 1000 | Control containers `.l7-control-anchor` | Map edges/corners |
| 1001 | ZoomControl / ResetViewControl | `bottomright` |
| 1002 | MapThemeControl / LayerSwitchControl | `bottomleft` |
| 1003 | ScaleControl / MouseLocationControl | `bottomleft` |
| 1004 | FullscreenControl / GeoLocateControl | `topright` |
| 1005 | LogoControl / Attribution | `bottomright` |
| 2000 | LegendControl | `bottomleft` (above zoom) |
| 3000 | Tooltip | Follows cursor |
| 4000 | Popup | Anchored to geo-coordinate |
| 5000 | Marker (DOM) | Custom DOM elements |
| 6000 | DrawControl preview | Editing temporaries |
| 9999 | Modal / Dialog | Full-screen overlay |

**Rule**: All custom DOM panels (title bars, sidebars, floating cards) must use `zIndex >= 1000`. Never use values like 30 or 50 — they will be occluded by L7 internals.

## 4. Theme System

### Built-in Themes

```tsx
<MapThemeControl position="bottomleft" />
```

Supports `dark`, `light`, `satellite`, and custom themes via `GAODE_THEME_PRESETS` / `OPENFREEMAP_THEME_PRESETS`.

### CSS Variable Integration

All aimapui components respect these CSS variables for dark/light adaptation:

| Variable | Dark Value | Light Value | Usage |
|----------|-----------|-------------|-------|
| `--color-surface` | `#1e293b` | `#ffffff` | Popup/panel backgrounds |
| `--color-on-surface` | `#f1f5f9` | `#0f172a` | Primary text |
| `--color-outline-variant` | `#475569` | `#cbd5e1` | Borders/dividers |

Custom panels should use these variables instead of hardcoded colors:

```tsx
<div style={{
  background: 'var(--color-surface)',
  color: 'var(--color-on-surface)',
  border: '1px solid var(--color-outline-variant)',
}}>
```

### Component Defaults for Pure Display

All composite layers default to **pure display mode** (no interaction). Enable interactions explicitly:

| Prop | Default | When to enable |
|------|---------|---------------|
| `hoverEffect` | `false` | User needs hover highlight feedback |
| `clickEffect` | `false` | User needs click selection feedback |
| `tooltipEffect` | `false` | Using built-in tooltip (vs custom onMouseMove) |
| `zoomToRegionOnClick` | `false` | Drill-down / region focus scenarios |
| `stickySelection` | `false` | Multi-select or persistent selection |
| `showStopPopup` (RouteLayer) | `false` | Route stop detail popups |
| `glow` (RouteLayer) | `false` | Decorative route glow effect |

When enabling hover/click, transitions use `duration: 150` by default for smooth state changes.

## 5. Interaction Patterns

### Tooltip (Lightweight, Follows Cursor)

```tsx
<Tooltip visible={visible} lng={lng} lat={lat} items={[{ label: 'Value', value: '42mm' }]} />
```

Use for: real-time hover data display, lightweight hints.

### Popup (Structured, Anchored)

```tsx
// Quick presets
<Popup longitude={lng} latitude={lat} layout="card" header={{ title: 'Station A' }} attributes={[...]} />

// Layout options: 'simple' | 'card' | 'rich'
// simple → compact size, text-only
// card   → standard size, header + attributes
// rich   → detailed size, cover image + header + attributes + actions
```

Click blank area to close: handled automatically via L7 `unclick` event.

### Marker (DOM Element at Geo Position)

```tsx
<Marker longitude={lng} latitude={lat} anchor="center" content={<img src="..." />} />
```

Use for: animated markers, complex DOM content at fixed geo positions.

### Layer Events

All layers support `onClick`, `onMouseMove`, `onMouseEnter`, `onMouseLeave`:

```tsx
<FillLayer
  onMouseMove={(payload) => {
    const feature = payload.feature;
    // Access all original GeoJSON properties including non-rendering fields
  }}
  onMouseLeave={() => hideTooltip()}
/>
```

GeoJSON sources preserve **all** original feature properties in event payloads (not just rendering fields).

## 6. Data Type → Component Mapping

Choose the right component based on your data type and visualization goal:

### Point Data

| Data Characteristic | Component | Key Props |
|--------------------|-----------|-----------|
| Simple locations | `PointLayer` | `sourceType="json"`, `sourceConfig={{ x: 'lng', y: 'lat' }}` |
| Sized by value | `BubbleLayer` | `sizeField`, `sizeRange=[min,max]` or `sizeValues` |
| Categorized icons | `IconLayer` | `iconField`, `iconMap`, `accuracy='precise'\|'general'` |
| Text labels with icons | `GlyphLayer` | `iconField`, `labelField`, Material Symbols |
| Many overlapping points | `MarkerClusterLayer` | Auto-clustering with count encoding |
| Precise vs fuzzy location | `IconLayer` | `accuracy='precise'` (pin) or `'general'` (circle) |

### Line Data

| Data Characteristic | Component | Key Props |
|--------------------|-----------|-----------|
| Routes/paths | `RouteLayer` | `path`, `routeType`, `animate`, `colorScheme` |
| OD flows | `ArcFlowLayer` | `source`, `animate`, `showNodes` |
| Trajectories/boundaries | `LineLayer` | `sourceType="json"`, `sourceConfig={{ coordinates: 'path' }}` |

### Area/Polygon Data

| Data Characteristic | Component | Key Props |
|--------------------|-----------|-----------|
| Choropleth (value-colored regions) | `FillLayer` | `colorField`, `colorScheme='sequential'\|'diverging'\|'categorical'` |
| Administrative drill-down | `ChinaDistrict` | `drillEnabled`, `businessData` |
| H3 hexagonal grid | `H3Layer` | `source` (H3 index array), `colorScheme` |
| Hexagonal aggregation | `HexagonLayer` | `weightField`, `mode='2d'\|'3d'`, `colorScheme` |
| Weather/environmental fill | `FillLayer` | `zIndex=-1`, `hoverEffect=false` |

### Raster/Image Data

| Data Characteristic | Component | Key Props |
|--------------------|-----------|-----------|
| Satellite imagery | `SatelliteLayer` | `provider`, `opacity` |
| Cloud/radar composites | `ImageLayer` | `sourceType="image"`, `sourceConfig={{ parser: { type: 'image', extent } }}` |
| GeoTIFF scientific data | `TiffRasterLayer` | `bandIndex`, `rampColors` |

### Color Scheme Presets

All area/grid layers support semantic color schemes (ColorBrewer-based, colorblind-safe):

```tsx
import { getColorPalette, SEQUENTIAL_COLORS, DIVERGING_COLORS, CATEGORICAL_COLORS } from '@antv/aimapui';

// Sequential: monotonic increase/decrease (temperature, rainfall)
<FillLayer colorScheme="sequential" />

// Diverging: bipolar with neutral midpoint (anomaly, deviation)
<FillLayer colorScheme="diverging" />

// Categorical: discrete classes (land use, party affiliation)
<FillLayer colorScheme="categorical" />
```

## 7. Controls Placement Guide

| Control | Recommended Position | Notes |
|---------|---------------------|-------|
| `ZoomControl` | `bottomright` | Default |
| `ResetViewControl` | `bottomright` | Below zoom, resets center/zoom/pitch/rotation |
| `MapThemeControl` | `bottomleft` | Theme switching |
| `ScaleControl` | `bottomleft` | Distance reference |
| `FullscreenControl` | `topright` | Fullscreen toggle |
| `GeoLocateControl` | `topright` | GPS location |
| `LegendControl` | `bottomleft` | Above zoom controls |
| `LayerSwitchControl` | `bottomleft` | Layer visibility toggles |
| `DrawControl` | `topleft` | Interactive drawing |
| `ExportImageControl` | `topright` | Screenshot export |

Controls placed at edges keep focus on the map center. Use familiar icons; add text labels for non-obvious functions.

## 8. Legend Selection

| Data Encoding | Legend Component |
|--------------|-----------------|
| Discrete categories | `LegendCategories` |
| Continuous gradient | `LegendRamp` |
| Bipolar diverging | `LegendDiverging` |
| Threshold steps | `LegendThreshold` |
| Proportional size | `LegendSize` / `LegendProportion` |
| Line width | `LegendLineWidth` |
| Icon categories | `LegendIcon` |

## Complete Example: Typhoon Tracking App

```tsx
import { AiMap, FillLayer, LineLayer, PointLayer, Marker, Tooltip, Popup,
         ZoomControl, MapThemeControl, LegendCategories, SatelliteLayer,
         ResetViewControl } from '@antv/aimapui';
import '@antv/aimapui/style.css';

<AiMap map={{ basemap: 'gaode', center: [127.6, 20.8], zoom: 4, pitch: 12, style: 'dark' }}>
  {/* z=-2: Satellite basemap overlay */}
  <SatelliteLayer zIndex={-2} opacity={0.6} />

  {/* z=-1: Rainfall fill (environmental coverage) */}
  <FillLayer source={rainGeoJSON} colorField="color" colorValues={rainColors}
             zIndex={-1} hoverEffect={false} />

  {/* z=0: Wind circles (base data) */}
  <FillLayer source={windPolygons} colorField="level" zIndex={0} />

  {/* z=1: Track lines */}
  <LineLayer source={trackSegments} colorField="grade" zIndex={1} />

  {/* z=2: Selected forecast path */}
  <LineLayer source={activeForecast} zIndex={2} />

  {/* z=6: Track nodes (point features) */}
  <PointLayer source={nodes} colorField="grade" zIndex={6} />

  {/* z=7: Forecast points */}
  <PointLayer source={forecastPoints} zIndex={7} />

  {/* Controls */}
  <ZoomControl position="bottomright" />
  <ResetViewControl position="bottomright" initialView={{ center: [127.6, 20.8], zoom: 4 }} />
  <MapThemeControl position="bottomleft" />
</AiMap>
```

## Common Pitfalls

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Missing `style.css` import | Controls/popups unstyled | Add `import '@antv/aimapui/style.css'` |
| No container height | Map invisible | Set explicit height on parent |
| Absolute zIndex in composite internals | Layers misordered when base zIndex changes | Use `(rest.zIndex ?? 0) + offset` |
| DOM panel zIndex < 1000 | Panel hidden behind L7 elements | Use zIndex ≥ 1000 |
| Hardcoded colors in panels | Broken in light/dark theme switch | Use CSS variables |
| `hoverEffect=true` on data viz layers | Fill color changes distort data reading | Keep `false` unless interaction needed |
| Inline arrow functions returning objects in JSX | esbuild parse error | Extract to `useCallback` |
| Unclosed JSX comments `{/* ... */` | Transform failed | Ensure closing `}` |

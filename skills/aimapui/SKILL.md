---
name: aimapui
description: >
  Build React map visualizations with @antv/aimapui, a Schema-driven component library on L7.
  Use when: (1) Creating map applications with AiMap container, (2) Adding layers (Point/Line/Polygon/Heatmap/Raster/Image),
  (3) Using composite layers (Bubble/Route/Icon/Glyph/Choropleth/3DBar/Flow),
  (4) Configuring visual mappings (color/size/shape), (5) Adding controls, legends, interactions (Marker/Popup/Tooltip),
  (6) Schema/JSON-driven map generation for AI, (7) Mobile-responsive map layouts.
  Triggers: "aimapui", "AiMap", "地图可视化", "map layer", "图层", "Schema 地图", "L7 React".
version: "0.1.0"
---

# aimapui

React map visualization library built on L7. Supports both JSX component mode and Schema-driven mode.

## Version

- **@antv/aimapui**: `0.1.0`
- **@antv/aimapui-cli**: `0.1.0`

## Install

```bash
npm install @antv/aimapui @antv/l7 @antv/l7-maps
# or
pnpm add @antv/aimapui @antv/l7 @antv/l7-maps
```

> **注意:** 使用组件前必须引入样式文件 `import '@antv/aimapui/style.css'`，否则控件、弹窗、图例等样式不生效。

## Quick Start

```tsx
import { AiMap, PointLayer } from '@antv/aimapui';
import '@antv/aimapui/style.css';

<AiMap map={{ basemap: 'gaode', center: [121.4, 31.2], zoom: 12, style: 'dark' }}>
  <PointLayer
    source={data}
    sourceType="json"
    sourceConfig={{ x: 'lng', y: 'lat' }}
    color="#5B8FF9"
    size={8}
    shape="circle"
  />
</AiMap>
```

## Architecture

- **AiMap** — Container component, manages Scene/Map lifecycle
- **Layers** — 6 base types: `PointLayer`, `LineLayer`, `PolygonLayer`, `HeatmapLayer`, `RasterLayer`, `ImageLayer`
- **Composite Layers** — Business-ready: `BubbleLayer`, `RouteLayer`, `IconLayer`, `GlyphLayer`, `ChoroplethLayer`, `ColumnLayer`, `FlowLayer`, etc.
- **Controls** — `ZoomControl`, `ScaleControl`, `FullscreenControl`, etc. (8 types, 12 positions)
- **Interactions** — `Marker`, `Popup`, `Tooltip`
- **Legends** — `CategoriesLegend`, `RampLegend`, `SizeLegend`, etc. (8 types)
- **Schema Mode** — Render entire map from a single `AiMapSchema` JSON object

## Reference Docs (load as needed)

| Topic | File | When to load |
|-------|------|-------------|
| AiMap container & MapSchema | [aimap-container.md](references/core/aimap-container.md) | Creating/configuring map |
| EventBus | [event-bus.md](references/core/event-bus.md) | Cross-component events |
| Schema system | [schema-system.md](references/schema/schema-system.md) | Schema/AI-driven maps |
| Data sources | [data-source.md](references/data/data-source.md) | JSON/GeoJSON/CSV/Raster data |
| Base layers | [base-layers.md](references/layers/base-layers.md) | Point/Line/Polygon/Heatmap/Raster/Image |
| Composite layers | [composite-layers.md](references/composite/composite-layers.md) | Bubble/Route/Icon/Glyph/Choropleth/Flow |
| Color/Size/Shape mapping | [mapping.md](references/visual/mapping.md) | Data-driven visuals |
| Style config | [style.md](references/visual/style.md) | Opacity/blend/style passthrough |
| Marker/Popup/Tooltip | [interaction.md](references/interaction/interaction.md) | Interactive overlays |
| Controls | [controls.md](references/controls/controls.md) | Zoom/Scale/Fullscreen/etc. |
| Legends | [legend-components.md](references/legend/legend-components.md) | Map legends |
| Mobile components | [mobile-components.md](references/mobile/mobile-components.md) | Mobile-responsive UI |

## Key Patterns

### Visual Mapping

```tsx
<PointLayer colorField="type" colorValues={['#f00','#0f0','#00f']} sizeField="value" sizeValues={[4,20]} />
```

### Schema Mode

```tsx
import { AiMap } from '@antv/aimapui';
const schema = { map: { basemap: 'gaode', center: [121,31], zoom: 12 }, layers: [...], controls: [...] };
<AiMap schema={schema} />
```

### Composite Layer (Icon)

```tsx
<IconLayer
  source={data} sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="type" iconMap={{ shop: 'shop.svg', cafe: 'cafe.svg' }}
  iconSize={20} iconAnchor="bottom"
  labelAnchor="top" labelOffset={[0, -10]}
  labelColor="#333" labelSize={12}
/>
```

### Composite Layer (Glyph)

```tsx
<GlyphLayer
  source={data} sourceConfig={{ x: 'lng', y: 'lat' }}
  iconFontFamily="material-symbols" iconField="icon"
  iconColor="#06b6d4" iconSize={20}
  labelAnchor="top" labelOffset={[0, -20]}
  labelField="name" labelColor="#e2e8f0" labelSize={11}
/>
```

### Composite Layer (Route — 多路径模式)

```tsx
// 静态路径（直线/弧线）
<RouteLayer path={coords} stops={stops} routeType="arc" color="#8b5cf6" glow animate />

// 交通路线查询（驾车/步行/骑行/公交）
<RouteLayer
  stops={[
    { lng: 116.397, lat: 39.909, name: '起点' },
    { lng: 116.474, lat: 39.877, name: '终点' },
  ]}
  routeType="driving"
  onRouteQuery={async ({ origin, destination, waypoints, routeType }) => {
    const res = await fetchRoute(origin, destination, routeType);
    return { path: res.coordinates, info: { distance: res.distance, duration: res.duration } };
  }}
  color="#10b981" glow animate
/>
```

---
name: aimapui
description: >
  Build React map visualizations with @antv/aimapui, a Schema-driven component library on L7.
  Use when: (1) Creating map applications with AiMap container, (2) Adding layers (Point/Line/Polygon/Heatmap/Raster/Image),
  (3) Using composite layers (Bubble/Route/ArcFlow/Icon/Glyph/ChinaDistrict/MarkerCluster/Hexagon/Fill/Satellite/TiffRaster),
  (4) Configuring visual mappings (color/size/shape), (5) Adding controls, legends, interactions (Marker/Popup/Tooltip),
  (6) Schema/JSON-driven map generation for AI, (7) Mobile-responsive map layouts, (8) Maki icon utilities for map markers,
  (9) Interactive drawing/editing with DrawControl (point/line/polygon/rectangle/circle),
  (10) Image georeferencing with ImageCalibrationControl.
  Triggers: "aimapui", "AiMap", "地图可视化", "map layer", "图层", "Schema 地图", "L7 React", "Maki", "弧线流向", "行政区划", "ChinaDistrict", "DrawControl", "绘制控件", "ImageCalibrationControl", "图片配准".
version: "0.2.2"
---

# aimapui

React map visualization library built on L7. Supports both JSX component mode and Schema-driven mode.

## Version

- **@antv/aimapui**: `0.2.2`
- **@antv/aimapui-cli**: `0.2.2`

## Install

```bash
npm install @antv/aimapui @antv/l7 @antv/l7-maps
# or
pnpm add @antv/aimapui @antv/l7 @antv/l7-maps
```

> **注意:** 使用组件前必须引入样式文件 `import '@antv/aimapui/style.css'`，否则控件、弹窗、图例等样式不生效。

### CDN 引用（IIFE）

```html
<script src="https://unpkg.com/@antv/l7"></script>
<script src="https://unpkg.com/@antv/l7-maps"></script>
<script src="https://unpkg.com/@antv/aimapui/dist/index.iife.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@antv/aimapui/dist/style.css" />
```

## Quick Start

```tsx
import { AiMap, PointLayer } from '@antv/aimapui';
import '@antv/aimapui/style.css';

<AiMap map={{ basemap: 'gaode', center: [121.4, 31.2], zoom: 12, style: 'dark' }} autoFit>
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

- **AiMap** — Container component, manages Scene/Map lifecycle; supports `autoFit` for automatic viewport fitting
- **Layers** — 6 base types: `PointLayer`, `LineLayer`, `PolygonLayer`, `HeatmapLayer`, `RasterLayer`, `ImageLayer`
- **Composite Layers** — Business-ready (11 types): `BubbleLayer`, `RouteLayer`, `ArcFlowLayer`, `IconLayer`, `GlyphLayer`, `ChinaDistrict`, `MarkerClusterLayer`, `HexagonLayer`, `FillLayer`, `SatelliteLayer`, `TiffRasterLayer`
- **Controls** — `ZoomControl`, `ScaleControl`, `FullscreenControl`, `GeoLocateControl`, `MapThemeControl`, `MouseLocationControl`, `ExportImageControl`, `LayerSwitchControl`, `LegendControl`, `LogoControl`, `DrawControl`, `ImageCalibrationControl` (12 types, 12 positions)
- **Interactions** — `Marker`, `Popup`, `Tooltip` + Maki icon utilities (`makiIconUrl`, `makiPinUrl`, `createMakiIconMap`, `createMakiPinMap`, `MAKI_ICONS`, `MAKI_ICON_NAMES`)
- **Legends** — `LegendCategories`, `LegendRamp`, `LegendDiverging`, `LegendThreshold`, `LegendSize`, `LegendLineWidth`, `LegendProportion`, `LegendIcon` (8 types)
- **Mobile** — `BottomSheet`, `MobileToolbar`, `MobileSheetLegend`, `SearchBar`
- **Hooks** — `useResponsive`, `useScene`, `useMapPosition`, `useEventBus`, `useTheme`
- **Utilities** — `ErrorBoundary`, `ResponsiveProvider`, `ThemeProvider`, `EventBus`
- **Schema Mode** — Render entire map from a single `AiMapSchema` JSON object
- **Build Formats** — ESM, CJS, IIFE (CDN), TypeScript declarations

## Reference Docs (load as needed)

| Topic | File | When to load |
|-------|------|-------------|
| AiMap container & MapSchema | [aimap-container.md](references/core/aimap-container.md) | Creating/configuring map |
| Basemap factory | [basemap-factory.md](references/core/basemap-factory.md) | Custom basemap providers |
| EventBus | [event-bus.md](references/core/event-bus.md) | Cross-component events |
| Schema system | [schema-system.md](references/schema/schema-system.md) | Schema/AI-driven maps |
| Data sources | [data-source.md](references/data/data-source.md) | JSON/GeoJSON/CSV/Raster data |
| Base layers | [base-layers.md](references/layers/base-layers.md) | Point/Line/Polygon/Heatmap/Raster/Image |
| Composite layers | [composite-layers.md](references/composite/composite-layers.md) | Bubble/Route/Icon/Glyph/Choropleth/Flow |
| Color/Size/Shape mapping | [mapping.md](references/visual/mapping.md) | Data-driven visuals |
| Style config | [style.md](references/visual/style.md) | Opacity/blend/style passthrough |
| Marker/Popup/Tooltip | [interaction.md](references/interaction/interaction.md) | Interactive overlays |
| Controls | [controls.md](references/controls/controls.md) | Zoom/Scale/Fullscreen/etc. |
| DrawControl | [draw-control.md](references/controls/draw-control.md) | Interactive drawing/editing (point/line/polygon/rectangle/circle) |
| ImageCalibrationControl | [image-calibration-control.md](references/controls/image-calibration-control.md) | Image georeferencing with corner handles |
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

### Composite Layer (Icon with Maki)

```tsx
import { IconLayer, createMakiIconMap } from '@antv/aimapui';

<IconLayer
  source={data} sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="type"
  iconMap={createMakiIconMap(['cafe', 'restaurant', 'bus'], { size: 32, fill: '#2563eb' })}
  iconAnchor="bottom"
  labelField="name" labelAnchor="top" labelOffset={[0, -10]}
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

### Composite Layer (ChinaDistrict — 行政区划 + 业务数据绑定)

```tsx
import { ChinaDistrict } from '@antv/aimapui';
import type { BusinessDataItem } from '@antv/aimapui';

// 按名称匹配（最常用）
const GDP_DATA: BusinessDataItem[] = [
  { name: '广东省', value: 145847 },
  { name: '江苏省', value: 128222 },
  { name: '山东省', value: 92069 },
];

<ChinaDistrict
  data={GDP_DATA}
  joinField="name"          // GeoJSON feature.properties 中的匹配字段
  dataJoinField="name"      // 业务数据中的匹配字段
  valueField="value"        // 用于色阶映射的数值字段
  colors={['#DBEAFE', '#3B82F6', '#1E3A8A']}
/>

// 按行政区划编码匹配（更精确）
<ChinaDistrict
  data={[{ code: '440000', amount: 8900 }, { code: '320000', amount: 7600 }]}
  joinField="adcode"        // 组件自动处理 gb→adcode 转换
  dataJoinField="code"
  valueField="amount"
/>

// 业务字段名与 GeoJSON 不同
<ChinaDistrict
  data={[{ province: '广东省', revenue: 999 }]}
  joinField="name"           // GeoJSON 里的字段
  dataJoinField="province"   // 业务数据里的字段
  valueField="revenue"       // 色阶用 revenue
/>
```

> **内置 GeoJSON 可匹配字段：** `name`（中文全称如"广东省"）、`gb`（9位国标码如"156440000"）。
> 使用 adcode 匹配时传 6 位码即可（如 "440000"），组件自动去除 "156" 前缀。
> 内置数据源：`DEFAULT_PROVINCE_SOURCE`（34省）、`DEFAULT_CITY_SOURCE`（375市）、`DEFAULT_DISTRICT_SOURCE`（2891区县）。

### Composite Layer (ArcFlow — OD 弧线流向图)

```tsx
import { ArcFlowLayer } from '@antv/aimapui';

<ArcFlowLayer
  source={odData}
  sourceConfig={{ x: 'fromLng', y: 'fromLat', x1: 'toLng', y1: 'toLat' }}
  color="#5B8FF9"
  colorMode="gradient"
  gradientColors={['#2563eb', '#10b981']}
  lineWidth={2}
  animate animateSpeed={1} animateTrailLength={0.3}
  showNodes
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

### Controls (LegendControl + LogoControl)

```tsx
import { LegendControl, LogoControl, LegendCategories } from '@antv/aimapui';

<AiMap map={{ basemap: 'gaode', center: [116, 39], zoom: 10 }}>
  <LegendControl position="bottomleft">
    <LegendCategories title="类型" labels={['A', 'B']} colors={['#f00', '#00f']} />
  </LegendControl>
  <LogoControl position="bottomleft" logos={[{ src: '/logo.png', alt: 'Logo', href: '/' }]} />
</AiMap>
```

### Maki Icon Utilities

```tsx
import { MAKI_ICON_NAMES, makiIconUrl, makiPinUrl, createMakiIconMap, createMakiPinMap } from '@antv/aimapui';

// 单个图标 SVG data URL
const cafeUrl = makiIconUrl('cafe', { size: 32, fill: '#333' });

// Pin 样式（带水滴底座）
const cafePinUrl = makiPinUrl('cafe', { size: 40, fill: '#2563eb' });

// 批量生成 { name: dataUrl } 映射表（用于 IconLayer.iconMap）
const iconMap = createMakiIconMap(['cafe', 'bus', 'hospital']);
const pinMap = createMakiPinMap(['cafe', 'bus', 'hospital'], { fill: '#10b981' });
```

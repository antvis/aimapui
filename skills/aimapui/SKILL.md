---
name: aimapui
description: React map visualization library @antv/aimapui. Use whenever the user wants to create maps, map layers, geographic visualizations, or map controls — covers AiMap container, 6 base layers, 12 composite layers, 13 controls, interactions, legends, mobile components, and schema-driven mode. Schema-driven, L7-based.
version: 0.3.5
---

# aimapui

**触发条件：** 用户需要创建地图、地图可视化、地理数据展示时，必须使用此 skill。覆盖 AiMap 容器、6 种基础图层（Point/Line/Polygon/Heatmap/Raster/Image）、12 种复合图层（行政区划下钻/气泡/路径/弧线流向/图标/字标/聚合/蜂窝/填充/卫星/GeoTIFF/H3）、13 种控件。特殊控件：DrawControl（交互绘制）、ImageCalibrationControl（图片配准/地图校准）、AnnotationControl（标注）。

## Version

见 frontmatter `version` 字段。当前：`@antv/aimapui` / `@antv/aimapui-cli` → **0.3.3**

## Install

```bash
npm install @antv/aimapui @antv/l7 @antv/l7-maps
# or
pnpm add @antv/aimapui @antv/l7 @antv/l7-maps
```

> **注意:** `@antv/l7` 版本必须 **≥ 2.28.14**，低于此版本会导致部分功能异常（如控件渲染、动态 import 等）。
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
- **Composite Layers** — Business-ready (12 types): `BubbleLayer`, `RouteLayer`, `ArcFlowLayer`, `IconLayer`, `GlyphLayer`, `ChinaDistrict`, `MarkerClusterLayer`, `HexagonLayer`, `FillLayer`, `SatelliteLayer`, `TiffRasterLayer`, `H3Layer`
- **Controls** — `ZoomControl`, `ScaleControl`, `FullscreenControl`, `GeoLocateControl`, `MapThemeControl`, `MouseLocationControl`, `ExportImageControl`, `LayerSwitchControl`, `LegendControl`, `LogoControl`, `DrawControl`, `ImageCalibrationControl`, `AnnotationControl` (13 types, 12 positions)
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
| Base layers (index + quick ref) | [index.md](references/layers/index.md) | Point/Line/Polygon/Heatmap/Raster/Image (6 types) |
| Composite layers | [index.md](references/composite/index.md) | Bubble/Route/ArcFlow/Icon/Glyph/ChinaDistrict/MarkerCluster/Hexagon/Fill/Satellite/TiffRaster/H3 |
| H3Layer | [h3-layer.md](references/composite/h3-layer.md) | H3 hexagonal grid visualization |
| Color/Size/Shape mapping | [mapping.md](references/layers/mapping.md) | Data-driven visuals |
| Style config | [style.md](references/layers/style.md) | Opacity/blend/style passthrough |
| Interactions (index + quick ref) | [index.md](references/interaction/index.md) | Marker/Popup/Tooltip/Maki icons (4 types) |
| Controls | [controls.md](references/controls/controls.md) | Zoom/Scale/Fullscreen/etc. |
| DrawControl | [draw-control.md](references/controls/draw-control.md) | Interactive drawing/editing |
| ImageCalibrationControl | [image-calibration-control.md](references/controls/image-calibration-control.md) | Image georeferencing |
| AnnotationControl | [annotation-control.md](references/controls/annotation-control.md) | Map annotation |
| Legends | [legend-components.md](references/legend/legend-components.md) | Map legends |
| Mobile (index + quick ref) | [index.md](references/mobile/index.md) | MobileToolbar/BottomSheet/MobileSheetLegend/SearchBar |

## Common Mistakes

| 错误 | 现象 | 解决方案 |
|------|------|---------|
| 未引入 style.css | 控件/弹窗/图例样式丢失 | `import '@antv/aimapui/style.css'`（CDN 用 `<link>`） |
| 容器无高度 | 地图不显示 | 确保父容器有明确高度，或给 AiMap 设置 `style={{ height: '100vh' }}` |
| map 与 schema 同时传入 | 报错或地图异常 | 只传一个，两者互斥 |
| sourceConfig 字段名错误 | 数据点不显示或偏移 | JSON 数据必须指定 `x`/`y` 字段名，如 `sourceConfig={{ x: 'lng', y: 'lat' }}` |
| GeoJSON 格式不对 | PolygonLayer 不渲染 | 必须是标准 FeatureCollection，不能是裸 Geometry |
| Token 缺失 | 高德/Mapbox 底图空白 | `map={{ basemap: 'gaode', token: 'YOUR_TOKEN' }}` |
| TouchGesturePanel 使用 | 功能不存在 | 此组件尚未实现，请勿使用 |

## Key Patterns

### Visual Mapping (数据驱动样式)

所有图层支持 **固定值** 和 **字段映射** 两种模式：

```tsx
// 固定值
<PointLayer source={data} color="#5B8FF9" size={12} />

// 字段映射
<PointLayer colorField="type" colorValues={['#f00','#0f0','#00f']} sizeField="value" sizeValues={[4,20]} />
```

详见 → [mapping.md](references/layers/mapping.md)

### Schema Mode (AI/JSON 驱动地图)

用单个 JSON 对象渲染完整地图，适合 AI 生成或配置化场景：

```tsx
import { AiMap } from '@antv/aimapui';
const schema = { map: { basemap: 'gaode', center: [121,31], zoom: 12 }, layers: [...], controls: [...] };
<AiMap schema={schema} />
```

> `map` 和 `schema` 互斥，禁止同时传入。

详见 → [schema-system.md](references/schema/schema-system.md)

### Composite Layers (复合图层)

复合图层是业务开箱即用的高级组件。各图层详细用法见对应 reference 文件：

| 图层 | Reference | 一句话说明 |
|------|-----------|-----------|
| ChinaDistrict | [china-district.md](references/composite/china-district.md) | 行政区划下钻 + 业务数据色阶绑定 |
| BubbleLayer | [bubble-layer.md](references/composite/bubble-layer.md) | 气泡大小编码数值 |
| RouteLayer | [route-layer.md](references/composite/route-layer.md) | 路径地图（静态/驾车/步行/骑行/公交） |
| ArcFlowLayer | [arc-flow-layer.md](references/composite/arc-flow-layer.md) | OD 弧线流向动画 |
| IconLayer | [icon-layer.md](references/composite/icon-layer.md) | 自定义图片图标 + Maki 内置图标 |
| GlyphLayer | [glyph-layer.md](references/composite/glyph-layer.md) | 图标字体标注（Material Symbols） |
| MarkerClusterLayer | [marker-cluster-layer.md](references/composite/marker-cluster-layer.md) | 聚合标注 |
| HexagonLayer | [hexagon-layer.md](references/composite/hexagon-layer.md) | 蜂窝热力 |
| FillLayer | [fill-layer.md](references/composite/fill-layer.md) | 区域填充 |
| SatelliteLayer | [satellite-layer.md](references/composite/satellite-layer.md) | 卫星影像 |
| TiffRasterLayer | [tiff-raster-layer.md](references/composite/tiff-raster-layer.md) | GeoTIFF 栅格 |
| H3Layer | [h3-layer.md](references/composite/h3-layer.md) | H3 六边形网格 |

### Special Controls (特殊控件)

| 控件 | Reference | 说明 |
|------|-----------|------|
| DrawControl | [draw-control.md](references/controls/draw-control.md) | 交互绘制（点/线/面/矩形/圆） |
| ImageCalibrationControl | [image-calibration-control.md](references/controls/image-calibration-control.md) | 图片配准/地理校准（上传、角点拖拽、透视变换、瓦片导出） |
| AnnotationControl | [annotation-control.md](references/controls/annotation-control.md) | 标注（marker/highlighter/text/note/link/image/video） |

### Maki Icon Utilities (内置 200+ 矢量图标)

```tsx
import { makiIconUrl, createMakiIconMap } from '@antv/aimapui';
// 单个图标 → makiIconUrl('cafe', { size: 32, fill: '#333' })
// 批量映射 → createMakiIconMap(['cafe', 'bus', 'hospital'])  // 用于 IconLayer.iconMap
```

详见 → [maki-icons.md](references/interaction/maki-icons.md)

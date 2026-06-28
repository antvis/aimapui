# Base Layers

基础图层是直接映射到 L7 底层图层类的原子组件，每个图层类型对应一种数据可视化形式。

## 图层列表

| Layer | 文档 | 默认 sourceType | 可用 Shape | 说明 |
|-------|------|----------------|-----------|------|
| PointLayer | [point-layer.md](point-layer.md) | `json` | circle, square, triangle, diamond, text, cylinder | 散点、符号、文字标注 |
| LineLayer | [line-layer.md](line-layer.md) | `json` | line, arc, arc3d, greatcircle | 路径、弧线、OD 流向 |
| PolygonLayer | [polygon-layer.md](polygon-layer.md) | `geojson` | fill, extrusion | 区域填充、3D 挤出 |
| HeatmapLayer | [heatmap-layer.md](heatmap-layer.md) | `json` | heatmap, hexagonColumn, hexagon, gridColumn, grid | 密度热力、蜂窝聚合 |
| RasterLayer | [raster-layer.md](raster-layer.md) | `raster` | — | 瓦片地图、栅格数据 |
| ImageLayer | [image-layer.md](image-layer.md) | `image` | — | 图片叠层 |

## 快速示例

```tsx
// PointLayer — 散点图
<PointLayer source={data} sourceConfig={{ x: 'lng', y: 'lat' }} color="#5B8FF9" size={12} shape="circle" />

// LineLayer — 路径/弧线
<LineLayer source={flowData} sourceType="geojson" color="#5B8FF9" size={2} shape="arc" />

// PolygonLayer — 区域填充
<PolygonLayer source={geojsonData} sourceType="geojson" colorField="density" colorValues={['#f0f9e8','#bae4bc','#7bccc4','#43a2ca','#0868ac']} />

// HeatmapLayer — 热力图
<HeatmapLayer source={points} sourceConfig={{ x: 'lng', y: 'lat' }} colorField="value" size={30} />

// RasterLayer — 栅格瓦片
<RasterLayer source="https://example.com/{z}/{x}/{y}.png" sourceType="rasterTile" />

// ImageLayer — 图片叠层
<ImageLayer source="https://example.com/overlay.png" sourceType="image" style={{ bounds: [[119,29],[122,32]] }} />
```

## 公共属性

所有基础图层继承自 `LayerSchema`，共享以下属性：

| 属性 | 类型 | 说明 |
|------|------|------|
| `source` | `unknown` | **必填** — 数据源（JSON 数组、GeoJSON、URL 等） |
| `sourceType` | `SourceType` | 数据类型，默认 `'json'` |
| `sourceConfig` | `SourceConfig` | 字段映射配置 |
| `color` | `string` | 固定颜色 |
| `colorField` | `string` | 颜色映射字段 |
| `colorValues` | `string[] \| string` | 颜色映射值 |
| `size` | `number` | 固定尺寸 |
| `sizeField` | `string` | 尺寸映射字段 |
| `sizeValues` | `number[]` | 尺寸映射值 |
| `shape` | `string` | 固定形状 |
| `shapeField` | `string` | 形状映射字段 |
| `shapeValues` | `string[] \| string` | 形状映射值 |
| `style` | `Record<string, unknown>` | 样式扩展（透传给 L7） |
| `opacity` | `number` | 图层透明度 0~1 |
| `blend` | `'normal' \| 'additive' \| 'subtractive' \| 'max'` | 混合模式 |
| `visible` | `boolean` | 图层可见性 |
| `zIndex` | `number` | 图层层级 |
| `minZoom` / `maxZoom` | `number` | 可见缩放范围 |
| `autoFit` | `boolean` | 自动缩放到数据范围 |
| `filterField` / `filterValues` | `string` / `unknown[]` | 数据过滤 |
| `animate` | `AnimateConfig` | 动画配置 |
| `active` | `ActiveConfig` | 悬停高亮配置 |
| `select` | `SelectConfig` | 选中配置 |
| `events` | `LayerEventSchema` | 事件配置（popup、tooltip 等） |
| `onClick` / `onMouseMove` / `onMouseEnter` / `onMouseLeave` | 回调 | 鼠标事件 |
| `onLayerCreated` | `(layer) => void` | L7 图层实例创建回调 |

## 视觉映射模式

所有图层支持两种视觉映射模式：

- **固定值**：直接传入 `color`/`size`/`shape`（如 `color="#5B8FF9"`）
- **字段映射**：传入 `colorField`/`sizeField`/`shapeField` + `colorValues`/`sizeValues`/`shapeValues`

```tsx
// 固定值
<PointLayer source={data} color="#5B8FF9" size={12} />

// 字段映射
<PointLayer
  source={data}
  colorField="category"
  colorValues={['#5B8FF9', '#F6BD16', '#5AD8A6', '#E86452']}
  sizeField="value"
  sizeValues={[6, 30]}
/>

// 文字标注
<PointLayer source={data} shapeField="name" shapeValues="text" color="#333" size={12}
  style={{ textAnchor: 'top', textOffset: [0, 15] }} />
```

## 数据源类型

| sourceType | 适用图层 | 说明 |
|-----------|---------|------|
| `'json'` | Point, Line, Heatmap | JSON 数组，需通过 `sourceConfig` 指定经纬度字段 |
| `'geojson'` | Point, Line, Polygon, Heatmap | GeoJSON FeatureCollection |
| `'csv'` | Point, Line, Heatmap | CSV 数据 |
| `'raster'` | Raster | 单张栅格图片 |
| `'rasterTile'` | Raster | 栅格瓦片（需 URL 模板） |
| `'image'` | Image | 图片叠层 |

## 相关文档

- [mapping.md](mapping.md) — 颜色/大小/形状映射、过滤、动画、交互高亮
- [style.md](style.md) — 不透明度、混合模式、style 属性、层级与可见性
- [schema-system.md](../schema/schema-system.md) — LayerSchema 完整属性
- [../composite/index.md](../composite/index.md) — 复合图层概览
# Base Layers

基础图层是直接映射到 L7 底层图层类的原子组件，每个图层类型对应一种数据可视化形式。

## Available Layers

| Layer | File | Description |
|-------|------|-------------|
| PointLayer | [point-layer.md](point-layer.md) | 点图层 — 散点、符号、文字标注 |
| LineLayer | [line-layer.md](line-layer.md) | 线图层 — 路径、弧线、OD 流向 |
| PolygonLayer | [polygon-layer.md](polygon-layer.md) | 面图层 — 区域填充、3D 挤出 |
| HeatmapLayer | [heatmap-layer.md](heatmap-layer.md) | 热力图 — 密度热力、蜂窝聚合 |
| RasterLayer | [raster-layer.md](raster-layer.md) | 栅格图层 — 瓦片地图、栅格数据 |
| ImageLayer | [image-layer.md](image-layer.md) | 图片图层 — 图片叠层 |

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
| `minZoom` | `number` | 最小可见缩放级别 |
| `maxZoom` | `number` | 最大可见缩放级别 |
| `autoFit` | `boolean` | 自动缩放到数据范围 |
| `filterField` | `string` | 过滤字段 |
| `filterValues` | `unknown[]` | 过滤值列表 |
| `animate` | `AnimateConfig` | 动画配置 |
| `active` | `ActiveConfig` | 悬停高亮配置 |
| `select` | `SelectConfig` | 选中配置 |
| `events` | `LayerEventSchema` | 事件配置（popup、tooltip 等） |
| `onClick` | `(payload) => void` | 点击回调 |
| `onMouseMove` | `(payload) => void` | 鼠标移动回调 |
| `onMouseEnter` | `(payload) => void` | 鼠标进入回调 |
| `onMouseLeave` | `(payload) => void` | 鼠标离开回调 |
| `onLayerCreated` | `(layer) => void` | L7 图层实例创建回调 |

## 数据源类型

| sourceType | 适用图层 | 说明 |
|-----------|---------|------|
| `'json'` | Point, Line, Heatmap | JSON 数组，需通过 `sourceConfig` 指定经纬度字段 |
| `'geojson'` | Point, Line, Polygon, Heatmap | GeoJSON FeatureCollection |
| `'csv'` | Point, Line, Heatmap | CSV 数据 |
| `'raster'` | Raster | 单张栅格图片 |
| `'rasterTile'` | Raster | 栅格瓦片（需 URL 模板） |
| `'image'` | Image | 图片叠层 |

## 视觉映射模式

所有图层支持两种视觉映射模式：

- **固定值**：直接传入 `color`/`size`/`shape`（如 `color="#5B8FF9"`）
- **字段映射**：传入 `colorField`/`sizeField`/`shapeField` + `colorValues`/`sizeValues`/`shapeValues`（如 `colorField="category" colorValues={['#f00','#0f0']}`）

## 视觉映射与样式

- [mapping.md](mapping.md) — 颜色/大小/形状映射、过滤、动画、交互高亮
- [style.md](style.md) — 不透明度、混合模式、style 属性、层级与可见性

## 相关文档

- [../schema/schema-system.md](../schema/schema-system.md) — LayerSchema 完整属性
- [../composite/index.md](../composite/index.md) — 复合图层概览
- [base-layers.md](base-layers.md) — 基础图层快速参考
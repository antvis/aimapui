# HexagonLayer

六边形聚合图层，将大量离散点按正六边形网格聚合统计。适合展示点数据的密度分布（如共享单车停放密度、门店分布热力），相比 [HeatmapLayer](../layers/heatmap-layer) 的平滑渐变，六边形保留了空间离散性，更适合定量对比。

> **何时选择：** 需要看到每个格子的具体聚合值、做精确区域对比时用 HexagonLayer；只需展示整体密度趋势、不需要精确读数时用 [HeatmapLayer](../layers/heatmap-layer)；需要按行政区域聚合时用 [BubbleLayer](./bubble-layer) 配合 GeoJSON 数据。

## 导入

```tsx
import { HexagonLayer } from '@antv/aimapui'
```

## Props

HexagonLayer 继承 [LayerSchema 公共属性](../layers/point-layer#公共属性)，此处仅列出专有属性和重定义属性。`shape` 已固定为 `'hexagonColumn'`，不可更改。

### 数据源

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `unknown` | **必填** | 数据源，JSON 点数据数组或 GeoJSON |
| `sourceType` | `'json' \| 'geojson' \| 'csv'` | `'json'` | 数据源类型，HexagonLayer 默认 JSON 点数组（经纬度字段需配置 `sourceConfig`） |
| `sourceConfig` | [SourceConfig](../layers/point-layer#sourceconfig) | - | JSON 模式下的经纬度字段映射，如 `{ x: 'lng', y: 'lat' }` |

### 聚合配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `hexSize` | `number` | `100` | 六边形边长（像素），值越大格子越大、聚合粒度越粗；50以下适合细粒度，200以上适合大范围概览 |
| `weightField` | `string` | `'h12'` | 聚合权重字段；省略时按点数统计（即 `count` 模式） |
| `weightMethod` | `'sum' \| 'mean' \| 'min' \| 'max' \| 'count'` | `'sum'` | 聚合方式：`sum` 求和、`mean` 求均值、`min`/`max` 取极值、`count` 仅计点数 |

### 颜色映射

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `color` | `string` | - | 固定填充色，未设置 `colorField` 时生效 |
| `colorField` | `string` | - | 颜色映射字段，通常与 `weightField` 相同 |
| `colorValues` | `string[] \| string` | - | 色板，如 `['#FDE68A', '#F59E0B', '#D97706']`；值从低到高对应 |

### 事件

| 属性 | 类型 | 说明 |
|------|------|------|
| `onClick` | `(payload: [LayerEventPayload](../layers/point-layer#layereventpayload)) => void` | 六边形格子点击回调，`feature` 中包含聚合后的统计值 |
| `onMouseMove` | `(payload: LayerEventPayload) => void` | 鼠标在格子上移动 |

### 公共属性（继承自 LayerSchema）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | `true` | 图层可见性 |
| `opacity` | `number` | - | 不透明度 (0~1) |
| `blend` | `'normal' \| 'additive' \| 'subtractive' \| 'max'` | `'normal'` | 混合模式 |
| `zIndex` | `number` | `0` | 图层层级 |
| `minZoom` | `number` | - | 最小可见缩放级别 |
| `maxZoom` | `number` | - | 最大可见缩放级别 |
| `autoFit` | `boolean` | `false` | 数据加载后是否自动适配视图范围 |
| `filterField` | `string` | - | 过滤字段 |
| `filterValues` | `unknown[]` | - | 过滤值列表 |
| `active` | `boolean \| { color: string }` | - | hover 高亮配置 |
| `select` | `boolean \| { color: string }` | - | 选中态配置 |
| `animate` | [AnimateConfig](../layers/point-layer#animateconfig) | - | 动画配置 |
| `name` | `string` | - | 图层名称 |
| `id` | `string` | 自动生成 | 图层唯一标识 |

### 样式（style 对象）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `style.coverage` | `number` | `0.8` | 六边形覆盖率 (0~1)，1.0 时格子间无缝隙 |
| `style.angle` | `number` | `0` | 六边形旋转角度（度） |

## 示例

### 基础用法 — 城市热点聚合

```tsx
import { AiMap, HexagonLayer } from '@antv/aimapui'

// JSON 格式的点数据，需要配置 sourceConfig 指定经纬度字段
const bikePoints = [
  { lng: 116.397, lat: 39.908, count: 42 },
  { lng: 116.427, lat: 39.918, count: 18 },
  { lng: 116.377, lat: 39.928, count: 65 },
  { lng: 121.473, lat: 31.230, count: 91 },
  { lng: 121.503, lat: 31.240, count: 33 },
]

<AiMap autoFit map={{ basemap: 'gaode', center: [116.4, 39.9], zoom: 10 }}>
  <HexagonLayer
    source={bikePoints}
    sourceType="json"
    sourceConfig={{ x: 'lng', y: 'lat' }}
    hexSize={80}
    weightField="count"
    weightMethod="sum"
    colorField="count"
    colorValues={['#FDE68A', '#F59E0B', '#D97706']}
  />
</AiMap>
```

### 仅统计点数密度

不设 `weightField`，或设 `weightMethod='count'`，即按落入每个六边形的点数统计：

```tsx
<HexagonLayer
  source={stores}
  sourceType="json"
  sourceConfig={{ x: 'longitude', y: 'latitude' }}
  weightMethod="count"
  colorValues={['#DBEAFE', '#3B82F6', '#1E3A8A']}
/>
```

### 调整格子密度和样式

```tsx
<HexagonLayer
  source={data}
  sourceType="json"
  sourceConfig={{ x: 'lng', y: 'lat' }}
  hexSize={150}
  weightField="revenue"
  weightMethod="mean"
  colorValues={['#ECFDF5', '#10B981', '#064E3B']}
  style={{ coverage: 1, angle: 0 }}
/>
```

## 注意事项

- HexagonLayer 默认 `sourceType='json'`，与其他图层（PointLayer 默认 `'json'`、BubbleLayer 默认 `'geojson'`）不同；使用 JSON 数组时必须配置 `sourceConfig` 指定经纬度字段
- `hexSize` 过小会产生大量微小格子，导致渲染卡顿；数据量超过 10 万条时建议 `hexSize ≥ 100`
- `weightField` 省略时聚合值等于落入格子的点数，等同于 `weightMethod='count'`
- 六边形的 `colorField` 通常和 `weightField` 设为同一字段，否则颜色映射可能与柱高不对应

## 相关组件

- [HeatmapLayer](../layers/heatmap-layer) — 平滑热力渐变，适合展示密度趋势
- [BubbleLayer](./bubble-layer) — 圆形气泡图层，适合分级统计
- [PointLayer](../layers/point-layer) — 基础散点图层
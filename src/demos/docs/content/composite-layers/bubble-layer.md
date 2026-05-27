# BubbleLayer

用圆的大小编码数值字段，实现分级统计地图（Proportional Symbol Map）。适合在区域面状底图上叠加显示各省/市的人口、GDP 等数值指标——面积大的圆代表高值，面积小的圆代表低值，相比等值区域图（Choropleth）更不易受区域面积大小干扰。

> **何时选择：** 需要将数值映射为圆的大小时用 BubbleLayer；只需颜色编码不需要大小区分时用 [PointLayer](../layers/point-layer)；需要热力渐变效果时用 [HeatmapLayer](../layers/heatmap-layer)。

## 导入

```tsx
import { BubbleLayer } from '@antv/aimapui'
```

## Props

BubbleLayer 继承 [LayerSchema 公共属性](../layers/point-layer#公共属性)，此处仅列出专有属性和重定义属性。

### 数据源

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `unknown` | **必填** | 数据源，支持 GeoJSON FeatureCollection 或 JSON 数组 |
| `sourceType` | `'geojson' \| 'json' \| 'csv'` | `'geojson'` | 数据源类型，BubbleLayer 默认 GeoJSON |
| `sourceConfig` | [SourceConfig](../layers/point-layer#sourceconfig) | - | `sourceType='json'` 时的经纬度字段映射 |

### 尺寸映射

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `sizeField` | `string` | - | 数值映射字段，如 `'population'`；省略时所有气泡使用 `size` 固定值 |
| `sizeValues` | `number[]` | - | `sizeField` 对应的断点值数组，如 `[100, 500, 1000]`，与 `colorValues` 等长对应 |
| `size` | `number` | `16` | 固定气泡大小（未设置 `sizeField` 时生效） |
| `sizeDomain` | `(string \| number)[]` | - | 当 `sizeField` 为离散值时，指定域值顺序，如 `['北京','上海','广州']` |

### 颜色映射

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `color` | `string` | `'#2563eb'` | 固定颜色，未设置 `colorField` 时生效 |
| `colorField` | `string` | - | 颜色映射字段，如 `'gdpLevel'` |
| `colorValues` | `string[] \| string` | - | 颜色色板，数组如 `['#DBEAFE','#3B82F6','#1E3A8A']` 或主题色板名 |
| `semanticColorField` | `string` | - | 语义色板映射字段，值域为 `primary \| warning \| error \| success`，适合状态类数据 |

### 标签

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `labelField` | `string` | `'name'` | 标签取值字段 |
| `labelColor` | `string` | `'#0b3b8c'` | 标签文字颜色 |
| `labelSize` | `number` | `12` | 标签字号（px） |
| `showLabel` | `boolean` | `true` | 是否显示标签文字 |
| `labelTrigger` | `'always' \| 'hover'` | `'always'` | `'hover'` 时只在鼠标悬停时显示标签，大数据量下建议用 hover 减少文字碰撞 |
| `labelOffset` | `[number, number]` | - | 标签偏移量 [dx, dy]（像素） |
| `labelAnchor` | [BubbleAnchor](#bubbleanchor) | `'top'` | 标签锚点位置 |
| `bubbleAnchor` | [BubbleAnchor](#bubbleanchor) | `'bottom'` | 气泡圆心相对于坐标的锚点 |

### 交互效果

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `hoverEffect` | `boolean` | `true` | 悬停时强化气泡（提升 opacity + 加边框），大数据量场景可关闭以提升性能 |
| `clickEffect` | `boolean` | `true` | 点击选中反馈 |
| `tooltipEffect` | `boolean` | `true` | 内置 Popup / Tooltip 提示，开启后悬停自动弹出数据摘要 |
| `tooltipFields` | `string[]` | - | tooltip 显示的字段列表，省略时显示所有字段 |
| `tooltipTemplate` | `string` | - | tooltip 模板，支持 `{{fieldName}}` 占位符，如 `"'{{name}}: {{population}}万'"` |

### 事件

| 属性 | 类型 | 说明 |
|------|------|------|
| `onClick` | `(payload: [LayerEventPayload](../layers/point-layer#layereventpayload)) => void` | 气泡点击回调 |
| `onMouseMove` | `(payload: LayerEventPayload) => void` | 鼠标在气泡上移动 |
| `onMouseEnter` | `(payload: LayerEventPayload) => void` | 鼠标进入气泡 |
| `onMouseLeave` | `(payload: LayerEventPayload) => void` | 鼠标离开气泡 |

### 公共属性（继承自 LayerSchema）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | `true` | 图层可见性 |
| `opacity` | `number` | `0.75` | 不透明度 (0~1) |
| `blend` | `'normal' \| 'additive' \| 'subtractive' \| 'max'` | `'normal'` | 混合模式，`'additive'` 可实现光晕叠加效果 |
| `zIndex` | `number` | `0` | 图层层级 |
| `minZoom` | `number` | - | 最小可见缩放级别 |
| `maxZoom` | `number` | - | 最大可见缩放级别 |
| `autoFit` | `boolean` | `false` | 数据加载后是否自动适配视图范围 |
| `filterField` | `string` | - | 过滤字段 |
| `filterValues` | `unknown[]` | - | 过滤值列表 |
| `active` | `boolean \| { color: string }` | - | hover 高亮配置 |
| `select` | `boolean \| { color: string }` | - | 选中态配置 |
| `animate` | [AnimateConfig](../layers/point-layer#animateconfig) | - | 动画配置 |
| `name` | `string` | `'bubble'` | 图层名称 |

### BubbleAnchor

```typescript
type BubbleAnchor =
  | 'center' | 'top' | 'right' | 'bottom' | 'left'
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
```

## 示例

### 基础用法 — 省级人口气泡图

```tsx
import { AiMap, BubbleLayer } from '@antv/aimapui'

const provinces = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: '广东', population: 12601, gdp: 129118 },
      geometry: { type: 'Point', coordinates: [113.26, 23.13] }
    },
    {
      type: 'Feature',
      properties: { name: '山东', population: 10153, gdp: 87435 },
      geometry: { type: 'Point', coordinates: [117.00, 36.67] }
    },
    {
      type: 'Feature',
      properties: { name: '河南', population: 9883, gdp: 61345 },
      geometry: { type: 'Point', coordinates: [113.65, 34.76] }
    }
  ]
}

<AiMap map={{ basemap: 'gaode', center: [105, 35], zoom: 4 }}>
  <BubbleLayer
    source={provinces}
    sourceType="geojson"
    sizeField="population"
    sizeValues={[8, 20, 40]}
    colorField="gdp"
    colorValues={['#DBEAFE', '#3B82F6', '#1E3A8A']}
    showLabel
    labelField="name"
  />
</AiMap>
```

### 语义色板 + 悬停提示

用 `semanticColorField` 按状态字段自动着色，`tooltipTemplate` 自定义提示内容。

```tsx
<BubbleLayer
  source={stations}
  sourceType="geojson"
  sizeField="flow"
  sizeValues={[10, 25, 50]}
  semanticColorField="status"
  hoverEffect
  tooltipEffect
  tooltipTemplate="{{name}}：流量 {{flow}}，状态 {{status}}"
/>
```

### 大数据量优化

数据量超过 5000 条时，建议关闭标签常驻和内置 tooltip 以提升渲染性能：

```tsx
<BubbleLayer
  source={largeDataset}
  sourceType="geojson"
  sizeField="value"
  color="#2563eb"
  opacity={0.6}
  showLabel={false}
  hoverEffect={false}
  tooltipEffect={false}
/>
```

## 注意事项

- BubbleLayer 内部由 PointLayer + 文字标注两层构成，`shape` 已固定为 `'circle'`，不可更改
- `sizeValues` 与 `colorValues` 建议等长，否则映射可能不符合预期
- `labelTrigger='hover'` 可在大数据量场景下避免标签碰撞，但需要 `hoverEffect` 开启才生效
- GeoJSON 数据中的 `Point` 类型的 Feature 是最常见的数据格式；如果使用 JSON 数组，需通过 `sourceType='json'` 并配置 `sourceConfig`

## 相关组件

- [PointLayer](../layers/point-layer) — 纯散点/文本标注图层，不做大小映射
- [HeatmapLayer](../layers/heatmap-layer) — 热力渐变图层
- [HexagonLayer](./hexagon-layer) — 六边形聚合统计图层
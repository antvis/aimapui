# H3Layer

H3 六边形网格图层，基于 [Uber H3](https://h3geo.org/) 空间索引系统，将 H3 cell index 转换为六边形多边形并渲染。适合已有 H3 编码数据的可视化场景（如出行 OD 分析、网格化指标展示），与 [HexagonLayer](./hexagon-layer) 不同的是，H3Layer 直接使用 H3 索引而非经纬度聚合，网格层级由 H3 分辨率决定。

> **何时选择：** 数据已包含 H3 索引（如 `85440637fffffff`）、需要跨数据集对齐网格时用 H3Layer；原始数据为经纬度点、需要前端聚合时用 [HexagonLayer](./hexagon-layer)；只需展示平滑密度趋势时用 [HeatmapLayer](../layers/heatmap-layer)。

## 导入

```tsx
import { H3Layer } from '@antv/aimapui'
```

## Props

H3Layer 继承 [LayerSchema 公共属性](../layers/point-layer#公共属性)，此处仅列出专有属性和重定义属性。`sourceType` 已固定为 `'geojson'`（内部自动将 H3 索引转换为 GeoJSON Feature），不可更改。

### 数据源

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `H3DataItem[]` | **必填** | H3 数据数组，每项须包含 H3 索引字段（字段名由 `h3Field` 指定），其余字段作为属性透传至 GeoJSON Feature |
| `h3Field` | `string` | `'h3'` | 数据中 H3 索引字段的名称，如 `'h3_index'`、`'hex_id'` 等 |

### 颜色映射

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `color` | `string` | - | 固定填充色，未设置 `colorField` 时生效 |
| `colorField` | `string` | - | 颜色映射字段，通常为数据中的数值字段（如 `'value'`） |
| `colorValues` | `string[]` | - | 自定义色板，如 `['#DBEAFE', '#3B82F6', '#1E3A8A']`；不传时使用 `colorScheme` 对应的内置色板 |
| `colorScheme` | `ColorScheme` | `'sequential'` | 内置色板预设，可选 `'sequential'`、`'diverging'` 等 |

### 边线配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `showStroke` | `boolean` | `true` | 是否显示六边形边线，关闭后格子间无描边 |
| `strokeColor` | `string` | `'rgba(255,255,255,0.3)'` | 边线颜色 |
| `strokeWidth` | `number` | `0.5` | 边线宽度（像素） |

### 标签配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `showLabel` | `boolean` | `false` | 是否在六边形中心显示文字标签 |
| `labelField` | `string` | - | 标签文字来源字段，如 `'name'`、`'value'`；`showLabel` 为 `true` 且该字段有值时才显示 |
| `labelColor` | `string` | `'#333'` | 标签文字颜色 |
| `labelSize` | `number` | `12` | 标签文字大小（像素） |

### 交互效果

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `hoverEffect` | `boolean` | `false` | 是否启用 hover 高亮效果，开启后鼠标悬停时六边形高亮为 `#2563eb` |
| `clickEffect` | `boolean` | `false` | 是否启用点击选中效果，开启后点击时六边形高亮为 `#1d4ed8` |

### 事件

| 属性 | 类型 | 说明 |
|------|------|------|
| `onClick` | `(payload: [LayerEventPayload](../layers/point-layer#layereventpayload)) => void` | 六边形点击回调，`feature.properties` 中包含原始数据字段及 `_h3Index` |
| `onMouseMove` | `(payload: LayerEventPayload) => void` | 鼠标在六边形上移动 |
| `onMouseEnter` | `(payload: LayerEventPayload) => void` | 鼠标进入六边形 |
| `onMouseLeave` | `(payload: LayerEventPayload) => void` | 鼠标离开六边形 |

### 公共属性（继承自 LayerSchema）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | `true` | 图层可见性 |
| `opacity` | `number` | `0.8` | 不透明度 (0~1) |
| `blend` | `'normal' \| 'additive' \| 'subtractive' \| 'max'` | `'normal'` | 混合模式 |
| `zIndex` | `number` | `0` | 图层层级，边线层自动 `+2`，标签层自动 `+10` |
| `minZoom` | `number` | - | 最小可见缩放级别 |
| `maxZoom` | `number` | - | 最大可见缩放级别 |
| `autoFit` | `boolean` | `false` | 数据加载后是否自动适配视图范围 |
| `active` | `boolean \| { color: string }` | - | hover 高亮配置，未设置时由 `hoverEffect` 控制 |
| `select` | `boolean \| { color: string }` | - | 选中态配置，未设置时由 `clickEffect` 控制 |
| `name` | `string` | - | 图层名称 |
| `id` | `string` | 自动生成 | 图层唯一标识 |

### 样式（style 对象）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `style` | `object` | - | 多边形样式，透传给底层 PolygonLayer，可配置 `opacity` 等属性 |

## 示例

### 基础用法 -- H3 网格指标可视化

```tsx
import { AiMap, H3Layer } from '@antv/aimapui'

// 数据包含 H3 索引和数值指标
const h3Data = [
  { h3: '85440637fffffff', value: 42 },
  { h3: '85440633fffffff', value: 18 },
  { h3: '85440631fffffff', value: 87 },
  { h3: '8544063bfffffff', value: 55 },
]

<AiMap autoFit map={{ basemap: 'gaode', center: [116.4, 39.9], zoom: 8 }}>
  <H3Layer
    source={h3Data}
    colorField="value"
    colorValues={['#DBEAFE', '#3B82F6', '#1E3A8A']}
  />
</AiMap>
```

### 自定义 h3Field 字段名

数据中 H3 索引字段不是默认的 `'h3'` 时，通过 `h3Field` 指定：

```tsx
const data = [
  { hex_id: '85440637fffffff', population: 1200 },
  { hex_id: '85440633fffffff', population: 800 },
]

<H3Layer
  source={data}
  h3Field="hex_id"
  colorField="population"
  colorScheme="sequential"
/>
```

### 开启边线、标签和交互

```tsx
<H3Layer
  source={h3Data}
  colorField="value"
  showStroke
  strokeColor="rgba(255,255,255,0.5)"
  strokeWidth={1}
  showLabel
  labelField="value"
  labelColor="#333"
  labelSize={14}
  hoverEffect
  clickEffect
  onClick={(payload) => {
    console.log('H3:', payload.feature.properties._h3Index)
    console.log('Value:', payload.feature.properties.value)
  }}
/>
```

### 使用内置色板

不传 `colorValues` 时，使用 `colorScheme` 对应的内置色板：

```tsx
<H3Layer
  source={h3Data}
  colorField="value"
  colorScheme="sequential"
  opacity={0.9}
/>
```

## 注意事项

- H3Layer 仅接收包含 H3 索引的数据数组，不接受经纬度点数据；若原始数据为经纬度，需先使用 `h3-js` 的 `latLngToCell` 转换为 H3 索引，或使用 [HexagonLayer](./hexagon-layer) 进行前端聚合
- 无效的 H3 索引（`isValidCell` 校验失败）会被自动过滤，不会渲染也不会报错
- H3 网格的分辨率（粒度）由索引本身决定（0~15 级，数字越大格子越小），不同分辨率的数据可以混合渲染
- `hoverEffect` 和 `clickEffect` 是 `active` / `select` 的便捷封装；若同时传入 `active` 和 `hoverEffect`，`active` 优先生效
- 边线层（LineLayer）和标签层（PointLayer）的 `zIndex` 分别在基础值上 `+2` 和 `+10`，确保标签始终显示在最上层
- 数据量较大时（超过 5 万个 H3 cell），建议关闭 `showLabel` 和 `showStroke` 以提升渲染性能

## 相关组件

- [HexagonLayer](./hexagon-layer) -- 经纬度点数据的六边形聚合图层，适合原始点数据的前端聚合
- [HeatmapLayer](../layers/heatmap-layer) -- 平滑热力渐变，适合展示密度趋势
- [BubbleLayer](./bubble-layer) -- 圆形气泡图层，适合分级统计
- [PolygonLayer](../layers/polygon-layer) -- H3Layer 内部使用的多边形渲染图层
- [PointLayer](../layers/point-layer) -- 基础散点/文本图层，H3Layer 内部用于标签渲染

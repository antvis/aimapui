# HeatmapLayer

热力图层，将点数据按密度渲染为平滑渐变色带。适合展示数据的聚集程度和分布趋势——比如共享单车停放密度、人群热力、犯罪热点等。与 [HexagonLayer](../composite-layers/hexagon-layer) 的离散格子不同，热力图呈现连续渐变，强调"哪里密集"而非每个格子的精确值。

> **何时选择：** 需要直观展示密度趋势、不需要精确读数时用 HeatmapLayer；需要六边形格子的聚合统计值（可精确读数）时用 [HexagonLayer](../composite-layers/hexagon-layer)；需要按数值映射圆大小的分级统计时用 [BubbleLayer](../composite-layers/bubble-layer)。

## 导入

```tsx
import { HeatmapLayer } from '@antv/aimapui'
```

## Props

HeatmapLayer 继承 [LayerSchema 公共属性](./point-layer#公共属性)，此处仅列出专有属性和重定义属性。

### 数据源

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `unknown` | **必填** | 点数据源，JSON 数组或 GeoJSON |
| `sourceType` | `'json' \| 'geojson' \| 'csv'` | `'json'` | 数据源类型 |
| `sourceConfig` | [SourceConfig](./point-layer#sourceconfig) | - | JSON 模式下的经纬度字段映射 |

### 热力配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `number` | - | 热力半径（像素），值越大热力扩散范围越广，通常 20~60 |
| `sizeField` | `string` | - | 半径映射字段，不同点可以有不同的热力半径 |
| `sizeValues` | `number[]` | - | 半径断点值数组 |
| `colorField` | `string` | - | 权重字段，点的权重值影响热力强度；省略时每个点权重相同 |
| `colorValues` | `string[] \| string` | - | 色带，从低到高排列，如 `['#FDE68A', '#F59E0B', '#D97706', '#92400E']` |

### 视觉

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `opacity` | `number` | `1` | 不透明度 (0~1)，热力图建议 0.6~0.8 以便看到底图 |
| `blend` | `'normal' \| 'additive' \| 'subtractive' \| 'max'` | `'normal'` | 混合模式，`'additive'` 让重叠区域更亮，适合深色底图 |
| `style` | `Record<string, unknown>` | - | 样式配置 |

### 过滤与交互

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `filterField` | `string` | - | 过滤字段 |
| `filterValues` | `unknown[]` | - | 过滤值列表 |
| `active` | `boolean \| { color: string }` | - | hover 高亮（热力图通常不需要高亮，此属性效果有限） |

### 事件

| 属性 | 类型 | 说明 |
|------|------|------|
| `onClick` | `(payload: [LayerEventPayload](./point-layer#layereventpayload)) => void` | 点击热力区域 |
| `onMouseMove` | `(payload: LayerEventPayload) => void` | 鼠标在热力上移动 |
| `onMouseEnter` | `(payload: LayerEventPayload) => void` | 鼠标进入热力区域 |
| `onMouseLeave` | `(payload: LayerEventPayload) => void` | 鼠标离开热力区域 |

### 公共属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | `true` | 图层可见性 |
| `zIndex` | `number` | `0` | 图层层级，热力图建议放在最底层（zIndex 较小）以免遮挡其他图层 |
| `minZoom` | `number` | - | 最小可见缩放级别 |
| `maxZoom` | `number` | - | 最大可见缩放级别 |
| `autoFit` | `boolean` | `false` | 数据加载后自动适配视图 |
| `name` | `string` | `'heatmap'` | 图层名称 |
| `id` | `string` | 自动生成 | 图层唯一标识 |

## 示例

### 基础用法 — 城市热力分布

```tsx
import { AiMap, HeatmapLayer } from '@antv/aimapui'

const bikePoints = [
  { lng: 116.397, lat: 39.908, count: 42 },
  { lng: 116.427, lat: 39.918, count: 18 },
  { lng: 116.377, lat: 39.928, count: 65 },
  { lng: 121.473, lat: 31.230, count: 91 },
  { lng: 121.503, lat: 31.240, count: 33 },
]

<AiMap map={{ basemap: 'gaode', center: [116.4, 39.9], zoom: 11 }}>
  <HeatmapLayer
    source={bikePoints}
    sourceType="json"
    sourceConfig={{ x: 'lng', y: 'lat' }}
    colorField="count"
    colorValues={['#FDE68A', '#F59E0B', '#D97706', '#92400E']}
    size={30}
    opacity={0.8}
    blend="additive"
  />
</AiMap>
```

### 过滤特定类型 — 仅显示餐饮热力

```tsx
<HeatmapLayer
  source={poiData}
  sourceType="json"
  sourceConfig={{ x: 'longitude', y: 'latitude' }}
  colorField="rating"
  colorValues={['rgba(59,130,246,0.2)', '#3B82F6', '#1E40AF']}
  filterField="type"
  filterValues={['restaurant']}
  size={20}
  opacity={0.7}
/>
```

### 深色底图搭配

深色底图 + additive 混合模式效果最佳：

```tsx
<AiMap theme="dark" map={{ basemap: 'gaode', style: 'dark', center: [116.4, 39.9], zoom: 11 }}>
  <HeatmapLayer
    source={crimeData}
    sourceType="json"
    sourceConfig={{ x: 'lng', y: 'lat' }}
    colorValues={['rgba(0,0,0,0)', '#7C3AED', '#EF4444']}
    size={40}
    opacity={0.8}
    blend="additive"
  />
</AiMap>
```

## 注意事项

- 热力图展示的是**密度趋势**而非精确值，不适合需要精确读数的分析场景——此时应使用 [HexagonLayer](../composite-layers/hexagon-layer)
- `size`（热力半径）对效果影响很大：值太小会出现孤立圆点，值太大会模糊细节；建议根据数据密度和缩放级别调试
- `blend='additive'` 在深色底图上效果最好，浅色底图上叠加区域会变白；浅色底图用默认 `'normal'` 即可
- `opacity` 建议 0.6~0.8，太低看不到热力，太高遮挡底图信息
- 热力图的 `active` 高亮效果有限（热力是渐变渲染，不像点/面图层有明确边界），不建议依赖此交互

## 相关组件

- [PointLayer](./point-layer) — 散点图层，适合精确到点的标注
- [HexagonLayer](../composite-layers/hexagon-layer) — 六边形聚合图层，适合精确聚合统计
- [BubbleLayer](../composite-layers/bubble-layer) — 气泡大小映射图层
# PolygonLayer

多边形填充图层，用于渲染行政区划、地块、建筑物轮廓等面状地理数据。支持 2D 填充和 3D 拉起（extrusion）两种模式。

> **何时选择：** 渲染面状区域（省份、地块、建筑轮廓）用 PolygonLayer；渲染点/散点数据用 [PointLayer](./point-layer)；渲染线性数据用 [LineLayer](./line-layer)；需要按面积以外的数值映射颜色时，PolygonLayer 的 `colorField` 同样适用。

## 导入

```tsx
import { PolygonLayer } from '@antv/aimapui'
```

## Props

PolygonLayer 继承 [LayerSchema 公共属性](./point-layer#公共属性)，此处仅列出专有属性和重定义属性。

### 数据源

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `unknown` | **必填** | 数据源，通常是 GeoJSON FeatureCollection（`Polygon`/`MultiPolygon` 类型） |
| `sourceType` | `'json' \| 'geojson' \| 'csv'` | `'geojson'` | 数据源类型，PolygonLayer 默认 GeoJSON（与 PointLayer/LineLayer 的 `'json'` 默认值不同） |
| `sourceConfig` | [SourceConfig](./point-layer#sourceconfig) | - | JSON 模式下的字段映射 |

### 形状

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `shape` | `string` | `'fill'` | 填充形态：`'fill'`（2D 平面填充，默认）、`'extrusion'`（3D 拉起，需配合 `sizeField` + pitch 视角） |

### 颜色映射

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `color` | `string` | `'#3B82F6'` | 固定填充色 |
| `colorField` | `string` | - | 颜色映射字段，如 `'gdp'`、`'population'` |
| `colorValues` | `string[] \| string` | - | 色板数组 |

### 3D 拉起（extrusion）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `number` | - | 拉起高度（像素），`shape='extrusion'` 时生效；未设 `sizeField` 时所有面相同高度 |
| `sizeField` | `string` | - | 高度映射字段，如 `'height'`、`'floors'` |
| `sizeValues` | `number[]` | - | 高度断点值数组 |

### 视觉与交互

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `opacity` | `number` | `1` | 不透明度 (0~1)，多边形叠加时建议 0.7~0.9 |
| `blend` | `'normal' \| 'additive' \| 'subtractive' \| 'max'` | `'normal'` | 混合模式 |
| `active` | `boolean \| { color: string }` | - | hover 高亮，行政区划图的常用交互 |
| `select` | `boolean \| { color: string }` | - | 点击选中态 |
| `filterField` | `string` | - | 过滤字段 |
| `filterValues` | `unknown[]` | - | 过滤值列表 |
| `animate` | [AnimateConfig](./point-layer#animateconfig) | - | 动画配置，`extrusion` 模式的生长动画 |
| `style` | `Record<string, unknown>` | - | 样式配置，常用：`stroke`（描边色）、`strokeWidth`（描边宽度，0 为无描边） |

### 事件

| 属性 | 类型 | 说明 |
|------|------|------|
| `onClick` | `(payload: [LayerEventPayload](./point-layer#layereventpayload)) => void` | 点击面触发，`feature` 包含该多边形的属性 |
| `onMouseMove` | `(payload: LayerEventPayload) => void` | 鼠标在面上移动 |
| `onMouseEnter` | `(payload: LayerEventPayload) => void` | 鼠标进入面区域 |
| `onMouseLeave` | `(payload: LayerEventPayload) => void` | 鼠标离开面区域 |

### 公共属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | `true` | 图层可见性 |
| `zIndex` | `number` | `0` | 图层层级 |
| `minZoom` | `number` | - | 最小可见缩放级别 |
| `maxZoom` | `number` | - | 最大可见缩放级别 |
| `autoFit` | `boolean` | `false` | 数据加载后自动适配视图 |
| `name` | `string` | `'polygon'` | 图层名称 |
| `id` | `string` | 自动生成 | 图层唯一标识 |

## 示例

### 基础用法 — 省级 GDP 分级填色

```tsx
import { AiMap, PolygonLayer } from '@antv/aimapui'

<AiMap map={{ basemap: 'gaode', center: [108, 34], zoom: 4, token }}>
  <PolygonLayer
    source={provinces}
    sourceType="geojson"
    colorField="gdp"
    colorValues={['#DBEAFE', '#93C5FD', '#3B82F6', '#1E40AF']}
    style={{ stroke: '#fff', strokeWidth: 1 }}
    active={{ color: '#FCD34D' }}
  />
</AiMap>
```

### 3D 拉起 — 建筑高度

`extrusion` 模式配合 `sizeField` 按数值拉起高度，需要设置地图 pitch：

```tsx
<AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 15, pitch: 50, token }}>
  <PolygonLayer
    source={buildings}
    sourceType="geojson"
    shape="extrusion"
    sizeField="height"
    sizeValues={[10, 200]}
    colorField="type"
    colorValues={['#93C5FD', '#3B82F6', '#1E3A8A']}
    opacity={0.9}
  />
</AiMap>
```

### 过滤高亮 — 省份点击选中

```tsx
const [selected, setSelected] = useState<string[]>([])

<PolygonLayer
  source={provinces}
  sourceType="geojson"
  colorField="name"
  colorValues={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
  select={{ color: '#FFD93D' }}
  onClick={(e) => {
    const name = e.feature?.name as string
    setSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }}
/>
```

### 半透明叠加 — 保留底图可读性

```tsx
<PolygonLayer
  source={districts}
  sourceType="geojson"
  color="#3B82F6"
  opacity={0.3}
  style={{ stroke: '#1E40AF', strokeWidth: 2 }}
/>
```

## 注意事项

- PolygonLayer 的 `sourceType` 默认为 `'geojson'`，与 [PointLayer](./point-layer)（默认 `'json'`）不同；如果用 JSON 数组需显式设为 `'json'` 并配置 `sourceConfig`
- `shape='extrusion'` 需要地图设置 pitch 倾角（`map={{ pitch: 30~60 }}`），2D 俯视角下 extrusion 会退化为平面填充
- `style.strokeWidth` 设为 `0` 可以去掉描边，适合大面积连续填充不需要边界的场景（如热力面）
- 多个面重叠时，后渲染的覆盖先渲染的；如果需要看到重叠效果，降低 `opacity` 并考虑 `blend='additive'`
- `active` 高亮在面数很多（超过 1000 个多边形）时可能带来性能开销，大数据量场景建议关闭

## 相关组件

- [PointLayer](./point-layer) — 散点/标注图层
- [LineLayer](./line-layer) — 线段/路径图层
- [BubbleLayer](../composite-layers/bubble-layer) — 气泡大小映射图层（在面状图上叠加）
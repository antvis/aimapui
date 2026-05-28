# LineLayer

线图层，渲染路径、边界线、弧线等线性地理数据。支持四种形态：直线（默认）、2D 弧线、3D 弧线和大圆弧，适合路线规划、OD 流向、行政区划边界等场景。

> **何时选择：** 简单路径/边界线用 LineLayer；需要内置动画效果和节点标注的 OD 弧线用 [ArcFlowLayer](../composite-layers/arc-flow-layer)；需要填充面状区域用 [PolygonLayer](./polygon-layer)。

## 导入

```tsx
import { LineLayer } from '@antv/aimapui'
```

## Props

LineLayer 继承 [LayerSchema 公共属性](./point-layer#公共属性)，此处仅列出专有属性和重定义属性。

### 数据源

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `unknown` | **必填** | 数据源，支持 JSON 数组、GeoJSON 或 URL |
| `sourceType` | `'json' \| 'geojson' \| 'csv'` | `'json'` | 数据源类型。弧线模式（`arc`/`arc3d`/`greatcircle`）需用 JSON 并配置 `sourceConfig` 指定起终点字段 |
| `sourceConfig` | [SourceConfig](./point-layer#sourceconfig) | - | JSON 模式下的字段映射，弧线模式必填 `{ x, y, x1, y1 }` |

### 形状

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `shape` | `string` | `'line'` | 线形态：`'line'`（直线，适合道路/边界）、`'arc'`（2D 弧线，适合短距离 OD）、`'arc3d'`（3D 弧线，适合中长距离 OD，需开启 pitch）、`'greatcircle'`（大圆弧，适合跨洲际长距离航线） |
| `shapeField` | `string` | - | 形状映射字段 |
| `shapeValues` | `string[] \| string` | - | `shapeField` 对应的形状值映射 |

### 颜色映射

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `color` | `string` | `'#3B82F6'` | 固定线颜色，未设 `colorField` 时所有线使用此色 |
| `colorField` | `string` | - | 颜色映射字段，如 `'volume'` |
| `colorValues` | `string[] \| string` | - | 色板数组 |

### 线宽映射

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `number` | `2` | 固定线宽（像素），未设 `sizeField` 时所有线使用此值 |
| `sizeField` | `string` | - | 线宽映射字段，如 `'flow'`，线宽随数值变化 |
| `sizeValues` | `number[]` | - | 线宽断点值数组 |

### 视觉与交互

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `opacity` | `number` | `1` | 不透明度 (0~1)，多弧线叠加时建议 0.6~0.8 |
| `blend` | `'normal' \| 'additive' \| 'subtractive' \| 'max'` | `'normal'` | 混合模式，`'additive'` 适合展示流量密度叠加 |
| `active` | `boolean \| { color: string }` | - | hover 高亮 |
| `select` | `boolean \| { color: string }` | - | 点击选中态 |
| `filterField` | `string` | - | 过滤字段 |
| `filterValues` | `unknown[]` | - | 过滤值列表 |
| `animate` | [AnimateConfig](./point-layer#animateconfig) | - | 动画配置，`trailLength` 控制弧线尾迹长度 |
| `style` | `Record<string, unknown>` | - | 样式配置，常用：`stroke`（描边色）、`strokeWidth`（描边宽）、`lineType`（`'solid'`/`'dashed'`） |

### 事件

| 属性 | 类型 | 说明 |
|------|------|------|
| `onClick` | `(payload: [LayerEventPayload](./point-layer#layereventpayload)) => void` | 点击线段触发 |
| `onMouseMove` | `(payload: LayerEventPayload) => void` | 鼠标在线上移动 |
| `onMouseEnter` | `(payload: LayerEventPayload) => void` | 鼠标进入线段 |
| `onMouseLeave` | `(payload: LayerEventPayload) => void` | 鼠标离开线段 |

### 公共属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | `true` | 图层可见性 |
| `zIndex` | `number` | `0` | 图层层级 |
| `minZoom` | `number` | - | 最小可见缩放级别 |
| `maxZoom` | `number` | - | 最大可见缩放级别 |
| `autoFit` | `boolean` | `false` | 数据加载后自动适配视图 |
| `name` | `string` | `'line'` | 图层名称 |
| `id` | `string` | 自动生成 | 图层唯一标识 |

## 示例

### 基础用法 — 行政边界线

```tsx
import { AiMap, LineLayer } from '@antv/aimapui'

<AiMap map={{ basemap: 'gaode', center: [108, 34], zoom: 4, token }}>
  <LineLayer
    source={provinceBoundaries}
    sourceType="geojson"
    color="#94A3B8"
    size={1}
    style={{ opacity: 0.6 }}
  />
</AiMap>
```

### 2D 弧线 — 省际人口流动

JSON 数据搭配 `sourceConfig` 指定起终点坐标字段：

```tsx
const flows = [
  { fromLng: 116.397, fromLat: 39.908, toLng: 121.473, toLat: 31.230, volume: 500 },
  { fromLng: 116.397, fromLat: 39.908, toLng: 113.264, toLat: 23.129, volume: 320 },
  { fromLng: 121.473, fromLat: 31.230, toLng: 114.057, toLat: 22.543, volume: 280 },
]

<AiMap map={{ basemap: 'gaode', center: [112, 30], zoom: 5, token }}>
  <LineLayer
    source={flows}
    sourceType="json"
    sourceConfig={{ x: 'fromLng', y: 'fromLat', x1: 'toLng', y1: 'toLat' }}
    shape="arc"
    colorField="volume"
    colorValues={['#93C5FD', '#1D4ED8']}
    size={3}
    opacity={0.8}
    active={{ color: '#FFD93D' }}
  />
</AiMap>
```

### 3D 弧线 — 跨区域航线

`arc3d` 需要地图设置 pitch 倾角才能看到立体效果：

```tsx
<AiMap map={{ basemap: 'gaode', center: [105, 35], zoom: 4, pitch: 45, token }}>
  <LineLayer
    source={flightRoutes}
    sourceType="json"
    sourceConfig={{ x: 'depLng', y: 'depLat', x1: 'arrLng', y1: 'arrLat' }}
    shape="arc3d"
    size={2}
    color="#3B82F6"
    opacity={0.7}
    animate={{ enable: true, duration: 2000, trailLength: 0.4 }}
  />
</AiMap>
```

### 分类着色 + 虚线

按类型字段着色，用 `style.lineType` 画虚线：

```tsx
<LineLayer
  source={roads}
  sourceType="geojson"
  colorField="roadType"
  colorValues={['#3B82F6', '#10B981', '#F59E0B']}
  size={2}
  style={{ lineType: 'dashed' }}
/>
```

## 注意事项

- 弧线模式（`arc`/`arc3d`/`greatcircle`）的 JSON 数据**必须**配置 `sourceConfig` 指定起点（`x`/`y`）和终点（`x1`/`y1`）字段，否则无法绘制
- `arc3d` 需配合 `map={{ pitch: 30~60 }}` 才能看到 3D 效果，2D 俯视角下与 `arc` 无异
- 大数据量弧线（超过 500 条）建议设置 `opacity=0.6~0.8` 和 `blend='additive'` 以避免重叠区域过于浓重
- `animate` 配置的 `trailLength` 控制尾迹长度（0~1），值越大拖尾越长，适合表现流向
- GeoJSON 线数据（`LineString`/`MultiLineString`）使用 `shape='line'`，不需要 `sourceConfig`

## 相关组件

- [ArcFlowLayer](../composite-layers/arc-flow-layer) — 内置动画和节点标注的 OD 弧线图层
- [PointLayer](./point-layer) — 散点图层
- [PolygonLayer](./polygon-layer) — 面状区域图层
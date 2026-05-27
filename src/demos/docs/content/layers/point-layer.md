# PointLayer

在地图上渲染离散点位，支持散点圆、3D 柱体和文本标注三种形态。是最基础也是最常用的图层类型，绝大多数"在地图上打点"的场景都从这里开始。

> **何时选择：** 简单打点标注用 PointLayer；需要按数值映射圆的大小做分级统计时用 [BubbleLayer](../composite-layers/bubble-layer)；需要平滑热力渐变效果时用 [HeatmapLayer](./heatmap-layer)；需要六边形聚合统计时用 [HexagonLayer](../composite-layers/hexagon-layer)。

## 导入

```tsx
import { PointLayer } from '@antv/aimapui'
```

## Props

### 数据源

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `unknown` | **必填** | 数据源，支持 JSON 数组、GeoJSON FeatureCollection 或 URL 字符串 |
| `sourceType` | `'json' \| 'geojson' \| 'csv' \| 'raster' \| 'rasterTile' \| 'image'` | `'json'` | 数据源类型。JSON 数组最常用，需配合 `sourceConfig` 指定经纬度字段；GeoJSON 可自动识别坐标 |
| `sourceConfig` | [SourceConfig](#sourceconfig) | - | JSON/CSV 模式下的字段映射配置 |

### 形状

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `shape` | `string` | `'circle'` | 点的形状：`'circle'`（默认圆点）、`'square'`/`'triangle'`/`'diamond'`（其他平面形状）、`'cylinder'`（3D 柱体，需开启地图 pitch）、`'text'`（文本标注，需配合 `shapeField` 指定文本字段） |
| `shapeField` | `string` | - | 形状映射字段。`shape='text'` 时设为包含文本内容的字段名 |
| `shapeValues` | `string[] \| string` | - | `shapeField` 对应的形状值映射；设为 `'text'` 时表示文本标注模式 |

### 颜色映射

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `color` | `string` | `'#3B82F6'` | 固定颜色，未设 `colorField` 时所有点使用此色 |
| `colorField` | `string` | - | 颜色映射字段，如 `'category'`；设置后 `colorValues` 必填 |
| `colorValues` | `string[] \| string` | - | 色板数组，如 `['#3B82F6','#10B981','#F59E0B']`，按字段值顺序对应；或主题色板名 |

### 大小映射

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `number` | `12` | 固定点大小（像素），未设 `sizeField` 时所有点使用此值 |
| `sizeField` | `string` | - | 大小映射字段，如 `'population'`；设置后 `sizeValues` 必填 |
| `sizeValues` | `number[]` | - | 大小断点值数组，如 `[4, 12, 24]`，从最小到最大 |

### 视觉与交互

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `opacity` | `number` | `1` | 不透明度 (0~1)，`'cylinder'` 形状建议 0.8~0.9 以便看到重叠 |
| `blend` | `'normal' \| 'additive' \| 'subtractive' \| 'max'` | `'normal'` | 混合模式：`'additive'` 让重叠区域变亮，适合展示密度（如夜间灯光） |
| `active` | `boolean \| { color: string }` | - | hover 高亮：`true` 使用主题默认色，`{ color: '#FFD93D' }` 自定义高亮色 |
| `select` | `boolean \| { color: string }` | - | 点击选中态，行为与 `active` 类似 |
| `filterField` | `string` | - | 过滤字段，配合 `filterValues` 仅渲染匹配的数据行 |
| `filterValues` | `unknown[]` | - | 过滤值列表，如 `['active', 'pending']`，仅字段值在此数组内的点会渲染 |
| `animate` | [AnimateConfig](#animateconfig) | - | 动画配置，常用于 `'cylinder'` 的生长动画 |
| `style` | `Record<string, unknown>` | - | 详细样式配置，常用项见 [style 子属性](#style-子属性) |

### 事件

| 属性 | 类型 | 说明 |
|------|------|------|
| `onClick` | `(payload: [LayerEventPayload](#layereventpayload)) => void` | 点击点位触发，`feature` 中包含该点的原始数据 |
| `onMouseMove` | `(payload: LayerEventPayload) => void` | 鼠标在点上移动时持续触发，适合实现 tooltip 跟随 |
| `onMouseEnter` | `(payload: LayerEventPayload) => void` | 鼠标进入点位区域 |
| `onMouseLeave` | `(payload: LayerEventPayload) => void` | 鼠标离开点位区域 |

### 公共属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | `true` | 图层可见性，`false` 时数据保留但不渲染 |
| `zIndex` | `number` | `0` | 图层堆叠层级，值越大越靠上 |
| `minZoom` | `number` | - | 最小可见缩放级别，低于此级别图层隐藏 |
| `maxZoom` | `number` | - | 最大可见缩放级别，高于此级别图层隐藏 |
| `autoFit` | `boolean` | `false` | 数据加载后自动平移缩放到数据范围，适合首次加载 |
| `name` | `string` | `'point'` | 图层名称，用于 [LayerSwitchControl](../controls/layer-switch-control) 等引用 |
| `id` | `string` | 自动生成 | 图层唯一标识，同一 AiMap 内不可重复 |

## 子类型定义

### SourceConfig

JSON/CSV 数据源的经纬度字段映射，`sourceType='json'` 时必填：

```typescript
interface SourceConfig {
  x?: string;          // 经度字段名，默认 'lng'
  y?: string;          // 纬度字段名，默认 'lat'
  x1?: string;         // 终点经度（弧线图层用）
  y1?: string;         // 终点纬度（弧线图层用）
  coordinates?: string; // GeoJSON 坐标字段路径
  parser?: Record<string, unknown>;
  transforms?: Array<Record<string, unknown>>;
}
```

### AnimateConfig

```typescript
interface AnimateConfig {
  enable: boolean;       // 是否开启动画
  speed?: number;        // 动画速度倍率
  duration?: number;     // 单次动画时长（ms）
  trailLength?: number;  // 尾迹长度（0~1），仅线/弧线图层有效
  repeat?: number;       // 重复次数，-1 为无限循环
}
```

### LayerEventPayload

所有图层事件的回调参数类型：

```typescript
interface LayerEventPayload {
  layerId: string;                          // 触发事件的图层 ID
  layerType: 'point' | 'line' | 'polygon' | 'heatmap' | 'raster' | 'image';
  originalEvent: unknown;                   // L7 原始事件对象
  lng: number;                              // 点击位置经度
  lat: number;                              // 点击位置纬度
  feature?: Record<string, unknown>;        // 命中数据点的完整属性
}
```

### style 子属性

`style` 对象的常用属性（不同 shape 支持的子属性略有差异）：

| 属性 | 类型 | 说明 |
|------|------|------|
| `strokeWidth` | `number` | 描边宽度（px），`shape='circle'` 时有效 |
| `stroke` | `string` | 描边颜色 |
| `opacity` | `number` | 单点不透明度，可与图层级 `opacity` 叠加 |
| `textAllowOverlap` | `boolean` | `shape='text'` 时是否允许文字重叠，`true` 会显示所有标注但可能遮挡 |
| `height` | `number` | `shape='cylinder'` 时的柱体高度 |

## 示例

### 基础用法 — 城市散点标注

```tsx
import { AiMap, PointLayer } from '@antv/aimapui'

const cities = [
  { lng: 116.397, lat: 39.908, name: '北京', category: '直辖市' },
  { lng: 121.473, lat: 31.230, name: '上海', category: '直辖市' },
  { lng: 113.264, lat: 23.129, name: '广州', category: '省会' },
  { lng: 114.057, lat: 22.543, name: '深圳', category: '经济特区' },
]

<AiMap map={{ basemap: 'gaode', center: [108, 34], zoom: 4 }}>
  <PointLayer
    source={cities}
    sourceType="json"
    sourceConfig={{ x: 'lng', y: 'lat' }}
    size={10}
    colorField="category"
    colorValues={['#3B82F6', '#10B981', '#F59E0B']}
  />
</AiMap>
```

### 分类着色 + 交互高亮

按 `category` 字段映射颜色，点击时高亮并展示信息：

```tsx
<PointLayer
  source={cities}
  sourceType="json"
  sourceConfig={{ x: 'lng', y: 'lat' }}
  size={12}
  colorField="category"
  colorValues={['#3B82F6', '#10B981', '#F59E0B']}
  active={{ color: '#FFD93D' }}
  onClick={(e) => {
    console.log('点击了', e.feature?.name, e.feature?.category)
  }}
/>
```

### 3D 柱体 — GDP 可视化

使用 `cylinder` 形状，按数值映射柱体高度：

```tsx
<PointLayer
  source={cities}
  sourceType="json"
  sourceConfig={{ x: 'lng', y: 'lat' }}
  shape="cylinder"
  sizeField="gdp"
  sizeValues={[5, 30]}
  colorField="gdp"
  colorValues={['#93C5FD', '#1D4ED8']}
  opacity={0.9}
  animate={{ enable: true, duration: 1000 }}
/>
```

> **提示：** `cylinder` 模式需要地图有 pitch 倾角才能看到 3D 效果，设置 `map={{ pitch: 45 }}`。

### 文本标注

用 `shape='text'` 渲染地名标注，`shapeField` 指定文本字段：

```tsx
<PointLayer
  source={cities}
  sourceType="json"
  sourceConfig={{ x: 'lng', y: 'lat' }}
  shape="text"
  shapeField="name"
  size={12}
  color="#0f172a"
  style={{ stroke: '#fff', strokeWidth: 2, textAllowOverlap: true }}
/>
```

### 数据过滤 — 仅显示活跃状态

```tsx
<PointLayer
  source={stores}
  sourceType="json"
  sourceConfig={{ x: 'lng', y: 'lat' }}
  filterField="status"
  filterValues={['active', 'pending']}
  colorField="status"
  colorValues={['#10B981', '#F59E0B']}
  size={8}
/>
```

## 注意事项

- `shape='cylinder'` 依赖 WebGL 渲染，在部分低端移动设备上可能表现不佳；数据量超过 1 万条时建议降级为 `'circle'`
- `shape='text'` 与 [Marker](../interaction/marker) 的区别：PointLayer text 标注是 WebGL 渲染，适合成千上万条地名；Marker 是 DOM 元素，适合少量富文本标注
- `textAllowOverlap: true` 会渲染所有标注不避让，大数据量时可能导致文字堆叠不可读；设为 `false`（默认）时 L7 会自动碰撞避让
- `blend='additive'` 在深色底图上效果最好，浅色底图下叠加区域会变白
- `sourceType` 默认为 `'json'`，GeoJSON 数据需显式设为 `'geojson'`
- `autoFit={true}` 会触发地图飞行动画调整视口，仅在首次数据加载时触发

## 相关组件

- [LineLayer](./line-layer) — 线段/路径图层
- [PolygonLayer](./polygon-layer) — 面状区域图层
- [BubbleLayer](../composite-layers/bubble-layer) — 气泡大小映射图层（基于 PointLayer）
- [HeatmapLayer](./heatmap-layer) — 热力渐变图层
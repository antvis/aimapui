# 基础图层（PointLayer / LineLayer / PolygonLayer / HeatmapLayer / RasterLayer / ImageLayer）

## 快速示例

```tsx
// PointLayer — 散点图
<PointLayer
  source={[{ lng: 116.397, lat: 39.908, name: '北京', value: 42 }]}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  color="#5B8FF9"
  size={12}
  shape="circle"
  onClick={(p) => console.log(p.feature)}
/>

// LineLayer — 路径/弧线
<LineLayer
  source={flowData}
  sourceType="geojson"
  color="#5B8FF9"
  size={2}
  shape="arc"
  animate={{ enable: true, speed: 1, duration: 2000, trailLength: 0.3 }}
/>

// PolygonLayer — 区域填充
<PolygonLayer
  source={geojsonData}
  sourceType="geojson"
  colorField="density"
  colorValues={['#f0f9e8', '#bae4bc', '#7bccc4', '#43a2ca', '#0868ac']}
/>

// HeatmapLayer — 热力图
<HeatmapLayer
  source={points}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  colorField="value"
  size={30}
/>

// RasterLayer — 栅格瓦片
<RasterLayer
  source="https://example.com/{z}/{x}/{y}.png"
  sourceType="rasterTile"
/>

// ImageLayer — 图片叠层
<ImageLayer
  source="https://example.com/overlay.png"
  sourceType="image"
  style={{ bounds: [[119, 29], [122, 32]] }}
/>
```

## 公共属性

所有基础图层继承自 `LayerSchema`，组件化模式下额外的 Props：

| 属性 | 类型 | 说明 |
|------|------|------|
| `source` | `unknown` | **必填** — 数据源 |
| `sourceType` | `SourceType` | 数据类型，默认 `'json'` |
| `sourceConfig` | `SourceConfig` | 字段映射配置 |
| `onClick` | `(payload: LayerEventPayload) => void` | 点击回调 |
| `onMouseMove` | `(payload: LayerEventPayload) => void` | 鼠标移动 |
| `onMouseEnter` | `(payload: LayerEventPayload) => void` | 鼠标进入 |
| `onMouseLeave` | `(payload: LayerEventPayload) => void` | 鼠标离开 |

其余 `color`, `colorField`, `colorValues`, `size`, `sizeField`, `sizeValues`, `shape`, `shapeField`, `shapeValues`, `style`, `opacity`, `blend`, `visible`, `zIndex`, `minZoom`, `maxZoom`, `autoFit`, `filterField`, `filterValues`, `animate`, `active`, `select`, `name`, `events` 均与 LayerSchema 一致。

## 数据源配置

### JSON 数组
```tsx
<PointLayer
  source={[{ lng: 116, lat: 39, name: '北京' }]}
  sourceConfig={{ x: 'lng', y: 'lat' }}  // 必须指定经纬度字段
/>
```

### GeoJSON
```tsx
<PolygonLayer
  source={geojsonData}
  sourceType="geojson"
/>
```

### OD 数据（弧线）
```tsx
<LineLayer
  source={odData}
  sourceConfig={{ x: 'fromLng', y: 'fromLat', x1: 'toLng', y1: 'toLat' }}
  shape="arc"
/>
```

## Shape 类型

| 图层 | 可用 Shape |
|------|-----------|
| PointLayer | `circle` (默认) / `square` / `triangle` / `text` / `image` / `cylinder` |
| LineLayer | `line` (默认) / `arc` / `arc3d` / `greatcircle` / `wall` / `flowline` / `dash` |
| PolygonLayer | `fill` (默认) / `extrude` / `water` |

## 视觉映射

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
<PointLayer
  source={data}
  shapeField="name"
  shapeValues="text"
  color="#333"
  size={12}
  style={{ textAnchor: 'top', textOffset: [0, 15] }}
/>
```

## 图层适配器

每个图层类型有对应的适配器，将 LayerSchema 转换为 L7 链式 API 调用：

```tsx
import { adaptPointLayer, adaptLineLayer, adaptPolygonLayer } from '@antv/aimapui';
```

## 相关文档

- [schema-system.md](../schema/schema-system.md) — LayerSchema 完整属性
- [composite-layers.md](../composite/composite-layers.md) — 复合图层
- [event-bus.md](../core/event-bus.md) — 事件系统
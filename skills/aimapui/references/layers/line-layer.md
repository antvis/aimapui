# LineLayer — 线图层

线图层用于渲染路径、弧线和 OD 流向线。支持 line、arc、arc3d、greatcircle 四种形状，内置流动动画能力。

## Examples

```tsx
import { LineLayer } from '@antv/aimapui';

// 基础路径线
<LineLayer
  source={geojsonData}
  sourceType="geojson"
  color="#5B8FF9"
  size={2}
/>

// OD 弧线
<LineLayer
  source={odData}
  sourceConfig={{ x: 'fromLng', y: 'fromLat', x1: 'toLng', y1: 'toLat' }}
  shape="arc"
  color="#2563eb"
  size={1.5}
/>

// 3D 弧线 + 流动动画
<LineLayer
  source={odData}
  sourceConfig={{ x: 'fromLng', y: 'fromLat', x1: 'toLng', y1: 'toLat' }}
  shape="arc3d"
  colorField="category"
  colorValues={['#2563eb', '#10b981', '#f59e0b']}
  size={2}
  animate={{ enable: true, speed: 1, duration: 2000, trailLength: 0.3 }}
/>

// 大圆航线
<LineLayer
  source={odData}
  sourceConfig={{ x: 'fromLng', y: 'fromLat', x1: 'toLng', y1: 'toLat' }}
  shape="greatcircle"
  color="#8b5cf6"
  size={2}
/>

// 字段映射宽度
<LineLayer
  source={flowData}
  sourceConfig={{ x: 'lng', y: 'lat', x1: 'lng1', y1: 'lat1' }}
  shape="arc"
  colorField="flow"
  colorValues={['#dbeafe', '#2563eb']}
  sizeField="flow"
  sizeValues={[1, 8]}
/>
```

## Shape 类型

| shape | 说明 | 适用场景 |
|-------|------|---------|
| `line` | 直线（默认） | 路径、道路、边界 |
| `arc` | 弧线 | OD 流向 |
| `arc3d` | 3D 弧线 | 3D OD 流向 |
| `greatcircle` | 大圆航线 | 长距离航线、地球曲率 |

## 数据格式

```ts
// JSON 数组（OD 弧线）
[
  { fromLng: 116.397, fromLat: 39.908, toLng: 121.473, toLat: 31.230, flow: 100 },
  { fromLng: 116.397, fromLat: 39.908, toLng: 113.264, toLat: 23.129, flow: 80 },
]

// GeoJSON（路径线）
{
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[116,39],[121,31]] }, properties: { name: '京沪线' } }
  ]
}
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `object[] \| GeoJSON \| string` | **必填** | 数据源 |
| `sourceType` | `SourceType` | `'json'` | 数据类型 |
| `sourceConfig` | `SourceConfig` | — | 字段映射（弧线需 `x`/`y`/`x1`/`y1`） |
| `color` | `string` | — | 固定颜色 |
| `colorField` | `string` | — | 颜色映射字段 |
| `colorValues` | `string[] \| string` | — | 颜色映射值 |
| `size` | `number` | — | 固定线宽 |
| `sizeField` | `string` | — | 线宽映射字段 |
| `sizeValues` | `number[]` | — | 线宽映射值 |
| `shape` | `string` | `'line'` | 线形状 |
| `shapeField` | `string` | — | 形状映射字段 |
| `shapeValues` | `string[] \| string` | — | 形状映射值 |
| `style` | `Record<string, unknown>` | — | 样式扩展 |
| `opacity` | `number` | — | 透明度 |
| `blend` | `string` | — | 混合模式 |
| `visible` | `boolean` | `true` | 可见性 |
| `zIndex` | `number` | — | 层级 |
| `minZoom` | `number` | — | 最小可见缩放 |
| `maxZoom` | `number` | — | 最大可见缩放 |
| `autoFit` | `boolean` | — | 自动缩放 |
| `filterField` | `string` | — | 过滤字段 |
| `filterValues` | `unknown[]` | — | 过滤值 |
| `animate` | `AnimateConfig` | — | 动画配置 |
| `active` | `ActiveConfig` | — | 悬停高亮 |
| `select` | `SelectConfig` | — | 选中样式 |
| `events` | `LayerEventSchema` | — | 事件配置 |
| `onClick` | `(payload) => void` | — | 点击回调 |
| `onMouseMove` | `(payload) => void` | — | 鼠标移动 |
| `onMouseEnter` | `(payload) => void` | — | 鼠标进入 |
| `onMouseLeave` | `(payload) => void` | — | 鼠标离开 |
| `onLayerCreated` | `(layer) => void` | — | 图层创建回调 |

## AnimateConfig

```ts
interface AnimateConfig {
  enable: boolean;       // 是否启用动画
  speed?: number;        // 动画速度
  duration?: number;     // 动画持续时间 (ms)
  trailLength?: number;  // 尾迹长度 0~1
  repeat?: number;       // 重复次数
}
```

## 相关文档

- [index.md](index.md) — 基础图层概览
- [point-layer.md](point-layer.md) — 点图层
- [polygon-layer.md](polygon-layer.md) — 面图层
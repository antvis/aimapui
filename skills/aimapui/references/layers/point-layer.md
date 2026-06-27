# PointLayer — 点图层

点图层是最常用的基础图层，用于渲染散点、符号和文字标注。支持圆形、方形、三角形、菱形、柱状体和文字 6 种形状。

## Examples

```tsx
import { PointLayer } from '@antv/aimapui';

// 基础散点图
<PointLayer
  source={[{ lng: 116.397, lat: 39.908, name: '北京', value: 42 }]}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  color="#5B8FF9"
  size={12}
  shape="circle"
/>

// 字段映射：分类色 + 尺寸
<PointLayer
  source={data}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  colorField="category"
  colorValues={['#5B8FF9', '#F6BD16', '#5AD8A6', '#E86452']}
  sizeField="value"
  sizeValues={[6, 30]}
  shape="circle"
/>

// 文字标注
<PointLayer
  source={data}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  shapeField="name"
  shapeValues="text"
  color="#333"
  size={12}
  style={{ textAnchor: 'top', textOffset: [0, 15], fontWeight: '500' }}
/>

// 3D 柱状体
<PointLayer
  source={data}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  shape="cylinder"
  colorField="value"
  colorValues={['#dbeafe', '#2563eb']}
  sizeField="value"
  sizeValues={[10, 80]}
/>

// 带弹窗交互
<PointLayer
  source={data}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  color="#2563eb"
  size={10}
  shape="circle"
  events={{
    enablePopup: true,
    popupTrigger: 'click',
    popupFields: ['name', 'value', 'category'],
  }}
  onClick={(payload) => console.log('clicked:', payload.feature)}
/>
```

## Shape 类型

| shape | 说明 | 适用场景 |
|-------|------|---------|
| `circle` | 圆形（默认） | 通用散点 |
| `square` | 方形 | 网格/矩阵数据 |
| `triangle` | 三角形 | 方向指示 |
| `diamond` | 菱形 | 特殊标记 |
| `text` | 文字 | 标注/标签 |
| `cylinder` | 3D 柱状体 | 3D 数据可视化 |

## 数据格式

```ts
// JSON 数组
[
  { lng: 116.397, lat: 39.908, name: '北京', value: 42 },
  { lng: 121.473, lat: 31.230, name: '上海', value: 35 },
]

// GeoJSON
{
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.397, 39.908] }, properties: { name: '北京' } }
  ]
}
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `object[] \| GeoJSON \| string` | **必填** | 数据源 |
| `sourceType` | `SourceType` | `'json'` | 数据类型 |
| `sourceConfig` | `SourceConfig` | — | 字段映射（JSON 时需指定 `x`/`y`） |
| `color` | `string` | — | 固定颜色 |
| `colorField` | `string` | — | 颜色映射字段 |
| `colorValues` | `string[] \| string` | — | 颜色映射值 |
| `size` | `number` | — | 固定尺寸 |
| `sizeField` | `string` | — | 尺寸映射字段 |
| `sizeValues` | `number[]` | — | 尺寸映射值 |
| `shape` | `string` | `'circle'` | 形状 |
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

## 相关文档

- [index.md](index.md) — 基础图层概览
- [line-layer.md](line-layer.md) — 线图层
- [polygon-layer.md](polygon-layer.md) — 面图层
# PolygonLayer — 面图层

面图层用于渲染区域填充和 3D 挤出，通常配合 GeoJSON 数据使用。支持 fill 和 extrusion 两种形状。

## Examples

```tsx
import { PolygonLayer } from '@antv/aimapui';

// 基础区域填充
<PolygonLayer
  source={geojsonData}
  sourceType="geojson"
  color="#2563eb"
  style={{ opacity: 0.6 }}
/>

// 数据驱动色阶
<PolygonLayer
  source={geojsonData}
  sourceType="geojson"
  colorField="density"
  colorValues={['#f0f9e8', '#bae4bc', '#7bccc4', '#43a2ca', '#0868ac']}
/>

// 3D 挤出
<PolygonLayer
  source={geojsonData}
  sourceType="geojson"
  shape="extrusion"
  colorField="population"
  colorValues={['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb']}
  sizeField="population"
  sizeValues={[0, 5000]}
/>

// 带弹窗交互
<PolygonLayer
  source={geojsonData}
  sourceType="geojson"
  colorField="value"
  colorValues={['#fef0d9', '#fdcc8a', '#fc8d59', '#e34a33', '#b30000']}
  events={{
    enablePopup: true,
    popupTrigger: 'click',
    popupFields: ['name', 'value'],
  }}
  onClick={(payload) => console.log('region clicked:', payload.feature)}
/>
```

## Shape 类型

| shape | 说明 | 适用场景 |
|-------|------|---------|
| `fill` | 区域填充（默认） | 行政区划、热力分区 |
| `extrusion` | 3D 挤出 | 3D 柱状地图、人口密度 |

## 数据格式

```ts
// GeoJSON Polygon
{
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[116,39],[117,39],[117,40],[116,40],[116,39]]]
      },
      properties: { name: '北京', value: 100 }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        coordinates: [[[[121,31],[122,31],[122,32],[121,32],[121,31]]]]
      },
      properties: { name: '上海', value: 80 }
    }
  ]
}
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `GeoJSON \| string` | **必填** | 数据源（通常为 GeoJSON） |
| `sourceType` | `SourceType` | `'geojson'` | 数据类型 |
| `sourceConfig` | `SourceConfig` | — | 字段映射 |
| `color` | `string` | — | 固定填充色 |
| `colorField` | `string` | — | 颜色映射字段 |
| `colorValues` | `string[] \| string` | — | 颜色映射值 |
| `size` | `number` | — | 固定高度（extrusion 模式） |
| `sizeField` | `string` | — | 高度映射字段 |
| `sizeValues` | `number[]` | — | 高度映射值 |
| `shape` | `string` | `'fill'` | 形状 |
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
- [point-layer.md](point-layer.md) — 点图层
- [line-layer.md](line-layer.md) — 线图层
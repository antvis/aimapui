# HeatmapLayer — 热力图

热力图图层用于渲染密度热力分布，支持经典热力图和蜂窝聚合（hexagon）两种模式。通过 `sourceConfig.transforms` 可配置网格聚合、蜂窝聚合等空间变换。

## Examples

```tsx
import { HeatmapLayer } from '@antv/aimapui';

// 经典热力图
<HeatmapLayer
  source={points}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  colorField="value"
  size={30}
/>

// 蜂窝聚合（hexagon 热力）
<HeatmapLayer
  source={points}
  sourceConfig={{
    x: 'lng',
    y: 'lat',
    transforms: [{
      type: 'hexagon',
      size: 100,
      field: 'value',
      method: 'sum',
    }],
  }}
  shape="hexagonColumn"
  colorField="value"
  colorValues={['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb']}
  style={{ coverage: 0.8, angle: 0 }}
/>

// 网格聚合
<HeatmapLayer
  source={points}
  sourceConfig={{
    x: 'lng',
    y: 'lat',
    transforms: [{
      type: 'grid',
      size: 50,
      field: 'count',
      method: 'sum',
    }],
  }}
  shape="gridColumn"
  colorField="count"
  colorValues={['#f0f9e8', '#bae4bc', '#7bccc4', '#43a2ca', '#0868ac']}
/>

// 带交互
<HeatmapLayer
  source={points}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  colorField="intensity"
  colorValues={['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494']}
  size={40}
  onClick={(payload) => console.log('heatmap clicked:', payload)}
  onMouseMove={(payload) => console.log('hover:', payload)}
/>
```

## 空间变换 (Transforms)

`sourceConfig.transforms` 支持以下聚合类型：

| transform.type | 说明 | 参数 |
|---------------|------|------|
| `hexagon` | 六边形蜂窝聚合 | `size`（边长）, `field`（聚合字段）, `method`（sum/mean/min/max/count） |
| `grid` | 矩形网格聚合 | `size`（边长）, `field`（聚合字段）, `method`（聚合方法） |

## Shape 类型

| shape | 说明 |
|-------|------|
| `heatmap` | 经典热力图（默认） |
| `hexagonColumn` | 3D 六边形柱状 |
| `hexagon` | 2D 六边形 |
| `gridColumn` | 3D 网格柱状 |
| `grid` | 2D 网格 |

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `object[] \| GeoJSON \| string` | **必填** | 数据源 |
| `sourceType` | `SourceType` | `'json'` | 数据类型 |
| `sourceConfig` | `SourceConfig` | — | 字段映射 + transforms |
| `color` | `string` | — | 固定颜色 |
| `colorField` | `string` | — | 颜色映射字段 |
| `colorValues` | `string[] \| string` | — | 颜色映射值 |
| `size` | `number` | — | 热力半径 / 权重 |
| `sizeField` | `string` | — | 尺寸映射字段 |
| `sizeValues` | `number[]` | — | 尺寸映射值 |
| `shape` | `string` | `'heatmap'` | 形状 |
| `style` | `Record<string, unknown>` | — | 样式扩展（如 `coverage`, `angle`） |
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
- [hexagon-layer.md](../composite/hexagon-layer.md) — 蜂窝热力复合图层
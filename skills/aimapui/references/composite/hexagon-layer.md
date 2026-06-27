# HexagonLayer — 蜂窝热力

基于六边形（H3）空间聚合的热力图复合图层，将散点数据聚合为六边形柱状网格，支持多种聚合方法。底层使用 HeatmapLayer 的 hexagonColumn 形状渲染。

## Examples

```tsx
import { HexagonLayer } from '@antv/aimapui';

// 基础用法：按字段求和聚合
<HexagonLayer
  source={points}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  colorField="count"
  colorValues={['#f0f9e8', '#bae4bc', '#7bccc4', '#43a2ca', '#0868ac']}
  hexSize={100}
  weightField="value"
  weightMethod="sum"
/>

// 计数聚合 + 交互
<HexagonLayer
  source={points}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  colorField="count"
  colorValues={['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb']}
  hexSize={50}
  weightMethod="count"
  onClick={(payload) => console.log('hexagon clicked:', payload)}
  onMouseMove={(payload) => console.log('hover:', payload)}
/>

// 均值聚合
<HexagonLayer
  source={sensorData}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  colorField="avgValue"
  weightField="temperature"
  weightMethod="mean"
  hexSize={200}
  colorValues={['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494']}
/>
```

## Enums

- **HexagonWeightMethod:** `'sum'` | `'mean'` | `'min'` | `'max'` | `'count'`

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `object[]` | **必填** | 散点数据源 |
| `sourceType` | `string` | `'json'` | 数据类型 |
| `sourceConfig` | `{ x?, y? }` | — | 字段映射（经纬度字段名） |
| `hexSize` | `number` | `100` | 六边形边长（像素） |
| `weightField` | `string` | `'h12'` | 聚合权重字段 |
| `weightMethod` | `HexagonWeightMethod` | `'sum'` | 聚合方法 |
| `color` | `string` | — | 固定颜色 |
| `colorField` | `string` | **必填** | 颜色映射字段 |
| `colorValues` | `string[]` | — | 颜色映射色阶 |
| `active` | `ActiveConfig` | — | 悬停高亮配置 |
| `select` | `SelectConfig` | — | 选中配置 |
| `size` | `number` | — | 柱体高度 |
| `style` | `Record<string, unknown>` | `{ coverage: 0.8, angle: 0 }` | 样式扩展 |
| `onClick` | `(payload) => void` | — | 点击回调 |
| `onMouseMove` | `(payload) => void` | — | 鼠标移动回调 |

## 相关文档

- [index.md](index.md) — 复合图层概览
- [h3-layer.md](h3-layer.md) — H3 六边形网格（预计算 H3 索引）
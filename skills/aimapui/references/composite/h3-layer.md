# H3Layer H3 网格图层（v0.3.1+）

基于 [H3](https://h3geo.org/) 六边形索引的网格可视化复合图层。接收包含 H3 索引的 JSON 数据，自动转换为六边形多边形渲染。

## 快速示例

```tsx
import { AiMap, H3Layer } from '@antv/aimapui';

const data = [
  { h3: '89283082837ffff', value: 120, name: 'A区' },
  { h3: '8928308280fffff', value: 280, name: 'B区' },
  { h3: '89283082873ffff', value: 95, name: 'C区' },
];

<AiMap autoFit map={{ basemap: 'gaode', center: [-122.4, 37.8], zoom: 13 }}>
  <H3Layer
    source={data}
    h3Field="h3"
    colorField="value"
    colorValues={['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb']}
  />
</AiMap>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `H3DataItem[]` | — | 必填，JSON 数组，每项包含 H3 索引和数据字段 |
| `h3Field` | `string` | `'h3'` | H3 索引字段名 |
| `color` | `string` | — | 固定填充色 |
| `colorField` | `string` | — | 颜色映射字段 |
| `colorValues` | `string[]` | — | 颜色映射色阶 |
| `opacity` | `number` | `0.8` | 填充透明度 |
| `showStroke` | `boolean` | `true` | 是否显示描边 |
| `strokeColor` | `string` | `'rgba(255,255,255,0.3)'` | 描边颜色 |
| `strokeWidth` | `number` | `0.5` | 描边宽度 |
| `hoverEffect` | `boolean` | `true` | 悬停高亮 |
| `clickEffect` | `boolean` | `false` | 点击选中 |
| `active` | `ActiveConfig` | — | 悬停高亮配置（覆盖 hoverEffect） |
| `select` | `SelectConfig` | — | 选中配置（覆盖 clickEffect） |
| `showLabel` | `boolean` | `false` | 是否显示标签 |
| `labelField` | `string` | — | 标签显示字段 |
| `labelColor` | `string` | `'#333'` | 标签颜色 |
| `labelSize` | `number` | `12` | 标签字号 |
| `visible` | `boolean` | `true` | 图层可见性 |
| `zIndex` | `number` | — | 图层层级 |
| `autoFit` | `boolean` | — | 自动缩放到数据范围 |
| `onClick` | `(payload) => void` | — | 点击回调 |
| `onMouseMove` | `(payload) => void` | — | 鼠标移动回调 |
| `onMouseEnter` | `(payload) => void` | — | 鼠标进入回调 |
| `onMouseLeave` | `(payload) => void` | — | 鼠标离开回调 |

## 数据格式

数据为 JSON 数组，每项包含一个 H3 索引字段和任意数据字段：

```ts
interface H3DataItem {
  [key: string]: unknown;  // h3 索引 + 业务数据
}

// 示例
const data = [
  { h3: '89283082837ffff', value: 120, category: '商业' },
  { h3: '8928308280fffff', value: 280, category: '住宅' },
];
```

H3 索引的分辨率（0-15）决定六边形大小，组件自动识别并渲染对应尺寸的六边形。

## 内部渲染结构

H3Layer 内部将 H3 索引转换为 GeoJSON 多边形，通过以下基础图层组合渲染：

1. **PolygonLayer** — 六边形填充（始终渲染）
2. **LineLayer** — 六边形描边（`showStroke` 控制）
3. **PointLayer** — 文本标签（`showLabel` 控制，定位在六边形中心）

## 预置配色

```ts
import { H3_SEQUENTIAL_COLORS } from '@antv/aimapui';
// ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb']
```

## 相关文档

- [composite-layers.md](composite-layers.md) — 复合图层概览
- [basemap-factory.md](../core/basemap-factory.md) — 底图工厂

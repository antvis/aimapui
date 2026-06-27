# FillLayer — 区域填充

基于 GeoJSON 的区域填充复合图层，支持数据驱动配色、描边、文字标签、hover/click 交互、区域下钻和缩放定位。底层由 PolygonLayer（填充）+ LineLayer（描边）+ PointLayer（标签）组合渲染。

## Examples

```tsx
import { FillLayer, CHOROPLETH_SEQUENTIAL_COLORS } from '@antv/aimapui';

// 基础用法：数据驱动色阶
<FillLayer
  source={geojsonData}
  sourceType="geojson"
  colorField="density"
  colorValues={CHOROPLETH_SEQUENTIAL_COLORS}
  regionIdField="name"
/>

// 带标签和交互
<FillLayer
  source={geojsonData}
  colorField="population"
  colorMapping="sequential"
  showLabel
  labelField="name"
  labelColor="#0f172a"
  labelSize={11}
  showStroke
  strokeColor="rgba(255,255,255,0.30)"
  strokeWidth={0.5}
  hoverEffect
  clickEffect
  zoomToRegionOnClick
  onRegionClick={(payload) => console.log('clicked region:', payload.feature)}
/>

// 发散色阶 + 占比显示
<FillLayer
  source={geojsonData}
  colorField="growth"
  colorMapping="diverging"
  valueField="growth"
  percentageField="growthRate"
  nameField="region"
  tooltipEffect
  onDrilldown={(feature) => navigateToDetail(feature)}
/>
```

## Enums

- **FillColorMapping:** `'sequential'` | `'diverging'` | `'categorical'`

## Built-in Constants

```ts
import {
  CHOROPLETH_SEQUENTIAL_COLORS,  // ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb']
  CHOROPLETH_DIVERGING_COLORS,   // ['#dc2626', '#fca5a5', '#e5e7eb', '#86efac', '#16a34a']
  CHOROPLETH_CATEGORICAL_COLORS, // ['#2563eb', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', ...]
} from '@antv/aimapui';
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `GeoJSON \| string` | **必填** | 数据源 |
| `sourceType` | `string` | `'geojson'` | 数据类型 |
| `color` | `string` | `'#2563eb'` | 固定填充色（与 `colorField` 互斥） |
| `colorField` | `string` | — | 颜色映射字段 |
| `colorValues` | `string[]` | — | 颜色映射色阶（覆盖 `colorMapping`） |
| `colorMapping` | `FillColorMapping` | `'sequential'` | 配色方案（未传 `colorValues` 时生效） |
| `showStroke` | `boolean` | `true` | 是否显示描边 |
| `strokeColor` | `string` | `'rgba(255,255,255,0.30)'` | 描边颜色 |
| `strokeWidth` | `number` | `0.5` | 描边宽度 |
| `hoverEffect` | `boolean` | `true` | hover 高亮 |
| `clickEffect` | `boolean` | `true` | click 选中 |
| `stickySelection` | `boolean` | `true` | 再次点击是否取消选中 |
| `tooltipEffect` | `boolean` | `true` | 弹窗提示 |
| `tooltipFields` | `string[]` | — | 弹窗展示字段 |
| `tooltipTemplate` | `string` | — | 弹窗模板 `{{field}}` |
| `regionIdField` | `string` | `'name'` | 区域标识字段 |
| `highlightStrokeColor` | `string` | `'#2563eb'` | 高亮描边颜色 |
| `highlightStrokeWidth` | `number` | `2` | 高亮描边宽度 |
| `zoomToRegionOnClick` | `boolean` | `true` | 点击区域自动缩放 |
| `clickZoomPadding` | `number` | `40` | 缩放 padding |
| `clickZoomDelta` | `number` | `1.2` | 缩放增量 |
| `showLabel` | `boolean` | `false` | 是否显示标签 |
| `labelField` | `string` | `'name'` | 标签显示字段 |
| `labelColor` | `string` | `'#0f172a'` | 标签颜色 |
| `labelSize` | `number` | `11` | 标签字号 |
| `labelAreaThreshold` | `number` | `0.00005` | 最小显示面积阈值（小于此值不显示标签） |
| `labelHaloWidth` | `number` | `2` | 标签光晕宽度 |
| `minLabelZoom` | `number` | — | 显示标签的最小缩放级别 |
| `valueField` | `string` | — | 弹窗中展示的数值字段 |
| `percentageField` | `string` | — | 弹窗中展示的占比字段 |
| `nameField` | `string` | — | 弹窗中展示的名称字段 |
| `onRegionClick` | `(payload) => void` | — | 区域点击回调 |
| `onDrilldown` | `(feature) => void` | — | 下钻回调 |
| `onLayerCreated` | `(layer) => void` | — | 图层创建回调 |
| `active` | `ActiveConfig` | — | 悬停高亮配置 |
| `select` | `SelectConfig` | — | 选中配置 |

## 相关文档

- [index.md](index.md) — 复合图层概览
# FillLayer

填充图组件（填充 + 描边 + 文字），用于分级统计地图。支持顺序、发散、分类三种颜色映射。

## 导入

```tsx
import { FillLayer } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `source` | `any` | - | 数据源（必填） |
| `sourceType` | `string` | `'geojson'` | 数据源类型 |
| `colorMapping` | `'sequential' \| 'diverging' \| 'categorical'` | `'sequential'` | 颜色映射模式 |
| `showStroke` | `boolean` | `true` | 是否显示描边 |
| `strokeColor` | `string` | - | 描边颜色 |
| `strokeWidth` | `number` | - | 描边宽度 |
| `hoverEffect` | `boolean` | `true` | 是否开启悬停高亮 |
| `clickEffect` | `boolean` | `true` | 是否开启点击选中 |
| `stickySelection` | `boolean` | `false` | 是否保持选中状态 |
| `tooltipEffect` | `boolean` | `false` | 是否开启 Tooltip |
| `tooltipFields` | `string[]` | - | Tooltip 显示字段 |
| `showLabel` | `boolean` | `false` | 是否显示标签 |
| `labelField` | `string` | - | 标签取值字段 |
| `onRegionClick` | `function` | - | 区域点击回调 |
| `onDrilldown` | `function` | - | 下钻回调 |

## 示例

```tsx
<FillLayer source={geojson} colorMapping="sequential" showLabel hoverEffect />
```

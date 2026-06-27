# BubbleLayer — 气泡图

用圆的大小编码数值字段，适合在区域底图上叠加显示数值指标。

```tsx
import { BubbleLayer, BUBBLE_SIZE_LEVELS } from '@antv/aimapui';

<BubbleLayer
  source={cityData}
  sourceType="geojson"
  sizeField="population"
  sizeValues={BUBBLE_SIZE_LEVELS}  // [8, 16, 32, 48, 64]
  color="#2563eb"
  labelField="name"
  labelTrigger="hover"          // 'always' | 'hover'，大数据量用 hover
  hoverEffect={true}            // 默认启用
  clickEffect={true}            // 默认启用
  tooltipEffect={true}          // 默认启用
  semanticColorField="status"   // 按 primary/warning/error/success 着色
/>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `labelField` | `string` | `'name'` | 标签字段 |
| `labelColor` | `string` | `'#0b3b8c'` | 标签颜色 |
| `labelSize` | `number` | `12` | 标签字号 |
| `showLabel` | `boolean` | `true` | 是否显示标签 |
| `labelTrigger` | `'always' \| 'hover'` | `'always'` | 标签触发方式 |
| `bubbleAnchor` | `BubbleAnchor` | `'bottom'` | 气泡锚点 |
| `labelAnchor` | `BubbleAnchor` | `'top'` | 标签锚点 |
| `hoverEffect` | `boolean` | `true` | hover 高亮 |
| `clickEffect` | `boolean` | `true` | click 选中 |
| `tooltipEffect` | `boolean` | `true` | 点击弹窗 |
| `tooltipFields` | `string[]` | — | 弹窗展示字段 |
| `tooltipTemplate` | `string` | — | 弹窗模板 `{{field}}` |
| `semanticColorField` | `string` | — | 语义色板字段 |

## Built-in Constants

- `BUBBLE_SIZE_LEVELS = [8, 16, 32, 48, 64]`
- `BUBBLE_QUALITATIVE_COLORS = { primary: '#2563eb', warning: '#f59e0b', error: '#ef4444', success: '#10b981' }`

> **When to use:** 需要大小编码时用 BubbleLayer；只需颜色分类用 PointLayer；热力渐变用 HeatmapLayer。

# LegendSize

用不同大小的圆来表示数值的量级差异，适合气泡图、分级统计等场景。每个圆的大小直接编码对应数值，是面积映射类图例的推荐选择。

> **何时选择：** 圆的大小映射用 LegendSize；线宽/粗细映射用 [LegendLineWidth](./legend-line-width)；比例圆区间图例用 [LegendProportion](./legend-proportion)（已过时，新项目建议用 LegendSize 替代）。

## 导入

```tsx
import { LegendSize } from '@antv/aimapui'
```

## Props

LegendSize 继承公共交互属性，此处仅列出专有属性。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'size'` | **必填** | 图例类型标识 |
| `title` | `string` | - | 图例标题，显示在圆列表上方；不传则不显示标题行 |
| `fillColor` | `string` | `'#4A90D9'` | 所有圆的统一填充颜色，支持任意 CSS 颜色格式；不支持逐项设不同颜色，如需按类别着色请配合 [LegendCategories](./legend-categories) 使用 |
| `items` | `Array<{ size: number; label: string }>` | **必填** | 圆点列表，`size` 为圆的像素直径（不是半径），`label` 为对应的文字标注；数组按从大到小排列时视觉效果最直观 |
| `className` | `string` | - | 自定义 CSS 类名 |
| `interaction` | [LegendInteractionCallbacks](#legendinteractioncallbacks) | - | 交互回调，不传则图例仅做展示 |

### LegendInteractionCallbacks

| 回调 | 类型 | 说明 |
|------|------|------|
| `onHover` | `(index: number) => void` | 悬停到第 `index` 个圆时触发，移出时回调 `-1` |
| `onToggle` | `(index: number) => void` | 点击第 `index` 个圆时触发，可用于切换对应数据层的显隐 |
| `onBrush` | `(range: [number, number]) => void` | 范围刷选回调（LegendSize 不支持刷选，传入无效果） |

## 示例

### 基础用法 — 城市人口气泡图例

展示不同人口级别对应的圆大小，items 按从大到小排列更直观：

```tsx
import { AiMap, LegendSize } from '@antv/aimapui'

<LegendSize
  type="size"
  title="城市人口"
  fillColor="#3B82F6"
  items={[
    { size: 40, label: '1000万' },
    { size: 24, label: '500万' },
    { size: 8, label: '100万' },
  ]}
/>
```

### 进阶用法 — 多色叠加与交互

配合图层交互实现点击图例项高亮对应气泡；换色后与深色底图更搭配：

```tsx
<LegendSize
  type="size"
  title="GDP 规模"
  fillColor="#F59E0B"
  items={[
    { size: 48, label: '≥2万亿' },
    { size: 28, label: '1~2万亿' },
    { size: 12, label: '<1万亿' },
  ]}
  interaction={{
    onHover: (i) => {
      highlightBubble(i === -1 ? null : i)
    },
    onToggle: (i) => toggleBubbleLayer(i),
  }}
/>
```

## 注意事项

- `size` 是圆的直径而非半径，传入 0 会导致圆不可见但不报错
- `fillColor` 为统一颜色，不支持每个圆设不同颜色；如需颜色+大小双重编码，建议同时使用 [LegendCategories](./legend-categories) 和 LegendSize 组合展示
- 推荐将 `items` 按 `size` 从大到小排列，大圆在上、小圆在下，符合常见的气泡图例视觉习惯
- `items` 数组长度建议不超过 5 个，过多会导致图例占用空间过大且难以区分大小差异

## 相关组件

- [LegendLineWidth](./legend-line-width) — 线宽图例，用线条粗细映射数值
- [LegendProportion](./legend-proportion) — 比例圆区间图例（已过时，推荐 LegendSize 替代）
- [LegendCategories](./legend-categories) — 分类色块图例，可配合 LegendSize 做颜色+大小双重编码
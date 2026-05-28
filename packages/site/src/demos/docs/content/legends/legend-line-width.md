# LegendLineWidth

用不同粗细的线条展示数值与线宽的映射关系，适合流量、路径权重、道路等级等场景。线条宽度直接编码对应数值，与气泡大小图例形成互补。

> **何时选择：** 线宽/粗细映射用 LegendLineWidth；圆的大小映射用 [LegendSize](./legend-size)。

## 导入

```tsx
import { LegendLineWidth } from '@antv/aimapui'
```

## Props

LegendLineWidth 继承公共交互属性，此处仅列出专有属性。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'lineWidth'` | **必填** | 图例类型标识 |
| `title` | `string` | - | 图例标题，显示在线条列表上方；不传则不显示标题行 |
| `color` | `string` | `'#4A90D9'` | 所有线条的统一颜色，支持任意 CSS 颜色格式；不支持逐项设不同颜色 |
| `items` | `Array<{ width: number; label: string }>` | **必填** | 线条列表，`width` 为线条像素宽度（取值建议 1~20，超过 20 视觉上过粗且占用空间），`label` 为对应文字标注 |
| `className` | `string` | - | 自定义 CSS 类名 |
| `interaction` | [LegendInteractionCallbacks](#legendinteractioncallbacks) | - | 交互回调，不传则图例仅做展示 |

### LegendInteractionCallbacks

| 回调 | 类型 | 说明 |
|------|------|------|
| `onHover` | `(index: number) => void` | 悬停到第 `index` 条线时触发，移出时回调 `-1` |
| `onToggle` | `(index: number) => void` | 点击第 `index` 条线时触发，可用于切换对应数据层的显隐 |
| `onBrush` | `(range: [number, number]) => void` | 范围刷选回调（LegendLineWidth 不支持刷选，传入无效果） |

## 示例

### 基础用法 — 道路流量线宽图例

展示不同车流量等级对应的线宽，从细到粗直观对应低流量到高流量：

```tsx
import { AiMap, LegendLineWidth } from '@antv/aimapui'

<LegendLineWidth
  type="lineWidth"
  title="道路车流量"
  color="#3B82F6"
  items={[
    { width: 1, label: '<1000 辆/时' },
    { width: 4, label: '1000~3000 辆/时' },
    { width: 8, label: '3000~5000 辆/时' },
    { width: 16, label: '>5000 辆/时' },
  ]}
/>
```

### 进阶用法 — 航线权重 + 交互高亮

配合深色底图使用浅色线条，点击图例项可联动高亮对应航线：

```tsx
<LegendLineWidth
  type="lineWidth"
  title="航线日均航班量"
  color="#FACC15"
  items={[
    { width: 1, label: '<10 班' },
    { width: 3, label: '10~50 班' },
    { width: 6, label: '50~100 班' },
    { width: 12, label: '>100 班' },
  ]}
  interaction={{
    onHover: (i) => highlightRoute(i === -1 ? null : i),
    onToggle: (i) => toggleRouteVisible(i),
  }}
/>
```

## 注意事项

- `width` 为线条的像素宽度，取值过大（>20px）会导致图例占用空间过多且视觉失衡，建议控制在 1~16 之间
- `color` 为统一颜色，不支持每条线设不同颜色；如需同时表达类别和线宽，建议配合 [LegendCategories](./legend-categories) 使用
- 推荐将 `items` 按 `width` 从小到大排列（细线在上、粗线在下），符合从轻到重的视觉直觉
- `items` 数组长度建议不超过 5 个，过多的线宽级别在实际地图上难以区分

## 相关组件

- [LegendSize](./legend-size) — 圆大小图例，用圆的面积映射数值
- [LegendCategories](./legend-categories) — 分类色块图例，可配合做颜色+线宽双重编码
# LegendThreshold

以列表形式展示不等间距的数值分段和对应颜色，每段显示起止值范围。适合自定义分级规则（如 0-50 安全、50-100 警告、100+ 危险），而非等间距渐变。

> **何时选择：** 自定义不等间距分段用 LegendThreshold；等间距连续渐变用 [LegendRamp](./legend-ramp)；离散分类用 [LegendCategories](./legend-categories)。

## 导入

```tsx
import { LegendThreshold } from '@antv/aimapui'
```

## Props

LegendThreshold 继承公共交互属性，此处仅列出专有属性。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'threshold'` | **必填** | 图例类型标识 |
| `title` | `string` | - | 图例标题，显示在列表上方；不传则不显示标题行 |
| `ranges` | `[number \| string, number \| string][]` | **必填** | 阈值区间列表，每个元素为 `[起始值, 结束值]`，支持数字或字符串混合（如 `['0', 50]`）；数组顺序即为图例从上到下的排列顺序 |
| `colors` | `string[]` | **必填** | 对应每个区间的色值，长度必须与 `ranges` 一致；颜色从列表顶部到底部依次对应区间 |
| `className` | `string` | - | 自定义 CSS 类名 |
| `interaction` | [LegendInteractionCallbacks](#legendinteractioncallbacks) | - | 交互回调，不传则图例仅做展示 |

### LegendInteractionCallbacks

| 回调 | 类型 | 说明 |
|------|------|------|
| `onHover` | `(index: number) => void` | 悬停到第 `index` 个区间时触发，移出时回调 `-1` |
| `onToggle` | `(index: number) => void` | 点击第 `index` 个区间时触发，可用于切换该区间的图层显隐 |
| `onBrush` | `(range: [number, number]) => void` | 范围刷选回调（LegendThreshold 不支持刷选，传入无效果） |

## 示例

### 基础用法 — 风险等级分级

不等间距的风险区间，每段颜色直观表达严重程度：

```tsx
import { AiMap, LegendThreshold } from '@antv/aimapui'

<LegendThreshold
  type="threshold"
  title="空气质量风险等级"
  ranges={[
    ['0', 50],
    [50, 100],
    [100, 150],
    [150, '300'],
  ]}
  colors={['#22C55E', '#FACC15', '#F97316', '#EF4444']}
/>
```

### 交互回调 — 点击区间切换显隐

通过 `onToggle` 控制地图上对应区间的数据图层是否可见：

```tsx
<LegendThreshold
  type="threshold"
  title="地震烈度"
  ranges={[
    ['I', 'III'],
    ['IV', 'VI'],
    ['VII', 'IX'],
    ['X', 'XII'],
  ]}
  colors={['#86EFAC', '#FDE047', '#FB923C', '#DC2626']}
  interaction={{
    onToggle: (i) => toggleRangeVisible(i),
  }}
/>
```

## 注意事项

- `ranges` 和 `colors` 长度必须一致，不一致时会导致颜色与区间错位或渲染异常
- `ranges` 中的元素支持 `number` 和 `string` 混用——使用 `string` 是因为某些分段标注不是严格数值（如 `'>500'`、`'X-XII'`），但字符串仅做展示，不做数值比较
- 图例按 `ranges` 数组顺序从上到下排列，如需从高到低显示，需要手动将数组反转

## 相关组件

- [LegendRamp](./legend-ramp) — 等间距连续色带图例，用于均匀数值渐变
- [LegendCategories](./legend-categories) — 分类色块图例，用于离散类别数据
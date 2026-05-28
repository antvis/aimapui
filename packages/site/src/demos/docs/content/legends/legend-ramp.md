# LegendRamp

用色带展示连续数值的渐变映射，支持分段色块和连续渐变两种模式。适合温度、密度、海拔等从低到高（或从少到多）的单向数值场景。

> **何时选择：** 连续/分级数值用 LegendRamp；偏离中心对称数据（如增减率）用 [LegendDiverging](./legend-diverging)；离散分类用 [LegendCategories](./legend-categories)；自定义不等间距分段用 [LegendThreshold](./legend-threshold)。

## 导入

```tsx
import { LegendRamp } from '@antv/aimapui'
```

## Props

LegendRamp 继承公共交互属性，此处仅列出专有属性。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'ramp'` | **必填** | 图例类型标识 |
| `title` | `string` | - | 图例标题，显示在色带上方；不传则不显示标题行 |
| `labels` | `string[]` | **必填** | 色带刻度标签，至少 3 个（左端、中间、右端），数量应与 `colors` 长度对应；会均匀分布在色带下方 |
| `colors` | `string[]` | **必填** | 色带颜色数组，按顺序从左到右渐变插值；`isContinuous` 为 `true` 时在相邻色之间平滑过渡，为 `false` 时各自独立显示为分段色块 |
| `isContinuous` | `boolean` | `false` | `true` 为连续平滑渐变，`false` 为分段色块（每个颜色间有明确分界），分段模式更直观但精度略低 |
| `showTicks` | `boolean` | `false` | 是否在色带下方显示刻度线，数据精度要求高的场景建议开启 |
| `brushable` | `boolean` | `false` | 是否启用范围刷选（拖拽选择色带上的一段区间），开启后可通过 `interaction.onBrush` 获取选中范围，用于过滤地图数据 |
| `className` | `string` | - | 自定义 CSS 类名 |
| `interaction` | [LegendInteractionCallbacks](#legendinteractioncallbacks) | - | 交互回调，不传则图例仅做展示 |

### LegendInteractionCallbacks

| 回调 | 类型 | 说明 |
|------|------|------|
| `onHover` | `(index: number) => void` | 悬停到色带对应位置时触发，参数为刻度索引；移出时回调 `-1` |
| `onToggle` | `(index: number) => void` | 点击刻度时触发 |
| `onBrush` | `(range: [number, number]) => void` | 范围刷选回调，`brushable` 为 `true` 时拖拽结束后触发，返回 `[起始索引, 结束索引]`，用于联动过滤图层数据 |

## 示例

### 基础用法 — 人口密度分段色带

分段模式（默认），每个颜色对应一个区间，适合分级统计：

```tsx
import { AiMap, LegendRamp } from '@antv/aimapui'

<LegendRamp
  type="ramp"
  title="人口密度（人/km²）"
  labels={['0', '500', '2000', '5000']}
  colors={['#DBEAFE', '#93C5FD', '#3B82F6', '#1E3A8A']}
/>
```

### 连续渐变 — 温度分布

`isContinuous` 为 `true` 时颜色间平滑过渡，展示真正的连续渐变效果：

```tsx
<LegendRamp
  type="ramp"
  title="午间温度（℃）"
  labels={['-10', '0', '20', '40']}
  colors={['#DBEAFE', '#93C5FD', '#F97316', '#DC2626']}
  isContinuous
  showTicks
/>
```

### 范围刷选 — 筛选数据区间

开启 `brushable` 后用户可拖拽选择色带区间，通过 `onBrush` 将选中范围传给图层过滤逻辑：

```tsx
<LegendRamp
  type="ramp"
  title="PM2.5 浓度"
  labels={['0', '50', '150', '300']}
  colors={['#22C55E', '#FACC15', '#F97316', '#EF4444']}
  brushable
  interaction={{
    onBrush: (range) => {
      // range = [0, 2] 表示选择第 0 到第 2 个刻度之间的区间
      filterLayerByRange(range)
    },
  }}
/>
```

## 注意事项

- `labels` 最少需要 3 个值（左、中、右），少于 3 个会导致色带布局异常
- `brushable` 仅在 `isContinuous` 为 `true` 时体验最佳；分段模式下刷选边界可能不够精确
- `onBrush` 回调返回的是刻度索引而非原始数值，如需实际数据范围，需在业务代码中根据 `labels` 数组做索引映射
- `showTicks` 建议与较长的 `labels` 配合使用，标签过短时刻度线的视觉引导意义不大

## 相关组件

- [LegendDiverging](./legend-diverging) — 发散色带图例，用于正负偏离中心的对称数据
- [LegendCategories](./legend-categories) — 分类色块图例，用于离散类别数据
- [LegendThreshold](./legend-threshold) — 阈值分段图例，用于不等间距自定义区间
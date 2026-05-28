# LegendDiverging

用中心对称的色带展示偏离基准值的双向数据，例如增长率、同比变化、盈亏对比。以中间值为分界，左端代表负向（减少/下降），右端代表正向（增加/上升）。

> **何时选择：** 偏离中心对称数据（如增长率、温差偏离）用 LegendDiverging；单向连续渐变（如温度从低到高）用 [LegendRamp](./legend-ramp)；离散分类用 [LegendCategories](./legend-categories)。

## 导入

```tsx
import { LegendDiverging } from '@antv/aimapui'
```

## Props

LegendDiverging 继承公共交互属性，此处仅列出专有属性。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'diverging'` | **必填** | 图例类型标识 |
| `title` | `string` | - | 图例标题，显示在色带上方；不传则不显示标题行 |
| `colors` | `string[]` | **必填** | 色带颜色数组，至少 3 个：左端色 → 中间色 → 右端色，如 `['#ef4444', '#ccc', '#10b981']` 表示红→灰→绿；多于 3 个时会在两侧分别插值渐变 |
| `labels` | `[string, string]` | **必填** | 两端标签，`[左端标签, 右端标签]`，如 `['-50%', '+50%']`；只显示两端文字，中间由 `middleLabel` 控制 |
| `middleLabel` | `string` | - | 中心标签文字，常用于标注基准值（如 `'0'`、`'0%'`）；不传则中心位置无文字标注 |
| `className` | `string` | - | 自定义 CSS 类名 |
| `interaction` | [LegendInteractionCallbacks](#legendinteractioncallbacks) | - | 交互回调，不传则图例仅做展示 |

### LegendInteractionCallbacks

| 回调 | 类型 | 说明 |
|------|------|------|
| `onHover` | `(index: number) => void` | 悬停回调，左侧为 `0`，中间为 `1`，右侧为 `2`；移出时回调 `-1` |
| `onToggle` | `(index: number) => void` | 点击切换回调 |
| `onBrush` | `(range: [number, number]) => void` | 范围刷选回调（LegendDiverging 不支持刷选，传入无效果） |

## 示例

### 基础用法 — 人口增长率

经典红绿发散配色，中间为灰色表示零增长：

```tsx
import { AiMap, LegendDiverging } from '@antv/aimapui'

<LegendDiverging
  type="diverging"
  title="人口年增长率"
  colors={['#EF4444', '#F5F5F5', '#22C55E']}
  labels={['-5%', '+5%']}
  middleLabel="0%"
/>
```

### 冷暖配色 — 气温偏离均值

用蓝→白→红展示气温偏离常年均值的程度，标注中心为"均值"：

```tsx
<LegendDiverging
  type="diverging"
  title="气温偏离均值（℃）"
  colors={['#3B82F6', '#F8FAFC', '#EF4444']}
  labels={['-8', '+8']}
  middleLabel="均值"
/>
```

## 注意事项

- `colors` 数组长度必须为奇数（3、5、7...），确保有明确的中心色用于分割正负方向；偶数长度会导致中点颜色不对称
- `labels` 只接受 `[string, string]` 元组，仅标注两端数值；如需空白其中一端，可传空字符串 `''`
- `middleLabel` 不传时中心位置留空，视觉上仍能通过颜色分界辨识方向，但建议标注以提高可读性

## 相关组件

- [LegendRamp](./legend-ramp) — 单向连续色带图例，用于从低到高的渐变数据
- [LegendCategories](./legend-categories) — 分类色块图例，用于离散类别数据
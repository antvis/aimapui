# LegendProportion

比例圆区间图例，以不同大小的圆展示数值区间范围。**此组件已过时**，推荐使用 [LegendSize](./legend-size) 替代——LegendSize 提供了更灵活的尺寸控制和更清晰的视觉效果。

> **何时选择：** **已过时，新项目请使用 [LegendSize](./legend-size)。** 仅在维护旧代码时保留此组件。圆的大小映射用 LegendSize；线宽映射用 [LegendLineWidth](./legend-line-width)。

## 导入

```tsx
import { LegendProportion } from '@antv/aimapui'
```

## Props

LegendProportion 继承公共交互属性，此处仅列出专有属性。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'proportion'` | **必填** | 图例类型标识 |
| `title` | `string` | - | 图例标题，显示在圆列表上方；不传则不显示标题行 |
| `labels` | `[number, number][]` | **必填** | 区间标签数组，每个元素为 `[最小值, 最大值]`，圆的大小会根据数值区间自动计算，映射范围固定为 6px~24px |
| `fillColor` | `string` | `'#4A90D9'` | 圆的统一填充颜色 |
| `className` | `string` | - | 自定义 CSS 类名 |
| `interaction` | [LegendInteractionCallbacks](#legendinteractioncallbacks) | - | 交互回调，不传则图例仅做展示 |

### LegendInteractionCallbacks

| 回调 | 类型 | 说明 |
|------|------|------|
| `onHover` | `(index: number) => void` | 悬停到第 `index` 个圆时触发，移出时回调 `-1` |
| `onToggle` | `(index: number) => void` | 点击第 `index` 个圆时触发 |
| `onBrush` | `(range: [number, number]) => void` | 范围刷选回调（LegendProportion 不支持刷选，传入无效果） |

## 示例

### 基础用法 — 数值区间比例圆

> **提示：** 新项目请使用 [LegendSize](./legend-size) 代替，可自由指定圆的像素大小，不受 6~24px 限制。

```tsx
import { AiMap, LegendProportion } from '@antv/aimapui'

<LegendProportion
  type="proportion"
  title="销售额区间"
  fillColor="#3B82F6"
  labels={[
    [10, 100],
    [100, 500],
    [500, 1000],
  ]}
/>
```

## 注意事项

- **此组件已过时**，推荐使用 [LegendSize](./legend-size)，后者支持自定义 `size` 像素值，灵活性更高
- 圆的大小映射范围硬编码为 **6px~24px**，无法自定义；如需更大或更小的圆，必须使用 LegendSize
- `labels` 中的数值仅用于按比例计算圆的大小，图例上文字会显示为区间范围（如 `10-100`）
- `labels` 中所有区间的最小值和最大值会参与整体比例计算，区间范围差异过大会导致小圆不可辨识

## 相关组件

- [LegendSize](./legend-size) — **推荐替代方案**，支持自定义圆大小，无像素范围限制
- [LegendLineWidth](./legend-line-width) — 线宽图例，用线条粗细映射数值
- [LegendCategories](./legend-categories) — 分类色块图例
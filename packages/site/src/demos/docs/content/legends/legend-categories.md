# LegendCategories

用色块列表展示离散分类数据，例如用地类型、行政级别、状态枚举等。最适合"每个类别一种颜色"的场景，是使用频率最高的图例类型。

> **何时选择：** 分类/枚举数据用 LegendCategories；连续数值渐变用 [LegendRamp](./legend-ramp)；偏离中心对称数据（如增减率）用 [LegendDiverging](./legend-diverging)；自定义不等间距分段用 [LegendThreshold](./legend-threshold)；图标标识 POI 用 [LegendIcon](./legend-icon)。

## 导入

```tsx
import { LegendCategories } from '@antv/aimapui'
```

## Props

LegendCategories 继承公共交互属性，此处仅列出专有属性。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'categories'` | **必填** | 图例类型标识，用于 Schema 驱动渲染时自动匹配组件 |
| `title` | `string` | - | 图例标题，显示在色块列表上方；不传则不显示标题行 |
| `labels` | `string[]` | **必填** | 类别标签数组，与 `colors` 一一对应；数量不匹配时多余的标签或颜色会被截断 |
| `colors` | `string[]` | **必填** | 类别色值数组，支持任意 CSS 颜色格式（`'#3B82F6'`、`'rgb(59,130,246)'` 等），与 `labels` 一一对应 |
| `swatchShape` | `'square' \| 'circle'` | `'square'` | 色块形状：`'square'` 适合面状分类（用地类型），`'circle'` 适合点状分类（POI 类别） |
| `grid` | `boolean` | `false` | 是否启用两列网格布局，类别较多时（>5 项）建议开启以节省纵向空间 |
| `className` | `string` | - | 自定义 CSS 类名，用于覆盖图例容器样式（边距、字体等） |
| `interaction` | [LegendInteractionCallbacks](#legendinteractioncallbacks) | - | 交互回调，不传则图例仅做展示、无交互响应 |

### LegendInteractionCallbacks

所有图例组件共用的交互回调类型。`onBrush` 仅 [LegendRamp](./legend-ramp) 支持范围刷选，其他组件传入无效果。

| 回调 | 类型 | 说明 |
|------|------|------|
| `onHover` | `(index: number) => void` | 鼠标悬停到第 `index` 个图例项时触发，移出时回调参数为 `-1`，可用于联动高亮图层对应类别 |
| `onToggle` | `(index: number) => void` | 点击第 `index` 个图例项时触发，常用于切换对应图层的显隐状态 |
| `onBrush` | `(range: [number, number]) => void` | 范围刷选回调（仅 LegendRamp），返回选中的起止索引 |

## 示例

### 基础用法 — 用地类型分类

```tsx
import { AiMap, LegendCategories } from '@antv/aimapui'

<LegendCategories
  type="categories"
  title="用地类型"
  labels={['商业区', '住宅区', '工业区', '绿地']}
  colors={['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981']}
/>
```

### 圆形色块 + 网格布局 — POI 类型图例

类别超过 5 项时开启 `grid` 可两列排布，`'circle'` 色块更贴合点状要素：

```tsx
<LegendCategories
  type="categories"
  title="POI 类型"
  labels={['餐饮', '购物', '学校', '医院', '公园', '交通']}
  colors={['#EF4444', '#F97316', '#3B82F6', '#10B981', '#22C55E', '#6366F1']}
  swatchShape="circle"
  grid
/>
```

### 交互回调 — 联动图层显隐

通过 `onToggle` 控制对应图层的显示/隐藏，`onHover` 实现悬停高亮：

```tsx
<LegendCategories
  type="categories"
  title="建筑状态"
  labels={['已建成', '在建', '规划中']}
  colors={['#10B981', '#F59E0B', '#94A3B8']}
  interaction={{
    onHover: (i) => {
      // i === -1 时取消高亮，否则高亮对应类别
      highlightCategory(i === -1 ? null : i)
    },
    onToggle: (i) => toggleLayerVisibility(i),
  }}
/>
```

## 注意事项

- `labels` 和 `colors` 数组长度应一致；不一致时以较短的为准，多余项会被忽略
- `grid` 布局下每行显示两列，适合类别 5~10 项的场景；类别 ≤4 项时单列更整洁，不建议开启
- `interaction.onHover` 回调的 `index` 从 0 开始，鼠标移出图例区域时回调 `-1`，需在业务代码中处理取消逻辑

## 相关组件

- [LegendRamp](./legend-ramp) — 连续/分段色带图例，用于数值渐变场景
- [LegendDiverging](./legend-diverging) — 发散色带图例，用于偏离中心的对称数据
- [LegendThreshold](./legend-threshold) — 阈值分段图例，用于不等间距分段
- [LegendIcon](./legend-icon) — 图标图例，用自定义图标代替色块
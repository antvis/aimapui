# 图例组件

图例独立于地图渲染，可放在地图容器内或外部任意位置。支持交互回调。

所有图例组件共享 `className` 和 `interaction` props。

```ts
interface LegendInteractionCallbacks {
  onHover?: (index: number) => void;    // 悬停高亮，-1 表示取消
  onToggle?: (index: number) => void;   // 点击切换显隐
  onBrush?: (range: [number, number]) => void;  // 范围刷选
}
```

## LegendCategories — 分类图例

```tsx
import { LegendCategories } from '@antv/aimapui';

<LegendCategories
  title="用地类型"
  labels={['住宅', '商业', '工业', '公园']}
  colors={['#2563eb', '#f59e0b', '#6b7280', '#10b981']}
  swatchShape="circle"    // 'square' | 'circle'
  grid={true}             // 两列网格布局
  interaction={{
    onHover: (index) => {},
    onToggle: (index) => {},
  }}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | 图例标题 |
| `labels` | `string[]` | **必填** | 分类标签 |
| `colors` | `string[]` | **必填** | 分类颜色 |
| `swatchShape` | `'square' \| 'circle'` | `'square'` | 色块形状 |
| `grid` | `boolean` | `false` | 是否使用两列网格布局 |
| `className` | `string` | — | CSS 类名 |
| `interaction` | `LegendInteractionCallbacks` | — | 交互回调 |

## LegendRamp — 渐变图例

```tsx
import { LegendRamp } from '@antv/aimapui';

<LegendRamp
  title="人口密度"
  labels={['低', '中', '高']}
  colors={['#f0f9e8', '#7bccc4', '#0868ac']}
  isContinuous={true}    // 连续渐变 vs 分段色块
  showTicks={true}       // 显示刻度线
  brushable={true}       // 范围刷选
  interaction={{ onBrush: (range) => {} }}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | 图例标题 |
| `labels` | `string[]` | **必填** | 标签文字 |
| `colors` | `string[]` | **必填** | 渐变颜色 |
| `isContinuous` | `boolean` | `false` | 连续渐变 vs 分段色块 |
| `showTicks` | `boolean` | — | 是否显示刻度线 |
| `brushable` | `boolean` | — | 是否启用范围刷选 |
| `className` | `string` | — | CSS 类名 |
| `interaction` | `LegendInteractionCallbacks` | — | 交互回调 |

## LegendDiverging — 发散图例

```tsx
import { LegendDiverging } from '@antv/aimapui';

<LegendDiverging
  colors={['#ef4444', '#9ca3af', '#10b981']}
  labels={['减少', '增加']}
  middleLabel="0"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | 图例标题 |
| `colors` | `string[]` | **必填** | 渐变色列表（如 红→灰→绿） |
| `labels` | `[string, string]` | **必填** | 左端/右端标签 |
| `middleLabel` | `string` | — | 中间值标签 |
| `className` | `string` | — | CSS 类名 |
| `interaction` | `LegendInteractionCallbacks` | — | 交互回调 |

## LegendThreshold — 阈值图例

```tsx
import { LegendThreshold } from '@antv/aimapui';

<LegendThreshold
  title="温度阈值"
  ranges={[[0, 10], [10, 20], [20, 30], [30, 40]]}
  colors={['#93c5fd', '#fde68a', '#f97316', '#ef4444']}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | 图例标题 |
| `ranges` | `[number\|string, number\|string][]` | **必填** | 区间定义 [min, max)，从上到下 |
| `colors` | `string[]` | **必填** | 每个区间对应的颜色 |
| `className` | `string` | — | CSS 类名 |
| `interaction` | `LegendInteractionCallbacks` | — | 交互回调 |

## LegendSize — 大小图例

```tsx
import { LegendSize } from '@antv/aimapui';

<LegendSize
  title="人口规模"
  fillColor="#2563eb"
  items={[
    { size: 8, label: '< 100万' },
    { size: 24, label: '100-500万' },
    { size: 48, label: '> 500万' },
  ]}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | 图例标题 |
| `fillColor` | `string` | — | 填充色 |
| `items` | `{ size: number; label: string }[]` | **必填** | 大小项（圆直径 px + 标签） |
| `className` | `string` | — | CSS 类名 |
| `interaction` | `LegendInteractionCallbacks` | — | 交互回调 |

## LegendLineWidth — 线宽图例

```tsx
import { LegendLineWidth } from '@antv/aimapui';

<LegendLineWidth
  title="道路等级"
  color="#5B8FF9"
  items={[
    { width: 1, label: '小路' },
    { width: 3, label: '省道' },
    { width: 6, label: '高速' },
  ]}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | 图例标题 |
| `color` | `string` | — | 线条颜色 |
| `items` | `{ width: number; label: string }[]` | **必填** | 线宽项 |
| `className` | `string` | — | CSS 类名 |
| `interaction` | `LegendInteractionCallbacks` | — | 交互回调 |

## LegendProportion — 比例圆图例

```tsx
import { LegendProportion } from '@antv/aimapui';

<LegendProportion
  title="产值比例"
  labels={[[0, 100], [100, 500], [500, 1000]]}
  fillColor="#2563eb"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | 图例标题 |
| `labels` | `[number, number][]` | **必填** | 比例区间 |
| `fillColor` | `string` | — | 填充色 |
| `className` | `string` | — | CSS 类名 |
| `interaction` | `LegendInteractionCallbacks` | — | 交互回调 |

## LegendIcon — 图标图例

```tsx
import { LegendIcon } from '@antv/aimapui';

<LegendIcon
  title="设施类型"
  items={[
    { icon: 'restaurant', label: '餐饮' },
    { icon: 'hotel', label: '住宿' },
    { icon: 'local_hospital', label: '医疗' },
  ]}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | 图例标题 |
| `items` | `{ icon: string; label: string }[]` | **必填** | 图标项 |
| `className` | `string` | — | CSS 类名 |
| `interaction` | `LegendInteractionCallbacks` | — | 交互回调 |

## Schema 模式使用

```typescript
const schema = {
  legends: [
    { type: 'categories', title: '类型', labels: ['A','B'], colors: ['#f00','#00f'], swatchShape: 'circle', grid: true },
    { type: 'ramp', title: '密度', labels: ['低','高'], colors: ['#eee','#333'], isContinuous: true, brushable: true },
    { type: 'diverging', colors: ['#ef4444','#ccc','#10b981'], labels: ['减少','增加'] },
    { type: 'threshold', title: '阈值', ranges: [[0,10],[10,20]], colors: ['#93c5fd','#ef4444'] },
    { type: 'size', title: '规模', fillColor: '#2563eb', items: [{ size: 8, label: '小' }, { size: 48, label: '大' }] },
    { type: 'lineWidth', title: '线宽', color: '#5B8FF9', items: [{ width: 1, label: '细' }, { width: 6, label: '粗' }] },
    { type: 'proportion', labels: [[0,100],[100,500]], fillColor: '#2563eb' },
    { type: 'icon', title: '设施', items: [{ icon: 'restaurant', label: '餐饮' }] },
  ],
};
```

## 相关文档

- [aimap-container.md](../core/aimap-container.md) — AiMap 主容器
- [schema-system.md](../schema/schema-system.md) — Schema 系统
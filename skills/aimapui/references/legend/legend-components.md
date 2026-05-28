# 图例组件

图例独立于地图渲染，可放在地图容器内或外部任意位置。支持交互回调。

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

## LegendDiverging — 发散图例

```tsx
import { LegendDiverging } from '@antv/aimapui';

<LegendDiverging
  colors={['#ef4444', '#9ca3af', '#10b981']}
  labels={['减少', '增加']}
  middleLabel="0"
/>
```

## LegendThreshold — 阈值图例

```tsx
import { LegendThreshold } from '@antv/aimapui';

<LegendThreshold
  title="温度阈值"
  ranges={[[0, 10], [10, 20], [20, 30], [30, 40]]}
  colors={['#93c5fd', '#fde68a', '#f97316', '#ef4444']}
/>
```

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

## LegendProportion — 比例圆图例

```tsx
import { LegendProportion } from '@antv/aimapui';

<LegendProportion
  title="产值比例"
  labels={[[0, 100], [100, 500], [500, 1000]]}
  fillColor="#2563eb"
/>
```

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

## 交互回调

```typescript
interface LegendInteractionCallbacks {
  onHover?: (index: number) => void;    // 悬停高亮，-1 表示取消
  onToggle?: (index: number) => void;   // 点击切换显隐
  onBrush?: (range: [number, number]) => void;  // 范围刷选
}
```

所有图例组件通过 `interaction` prop 传入。

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
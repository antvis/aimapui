# MobileSheetLegend — 移动端图例抽屉

移动端图例面板，玻璃拟态风格，点击标题栏展开/收起。支持全部 8 种图例类型。

## Examples

```tsx
import { MobileSheetLegend } from '@antv/aimapui';

// 分类图例
<MobileSheetLegend
  legends={[
    { type: 'categories', title: '用地分类', labels: ['A', 'B'], colors: ['#f00', '#00f'], swatchShape: 'circle', grid: true },
  ]}
/>

// 多图例 + 交互
<MobileSheetLegend
  legends={[
    { type: 'categories', title: '用地', labels: ['A', 'B'], colors: ['#f00', '#00f'], swatchShape: 'circle', grid: true },
    { type: 'ramp', title: '密度', labels: ['低', '高'], colors: ['#eee', '#333'], isContinuous: true },
  ]}
  interaction={{
    onHover: (index) => console.log('hover:', index),
    onToggle: (index) => console.log('toggle:', index),
  }}
/>
```

## 支持的图例类型

`categories` | `ramp` | `diverging` | `threshold` | `size` | `lineWidth` | `proportion` | `icon`

## 交互

- 展开时 `max-h-[65vh]`，收起时 `max-h-14`
- 点击标题栏切换展开/收起
- 支持 `onHover`（悬停高亮）和 `onToggle`（点击切换显隐）回调

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `legends` | `LegendSchema[]` | **必填** | 图例配置数组 |
| `interaction` | `LegendInteractionCallbacks` | — | 交互回调 |
| `className` | `string` | — | 自定义样式类名 |

## 相关文档

- [index.md](index.md) — 移动端组件概览
- [legend-components.md](../legend/legend-components.md) — 图例组件
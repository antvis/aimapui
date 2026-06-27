# BottomSheet — 三档底部抽屉

移动端底部抽屉组件，支持三档吸附（收起/半展开/完全展开），支持 Touch 和 Mouse 手势拖拽。

## Examples

```tsx
import { BottomSheet } from '@antv/aimapui';

// 基础用法
<BottomSheet defaultSnap="half">
  <div>抽屉内容</div>
</BottomSheet>

// 自定义参数
<BottomSheet
  defaultSnap="collapsed"
  collapsedHeight={80}
  halfRatio={0.45}
  expandedRatio={0.85}
  showHandle
  borderRadius={32}
  onSnapChange={(snap) => console.log(snap)}
>
  <div>抽屉内容</div>
</BottomSheet>
```

## 三档吸附

| Snap | 高度 | 说明 |
|------|------|------|
| `collapsed` | `collapsedHeight`（默认 80px） | 收起 |
| `half` | 容器高度 × `halfRatio`（默认 0.45） | 半展开 |
| `expanded` | 容器高度 × `expandedRatio`（默认 0.85） | 完全展开 |

## 手势

- Touch + Mouse 双模式支持（桌面可调试）
- 快速滑动（velocity）自动吸附到最近档位
- 慢速拖拽按距离判断吸附目标

## Enums

- **BottomSheetSnap:** `'collapsed'` | `'half'` | `'expanded'`

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | — | 抽屉内容 |
| `defaultSnap` | `BottomSheetSnap` | `'collapsed'` | 初始吸附状态 |
| `collapsedHeight` | `number` | `80` | 收起时的高度（px） |
| `halfRatio` | `number` | `0.45` | 半展开高度比例（0-1） |
| `expandedRatio` | `number` | `0.85` | 完全展开高度比例（0-1） |
| `showHandle` | `boolean` | `true` | 是否显示拖拽手柄 |
| `borderRadius` | `number` | `32` | 圆角大小 |
| `onSnapChange` | `(snap) => void` | — | 吸附状态变化回调 |
| `className` | `string` | — | 自定义样式类名 |

## 相关文档

- [index.md](index.md) — 移动端组件概览
- [mobile-toolbar.md](mobile-toolbar.md) — 工具栏
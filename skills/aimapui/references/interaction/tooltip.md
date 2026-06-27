# Tooltip — 悬浮提示

DOM 方式渲染的悬浮提示组件，支持 3 种视觉变体、地图锚点模式和 DOM 元素跟随模式。

## Examples

```tsx
import { Tooltip } from '@antv/aimapui';

// 地图锚点模式
<Tooltip
  longitude={116.397} latitude={39.908}
  content="悬浮提示内容"
  variant="dark"
  placement="top"
  visible={true}
/>

// 玻璃态
<Tooltip
  longitude={121.473} latitude={31.230}
  content="毛玻璃效果"
  variant="glass"
  placement="bottom"
/>

// 浅色
<Tooltip
  longitude={113.26} latitude={23.13}
  content="亮色提示"
  variant="light"
  placement="right"
/>

// DOM 元素跟随模式
<Tooltip
  targetElement={document.getElementById('my-element')}
  content="跟随元素"
  trigger="hover"
  placement="top"
/>

// 结构化内容
<Tooltip
  longitude={116} latitude={39}
  title="北京"
  items={[
    { label: '人口', value: '2189万' },
    { label: '面积', value: '16410 km²' },
  ]}
  variant="dark"
/>
```

## Enums

- **TooltipVariant:** `'dark'` | `'glass'` | `'light'`
- **TooltipPlacement:** `'top'` | `'right'` | `'bottom'` | `'left'`

## Types

```ts
interface TooltipItem {
  label: string;
  value: string | number;
}
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | `string \| ReactNode` | — | 提示内容（优先级高于 title/items） |
| `variant` | `TooltipVariant` | `'dark'` | 视觉风格 |
| `placement` | `TooltipPlacement` | `'top'` | 方向 |
| `offset` | `number` | `8` | 偏移距离 |
| `trigger` | `'hover' \| 'click'` | `'hover'` | 触发方式 |
| `visible` | `boolean` | — | 受控可见性 |
| `longitude` | `number` | — | 经度（地图锚点模式） |
| `latitude` | `number` | — | 纬度（地图锚点模式） |
| `targetElement` | `HTMLElement \| null` | — | DOM 元素（DOM 跟随模式） |
| `title` | `string` | — | 结构化标题 |
| `items` | `TooltipItem[]` | — | 结构化键值对 |

## 两种定位模式

- **地图锚点模式**（`longitude` + `latitude`）：跟随地图坐标，平移/缩放时自动更新位置，超出地图边界时裁剪
- **DOM 跟随模式**（`targetElement`）：相对 DOM 元素定位，hover 有 100ms 延迟，边缘自动翻转

## 相关文档

- [index.md](index.md) — 交互组件概览
- [marker.md](marker.md) — 标注组件
- [popup.md](popup.md) — 弹窗组件
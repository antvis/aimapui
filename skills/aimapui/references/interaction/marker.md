# Marker — 地图标注

DOM 方式渲染的地图标注组件，支持 4 种形态、4 种语义颜色、可拖拽和文本标签。不依赖 L7 图层，适合少量标注点场景。

## Examples

```tsx
import { Marker } from '@antv/aimapui';

// 水滴型（默认）
<Marker longitude={116.397} latitude={39.908} label="北京" />

// 圆型
<Marker longitude={121.473} latitude={31.230} variant="circle" color="success" />

// 图标型（Maki 图标）
<Marker longitude={120.15} latitude={30.28} variant="icon" icon="restaurant" color="primary" />

// 简化点（低缩放级降级）
<Marker longitude={113.26} latitude={23.13} variant="dot" color="warning" />

// 自定义内容
<Marker longitude={114.05} latitude={22.55} content={<div className="custom">Custom</div>} />

// 可拖拽
<Marker longitude={116} latitude={39} draggable
  onDragStart={(lng, lat) => console.log('start:', lng, lat)}
  onDragging={(lng, lat) => console.log('dragging:', lng, lat)}
  onDragEnd={(lng, lat) => console.log('end:', lng, lat)}
/>

// 选中 / 禁用状态
<Marker longitude={116} latitude={39} selected color="primary" />
<Marker longitude={121} latitude={31} inactive color="error" />
```

## Enums

- **MarkerVariant:** `'pin'` | `'circle'` | `'icon'` | `'dot'`
- **MarkerColor:** `'primary'` | `'success'` | `'warning'` | `'error'`

## 语义颜色

| 颜色 | 用途 | 填充色 | 背景色 |
|------|------|--------|--------|
| `primary` | 信息/默认 | `#2563EB` | `rgba(37,99,235,0.2)` |
| `success` | 完成/安全 | `#00854D` | `rgba(0,133,77,0.2)` |
| `warning` | 预警/高负载 | `#943700` | `rgba(148,55,0,0.2)` |
| `error` | 故障/危险 | `#BA1A1A` | `rgba(186,26,26,0.2)` |

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `longitude` | `number` | **必填** | 经度 |
| `latitude` | `number` | **必填** | 纬度 |
| `variant` | `MarkerVariant` | `'pin'` | 形态 |
| `color` | `MarkerColor` | `'primary'` | 语义颜色 |
| `icon` | `string` | — | Maki 图标名（仅 `variant="icon"` 时有效） |
| `label` | `string` | — | 文本标注（显示在 Marker 下方） |
| `content` | `ReactNode \| string` | — | 自定义内容，优先级最高 |
| `selected` | `boolean` | `false` | 选中状态 |
| `inactive` | `boolean` | `false` | 禁用/离线状态 |
| `anchor` | `string` | `'bottom'` | 定位锚点 |
| `offsets` | `[number, number]` | `[0, 0]` | 偏移量 |
| `overflowHide` | `boolean` | `true` | 超出地图边界隐藏 |
| `draggable` | `boolean` | `false` | 可拖拽 |
| `onClick` | `(e) => void` | — | 点击回调 |
| `onDoubleClick` | `(e) => void` | — | 双击回调 |
| `onMouseEnter` | `(e) => void` | — | 鼠标进入 |
| `onMouseLeave` | `(e) => void` | — | 鼠标离开 |
| `onDragStart` | `(lng, lat) => void` | — | 拖拽开始 |
| `onDragging` | `(lng, lat) => void` | — | 拖拽中 |
| `onDragEnd` | `(lng, lat) => void` | — | 拖拽结束 |

> **注意：** 当传入 `content` 时，`variant`、`color`、`icon`、`label` 均被忽略。

## 使用建议

- < 100 个点用 Marker，> 100 个点用 PointLayer/BubbleLayer
- 需要复杂交互（拖拽、自定义 HTML）用 Marker
- 需要数据驱动渲染（颜色映射、大小映射）用 PointLayer

## 相关文档

- [index.md](index.md) — 交互组件概览
- [popup.md](popup.md) — 弹窗组件
- [maki-icons.md](maki-icons.md) — Maki 图标
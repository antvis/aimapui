# Marker

地图标注组件，支持四种变体：`pin`（水滴）、`circle`（圆形）、`icon`（图标）、`dot`（圆点）和四种语义色。支持自定义内容、拖拽交互和锚点定位。

## 导入

```tsx
import { Marker } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `longitude` | `number` | **必填** | 经度 |
| `latitude` | `number` | **必填** | 纬度 |
| `variant` | `'pin' \| 'circle' \| 'icon' \| 'dot'` | `'pin'` | 标注变体 |
| `color` | `'primary' \| 'success' \| 'warning' \| 'error'` | `'primary'` | 语义颜色 |
| `icon` | `string` | - | Material Symbols 图标名（variant 为 `icon` 时使用，默认 `'location_on'`） |
| `label` | `string` | - | 文本标签，显示在标注下方 4px |
| `content` | `ReactNode \| string` | - | 自定义内容，优先级高于 variant/color/icon/label |
| `draggable` | `boolean` | `false` | 是否可拖拽 |
| `selected` | `boolean` | `false` | 选中状态 |
| `inactive` | `boolean` | `false` | 禁用/离线状态 |
| `anchor` | `'center' \| 'top' \| 'bottom' \| 'left' \| 'right' \| 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'bottom'` | 锚点位置 |
| `offsets` | `[number, number]` | `[0, 0]` | 偏移量 `[x, y]` |
| `overflowHide` | `boolean` | `true` | 超出地图边界时隐藏 |
| `className` | `string` | - | 自定义类名 |
| `overlayContainer` | `HTMLElement \| null` | - | 自定义 Overlay 容器 |
| `onClick` | `(e: React.MouseEvent) => void` | - | 点击事件 |
| `onMouseEnter` | `(e: React.MouseEvent) => void` | - | 鼠标进入事件 |
| `onMouseLeave` | `(e: React.MouseEvent) => void` | - | 鼠标离开事件 |
| `onDoubleClick` | `(e: React.MouseEvent) => void` | - | 双击事件 |
| `onDragStart` | `(lng: number, lat: number) => void` | - | 拖拽开始回调 |
| `onDragging` | `(lng: number, lat: number) => void` | - | 拖拽中回调 |
| `onDragEnd` | `(lng: number, lat: number) => void` | - | 拖拽结束回调 |

## 语义颜色映射

| 颜色 | 填充色 | 背景色 |
|------|--------|--------|
| `primary` | `#2563eb` | `rgba(37,99,235,0.2)` |
| `success` | `#00854d` | `rgba(0,133,77,0.2)` |
| `warning` | `#943700` | `rgba(148,55,0,0.2)` |
| `error` | `#ba1a1a` | `rgba(186,26,26,0.2)` |

## 示例

### 基础标注

```tsx
<Marker longitude={116.397} latitude={39.908} variant="pin" color="primary" />
```

### 图标标注

```tsx
<Marker longitude={116.397} latitude={39.908} variant="icon" icon="restaurant" color="error" />
```

### 拖拽标注

```tsx
<Marker
  longitude={116.397} latitude={39.908}
  variant="circle"
  draggable
  onDragEnd={(lng, lat) => console.log('新位置', lng, lat)}
/>
```

### 自定义内容

```tsx
<Marker longitude={116.397} latitude={39.908}>
  <div style={{ background: '#fff', padding: 8, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
    自定义内容
  </div>
</Marker>
```

### 锚点偏移

```tsx
<Marker longitude={116.397} latitude={39.908} variant="circle" anchor="center" offsets={[0, -10]} />
```
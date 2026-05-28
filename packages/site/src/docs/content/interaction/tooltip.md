# Tooltip

轻量地图提示组件，支持三种视觉风格（`dark` / `glass` / `light`）、两种触发模式（`hover` / `click`），以及地图定位和 DOM 定位两种模式。

## 导入

```tsx
import { Tooltip } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `content` | `string \| ReactNode` | - | 纯文本/ReactNode 内容，优先级高于 title/items |
| `variant` | `'dark' \| 'glass' \| 'light'` | `'dark'` | 视觉风格 |
| `longitude` | `number` | - | 经度（地图定位模式） |
| `latitude` | `number` | - | 纬度（地图定位模式） |
| `targetElement` | `HTMLElement \| null` | - | 目标 DOM 元素（DOM 定位模式） |
| `placement` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | 弹出方向 |
| `offset` | `number` | `8` | 偏移距离（px） |
| `trigger` | `'hover' \| 'click'` | `'hover'` | 触发方式 |
| `visible` | `boolean` | - | 受控可见性 |
| `title` | `string` | - | 结构化标题 |
| `items` | `TooltipItem[]` | - | 结构化键值对列表 |
| `overlayContainer` | `HTMLElement \| null` | - | 自定义 Overlay 容器 |
| `className` | `string` | - | 自定义类名 |

## TooltipItem

| 字段 | 类型 | 说明 |
|------|------|------|
| `label` | `string` | 标签 |
| `value` | `string \| number` | 值 |

## 示例

### 地图定位模式 + 结构化内容

```tsx
<Tooltip
  longitude={116.397} latitude={39.908}
  title="北京"
  items={[{ label: '人口', value: '2189万' }, { label: 'GDP', value: '4.16万亿' }]}
  variant="glass"
/>
```

### DOM 定位模式

```tsx
<Tooltip targetElement={elementRef.current} content="提示文字" trigger="click" />
```

### 受控可见性

```tsx
<Tooltip
  longitude={116.397} latitude={39.908}
  visible={tooltipVisible}
  title="hover 查看"
  variant="dark"
  placement="bottom"
  offset={12}
/>
```
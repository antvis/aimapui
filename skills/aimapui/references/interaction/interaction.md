# 交互组件（Marker / Popup / Tooltip）

## Marker — 地图标注

4 种形态 + 4 种语义颜色 + 可拖拽 + 文本标签。

```tsx
import { Marker } from '@antv/aimapui';

// 水滴型（默认）
<Marker longitude={116.397} latitude={39.908} label="北京" />

// 圆型
<Marker longitude={121.473} latitude={31.230} variant="circle" color="success" />

// 图标型（Material Symbols）
<Marker longitude={120.15} latitude={30.28} variant="icon" icon="restaurant" color="primary" />

// 简化点（低缩放级降级）
<Marker longitude={113.26} latitude={23.13} variant="dot" color="warning" />

// 自定义内容
<Marker longitude={114.05} latitude={22.55} content={<div className="custom">Custom</div>} />

// 可拖拽
<Marker longitude={116} latitude={39} draggable onDragEnd={(lng, lat) => console.log(lng, lat)} />
```

### Marker 完整属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `longitude` | `number` | **必填** | 经度 |
| `latitude` | `number` | **必填** | 纬度 |
| `variant` | `'pin' \| 'circle' \| 'icon' \| 'dot'` | `'pin'` | 形态 |
| `color` | `'primary' \| 'success' \| 'warning' \| 'error'` | `'primary'` | 语义颜色 |
| `icon` | `string` | — | Material Symbols 图标名（icon 型） |
| `label` | `string` | — | 文本标注（显示在 Marker 下方 4px） |
| `content` | `ReactNode \| string` | — | 自定义内容，优先级最高 |
| `draggable` | `boolean` | `false` | 可拖拽 |
| `selected` | `boolean` | `false` | 选中状态 |
| `inactive` | `boolean` | `false` | 禁用/离线状态 |
| `anchor` | `string` | `'bottom'` | 定位锚点 |
| `offsets` | `[number, number]` | `[0, 0]` | 偏移量 |
| `overflowHide` | `boolean` | `true` | 超出边界隐藏 |
| `onClick` | `(e) => void` | — | |
| `onDragStart` | `(lng, lat) => void` | — | |
| `onDragging` | `(lng, lat) => void` | — | |
| `onDragEnd` | `(lng, lat) => void` | — | |

### 语义颜色

| 颜色 | 用途 | 色值 |
|------|------|------|
| `primary` | 信息/默认 | `#2563EB` |
| `success` | 完成/安全 | `#00854D` |
| `warning` | 预警/高负载 | `#943700` |
| `error` | 故障/危险 | `#BA1A1A` |

> **何时选择：** < 100 个点用 Marker，> 100 个点用 PointLayer/BubbleLayer。

---

## Popup — 弹窗

MD3 玻璃态 + 自动翻转 + 结构化内容。

```tsx
import { Popup } from '@antv/aimapui';

// 简单文本
<Popup longitude={116.397} latitude={39.908} content="这里是北京" size="compact" />

// 结构化内容
<Popup
  longitude={116.397} latitude={39.908}
  size="detailed"
  placement="auto"
  offset={8}
  singleton={true}
  header={{
    title: '西湖景区',
    coverUrl: 'https://example.com/cover.jpg',
    statusLabel: '开放中',
    statusColor: '#10b981',
  }}
  attributes={[
    { label: '评分', value: '4.8' },
    { label: '票价', value: '免费', valueColor: '#10b981' },
    { label: '热度', value: '5.2万', icon: 'local_fire_department' },
  ]}
  actions={[
    { label: '导航', variant: 'primary', onClick: () => {} },
    { label: '收藏', variant: 'secondary', onClick: () => {} },
  ]}
  onClose={() => {}}
/>

// 受控可见性
<Popup longitude={116} latitude={39} content="受控" visible={show} onClose={() => setShow(false)} />
```

### Popup Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `longitude` | `number` | **必填** | 经度 |
| `latitude` | `number` | **必填** | 纬度 |
| `content` | `string \| ReactNode` | — | 内容（文本/HTML/ReactNode） |
| `size` | `'compact' \| 'standard' \| 'detailed'` | `'standard'` | 尺寸：240px / 320px / 480px |
| `placement` | `'auto' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'auto'` | 弹出位置（auto 根据视口自动翻转） |
| `offset` | `number` | `8` | 距锚点偏移像素 |
| `closeButton` | `boolean` | `true` | 显示关闭按钮 |
| `singleton` | `boolean` | `false` | 互斥模式，同时间仅一个 Popup |
| `visible` | `boolean` | — | 受控可见性 |
| `header` | `PopupHeader` | — | 结构化标题栏 |
| `attributes` | `PopupAttribute[]` | — | 属性列表 |
| `actions` | `PopupAction[]` | — | 底部操作按钮 |
| `onClose` | `() => void` | — | 关闭回调 |

---

## Tooltip — 悬浮提示

3 种视觉变体 + 跟随鼠标/锚点。

```tsx
import { Tooltip } from '@antv/aimapui';

<Tooltip
  longitude={116.397} latitude={39.908}
  content="悬浮提示内容"
  variant="dark"          // 'dark' | 'glass' | 'light'
  placement="top"         // 'top' | 'right' | 'bottom' | 'left'
  trigger="hover"         // 'hover' | 'click'
  offset={8}
  visible={true}
/>
```

### Tooltip Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | `string` | **必填** | 提示内容 |
| `variant` | `'dark' \| 'glass' \| 'light'` | `'dark'` | 视觉风格 |
| `placement` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | 方向 |
| `trigger` | `'hover' \| 'click'` | — | 触发方式 |
| `longitude` | `number` | — | 经度（锚点模式） |
| `latitude` | `number` | — | 纬度（锚点模式） |
| `offset` | `number` | — | 偏移距离 |
| `visible` | `boolean` | — | 受控可见性 |

## 相关文档

- [aimap-container.md](../core/aimap-container.md) — AiMap 主容器
- [controls.md](../controls/controls.md) — 控件组件

---

## Maki Icon Utilities — 内置地图图标

内置 200+ Maki 矢量图标（POI 地图常用），可生成 SVG data URL 直接用于 `IconLayer` 或 `Marker`。

```tsx
import {
  MAKI_ICONS,           // Record<string, string> — 图标名 → SVG path data
  MAKI_ICON_NAMES,      // string[] — 所有可用图标名列表
  makiIconUrl,          // 单个图标 → SVG data URL
  makiPinUrl,           // 单个图标 → 带水滴底座的 Pin SVG data URL
  createMakiIconMap,    // 批量生成 { name: dataUrl } 映射
  createMakiPinMap,     // 批量生成 Pin 版本映射
} from '@antv/aimapui';
```

### makiIconUrl(icon, opts?)

生成指定 Maki 图标的 SVG data URL。

```ts
const url = makiIconUrl('cafe', { size: 32, fill: '#333' });
// → 'data:image/svg+xml,...'
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `icon` | `string` | **必填** | Maki 图标名（如 `'cafe'`、`'bus'`） |
| `opts.size` | `number` | `32` | SVG 尺寸 |
| `opts.fill` | `string` | `'#333'` | 填充颜色 |

### makiPinUrl(icon, opts?)

生成带水滴形底座的 Pin 图标 SVG data URL（适合 Marker 场景）。

```ts
const pinUrl = makiPinUrl('restaurant', { size: 40, fill: '#2563eb' });
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `icon` | `string` | **必填** | Maki 图标名 |
| `opts.size` | `number` | `40` | SVG 尺寸 |
| `opts.fill` | `string` | `'#2563eb'` | Pin 底座填充颜色 |

### createMakiIconMap(names, opts?)

批量生成 `{ name: dataUrl }` 映射表，直接传给 `IconLayer.iconValues`。

```tsx
const iconMap = createMakiIconMap(['cafe', 'bus', 'hospital'], { size: 32, fill: '#333' });
// → { cafe: 'data:...', bus: 'data:...', hospital: 'data:...' }

<IconLayer iconField="type" iconValues={iconMap} />
```

### createMakiPinMap(names, opts?)

同上，但生成 Pin 样式版本。

```tsx
const pinMap = createMakiPinMap(['cafe', 'bus'], { fill: '#10b981' });
```

### 常用图标名

`airport`, `bus`, `cafe`, `restaurant`, `hospital`, `hotel`, `parking`, `school`, `shop`, `bank`, `bar`, `bicycle`, `car`, `cinema`, `fire-station`, `fuel`, `garden`, `library`, `museum`, `park`, `pharmacy`, `police`, `post`, `swimming`, `theatre`, `toilet`, `marker`...
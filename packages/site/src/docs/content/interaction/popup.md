# Popup

地图弹窗组件，在指定经纬度位置弹出信息窗口。支持三种尺寸变体和两种内容模式——自定义内容模式（传 `content`）和结构化模式（传 `header` + `attributes` + `actions`），结构化模式适合展示 POI 详情卡片。

> **何时选择：** 需要在地图上某个坐标点展示详细信息时用 Popup；只需要轻量文本提示时用 [Tooltip](./tooltip)；需要在坐标点放置自定义 DOM 元素时用 [Marker](./marker)。与 [PointLayer](../layers/point-layer) 的 `onClick` 事件配合使用是最常见的交互模式。

## 导入

```tsx
import { Popup } from '@antv/aimapui'
```

## Props

### 位置与尺寸

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `longitude` | `number` | **必填** | 弹窗锚点经度 |
| `latitude` | `number` | **必填** | 弹窗锚点纬度 |
| `size` | `'compact' \| 'standard' \| 'detailed'` | `'standard'` | 弹窗尺寸：`compact`（240px，精简信息）、`standard`（320px，默认）、`detailed`（480px，带封面图和多属性） |
| `placement` | `'auto' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'auto'` | 弹出方向，`'auto'` 自动根据视口边界选择不溢出的方向 |
| `offset` | `number` | `8` | 弹窗相对锚点的偏移（像素），正值远离锚点 |
| `closeButton` | `boolean` | `true` | 是否显示右上角关闭按钮 |

### 内容模式

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | `string \| ReactNode` | - | 自定义内容，支持纯文本、HTML 字符串或 React 组件。传了 `header`/`attributes` 后 `content` 被忽略 |
| `header` | [PopupHeader](#popupheader) | - | 结构化标题栏，包含标题、封面图、状态标签 |
| `attributes` | [PopupAttribute[]](#popupattribute) | - | 结构化属性列表，"标签-值"对齐排列 |
| `actions` | [PopupAction[]](#popupaction) | - | 底部操作按钮数组 |

### 可见性控制

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | 内部管理 | 受控模式：传入后由外部控制显隐；不传时组件内部管理（默认显示） |
| `singleton` | `boolean` | `false` | 互斥模式：同一地图上同时只显示一个 Popup，后弹出的自动关闭前一个 |
| `onClose` | `() => void` | - | 弹窗关闭时的回调，受控模式下需在此设 `visible=false` |

### 样式

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `className` | `string` | - | 自定义 CSS 类名，用于覆盖弹窗样式 |
| `overlayContainer` | `HTMLElement \| null` | - | 自定义 Overlay 挂载容器，默认挂载到地图容器内；多地图实例或需要将弹窗渲染到指定 DOM 层级时使用 |

## 子类型定义

### PopupHeader

结构化标题栏，`compact` 模式显示标题 + 脉冲指示灯，`detailed` 模式额外渲染封面图。

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 标题文字 |
| `coverUrl` | `string` | 封面图 URL，仅 `detailed` 模式渲染，比例 16:9 |
| `statusLabel` | `string` | 状态标签文字，显示在封面图左下角或标题旁 |
| `statusColor` | `string` | 状态标签背景色，默认 `#10b981`（绿色） |
| `statusDot` | `string` | compact 模式标题前的脉冲指示灯颜色 |

### PopupAttribute

"标签-值"对齐排列的属性条目，`detailed` 模式下可附加图标。

| 字段 | 类型 | 说明 |
|------|------|------|
| `label` | `string` | 属性标签（左侧） |
| `value` | `string \| number` | 属性值（右侧） |
| `valueColor` | `string` | 值文字颜色，可用于高亮异常值，如红色表示超标 |
| `icon` | `string` | Material Symbols 图标名，仅 `detailed` 模式渲染图标容器 |

### PopupAction

底部操作按钮。

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | `string` | - | 按钮文字 |
| `variant` | `'primary' \| 'secondary'` | `'primary'` | 按钮样式，`primary` 为填充主按钮，`secondary` 为描边次要按钮 |
| `onClick` | `() => void` | - | 点击回调 |

## 示例

### 最简用法 — 纯文本弹窗

```tsx
import { AiMap, Popup } from '@antv/aimapui'

<AiMap autoFit map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 10, token }}>
  <Popup longitude={116.397} latitude={39.908} content="北京天安门" />
</AiMap>
```

### 与图层数据联动 — 点击展示详情

最常见的交互模式：监听 PointLayer 点击事件，在点击位置弹出 Popup：

```tsx
const [popup, setPopup] = useState<{ lng: number; lat: number; name: string } | null>(null)

<AiMap autoFit map={{ basemap: 'gaode', center: [108, 34], zoom: 4, token }}>
  <PointLayer
    source={cities}
    sourceType="json"
    sourceConfig={{ x: 'lng', y: 'lat' }}
    size={10}
    color="#3B82F6"
    onClick={(e) => {
      setPopup({ lng: e.lng, lat: e.lat, name: e.feature?.name as string })
    }}
  />
  {popup && (
    <Popup
      longitude={popup.lng}
      latitude={popup.lat}
      content={popup.name}
      onClose={() => setPopup(null)}
    />
  )}
</AiMap>
```

### 结构化弹窗 — POI 详情卡片

```tsx
<Popup
  longitude={116.397}
  latitude={39.908}
  header={{
    title: '北京',
    statusLabel: '在线',
    statusDot: '#10b981',
  }}
  attributes={[
    { label: '人口', value: '2189 万' },
    { label: '面积', value: '1.64 万 km²' },
    { label: 'GDP', value: '41610 亿', valueColor: '#2563EB' },
  ]}
/>
```

### 详细模式 — 带封面图和操作按钮

```tsx
<Popup
  longitude={116.397}
  latitude={39.908}
  size="detailed"
  header={{
    title: '故宫博物院',
    coverUrl: 'https://example.com/forbidden-city.jpg',
    statusLabel: '开放中',
    statusColor: '#10b981',
  }}
  attributes={[
    { label: '开放时间', value: '08:30-17:00', icon: 'schedule' },
    { label: '门票', value: '60 元', icon: 'confirmation_number' },
    { label: '评分', value: '4.8', icon: 'star', valueColor: '#F59E0B' },
  ]}
  actions={[
    { label: '导航前往', variant: 'primary', onClick: () => handleNav() },
    { label: '收藏', variant: 'secondary', onClick: () => handleFav() },
  ]}
/>
```

### 互斥模式 — 同时只显示一个弹窗

开启 `singleton` 后，后弹出的 Popup 会自动关闭前一个，适合地图上多个标注点的场景：

```tsx
<Popup
  longitude={116.397}
  latitude={39.908}
  singleton
  content="这个弹窗弹出时，其他 singleton Popup 会自动关闭"
/>
```

### 受控显隐

通过 `visible` + `onClose` 配合 React 状态控制弹窗显隐：

```tsx
const [visible, setVisible] = useState(true)

<Popup
  longitude={116.397}
  latitude={39.908}
  visible={visible}
  onClose={() => setVisible(false)}
  header={{ title: '北京站' }}
/>
```

## 注意事项

- `content` 和 `header`/`attributes`/`actions` 二选一：传了 `header` 等结构化属性后，`content` 会被忽略
- `singleton` 互斥模式仅对同样设了 `singleton` 的 Popup 生效
- `placement='auto'` 会在视口边缘自动翻转方向，避免弹窗溢出屏幕
- 受控模式下必须传 `onClose` 回调并设置 `visible=false`，否则关闭按钮点击后弹窗不会消失
- Popup 组件不需要包在图层内部，只需放在 `AiMap` 容器下，坐标会自动映射到地图位置

## 相关组件

- [Tooltip](./tooltip) — 轻量文本提示，适合悬停时显示简短信息
- [Marker](./marker) — DOM 标注组件，可在坐标点放置任意 React 组件
- [PointLayer](../layers/point-layer) — 散点图层，常与 Popup 的 `onClick` 联动
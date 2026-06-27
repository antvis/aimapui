# Popup — 弹窗

DOM 方式渲染的弹窗组件，支持 MD3 玻璃态样式、自动翻转定位、结构化内容（标题栏 + 属性列表 + 操作按钮）。适用于点击 Marker 或图层要素后展示详细信息。

## Examples

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
  singleton
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
<Popup
  longitude={116} latitude={39}
  content="受控弹窗"
  visible={show}
  onClose={() => setShow(false)}
/>
```

## Enums

- **PopupSize:** `'compact'` | `'standard'` | `'detailed'`
- **PopupPlacement:** `'auto'` | `'top'` | `'bottom'` | `'left'` | `'right'`

## Types

```ts
interface PopupHeader {
  title: string;
  coverUrl?: string;
  statusLabel?: string;
  statusColor?: string;
}

interface PopupAttribute {
  label: string;
  value: string | number;
  valueColor?: string;
  icon?: string;          // Material Symbols 图标名（detailed 模式）
}

interface PopupAction {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `longitude` | `number` | **必填** | 经度 |
| `latitude` | `number` | **必填** | 纬度 |
| `content` | `string \| ReactNode` | — | 内容（文本/HTML/ReactNode） |
| `size` | `PopupSize` | `'standard'` | 尺寸 |
| `placement` | `PopupPlacement` | `'auto'` | 弹出位置（auto 根据视口自动翻转） |
| `offset` | `number` | `8` | 距锚点偏移像素 |
| `closeButton` | `boolean` | `true` | 显示关闭按钮 |
| `singleton` | `boolean` | `false` | 互斥模式，同时间仅一个 Popup |
| `visible` | `boolean` | — | 受控可见性 |
| `header` | `PopupHeader` | — | 结构化标题栏 |
| `attributes` | `PopupAttribute[]` | — | 属性列表 |
| `actions` | `PopupAction[]` | — | 底部操作按钮 |
| `onClose` | `() => void` | — | 关闭回调 |

## 尺寸变体

| size | 宽度 | 适用场景 |
|------|------|---------|
| `compact` | 240px | 紧凑信息卡片 |
| `standard` | 320px | 标准详情（默认） |
| `detailed` | 480px | 完整详情（含封面图 + 属性列表 + 操作按钮） |

## 交互行为

- **自动翻转**：`placement="auto"` 时根据视口空间自动选择最佳方向
- **ESC 关闭**：按 ESC 键关闭弹窗
- **点击外部关闭**：点击地图空白区域关闭
- **互斥模式**：`singleton` 模式下同时间只有一个 Popup 可见
- **退出动画**：关闭时有淡出动画

## 相关文档

- [index.md](index.md) — 交互组件概览
- [marker.md](marker.md) — 标注组件
- [tooltip.md](tooltip.md) — 悬浮提示
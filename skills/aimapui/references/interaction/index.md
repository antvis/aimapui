# Interaction 交互组件

交互组件提供地图上的标注、弹窗和悬浮提示能力，以 DOM 元素方式渲染，不依赖 L7 图层。

## 组件列表

| 组件 | 文档 | 说明 |
|------|------|------|
| Marker | [marker.md](marker.md) | 地图标注 — 4 种形态 + 4 种语义颜色 + 可拖拽 + 文本标签 |
| Popup | [popup.md](popup.md) | 弹窗 — MD3 玻璃态 + 自动翻转 + 结构化内容 |
| Tooltip | [tooltip.md](tooltip.md) | 悬浮提示 — 3 种视觉变体 + 跟随鼠标/锚点 |
| Maki Icons | [maki-icons.md](maki-icons.md) | 内置 200+ Maki 矢量图标工具集 |

## 快速示例

```tsx
// Marker
<Marker longitude={116.397} latitude={39.908} label="北京" variant="pin" color="primary" />

// Popup
<Popup longitude={116.397} latitude={39.908} content="详细信息" size="standard" placement="auto" />

// Tooltip
<Tooltip longitude={116.397} latitude={39.908} content="悬浮提示" variant="dark" placement="top" />

// Maki + IconLayer
<IconLayer iconField="type" iconMap={createMakiIconMap(['cafe', 'bus', 'hospital'])} />
```

## 使用场景对比

| 场景 | 推荐 |
|------|------|
| < 100 个标注点 | Marker |
| > 100 个标注点 | PointLayer / BubbleLayer |
| 点击查看详情 | Popup |
| hover 显示简要信息 | Tooltip |
| 自定义图标 | Maki + IconLayer / Marker |

## 相关文档

- [aimap-container.md](../core/aimap-container.md) — AiMap 主容器
- [controls.md](../controls/controls.md) — 控件组件
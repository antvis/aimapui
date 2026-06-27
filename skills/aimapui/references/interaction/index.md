# Interaction 交互组件

交互组件提供地图上的标注、弹窗和悬浮提示能力，以 DOM 元素方式渲染，不依赖 L7 图层。

## Available Components

| Component | File | Description |
|-----------|------|-------------|
| Marker | [marker.md](marker.md) | 地图标注 — 4 种形态 + 4 种语义颜色 + 可拖拽 + 文本标签 |
| Popup | [popup.md](popup.md) | 弹窗 — MD3 玻璃态 + 自动翻转 + 结构化内容 |
| Tooltip | [tooltip.md](tooltip.md) | 悬浮提示 — 3 种视觉变体 + 跟随鼠标/锚点 |
| Maki Icons | [maki-icons.md](maki-icons.md) | 内置 200+ Maki 矢量图标工具集 |

## 使用场景对比

| 场景 | 推荐组件 |
|------|---------|
| < 100 个标注点 | Marker |
| > 100 个标注点 | PointLayer / BubbleLayer |
| 点击查看详情 | Popup |
| hover 显示简要信息 | Tooltip |
| 需要自定义图标 | Maki + IconLayer / Marker |

## 相关文档

- [aimap-container.md](../core/aimap-container.md) — AiMap 主容器
- [controls.md](../controls/controls.md) — 控件组件
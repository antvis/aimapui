# 地图标注 (Marker) 设计规范

本规范定义了地图上点要素（Marker）的视觉表现与交互逻辑，旨在平衡高精度地理信息的专业感与 UI 交互的清晰度。

## 1. 基础形态规范 (Geometry & Anatomy)

### 水滴型 (Pin Marker) - 默认业务点
*   **结构**: 圆形头部 + 底部尖角指向。
*   **尺寸**: 32x40px。
*   **视觉**: `bg-primary` 填充，1.5px 白色描边，带 `shadow-md`。
*   **用途**: POI、物流站点、静态设施。

### 圆型 (Circle Marker) - 移动/轻量点
*   **结构**: 完美的圆形容器。
*   **尺寸**: 24x24px。
*   **视觉**: 半透明背景 `bg-primary/20` + 实心内圆。
*   **用途**: 实时车辆、传感器节点、背景要素。

### 图标型 (Icon Marker)
*   **结构**: 在 Pin 或 Circle 内部嵌入 Material Symbols 图标。
*   **图标规范**: 16px 尺寸，`text-white`。

## 2. 状态与语义 (States & Semantics)

### 交互状态
*   **默认 (Default)**: 标准尺寸，`shadow-md`。
*   **悬停 (Hover)**: 尺寸放大至 110%，位移 `translate-y-[-2px]`，阴影加深为 `shadow-xl`。
*   **选中 (Selected)**: 增加环形呼吸脉冲动画 (`animate-pulse`)，边框颜色切换至 `secondary`。
*   **禁用/离线 (Inactive)**: 饱和度降低，`grayscale` 处理，`opacity-50`。

### 业务语义映射
*   **正常/推荐**: `text-primary` (#2563EB)。
*   **预警/高负载**: `text-warning` (#F59E0B)。
*   **故障/危险**: `text-error` (#BA1A1A)。
*   **完成/安全**: `text-success` (#22C55E)。

## 3. 缩放适配逻辑 (Zoom Scaling)

*   **高缩放级 (Zoom 15+)**: 展示完整 Marker + 文本标注 (Label)。
*   **中缩放级 (Zoom 10-14)**: 仅展示 Marker 图标，隐藏文本。
*   **低缩放级 (Zoom <10)**: Marker 自动降级为 6-8px 的纯色圆点，以减少视觉拥挤。

## 4. 文本标注 (Labeling)
*   **位置**: 默认置于 Marker 下方 4px。
*   **样式**: `font-mono-data text-xs`，带有 2px 白色光晕 (Halo) 确保对比度。

---
*Derived from: Cartographic Precision System v1.2.0*

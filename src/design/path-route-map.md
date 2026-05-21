# 地图路径与轨迹 (Path & Route Map) 设计规范

本规范定义了地图上线要素（路径、轨迹、流向）的视觉表现与交互逻辑，旨在满足从单一导航到复杂物流流向的多场景可视化需求。

---

## 1. 基础路径定义 (Visual Definitions)

### 1.1 线条类型
*   **实线 (Solid)**: 用于确定的路线、已完成的轨迹或核心边界。
*   **虚线 (Dashed)**: 用于规划中、预测或次要路径。`stroke-dasharray: 4 4`。
*   **渐变线 (Gradient)**: 用于表示方向（起点到终点）或属性变化（如速度、拥挤度）。

### 1.2 尺寸规范 (Stroke Width)
线宽随缩放级别 (Zoom Level) 动态调整：
*   **Level 1 (细)**: 1.5px — 基础路网或远景轨迹。
*   **Level 2 (中)**: 3px — 选中的核心路径。
*   **Level 3 (粗)**: 6px+ — 带有流向动画或高权重航线。

---

## 2. 场景化色彩语义 (Color Semantics)

### 2.1 状态与属性映射
*   **标准导航**: `bg-primary` (蓝色) — 默认推荐路线。
*   **交通拥堵**: 
    *   畅通: `text-success` (绿色)
    *   缓行: `text-warning` (黄色)
    *   拥堵: `text-error` (红色)
*   **业务状态**:
    *   在线/行驶中: `text-primary`
    *   离线/静止: `text-outline-variant`

---

## 3. 方向与流向 (Direction & Flow)

### 3.1 视觉引导
*   **箭头指示 (Arrows)**: 沿线绘制等间距箭头。在复杂立交或密集路网中，箭头应随缩放级别调整间距或显示。
*   **流动动画 (Flow Animation)**: 
    *   使用 `stroke-dashoffset` 动画模拟物质流或车流。
    *   **速度**: `duration-1000` 至 `duration-3000` 循环。
*   **端点样式**: 
    *   起点: 绿色圆点或 `play_arrow` 图标。
    *   终点: 红色定位销或 `location_on` 图标。

---

## 4. 交互行为 (Interaction)

### 4.1 悬停与选中
*   **悬停 (Hover)**: 线条加粗 1-2px，不透明度提升至 100%，显示该段路径的属性（如：时长、距离、载重）。
*   **选中 (Selected)**: 线条带有 `shadow-lg` 外发光效果，且其他非关联路径置灰 (`opacity-20`) 以突出重点。

### 4.2 自动避让与层级
*   **重叠处理**: 交叉路径应通过 Z-index 管理，核心业务路径置于顶层。
*   **标注**: 仅在长路径的中段或转折点显示名称，避免全线标注。

---

*Derived from: Cartographic Precision System v1.2.0*

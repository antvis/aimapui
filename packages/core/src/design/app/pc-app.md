# Cartographic Precision System (CPS) - PC 端地图应用设计规范

本规范旨在为高精度地理信息系统 (GIS) 提供统一的桌面端视觉语言与交互标准，重点关注高信息密度展示与精确的空间交互。

---

## 1. 核心布局框架 (Shell & Layout)

### 1.1 基础容器
*   **侧边导航栏 (Side Sidebar)**: 固定宽度 `360px` 或 `w-sidebar-width`。用于图层管理、分析工具及复杂业务逻辑。
*   **顶部应用栏 (Top App Bar)**: 高度 `64px`。承载品牌、搜索栏及全局状态信息。
*   **地图主视口 (Main Viewport)**: 沉浸式全屏布局，作为所有空间数据的展示核心。

### 1.2 边距与间距 (Spacing)
*   **画布页边距 (Canvas Margin)**: `24px`。
*   **控件间隙 (Control Gap)**: `12px - 16px`。

---

## 2. 视觉材质与风格 (Visual & Material)

### 2.1 玻璃拟态 (Glassmorphism)
*   **背景**: `bg-surface/80` 结合 `backdrop-blur-md`。
*   **边框**: `1px border-outline-variant/30`。
*   **阴影**: `shadow-lg`。用于悬浮在地图上的所有控件，确保在复杂底图纹理下的识别度。

### 2.2 颜色系统
*   **主色 (Primary)**: `#2563EB`。用于核心操作按钮、选中状态及关键路径。
*   **背景色 (Surface)**: `#F8F9FF`。
*   **文字颜色**: 
    *   正文: `text-on-surface`。
    *   辅助: `text-on-surface-variant`。
    *   数据: 使用 `font-mono-data` 强调精确性。

---

## 3. 地图交互控件 (Map Controls)

### 3.1 核心控制组 (Control Group)
*   **缩放/全屏/定位**: 采用垂直堆叠布局，置于屏幕角落。
*   **样式**: 玻璃拟态容器，`rounded-lg` 或 `rounded-full`。
*   **交互**: `hover:bg-primary-container/20`，点击反馈 `active:scale-95`。

### 3.2 状态栏 (Status Bar)
*   **位置**: 地图底部边缘，横向拉通。
*   **内容**: 
    *   实时光标经纬度 (Lat/Lon)。
    *   动态比例尺 (Dynamic Scale)。
    *   系统运行状态 (System Ready/Operational)。
*   **字体**: `font-mono text-xs uppercase tracking-wider`。

---

## 4. 专题图层与可视化 (Thematic & Visualization)

### 4.1 标注 (Markers)
*   **Pin Marker**: SVG 矢量路径绘制的水滴型，`1.5px` 白色描边 + `shadow-md`。
*   **状态反馈**: 悬停时 `scale-110` 并伴随位移，选中时增加脉冲光晕 (`animate-pulse`)。

### 4.2 图层管理器 (Layer Control)
*   **交互**: 支持抽屉式展开/收起。
*   **逻辑**: 提供显隐切换、透明度调节及层级拖拽。

---

## 5. 交互行为规范 (Interaction)

### 5.1 悬停与选中 (Hover & Selected)
*   **Tooltip**: `bg-surface-container-highest/90`，深色高对比度，与要素保持 `8px` 间距。
*   **选中高亮**: 选中的要素应伴随外发光 (Glow) 或边界线加粗。

### 5.2 动效 (Motion)
*   **平滑缩放**: 地图缩放与平移需具备惯性平滑感。
*   **面板切换**: `duration-300 ease-in-out` 的侧边栏滑动动效。

---
*Derived from: {{DATA:DESIGN_SYSTEM:DESIGN_SYSTEM_1}} | Cartographic Precision System v2.4.0 PC Module*

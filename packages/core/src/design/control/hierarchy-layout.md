# Cartographic Precision System (CPS) - 地图层级与布局架构规范 (Hierarchy & Layout)

本规范定义了地图应用中"地理数据图层"与"界面交互组件"的纵向堆叠顺序（Z-Index）与横向空间布局，旨在解决复杂 GIS 系统中各要素相互遮挡、优先级不明确的问题。

---

## 1. 纵向堆叠层级 (Z-Index Hierarchy)

从底图到顶层 UI，系统分为四大核心层级：

### 1.1 地理底图层 (Base Layer Group) - [Z: 0 - 100]
*   **瓦片图层 (Tile Layer)**: 位于最底层。包含卫星图、标准街道图、暗色底图。
*   **图片/栅格图层 (Image/Raster Layer)**: 位于瓦片之上。包含天气雷达、红外遥感等覆盖图。

### 1.2 可视化数据层 (Data Visualization Group) - [Z: 101 - 500]
按照几何维度从面到点降序排列，确保小要素不被大要素遮挡：
1.  **面要素 (Polygons/Choropleth)**: 填充图、行政区划、蜂窝热力图。
2.  **线要素 (Lines/Paths/Arcs)**: 路线、流向弧线、轨迹。
3.  **点要素 (Markers/Bubbles)**: 气泡图、聚合点、业务 Marker。
4.  **文本标注 (Labels)**: 随 Marker 移动的文字标签。

### 1.3 交互反馈层 (Interaction Group) - [Z: 501 - 900]
*   **高亮状态 (Highlight/Active)**: 选中或悬停时的要素，应置于同类要素顶层。
*   **Popup 弹出框**: 锚定在地理坐标上的信息窗。
*   **Tooltip 轻提示**: 紧贴鼠标或要素的即时反馈。

### 1.4 UI 控件层 (UI Shell Group) - [Z: 1000+]
*   **固定面板 (Sidebar/TopBar)**: 核心框架组件。
*   **悬浮控件 (Controls)**: 缩放、定位、全屏、图例。
*   **覆盖层 (Drawer/Modal)**: 全屏遮罩或滑出式抽屉。

---

## 2. 空间布局与锚点规范 (Layout & Anchors)

### 2.1 顶部应用栏 (Top App Bar)
*   **位置**: 屏幕顶部固定。
*   **内容**: Logo、品牌名称、全局搜索、系统状态。
*   **规范**: 高度 64px，玻璃拟态背景，拉通全屏。

### 2.2 侧边工具面板 (Sidebar / Layer Control)
*   **位置**: 默认左侧（符合视觉扫描规律）。
*   **内容**: 图层切换、筛选器、详细属性面板。
*   **规范**: 宽度 360px，`border-r` 或 `shadow-xl` 物理分隔。

### 2.3 地图核心控件组 (Floating Controls)
*   **缩放/全屏 (Zoom & Fullscreen)**: 屏幕**右上角**。垂直/水平堆叠，间距 12px。
*   **定位/罗盘 (Locate & Compass)**: 屏幕**右下角**（缩放控件上方）。
*   **图例 (Legend)**: 屏幕**左下角**或**右下角**（视侧边栏位置而定）。常驻展示。

### 2.4 状态与坐标栏 (Status Bar)
*   **位置**: 屏幕底部边缘，横向拉通。
*   **内容**: 实时坐标、比例尺、系统运行日志。

---

## 3. 组件排列优先级 (Interaction Priority)

1.  **Modal > Drawer > Sidebar**: 临时出现的弹窗拥有最高优先级，会遮挡侧边栏。
2.  **Popup > Legend**: 业务信息的弹出框应置于图例之上，避免图例遮挡核心交互点。
3.  **UI Controls > Data Layers**: 所有 UI 按钮必须始终可见，不应被任何地理要素（如 3D 建筑）遮挡。

---
*Derived from: {{DATA:DESIGN_SYSTEM:DESIGN_SYSTEM_1}} | CPS Hierarchy Spec v1.0*
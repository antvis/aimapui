# 地图控件 (Map Controls) 设计规范

本规范定义了 GeoLink Pro 地图组件库中所有控件的视觉样式与结构模式，涵盖 PC/桌面端核心控件、信息叠加层及移动端专属组件。

---

## 1. 核心控件 (PC & Desktop)

### 1.1 ZoomControl / FullscreenControl / GeoLocateControl
*   **样式**: 浮动玻璃拟态或实体表面容器。
*   **桌面端**: 在角落垂直或水平分组排列（如右上角）。`bg-surface/80 backdrop-blur-md`，`border border-outline-variant/30`，`shadow-sm`。
*   **交互**: `hover:bg-primary-container/20`，`active:scale-95`。
*   **图标**: Material Symbols (`add`, `remove`, `fullscreen`, `my_location`)。

### 1.2 MapThemeControl（主题切换器）
*   **布局**: 网格或分段按钮。
*   **桌面端**: 2×2 按钮网格，图标 + 标签。`bg-surface-container-low`，`rounded-lg`。
*   **激活态**: `bg-primary text-on-primary shadow-md`。
*   **标签**: "Standard"、"Light"、"Dark"、"Satellite"。

### 1.3 MouseLocationControl & ScaleControl（状态栏）
*   **布局**: 底部水平状态条。
*   **样式**: `bg-surface/90 backdrop-blur-sm`，`border-t border-outline-variant/20`，`px-4 py-2`。
*   **排版**: `font-mono text-xs uppercase tracking-wider`。
*   **内容**: "CURSOR: 48.86111 / 2.33583"，"ALTITUDE: 32m AMSL"。

### 1.4 ExportImageControl（导出图片）
*   **样式**: 集成在顶部栏或侧边操作面板中。
*   **桌面端**: 按钮组，带 "PNG"、"PDF" 标签。`border border-outline`，`rounded-md`，`px-3 py-1`。

---

## 2. 信息与叠加层 (Information & Overlays)

### 2.1 Marker（自定义标注点）
*   **样式**: 水滴型 (Pin) 或圆型 (Circle)，支持脉冲动画。
*   **交互**: 拖拽状态增加 `shadow-xl` 和 `scale-110`。
*   **颜色**: Primary 蓝 (#2563eb)，白色描边。

### 2.2 Popup & Tooltip
*   **Popup**: 大型白色卡片，支持封面图。`rounded-xl`，`shadow-2xl`，`p-0 overflow-hidden`。包含操作按钮（如"查看详情"）和关闭图标。
*   **Tooltip**: 小型深色表面。`bg-surface-container-highest`，`text-on-surface`，`rounded-md`，`px-2 py-1`，`text-xs`。

### 2.3 LegendRenderer（图例容器）
*   **桌面端**: 浮动侧边栏面板或左下角卡片。
*   **移动端**: 底部抽屉 (`MobileSheetLegend`)。
*   **子类型**:
    *   **LegendCategories**: 彩色圆点 + 文本标签列表。
    *   **LegendRamp**: 水平渐变条 + 最小/最大值标签（如 0 到 50k+）。
    *   **LegendProportion**: 同心或相邻圆形，展示比例映射关系。

---

## 3. 移动端专属组件 (Mobile Specific)

### 3.1 MobileToolbar（移动端工具栏）
*   **布局**: 底部固定栏或浮动岛。
*   **样式**: `bg-surface/90 backdrop-blur-lg`，浮动式 `rounded-full` 或固定式 `rounded-t-xl`。
*   **操作项**: 探索、图例、工具、个人资料。

### 3.2 MobileSheetLegend（移动端图例抽屉）
*   **结构**: 顶部拖拽手柄。`bg-surface`，`rounded-t-3xl`，`shadow-[0_-8px_24px_rgba(0,0,0,0.1)]`。
*   **内容**: 全高可滚动的图层与数据范围列表。

### 3.3 TouchGesturePanel（触控手势面板）
*   **视觉反馈**: 点击时细微径向涟漪；拖放时幽灵标注效果。

---

## 4. 通用设计原则

### 4.1 玻璃拟态基础
```css
.glass-panel {
  background: rgba(248, 249, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(195, 198, 215, 0.3);
}
```

### 4.2 控件定位锚点
| 位置 | CSS 类 | 说明 |
|------|--------|------|
| 左上 | `.l7-top.l7-left` | 缩放、定位等核心控件 |
| 右上 | `.l7-top.l7-right` | 主题切换、全屏等辅助控件 |
| 左下 | `.l7-bottom.l7-left` | 图例、比例尺 |
| 右下 | `.l7-bottom.l7-right` | 导出、鼠标位置 |

### 4.3 响应式断点
*   **桌面端** (≥1024px): 全功能控件组，浮动面板布局。
*   **平板** (768–1023px): 控件收缩为图标式，图例折叠。
*   **移动端** (<768px): 底部工具栏 + 底部抽屉，手势优先。

---

*Derived from: Cartographic Precision System v1.2.0*

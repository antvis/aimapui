# 移动端应用 (Mobile App) 设计规范

本规范定义了地图应用在移动设备上的视觉表现、组件样式与交互逻辑，旨在优化小屏幕上的操作体验与信息密度平衡。

---

## 1. 基础视觉准则 (Visual Principles)

### 1.1 触控优先 (Touch-First)
*   **点击区域**: 所有核心交互控件（按钮、切换器）的有效触控面积必须大于等于 **44x44px**。
*   **安全边距**: 界面核心控件与屏幕边缘保持至少 **16px** 的安全距离，确保在全面屏设备上不被遮挡。

### 1.2 空间与材质 (Surface & Material)
*   **玻璃拟态 (Glassmorphism)**: 浮动控件（如搜索栏、浮动按钮）采用 `bg-surface/90` 结合 `backdrop-blur-lg` 的处理，增强层级感。
*   **圆角规范**: 
    *   底部面板 (Bottom Sheet): `rounded-t-3xl` (24px)。
    *   搜索栏 & 浮动按钮: `rounded-full`。

---

## 2. 核心组件规范 (Core Components)

### 2.1 智能搜索栏 (Mobile Search Bar)
*   **布局**: 悬浮岛式设计，置于屏幕顶部，距离顶部状态栏 16px。
*   **构成**: `Menu Icon` + `Search Placeholder` + `User Avatar`。
*   **交互**: 点击输入框展开全屏搜索界面；向下滑动地图时，搜索栏透明度可动态降低。

### 2.2 地图交互控件 (Map Controls)
*   **位置**: 集中于屏幕右下角，采用垂直堆叠布局。
*   **组件组**: 
    *   `Zoom In/Out`: 垂直按钮组。
    *   `My Location`: 独立圆形按钮。
*   **样式**: 纯白底色或玻璃拟态，带有 `shadow-lg` 阴影。

### 2.3 底部滑动面板 (Bottom Sheet)
*   **三段式状态**:
    1.  **Peek (收纳)**: 仅展示标题或搜索摘要，高度约 80px。
    2.  **Half (折叠)**: 展示核心数据列表或预览信息，高度约屏幕 40%。
    3.  **Full (展开)**: 沉浸式展示详细列表或分析图表，带有顶部 Handle 拖动手柄。
*   **数据列表**: 采用 `px-4 py-3` 的列表项间距，数值使用 `font-mono-data`。

### 2.4 底部导航栏 (Bottom Navigation)
*   **图标与标签**: 采用"Icon + Label"垂直排版。
*   **高亮状态**: 使用 `primary` 品牌色，并伴有底部短横线或圆形背景。
*   **模糊背景**: `bg-surface/90 backdrop-blur-xl`，高度固定 64px + 安全区高度。

---

## 3. 交互手势与反馈 (Interactions)

### 3.1 手势反馈 (Feedback)
*   **点击 (Tap)**: 产生轻微的放射状涟漪 (Ripple) 动效。
*   **拖拽 (Drag)**: 底部面板随手指位移实时跟随，松手后根据阈值自动吸附至最近状态。

### 3.2 视觉引导 (Visual Cues)
*   **Handle**: 面板顶部必须包含一条 32x4px 的浅灰色圆角横线，暗示可滑动。
*   **文字阴影 (Halo)**: 地图标注文字需带有 2px 白色光晕，确保在卫星图背景下的可读性。

---

*Derived from: Cartographic Precision System v2.4.0 Mobile Module*

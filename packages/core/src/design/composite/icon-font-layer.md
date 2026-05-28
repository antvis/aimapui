# 地图字体图标图层 (GlyphLayer) WebGL 设计规范

本规范定义了基于 WebGL 硬件加速的字体图标图层 (GlyphLayer) 的视觉表现、技术架构与交互逻辑。该图层通过将字体图标与文本标签整合为单一 WebGL 渲染批次，实现在海量数据（10k+）下的高性能空间可视化。

---

## 1. 核心渲染架构 (Rendering Architecture)

### 1.1 Glyph 纹理映射 (Glyph Mapping)
*   **字型生成**: 所有的字体图标与文本字符在预渲染阶段被转化为 **SDF (Signed Distance Fields)** 纹理图册。
*   **优势**: 在不同缩放级别下保持图标边缘的绝对锐利，且支持动态描边与发光效果而不损失性能。
*   **批次处理**: 图标与文字作为同一批次提交给 GPU，减少 Draw Call，确保在海量点位下的流畅交互。

### 1.2 性能阈值
*   **推荐载荷**: 5,000 - 50,000 个要素。
*   **渲染模式**: 强制开启 `geometricPrecision`。

---

## 2. 视觉解构与样式 (Anatomy & Styling)

### 2.1 字体图标 (Icon Font)
*   **库源**: 支持集成内部图标库或开源库（如 Material Symbols）。
*   **样式**: 
    *   **尺寸**: 默认 16px - 24px。
    *   **填充**: 支持基于数据属性的 WebGL 线性颜色映射。
    *   **光晕 (Halo)**: 必须带有 1px - 2px 的外部光晕（通过 SDF 片元着色器实现），确保在卫星图底色上的识别度。

### 2.2 关联文本 (Text Label)
*   **字体**: `font-mono-data` (推荐用于技术感强的 GIS)。
*   **排版**: 
    *   **位置**: 默认居中或右侧，间距固定为 4px。
    *   **动态换行**: 针对长文本开启 WebGL 文字截断。

---

## 3. 空间布局与碰撞算法 (Collision & Layout)

### 3.1 避让策略 (Avoidance)
*   **文本避让**: 开启基于 R-Tree 的 WebGL 碰撞检测。当多个标签重叠时，根据要素的"权重 (Weight)"属性决定显隐优先级。
*   **图标锁定**: 图标始终保持可见，仅在极端拥挤时才隐藏低权重文本，保留图标作为地理占位符。

### 3.2 锚点偏移 (Anchor & Offset)
*   **Offset**: 文本相对于图标中心点的像素级偏移，支持随缩放级别动态调整。

---

## 4. 交互行为规范 (Interaction)

### 4.1 拾取与反馈 (Picking)
*   **GPU Picking**: 利用颜色缓冲 (Color Buffer) 拾取技术，实现毫秒级的要素选中反馈。
*   **悬停 (Hover)**: 
    *   **视觉反馈**: 要素颜色加深，并伴随微小的 `scale` 放大（在顶点着色器中通过 `attribute` 控制）。
    *   **Tooltip**: 弹出 CPS 规范定义的轻提示。

### 4.2 选中 (Selected)
*   **视觉反馈**: 增加外圈发光效果，且该要素的 Z-index 在渲染批次中置顶。

---

## 5. 缩放适配逻辑 (Zoom Adaption)

*   **L1 (Zoom 14+)**: 显示完整"字体图标 + 文本"。
*   **L2 (Zoom 10-13)**: 隐藏文本，仅展示字体图标，图标尺寸轻微缩小。
*   **L3 (Zoom <10)**: 降级为 4px 的 SDF 圆点，仅展示分布趋势。

---
*Derived from: {{DATA:DESIGN_SYSTEM:DESIGN_SYSTEM_1}} | Cartographic Precision System v2.4.0 WebGL Module*

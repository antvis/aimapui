# 地图轻提示 (Tooltip) 设计规范

本规范定义了地图上要素在悬停（Hover）状态下的即时反馈容器——轻提示 (Tooltip) 的视觉表现与交互逻辑。Tooltip 旨在提供极简的摘要信息，而不干扰用户对底图的观察。

---

## 1. 基础视觉定义 (Visual Definitions)

### 1.1 容器样式

| 属性 | 深色变体 (dark) | 玻璃变体 (glass) | 浅色变体 (light) |
|------|----------------|-----------------|-----------------|
| **背景** | `bg-inverse-surface/95` (#27313f) | `glass-panel` 毛玻璃 | `bg-surface/95` (#f8f9ff) |
| **文字色** | `text-inverse-on-surface` (#eaf1ff) | `text-primary` (#004ac6) | `text-on-surface-variant` (#434655) |
| **边框** | `0.5px border-outline-variant/20` | `1px border-white/40` | `0.5px border-outline-variant/30` |
| **模糊** | `backdrop-blur-sm` (4px) | `backdrop-blur-md` (12px) | 无 |

*   **圆角**: `rounded-md` (6px)，呈现紧凑且精确的视觉感。
*   **不透明度**: 默认 `opacity-90`~`opacity-95`，配合 `backdrop-blur` 确保文字清晰度。
*   **阴影**: `shadow-md`，提供微弱的悬浮感。

### 1.2 尺寸规范
*   **最小宽度**: 80px。
*   **最大宽度**: 200px。
*   **内边距**: `px-2.5 py-1.5` (10px 6px)，紧凑型。

---

## 2. 文本规范 (Typography)

*   **标题**: `font-label-sm` (12px/16px) 粗体 (600)，通常为要素名称或指标标签。
*   **数值**: `font-mono-data` (JetBrains Mono, 12px/16px, weight 450)，强调数据的精确性。
*   **对齐**: 居中对齐（单行）或左对齐（多行/键值对）。
*   **颜色**: 
    *   深色模式: `text-on-surface` (#eaf1ff)。
    *   浅色模式: `text-on-surface-variant` (#434655)。

---

## 3. 箭头 (Arrow/Beak)

*   **形状**: 等腰三角形。
*   **尺寸**: 底宽 12px，高 6px。
*   **颜色**: 与容器背景色一致。
*   **位置**: 默认在容器下方（Tooltip 在要素上方时），随 `placement` 自动切换至上方、左方或右方。

---

## 4. 定位与偏移 (Positioning)

*   **相对位置**: 默认置于 Marker 或路径要素的 **上方**。
*   **视觉间距**: 与要素边缘保持 **8px** 的固定偏移，避免遮挡点击目标。
*   **碰撞避让**: 当接近屏幕边缘时，Tooltip 自动切换至下方、左侧或右侧显示。
*   **地图定位**: 支持经纬度 (`longitude`/`latitude`) 定位，地图交互时像素级同步跟随。

---

## 5. 交互逻辑 (Interaction)

### 5.1 触发机制
*   **触发**: 鼠标悬停（Hover）于 Marker、路径、填充区域或气泡上时即时出现。
*   **延迟**: 100ms 入场延迟（防止快速划过时的视觉闪烁）。
*   **消失**: 鼠标移出要素区域时立即消失。

### 5.2 动效 (Motion)
*   **入场**: `translate-y-1 -> translate-y-0` 伴随 `opacity-0 -> opacity-100`，时长 150ms。
*   **跟随**: 仅在悬停期间显示，不随鼠标实时移动（固定在要素中心点偏移处）。

---

## 6. 视觉变体 (Visual Variants)

### 6.1 Dark Contrast（深色对比）
适用于卫星图、亮色矢量底图。高对比度确保在复杂底图上的可读性。
*   **背景**: `rgba(39, 49, 63, 0.95)`
*   **文字**: `#eaf1ff`
*   **模糊**: `blur(4px)`

### 6.2 Glass Morphism（玻璃拟态）
适用于简洁数据地图。毛玻璃效果融入底图，不破坏视觉连续性。
*   **背景**: `rgba(248, 249, 255, 0.7)`
*   **文字**: `#004ac6` (Primary)
*   **模糊**: `blur(12px)`

### 6.3 Light（浅色）
适用于深色底图。白色背景确保在暗色底图上的对比度。
*   **背景**: `rgba(248, 249, 255, 0.95)`
*   **文字**: `#434655`
*   **模糊**: 无

---

## 7. CSS 类名体系

| 类名 | 说明 |
|------|------|
| `.aimapui-tooltip` | 外层容器 |
| `.aimapui-tooltip--glass` | 玻璃变体 |
| `.aimapui-tooltip--light` | 浅色变体 |
| `.aimapui-tooltip-content` | 内容容器（默认深色） |
| `.aimapui-tooltip-title` | 标题文字 |
| `.aimapui-tooltip-items` | 键值对列表容器 |
| `.aimapui-tooltip-item` | 单行键值对 |
| `.aimapui-tooltip-item-label` | 键标签 |
| `.aimapui-tooltip-item-value` | 值文字 |
| `.aimapui-tooltip-arrow` | 箭头基类 |
| `.aimapui-tooltip-arrow--top` | 上方箭头 |
| `.aimapui-tooltip-arrow--bottom` | 下方箭头 |
| `.aimapui-tooltip-arrow--left` | 左方箭头 |
| `.aimapui-tooltip-arrow--right` | 右方箭头 |

---

## 8. 组件 Props 接口

```typescript
export interface TooltipProps {
  /** 内容：纯文本 / ReactNode */
  content?: string | React.ReactNode;
  /** 视觉变体 */
  variant?: 'dark' | 'glass' | 'light';

  // ── 地图模式（经纬度定位） ──
  longitude?: number;
  latitude?: number;

  // ── DOM 模式（挂载到目标元素） ──
  targetElement?: HTMLElement | null;

  /** 方向 */
  placement?: 'top' | 'right' | 'bottom' | 'left';
  /** 偏移距离，默认 8px */
  offset?: number;
  /** 触发方式，默认 hover */
  trigger?: 'hover' | 'click';
  /** 受控可见性 */
  visible?: boolean;
  /** 结构化标题 */
  title?: string;
  /** 结构化键值对列表 */
  items?: TooltipItem[];
  /** 自定义类名 */
  className?: string;
}

export interface TooltipItem {
  label: string;
  value: string | number;
}
```

---

*Derived from: Cartographic Precision System v1.2.0*

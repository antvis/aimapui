# 地图弹出框 (Popup) 设计规范

本规范定义了地图上要素交互的核心容器——弹出框 (Popup) 的视觉样式、结构布局与交互逻辑，旨在提供高信息密度且视觉清爽的地理信息展示。

---

## 1. 基础视觉定义 (Visual Definitions)

### 1.1 容器样式
*   **背景**: `bg-surface/95` 结合 `backdrop-blur-md` (玻璃拟态)，增强与地图底图的层级感。
*   **圆角**: `rounded-xl` (12px)，符合 Cartographic Precision System 的现代感。
*   **阴影**: `shadow-2xl` (带有大半径扩散的深色阴影)，确保在复杂底图上的漂浮感。
*   **边框**: 1px `border-outline-variant/30`，界定物理边界。

### 1.2 尺寸规范
*   **标准型 (Standard)**: 宽度固定 320px，高度随内容自适应。适用于 POI 简介。
*   **紧凑型 (Compact)**: 宽度 240px。适用于简单的文字标注。
*   **宽幅型 (Detailed)**: 宽度 480px。适用于带有统计图表或详细参数对比。

---

## 2. 结构化布局 (Structure)

### 2.1 顶部头部 (Header)
*   **封面图 (Optional)**: 位于最上方，高度 120px，`aspect-video` 比例，`object-cover`。
*   **标题**: `font-headline-sm`，强调业务实体名称。
*   **关闭按钮**: 右上角悬浮，`icon-button` 样式，点击区域 32x32px。

### 2.2 内容区 (Body)
*   **属性列表**: 采用"标签-值"对齐模式。标签使用 `text-on-surface-variant font-label-md`，数值使用 `text-on-surface font-body-md`。
*   **数据对比**: 支持嵌入微型趋势图 (Sparkline) 或百分比进度条。

### 2.3 底部操作栏 (Footer / Action Bar)
*   **主动作**: `btn-primary` (例如：查看详情、路线导航)。
*   **次动作**: `btn-outline` 或简单的文字链 (例如：收藏、分享)。

---

## 3. 锚点与定位 (Anchoring)

### 3.1 指向箭头 (Tip/Arrow)
*   **形状**: 等腰三角形，底宽 16px，高 8px。
*   **位置**: 随弹出框相对于锚点的位置自动切换（上下左右）。
*   **对齐**: 默认对齐容器中心，支持像素级偏移以避让核心 Marker。

---

## 4. 交互逻辑 (Interaction)

### 4.1 触发与消失
*   **触发**: 点击 Marker 时弹出。
*   **互斥**: 默认同一时间仅显示一个 Popup，点击新要素时关闭旧 Popup。
*   **消失**: 点击关闭按钮、点击地图空白处或按下 `Esc` 键。

### 4.2 动效 (Motion)
*   **入场**: `scale-95 -> scale-100` 伴随 `opacity-0 -> opacity-100`，时长 200ms。
*   **跟随**: 地图平移时，Popup 需保持像素级同步跟随，无延迟感。

---

## 5. CSS 类名体系

| 类名 | 说明 |
|------|------|
| `.aimapui-popup` | 外层容器 |
| `.aimapui-popup--compact` | 紧凑型变体 |
| `.aimapui-popup--standard` | 标准型变体 |
| `.aimapui-popup--detailed` | 宽幅型变体 |
| `.aimapui-popup-content` | 内容容器（玻璃拟态） |
| `.aimapui-popup-cover` | 封面图容器 |
| `.aimapui-popup-header` | 标题区 |
| `.aimapui-popup-title` | 标题文字 |
| `.aimapui-popup-body` | 内容区 |
| `.aimapui-popup-close-btn` | 关闭按钮 |
| `.aimapui-popup-attrs` | 属性列表容器 |
| `.aimapui-popup-attr` | 单行属性 |
| `.aimapui-popup-attr-label` | 属性标签 |
| `.aimapui-popup-attr-value` | 属性值 |
| `.aimapui-popup-actions` | 底部操作栏 |
| `.aimapui-popup-action-btn` | 操作按钮 |
| `.aimapui-popup-tip-arrow` | 指向箭头 |

---

## 6. 组件 Props 接口

```typescript
export interface PopupProps {
  /** 经度 */
  longitude: number;
  /** 纬度 */
  latitude: number;
  /** 弹窗内容，支持纯文本 / HTML 字符串 / ReactNode */
  content?: string | React.ReactNode;
  /** 是否显示关闭按钮 */
  closeButton?: boolean;
  /** 尺寸变体 */
  size?: 'compact' | 'standard' | 'detailed';
  /** 结构化标题栏 */
  header?: PopupHeader;
  /** 属性列表 */
  attributes?: PopupAttribute[];
  /** 底部操作按钮 */
  actions?: PopupAction[];
  /** 受控可见性 */
  visible?: boolean;
  /** 关闭回调 */
  onClose?: () => void;
  /** 自定义类名 */
  className?: string;
}
```

---

*Derived from: Cartographic Precision System v1.2.0*

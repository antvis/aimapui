# 地图弹出框 (Popup) 设计规范

本规范定义了地图上要素交互的核心容器——弹出框 (Popup) 的视觉样式、结构布局与交互逻辑，旨在提供高信息密度且视觉清爽的地理信息展示。

## 1. 基础视觉定义 (Visual Definitions)

### 1.1 容器样式
- **背景**: `bg-surface/95` 结合 `backdrop-blur-md` (玻璃拟态)，增强与地图底图的层级感。
- **圆角**: `rounded-xl` (12px)，符合 Cartographic Precision System 的现代感。
- **阴影**: `shadow-2xl` (带有大半径扩散的深色阴影)，确保在复杂底图上的漂浮感。
- **边框**: 1px `border-outline-variant/30`，界定物理边界。

### 1.2 尺寸规范

| 变体 | 宽度 | 用途 |
|------|------|------|
| Standard | 320px | POI 简介等通用场景 |
| Compact | 240px | 简单文字标注 |
| Detailed | 480px | 统计图表或详细参数对比 |

## 2. 结构化布局 (Structure)

### 2.1 顶部头部 (Header)
- **封面图 (Optional)**: 位于最上方，高度 120px，`object-cover`。
- **标题**: `font-headline-sm`，强调业务实体名称。
- **关闭按钮**: 右上角悬浮，`icon-button` 样式，点击区域 32x32px。
  - 有封面图时：半透明黑底圆形按钮
  - 无封面图时：透明底方形按钮，hover 变 `surface-container-high`

### 2.2 内容区 (Body)
- **属性列表**: 采用"标签-值"对齐模式 (`grid-template-columns`)。
  - 标签: `text-on-surface-variant font-label-md`
  - 数值: `font-mono-data text-primary`
- 支持 Compact 单列、Standard/Detailed 双列布局。

### 2.3 底部操作栏 (Footer / Action Bar)
- **主动作**: `btn-primary` (例如：查看详情、路线导航)。
- **次动作**: `btn-outline` 或简单的文字链 (例如：收藏、分享)。

## 3. 锚点与定位 (Anchoring)

### 3.1 指向箭头 (Tip/Arrow)
- **形状**: 等腰三角形，底宽 20px，高 10px。
- **位置**: 默认对齐容器中心，底部向下指。
- **材质**: 与 Popup 内容背景同色 (`surface/95`)。

## 4. 交互逻辑 (Interaction)

### 4.1 触发与消失
- **触发**: 点击 Marker 时弹出。
- **互斥**: 默认同一时间仅显示一个 Popup，点击新要素时关闭旧 Popup。
- **消失**: 点击关闭按钮、点击地图空白处或按下 `Esc` 键。

### 4.2 动效 (Motion)
- **入场**: `scale-95 -> scale-100` 伴随 `opacity-0 -> opacity-100`，时长 200ms。
- **跟随**: 地图平移时，Popup 需保持像素级同步跟随，无延迟感。

## 5. 组件 API

```typescript
type PopupSize = 'compact' | 'standard' | 'detailed';

interface PopupHeader {
  title: string;
  coverUrl?: string;
  statusLabel?: string;
  statusColor?: string;
}

interface PopupAttribute {
  label: string;
  value: string | number;
  valueColor?: string;
}

interface PopupAction {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

interface PopupProps {
  longitude: number;
  latitude: number;
  content: string | React.ReactNode;
  size?: PopupSize;             // 默认 'standard'
  header?: PopupHeader;          // 结构化标题栏
  attributes?: PopupAttribute[]; // 属性列表
  actions?: PopupAction[];       // 底部操作按钮
  closeButton?: boolean;         // 默认 true
  onClose?: () => void;
}
```

---
*Derived from: Cartographic Precision System v1.2.0*
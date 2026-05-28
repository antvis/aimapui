# 地图气泡图 (Bubble Map) 设计规范

本规范定义了地图上气泡图要素的视觉表现与数据映射逻辑，旨在提供高精度、高易读性的空间数据可视化方案。

## 1. 气泡视觉定义 (Visual Definitions)

### 基础样式
- 形态: 完美的圆形，具有半透明填充和实色描边。
- 填充: `bg-primary/40` (默认)，支持根据数据维度进行色彩映射。
- 描边: 1px 实线 `border-primary`，确保在不同背景下的轮廓清晰。
- 效果: `backdrop-blur-sm` (增强在复杂底图上的易读性)。

### 尺寸映射 (Size Mapping)
气泡直径根据数据值线性或对数映射，通常分为五个视觉等级:
- Level 1 (极小): 8px - 用于长尾数据或背景参考。
- Level 2 (小): 16px - 标准离散点位。
- Level 3 (中): 32px - 核心关注区域。
- Level 4 (大): 48px - 显著权重区域。
- Level 5 (极大): 64px+ - 峰值或聚合极点。

## 2. 色彩语义 (Color Semantics)

根据数据类型，气泡可采用不同的配色方案:
- 单色渐变 (Sequential): 使用 `primary` 色的透明度或亮度变化表示数值高低。
- 定性区分 (Qualitative):
  - `#2563eb` (Primary) - 默认/正常
  - `#f59e0b` (Warning) - 预警/高负载
  - `#ef4444` (Error) - 故障/极高风险
  - `#10b981` (Success) - 达成/优质

## 3. 交互行为 (Interaction)

### 悬停 (Hover)
- 视觉变化: 填充不透明度增加至 60%，描边加粗至 2px。
- 浮窗 (Tooltip): 显示详细数值与指标（例如：销售额：¥1,200k，同比 +12%）。

### 点击 (Click)
- 反馈: 气泡产生微弱的扩散涟漪动画。
- 行为: 侧边栏弹出详细分析面板，或地图自动缩放至该要素中心。

## 4. 堆叠与覆盖 (Stacking)

- 透明度策略: 当多个气泡重叠时，通过叠加透明度产生更深的视觉效果，直观反映数据密度。
- 层级顺序: 较小的气泡应置于较大气泡之上，确保所有点位可被选中。

## aimapui 默认实现

`BubbleLayer` 在默认封装中提供:
- 默认圆形、半透明填充与描边 (`opacity: 0.4`, `strokeWidth: 1`)。
- 数据驱动大小映射默认值: `[8, 16, 32, 48, 64]`。
- 定性语义色板常量: `primary / warning / error / success`。
- 默认开启 hover/click 反馈（可通过 `hoverEffect` / `clickEffect` 关闭）。

```tsx
<BubbleLayer
  source={data}
  sourceType="geojson"
  sizeField="value"
  semanticColorField="status"
  labelField="name"
/>
```

---
Derived from Design System: `{{DATA:DESIGN_SYSTEM:DESIGN_SYSTEM_1}}`

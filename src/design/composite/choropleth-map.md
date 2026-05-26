# 地图填充图 (Choropleth Map) 设计规范

本规范定义了地图上区域填充（分级统计图）要素的视觉表现与色彩映射逻辑，旨在通过区域颜色深浅反映地理区域的数据分布差异。

## 1. 色彩映射规范 (Color Mapping)

填充图的核心在于将数据值映射为色阶。本系统支持以下三种主流映射模式：

### 单色渐变 (Sequential)
- 适用场景: 用于展示单一指标的数值高低（如人口密度、降雨量）。
- 视觉表现: 使用 `primary` 色的明度与饱和度变化。
  - 低值: `bg-primary/10` 或 `bg-surface-container-high`。
  - 中值: `bg-primary/40`。
  - 高值: `bg-primary` (实色)。
- 描边: 0.5px `border-white/30` 确保行政边界清晰，不干扰色块识别。

### 发散渐变 (Diverging)
- 适用场景: 展示偏离中性参考点的数据（如增长率、气温正负偏差）。
- 视觉表现: 从中心中性色向两端发散。
  - 正向极值: `text-success` (绿色系) 渐变。
  - 中心点: `bg-surface-container` (灰色系)。
  - 负向极值: `text-error` (红色系) 渐变。

### 分类映射 (Categorical)
- 适用场景: 展示定性数据（如土地利用类型、行政分区）。
- 视觉表现: 使用高辨识度的互补色，不暗示数值量级关系。

## 2. 视觉细节规范 (Visual Definitions)

### 区域样式
- 填充不透明度: 默认 `opacity-80`。当开启 `backdrop-blur-sm` 时，可增强在有底图纹理时的色彩纯度。
- 边界线 (Borders):
  - 默认: 0.5px 细线。
  - 高亮: 2px `border-primary` 或白色。

## 3. 交互行为 (Interaction)

### 悬停 (Hover)
- 视觉反馈:
  - 该区域填充不透明度提升至 100%。
  - 边界线加粗并伴有微弱外发光。
- 浮窗 (Tooltip): 显示区域名称、核心指标值、占比百分比。

### 点击 (Click)
- 行为:
  - 地图自动缩放并定位至该区域中心。
  - 展开该区域的下级细分数据（如下钻至区县级）。

## 4. 标注与可读性 (Labeling & Clarity)

### 文本中心化
- 逻辑: 标注文字默认置于区域地理中心 (Centroid)。
- 样式: 使用 `font-mono-data` 样式。
- 对比增强: 必须带有 2px 的反色光晕 (Halo)，确保在深色填充区依然清晰。

### 过滤策略
- 面积阈值: 屏幕显示面积过小的区域（如极小岛屿或极远缩放级）应隐藏文本标注。

## aimapui 默认实现

`FillLayer` 默认封装中已实现：
- 三种配色模式：`sequential | diverging | categorical`，可通过 `colorMapping` 切换。
- 填充默认透明度 `0.8`，边界默认 `0.5px rgba(255,255,255,0.3)`。
- 默认启用 hover/click 反馈（可通过 `hoverEffect` / `clickEffect` 关闭）。
- 默认启用 hover tooltip（可通过 `tooltipEffect` 关闭），支持 `tooltipFields` 与 `tooltipTemplate`。
- 点击区域自动缩放定位（可通过 `zoomToRegionOnClick` 关闭），并支持 `onDrilldown` 回调。
- 标注基于 GeoJSON 面重心计算，默认启用面积阈值过滤（`labelAreaThreshold`），文本带 2px Halo。
- 支持缩放级过滤：可通过 `minLabelZoom` 在低缩放级自动隐藏标注，减少拥挤。

```tsx
<FillLayer
  source={geojson}
  sourceType="geojson"
  colorField="value"
  colorMapping="sequential"
  showLabel
  labelField="name"
  percentageField="ratio"
  onDrilldown={(feature) => {
    // 加载下级行政区数据
    console.log(feature);
  }}
/>
```

---
Derived from Design System: `{{DATA:DESIGN_SYSTEM:DESIGN_SYSTEM_1}}`

# FillLayer

填充图组件（填充 + 描边 + 文字标签），用于分级统计地图（Choropleth Map）。支持顺序、发散、分类三种颜色映射模式，内置悬停高亮、点击选中、Tooltip 等交互。

> **何时选择：** 在 GeoJSON 面数据上做分级着色、区域对比时用 FillLayer；如果是中国行政区划专题图，建议优先使用封装更完善的 [ChinaDistrict](./china-district)。

## 导入

```tsx
import { FillLayer } from '@antv/aimapui';
```

## Props

FillLayer 继承 [LayerSchema 公共属性](../layers/point-layer#公共属性)。

### 数据源

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `unknown` | **必填** | 数据源，通常为 GeoJSON FeatureCollection |
| `sourceType` | `'geojson' \| 'json'` | `'geojson'` | 数据源类型 |

### 颜色映射

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `colorMapping` | `'sequential' \| 'diverging' \| 'categorical'` | `'sequential'` | 颜色映射模式 |
| `valueField` | `string` | - | 数值映射字段名 |
| `nameField` | `string` | - | 区域名称字段名 |
| `percentageField` | `string` | - | 百分比字段名 |

### 描边

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `showStroke` | `boolean` | `true` | 是否显示描边 |
| `strokeColor` | `string` | - | 描边颜色 |
| `strokeWidth` | `number` | - | 描边宽度（px） |

### 交互效果

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `hoverEffect` | `boolean` | `true` | 是否开启悬停高亮 |
| `clickEffect` | `boolean` | `true` | 是否开启点击选中 |
| `stickySelection` | `boolean` | `false` | 选中后是否保持选中状态（再次点击取消） |
| `highlightStrokeColor` | `string` | - | 高亮描边颜色 |
| `highlightStrokeWidth` | `number` | - | 高亮描边宽度 |
| `zoomToRegionOnClick` | `boolean` | - | 点击区域后是否自动缩放到该区域 |
| `clickZoomPadding` | `number` | - | 缩放到区域时的边距（px） |
| `clickZoomDelta` | `number` | - | 缩放到区域时的缩放增量 |

### Tooltip

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tooltipEffect` | `boolean` | `false` | 是否开启 Tooltip |
| `tooltipFields` | `string[]` | - | Tooltip 显示的字段列表 |
| `tooltipTemplate` | `string` | - | Tooltip 自定义模板 |

### 标签

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `showLabel` | `boolean` | `false` | 是否显示区域文字标签 |
| `labelField` | `string` | - | 标签取值字段 |
| `labelColor` | `string` | - | 标签颜色 |
| `labelSize` | `number` | - | 标签字号 |
| `labelHaloWidth` | `number` | - | 标签光晕宽度 |
| `labelAreaThreshold` | `number` | - | 面积阈值，面积小于该值的区域不显示标签 |
| `minLabelZoom` | `number` | - | 标签最小可见缩放级别 |

### 事件

| 属性 | 类型 | 说明 |
|------|------|------|
| `onRegionClick` | `(payload: LayerEventPayload) => void` | 区域点击回调，`payload.feature` 包含区域属性 |
| `onDrilldown` | `(feature: Record<string, unknown>) => void` | 下钻回调，点击区域触发下级钻取 |
| `onLayerCreated` | `(layer: any) => void` | 图层实例创建后的回调，可用于获取 L7 图层实例 |

## 示例

### 基础分级统计图

```tsx
import { AiMap, FillLayer } from '@antv/aimapui';

<AiMap map={{ basemap: 'gaode', center: [108, 34], zoom: 4 }}>
  <FillLayer
    source={provinceGeoJSON}
    colorMapping="sequential"
    valueField="gdp"
    nameField="name"
    showLabel
    labelField="name"
    hoverEffect
    tooltipEffect
    tooltipFields={['name', 'gdp']}
  />
</AiMap>
```

### 分类着色

```tsx
<FillLayer
  source={geojson}
  colorMapping="categorical"
  valueField="type"
  showStroke
  strokeColor="#fff"
  strokeWidth={1}
  clickEffect
  stickySelection
  onRegionClick={(e) => {
    console.log('点击区域:', e.feature?.name);
  }}
/>
```

## 注意事项

- `colorMapping` 三种模式适用不同场景：`sequential` 用于连续数值（GDP、人口），`diverging` 用于有中心基准的偏差数据（增长率），`categorical` 用于类别数据（区域类型）
- `showLabel` 在区域较小或缩放级别较低时可能导致标签密集重叠，建议配合 `labelAreaThreshold` 和 `minLabelZoom` 使用
- `stickySelection` 适合需要选中后查看详情的场景，配合侧边面板使用

## 相关组件

- [ChinaDistrict](./china-district) — 中国行政区划专题图（基于 FillLayer）
- [PolygonLayer](../layers/polygon-layer) — 基础面图层
- [BubbleLayer](./bubble-layer) — 气泡图层

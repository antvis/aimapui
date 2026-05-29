# IconLayer

图片图标 + 文字标签组合标注图层。基于栅格图片（PNG/SVG/远端 URL）渲染点位标识，常用于 POI 标注、品牌图标、状态徽章等场景。内置图标光晕、文字光晕、碰撞检测、缩放分级降级，开箱即用。

> **何时选择：** 需要矢量字体图标用 [GlyphLayer](./glyph-layer)；只需文字标签用 [PointLayer](../layers/point-layer)；需要海量点聚合用 [MarkerClusterLayer](./marker-cluster-layer)。

## 导入

```tsx
import { IconLayer } from '@antv/aimapui';
```

## 基础用法

```tsx
<IconLayer
  source={[
    { lng: 116.40, lat: 39.91, name: '故宫', category: 'museum' },
    { lng: 121.49, lat: 31.24, name: '东方明珠', category: 'landmark' },
  ]}
  sourceType="json"
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="category"
  iconMap={{
    museum: 'https://cdn.example.com/museum.png',
    landmark: 'https://cdn.example.com/landmark.png',
  }}
  labelField="name"
/>
```

## Props

IconLayer 继承 [LayerSchema 公共属性](../layers/point-layer#公共属性)，此处仅列出专有属性。

### 数据源

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `unknown` | **必填** | 数据源，支持 GeoJSON 或 JSON 数组 |
| `sourceType` | `'json' \| 'geojson' \| 'csv'` | `'json'` | 数据源类型 |
| `sourceConfig` | `SourceConfig` | - | `sourceType='json'` 时的经纬度字段映射 |

### 图标配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `iconField` | `string` | **必填** | 图标映射字段，每行数据用该字段值在 `iconMap` 中查找图片 |
| `iconMap` | `Record<string, string>` | **必填** | 图标资源映射 `{ fieldValue: imageUrl }` |
| `iconSize` | `number` | `24` | 图标尺寸（标准 24，紧凑 16） |
| `iconAnchor` | `'center' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | 图标锚点 |

### 文字标签

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `showLabel` | `boolean` | `true` | 是否显示标签 |
| `labelField` | `string` | 同 `iconField` | 标签文本字段 |
| `labelColor` | `string` | `'#333'` | 标签颜色 |
| `labelSize` | `number` | `12` | 标签字号（12-14px） |
| `labelAnchor` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | 文字相对图标的锚点位置 |
| `labelOffset` | `[number, number]` | `[0, 0]` | 标签像素偏移 |
| `labelHaloColor` | `string` | `'#fff'` | 标签光晕颜色 |
| `labelHaloWidth` | `number` | `2` | 标签光晕宽度 |
| `labelStyle` | `Record<string, unknown>` | - | L7 textStyle 扩展 |

### 碰撞检测

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `iconAllowOverlap` | `boolean` | `true` | 图标是否允许重叠（保持全部可见） |
| `textAllowOverlap` | `boolean` | `false` | 文本是否允许重叠（关闭则隐藏低优先级文本） |

### 缩放适配

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `zoomAdaption` | `boolean` | `true` | 是否开启缩放分级显示 |
| `zoomShowLabel` | `number` | `15` | 高缩放级阈值（图标 + 文字全显） |
| `zoomDegradeToPoint` | `number` | `10` | 低缩放级阈值（降级为圆点） |

### 交互事件

| 属性 | 类型 | 说明 |
|------|------|------|
| `onClick` | `(payload) => void` | 点击图标回调 |
| `onMouseEnter` | `(payload) => void` | 鼠标进入回调 |
| `onMouseLeave` | `(payload) => void` | 鼠标离开回调 |

## 设计要点

- **白色描边**：图标默认带 1px 白色 Halo，提升复杂底图（卫星、暗色）下的辨识度
- **文字光晕**：2px 白色 Halo 确保深色底图可读
- **三级缩放降级**：高 Zoom（≥15）图标+文字 → 中 Zoom（10–14）仅图标 → 低 Zoom（<10）降级为单色圆点，避免远景下密集图标遮挡
- **碰撞策略**：图标始终可见保证完整覆盖，文本碰撞时隐藏低优先级标签

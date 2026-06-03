# IconLayer

图片图标 + 文字标签组合标注图层。基于栅格图片（PNG/SVG/远端 URL）渲染点位标识，常用于 POI 标注、品牌图标、状态徽章等场景。内置图标光晕、文字光晕、碰撞检测、缩放分级降级，开箱即用。

> **何时选择：** 默认优先选 `IconLayer`。它是三者里最均衡的一档，基于 WebGL 渲染，能覆盖大多数点位标注需求；如果是大数据场景，应优先从 `IconLayer` 起步，再按需叠加聚合或缩放降级策略。只有在需要大量自定义 DOM 样式 / React 交互时再考虑 [Marker](../interaction/marker)；只有在设计明确指定字体图标方案时再考虑 [GlyphLayer](./glyph-layer)。虽然它常被拿来做“标注”，但组件形态上仍然属于图层能力，而不是 DOM Marker。

## 选型建议

| 方案 | 推荐程度 | 优先场景 | 不建议场景 |
|------|----------|----------|------------|
| `IconLayer` | **默认首选** | 大多数点位标注、POI、状态图标、中大规模数据渲染 | 需要复杂 DOM 卡片、按钮、富交互时 |
| [Marker](../interaction/marker) | 按需使用 | 自定义样式很多、需要 React 组件、拖拽、复杂 hover / click 结构 | 成百上千点同时常驻展示 |
| [GlyphLayer](./glyph-layer) | 一般不优先 | 设计系统明确要求字体图标、单色可染色符号、已有 iconfont 体系 | 常规业务 POI 标注、需要默认稳定方案时 |

### 默认决策顺序

1. 先问是不是大数据或可能扩到大数据，如果是，先用 `IconLayer`
2. 如果视觉是标准图标点位，不需要复杂 DOM，也优先用 `IconLayer`
3. 如果一个点位本身就是一个小组件，样式和交互非常多，再换成 [Marker](../interaction/marker)
4. 如果设计稿或资产体系明确要求字体图标，再使用 [GlyphLayer](./glyph-layer)

## 💡 优先使用内置图标

**强烈建议优先使用内置 Maki 图标**，而非自行准备图片资源。内置图标具有以下优势：

- ✅ **零配置**：无需上传图片、配置 CDN、管理资源路径
- ✅ **矢量清晰**：SVG 格式，任意缩放不失真
- ✅ **风格统一**：190+ 个标准化地图图标，覆盖常见 POI 类型
- ✅ **轻量高效**：Data URL 内联，无额外网络请求
- ✅ **易于定制**：支持自定义颜色、尺寸、Pin 背景

### 快速使用内置图标

```tsx
import { IconLayer, createMakiIconMap } from '@antv/aimapui';

<IconLayer
  source={data}
  sourceType="json"
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="type"
  // 一行代码生成内置图标映射
  iconMap={createMakiIconMap(['cafe', 'hospital', 'school'], { fill: '#2563eb' })}
  labelField="name"
/>
```

### 带 Pin 背景的内置图标

```tsx
import { IconLayer, createMakiPinMap } from '@antv/aimapui';

<IconLayer
  source={data}
  iconField="type"
  // 水滴型 Pin 背景 + 白色图标
  iconMap={createMakiPinMap(['restaurant', 'hotel', 'park'], { fill: '#ef4444' })}
  iconAnchor="bottom"
  labelField="name"
/>
```

📖 **完整内置图标列表及用法详见：[内置图标指南](./builtin-icons)**

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
- **性能优先**：相比 DOM 方案，`IconLayer` 更适合中大规模点位渲染；需要更大规模时可进一步组合 [MarkerClusterLayer](./marker-cluster-layer)

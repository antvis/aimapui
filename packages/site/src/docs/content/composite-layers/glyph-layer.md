# GlyphLayer

字体图标（Glyph）+ 文字标签组合标注图层。基于 SDF 文本渲染矢量图标，支持 Google Material Symbols 及任意自定义字体，**任意缩放下边缘锐利**、可数据驱动着色。适合天气、状态、品类、专题地图的轻量符号化标注。

> **何时选择：** 需要矢量、可染色、缩放锐利的图标用 GlyphLayer；需要使用栅格图片（PNG / 远端 URL）用 [IconLayer](./icon-layer)；需要纯文字标签用 [PointLayer](../layers/point-layer)。

## 💡 优先使用内置字体图标

**强烈建议优先使用内置字体图标**，无需自行准备图标资源和字体文件：

- ✅ **Material Symbols Outlined**：Google 出品，内置 **140+** 个常用图标，覆盖天气、交通、地点、城市生活、活动、地图功能、通用 7 大类
- ✅ **零配置**：直接使用 `iconFontFamily="material-symbols"`（默认），组件自动注册映射表
- ✅ **矢量染色**：图标颜色可任意定制，支持数据驱动映射

### 快速使用内置字体

```tsx
// Material Symbols（默认）— 推荐
<GlyphLayer
  source={data}
  iconField="icon"           // 使用 Material Symbols 官方图标名
  iconColor="#2563eb"
  labelField="name"
/>
```

📖 **完整内置字体图标列表及预览效果详见上方 Demo**，支持搜索、分类筛选、尺寸/颜色实时预览。

## 导入

```tsx
import { GlyphLayer } from '@antv/aimapui';
```

## 基础用法

### 1. 使用 Material Symbols（默认）

```tsx
<GlyphLayer
  source={[
    { lng: 116.40, lat: 39.91, icon: 'sunny', name: '北京' },
    { lng: 121.49, lat: 31.24, icon: 'water_drop', name: '上海' },
    { lng: 113.27, lat: 23.13, icon: 'thunderstorm', name: '广州' },
  ]}
  sourceType="json"
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="icon"
  iconColor="#f59e0b"
  labelField="name"
/>
```

> 图标名直接使用 [Material Symbols 官方名称](https://fonts.google.com/icons)，组件自动从页面已加载的字体获取符号。

### 2. 自定义 iconfont

```tsx
<GlyphLayer
  source={data}
  sourceType="json"
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="kind"
  iconFontFamily="myfont"
  iconFontPath="https://your-cdn/myfont.woff2"
  iconFontMap={[
    ['restaurant', '&#xe001;'],
    ['hotel', '&#xe002;'],
  ]}
/>
```

> `iconFontMap` 中 Unicode 必须用 HTML 实体格式（`&#xHEX;`），不能用 JS 转义 `\uXXXX`。

## Props

GlyphLayer 继承 [LayerSchema 公共属性](../layers/point-layer#公共属性)，此处仅列出专有属性。

### 数据源

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `unknown` | **必填** | 数据源，支持 GeoJSON 或 JSON 数组 |
| `sourceType` | `'json' \| 'geojson' \| 'csv'` | `'json'` | 数据源类型 |
| `sourceConfig` | `SourceConfig` | - | `sourceType='json'` 时的经纬度字段映射 |

### 字体图标

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `iconField` | `string` | **必填** | 图标内容字段，每行数据用该字段值作为图标文本渲染 |
| `iconFontFamily` | `'material-symbols' \| string` | `'material-symbols'` | 字体族模式 |
| `iconFontPath` | `string` | - | 自定义字体文件 URL（仅 `iconFontFamily` 为自定义时） |
| `iconFontMap` | `Array<[string, string]>` | - | 自定义图标映射表（仅 `iconFontFamily` 为自定义时） |
| `iconColor` | `string \| ColorMapping` | `'#3b82f6'` | 图标颜色，支持单色或数据驱动映射 |
| `iconSize` | `number` | `20` | 图标尺寸（16-24px） |
| `iconHaloColor` | `string` | `'#fff'` | 图标光晕颜色 |
| `iconHaloWidth` | `number` | `1` | 图标光晕宽度（1-2px） |
| `iconStyle` | `Record<string, unknown>` | - | L7 textStyle 扩展 |

### 文字标签

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `showLabel` | `boolean` | `true` | 是否显示标签 |
| `labelField` | `string` | 同 `iconField` | 标签文本字段 |
| `labelColor` | `string` | `'#333'` | 标签颜色 |
| `labelSize` | `number` | `11` | 标签字号（10-14px） |
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
| `zoomShowLabel` | `number` | `14` | 高缩放级阈值（图标 + 文字全显） |
| `zoomDegradeToPoint` | `number` | `10` | 低缩放级阈值（降级为圆点） |

### 交互事件

| 属性 | 类型 | 说明 |
|------|------|------|
| `onClick` | `(payload) => void` | 点击图标回调 |
| `onMouseEnter` | `(payload) => void` | 鼠标进入回调 |
| `onMouseLeave` | `(payload) => void` | 鼠标离开回调 |

## 与 IconLayer 的差异

| 维度 | GlyphLayer | IconLayer |
|------|-----------|-----------|
| 图标素材 | 字体（矢量） | 图片（栅格 PNG/SVG/URL） |
| 缩放清晰度 | SDF 渲染，任意缩放锐利 | 受图片分辨率影响 |
| 染色 | ✅ 支持单色 / 数据驱动 | ❌ 颜色固化在图片中 |
| 资源加载 | 一次加载字体，覆盖所有符号 | 每种图标需独立 URL |
| 适合场景 | 天气、状态、品类符号 | 品牌 Logo、复杂插画 |

## 设计要点

- **SDF 渲染**：基于 Signed Distance Field，矢量缩放下始终保持锐利
- **图标光晕**：1-2px 白色 Halo 提升复杂底图（卫星、暗色）下的辨识度
- **三级缩放降级**：高 Zoom（≥14）图标+文字 → 中 Zoom（10–13）仅图标 → 低 Zoom（<10）降级为单色圆点
- **碰撞策略**：图标始终可见保证完整覆盖，文本碰撞时隐藏低优先级标签
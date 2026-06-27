# GlyphLayer — 图标字体图层

基于 Material Symbols Outlined 的字体图标标注复合图层，支持 SDF 渲染、缩放自适应降级、碰撞检测、图标背景形状和自定义字体。底层由 PointLayer 组合渲染。

## Examples

```tsx
import { GlyphLayer } from '@antv/aimapui';

// 基础用法：Material Symbols 图标 + 文字标签
<GlyphLayer
  source={poiData}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="iconType"
  labelField="name"
  labelAnchor="top"
/>

// 自定义图标颜色和尺寸
<GlyphLayer
  source={poiData}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="category"
  iconColor={{ field: 'severity', values: ['#10b981', '#f59e0b', '#ef4444'] }}
  iconSize={24}
  iconHaloColor="#fff"
  iconHaloWidth={2}
/>

// Pin 背景 + 缩放自适应
<GlyphLayer
  source={poiData}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="type"
  iconBgShape="pin"
  iconBgShapeColor="#2563eb"
  iconBgShapeSize={28}
  labelField="name"
  labelColor="#333"
  labelSize={11}
  zoomAdaption
  zoomShowLabel={14}
  zoomDegradeToPoint={10}
/>

// 自定义 iconfont 字体
<GlyphLayer
  source={data}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="iconType"
  iconFontFamily="my-custom-icons"
  iconFontPath="https://cdn.example.com/my-icons.woff2"
  iconFontMap={[['home', '&#xe001;'], ['star', '&#xe002;']]}
/>
```

## Enums

- **LabelAnchor:** `'right'` | `'bottom'` | `'top'` | `'left'` | `'center'`
- **IconAnchor:** `'center'` | `'top'` | `'bottom'` | `'left'` | `'right'`

## Built-in Icons

内置 Material Symbols Outlined 图标映射表，涵盖 6 大类 100+ 图标：

| 类别 | 图标名 |
|------|--------|
| 天气 | sunny, cloud, rainy, thunderstorm, foggy, snowing, ... |
| 出行/交通 | flight, train, directions_bus, directions_car, subway, taxi, ... |
| 地点/设施 | location_on, restaurant, hotel, local_hospital, school, museum, park, ... |
| 活动 | attractions, celebration, festival, sports_soccer, sports_basketball, ... |
| 地图功能 | layers, terrain, share, favorite, star, home, ... |
| 通用 | search, settings, info, close, check, add, edit, delete, ... |

完整列表见 `MATERIAL_SYMBOLS_ICONS` 导出。

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `object[]` | **必填** | 数据源 |
| `sourceType` | `string` | `'json'` | 数据类型 |
| `sourceConfig` | `{ x?, y? }` | — | 字段映射 |
| `iconField` | `string` | **必填** | 图标内容字段 |
| `iconFontFamily` | `string` | `'material-symbols'` | 字体族（`'material-symbols'` 或自定义字体名） |
| `iconFontPath` | `string` | — | 自定义字体文件 URL（自定义字体时需要） |
| `iconFontMap` | `[string, string][]` | — | 自定义图标映射表（自定义字体时需要） |
| `iconColor` | `string \| ColorConfig` | `'#3b82f6'` | 图标颜色 |
| `iconSize` | `number` | `20` | 图标尺寸（16-24px） |
| `iconHaloColor` | `string` | `'#fff'` | 图标光晕颜色 |
| `iconHaloWidth` | `number` | `1` | 图标光晕宽度（1-2px） |
| `iconStyle` | `Record<string, unknown>` | — | 图标样式扩展 |
| `iconAnchor` | `IconAnchor` | `'center'` | 图标锚点位置 |
| `iconBgShape` | `'circle' \| 'pin'` | `'pin'` | 图标背景形状 |
| `iconBgShapeColor` | `string` | — | 图标背景形状颜色 |
| `iconBgShapeSize` | `number` | `24` | 图标背景形状大小 |
| `iconBgStrokeColor` | `string` | — | 图标背景边框颜色 |
| `iconBgStrokeWidth` | `number` | `0` | 图标背景边框宽度 |
| `iconBgPadding` | `number` | `0` | 图标背景 padding |
| `iconBgCornerRadius` | `number` | `0` | 图标背景圆角半径 |
| `showLabel` | `boolean` | `true` | 是否显示文字标签 |
| `labelField` | `string` | — | 文字标签字段（默认取 `iconField`） |
| `labelColor` | `string` | `'#333'` | 标签颜色 |
| `labelSize` | `number` | `11` | 标签字号（10-14px） |
| `labelAnchor` | `LabelAnchor` | `'top'` | 文字锚点位置 |
| `labelOffset` | `[number, number]` | `[0, 0]` | 标签偏移量 |
| `labelHaloColor` | `string` | `'#fff'` | 标签光晕颜色 |
| `labelHaloWidth` | `number` | `2` | 标签光晕宽度（px） |
| `labelStyle` | `Record<string, unknown>` | — | 标签样式扩展 |
| `textAllowOverlap` | `boolean` | `false` | 文本标签是否允许重叠 |
| `iconAllowOverlap` | `boolean` | `true` | 图标是否允许重叠 |
| `zoomAdaption` | `boolean` | `true` | 是否开启缩放适配 |
| `zoomShowLabel` | `number` | `14` | 显示标签的缩放级阈值 |
| `zoomDegradeToPoint` | `number` | `10` | 降级为圆点的缩放级阈值 |
| `onClick` | `(payload) => void` | — | 点击回调 |
| `onMouseEnter` | `(payload) => void` | — | 鼠标进入回调 |
| `onMouseLeave` | `(payload) => void` | — | 鼠标离开回调 |

## 缩放自适应

- **L1（Zoom ≥ 14）**：图标 + 文字全显示
- **L2（10 ≤ Zoom < 14）**：仅显示图标，隐藏文字
- **L3（Zoom < 10）**：降级为圆点

## 相关文档

- [index.md](index.md) — 复合图层概览
- [icon-layer.md](icon-layer.md) — 图片图标图层
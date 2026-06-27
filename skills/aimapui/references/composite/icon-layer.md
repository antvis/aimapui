# IconLayer — 图标图片图层

自定义图片图标标注复合图层，使用图片 URL 作为图标，支持缩放自适应降级、碰撞检测和文字标签。底层由 PointLayer 组合渲染。

## Examples

```tsx
import { IconLayer } from '@antv/aimapui';

// 基础用法：图片图标 + 文字标签
<IconLayer
  source={poiData}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="iconType"
  iconMap={{
    airport: 'https://example.com/airport.png',
    hotel: 'https://example.com/hotel.png',
    restaurant: 'https://example.com/restaurant.png',
  }}
  iconAnchor="bottom"
  labelField="name"
  labelAnchor="top"
/>

// 自定义尺寸和样式
<IconLayer
  source={poiData}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="category"
  iconMap={{
    hospital: 'https://cdn.example.com/hospital.svg',
    school: 'https://cdn.example.com/school.svg',
  }}
  iconSize={32}
  iconAnchor="center"
  labelColor="#1e293b"
  labelSize={13}
  labelHaloColor="#fff"
  labelHaloWidth={2}
/>

// 缩放自适应 + 碰撞检测
<IconLayer
  source={poiData}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="type"
  iconMap={iconUrls}
  zoomAdaption
  zoomShowLabel={15}
  zoomDegradeToPoint={10}
  textAllowOverlap={false}
  iconAllowOverlap={true}
  onClick={(payload) => console.log('icon clicked:', payload)}
/>
```

## Enums

- **LabelAnchor:** `'right'` | `'bottom'` | `'top'` | `'left'`
- **IconAnchor:** `'center'` | `'top'` | `'bottom'` | `'left'` | `'right'`

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `object[]` | **必填** | 数据源 |
| `sourceType` | `string` | `'json'` | 数据类型 |
| `sourceConfig` | `{ x?, y? }` | — | 字段映射 |
| `iconField` | `string` | **必填** | 图标映射字段 |
| `iconMap` | `Record<string, string>` | **必填** | 图标资源映射 `{ fieldValue: imageUrl }` |
| `iconSize` | `number` | `24` | 图标尺寸（标准 24，紧凑 16） |
| `iconAnchor` | `IconAnchor` | `'bottom'` | 图标锚点位置 |
| `showLabel` | `boolean` | `true` | 是否显示文字标签 |
| `labelField` | `string` | — | 文字标签字段（默认取 `iconField`） |
| `labelColor` | `string` | `'#333'` | 标签颜色 |
| `labelSize` | `number` | `12` | 标签字号（12-14px） |
| `labelAnchor` | `LabelAnchor` | `'top'` | 文字锚点位置 |
| `labelOffset` | `[number, number]` | `[0, 0]` | 标签偏移量 |
| `labelHaloColor` | `string` | `'#fff'` | 标签光晕颜色 |
| `labelHaloWidth` | `number` | `2` | 标签光晕宽度（px） |
| `labelStyle` | `Record<string, unknown>` | — | 标签样式扩展 |
| `textAllowOverlap` | `boolean` | `false` | 文本是否允许重叠 |
| `iconAllowOverlap` | `boolean` | `true` | 图标是否允许重叠 |
| `zoomAdaption` | `boolean` | `true` | 是否开启缩放适配 |
| `zoomShowLabel` | `number` | `15` | 显示标签的缩放级阈值 |
| `zoomDegradeToPoint` | `number` | `10` | 降级为圆点的缩放级阈值 |
| `onClick` | `(payload) => void` | — | 点击回调 |
| `onMouseEnter` | `(payload) => void` | — | 鼠标进入回调 |
| `onMouseLeave` | `(payload) => void` | — | 鼠标离开回调 |

## 缩放自适应

- **L1（Zoom ≥ 15）**：图标 + 文字全显示
- **L2（10 ≤ Zoom < 15）**：仅显示图标，隐藏文字
- **L3（Zoom < 10）**：降级为圆点

## 与 GlyphLayer 的区别

- **IconLayer**：使用图片 URL 作为图标，适合需要品牌 logo、自定义图形等场景
- **GlyphLayer**：使用 Material Symbols 字体图标，无需预加载图片，适合标准化图标标注

## 相关文档

- [index.md](index.md) — 复合图层概览
- [glyph-layer.md](glyph-layer.md) — 图标字体图层
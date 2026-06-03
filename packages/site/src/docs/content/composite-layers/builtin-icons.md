# 内置图标指南

aimapui 内置了一套 Maki 矢量图标，可直接用于 `IconLayer`，无需自行准备图片资源。所有图标均为 SVG 格式，支持自定义颜色、尺寸和 Pin 背景。

## 为什么优先使用内置图标？

| 特性 | 内置图标 | 自定义图片 |
|------|---------|-----------|
| 配置成本 | ✅ 零配置，一行代码 | ❌ 需上传、配 CDN、管理路径 |
| 清晰度 | ✅ SVG 矢量，任意缩放 | ⚠️ 取决于图片分辨率 |
| 风格一致性 | ✅ 统一设计语言 | ❌ 难以保证风格统一 |
| 加载性能 | ✅ Data URL 内联，无请求 | ❌ 额外网络请求 |
| 定制能力 | ✅ 颜色/尺寸/Pin 背景 | ⚠️ 需重新制图 |
| 维护成本 | ✅ 库内置，无需维护 | ❌ 需自行管理资源 |

## 快速开始

### 基础用法：纯色图标

```tsx
import { IconLayer, createMakiIconMap } from '@antv/aimapui';

<IconLayer
  source={pois}
  sourceType="json"
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="type"
  iconMap={createMakiIconMap(['cafe', 'hospital', 'school'], { fill: '#2563eb' })}
  labelField="name"
/>
```

### 带 Pin 背景的图标

适合需要突出标记点的场景，水滴型 Pin 背景 + 白色图标：

```tsx
import { IconLayer, createMakiPinMap } from '@antv/aimapui';

<IconLayer
  source={pois}
  iconField="type"
  iconMap={createMakiPinMap(['restaurant', 'hotel', 'park'], { fill: '#ef4444' })}
  iconAnchor="bottom"
  labelField="name"
/>
```

### 单个图标 URL

如果只需要某个图标的 URL（如用于 Marker 或其他组件）：

```tsx
import { makiIconUrl, makiPinUrl } from '@antv/aimapui';

// 纯色图标
const cafeIcon = makiIconUrl('cafe', { size: 32, fill: '#2563eb' });

// Pin 背景图标
const hospitalPin = makiPinUrl('hospital', { size: 40, fill: '#ef4444' });
```

## API 参考

### `createMakiIconMap(names, opts?)`

批量生成纯色 Maki 图标的 `iconMap`，直接传给 `IconLayer.iconMap`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `names` | `string[]` | Maki 图标名列表 |
| `opts.size` | `number` | 图标尺寸，默认 `32` |
| `opts.fill` | `string` | 图标填充色，默认 `'#333'` |

**返回：** `Record<string, string>` — `{ iconName: dataURL }` 映射

### `createMakiPinMap(names, opts?)`

批量生成带 Pin 背景的 Maki 图标 `iconMap`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `names` | `string[]` | Maki 图标名列表 |
| `opts.size` | `number` | Pin 宽度，默认 `40`（高度自动按 1.25 倍计算） |
| `opts.fill` | `string` | Pin 背景填充色，默认 `'#2563eb'` |

**返回：** `Record<string, string>` — `{ iconName: dataURL }` 映射

### `makiIconUrl(icon, opts?)`

生成单个纯色 Maki 图标的 Data URL。

| 参数 | 类型 | 说明 |
|------|------|------|
| `icon` | `string` | Maki 图标名 |
| `opts.size` | `number` | 图标尺寸，默认 `32` |
| `opts.fill` | `string` | 图标填充色，默认 `'#333'` |

### `makiPinUrl(icon, opts?)`

生成单个带 Pin 背景的 Maki 图标 Data URL。

| 参数 | 类型 | 说明 |
|------|------|------|
| `icon` | `string` | Maki 图标名 |
| `opts.size` | `number` | Pin 宽度，默认 `40` |
| `opts.fill` | `string` | Pin 背景填充色，默认 `'#2563eb'` |

### `MAKI_ICON_NAMES`

所有可用图标名的字符串数组，可用于 IDE 提示或动态遍历：

```tsx
import { MAKI_ICON_NAMES } from '@antv/aimapui';

console.log(MAKI_ICON_NAMES); // ['aerialway', 'airfield', 'airport', ...]
```

## 完整图标列表

覆盖地图标注常见场景的内置 Maki 矢量图标。

> 👆 **上方 Demo 提供完整的交互式图标浏览**：支持分类 Tab 切换、搜索过滤、尺寸/颜色/Pin 模式实时预览。

### 分类概览

| 类别 | 图标数 | 典型图标 |
|------|--------|---------|
| 🚗 交通出行 | 27 | `airport` `bus` `rail-metro` `car` `parking` `fuel` |
| 🍽️ 餐饮服务 | 17 | `cafe` `restaurant` `bar` `bakery` `fast-food` `ice-cream` |
| 🛍️ 住宿购物 | 13 | `lodging` `shop` `clothing-store` `jewelry-store` `convenience` |
| 🏥 医疗健康 | 12 | `hospital` `pharmacy` `doctor` `dentist` `fire-station` `police` |
| 🎯 景点休闲 | 48 | `museum` `park` `beach` `stadium` `cinema` `zoo` `mountain` |
| 🎓 教育文化 | 9 | `school` `college` `library` `place-of-worship` |
| 🏘️ 城镇设施 | 27 | `city` `building` `bank` `post` `toilet` `recycling` `harbor` |
| ⚠️ 标记符号 | 15 | `marker` `star` `heart` `circle` `arrow` `danger` `globe` |
| 🌿 自然户外 | 18 | `waterfall` `volcano` `wetland` `windmill` `campsite` `viewpoint` |
| ⚽ 运动娱乐 | 31 | `soccer` `basketball` `swimming` `skiing` `golf` `playground` |

### 快速查找

在上方 Demo 中：
1. **按类别浏览**：点击顶部分类 Tab 筛选
2. **按名称搜索**：输入图标名关键词（如 `hospital`、`cafe`）
3. **预览效果**：切换 Pin 背景、调整尺寸和颜色，实时查看渲染效果
4. **复制名称**：悬停卡片可查看完整图标名，直接用于 `createMakiIconMap()`

## 最佳实践

### 1. 按语义选择图标

```tsx
// ✅ 好：语义清晰
iconMap={createMakiIconMap(['hospital', 'school', 'park'])}

// ❌ 避免：用不相关的图标代替
iconMap={createMakiIconMap(['star', 'circle', 'square'])}
```

### 2. 统一配色方案

```tsx
// ✅ 同一图层使用统一颜色
const iconMap = createMakiIconMap(['cafe', 'restaurant', 'bar'], { fill: '#f59e0b' });

// ✅ 不同类别用不同颜色区分
const foodIcons = createMakiIconMap(['cafe', 'restaurant'], { fill: '#f59e0b' });
const medicalIcons = createMakiIconMap(['hospital', 'pharmacy'], { fill: '#ef4444' });
```

### 3. 配合缩放适配

内置图标完美支持 `IconLayer` 的三级缩放降级策略：

```tsx
<IconLayer
  iconMap={createMakiIconMap(['cafe', 'hospital'])}
  zoomAdaption={true}       // 开启缩放适配
  zoomShowLabel={15}        // Zoom ≥ 15 显示图标+文字
  zoomDegradeToPoint={10}   // Zoom < 10 降级为圆点
/>
```

### 4. 找不到合适的图标？

如果 190 个内置图标无法满足需求，可以考虑：

- **[GlyphLayer](./glyph-layer)**：使用 Material Symbols Outlined 字体图标（158+ 个），支持更多抽象概念图标
- **自定义图片**：通过 `iconMap` 传入自定义 PNG/SVG URL

## 相关文档

- [IconLayer](./icon-layer) — 图片图标图层完整 API
- [GlyphLayer](./glyph-layer) — 字体图标图层
- [Marker](../interaction/marker) — 标记点组件（也支持 Maki 图标）

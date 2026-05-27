# LegendIcon

用自定义图标 + 文字列表展示 POI 兴趣点、设施类型等图例项。每个图例项由一个图标和标签组成，适合无法用纯色块表达的标识场景。

> **何时选择：** POI 兴趣点用图标标识用 LegendIcon；纯色块分类用 [LegendCategories](./legend-categories)；圆大小映射用 [LegendSize](./legend-size)。

## 导入

```tsx
import { LegendIcon } from '@antv/aimapui'
```

## Props

LegendIcon 继承公共交互属性，此处仅列出专有属性。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'icon'` | **必填** | 图例类型标识 |
| `title` | `string` | - | 图例标题，显示在图标列表上方；不传则不显示标题行 |
| `items` | [LegendIconItem[]](#legendiconitem) | **必填** | 图标列表，每项包含 `icon`（图标 URL 或 Material Symbols 名称）和 `label`（文字标签） |
| `className` | `string` | - | 自定义 CSS 类名 |
| `interaction` | [LegendInteractionCallbacks](#legendinteractioncallbacks) | - | 交互回调，不传则图例仅做展示 |

### LegendIconItem

| 字段 | 类型 | 说明 |
|------|------|------|
| `icon` | `string` | 图标来源：支持图片 URL（`'https://...'`）或 Material Symbols 图标名称（如 `'local_hospital'`）；图片加载失败时显示 `'□'` 作为兜底 |
| `label` | `string` | 图标右侧的文字标签 |

### LegendInteractionCallbacks

| 回调 | 类型 | 说明 |
|------|------|------|
| `onHover` | `(index: number) => void` | 悬停到第 `index` 个图例项时触发，移出时回调 `-1` |
| `onToggle` | `(index: number) => void` | 点击第 `index` 个图例项时触发，常用于切换地图上对应 POI 图层的显隐 |
| `onBrush` | `(range: [number, number]) => void` | 范围刷选回调（LegendIcon 不支持刷选，传入无效果） |

## 示例

### 基础用法 — 公共设施 POI 图例

使用 Material Symbols 图标名称，无需额外图片资源：

```tsx
import { AiMap, LegendIcon } from '@antv/aimapui'

<LegendIcon
  type="icon"
  title="公共设施"
  items={[
    { icon: 'local_hospital', label: '医院' },
    { icon: 'school', label: '学校' },
    { icon: 'park', label: '公园' },
    { icon: 'local_fire_department', label: '消防站' },
  ]}
/>
```

### 进阶用法 — 自定义图标 URL + 交互

使用图片 URL 作为图标，适用于品牌标识或特殊符号；配合 `onToggle` 实现点击图例控制 POI 图层显隐：

```tsx
<LegendIcon
  type="icon"
  title="商业品牌"
  items={[
    { icon: 'https://cdn.example.com/icons/cafe.svg', label: '咖啡馆' },
    { icon: 'https://cdn.example.com/icons/restaurant.svg', label: '餐厅' },
    { icon: 'https://cdn.example.com/icons/hotel.svg', label: '酒店' },
  ]}
  interaction={{
    onToggle: (i) => togglePoiLayer(i),
    onHover: (i) => highlightPoi(i === -1 ? null : i),
  }}
/>
```

## 注意事项

- `icon` 加载失败时（如 URL 无效或网络异常），图例会显示 `'□'`（方框）作为兜底符号，不会导致整个图例崩溃
- 使用 Material Symbols 图标名称时，需确保项目已引入 Material Symbols Outlined 字体资源，否则图标无法渲染
- `items` 数组长度建议不超过 8 个，过多会导致图例过长；如类别很多，考虑用 [LegendCategories](./legend-categories) 的 `grid` 模式替代
- 图片 URL 图标首次加载有网络延迟，建议使用预缓存或内联 SVG 避免闪烁

## 相关组件

- [LegendCategories](./legend-categories) — 分类色块图例，纯色块分类场景更简洁
- [LegendSize](./legend-size) — 圆大小图例，数值大小映射场景
- [LegendLineWidth](./legend-line-width) — 线宽图例，线条粗细映射场景
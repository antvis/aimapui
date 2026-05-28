# MobileSheetLegend

移动端底部弹出式图例面板，点击标题栏展开/收起。支持全部 8 种图例类型（分类、渐变、发散、阈值、大小、线宽、比例、图标），展开时最高 65vh，收起时仅占标题栏高度（56px），不遮挡地图操作区域。

> **何时选择：** 只需要在地图底部展示图例信息时用 MobileSheetLegend（开箱即用，自带图例渲染）；需要自定义内容面板（列表、详情等）时用 [BottomSheet](./bottom-sheet)；需要顶部搜索输入时用 [SearchBar](./search-bar)。

## 导入

```tsx
import { MobileSheetLegend } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `legends` | [LegendSchema[]](#legendschema) | **必填** | 图例配置数组，每项对应一个图例区块。传入空数组 `[]` 时组件不渲染（返回 `null`） |
| `className` | `string` | - | 自定义 CSS 类名，添加到最外层容器上。可覆盖定位或玻璃拟态样式 |
| `interaction` | [LegendInteractionCallbacks](#legendinteractioncallbacks) | - | 图例交互回调，启用后用户可悬停高亮图例项、点击切换显隐、范围刷选，实现图例与图层的联动过滤 |

### LegendSchema

`legends` 数组中每项的类型，支持 8 种图例类型，通过 `type` 字段区分：

```typescript
type LegendSchema =
  | LegendCategoriesSchema   // type: 'categories'  分类色块
  | LegendRampSchema         // type: 'ramp'         渐变色带
  | LegendDivergingSchema    // type: 'diverging'    双极发散
  | LegendThresholdSchema    // type: 'threshold'    自定义分段
  | LegendSizeSchema         // type: 'size'         圆形大小
  | LegendLineWidthSchema    // type: 'lineWidth'    线宽
  | LegendProportionSchema   // type: 'proportion'   比例圆
  | LegendIconSchema         // type: 'icon'         图标图例
```

常用类型的核心字段：

| 类型 | 必填字段 | 说明 |
|------|----------|------|
| `categories` | `labels: string[]`, `colors: string[]` | 分类色块图例，`labels` 和 `colors` 等长一一对应 |
| `ramp` | `labels: string[]`, `colors: string[]` | 渐变色带，`isContinuous: true` 启用连续渐变 |
| `diverging` | `colors: string[]`, `labels: [string, string]` | 双极渐变（如 红→灰→绿），`labels` 为左右端标签 |
| `threshold` | `ranges: [min, max][]`, `colors: string[]` | 自定义分段区间列表，每项颜色对应一个区间 |
| `size` | `items: Array<{ size: number; label: string }>` | 圆形大小映射图例 |
| `icon` | `items: Array<{ icon: string; label: string }>` | 自定义图标图例，`icon` 为图标标识 |

### LegendInteractionCallbacks

图例交互回调，传入后图例项可响应悬停和点击：

```typescript
interface LegendInteractionCallbacks {
  /** 悬停高亮：传入图例项索引，-1 表示取消高亮 */
  onHover?: (index: number) => void;
  /** 点击切换显隐：传入图例项索引 */
  onToggle?: (index: number) => void;
  /** 范围刷选：连续型图例（ramp）的数据范围 [min, max] */
  onBrush?: (range: [number, number]) => void;
}
```

## 示例

### 基础用法 — 分类 + 渐变图例

在地图左下角展示两类图例：区域分类色块和温度渐变色带。点击标题栏"图例"可展开/收起：

```tsx
import { AiMap, MobileSheetLegend } from '@antv/aimapui'

const legends = [
  {
    type: 'categories' as const,
    title: '用地类型',
    labels: ['居住用地', '商业用地', '工业用地', '绿地'],
    colors: ['#3B82F6', '#F59E0B', '#6B7280', '#10B981'],
  },
  {
    type: 'ramp' as const,
    title: '人口密度',
    labels: ['低', '中', '高'],
    colors: ['#DBEAFE', '#60A5FA', '#1D4ED8'],
    isContinuous: true,
  },
]

<AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 10 }}>
  <MobileSheetLegend legends={legends} />
</AiMap>
```

### 带交互回调 — 图例联动图层过滤

通过 `interaction` 实现点击图例项时过滤图层显隐，悬停时高亮对应数据：

```tsx
import { useState } from 'react'
import { AiMap, PointLayer, MobileSheetLegend } from '@antv/aimapui'

function MapWithLegend() {
  const [hoverIndex, setHoverIndex] = useState(-1)
  const [hiddenIndices, setHiddenIndices] = useState<Set<number>>(new Set())

  const legends = [
    {
      type: 'categories' as const,
      title: '门店类型',
      labels: ['便利店', '超市', '餐饮'],
      colors: ['#3B82F6', '#10B981', '#F59E0B'],
    },
  ]

  return (
    <AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 12 }}>
      {/* 图层渲染... */}
      <MobileSheetLegend
        legends={legends}
        interaction={{
          onHover: (index) => setHoverIndex(index),
          onToggle: (index) => {
            setHiddenIndices((prev) => {
              const next = new Set(prev)
              next.has(index) ? next.delete(index) : next.add(index)
              return next
            })
          },
        }}
      />
    </AiMap>
  )
}
```

## 注意事项

- **展开/收起动画：** 面板高度变化使用 `transition-all duration-300`（300ms），收起时 `max-h-14`（56px），展开时 `max-h-[65vh]`。内容区独立设置 `max-height: 55vh` 并可滚动，超出部分有自定义滚动条
- **空数组不渲染：** `legends` 为空数组时组件返回 `null`，不需要手动判断。适合数据驱动的场景——图例数据未加载时自动隐藏
- **定位方式：** 组件使用 `absolute` 定位（`bottom-3 left-3 right-3`），相对于最近 `position: relative` 的父容器。在地图组件内使用时，地图容器已有相对定位，无需额外设置
- **z-index 层级：** 面板 `z-index: 30`，低于 [BottomSheet](./bottom-sheet)（z-50）和 [MobileToolbar](./mobile-toolbar)（z-40）。如果同时使用这些组件，图例面板不会遮挡工具栏
- **iOS 安全区域：** 面板距底部 `bottom: 12px`（`bottom-3`），在有 Home Indicator 的设备上仍有被遮挡的风险。如需适配，可在 `className` 中追加 `pb-safe` 或手动计算
- **标题固定"图例"：** 当前收起态标题文案硬编码为"图例"，暂不支持自定义。如需自定义标题，使用 [BottomSheet](./bottom-sheet) 自行渲染图例内容

## 相关组件

- [BottomSheet](./bottom-sheet) — 通用底部抽屉，可承载任意内容，包括自定义图例
- [SearchBar](./search-bar) — 顶部搜索栏，常与图例面板配合使用
- [MobileToolbar](./mobile-toolbar) — 底部工具栏，注意同时使用时可能遮挡图例面板底部
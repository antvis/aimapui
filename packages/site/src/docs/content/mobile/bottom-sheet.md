# BottomSheet

移动端底部抽屉组件，支持三档手势吸附（收起、半屏、全屏），用于承载地图下方的内容面板（如列表、详情、筛选等）。拖拽手柄和弹性吸附提供接近原生的交互体验。

> **何时选择：** 需要地图下方浮现内容面板时用 BottomSheet；仅需要展示图例信息时用 [MobileSheetLegend](./mobile-sheet-legend)（更轻量，自带图例渲染）；需要顶部搜索输入时用 [SearchBar](./search-bar)。

## 导入

```tsx
import { BottomSheet } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | - | 抽屉内容，支持任意 React 子元素。收起状态下内容区 `overflow: hidden`，半屏/全屏时自动变为可滚动 |
| `defaultSnap` | [BottomSheetSnap](#bottomsheetsnap) | `'collapsed'` | 初始吸附档位，决定组件首次渲染时的高度。`'half'` 适合默认露出部分内容，`'collapsed'` 适合默认隐藏只露出手柄 |
| `collapsedHeight` | `number` | `80` | 收起档的高度（px），即 `'collapsed'` 状态下抽屉的总高度，包含手柄区域。设为 0 可完全隐藏但仍占位 |
| `halfRatio` | `number` | `0.45` | 半屏档的高度占容器（父元素或视口）高度的比例，取值 0~1。若容器高 800px，默认半屏高度约 360px |
| `expandedRatio` | `number` | `0.85` | 全屏档的高度占容器高度的比例。0.85 意味着顶部留 15% 空间，用户仍可见地图部分区域，避免"找不到回去路" |
| `onSnapChange` | `(snap: BottomSheetSnap) => void` | - | 吸附档位变化回调。可用于联动地图控件显隐——如全屏时隐藏 [MobileToolbar](./mobile-toolbar)，收起时恢复 |
| `className` | `string` | - | 自定义 CSS 类名，添加到抽屉最外层容器上 |
| `showHandle` | `boolean` | `true` | 是否显示拖拽手柄。设为 `false` 时手柄区域仍可拖拽，只是视觉指示条隐藏，适合需要更大内容区但保留拖拽的场景 |
| `borderRadius` | `number` | `32` | 抽屉顶部圆角（px），Material Design 3 风格默认 32。设为 0 则无圆角 |

### BottomSheetSnap

```typescript
type BottomSheetSnap = 'collapsed' | 'half' | 'expanded'
```

- **`collapsed`** — 收起档，高度等于 `collapsedHeight`
- **`half`** — 半屏档，高度等于容器高度 x `halfRatio`
- **`expanded`** — 全屏档，高度等于容器高度 x `expandedRatio`

## 示例

### 基础用法 — 默认半屏显示周边兴趣点列表

```tsx
import { AiMap, BottomSheet } from '@antv/aimapui'

const pois = [
  { name: '星巴克（国贸店）', distance: '120m', rating: 4.5 },
  { name: '肯德基（建外大街）', distance: '230m', rating: 4.2 },
  { name: '全季酒店', distance: '450m', rating: 4.7 },
]

<AiMap autoFit map={{ basemap: 'gaode', center: [116.461, 39.908], zoom: 15 }}>
  <BottomSheet defaultSnap="half">
    <div style={{ padding: '0 16px' }}>
      <h3 style={{ margin: '0 0 12px' }}>附近推荐</h3>
      {pois.map((poi) => (
        <div key={poi.name} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
          <div style={{ fontWeight: 600 }}>{poi.name}</div>
          <div style={{ color: '#666', fontSize: 12 }}>{poi.distance} · ★{poi.rating}</div>
        </div>
      ))}
    </div>
  </BottomSheet>
</AiMap>
```

### 联动档位变化 — 全屏时隐藏工具栏

通过 `onSnapChange` 在抽屉全屏时隐藏底部工具栏，避免控件层级冲突：

```tsx
import { useState } from 'react'
import { AiMap, BottomSheet, MobileToolbar } from '@antv/aimapui'

function MapWithSheet() {
  const [snap, setSnap] = useState<'collapsed' | 'half' | 'expanded'>('half')

  return (
    <AiMap autoFit map={{ basemap: 'gaode', center: [116.461, 39.908], zoom: 15 }}>
      {snap !== 'expanded' && (
        <MobileToolbar config={{ items: ['zoomIn', 'zoomOut', 'locate'], position: 'bottom' }} />
      )}
      <BottomSheet
        defaultSnap="half"
        halfRatio={0.4}
        expandedRatio={0.9}
        onSnapChange={setSnap}
      >
        <div style={{ padding: 16 }}>
          <h3>详情面板</h3>
          <p>全屏时工具栏已自动隐藏，收起后恢复。</p>
        </div>
      </BottomSheet>
    </AiMap>
  )
}
```

## 注意事项

- **手势冲突：** BottomSheet 拖拽使用 `touch-action: none` 阻止浏览器默认滚动。若内容区需要滚动，组件在 `half` 和 `expanded` 档已启用 `-webkit-overflow-scrolling: touch`，确保内部列表可正常滚动。但若手势在拖拽手柄区域起始，则会被拦截为抽屉拖拽而非内容滚动
- **容器高度计算：** 抽屉高度基于 `offsetParent` 的高度计算。如果 `offsetParent` 为 `null`，则回退到 `window.innerHeight`。确保地图容器有明确的 `position: relative` 且高度已设定，否则半屏/全屏比例会不准确
- **iOS 安全区域：** 抽屉底部紧贴容器底边（`bottom: 0`），在有安全区域的设备上内容可能被 Home Indicator 遮挡。建议在 `children` 最底部加 `padding-bottom: env(safe-area-inset-bottom)` 或在容器上预留安全区域
- **桌面端调试：** 组件同时监听了 `mouse` 事件，可在浏览器桌面端拖拽调试吸附行为，但最终体验以真机触摸为准
- **快速滑动判定：** 拖拽释放时速度超过 0.5（约每 100ms 移动 50px）判定为快速滑动，直接跳到下一档；慢速拖拽则吸附到最近的档位

## 相关组件

- [SearchBar](./search-bar) — 顶部浮动搜索栏，常与 BottomSheet 搭配组成"搜索 + 结果列表"布局
- [MobileSheetLegend](./mobile-sheet-legend) — 轻量图例面板，如果只需展示图例不需要自定义内容，优先用这个
- [MobileToolbar](./mobile-toolbar) — 底部/顶部工具栏，注意全屏时可能与 BottomSheet 层级重叠
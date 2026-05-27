# SearchBar

移动端浮动搜索栏，Material Design 3 毛玻璃风格，固定在地图顶部用于地点搜索和筛选触发。输入时实时回调、一键清除、可选筛选按钮和自定义尾部区域。

> **何时选择：** 需要顶部关键词搜索输入时用 SearchBar；需要在地图下方弹出内容面板时用 [BottomSheet](./bottom-sheet)；只展示图例信息不需要输入时用 [MobileSheetLegend](./mobile-sheet-legend)。

## 导入

```tsx
import { SearchBar } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `placeholder` | `string` | `'搜索地点...'` | 输入框占位提示文字，建议用具体业务场景引导，如 `'搜索门店、地址...'` 比 `'请输入'` 更友好 |
| `onSearch` | `(value: string) => void` | - | 输入内容变化时的实时回调，每次 keystroke 都会触发。适合做实时联想搜索；如需"回车搜索"行为可在回调中加防抖 |
| `onFilter` | `() => void` | - | 筛选按钮（tune 图标）点击回调。不传此 prop 时筛选按钮不渲染，节省空间 |
| `className` | `string` | - | 自定义 CSS 类名，添加到最外层容器上。可覆盖毛玻璃样式或调整定位 |
| `trailing` | `ReactNode` | - | 右侧自定义操作区域，渲染在筛选按钮之后。可用于放置定位按钮、语音输入按钮等 |

## 示例

### 基础用法 — 地点关键词搜索

```tsx
import { useState } from 'react'
import { AiMap, SearchBar } from '@antv/aimapui'

function MapSearch() {
  const [keyword, setKeyword] = useState('')

  return (
    <AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 12 }}>
      <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 40 }}>
        <SearchBar
          placeholder="搜索门店、地址..."
          onSearch={(value) => {
            setKeyword(value)
            console.log('搜索关键词:', value)
          }}
        />
      </div>
    </AiMap>
  )
}
```

### 带筛选按钮 + 自定义定位入口

`onFilter` 存在时右侧出现筛选图标；`trailing` 可追加额外按钮：

```tsx
import { AiMap, SearchBar } from '@antv/aimapui'

<AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 12 }}>
  <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 40 }}>
    <SearchBar
      placeholder="搜索附近美食..."
      onSearch={(value) => console.log('搜索:', value)}
      onFilter={() => console.log('打开筛选面板')}
      trailing={
        <button
          onClick={() => console.log('定位到当前位置')}
          style={{
            marginLeft: 8,
            background: 'var(--color-primary, #004ac6)',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '6px 12px',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          定位
        </button>
      }
    />
  </div>
</AiMap>
```

## 注意事项

- **实时触发 vs 防抖：** `onSearch` 在每次输入变化时触发（即 `onChange`），不会等回车。如需避免频繁请求，应在回调外加 `debounce`（建议 300ms）
- **iOS 输入框缩放：** iOS Safari 在 `font-size < 16px` 时会自动缩放页面。SearchBar 输入框 `font-size: 14px`，如果你的页面 viewport 没有设置 `maximum-scale=1`，用户聚焦搜索框时整个页面会放大。两种解法：设 `font-size: 16px` 或 viewport 加 `maximum-scale=1`
- **安全区域适配：** SearchBar 是浮动定位组件，自身不处理 `safe-area-inset-top`。在 iPhone 刘海屏上需在外层容器加 `padding-top: env(safe-area-inset-top)` 避免被状态栏遮挡
- **清除按钮：** 输入框有内容时自动显示清除按钮（close 图标），点击后清空输入并触发 `onSearch('')`，方便联动重置搜索结果
- **z-index 层级：** SearchBar 默认 `z-index` 由外层容器控制，建议设为 `z-40` 或更高，确保在地图图层和 [BottomSheet](./bottom-sheet)（`z-50`）之下但在地图之上

## 相关组件

- [BottomSheet](./bottom-sheet) — 底部抽屉，常与 SearchBar 组合实现"搜索 + 结果列表"交互
- [MobileToolbar](./mobile-toolbar) — 地图操作工具栏，一般放在页面底部与顶部 SearchBar 上下呼应
- [MobileSheetLegend](./mobile-sheet-legend) — 底部图例面板，不需要输入交互只展示图例时使用
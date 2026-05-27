# MobileToolbar

移动端底部或顶部工具栏，内置常用地图操作按钮（缩放、定位、复位、图层控制）。通过 `config.items` 声明式配置需要的功能项，无需手动拼装按钮图标和事件处理。

> **何时选择：** 需要地图快捷操作按钮栏时用 MobileToolbar；需要底部弹出内容面板时用 [BottomSheet](./bottom-sheet)；需要顶部搜索输入时用 [SearchBar](./search-bar)；仅需图例展示时用 [MobileSheetLegend](./mobile-sheet-legend)。

## 导入

```tsx
import { MobileToolbar } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `config` | [MobileToolbarConfig](#mobiletoolbarconfig) | **必填** | 工具栏配置，包含按钮项列表和位置。通过 `items` 数组控制显示哪些按钮及排列顺序 |
| `className` | `string` | - | 自定义 CSS 类名，添加到工具栏最外层容器上可覆盖定位、背景等样式 |

### MobileToolbarConfig

```typescript
interface MobileToolbarConfig {
  items: string[];           // 按钮标识数组，决定显示哪些按钮及顺序
  position: 'bottom' | 'top'; // 工具栏位置，默认 'bottom'
}
```

**`items` 支持的内置按钮标识：**

| 标识 | 图标 | 行为 |
|------|------|------|
| `'zoomIn'` | + | 调用 `scene.zoomIn()` 地图放大一级 |
| `'zoomOut'` | − | 调用 `scene.zoomOut()` 地图缩小一级 |
| `'locate'` | 十字准星 | 调用浏览器 `navigator.geolocation` 获取当前位置，飞到该点并设 zoom=14 |
| `'reset'` | 旋转箭头 | 复位地图到中心 `[105, 35]`、zoom=4（中国全图视角） |
| `'layers'` | 图层堆叠 | 占位项，具体图层控制逻辑需上层自行处理 |

> **注意：** `items` 中传入了不识别的标识时，按钮会降级为纯文字显示标识名本身。

## 示例

### 基础用法 — 底部缩放 + 定位工具栏

最常见的移动端地图工具栏：放大、缩小、定位三个按钮横排在底部：

```tsx
import { AiMap, MobileToolbar } from '@antv/aimapui'

<AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 10 }}>
  <MobileToolbar
    config={{
      items: ['zoomIn', 'zoomOut', 'locate'],
      position: 'bottom',
    }}
  />
</AiMap>
```

### 顶部工具栏 + 复位按钮

将工具栏放在顶部，增加复位按钮让用户快速回到全国视角：

```tsx
import { AiMap, MobileToolbar } from '@antv/aimapui'

<AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 12 }}>
  <MobileToolbar
    config={{
      items: ['zoomIn', 'zoomOut', 'reset', 'locate'],
      position: 'top',
    }}
  />
</AiMap>
```

### 搭配 SearchBar — 顶部搜索 + 底部工具栏

最经典的移动端地图布局：顶部搜索、底部操作按钮：

```tsx
import { AiMap, SearchBar, MobileToolbar } from '@antv/aimapui'

<AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 12 }}>
  {/* 顶部搜索栏 */}
  <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 40 }}>
    <SearchBar
      placeholder="搜索地点..."
      onSearch={(value) => console.log('搜索:', value)}
    />
  </div>

  {/* 底部工具栏 */}
  <MobileToolbar
    config={{
      items: ['zoomIn', 'zoomOut', 'locate'],
      position: 'bottom',
    }}
  />
</AiMap>
```

## 注意事项

- **定位按钮依赖浏览器 API：** `locate` 按钮使用 `navigator.geolocation.getCurrentPosition`，需要在 HTTPS 环境下才能正常工作。HTTP 环境或用户拒绝授权时，调用会静默失败（无 toast 提示）。如需友好的错误提示，建议自行封装定位逻辑替代内置行为
- **复位按钮的中心点硬编码：** `reset` 按钮将地图复位到 `[105, 35]`（中国中心）、`zoom=4`。如果你的地图默认视角不是中国（如城市级应用），需要自行实现复位逻辑
- **安全区域适配：** 工具栏使用 `safe-area-inset` 类名处理 iPhone 安全区域。底部工具栏在带 Home Indicator 的设备上会自动增加底部内边距，避免按钮被遮挡
- **毛玻璃效果：** 工具栏背景使用 `bg-surface/80 backdrop-blur-md`，透过工具栏可隐约看到地图内容，保持视觉一致性
- **与 BottomSheet 层级冲突：** 工具栏 `z-index: 40`，[BottomSheet](./bottom-sheet) `z-index: 50`。当底部抽屉展开时会覆盖工具栏。建议通过 `onSnapChange` 回调在抽屉展开时隐藏工具栏，或调整 `items` 只保留必要按钮
- **按钮图标为内联 SVG：** 所有内置图标使用内联 SVG 渲染，不依赖外部字体图标库。如果需要自定义图标样式（颜色、大小），通过 `className` 覆盖按钮的 `hover:bg-surface-variant` 等类名

## 相关组件

- [SearchBar](./search-bar) — 顶部浮动搜索栏，常见的 SearchBar + MobileToolbar 上下布局
- [BottomSheet](./bottom-sheet) — 底部抽屉面板，展开时可能遮挡底部工具栏，注意层级协调
- [MobileSheetLegend](./mobile-sheet-legend) — 底部图例面板，z-index 低于工具栏不会互相遮挡
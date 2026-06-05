# LayerSwitchControl

图层开关控件，逐图层切换可见性和透明度，适合叠加多个业务图层时让用户按需显示/隐藏。

> **何时选择：** 需要控制业务图层的显隐和透明度时用 LayerSwitchControl；只需切换底图样式（标准/暗色/卫星）时用 [MapThemeControl](./map-theme-control)；只需要截图当前视图时用 [ExportImageControl](./export-image-control)。

## 导入

```tsx
import { LayerSwitchControl } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | [ControlPosition](#controlposition) | `'topright'` | 控件在地图上的位置 |
| `layers` | [LayerItem[]](#layeritem) | **必填** | 图层列表，定义弹窗中展示哪些图层、初始可见性和透明度。数组顺序即面板中的展示顺序 |
| `onToggle` | `(layerId: string, visible: boolean) => void` | **必填** | 图层可见性切换回调，你需要在回调中实际执行图层的 show/hide 操作，控件本身不会自动控制图层 |
| `onOpacityChange` | `(layerId: string, opacity: number) => void` | - | 图层透明度变化回调，`opacity` 范围 0~1。不传时面板中不显示透明度滑块。你需要在回调中实际设置图层透明度 |
| `className` | `string` | - | 自定义 CSS 类名，用于覆盖控件样式 |
| `style` | `React.CSSProperties` | - | 自定义行内样式 |

### LayerItem

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `string` | **必填** | 图层唯一标识，与 `onToggle` / `onOpacityChange` 回调中的 `layerId` 对应 |
| `name` | `string` | `id` 值 | 图层在面板中的显示名称。不传时直接用 `id` 作为展示文字 |
| `visible` | `boolean` | `true` | 图层初始可见性，同时控制面板中开关的初始状态 |
| `opacity` | `number` | `1` | 图层初始透明度，0 为全透明、1 为全不透明。仅在传了 `onOpacityChange` 时有意义 |
| `icon` | `string` | `'layers'` | 面板中图层前面的图标，使用 Material Symbols 图标名，如 `'groups'`（人群）、`'whatshot'`（热力）等 |

### ControlPosition

```typescript
type ControlPosition =
  | 'topleft' | 'topright'
  | 'bottomleft' | 'bottomright'
  | 'topcenter' | 'bottomcenter'
  | 'lefttop' | 'leftbottom'
  | 'righttop' | 'rightbottom'
  | 'leftcenter' | 'rightcenter'
```

## 示例

### 基础用法 — 城市数据图层切换

在地图上叠加人口分布和热力图两个图层，用户可独立开关每个图层：

```tsx
import { AiMap, LayerSwitchControl } from '@antv/aimapui'

const layers = [
  { id: 'population', name: '人口分布', visible: true, icon: 'groups' },
  { id: 'heatmap', name: '热力图', visible: false, icon: 'whatshot' },
  { id: 'poi', name: '兴趣点', visible: true, icon: 'location_on' },
]

function handleToggle(layerId: string, visible: boolean) {
  // 根据图层 ID 执行 show/hide
  if (layerId === 'population') populationLayer.setVisible(visible)
  if (layerId === 'heatmap') heatmapLayer.setVisible(visible)
  if (layerId === 'poi') poiLayer.setVisible(visible)
}

<AiMap autoFit map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 11 }}>
  <LayerSwitchControl
    position="topright"
    layers={layers}
    onToggle={handleToggle}
  />
</AiMap>
```

### 带透明度调节 — 气象叠加层对比

开启透明度滑块后，用户可以拖动调节每个图层的透明度，适合需要对比多个叠加层的场景：

```tsx
import { AiMap, LayerSwitchControl } from '@antv/aimapui'

const weatherLayers = [
  { id: 'radar', name: '雷达降水', visible: true, opacity: 0.8, icon: 'rainy' },
  { id: 'cloud', name: '云图', visible: true, opacity: 0.5, icon: 'cloud' },
  { id: 'wind', name: '风场', visible: false, opacity: 0.6, icon: 'air' },
]

function handleToggle(layerId: string, visible: boolean) {
  layerMap[layerId]?.setVisible(visible)
}

function handleOpacity(layerId: string, opacity: number) {
  layerMap[layerId]?.setOpacity(opacity)
}

<AiMap autoFit map={{ basemap: 'gaode', center: [121.473, 31.230], zoom: 8 }}>
  <LayerSwitchControl
    position="topright"
    layers={weatherLayers}
    onToggle={handleToggle}
    onOpacityChange={handleOpacity}
  />
</AiMap>
```

## 注意事项

- `onToggle` 和 `onOpacityChange` 只是回调，控件**不会自动控制图层显隐**，你必须在回调中调用图层的 `setVisible()` / `setOpacity()` 等方法
- `layers` 数组的变化不会自动同步到图层状态；如果图层显隐由外部逻辑改变，需要更新 `layers` 中的 `visible` / `opacity` 来保持面板与实际状态一致
- 图标依赖 Material Symbols Outlined 字体，确保项目已引入该字体资源；如果未引入，图标会显示为空白，此时可传入 `icon` 为空字符串后通过 `className` 自定义图标
- `onOpacityChange` 不传时，面板中不显示透明度滑块，`LayerItem.opacity` 值也不会被使用

## 相关组件

- [MapThemeControl](./map-theme-control) — 底图主题切换，切换底图样式而非业务图层
- [ExportImageControl](./export-image-control) — 截图导出，切换好图层组合后截图保存
- [ZoomControl](./zoom-control) — 缩放控件，常与图层切换一起使用
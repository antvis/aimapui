# ResetViewControl

一键重置地图到初始视图的控件，点击按钮后地图平滑回到预设的中心点、缩放级别、倾斜角和旋转角。

> **何时选择：** 用户在地图上反复拖拽、缩放后需要快速回到默认视角时用 ResetViewControl；需要定位到用户当前位置时用 [GeoLocateControl](./geo-locate-control)；需要缩放操作用 [ZoomControl](./zoom-control)。

## 导入

```tsx
import { ResetViewControl } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | [ControlPosition](#controlposition) | `'bottomright'` | 控件在地图上的位置 |
| `icon` | `React.ReactNode` | Material Symbols `center_focus_strong` 图标 | 按钮内容，可传文本或自定义图标组件 |
| `title` | `string` | `'Reset view'` | 按钮的 `title` 属性（hover 提示） |
| `initialView` | [InitialView](#initialview) | - | 重置目标视图。不传时回退到地图初始化时的 center / zoom / pitch / rotation；传入后以该值为准 |
| `className` | `string` | - | 自定义 CSS 类名，用于覆盖控件样式 |
| `style` | `React.CSSProperties` | - | 自定义行内样式 |

### InitialView

| 字段 | 类型 | 说明 |
|------|------|------|
| `center` | `[number, number]` | 目标中心点 `[lng, lat]`，不传则保持当前中心点不变 |
| `zoom` | `number` | 目标缩放级别，不传则保持当前缩放不变 |
| `pitch` | `number` | 目标倾斜角（度），不传则保持当前倾斜角不变 |
| `rotation` | `number` | 目标旋转角（度），不传则保持当前旋转角不变 |

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

### 基础用法 — 一键回到默认视角

不传 `initialView` 时，点击按钮回到地图初始化时的视图状态，适合大屏监控、数据看板等需要快速归位的场景：

```tsx
import { AiMap, ResetViewControl } from '@antv/aimapui'

<AiMap autoFit map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 10 }}>
  <ResetViewControl />
</AiMap>
```

### 指定初始视图 — 园区巡检场景

为地图设置一个固定的巡检起始视角，无论用户拖到哪里，点击按钮都会回到指定的中心点和缩放级别：

```tsx
import { AiMap, ResetViewControl } from '@antv/aimapui'

<AiMap autoFit map={{ basemap: 'gaode', center: [120.15, 30.28], zoom: 15, pitch: 60 }}>
  <ResetViewControl
    position="bottomright"
    title="回到园区俯瞰视角"
    initialView={{
      center: [120.15, 30.28],
      zoom: 17,
      pitch: 60,
      rotation: 0,
    }}
  />
</AiMap>
```

### 自定义按钮图标

替换默认图标为文字或自定义 React 节点，适合品牌化定制场景：

```tsx
<ResetViewControl
  position="bottomright"
  icon="重置"
  title="重置地图视图"
/>
```

## 注意事项

- 点击后通过 `scene.setCenter` / `setZoom` / `setPitch` / `setRotation` 逐一设置，地图会平滑过渡到目标视图
- `initialView` 中未传的字段保持当前值不变，不会强制重置为零或默认值
- 控件默认使用毛玻璃样式（`l7-control--glass`），如需覆盖可通过 `className` 自定义
- 默认图标依赖 Material Symbols Outlined 字体，确保项目引入了该字体资源；未引入时按钮会显示为空白，此时需手动传入 `icon`

## 相关组件

- [ZoomControl](./zoom-control) — 缩放控件，手动调整缩放级别
- [GeoLocateControl](./geo-locate-control) — 定位控件，回到用户当前位置而非预设视角
- [FullscreenControl](./fullscreen-control) — 全屏切换控件，常与重置控件放在同一角落

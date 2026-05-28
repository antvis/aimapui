# ZoomControl

地图缩放控件，提供放大/缩小按钮。开启 `showZoom` 后在按钮间显示当前缩放级别数字。

> 需要比例尺时配合 [ScaleControl](./scale-control)；需要全屏切换时配合 [FullscreenControl](./fullscreen-control)。多控件放在同一位置时会按挂载顺序堆叠。

## 导入

```tsx
import { ZoomControl } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | [ControlPosition](#controlposition) | `'bottomright'` | 控件在地图上的位置 |
| `zoomInText` | `ReactNode` | Material Symbols `add` 图标 | 放大按钮内容，可传文本或自定义图标组件 |
| `zoomInTitle` | `string` | `'Zoom in'` | 放大按钮的 `title` 属性（hover 提示） |
| `zoomOutText` | `ReactNode` | Material Symbols `remove` 图标 | 缩小按钮内容 |
| `zoomOutTitle` | `string` | `'Zoom out'` | 缩小按钮的 `title` 属性 |
| `showZoom` | `boolean` | `false` | 是否在按钮之间显示当前缩放级别数字（如 `4.5`） |
| `className` | `string` | - | 自定义 CSS 类名，用于覆盖控件样式 |
| `style` | `React.CSSProperties` | - | 自定义行内样式 |

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

### 基础用法 — 右下角缩放按钮

默认位置在地图右下角，使用 Material Symbols Outlined 字体图标：

```tsx
import { AiMap, ZoomControl } from '@antv/aimapui'

<AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 10 }}>
  <ZoomControl />
</AiMap>
```

### 显示当前缩放级别

开启 `showZoom` 后，按钮之间会实时显示当前 zoom 值，方便调试或需要精确缩放级别的场景：

```tsx
<ZoomControl position="topright" showZoom />
```

### 自定义按钮文字

替换默认图标为纯文字或自定义组件。注意替换后需要自行确保图标尺寸与控件样式协调：

```tsx
<ZoomControl
  position="bottomright"
  zoomInText="+"
  zoomOutText="−"
  zoomInTitle="放大地图"
  zoomOutTitle="缩小地图"
/>
```

## 注意事项

- 默认图标依赖 Material Symbols Outlined 字体，确保项目引入了该字体资源；如果未引入，按钮会显示为空白，此时需手动传入 `zoomInText` / `zoomOutText`
- 当地图已达到最大/最小缩放级别时，对应按钮会自动变为禁用态（灰色不可点击）
- `position` 所有控件共用，多个控件放在同一位置（如 `topright`）时会依次堆叠，后挂载的排在下方

## 相关组件

- [ScaleControl](./scale-control) — 比例尺控件，常与缩放控件搭配使用
- [FullscreenControl](./fullscreen-control) — 全屏切换控件
- [GeoLocateControl](./geo-locate-control) — 定位控件，常放在缩放控件附近
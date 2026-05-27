# ScaleControl

比例尺控件，显示当前缩放级别下的距离刻度，帮助用户直观判断地图上的空间距离。

> **何时选择：** 需要标注地图实际距离时用 ScaleControl；需要显示鼠标实时坐标时用 [MouseLocationControl](./mouse-location-control)；需要缩放按钮时用 [ZoomControl](./zoom-control)。三者常搭配使用，分别放在地图左下角和右下角。

## 导入

```tsx
import { ScaleControl } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | [ControlPosition](#controlposition) | `'bottomleft'` | 控件在地图上的位置，比例尺通常放在左下角或右下角 |
| `maxWidth` | `number` | `100` | 比例尺条的最大像素宽度。比例尺会根据当前缩放级别自动选取合理的"整距离"（如 1 km、500 m），然后在 `maxWidth` 范围内按比例缩放条宽。值越大，比例尺条越长、距离标注粒度越细 |
| `metric` | `boolean` | `true` | 显示公制单位（km / m），中国和大多数国家保持开启即可 |
| `imperial` | `boolean` | `false` | 显示英制单位（mi / ft）。与 `metric` 可同时开启，此时控件会上下并排显示两条比例尺 |
| `updateWhenIdle` | `boolean` | `false` | 设为 `true` 时仅在地图移动/缩放**结束后**更新比例尺；默认 `false` 表示实时跟随更新。大数据量场景或低端设备建议开启，避免拖拽过程中的频繁重算 |
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

### 基础用法 — 城市规划全景图

默认显示公制比例尺，放在地图左下角，缩放/拖拽时实时更新：

```tsx
import { AiMap, ScaleControl } from '@antv/aimapui'

<AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 11 }}>
  <ScaleControl />
</AiMap>
```

### 双单位比例尺 — 国际货运地图

同时显示公制和英制两条比例尺，方便跨国业务对比距离：

```tsx
<ScaleControl position="bottomleft" metric imperial />
```

### 节流更新 — 大数据量场景

拖拽地图时比例尺每帧都重算距离会带来额外开销，开启 `updateWhenIdle` 只在交互结束后更新：

```tsx
<ScaleControl position="bottomleft" metric maxWidth={150} updateWhenIdle />
```

## 注意事项

- `metric` 和 `imperial` 都关闭时控件不显示任何刻度，相当于隐藏——至少保持一个为 `true`
- 比例尺的数值是近似值，基于 Haversine 公式在地图中心点处估算，高纬度地区误差会增大
- `updateWhenIdle` 为 `false` 时，在连续缩放（如滚轮缩放）过程中会频繁触发更新；如果地图叠加了大量图层，建议开启以减少重绘
- 多个控件放在同一 `position` 时会按挂载顺序堆叠，比例尺一般先挂载让它排在最底部

## 相关组件

- [MouseLocationControl](./mouse-location-control) — 鼠标坐标实时显示，常与比例尺搭配放在底部
- [ZoomControl](./zoom-control) — 缩放按钮控件，常与比例尺搭配
- [FullscreenControl](./fullscreen-control) — 全屏切换控件
# MouseLocationControl

鼠标坐标显示控件，实时显示鼠标位置的经纬度，方便数据采集、调试和空间定位。

> **何时选择：** 需要实时查看鼠标所在坐标时用 MouseLocationControl；需要获取用户 GPS 定位并飞到该点时用 [GeoLocateControl](./geo-locate-control)；需要标注地图距离刻度时用 [ScaleControl](./scale-control)。

## 导入

```tsx
import { MouseLocationControl } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | [ControlPosition](#controlposition) | `'bottomleft'` | 控件在地图上的位置，通常放在左下角与比例尺并列 |
| `precision` | `number` | `6` | 坐标小数位数。6 位约精度到亚米级（约 0.11m），4 位约 11m，2 位约 1.1km。不需要高精度时降低位数可减少视觉干扰 |
| `transform` | `(position: [number, number]) => [number, number]` | - | 坐标转换函数，对显示前的坐标做转换（如 GCJ02 转 WGS84、度分秒格式化等）。**注意：传入 `transform` 后，`precision` 参数将失效**，你需要在函数内部自行控制精度 |
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

### 基础用法 — 地理数据采集工具

默认精度 6 位小数（亚米级），适合数据采集、标注等精准场景：

```tsx
import { AiMap, MouseLocationControl } from '@antv/aimapui'

<AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 14 }}>
  <MouseLocationControl />
</AiMap>
```

### 降低精度 + 坐标格式化 — 区域概览模式

精度 4 位足够日常查看，通过 `transform` 将坐标截断并格式化为度分秒显示，适合不关注亚米精度的业务场景：

```tsx
import { AiMap, MouseLocationControl } from '@antv/aimapui'

function toDms([lng, lat]: [number, number]): [number, number] {
  // 简化示例：实际项目中可以使用完整的度分秒转换
  const dLng = Math.abs(lng).toFixed(4)
  const dLat = Math.abs(lat).toFixed(4)
  return [Number(dLng), Number(dLat)]
}

<AiMap map={{ basemap: 'gaode', center: [121.473, 31.230], zoom: 11 }}>
  <MouseLocationControl
    position="bottomleft"
    precision={4}
  />
</AiMap>
```

### 自定义精度 — 城市级概览

只需要城市级精度（约 1km）时，设置 `precision={2}` 减少数字长度：

```tsx
<MouseLocationControl position="bottomleft" precision={2} />
```

## 注意事项

- `transform` 和 `precision` 是互斥关系：传入 `transform` 后，`precision` 不再生效，你需要在转换函数内部用 `toFixed()` 等方式自行控制输出精度
- 在高频率 `mousemove` 事件中坐标会持续更新，控件内部已做节流处理，但在极低性能设备上如果仍感觉卡顿，可考虑在父组件中限制渲染频率
- 坐标值是地图底图坐标系下的值（高德底图为 GCJ02），如果需要 WGS84 坐标用于 GPS 设备，需在 `transform` 中做转换

## 相关组件

- [ScaleControl](./scale-control) — 比例尺控件，常与坐标显示一起放在底部
- [GeoLocateControl](./geo-locate-control) — GPS 定位控件，获取用户当前位置
- [ExportImageControl](./export-image-control) — 截图导出控件
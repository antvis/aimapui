# GeoLocateControl

定位控件，点击获取当前位置并将地图定位到该点（zoom>=15），帮助用户快速回到"我在这"。

> **何时选择：** 需要获取用户实时位置并飞到该点时用 GeoLocateControl；只需要显示鼠标位置的经纬度时用 [MouseLocationControl](./mouse-location-control)；需要手动输入坐标定位时直接操作地图 `center` 即可。

## 导入

```tsx
import { GeoLocateControl } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | [ControlPosition](#controlposition) | `'topright'` | 控件在地图上的位置，通常放在右上角靠近缩放控件 |
| `transform` | `(position: [number, number]) => [number, number] \| Promise<[number, number]>` | - | 坐标转换函数，接收 `navigator.geolocation` 返回的 WGS84 坐标 `[lng, lat]`，返回转换后的坐标。支持异步，可在此调用后端接口做坐标偏移（如 WGS84 转 GCJ02）。不传时直接使用原始 GPS 坐标，在中国地图上会有几百米偏移 |
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

### 基础用法 — 外卖配送范围查看

默认使用浏览器定位，定位成功后地图飞到用户当前位置（zoom=15）：

```tsx
import { AiMap, GeoLocateControl } from '@antv/aimapui'

<AiMap autoFit map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 10 }}>
  <GeoLocateControl />
</AiMap>
```

### 坐标偏移 — 高德底图适配

浏览器 Geolocation API 返回 WGS84 坐标，直接在高德底图上会有偏移。通过 `transform` 做坐标系转换，使定位点准确落在地图上：

```tsx
import { AiMap, GeoLocateControl } from '@antv/aimapui'

// 假设项目中已有 WGS84 → GCJ02 转换函数
async function wgs84ToGcj02(lng: number, lat: number): Promise<[number, number]> {
  // 简化示例：实际应使用 coordtransform 等库
  const offsetLng = lng + 0.0065
  const offsetLat = lat + 0.0060
  return [offsetLng, offsetLat]
}

<AiMap autoFit map={{ basemap: 'gaode', center: [121.473, 31.230], zoom: 11 }}>
  <GeoLocateControl
    position="topright"
    transform={async ([lng, lat]) => wgs84ToGcj02(lng, lat)}
  />
</AiMap>
```

## 注意事项

- 定位依赖浏览器 `navigator.geolocation`，**必须在 HTTPS 环境下**才能正常工作；HTTP 页面会被浏览器直接拒绝
- 用户首次使用时会弹出授权弹窗，如果用户拒绝或关闭授权，控件点击后不会有任何响应，建议在 UI 层面做好失败提示
- `transform` 支持异步（返回 `Promise`），可以在里面调用后端坐标偏移接口，但注意异步期间定位按钮会处于等待状态
- 在中国使用高德底图时，WGS84 坐标与 GCJ02 坐标之间有约 500m 偏移，务必通过 `transform` 做转换
- iOS Safari 的定位精度取决于用户授权级别（精确位置 vs 大致位置），大致位置模式下误差可能达到数公里

## 相关组件

- [MouseLocationControl](./mouse-location-control) — 鼠标坐标显示，不需要获取用户位置时使用
- [ZoomControl](./zoom-control) — 缩放控件，常与定位控件一起放在右上角
- [MapThemeControl](./map-theme-control) — 主题切换控件
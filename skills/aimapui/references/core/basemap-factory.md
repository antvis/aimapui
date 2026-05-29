# Basemap Factory

底图工厂 `createBasemap()` 根据 MapSchema 配置动态创建 L7 地图实例，按需导入底图模块避免未使用时被打包。

## 支持的底图类型

| basemap 值 | 底图 | 需要 token | style 预设 |
|------------|------|-----------|-----------|
| `'gaode'` | 高德地图 | 是 | light, dark, normal, satellite |
| `'mapbox'` | Mapbox | 是 | light(positron), dark, normal(bright), liberty, fiord |
| `'maplibre'` | MapLibre | 否 | 同 Mapbox |
| `'tianditu'` | 天地图 | 是 | — |
| `'tencent'` | 腾讯地图 | 是 | — |
| `'baidu'` | 百度地图 | 是 | light, dark, normal, satellite |
| `'google'` | Google Maps | 是 | roadmap, satellite, hybrid, terrain |
| `'map'` | 独立地图（无底图） | 否 | — |

## 通用配置项

所有底图共享以下配置（来自 MapSchema）：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `center` | `[number, number]` | `[116.397, 39.908]` | 地图中心点 [lng, lat] |
| `zoom` | `number` | `12` | 缩放级别 |
| `pitch` | `number` | `0` | 俯仰角 |
| `rotation` | `number` | `0` | 旋转角 |
| `minZoom` | `number` | — | 最小缩放 |
| `maxZoom` | `number` | — | 最大缩放 |
| `token` | `string` | `''` | 底图 API Token |
| `style` | `string` | `'normal'` | 底图样式预设 |

## 手势配置

通过 `gestureConfig` 控制地图交互手势：

| 参数 | 类型 | 默认值 | 映射到底图 |
|------|------|-------|-----------|
| `dragPan` | `boolean` | `true` | `dragEnable` |
| `pinchZoom` | `boolean` | `true` | `zoomEnable` |
| `dragRotate` | `boolean` | `true` | `rotateEnable` |

## 底图样式映射

### 高德地图

```
light → 'light'
dark  → 'dark'
normal → 'normal'
darkblue → 'dark'
satellite → 'satellite'
```

### Mapbox / MapLibre

```
light   → OpenFreeMap Positron 样式
dark    → OpenFreeMap Dark 样式
normal  → OpenFreeMap Bright 样式
liberty → OpenFreeMap Liberty 样式
fiord   → OpenFreeMap Fiord 样式
```

也支持自定义 URL（`http://`、`https://`、`mapbox://` 开头）。

### 百度地图

```
light → 'light'
dark  → 'dark'
normal → 'normal'
darkblue → 'dark'
satellite → 'satellite'
```

### Google Maps

```
light  → 'roadmap'
dark   → 'roadmap'（颜色样式由 styles 控制）
normal → 'roadmap'
satellite → 'satellite'
hybrid → 'hybrid'
terrain → 'terrain'
```

## Google Maps 原生控件抑制

使用 Google 底图时，`createBasemap` 会自动移除 Google 原生 UI 控件（zoom、mapType、streetView、fullscreen、scale 等），统一由 L7 的控件层（ZoomControl / ScaleControl 等）接管。

内部通过轮询等待原生 `google.maps.Map` 实例就绪后，拦截 `setOptions` 调用，过滤原生 UI 字段。

## 动态导入

所有底图模块通过 `await import('@antv/l7-maps')` 动态导入，未使用的底图不会进入最终打包。

```ts
// 示例：仅使用高德底图时，Mapbox/Google 等模块不会被打包
const { GaodeMap } = await import('@antv/l7-maps');
```

## 相关文档

- [aimap-container.md](aimap-container.md) — AiMap 容器组件
- [schema-system.md](../schema/schema-system.md) — Schema 系统

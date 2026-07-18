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

## 底图引擎导入

所有底图引擎（`GaodeMap` / `Mapbox` / `TMap` / `TencentMap` / `BaiduMap` / `MapLibre` / `GoogleMap` / `Map`）统一从 `@antv/l7` 静态导入：

```ts
import { GaodeMap, Mapbox, TMap, TencentMap, BaiduMap, MapLibre, GoogleMap, Map } from '@antv/l7';
```

`@antv/l7` re-export 了 `@antv/l7-maps` 的全部引擎适配层，**无需再单独安装或引入 `@antv/l7-maps`**。构建时 `@antv/l7` 标记为 external，各引擎适配层（mapbox-gl / maplibre-gl / AMap Loader 及 GLSL 着色器等）不会被打进产物。

## 外部引擎注入（v0.3.1+）

当 `MapSchema.engine` 存在时，`createBasemap()` 会跳过动态 import，直接使用传入的构造函数创建地图实例：

```ts
// 内部逻辑
if (schema.engine) {
  return new schema.engine({ ...commonOptions, style, token });
}
```

这使得地图实例可以同步创建，适用于以下场景：

| 场景 | 说明 |
|------|------|
| SSR / Next.js | 避免动态 import 在服务端的兼容问题 |
| 微前端 | 主应用已加载底图引擎，子应用直接复用 |
| 构建工具限制 | 部分打包器对动态 import 子路径支持不完善 |
| 测试环境 | 方便 mock 地图引擎 |

使用示例：

```tsx
import { GaodeMap, Mapbox } from '@antv/l7';

// 高德
<AiMap map={{ engine: GaodeMap, token: 'YOUR_TOKEN', center: [116, 39], zoom: 10 }} />

// Mapbox
<AiMap map={{ engine: Mapbox, token: 'YOUR_TOKEN', style: 'dark' }} />
```

> **注意：** `engine` 是构造函数引用，不可 JSON 序列化，因此仅适用于组件化模式，不适用于 Schema 模式（JSON 配置）。

## 相关文档

- [aimap-container.md](aimap-container.md) — AiMap 容器组件
- [schema-system.md](../schema/schema-system.md) — Schema 系统

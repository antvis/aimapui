# AiMap

AiMapUI 的根容器组件，所有地图内容必须包裹在 `AiMap` 内。支持两种使用模式：**组合模式**（React 组件声明式，适合前端手写）和 **Schema 模式**（JSON 配置式，适合 AI 生成或后端下发）。

> **何时用组合模式 vs Schema 模式：** 日常前端开发用组合模式（`map` prop + 子组件），有 TypeScript 提示且更直观；需要动态生成配置（AI 对话、低代码平台、配置中心）时用 Schema 模式（`schema` prop），配置可序列化。两者底层引擎完全相同。

## 导入

```tsx
import { AiMap } from '@antv/aimapui';

// 别忘了在入口文件引入样式（只需引入一次，图标字体已内置 CDN）
import '@antv/aimapui/style.css';
```

## Props

### 模式选择

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `map` | [MapSchema](#mapschema-配置) | - | 组合模式配置，传入后子组件自动按类型分发到图层/控件/交互插槽 |
| `schema` | [AiMapSchema](#aimapschema) | - | Schema 模式配置，JSON 对象描述完整地图。与 `map` 互斥，同时传入时 `map` 优先 |
| `children` | `ReactNode` | - | 组合模式下的子组件：[PointLayer](../layers/point-layer)、[ZoomControl](../controls/zoom-control)、[Popup](../interaction/popup) 等 |

### 主题与容器

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `theme` | `'light' \| 'dark' \| 'system'` | `'light'` | 全局主题，影响控件、弹窗、图例的样式。`'system'` 跟随 `prefers-color-scheme` |
| `className` | `string` | - | 容器 DOM 的 CSS 类名 |
| `style` | `React.CSSProperties` | - | 容器 DOM 的行内样式。**重要：** 容器必须有明确高度，否则地图不显示 |

### 事件回调

| 属性 | 类型 | 说明 |
|------|------|------|
| `onSceneReady` | `(scene: Scene) => void` | L7 Scene 实例就绪回调，可用于获取底层 Scene 对象做高级操作 |
| `onLayerClick` | `(payload: [LayerEventPayload](../layers/point-layer#layereventpayload)) => void` | 任意图层被点击时触发，比在单个图层上监听 `onClick` 更方便做全局点击处理 |
| `onLayerMouseMove` | `(payload: LayerEventPayload) => void` | 任意图层上鼠标移动 |
| `onLayerMouseEnter` | `(payload: LayerEventPayload) => void` | 鼠标进入任意图层 |
| `onLayerMouseLeave` | `(payload: LayerEventPayload) => void` | 鼠标离开任意图层 |
| `onMapMove` | `(payload: [MapEventPayload](#mapeventpayload)) => void` | 地图平移/拖拽时触发 |
| `onMapZoom` | `(payload: MapEventPayload) => void` | 地图缩放时触发 |
| `events` | `Record<string, (...args: unknown[]) => void>` | EventBus 事件监听，键为事件名、值为回调函数，用于组件间通信 |

## MapSchema 配置

| 属性 | 类型 | 组合模式默认值 | Schema 模式默认值 | 说明 |
|------|------|---------------|-----------------|------|
| `basemap` | `'gaode' \| 'mapbox' \| 'maplibre' \| 'tianditu' \| 'tencent' \| 'baidu' \| 'google' \| 'map'` | `'gaode'` | `'map'` | 底图引擎。`'map'`/`'maplibre'` = 开源底图（无需 token）；其余需配 `token` |
| `engine` | `new (opts: Record<string, unknown>) => unknown` | - | - | 外部注入的地图引擎**构造函数**，跳过动态 import。与 `basemap` 二选一，同时传入时 `engine` 优先。仅适用于组件化模式（不可序列化，Schema 模式不支持） |
| `center` | `[number, number]` | `[105, 35]` | `[105, 35]` | 初始中心点 [经度, 纬度] |
| `zoom` | `number` | `4` | `4` | 初始缩放级别（0~22，值越大越细节） |
| `pitch` | `number` | `0` | `0` | 俯仰角（0~60），大于 0 开启 3D 透视，配合 [PolygonLayer](../layers/polygon-layer) 的 `extrusion` 或 [LineLayer](../layers/line-layer) 的 `arc3d` 使用 |
| `rotation` | `number` | `0` | `0` | 旋转角（0~360），正北朝上为 0 |
| `token` | `string` | - | - | 底图 API Token，`'map'`/`'maplibre'` 模式下无需提供 |
| `style` | `'light' \| 'dark' \| 'normal' \| 'darkblue' \| 'satellite' \| string` | - | - | 底图样式预设名或自定义 Style URL。与 `theme` 不同：`theme` 影响控件样式，`style` 影响底图瓦片 |
| `minZoom` | `number` | - | - | 最小缩放级别限制，低于此级别无法缩小 |
| `maxZoom` | `number` | - | - | 最大缩放级别限制，高于此级别无法放大 |
| `bounds` | `[[number, number], [number, number]]` | - | - | 初始边界范围 [[西南经度, 西南纬度], [东北经度, 东北纬度]]，与 `center`/`zoom` 互斥 |
| `gestureConfig` | [GestureConfig](#gestureconfig) | - | - | 手势配置，移动端限制用户交互时有用 |

### GestureConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `dragPan` | `boolean` | - | 是否允许拖拽平移，移动端 `false` 可固定地图位置 |
| `pinchZoom` | `boolean` | - | 是否允许双指缩放 |
| `dragRotate` | `boolean` | - | 是否允许拖拽旋转，禁用后右键/双指旋转不可用 |

> ⚠️ **默认值差异说明**：组合模式（`map` prop）默认底图为 `'gaode'`；Schema 模式默认底图为 `'map'`。如果不指定 `center` 和 `zoom`，两种模式都默认中心点 `[105, 35]`、缩放级别 `4`。

## 子类型定义

### MapEventPayload

```typescript
interface MapEventPayload {
  originalEvent: unknown;              // L7 原始事件对象
  center: [number, number];            // 当前地图中心 [经度, 纬度]
  zoom: number;                        // 当前缩放级别
  pitch: number;                       // 当前俯仰角
  rotation: number;                    // 当前旋转角
}
```

### AiMapSchema

Schema 模式的完整配置对象：

```typescript
interface AiMapSchema {
  map: MapSchema;                                      // 地图配置（必填）
  layers: LayerSchema[];                               // 图层配置数组
  controls?: ControlSchema[];                          // 控件配置数组
  interactions?: InteractionSchema[];                  // 交互组件配置数组
  legends?: LegendSchema[];                             // 图例配置数组
  responsive?: ResponsiveSchema;                       // 响应式配置
  events?: EventSchema;                                 // 全局事件配置
}
```

## 示例

### 组合模式 — 常用前端开发

```tsx
import { AiMap, PointLayer, ZoomControl, Popup } from '@antv/aimapui'

const cities = [
  { lng: 116.397, lat: 39.908, name: '北京' },
  { lng: 121.473, lat: 31.230, name: '上海' },
]

<AiMap
  autoFit
  map={{ basemap: 'gaode', center: [108, 34], zoom: 4, token: 'YOUR_TOKEN' }}
  theme="dark"
  onSceneReady={(scene) => console.log('场景就绪', scene)}
>
  <PointLayer
    source={cities}
    sourceType="json"
    sourceConfig={{ x: 'lng', y: 'lat' }}
    size={10}
    color="#3B82F6"
  />
  <ZoomControl position="topright" />
</AiMap>
```

### Schema 模式 — AI/低代码场景

```tsx
<AiMap
  autoFit
  schema={{
    map: { basemap: 'gaode', center: [108, 34], zoom: 4, token: 'YOUR_TOKEN' },
    layers: [
      {
        type: 'point',
        source: cities,
        sourceType: 'json',
        sourceConfig: { x: 'lng', y: 'lat' },
        size: 10,
        color: '#3B82F6',
      }
    ],
    controls: [{ type: 'zoom', position: 'topright' }]
  }}
/>
```

### 3D 建筑 + 限制手势

```tsx
<AiMap
  autoFit
  map={{
    basemap: 'gaode',
    center: [116.397, 39.908],
    zoom: 15,
    pitch: 50,
    token: 'YOUR_TOKEN',
    gestureConfig: { dragPan: true, pinchZoom: true, dragRotate: false }
  }}
>
  <PolygonLayer source={buildings} sourceType="geojson" shape="extrusion" />
</AiMap>
```

### Engine 注入 — SSR / 微前端 / 跳过动态 import

当项目已安装 L7 底图引擎包，或需要跳过动态 import（SSR、微前端等场景）时，可通过 `engine` 直接传入引擎构造函数：

```tsx
import { GaodeMap } from '@antv/l7';
import { AiMap, PointLayer, ZoomControl } from '@antv/aimapui';

<AiMap
  autoFit
  map={{ engine: GaodeMap, center: [108, 34], zoom: 4, token: 'YOUR_TOKEN' }}
>
  <PointLayer source={cities} sourceType="json" sourceConfig={{ x: 'lng', y: 'lat' }} size={10} color="#3B82F6" />
  <ZoomControl position="topright" />
</AiMap>
```

> ⚠️ **注意**：`engine` 是构造函数（类），不是已创建的 Map 实例。`basemap` 和 `engine` 二选一，同时传入时 `engine` 优先。`engine` 不可序列化，仅适用于组件化模式，Schema 模式不支持。

### Google 地图底图

需要在 [Google Cloud Console](https://console.cloud.google.com/google/maps-apis) 申请 Maps JavaScript API Key 并开启 **Maps JavaScript API**。`style` 初始值支持 `'normal' | 'satellite' | 'hybrid' | 'terrain'`。

#### 基础用法

```tsx
import { AiMap, PointLayer, ZoomControl, ErrorBoundary } from '@antv/aimapui'

<ErrorBoundary>
  <AiMap
    autoFit
    map={{
      basemap: 'google',
      token: 'YOUR_GOOGLE_MAPS_API_KEY',
      center: [105, 35],
      zoom: 4,
      style: 'normal',
    }}
  >
    <PointLayer source={cities} sourceType="json" sourceConfig={{ x: 'lng', y: 'lat' }} size={10} color="#3B82F6" />
    <ZoomControl position="bottomright" />
  </AiMap>
</ErrorBoundary>
```

#### 主题切换（roadmap/satellite/hybrid/terrain）

L7 的 `mapsService.setMapStyle` 对 Google 已封装为 `setMapTypeId`，但建议**直接拿原生 map 实例调用**以获得最稳定的体验：

```tsx
import React, { useCallback, useRef, useState } from 'react'
import type { Scene } from '@antv/l7'
import { AiMap, MapThemeControl, ErrorBoundary } from '@antv/aimapui'
import type { ThemeOption } from '@antv/aimapui'

const GOOGLE_THEMES: ThemeOption[] = [
  { text: '路图', value: 'roadmap' },
  { text: '卫星', value: 'satellite' },
  { text: '混合', value: 'hybrid' },
  { text: '地形', value: 'terrain' },
]

function GoogleMapWithTheme() {
  const nativeMapRef = useRef<any>(null)
  const [currentTheme, setCurrentTheme] = useState('roadmap')

  const handleSceneReady = useCallback((scene: Scene) => {
    // 通过 scene.mapService.map 拿到 google.maps.Map 原生实例
    nativeMapRef.current = (scene as any).mapService?.map
  }, [])

  const handleThemeChange = useCallback((value: string) => {
    setCurrentTheme(value)
    nativeMapRef.current?.setMapTypeId?.(value)
  }, [])

  return (
    <ErrorBoundary>
      <AiMap
        autoFit
        map={{
          basemap: 'google',
          token: 'YOUR_GOOGLE_MAPS_API_KEY',
          center: [105, 35],
          zoom: 4,
        }}
        onSceneReady={handleSceneReady}
      >
        <MapThemeControl
          position="topleft"
          options={GOOGLE_THEMES}
          defaultValue={currentTheme}
          onThemeChange={handleThemeChange}
        />
      </AiMap>
    </ErrorBoundary>
  )
}
```

> 💡 国内访问 Google Maps 需要 VPN，建议用 `ErrorBoundary` 包裹避免 SDK 加载失败影响其他页面。
> 同样的模式也适用于百度（`nativeMap.setMapStyleV2({ styleJson })`）和腾讯（`nativeMap.setMapStyleId(styleId)`）地图。

### 边界范围初始化

用 `bounds` 替代 `center` + `zoom`，让地图自动适配指定区域：

```tsx
<AiMap
  autoFit
  map={{
    basemap: 'gaode',
    bounds: [[73.5, 18.2], [135.1, 53.6]],  // 中国疆域范围
    token: 'YOUR_TOKEN',
  }}
/>
```

## 注意事项

- **容器高度**：`AiMap` 默认撑满父容器，如果父容器高度为 0（如 flex 布局未设 `height`），地图不会显示。确保父容器有明确高度，如 `style={{ height: '100vh' }}`
- `map` 和 `schema` 互斥，同时传入时 `map` 优先，`schema` 会被忽略
- 组合模式中子组件自动按类型分发：图层组件渲染到场景，控件组件渲染到 L7 控件容器，交互组件（Popup/Tooltip/Marker）渲染到 Overlay 层
- `basemap='map'`/`'maplibre'` 使用开源底图，无需 token；`'gaode'`、`'mapbox'`、`'google'`、`'tencent'`、`'baidu'`、`'tianditu'` 等需要对应平台的 API Key
- `basemap='google'` 在国内需要 VPN 才能访问，建议用 `ErrorBoundary` 包裹避免 SDK 加载失败影响其他页面
- `pitch` 大于 0 开启 3D 透视，配合 [PolygonLayer](../layers/polygon-layer) 的 `extrusion` 和 [LineLayer](../layers/line-layer) 的 `arc3d` 使用
- `gestureConfig` 在移动端场景特别有用：禁用 `dragRotate` 可防止误触旋转地图
- `events` 的 EventBus 可用于跨组件通信，如图层点击后触发图例更新

## 相关组件

- [PointLayer](../layers/point-layer) — 最常用的散点图层
- [ZoomControl](../controls/zoom-control) — 缩放控件
- [Popup](../interaction/popup) — 地图弹窗
- [快速开始](../getting-started) — 完整安装和入门指南
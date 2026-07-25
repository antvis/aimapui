# AiMap 主容器

## 快速示例

```tsx
import { AiMap } from '@antv/aimapui';

// 组件化模式
<AiMap map={{ basemap: 'gaode', center: [116, 39], zoom: 10 }} theme="light">
  <PointLayer source={data} color="#5B8FF9" size={12} />
</AiMap>

// Schema 模式
<AiMap schema={{
  map: { basemap: 'gaode', center: [116, 39], zoom: 10 },
  layers: [{ type: 'point', source: data, color: '#5B8FF9', size: 12 }],
}} />
```

## 两种使用模式

### 组件化模式（推荐开发者使用）

```tsx
<AiMap map={{ basemap: 'gaode' }} onSceneReady={(scene) => console.log(scene)}>
  <PointLayer source={data} color="red" size={10} onClick={handleClick} />
  <ZoomControl position="topright" />
  <Marker longitude={116.4} latitude={39.9} label="北京" />
  <LegendCategories title="类型" labels={['A','B']} colors={['#f00','#00f']} />
</AiMap>
```

### Schema 模式（AI 生成、JSON 配置）

```tsx
<AiMap
  schema={schema}
  events={{ 'point-click': (p) => console.log(p) }}
  theme="dark"
/>
```

**关键约束：`map` 和 `schema` 互斥，禁止同时传入。**

## AiMap Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `map` | `MapSchema` | — | 地图配置（组件化模式） |
| `schema` | `AiMapSchema` | — | 完整 Schema（JSON/AI 模式） |
| `theme` | `'light' \| 'dark' \| 'system'` | `'light'` | 主题模式 |
| `autoFit` | `boolean` | — | 自动缩放至所有图层数据范围（覆盖 center/zoom） |
| `onSceneReady` | `(scene: Scene) => void` | — | L7 Scene 就绪回调 |
| `onLayerClick` | `(payload: LayerEventPayload) => void` | — | 全局图层点击 |
| `onLayerMouseMove` | `(payload) => void` | — | 全局图层鼠标移动 |
| `onLayerMouseEnter` | `(payload) => void` | — | 全局图层鼠标进入 |
| `onLayerMouseLeave` | `(payload) => void` | — | 全局图层鼠标离开 |
| `onMapMove` | `(payload: MapEventPayload) => void` | — | 地图移动 |
| `onMapZoom` | `(payload: MapEventPayload) => void` | — | 地图缩放 |
| `events` | `Record<string, Function>` | — | EventBus 事件监听 |
| `children` | `ReactNode` | — | 子组件（组件化模式） |
| `className` | `string` | — | 容器 CSS 类名 |
| `style` | `CSSProperties` | — | 容器内联样式 |

### autoFit 说明

开启 `autoFit` 后，地图与所有图层就绪后自动调用 `scene.fitBounds`，将视野适配到全部图层数据的外接矩形。适合数据范围未知或需要"打开页面即看到全部数据"的场景。

```tsx
<AiMap map={{ basemap: 'gaode' }} autoFit>
  <PointLayer source={data} sourceConfig={{ x: 'lng', y: 'lat' }} />
</AiMap>
```

> 底图必须支持 `fitBounds`（高德 / Maplibre / Mapbox / 天地图均支持）。

## MapSchema 配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `basemap` | `BasemapType` | `'gaode'` | 底图类型，与 `engine` 二选一，传 `engine` 时可省略 |
| `engine` | `new (opts) => unknown` | — | 外部注入的地图引擎构造函数，跳过动态 import（v0.3.1+） |
| `token` | `string` | — | 底图 API Token |
| `style` | `MapStylePreset \| string` | — | 样式：`light`/`dark`/`normal`/`darkblue`/`satellite` 或 URL |
| `center` | `[number, number]` | `[105, 35]` | 中心点 [经度, 纬度] |
| `zoom` | `number` | `4` | 缩放级别 |
| `pitch` | `number` | `0` | 俯仰角 |
| `rotation` | `number` | `0` | 旋转角 |
| `minZoom` | `number` | — | 最小缩放 |
| `maxZoom` | `number` | — | 最大缩放 |
| `bounds` | `[[number,number],[number,number]]` | — | 初始边界，自动 fitBounds |
| `gestureConfig` | `{ dragPan?, pinchZoom?, dragRotate? }` | — | 手势控制 |

### engine 外部注入

当项目已安装 L7 底图引擎，或需要跳过动态 import（SSR、微前端等）时，可通过 `engine` 直接传入引擎构造函数：

```tsx
import { GaodeMap } from '@antv/l7';

<AiMap map={{ engine: GaodeMap, center: [116, 39], zoom: 10 }}>
  <PointLayer source={data} />
</AiMap>
```

- `basemap` 和 `engine` 二选一，同时传入时 `engine` 优先
- 使用 `engine` 时地图实例同步创建，无异步等待
- `engine` 不可序列化，仅适用于组件化模式，不适用于 Schema 模式

## 底图选择

| 底图 | basemap | 需要 token | 适用场景 |
|------|---------|-----------|---------|
| 高德地图 | `'gaode'` | 是（Weavefox/内网环境下**免 token**：组件内置默认 token，访问域名已加白） | 国内业务首选 |
| Mapbox | `'mapbox'` | 是 | 国际化业务 |
| MapLibre | `'maplibre'` | 可选 | 开源矢量瓦片 |
| 天地图 | `'tianditu'` | 是 | 政务/国测局坐标系 |
| 腾讯地图 | `'tencent'` | 是 | 腾讯生态 |
| 百度地图 | `'baidu'` | 是 | 百度生态 |
| 独立地图 | `'map'` | 否 | 无底图纯白背景 |

## Context Providers

AiMap 内部创建了 5 个 Context：

- **SceneContext** — 提供 L7 Scene 实例
- **SchemaContext** — 提供解析后的 Schema
- **EventBusContext** — 事件总线
- **ThemeContext** — 主题（light/dark/system）
- **ResponsiveContext** — 响应式断点

子组件通过 `useScene()` / `useEventBus()` / `useResponsive()` 等 Hook 获取。

## Scene 操作方法

通过 `onSceneReady` 回调或 `useScene()` Hook 拿到 L7 的 `Scene` 实例后，即可编程式控制地图视角。

```tsx
import { AiMap, useScene } from '@antv/aimapui';
import type { Scene } from '@antv/l7';  // Scene 类型由 @antv/l7 提供，aimapui 未 re-export

// 方式一：回调
<AiMap map={{ basemap: 'gaode' }} onSceneReady={(scene: Scene) => {
  // scene 即 L7 Scene 实例
}} />

// 方式二：子组件内 Hook
function MyController() {
  const scene = useScene();
  if (!scene) return null;
  return <button onClick={() => scene.zoomIn()}>放大</button>;
}
```

### 可用方法（L7 Scene 通用，跨底图引擎均支持）

| 方法 | 说明 |
|------|------|
| `setCenter([lng, lat], opts?)` | 设置中心点 |
| `setZoom(zoom)` / `zoomIn()` / `zoomOut()` | 缩放 |
| `setPitch(pitch)` | 俯仰角 |
| `setRotation(rotation)` | 旋转角 |
| `setZoomAndCenter(zoom, [lng, lat])` | 同时设置缩放与中心点（定点飞行推荐） |
| `fitBounds([[minLng,minLat],[maxLng,maxLat]], opts?)` | 适配到边界矩形 |
| `panTo([lng, lat])` / `panBy(x, y)` | 平移 |
| `getCenter()` / `getZoom()` / `getPitch()` / `getRotation()` / `getBounds()` | 读取当前视角 |
| `setMapStyle(style)` / `setMapStatus(opts)` | 切换底图样式 / 地图状态 |
| `addLayer(layer)` / `removeLayer(layer)` | 图层增删（通常由图层组件托管，无需手动调） |
| `lngLatToPixel` / `pixelToLngLat` / `containerToLngLat` / `lngLatToContainer` | 坐标互转 |

### ⚠️ 不存在的方法

L7 的 `Scene` 是统一抽象层，**没有** `flyTo`、`easeTo`、`jumpTo` 等 mapbox / maplibre 原生 `Map` 实例方法。直接调用会报 `TypeError: scene.flyTo is not a function`。

```ts
// ❌ 错误 — L7 Scene 没有 flyTo
scene.flyTo({ center: [120, 30], zoom: 14 });

// ✅ 正确一 — setZoomAndCenter（一行搞定定点缩放，跨引擎通用）
scene.setZoomAndCenter(14, [120, 30]);

// ✅ 正确二 — setCenter + setZoom 组合
scene.setCenter([120, 30]);
scene.setZoom(14);
```

> 如需"打开即看到全部数据"，优先用 `<AiMap autoFit>`（内部自动 `fitBounds`），无需手动操作 Scene。

## 事件 Payload

```typescript
// 图层事件
interface LayerEventPayload {
  layerId: string;
  layerType: LayerType;
  originalEvent: unknown;
  lng: number;
  lat: number;
  feature?: Record<string, unknown>;
}

// 地图事件
interface MapEventPayload {
  originalEvent: unknown;
  center: [number, number];
  zoom: number;
  pitch: number;
  rotation: number;
}
```

## 常见问题

| 问题 | 解决方案 |
|------|---------|
| 地图不显示 | 确认容器有明确宽高，父容器需要有高度 |
| Token 无效 | 高德底图在 Weavefox/内网环境下无需设 token（组件内置默认 token，访问域名已加白）；其余底图确认 `map.token` 传入有效 token |
| 两种模式冲突 | `map` 和 `schema` 互斥，只传一个 |
| 组件找不到 Scene | 确保所有图层/控件在 `<AiMap>` 内部 |

## 相关文档

- [schema-system.md](../schema/schema-system.md) — Schema 系统详解
- [event-bus.md](../core/event-bus.md) — EventBus 事件系统
- [basemap-factory.md](basemap-factory.md) — 底图工厂
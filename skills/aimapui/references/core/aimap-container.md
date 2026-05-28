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

## MapSchema 配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `basemap` | `BasemapType` | `'map'` | 底图：`gaode`/`mapbox`/`maplibre`/`tianditu`/`tencent`/`baidu`/`map` |
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

## 底图选择

| 底图 | basemap | 需要 token | 适用场景 |
|------|---------|-----------|---------|
| 高德地图 | `'gaode'` | 是 | 国内业务首选 |
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
| Token 无效 | 确认 `map.token` 传入有效 token |
| 两种模式冲突 | `map` 和 `schema` 互斥，只传一个 |
| 组件找不到 Scene | 确保所有图层/控件在 `<AiMap>` 内部 |

## 相关文档

- [schema-system.md](../schema/schema-system.md) — Schema 系统详解
- [event-bus.md](../core/event-bus.md) — EventBus 事件系统
- [basemap-factory.md](../core/basemap-factory.md) — 底图工厂
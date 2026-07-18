# RouteLayer

路径地图复合图层，用于在地图上绘制带编号站点的路线。内置三种站点渲染模式（圆点 / Marker / 图标）、分段着色（路况可视化）、弧线长距离路径，以及步行 / 骑行 / 驾车 / 公交四种交通路线查询——只需传入站点列表和查询回调，组件自动完成路径规划与渲染。

> **何时选择：** 需要绘制带编号途经点的路线（旅行线路、物流配送、导航轨迹等）时用 RouteLayer；只需简单连线、不需要站点标注时用 [LineLayer](../layers/line-layer)；只需 OD 弧线流向时用 [ArcFlowLayer](./arc-flow-layer)。

## 导入

```tsx
import { RouteLayer } from '@antv/aimapui';
```

## Props

### 路径与数据

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `path` | `[number, number][]` | - | 路径坐标数组 `[lng, lat]`，`straight` / `arc` 模式下必填 |
| `segments` | [RouteSegment](#routesegment) | - | 分段路径，每段可独立设置颜色和宽度（优先级高于 `path`） |
| `stops` | [RouteStop](#routestop) | `[]` | 途经点列表，自动补全路径首尾为起终点 |
| `routeType` | [RouteType](#routetype--路径模式) | `'straight'` | 路径类型 |
| `onRouteQuery` | `(params: RouteQueryParams) => Promise<RouteQueryResult>` | - | 交通路线查询回调，`routeType` 为 `walking/cycling/driving/transit` 时使用 |
| `onRouteResult` | `(result: RouteQueryResult) => void` | - | 路线查询完成后的回调，可用于获取距离、时长等信息 |

### 路径视觉

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `color` | `string` | `'#2563eb'` | 路径颜色 |
| `lineWidth` | `number` | `3` | 路径宽度（px） |
| `opacity` | `number` | `0.9` | 路径不透明度（0~1） |

### 站点视觉

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `stopSize` | `number` | `8` | 站点圆点大小（px），仅 `stopRenderer='point'` 时生效 |
| `stopColor` | `string` | 跟随路径色 | 中间站点颜色 |
| `endColor` | `string` | `'#10b981'` | 终点站点颜色 |
| `showStopIndex` | `boolean` | `true` | 是否显示站点序号 |
| `showStopName` | `boolean` | `true` | 是否显示站点名称 |
| `stopNameColor` | `string` | `'#334155'` | 站点名称文字颜色 |
| `stopNameSize` | `number` | `11` | 站点名称文字大小（px） |

### 站点渲染模式

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `stopRenderer` | `'point' \| 'marker' \| 'icon'` | `'marker'` | 站点渲染模式：默认 `marker`（DOM Marker 编号标注），`point` 为圆点序号、`icon` 为图片图标 |
| `stopMarkerVariant` | `MarkerVariant` | `'circle'` | `marker` 模式下的默认形态（`circle` / `dot` / `pin` / `icon`） |
| `stopIconMap` | `Record<string, string>` | - | `icon` 模式下的图标资源映射；不传时基于站点 `icon` 字段自动生成 Maki Pin 图标 |
| `stopIconField` | `string` | `'iconValue'` | `icon` 模式下的图标字段名 |
| `stopIconSize` | `number` | `16` | `icon` 模式下的图标尺寸（px） |
| `stopIconAnchor` | `IconAnchor` | `'bottom'` | `icon` 模式下的图标锚点位置 |

### 交互

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `showStopPopup` | `boolean` | `false` | 点击站点时是否弹出内置 Popup |
| `activeColor` | `string` | `'#fbbf24'` | 悬停高亮颜色 |
| `onPathClick` | `(payload: LayerEventPayload) => void` | - | 路径点击事件 |
| `onStopClick` | `(payload: LayerEventPayload) => void` | - | 站点点击事件 |

### 公共属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `zIndex` | `number` | - | 图层层级 |

## RouteType — 路径模式

| 值 | 说明 | 是否需要 `onRouteQuery` |
|------|------|------|
| `'straight'` | 直线连接坐标点（默认） | 否，使用 `path` |
| `'arc'` | 弧线连接，适合长距离路线（如航线） | 否，使用 `path` |
| `'walking'` | 步行路线 | 是 |
| `'cycling'` | 骑行路线 | 是 |
| `'driving'` | 驾车路线 | 是 |
| `'transit'` | 公交路线 | 是 |

## Types

### RouteStop

```typescript
interface RouteStop {
  lng: number;            // 经度
  lat: number;            // 纬度
  name: string;           // 名称
  index?: number;         // 序号（不传则自动递增）
  type?: 'start' | 'end' | 'waypoint'; // 类型，不传则自动推断
  icon?: string;          // 图标名，stopRenderer='icon' 时使用
  markerVariant?: MarkerVariant;  // marker 模式下的自定义变体
  markerColor?: MarkerColor;      // marker 模式下的语义颜色
}
```

### RouteSegment

```typescript
interface RouteSegment {
  coordinates: [number, number][]; // 坐标序列 [[lng, lat], ...]
  color?: string;                  // 分段颜色（如路况着色）
  width?: number;                  // 分段宽度
}
```

### RouteQueryParams

交通路线查询时组件传给 `onRouteQuery` 的参数，自动从 `stops` 的首尾提取起终点。

```typescript
interface RouteQueryParams {
  origin: [number, number];        // 起点坐标
  destination: [number, number];   // 终点坐标
  waypoints?: [number, number][];  // 途经点坐标
  routeType: 'walking' | 'cycling' | 'driving' | 'transit';
}
```

### RouteQueryResult

`onRouteQuery` 的返回值，至少返回 `path`。

```typescript
interface RouteQueryResult {
  path: [number, number][];        // 必填：完整路径坐标
  segments?: RouteSegment[];       // 可选：分段路径（如路况着色）
  stops?: RouteStop[];             // 可选：补充站点（如公交换乘站）
  info?: {
    distance?: number;             // 距离（米）
    duration?: number;             // 时长（秒）
    description?: string;          // 路线描述
  };
}
```

## 示例

### 基础用法 — 带编号站点的直线路线

> 默认 `stopRenderer='marker'`，途经点以 DOM Marker 编号标注，无需显式配置即可获得语义化起终点配色。

```tsx
<AiMap autoFit map={{ basemap: 'gaode', center: [118, 36], zoom: 6 }}>
  <RouteLayer
    path={[
      [116.397, 39.908],
      [117.200, 39.084],
      [121.473, 31.230],
    ]}
    stops={[
      { lng: 116.397, lat: 39.908, name: '北京' },
      { lng: 117.200, lat: 39.084, name: '天津' },
      { lng: 121.473, lat: 31.230, name: '上海' },
    ]}
    color="#3B82F6"
    showStopIndex
  />
</AiMap>
```

### 弧线模式（航线）

长距离路线使用弧线连接，视觉效果更自然。

```tsx
<RouteLayer
  path={[
    [116.4, 39.9],
    [121.5, 31.2],
    [113.3, 23.1],
  ]}
  stops={[
    { lng: 116.4, lat: 39.9, name: '北京' },
    { lng: 121.5, lat: 31.2, name: '上海' },
    { lng: 113.3, lat: 23.1, name: '广州' },
  ]}
  routeType="arc"
  color="#8b5cf6"
/>
```

### 分段着色（路况可视化）

使用 `segments` 传入分段路径数据，每段可独立设置颜色和宽度，适合展示道路拥堵情况。

```tsx
<RouteLayer
  segments={[
    { coordinates: [[116.397, 39.908], [117.0, 39.5]], color: '#22c55e', width: 4 },
    { coordinates: [[117.0, 39.5], [118.5, 36.0]], color: '#f59e0b', width: 4 },
    { coordinates: [[118.5, 36.0], [121.473, 31.230]], color: '#ef4444', width: 4 },
  ]}
  stops={[
    { lng: 116.397, lat: 39.908, name: '北京' },
    { lng: 121.473, lat: 31.230, name: '上海' },
  ]}
/>
```

### 驾车路线查询

通过 `onRouteQuery` 回调对接外部路径规划 API（如高德、MapNova），组件自动从 `stops` 提取起终点并调用回调获取路径。

```tsx
<RouteLayer
  stops={[
    { lng: 116.397, lat: 39.909, name: '天安门' },
    { lng: 116.427, lat: 39.903, name: '王府井' },
    { lng: 116.474, lat: 39.877, name: '国贸' },
  ]}
  routeType="driving"
  onRouteQuery={async ({ origin, destination, waypoints, routeType }) => {
    const res = await fetch(
      `/api/route?type=${routeType}&origin=${origin}&dest=${destination}`
    );
    const data = await res.json();
    return {
      path: data.coordinates,
      info: { distance: data.distance, duration: data.duration },
    };
  }}
  onRouteResult={(result) => {
    console.log(`距离: ${result.info?.distance}m, 时长: ${result.info?.duration}s`);
  }}
  color="#10b981"
/>
```

### 公交路线（含换乘站）

`onRouteQuery` 可返回额外的 `stops`（如公交换乘站），会自动合并到站点列表中。

```tsx
<RouteLayer
  stops={[
    { lng: 116.397, lat: 39.909, name: '天安门东站' },
    { lng: 116.474, lat: 39.877, name: '国贸站' },
  ]}
  routeType="transit"
  onRouteQuery={async (params) => {
    const result = await queryTransitRoute(params);
    return {
      path: result.path,
      stops: result.transferStops,
      info: result.info,
    };
  }}
  color="#f59e0b"
/>
```

### Marker 模式（默认）

`marker` 为默认渲染模式，使用 DOM Marker 渲染站点，支持 `circle`、`dot`、`pin`、`icon` 等变体；以下示例显式切换变体。

```tsx
<RouteLayer
  path={pathCoords}
  stops={stops}
  stopRenderer="marker"
  stopMarkerVariant="circle"
  color="#2563eb"
  showStopPopup
/>
```

### Icon 图标模式

使用图片图标渲染站点，不传 `stopIconMap` 时自动生成 Maki Pin 图标。

```tsx
<RouteLayer
  path={pathCoords}
  stops={[
    { lng: 116.397, lat: 39.908, name: '北京', icon: 'airport' },
    { lng: 121.473, lat: 31.230, name: '上海', icon: 'building' },
    { lng: 113.264, lat: 23.129, name: '广州', icon: 'park' },
  ]}
  stopRenderer="icon"
  stopIconSize={20}
  stopIconAnchor="bottom"
  color="#8b5cf6"
/>
```

## 注意事项

> 💡 **停留点默认 `stopRenderer='marker'`**（DOM Marker 编号标注）。如需纯 L7 圆点性能模式可显式设 `stopRenderer='point'`，需要图片图标时设 `stopRenderer='icon'`。

> 💡 `routeType` 为 `walking/cycling/driving/transit` 时，路径由 `onRouteQuery` 回调返回，不需要手动传入 `path`；仅需传入 `stops` 标注起终点和途经点。

> 💡 `stops` 列表可以不包含路径的首尾坐标，组件会自动将路径起终点补充为「起点」和「终点」站点。

> 💡 `showStopIndex` 为 `true` 时，`point` 模式在站点圆心绘制编号；`marker` 和 `icon` 模式以标签方式补充显示。

> ⚠️ `segments` 优先级高于 `path`——当两者同时传入时，使用 `segments` 渲染路径并支持分段着色。

> ⚠️ `icon` 模式下如不传 `stopIconMap`，组件会基于站点的 `icon` 字段自动生成 Maki Pin 图标，无需手动准备图标资源。

## 相关组件

- [LineLayer](../layers/line-layer) — 基础线图层，适合不需要站点标注的简单连线
- [ArcFlowLayer](./arc-flow-layer) — OD 弧线流向图层，适合城市间流量可视化
- [PointLayer](../layers/point-layer) — 基础点图层
- [Marker](../interaction/marker) — DOM Marker 组件，RouteLayer 的 `marker` 模式底层基于此实现

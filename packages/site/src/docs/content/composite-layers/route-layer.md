# RouteLayer

路线图组件，支持编号站点、发光路径、分段着色和流动动画。支持多种路径模式：直线、弧线、步行、骑行、驾车、公交等。

## 导入

```tsx
import { RouteLayer } from '@antv/aimapui'
import '@antv/aimapui/style.css'
```

## Props

### 路径与数据

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `path` | `[number, number][]` | - | 路径坐标点数组 `[lng, lat]` |
| `segments` | `RouteSegment[]` | - | 路径分段配置，每段可独立设置颜色 |
| `stops` | `RouteStop[]` | - | 站点列表 |
| `routeType` | `RouteType` | `'straight'` | 路径类型 |
| `onRouteQuery` | `(params: RouteQueryParams) => Promise<RouteQueryResult>` | - | 交通路线查询回调 |
| `onRouteResult` | `(result: RouteQueryResult) => void` | - | 路线查询完成回调 |

### 路径视觉

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `color` | `string` | `'#2563eb'` | 路径颜色 |
| `lineWidth` | `number` | `4` | 路径宽度（px） |
| `opacity` | `number` | `0.9` | 路径不透明度 |
| `glow` | `boolean` | `true` | 发光效果 |
| `animate` | `boolean` | `false` | 流动动画 |
| `animateSpeed` | `number` | `1` | 动画速度 |

### 站点视觉

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `stopSize` | `number` | `14` | 站点圆点大小（px） |
| `stopColor` | `string` | 跟随路径色 | 中间站点颜色 |
| `endColor` | `string` | `'#10b981'` | 终点站点颜色 |
| `showStopIndex` | `boolean` | `true` | 是否显示站点序号 |
| `stopRenderer` | `'point' \| 'marker' \| 'icon'` | `'point'` | 停留点渲染模式 |
| `stopMarkerVariant` | `'pin' \| 'circle' \| 'icon' \| 'dot'` | `'circle'` | marker 模式下的默认形态 |
| `stopIconMap` | `Record<string, string>` | - | icon 模式下的图标资源映射 |
| `activeColor` | `string` | `'#fbbf24'` | 悬停高亮颜色 |
| `onPathClick` | `(e: LayerEventPayload) => void` | - | 路径点击事件 |
| `onStopClick` | `(e: LayerEventPayload) => void` | - | 站点点击事件 |

## RouteType — 路径模式

| 值 | 说明 | 是否需要 onRouteQuery |
|------|------|------|
| `'straight'` | 直线连接坐标点（默认） | 否，使用 `path` |
| `'arc'` | 弧线连接，适合长距离路线（如航线） | 否，使用 `path` |
| `'walking'` | 步行路线 | 是 |
| `'cycling'` | 骑行路线 | 是 |
| `'driving'` | 驾车路线 | 是 |
| `'transit'` | 公交路线 | 是 |

## RouteQueryParams

交通路线查询时传给 `onRouteQuery` 的参数，RouteLayer 自动从 stops 的首尾提取起终点。

```typescript
interface RouteQueryParams {
  origin: [number, number];
  destination: [number, number];
  waypoints?: [number, number][];
  routeType: 'walking' | 'cycling' | 'driving' | 'transit';
}
```

## RouteQueryResult

`onRouteQuery` 的返回值，至少返回 `path`。

```typescript
interface RouteQueryResult {
  path: [number, number][];           // 必填：路径坐标
  segments?: RouteSegment[];          // 可选：分段路径（如路况着色）
  stops?: RouteStop[];                // 可选：补充站点（如公交换乘站）
  info?: {
    distance?: number;                // 距离（米）
    duration?: number;                // 时长（秒）
    description?: string;             // 路线描述
  };
}
```

## RouteSegment

```typescript
interface RouteSegment {
  coordinates: [number, number][];
  color?: string;
  width?: number;
}
```

## RouteStop

```typescript
interface RouteStop {
  lng: number;
  lat: number;
  name: string;
  index?: number;
  type?: 'start' | 'end' | 'waypoint';
  icon?: string;
  markerVariant?: 'pin' | 'circle' | 'icon' | 'dot';
  markerColor?: 'primary' | 'success' | 'warning' | 'error';
}
```

## 示例

### 基础路线图

```tsx
<AiMap autoFit map={{ basemap: 'gaode', center: [118, 36], zoom: 6 }}>
  <RouteLayer
    path={[[116.397, 39.908], [117.200, 39.084], [121.473, 31.230]]}
    stops={[
      { lng: 116.397, lat: 39.908, name: '北京' },
      { lng: 117.200, lat: 39.084, name: '天津' },
      { lng: 121.473, lat: 31.230, name: '上海' },
    ]}
    color="#3B82F6"
    glow
    showStopIndex
  />
</AiMap>
```

### 弧线模式（航线）

```tsx
<RouteLayer
  path={[[116.4, 39.9], [121.5, 31.2], [113.3, 23.1]]}
  stops={[
    { lng: 116.4, lat: 39.9, name: '北京' },
    { lng: 121.5, lat: 31.2, name: '上海' },
    { lng: 113.3, lat: 23.1, name: '广州' },
  ]}
  routeType="arc"
  color="#8b5cf6"
  glow
  animate
/>
```

### 驾车路线查询

通过 `onRouteQuery` 回调对接外部路径规划 API（如高德、MapNova），RouteLayer 自动从 stops 提取起终点调用回调。

```tsx
<RouteLayer
  stops={[
    { lng: 116.397, lat: 39.909, name: '天安门' },
    { lng: 116.427, lat: 39.903, name: '王府井' },
    { lng: 116.474, lat: 39.877, name: '国贸' },
  ]}
  routeType="driving"
  onRouteQuery={async ({ origin, destination, waypoints, routeType }) => {
    const res = await fetch(`/api/route?type=${routeType}&origin=${origin}&dest=${destination}`);
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
  glow
  animate
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
      stops: result.transferStops,  // 换乘站自动合并
      info: result.info,
    };
  }}
  color="#f59e0b"
/>
```

## 注意事项

> `routeType` 为 `walking/cycling/driving/transit` 时，`path` 由回调返回，不需要手动传入；仅需传入 `stops` 标注起终点和途经点。
>
> `glow` 会在路径下方叠加发光效果，使路线在深色底图上更醒目。
>
> `showStopIndex` 为 `true` 时，`point` 模式在站点中心绘制编号；`marker/icon` 模式以标签方式补充显示。

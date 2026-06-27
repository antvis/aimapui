# RouteLayer — 路径地图

序列化途经点 + 发光效果 + 分段着色 + 流动动画 + 多路径模式（直线/弧线/交通路线）。

## Basic Usage

```tsx
import { RouteLayer } from '@antv/aimapui';

// 基础用法：静态路径
<RouteLayer
  path={[[120.15, 30.28], [120.17, 30.25], [120.20, 30.22]]}
  stops={[
    { lng: 120.15, lat: 30.28, name: '西湖' },
    { lng: 120.20, lat: 30.22, name: '龙井' },
  ]}
  color="#2563eb"
  lineWidth={4}
  glow={true}
  animate={true}
  showStopIndex={true}
  endColor="#10b981"
  onPathClick={(p) => console.log(p)}
/>

// 弧线模式
<RouteLayer
  path={[[116.4, 39.9], [121.5, 31.2]]}
  stops={[
    { lng: 116.4, lat: 39.9, name: '北京' },
    { lng: 121.5, lat: 31.2, name: '上海' },
  ]}
  routeType="arc"
  color="#8b5cf6"
/>

// 交通路线查询（驾车）
<RouteLayer
  stops={[
    { lng: 116.397, lat: 39.909, name: '天安门' },
    { lng: 116.427, lat: 39.903, name: '王府井' },
    { lng: 116.474, lat: 39.877, name: '国贸' },
  ]}
  routeType="driving"
  onRouteQuery={async (params) => {
    const result = await fetchDrivingRoute(params.origin, params.destination, params.waypoints);
    return { path: result.coordinates };
  }}
  onRouteResult={(result) => console.log('路线信息', result.info)}
  color="#10b981"
/>
```

## Route Types

| 值 | 说明 |
|------|------|
| `'straight'` | 直线连接坐标点（默认） |
| `'arc'` | 弧线连接，适合长距离路线（如航线） |
| `'walking'` | 步行路线，需配合 `onRouteQuery` |
| `'cycling'` | 骑行路线，需配合 `onRouteQuery` |
| `'driving'` | 驾车路线，需配合 `onRouteQuery` |
| `'transit'` | 公交路线，需配合 `onRouteQuery` |

## Route Query Callback

```ts
interface RouteQueryParams {
  origin: [number, number];
  destination: [number, number];
  waypoints?: [number, number][];
  routeType: 'walking' | 'cycling' | 'driving' | 'transit';
}

interface RouteQueryResult {
  path: [number, number][];
  segments?: RouteSegment[];
  stops?: RouteStop[];
  info?: { distance?: number; duration?: number; description?: string };
}
```

## Props

`path`, `segments`, `stops`, `routeType`, `onRouteQuery`, `onRouteResult`, `color`, `lineWidth`, `opacity`, `glow`, `animate`, `animateSpeed`, `stopSize`, `stopColor`, `endColor`, `showStopIndex`, `stopRenderer`, `activeColor`, `onPathClick`, `onStopClick`

## Types

- **RouteStop:** `{ lng, lat, name, index?, type?: 'start' | 'end' | 'waypoint' }`
- **RouteSegment:** `{ coordinates: [number, number][], color?, width? }`

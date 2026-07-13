# RouteLayer — 路径地图

序列化途经点 + 分段着色 + 多路径模式（直线/弧线/交通路线）。

## Examples

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

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `path` | `[number, number][]` | — | 路径坐标 — 完整线坐标 |
| `segments` | `RouteSegment[]` | — | 分段路径（优先级高于 path） |
| `stops` | `RouteStop[]` | `[]` | 途经点列表 |
| `routeType` | `RouteType` | `'straight'` | 路径类型：straight/arc/walking/cycling/driving/transit |
| `onRouteQuery` | `(params) => Promise<RouteQueryResult>` | — | 路线查询回调（walking/cycling/driving/transit 时必填） |
| `onRouteResult` | `(result) => void` | — | 路线查询完成回调 |
| `color` | `string` | `'#2563eb'` | 路径颜色 |
| `lineWidth` | `number` | `4` | 路径宽度 |
| `opacity` | `number` | `0.9` | 路径透明度 |
| `stopSize` | `number` | `14` | 途经点大小 |
| `stopColor` | `string` | 跟随路径色 | 途经点颜色 |
| `endColor` | `string` | `'#10b981'` | 终点颜色 |
| `showStopIndex` | `boolean` | `true` | 是否显示途经点序号 |
| `showStopName` | `boolean` | `true` | 是否显示途经点名称 |
| `stopNameColor` | `string` | `'#334155'` | 名称文字颜色 |
| `stopNameSize` | `number` | `11` | 名称文字大小 |
| `stopRenderer` | `'point' \| 'marker' \| 'icon'` | `'point'` | 停留点渲染模式 |
| `stopMarkerVariant` | `MarkerVariant` | `'circle'` | marker 模式下的默认变体 |
| `stopIconMap` | `Record<string, string>` | — | icon 模式下的图标资源映射 |
| `stopIconField` | `string` | `'iconValue'` | icon 模式下的图标字段名 |
| `stopIconSize` | `number` | `16` | icon 模式下的图标尺寸 |
| `stopIconAnchor` | `IconAnchor` | `'bottom'` | icon 模式下的图标锚点 |
| `showStopPopup` | `boolean` | `true` | 点击途经点时是否显示 Popup |
| `activeColor` | `string` | `'#fbbf24'` | hover 高亮色 |
| `onPathClick` | `(payload) => void` | — | 路径点击回调 |
| `onStopClick` | `(payload) => void` | — | 途经点点击回调 |

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

## Types

- **RouteStop:** `{ lng, lat, name, index?, type?: 'start' | 'end' | 'waypoint' }`
- **RouteSegment:** `{ coordinates: [number, number][], color?, width? }`

## 相关文档

# 复合图层（BubbleLayer / RouteLayer / ArcFlowLayer / GlyphLayer / IconLayer / ChinaDistrict / MarkerClusterLayer / HexagonLayer / FillLayer / SatelliteLayer / TiffRasterLayer）

复合图层是基于基础图层组合的高级业务组件，内置设计规范和最佳实践。

## BubbleLayer — 气泡图

用圆的大小编码数值字段，适合在区域底图上叠加显示数值指标。

```tsx
import { BubbleLayer, BUBBLE_SIZE_LEVELS } from '@antv/aimapui';

<BubbleLayer
  source={cityData}
  sourceType="geojson"
  sizeField="population"
  sizeValues={BUBBLE_SIZE_LEVELS}  // [8, 16, 32, 48, 64]
  color="#2563eb"
  labelField="name"
  labelTrigger="hover"          // 'always' | 'hover'，大数据量用 hover
  hoverEffect={true}            // 默认启用
  clickEffect={true}            // 默认启用
  tooltipEffect={true}          // 默认启用
  semanticColorField="status"   // 按 primary/warning/error/success 着色
/>
```

**专有属性：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `labelField` | `string` | `'name'` | 标签字段 |
| `labelColor` | `string` | `'#0b3b8c'` | 标签颜色 |
| `labelSize` | `number` | `12` | 标签字号 |
| `showLabel` | `boolean` | `true` | 是否显示标签 |
| `labelTrigger` | `'always' \| 'hover'` | `'always'` | 标签触发方式 |
| `bubbleAnchor` | `BubbleAnchor` | `'bottom'` | 气泡锚点 |
| `labelAnchor` | `BubbleAnchor` | `'top'` | 标签锚点 |
| `hoverEffect` | `boolean` | `true` | hover 高亮 |
| `clickEffect` | `boolean` | `true` | click 选中 |
| `tooltipEffect` | `boolean` | `true` | 点击弹窗 |
| `tooltipFields` | `string[]` | — | 弹窗展示字段 |
| `tooltipTemplate` | `string` | — | 弹窗模板 `{{field}}` |
| `semanticColorField` | `string` | — | 语义色板字段 |

**内置常量：**
- `BUBBLE_SIZE_LEVELS = [8, 16, 32, 48, 64]`
- `BUBBLE_QUALITATIVE_COLORS = { primary: '#2563eb', warning: '#f59e0b', error: '#ef4444', success: '#10b981' }`

> **何时选择：** 需要大小编码时用 BubbleLayer；只需颜色分类用 PointLayer；热力渐变用 HeatmapLayer。

## RouteLayer — 路径地图

序列化途经点 + 发光效果 + 分段着色 + 流动动画 + 多路径模式（直线/弧线/交通路线）。

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
    // 调用高德/MapNova 等路径规划 API
    const result = await fetchDrivingRoute(params.origin, params.destination, params.waypoints);
    return { path: result.coordinates };
  }}
  onRouteResult={(result) => console.log('路线信息', result.info)}
  color="#10b981"
/>
```

**路径模式（routeType）：**

| 值 | 说明 |
|------|------|
| `'straight'` | 直线连接坐标点（默认） |
| `'arc'` | 弧线连接，适合长距离路线（如航线） |
| `'walking'` | 步行路线，需配合 `onRouteQuery` |
| `'cycling'` | 骑行路线，需配合 `onRouteQuery` |
| `'driving'` | 驾车路线，需配合 `onRouteQuery` |
| `'transit'` | 公交路线，需配合 `onRouteQuery` |

**交通路线查询回调：**

```ts
interface RouteQueryParams {
  origin: [number, number];
  destination: [number, number];
  waypoints?: [number, number][];
  routeType: 'walking' | 'cycling' | 'driving' | 'transit';
}

interface RouteQueryResult {
  path: [number, number][];
  segments?: RouteSegment[];   // 可选：分段路径（路况着色）
  stops?: RouteStop[];         // 可选：途中补充站点（如换乘站）
  info?: { distance?: number; duration?: number; description?: string };
}
```

**专有属性：** `path`, `segments`, `stops`, `routeType`, `onRouteQuery`, `onRouteResult`, `color`, `lineWidth`, `opacity`, `glow`, `animate`, `animateSpeed`, `stopSize`, `stopColor`, `endColor`, `showStopIndex`, `stopRenderer`, `activeColor`, `onPathClick`, `onStopClick`

**RouteStop:** `{ lng, lat, name, index?, type?: 'start' | 'end' | 'waypoint' }`

**RouteSegment:** `{ coordinates: [number, number][], color?, width? }`

## ArcFlowLayer — 弧线流向图

OD 数据弧线动画，支持 3 种弧线形态、3 种颜色模式、权重映射、节点脉冲动画。

```tsx
import { ArcFlowLayer } from '@antv/aimapui';

// 单色模式
<ArcFlowLayer
  source={odData}
  sourceConfig={{ x: 'fromLng', y: 'fromLat', x1: 'toLng', y1: 'toLat' }}
  color="#5B8FF9"
  lineWidth={2}
  animate animateSpeed={1} animateTrailLength={0.3}
  showNodes nodePulse
/>

// 渐变模式
<ArcFlowLayer
  source={odData}
  sourceConfig={{ x: 'fromLng', y: 'fromLat', x1: 'toLng', y1: 'toLat' }}
  colorMode="gradient"
  gradientColors={['#2563eb', '#10b981']}
  lineWidthRange={[1, 5]}
  weightField="flow"
  animate
/>

// 字段映射色板
<ArcFlowLayer
  source={odData}
  sourceConfig={{ x: 'fromLng', y: 'fromLat', x1: 'toLng', y1: 'toLat' }}
  colorMode="field"
  colorField="category"
  colorValues={['#f59e0b', '#2563eb', '#10b981']}
  shape="arc3d"
/>
```

**ArcShape:** `'arc'` | `'arc3d'` | `'greatcircle'`

**ArcColorMode:** `'single'` | `'gradient'` | `'field'`

**ArcFlowDataItem:**
```ts
interface ArcFlowDataItem {
  fromLng: number; fromLat: number;
  toLng: number; toLat: number;
  weight?: number;
  fromName?: string; toName?: string;
  [key: string]: unknown;
}
```

**专有属性：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `ArcFlowDataItem[] \| string` | **必填** | OD 数据源 |
| `sourceType` | `'json' \| 'csv'` | `'json'` | 数据类型 |
| `sourceConfig` | `{ x?, y?, x1?, y1? }` | — | 字段映射 |
| `shape` | `ArcShape` | `'arc'` | 弧线形态 |
| `color` | `string` | `'#2563EB'` | 单色模式颜色 |
| `colorMode` | `ArcColorMode` | `'single'` | 颜色模式 |
| `gradientColors` | `[string, string]` | — | 渐变起终色 |
| `colorField` | `string` | — | 字段映射色板字段名 |
| `colorValues` | `string[]` | — | 字段映射色板值 |
| `lineWidth` | `number` | `1.5` | 弧线宽度 |
| `lineWidthRange` | `[number, number]` | — | 按权重映射宽度范围 |
| `weightField` | `string` | `'weight'` | 权重字段名 |
| `opacity` | `number` | `0.8` | 弧线透明度 |
| `blur` | `number` | `0.6` | 弧线模糊度 |
| `animate` | `boolean` | `false` | 是否启用流动动画 |
| `animateSpeed` | `number` | `1` | 动画速度 |
| `animateTrailLength` | `number` | `0.3` | 尾迹长度 0~1 |
| `animateDuration` | `number` | `2000` | 动画持续时间(ms) |
| `showNodes` | `boolean` | `true` | 显示起终点节点 |
| `nodeColor` | `string` | — | 节点颜色（默认跟随弧线） |
| `nodeSize` | `number` | `4` | 节点大小 |
| `nodeSizeRange` | `[number, number]` | — | 按权重映射节点大小 |
| `nodePulse` | `boolean` | `false` | 节点呼吸脉冲动画 |
| `showTooltip` | `boolean` | `true` | hover 弧线显示 Tooltip |
| `showNodePopup` | `boolean` | `true` | 点击节点显示 Popup |
| `activeColor` | `string` | — | hover 高亮色 |
| `onArcHover` | `(payload) => void` | — | 弧线 hover 事件 |
| `onArcClick` | `(payload) => void` | — | 弧线点击事件 |
| `onNodeClick` | `(payload) => void` | — | 节点点击事件 |

## GlyphLayer — 图标字体图层

Material Symbols 图标标注。

```tsx
import { GlyphLayer } from '@antv/aimapui';

<GlyphLayer
  source={poiData}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="iconType"
  iconValues={['restaurant', 'hotel', 'parking']}
  labelField="name"
  labelAnchor="top"
/>
```

> **注意：** `BUILTIN_ICON_FONTS` 已移除，图标字体由组件内部自动管理（内嵌 Material Symbols Outlined @font-face）。

## IconLayer — 图标图片图层

自定义图片图标。

```tsx
import { IconLayer } from '@antv/aimapui';

<IconLayer
  source={poiData}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="iconType"
  iconValues={{ airport: 'https://example.com/airport.png' }}
  iconAnchor="bottom"
/>
```

## ChinaDistrict — 行政区划下钻

省市区三级下钻 + 业务数据关联色阶映射。通过 Join 字段将业务数据与区划形状绑定。

```tsx
import { ChinaDistrict, ADMIN_SEQUENTIAL_COLORS } from '@antv/aimapui';

// 按名称匹配业务数据
<ChinaDistrict
  data={[
    { name: '广东省', value: 145847 },
    { name: '江苏省', value: 128222 },
  ]}
  joinField="name"          // GeoJSON feature.properties 中的匹配字段
  dataJoinField="name"      // 业务数据中的匹配字段
  valueField="value"        // 用于色阶映射的数值字段
  colors={['#DBEAFE', '#3B82F6', '#1E3A8A']}
  onRegionClick={(feature, level) => console.log(feature, level)}
/>

// 按行政区划编码匹配
<ChinaDistrict
  data={[{ code: '440000', amount: 8900 }]}
  joinField="adcode"
  dataJoinField="code"
  valueField="amount"
/>
```

**业务数据绑定机制：**

| Prop | 默认值 | 作用 |
|------|--------|------|
| `joinField` | `'name'` | GeoJSON feature.properties 中用于匹配的字段 |
| `dataJoinField` | `'name'` | 业务数据中用于匹配的字段 |
| `valueField` | `'value'` | 业务数据中用于色阶映射的数值字段 |

**内置 GeoJSON properties 可用匹配字段：**

| 字段 | 格式 | 示例 |
|------|------|------|
| `name` | 中文全称 | `"广东省"` / `"深圳市"` / `"南山区"` |
| `gb` | 9位国标码 | `"156440000"`（"156" + 6位行政编码） |

> 使用 `adcode` 匹配时，组件自动处理 "156" 前缀，传 6 位码（如 `"440000"`）即可。

**BusinessDataItem:**
```ts
interface BusinessDataItem {
  name?: string;            // 匹配用名称
  adcode?: string | number; // 匹配用行政编码
  value?: number;           // 色阶数值
  [key: string]: unknown;   // 可扩展
}
```

**内置数据源：** `DEFAULT_PROVINCE_SOURCE`（34省）, `DEFAULT_CITY_SOURCE`（375市）, `DEFAULT_DISTRICT_SOURCE`（2891区县）

**DrillPathNode:** `{ level: 'province' | 'city' | 'district', name: string, adcode?: string | number }`

## MarkerClusterLayer — 聚合标注

```tsx
<MarkerClusterLayer
  source={bikePoints}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  colorField="count"
  colorValues={['#5B8FF9', '#F6BD16']}
  size={20}
  clusterRadius={80}
/>
```

## HexagonLayer — 蜂窝热力

```tsx
<HexagonLayer
  source={points}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  colorField="count"
  colorValues={['#f0f9e8', '#bae4bc', '#7bccc4', '#43a2ca', '#0868ac']}
  size={30}
/>
```

## FillLayer — 区域填充

```tsx
<FillLayer
  source={geojsonData}
  sourceType="geojson"
  colorField="density"
  colorValues={['#f7fbff', '#c6dbef', '#6baed6', '#2171b5', '#08306b']}
  active={{ color: '#60a5fa' }}
/>
```

## SatelliteLayer — 卫星影像

```tsx
import { SatelliteLayer, SATELLITE_PROVIDER_NAMES } from '@antv/aimapui';

<SatelliteLayer provider="gaode" token="your-token" opacity={0.8} />
```

**provider:** `'gaode'` | `'tianditu'`

## TiffRasterLayer — GeoTIFF 栅格

```tsx
<TiffRasterLayer
  source="https://example.com/dem.tif"
  rampColors={{ 0: '#f7fbff', 500: '#c6dbef', 1000: '#6baed6', 2000: '#2171b5', 4000: '#08306b' }}
  renderMode="continuous"    // 'continuous' | 'discrete'
/>
```

**RampColors:** `Record<number, string>` — 值到颜色的映射

## 相关文档

- [base-layers.md](../layers/base-layers.md) — 基础图层
- [schema-system.md](../schema/schema-system.md) — Schema 系统
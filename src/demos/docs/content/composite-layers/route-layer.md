# RouteLayer

路线图组件，支持编号站点、发光路径、分段着色和流动动画。适用于出行路线、航班轨迹等场景。

## 导入

```tsx
import { RouteLayer } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `path` | `[number, number][]` | **必填** | 路径坐标点数组 `[lng, lat]` |
| `segments` | `RouteSegment[]` | - | 路径分段配置，每段可独立设置颜色 |
| `stops` | `RouteStop[]` | - | 站点列表 |
| `color` | `string` | `'#3B82F6'` | 路径颜色 |
| `lineWidth` | `number` | `4` | 路径宽度（px） |
| `opacity` | `number` | `1` | 路径不透明度 |
| `glow` | `boolean \| object` | `false` | 发光效果配置 |
| `animate` | `boolean \| object` | `false` | 流动动画配置 |
| `animateSpeed` | `number` | `1` | 动画速度 |
| `stopSize` | `number` | `8` | 站点圆点大小（px） |
| `stopColor` | `string` | `'#3B82F6'` | 中间站点颜色 |
| `endColor` | `string` | `'#EF4444'` | 终点站点颜色 |
| `showStopIndex` | `boolean` | `true` | 是否显示站点序号 |
| `activeColor` | `string` | `'#F59E0B'` | 悬停高亮颜色 |
| `onPathClick` | `(e: LayerEvent) => void` | - | 路径点击事件 |
| `onStopClick` | `(stop: RouteStop, index: number) => void` | - | 站点点击事件 |

## RouteSegment

```typescript
interface RouteSegment {
  startIndex: number;  // 起始点索引
  endIndex: number;    // 结束点索引
  color?: string;      // 该段颜色
}
```

## RouteStop

```typescript
interface RouteStop {
  lng: number;        // 经度
  lat: number;        // 纬度
  name?: string;      // 站点名称
  index?: number;     // 站点序号
}
```

## 示例

### 基础路线图

```tsx
const path = [
  [116.397, 39.908],  // 北京
  [117.200, 39.084],  // 天津
  [121.473, 31.230],  // 上海
];

const stops = [
  { lng: 116.397, lat: 39.908, name: '北京' },
  { lng: 117.200, lat: 39.084, name: '天津' },
  { lng: 121.473, lat: 31.230, name: '上海' },
];

<AiMap map={{ basemap: 'gaode', center: [118, 36], zoom: 6, token }}>
  <RouteLayer path={path} stops={stops} color="#3B82F6" showStopIndex />
</AiMap>
```

### 发光路线 + 流动动画

```tsx
<AiMap map={{ basemap: 'gaode', center: [118, 36], zoom: 6, token }}>
  <RouteLayer
    path={path}
    stops={stops}
    color="#10B981"
    lineWidth={5}
    glow
    animate={{ enable: true, speed: 1.5, trailLength: 0.4 }}
    stopColor="#10B981"
    endColor="#EF4444"
  />
</AiMap>
```

### 分段着色

```tsx
const segments = [
  { startIndex: 0, endIndex: 1, color: '#3B82F6' },
  { startIndex: 1, endIndex: 2, color: '#F59E0B' },
];

<AiMap map={{ basemap: 'gaode', center: [118, 36], zoom: 6, token }}>
  <RouteLayer
    path={path}
    stops={stops}
    segments={segments}
    lineWidth={4}
    showStopIndex
  />
</AiMap>
```

## 注意事项

> 💡 `glow` 属性会在路径下方叠加一层发光效果，使路线在深色底图上更加醒目。
> 
> 📎 `showStopIndex` 为 `true` 时，起点显示绿色圆点，终点显示红色圆点，中间站点显示序号。
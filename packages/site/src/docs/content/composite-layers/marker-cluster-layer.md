# MarkerClusterLayer

标注聚合图层，基于 supercluster 实现空间聚合。自动将密集点位聚合为三级视觉圆（小/中/大），支持点击展开和蜘蛛图布局，适合大量 POI 标注的场景。

> **何时选择：** 点位数量超过数百个、在低缩放级别下会严重重叠时，用 MarkerClusterLayer 自动聚合；如果点位不多或需要始终展示每个点位，直接用 [IconLayer](./icon-layer) 或 [PointLayer](../layers/point-layer)。

## 导入

```tsx
import { MarkerClusterLayer } from '@antv/aimapui';
```

## Props

### 数据源

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `unknown` | **必填** | 数据源，支持 GeoJSON 或 JSON 数组 |
| `sourceType` | `'json' \| 'geojson' \| 'csv'` | `'geojson'` | 数据源类型 |
| `sourceConfig` | [SourceConfig](../layers/point-layer#sourceconfig) | - | `sourceType='json'` 时的经纬度字段映射 |

### 聚合配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `gridSize` | `number` | `60` | 聚合半径（像素），对应 supercluster 的 radius 参数，值越大聚合越激进 |
| `minClusterSize` | `number` | `2` | 形成聚合的最小点数，低于此值的邻近点不聚合 |
| `animationDuration` | `number` | `300` | 缩放时聚合/展开动画时长（ms） |
| `easing` | `string` | - | 动画缓动函数名 |

### 交互事件

| 属性 | 类型 | 说明 |
|------|------|------|
| `onPointClick` | `(point: ClusterPoint) => void` | 点击单个未聚合点位的回调 |
| `onClusterClick` | `(cluster: ClusterItem, leaves?: any[]) => void` | 点击聚合点的回调，`leaves` 为聚合包含的所有原始要素 |

### 类型定义

```typescript
interface ClusterPoint {
  id: string;
  lng: number;
  lat: number;
  properties: Record<string, unknown>;
}

interface ClusterItem {
  id: string;
  clusterId: number;     // supercluster 分配的 cluster ID
  lng: number;
  lat: number;
  pointCount: number;    // 聚合包含的点数
  isCluster: boolean;
  properties: Record<string, unknown>;
}
```

## 示例

### 基础用法

```tsx
import { AiMap, MarkerClusterLayer } from '@antv/aimapui';

<AiMap map={{ basemap: 'gaode', center: [116.4, 39.9], zoom: 10 }}>
  <MarkerClusterLayer
    source={pois}
    sourceType="json"
    sourceConfig={{ x: 'lng', y: 'lat' }}
    gridSize={60}
    minClusterSize={2}
  />
</AiMap>
```

### 带交互回调

```tsx
<MarkerClusterLayer
  source={pois}
  sourceType="json"
  sourceConfig={{ x: 'lng', y: 'lat' }}
  onPointClick={(point) => {
    console.log('点击单点:', point.properties.name);
  }}
  onClusterClick={(cluster, leaves) => {
    console.log(`聚合点包含 ${cluster.pointCount} 个要素`);
    console.log('展开的子要素:', leaves);
  }}
/>
```

## 视觉分级规则

| 规模 | 点数范围 | 视觉表现 |
|------|---------|---------|
| 小规模 | 2-99 | 小圆 |
| 中规模 | 100-999 | 中圆 |
| 大规模 | 1000+ | 大圆 |

## 注意事项

- `gridSize` 值越大，远景下聚合越积极，近景展开也越晚；建议 40-80 之间调整
- 在最大缩放级别仍有重叠时，组件会使用蜘蛛图布局展开聚合点
- 底层使用 DOM Marker 渲染，适合万级以下数据量；超大规模数据建议配合服务端聚合

## 相关组件

- [IconLayer](./icon-layer) — 图片图标标注图层（不聚合）
- [PointLayer](../layers/point-layer) — 基础点图层
- [BubbleLayer](./bubble-layer) — 气泡图层

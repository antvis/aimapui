# MarkerClusterLayer — 聚合标注

基于 [supercluster](https://github.com/mapbox/supercluster) 的点聚合标注复合图层，使用 Marker 组件渲染 DOM 元素，支持三级视觉分级、点击缩放展开和 Spiderfier 蜘蛛布局。不使用 L7 图层渲染，而是通过 DOM Marker 实现。

## Examples

```tsx
import { MarkerClusterLayer } from '@antv/aimapui';

// 基础用法：GeoJSON 点聚合
<MarkerClusterLayer
  source={geojsonData}
  sourceType="geojson"
  gridSize={60}
  minClusterSize={2}
  onPointClick={(point) => console.log('point clicked:', point.properties?.name)}
  onClusterClick={(cluster, leaves) => {
    console.log(`cluster clicked: ${cluster.pointCount} points`);
  }}
/>

// JSON 数组数据
<MarkerClusterLayer
  source={bikePoints}
  sourceType="json"
  sourceConfig={{ x: 'lng', y: 'lat' }}
  gridSize={80}
  minClusterSize={3}
  animationDuration={500}
  onPointClick={(point) => showDetail(point)}
/>
```

## 视觉分级

| 规模 | 数量 | 大小 | 字号 | 样式 |
|------|------|------|------|------|
| 小规模 | 2-99 | 32px | 12px / 600 | 径向渐变 + 浅蓝边框 |
| 中规模 | 100-999 | 40px | 13px / 700 | 半透明蓝色 + 白色边框 |
| 大规模 | 1000+ | 48px | 14px / 700 | 渐变 + 脉冲动画 + 双层阴影 |

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `GeoJSON \| object[]` | **必填** | 数据源 |
| `sourceType` | `string` | `'geojson'` | 数据类型（`'geojson'` 或 `'json'`） |
| `sourceConfig` | `{ x?, y? }` | — | 字段映射（JSON 数据时指定经纬度字段名） |
| `gridSize` | `number` | `60` | 聚合半径（像素），对应 supercluster 的 radius |
| `minClusterSize` | `number` | `2` | 形成聚合的最小点数 |
| `animationDuration` | `number` | `300` | 展开动画持续时间（ms） |
| `easing` | `string` | `'cubic-bezier(0.4, 0, 0.2, 1)'` | 动画缓动函数 |
| `onPointClick` | `(point) => void` | — | 单点点击回调 |
| `onClusterClick` | `(cluster, leaves?) => void` | — | 聚合点点击回调 |

## 交互行为

- **点击聚合点**：自动缩放至该聚合包含的点范围内（`fitBounds`）
- **最大级别点击**：展开为 Spiderfier 蜘蛛布局（子点沿圆周分布 + 连接线）
- **再次点击**：收起 Spiderfier
- **hover**：聚合点放大 1.1 倍

## 性能

- 使用 supercluster R-tree 空间索引，O(log n) 查询
- 仅在 zoom 变化时重新聚合，平移时仅更新 DOM 位置
- Spiderfier 连接线使用 ref + 直接 DOM 操作，避免 React 重渲染

## 相关文档

- [index.md](index.md) — 复合图层概览
# MarkerClusterLayer

标注聚合图层，基于 supercluster 实现，三级视觉（小/中/大），支持点击展开和蜘蛛图布局。

## 导入

```tsx
import { MarkerClusterLayer } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `source` | `any` | - | 数据源（必填） |
| `sourceType` | `string` | `'geojson'` | 数据源类型 |
| `sourceConfig` | `object` | - | 数据源配置 |
| `gridSize` | `number` | `60` | 聚合网格大小（px） |
| `minClusterSize` | `number` | `2` | 最小聚合点数 |
| `animationDuration` | `number` | - | 动画时长（ms） |
| `easing` | `function` | - | 动画缓动函数 |
| `onPointClick` | `function` | - | 单点点击回调 |
| `onClusterClick` | `function` | - | 聚合点点击回调 |

## 示例

```tsx
<MarkerClusterLayer source={pois} gridSize={60} minClusterSize={2} onPointClick={(e) => console.log(e)} onClusterClick={(e) => console.log(e)} />
```

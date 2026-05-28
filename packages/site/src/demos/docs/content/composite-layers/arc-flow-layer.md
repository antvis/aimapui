# ArcFlowLayer

弧线流向图层，用于 OD（Origin-Destination）数据的可视化表达——如城市间的人口迁移、航线货运、资金流动等。内置起终节点标注、流动动画和悬停高亮，一条配置即可输出比 [LineLayer](../layers/line-layer) 的 `arc` 模式更丰富的流向图效果。

> **何时选择：** 需要 OD 弧线 + 内置动画 + 起终节点标注的完整方案时用 ArcFlowLayer；只需简单的点到点弧线、不需要节点和动画时用 [LineLayer](../layers/line-layer)（`shape='arc'`）；需要纯线段/边界线时也用 [LineLayer](../layers/line-layer)（`shape='line'`）。

## 导入

```tsx
import { ArcFlowLayer } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `source` | `ArcFlowDataItem[] \| string` | **必填** | OD 数据源，JSON 数组或 URL |
| `sourceType` | `'json' \| 'csv'` | `'json'` | 数据源类型 |
| `sourceConfig` | `{ x?, y?, x1?, y1? }` | `{ x:'fromLng', y:'fromLat', x1:'toLng', y1:'toLat' }` | 字段映射配置 |
| `shape` | `'arc' \| 'arc3d' \| 'greatcircle'` | `'arc'` | 弧线形态 |
| `color` | `string` | `'#2563EB'` | 单色模式颜色 |
| `colorMode` | `'single' \| 'gradient' \| 'field'` | `'single'` | 颜色模式 |
| `colorField` | `string` | - | 字段映射色板时的字段名 |
| `colorValues` | `string[]` | - | 字段映射色板值 |
| `gradientColors` | `[string, string]` | - | 渐变模式下的起止颜色 |
| `lineWidth` | `number` | `1.5` | 弧线宽度（px） |
| `lineWidthRange` | `[number, number]` | - | 按权重映射宽度范围 |
| `weightField` | `string` | `'weight'` | 权重字段名 |
| `opacity` | `number` | `0.8` | 弧线透明度（0~1） |
| `blur` | `number` | `0.6` | 弧线模糊度 |
| `animate` | `boolean` | `false` | 是否启用流动动画 |
| `animateSpeed` | `number` | `1` | 动画速度 |
| `animateTrailLength` | `number` | `0.3` | 动画尾迹长度（0~1） |
| `animateDuration` | `number` | `2000` | 动画持续时间（ms） |
| `showNodes` | `boolean` | `true` | 是否显示起终点节点 |
| `nodeColor` | `string` | 跟随 `color` | 节点颜色 |
| `nodeSize` | `number` | `4` | 节点大小 |
| `nodeSizeRange` | `[number, number]` | - | 节点大小按权重映射范围 |
| `nodePulse` | `boolean` | `false` | 节点是否显示脉冲呼吸动画 |
| `activeColor` | `string` | `'#FFD93D'` | 悬停高亮颜色 |
| `style` | `Record<string, unknown>` | - | 额外样式配置 |
| `onArcHover` | `(payload: LayerEventPayload) => void` | - | 弧线悬停事件 |
| `onArcClick` | `(payload: LayerEventPayload) => void` | - | 弧线点击事件 |
| `onNodeClick` | `(payload: LayerEventPayload) => void` | - | 节点点击事件 |

## ArcFlowDataItem

```typescript
interface ArcFlowDataItem {
  fromLng: number;   // 起点经度
  fromLat: number;   // 起点纬度
  toLng: number;     // 终点经度
  toLat: number;     // 终点纬度
  weight?: number;   // 权重/流量值
  fromName?: string; // 起点名称
  toName?: string;   // 终点名称
  [key: string]: unknown; // 其他业务字段
}
```

## 示例

### 基础弧线图

```tsx
const data = [
  { fromLng: 116.397, fromLat: 39.908, toLng: 121.473, toLat: 31.230 },
  { fromLng: 116.397, fromLat: 39.908, toLng: 113.264, toLat: 23.129 },
];

<AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 4, token }}>
  <ArcFlowLayer source={data} color="#2563EB" lineWidth={1.5} />
</AiMap>
```

### 渐变弧线 + 流动动画

```tsx
<AiMap map={{ basemap: 'gaode', center: [110, 35], zoom: 4, token }}>
  <ArcFlowLayer
    source={flowData}
    shape="arc3d"
    colorMode="gradient"
    gradientColors={['#2563EB', '#FFD93D']}
    lineWidth={3}
    animate
    animateSpeed={1}
    animateTrailLength={0.3}
    showNodes
    nodePulse
  />
</AiMap>
```

### 字段映射颜色

```tsx
<AiMap map={{ basemap: 'gaode', center: [110, 35], zoom: 4, token }}>
  <ArcFlowLayer
    source={flowData}
    colorMode="field"
    colorField="volume"
    colorValues={['#DBEAFE', '#2563EB', '#1E3A8A']}
    lineWidth={1.5}
    weightField="weight"
    lineWidthRange={[1, 6]}
  />
</AiMap>
```

## 注意事项

> 💡 弧线形状 `greatcircle` 适用于长距离航线，会产生更真实的大圆弧效果。

> ⚠️ 动画性能受弧线数量影响，建议数据量超过 1000 条时谨慎使用流动动画。

> 💡 `sourceConfig` 用于自定义字段映射，默认使用 `fromLng/fromLat/toLng/toLat`，如果你的数据字段不同可以覆盖。
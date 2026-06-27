# ArcFlowLayer — 弧线流向图

OD 数据弧线动画，支持 3 种弧线形态、3 种颜色模式、权重映射、节点脉冲动画。

## Examples

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

## Enums

- **ArcShape:** `'arc'` | `'arc3d'` | `'greatcircle'`
- **ArcColorMode:** `'single'` | `'gradient'` | `'field'`

## Data Format

```ts
interface ArcFlowDataItem {
  fromLng: number; fromLat: number;
  toLng: number; toLat: number;
  weight?: number;
  fromName?: string; toName?: string;
  [key: string]: unknown;
}
```

## Props

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

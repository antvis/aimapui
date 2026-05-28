# SatelliteLayer

卫星影像图层，支持高德、天地图、Google 卫星源。

## 导入

```tsx
import { SatelliteLayer } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `provider` | `'gaode' \| 'tianditu' \| 'google'` | `'gaode'` | 卫星图提供商 |
| `zIndex` | `number` | - | 图层层级 |
| `opacity` | `number` | `1` | 透明度 |
| `tiandituToken` | `string` | - | 天地图 token |
| `visible` | `boolean` | `true` | 是否可见 |

## 示例

```tsx
<SatelliteLayer provider="gaode" opacity={0.8} />
```

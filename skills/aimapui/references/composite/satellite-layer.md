# SatelliteLayer — 卫星影像

卫星影像底图复合图层，支持高德、天地图、谷歌三种卫星影像切换。底层使用 RasterLayer 的 rasterTile 模式渲染瓦片。

## Examples

```tsx
import { SatelliteLayer, SATELLITE_PROVIDER_NAMES } from '@antv/aimapui';

// 高德卫星（默认）
<SatelliteLayer provider="gaode" />

// 天地图卫星（需 token）
<SatelliteLayer
  provider="tianditu"
  tiandituToken="your-tianditu-token"
  opacity={0.9}
/>

// 谷歌卫星
<SatelliteLayer provider="google" opacity={0.8} zIndex={0} />

// 隐藏/显示切换
<SatelliteLayer provider="gaode" visible={showSatellite} />
```

## Enums

- **SatelliteProvider:** `'gaode'` | `'tianditu'` | `'google'`

## Built-in Constants

```ts
import { SATELLITE_PROVIDER_NAMES } from '@antv/aimapui';
// { gaode: '高德卫星', tianditu: '天地图卫星', google: '谷歌卫星' }
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `provider` | `SatelliteProvider` | `'gaode'` | 影像提供商 |
| `zIndex` | `number` | `0` | 图层层级（底层） |
| `opacity` | `number` | `1` | 图层透明度 0~1 |
| `tiandituToken` | `string` | — | 天地图 token（仅 tianditu 需要，有内置默认值） |
| `visible` | `boolean` | `true` | 图层可见性 |

## 瓦片源

| 提供商 | 瓦片 URL |
|--------|----------|
| 高德 | `https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}` |
| 天地图 | `https://t{0-7}.tianditu.gov.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}&tk={token}` |
| 谷歌 | `https://gwxc.shipxy.com/tile.g?z={z}&x={x}&y={y}` |

## 使用建议

- 通常作为底图使用，`zIndex` 设为 0
- 与业务图层叠加时，透传 `opacity` 控制底图透明度
- 高德卫星无需 token，开箱即用

## 相关文档

- [index.md](index.md) — 复合图层概览
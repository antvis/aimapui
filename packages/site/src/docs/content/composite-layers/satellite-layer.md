# SatelliteLayer

卫星影像图层，快捷叠加卫星底图。内置高德、天地图、Google 三种影像源，一行代码即可使用，无需自行配置瓦片 URL。

> **何时选择：** 需要快速叠加卫星影像底图时用 SatelliteLayer；需要加载自定义栅格瓦片服务时用 [RasterLayer](../layers/raster-layer)。

## 导入

```tsx
import { SatelliteLayer } from '@antv/aimapui';
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `provider` | `'gaode' \| 'tianditu' \| 'google'` | `'gaode'` | 卫星影像提供商 |
| `zIndex` | `number` | `0` | 图层层级，值越大越靠上 |
| `opacity` | `number` | `1` | 图层透明度 (0~1) |
| `tiandituToken` | `string` | 内置默认值 | 天地图 token，仅 `provider='tianditu'` 时需要 |
| `visible` | `boolean` | `true` | 是否可见 |

## 提供商对比

| 提供商 | 覆盖范围 | 分辨率 | 是否需要 Token | 备注 |
|--------|---------|--------|---------------|------|
| `gaode` | 中国为主 | 高 | 否 | 默认推荐，国内加载快 |
| `tianditu` | 全球 | 中 | 是（有内置默认值） | 国家地理信息公共服务平台 |
| `google` | 全球 | 高 | 否 | 国内可能需要代理 |

## 示例

### 基础用法 — 高德卫星

```tsx
import { AiMap, SatelliteLayer } from '@antv/aimapui';

<AiMap map={{ basemap: 'gaode', center: [116.4, 39.9], zoom: 12 }}>
  <SatelliteLayer />
</AiMap>
```

### 切换提供商

```tsx
// 天地图卫星
<SatelliteLayer provider="tianditu" />

// Google 卫星
<SatelliteLayer provider="google" />

// 自定义天地图 token
<SatelliteLayer provider="tianditu" tiandituToken="YOUR_TIANDITU_TOKEN" />
```

### 半透明叠加

在标准底图上半透明叠加卫星影像，同时保留路网和标注：

```tsx
<AiMap map={{ basemap: 'gaode', center: [116.4, 39.9], zoom: 14 }}>
  <SatelliteLayer provider="gaode" opacity={0.6} />
</AiMap>
```

## 注意事项

- `provider='gaode'` 是默认推荐选项，国内网络环境下加载速度最优
- `provider='google'` 在中国大陆可能无法直接访问，请确认网络环境
- `provider='tianditu'` 内置了默认 token，生产环境建议替换为自己申请的 token（[申请地址](https://console.tianditu.gov.cn/)）
- SatelliteLayer 底层基于 [RasterLayer](../layers/raster-layer) 实现，如需更灵活的瓦片配置请直接使用 RasterLayer

## 相关组件

- [RasterLayer](../layers/raster-layer) — 通用栅格瓦片图层
- [TiffRasterLayer](./tiff-raster-layer) — GeoTIFF 科学数据图层
- [MapThemeControl](../controls/map-theme-control) — 地图主题切换控件

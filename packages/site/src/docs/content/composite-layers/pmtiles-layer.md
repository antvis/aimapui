# PMTilesLayer

基于 [PMTiles](https://github.com/protomaps/PMTiles) 单文件瓦片归档协议的栅格瓦片图层组件。

通过 L7 的 `RasterLayer` 瓦片图层渲染，整条取数与渲染链路运行在 L7 的 WebGL 层，
**与底图引擎无关**：高德（GaodeMap）/ MapLibre / Mapbox 等任意底图下均可工作；
**使用高德底图时无需配置 token**（组件内置默认 token 可用）。

组件内部按 (z, x, y) 调用 `PMTiles.getZxy` 经 HTTP Range 请求按需读取瓦片字节，
交由 L7 `RasterLayer` 的 `getCustomData` 钩子解码为图像并贴片渲染。当前支持：

- ✅ 栅格影像瓦片（PNG / JPEG / WebP / AVIF）
- ✅ 地形高程瓦片（TerrainRGB，色带映射）
- ⏳ 矢量瓦片（MVT）暂不支持

## 导入

```tsx
import { PMTilesLayer } from '@antv/aimapui'
```

## 特性

- ✅ 底图无关：高德 / maplibre / mapbox 通用，高德无需 token
- ✅ `sourceType: 'auto'` 自动读取文件头 `tileType` 判断栅格类型
- ✅ 栅格影像直接贴片；地形高程支持自定义色带（rampColors）与值域（domain）
- ✅ `fitBounds` 自动定位到归档范围
- ✅ `opacity` / `visible` 增量更新，不重建图层、无闪烁

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `url` | `string` | **必填** | PMTiles 文件 URL，内部按 (z,x,y) 调 `getZxy` 取瓦片字节 |
| `sourceType` | `'raster' \| 'raster-dem' \| 'vector' \| 'auto'` | `'auto'` | 源类型；`auto` 时读文件头 `tileType` 判断（raster-dem 需显式指定） |
| `domain` | `[number, number]` | - | 高程值域 `[min, max]`，仅 raster-dem 生效 |
| `rampColors` | `PMTilesRampColors` | 内置地形色带 | 色带配置，仅 raster-dem 生效 |
| `noDataValue` | `number` | `0` | 无数据值，仅 raster-dem 生效 |
| `clampLow` | `boolean` | `false` | 低值截断，仅 raster-dem 生效 |
| `clampHigh` | `boolean` | `false` | 高值截断，仅 raster-dem 生效 |
| `minzoom` | `number` | - | 源最小缩放级覆盖 |
| `maxzoom` | `number` | - | 源最大缩放级覆盖 |
| `tileSize` | `number` | `256` | 栅格瓦片大小（px） |
| `fitBounds` | `boolean` | `false` | 加载完成后自动 fitBounds 到归档范围 |
| `fitBoundsPadding` | `number` | `20` | fitBounds 内边距（px） |
| `visible` | `boolean` | `true` | 是否可见 |
| `opacity` | `number` | `1` | 整体不透明度 0-1 |
| `zIndex` | `number` | `1` | 图层 z 序 |
| `onReady` | `(info) => void` | - | 图层就绪回调，返回 `{ header, sourceType }` |
| `onError` | `(err: Error) => void` | - | 出错回调 |

### PMTilesRampColors

| 属性 | 类型 | 说明 |
|------|------|------|
| `type` | `'linear' \| 'quantize' \| 'custom'` | 插值类型，省略时按归一化 positions 生成色带（推荐） |
| `colors` | `string[]` | 色值数组 |
| `positions` | `number[]` | 位置数组：省略 `type` 时为归一化 0~1；`type: 'linear'` 时为与 `domain` 同量纲的绝对值 |

## 示例

### 栅格影像（高德底图，无需 token）

```tsx
<AiMap autoFit map={{ basemap: 'gaode', style: 'satellite' }}>
  <PMTilesLayer
    url="https://pmtiles-data.oss-cn-beijing.aliyuncs.com/tu_mo_te_you_qi_mei_dai_zhao_zhen_mei_dai_zhao_zhen_ge_jia_ying_cun_9_1_0.pmtiles"
    fitBounds
    fitBoundsPadding={40}
  />
</AiMap>
```

### 地形高程（TerrainRGB，任意底图）

```tsx
<PMTilesLayer
  url="https://example.com/dem.pmtiles"
  sourceType="raster-dem"
  domain={[0, 7000]}
  rampColors={{
    colors: ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850'],
    positions: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
  }}
/>
```

## 工作原理

1. **取数**：组件创建 `new PMTiles(url)`，瓦片渲染时 L7 调用 `getCustomData(tile, cb)`，
   组件内部 `pmtiles.getZxy(z, x, y)` 经 HTTP Range 请求按需读取瓦片字节，取其 `RangeResponse.data`
   （`ArrayBuffer`）回传给 L7，由 `CustomImageRasterLoader` 经 `formatImage` 解码为图像。

2. **渲染**：
   - 栅格影像：`dataType: 'customImage'` → `CustomImageRasterLoader`（getCustomData 取数）+ `ImageTile`（普通图像贴片）。
   - 地形高程：`dataType: 'customTerrainRGB'` → `CustomImageRasterLoader`（getCustomData 取数）+ `RasterTerrainRGBTile`（TerrainRGB 解码 + 色带映射）。

3. **底图无关**：整条链路在 L7 WebGL 层，不依赖底图的 source/layer API，因此高德 / maplibre / mapbox 通用。

## 注意事项

> 📦 PMTiles 归档经 HTTP Range 请求按需读取，服务器（或 CDN / 对象存储）需支持 `Range` 头部并返回 `206 Partial Content`。
>
> 🗺️ 自动识别（`sourceType: 'auto'`）只能区分矢量与栅格图像；`raster-dem` 与普通栅格同为图像编码，需用户显式指定 `sourceType: 'raster-dem'`。
>
> ⚠️ 矢量瓦片（MVT）暂不支持，传入会触发 `onError`。若 `positions` 使用归一化 0~1，建议省略 `rampColors.type`（与 L7 terrainRGB 规范一致）。

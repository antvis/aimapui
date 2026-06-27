# TiffRasterLayer — GeoTIFF 栅格

GeoTIFF 栅格数据复合图层，支持单波段伪彩色映射、多波段真彩色/假彩色合成、NDI 归一化差异指数三种渲染模式。内置 geotiff 解析能力，支持地理遮罩。

## Examples

```tsx
import { TiffRasterLayer } from '@antv/aimapui';

// 单波段伪彩色：夜光数据
<TiffRasterLayer
  url="https://example.com/nightlight.tif"
  renderMode="raster"
  domain={[0, 90]}
  rampColors={{
    colors: ['rgba(92,58,16,0)', '#fabd08', '#f1e93f', '#f1ff8f', '#fcfff7'],
    positions: [0, 3, 9, 22.5, 45, 90],
  }}
  opacity={0.8}
/>

// 单波段伪彩色：NDVI 植被指数
<TiffRasterLayer
  url="https://example.com/ndvi.tif"
  renderMode="raster"
  bandIndex={0}
  domain={[0, 0.8]}
  noDataValue={0}
  rampColors={{
    type: 'linear',
    colors: ['#78350f', '#d97706', '#fbbf24', '#84cc16', '#059669', '#047857'],
    positions: [0, 0.16, 0.32, 0.48, 0.64, 0.8],
  }}
  clampLow
  clampHigh
/>

// 多波段 RGB 真彩色合成
<TiffRasterLayer
  url="https://example.com/satellite.tif"
  renderMode="rgb"
  bands={[0, 1, 2]}
  countCut={[2, 98]}
  rMinMax={[0, 255]}
  gMinMax={[0, 255]}
  bMinMax={[0, 255]}
  opacity={1}
/>

// RGB 合成 + 中国区域遮罩
<TiffRasterLayer
  url="https://example.com/china.tif"
  renderMode="rgb"
  bands={[0, 1, 2]}
  mask
  maskData="https://example.com/china-boundary.json"
/>

// NDI 归一化差异指数
<TiffRasterLayer
  url="https://example.com/multispectral.tif"
  renderMode="ndi"
  bands={[0, 1]}
  domain={[-1, 1]}
  rampColors={{
    colors: ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850'],
    positions: [-1, -0.6, -0.2, 0.2, 0.6, 1],
  }}
/>
```

## Enums

- **RasterRenderMode:** `'raster'` | `'rgb'` | `'ndi'`

## Types

```ts
interface RampColors {
  type?: 'linear' | 'quantize' | 'custom';
  colors: string[];
  positions?: number[];
}
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | `string` | **必填** | TIFF 文件 URL |
| `extent` | `[number, number, number, number]` | 中国范围 | 地理范围 `[minLng, minLat, maxLng, maxLat]` |
| `renderMode` | `RasterRenderMode` | `'raster'` | 渲染模式 |
| `bandIndex` | `number` | `0` | 波段索引（raster 模式） |
| `domain` | `[number, number]` | `[0, 90]` | 数据值域（raster/ndi 模式） |
| `noDataValue` | `number` | `0` | 无数据值（raster 模式） |
| `rampColors` | `RampColors` | 夜光色带 | 色带配置 |
| `clampLow` | `boolean` | `false` | 低值截断（raster 模式） |
| `clampHigh` | `boolean` | `false` | 高值截断（raster 模式） |
| `bands` | `[number, number] \| [number, number, number]` | `[0, 1, 2]` | 波段索引（rgb/ndi 模式） |
| `countCut` | `[number, number]` | `[2, 98]` | 百分位裁剪（rgb 模式） |
| `rMinMax` | `[number, number]` | — | R 通道值域（rgb 模式，避免大数据栈溢出） |
| `gMinMax` | `[number, number]` | — | G 通道值域（rgb 模式） |
| `bMinMax` | `[number, number]` | — | B 通道值域（rgb 模式） |
| `opacity` | `number` | `0.8` | 不透明度 |
| `mask` | `boolean` | `false` | 是否启用遮罩 |
| `maskData` | `string \| Record<string, unknown>` | — | 遮罩 GeoJSON URL 或对象 |

## 渲染模式说明

- **raster（单波段伪彩色）**：取指定波段，按 `domain` 和 `rampColors` 映射为伪彩色。适合 NDVI、DEM、夜光等单波段数据
- **rgb（多波段合成）**：取 3 个波段分别作为 R/G/B 通道合成。适合卫星影像、假彩色合成
- **ndi（归一化差异指数）**：计算两个波段的归一化差异 `(band1 - band2) / (band1 + band2)`，再映射伪彩色。适合 NDVI、NDBI、NDWI 等

## 默认色带

```ts
// 夜光色带（默认）
{
  type: 'linear',
  colors: ['rgba(92,58,16,0)', 'rgba(92,58,16,0)', '#fabd08', '#f1e93f', '#f1ff8f', '#fcfff7'],
  positions: [0, 3, 9, 22.5, 45, 90],
}
```

## 相关文档

- [index.md](index.md) — 复合图层概览
# TiffRasterLayer

GeoTIFF 栅格影像可视化组件。支持三种渲染模式：单波段伪彩色、多波段真/假彩色、归一化差值指数。自动检测 TIFF 元数据中的范围信息，支持 GeoJSON 掩膜裁剪。

## 导入

```tsx
import { TiffRasterLayer } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `url` | `string` | **必填** | GeoTIFF 文件 URL |
| `extent` | `[number, number, number, number]` | - | 手动指定范围 `[minLng, minLat, maxLng, maxLat]`，不设置则自动从 TIFF 元数据提取 |
| `renderMode` | `RasterRenderMode` | `'raster'` | 渲染模式：`raster`（单波段伪彩）、`rgb`（多波段彩色）、`ndi`（归一化差值指数） |
| `bandIndex` | `number` | `0` | 单波段模式下读取的波段索引 |
| `domain` | `[number, number]` | - | 值域范围 `[min, max]`，用于颜色映射 |
| `noDataValue` | `number` | - | 无数据值，匹配此值的像素将透明显示 |
| `rampColors` | `RampColors` | - | 色带配置，用于单波段/NDI 模式的颜色映射 |
| `clampLow` | `boolean` | `true` | 是否将低于值域最小值的像素钳制到最小颜色 |
| `clampHigh` | `boolean` | `true` | 是否将高于值域最大值的像素钳制到最大颜色 |
| `bands` | `object` | - | RGB 模式下的波段配置 `{ red, green, blue }`，各为波段索引 |
| `countCut` | `number` | - | NDI 模式下的百分位裁剪 |
| `rMinMax` | `[number, number]` | - | R 通道值域范围（RGB 模式） |
| `gMinMax` | `[number, number]` | - | G 通道值域范围（RGB 模式） |
| `bMinMax` | `[number, number]` | - | B 通道值域范围（RGB 模式） |
| `opacity` | `number` | `1` | 图层不透明度 |
| `mask` | `object` | - | GeoJSON 掩膜，仅显示掩膜范围内的像素 |
| `maskData` | `object` | - | 掩膜数据 |

## RampColors

```typescript
interface RampColors {
  colors: string[];     // 颜色数组
  positions: number[];  // 对应位置数组（0-1）
}
```

## RasterRenderMode

| 值 | 说明 |
|---|------|
| `'raster'` | 单波段伪彩色渲染，根据 `bandIndex` 读取单个波段，通过 `rampColors` 映射为颜色 |
| `'rgb'` | 多波段彩色渲染，分别读取 R/G/B 波段合成为真彩色或假彩色 |
| `'ndi'` | 归一化差值指数，如 NDVI = (NIR - Red) / (NIR + Red)，通过 `rampColors` 映射 |

## 示例

### 单波段伪彩色

```tsx
<TiffRasterLayer
  url="https://example.com/data/dem.tif"
  renderMode="raster"
  bandIndex={0}
  domain={[0, 4000]}
  rampColors={{
    colors: ['#FDE68A', '#F59E0B', '#D97706', '#92400E', '#451A03'],
    positions: [0, 0.25, 0.5, 0.75, 1],
  }}
  opacity={0.8}
/>
```

### RGB 真彩色

```tsx
<TiffRasterLayer
  url="https://example.com/data/satellite.tif"
  renderMode="rgb"
  bands={{ red: 3, green: 2, blue: 1 }}
  rMinMax={[0, 10000]}
  gMinMax={[0, 10000]}
  bMinMax={[0, 10000]}
/>
```

### NDVI 植被指数

```tsx
<TiffRasterLayer
  url="https://example.com/data/ndvi.tif"
  renderMode="ndi"
  bandIndex={0}
  domain={[-1, 1]}
  rampColors={{
    colors: ['#FDE68A', '#FCD34D', '#A3E635', '#22C55E', '#15803D'],
    positions: [0, 0.25, 0.5, 0.75, 1],
  }}
/>
```

## 注意事项

> 💡 组件内部使用 `geotiff` 库动态加载 GeoTIFF 文件，首次渲染时可能有短暂加载延迟。
> 
> ⚠️ 如果 TIFF 文件不包含 GeoTransform 信息，需要手动指定 `extent` 参数。
> 
> 📎 使用 `mask` 属性可以用 GeoJSON 多边形裁剪显示区域，常用于行政边界内的影像展示。
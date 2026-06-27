# RasterLayer — 栅格图层

栅格图层用于渲染栅格瓦片和单张栅格图片，支持 `raster`（单张图片）和 `rasterTile`（瓦片）两种模式。

## Examples

```tsx
import { RasterLayer } from '@antv/aimapui';

// 栅格瓦片（卫星影像等）
<RasterLayer
  source="https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}"
  sourceType="rasterTile"
  sourceConfig={{ parser: { type: 'rasterTile', tileSize: 256, zoomOffset: 1 } }}
/>

// 单张栅格图片（需要 extent）
<RasterLayer
  source="https://example.com/dem.png"
  sourceType="raster"
  sourceConfig={{
    parser: {
      type: 'raster',
      extent: [73.48, 3.83, 135.11, 53.56],
    },
  }}
  style={{ opacity: 0.7 }}
/>

// 自定义透明度
<RasterLayer
  source="https://example.com/{z}/{x}/{y}.png"
  sourceType="rasterTile"
  opacity={0.6}
  zIndex={0}
/>
```

## 数据源类型

| sourceType | 说明 | source 格式 |
|-----------|------|------------|
| `rasterTile` | 栅格瓦片 | URL 模板（`{z}`/`{x}`/`{y}` 占位符） |
| `raster` | 单张栅格 | 图片 URL |

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `string` | **必填** | 瓦片 URL 模板或图片 URL |
| `sourceType` | `'raster' \| 'rasterTile'` | `'raster'` | 数据类型 |
| `sourceConfig` | `SourceConfig` | — | 解析配置（parser.type, tileSize, extent 等） |
| `style` | `Record<string, unknown>` | — | 样式扩展 |
| `opacity` | `number` | — | 透明度 0~1 |
| `blend` | `string` | — | 混合模式 |
| `visible` | `boolean` | `true` | 可见性 |
| `zIndex` | `number` | — | 层级 |
| `minZoom` | `number` | — | 最小可见缩放 |
| `maxZoom` | `number` | — | 最大可见缩放 |
| `onClick` | `(payload) => void` | — | 点击回调 |
| `onLayerCreated` | `(layer) => void` | — | 图层创建回调 |

> **注意：** RasterLayer 不使用 `color`/`size`/`shape` 视觉通道，所有渲染配置通过 `style` 和 `sourceConfig.parser` 传递。

## 相关文档

- [index.md](index.md) — 基础图层概览
- [satellite-layer.md](../composite/satellite-layer.md) — 卫星影像复合图层
- [tiff-raster-layer.md](../composite/tiff-raster-layer.md) — GeoTIFF 栅格复合图层
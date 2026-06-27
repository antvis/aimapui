# ImageLayer — 图片图层

图片图层用于在地图上叠加单张图片，通过 `style.bounds` 指定图片的地理范围（经纬度）。

## Examples

```tsx
import { ImageLayer } from '@antv/aimapui';

// 基础图片叠层
<ImageLayer
  source="https://example.com/overlay.png"
  sourceType="image"
  style={{
    bounds: [[119, 29], [122, 32]],
  }}
/>

// 带透明度
<ImageLayer
  source="https://example.com/radar.png"
  sourceType="image"
  style={{
    bounds: [[116, 39], [117, 40]],
    opacity: 0.5,
  }}
  zIndex={10}
/>

// 控制可见性
<ImageLayer
  source={overlayUrl}
  sourceType="image"
  style={{ bounds: [[73, 3], [135, 54]] }}
  visible={showOverlay}
/>
```

## 数据格式

`source` 为图片 URL，`style.bounds` 指定图片在地图上的地理范围：

```ts
style: {
  bounds: [[minLng, minLat], [maxLng, maxLat]]
}
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `string` | **必填** | 图片 URL |
| `sourceType` | `'image'` | `'image'` | 数据类型 |
| `sourceConfig` | `SourceConfig` | — | 解析配置 |
| `style` | `Record<string, unknown>` | — | 样式扩展（**必须**包含 `bounds`） |
| `opacity` | `number` | — | 透明度 0~1 |
| `visible` | `boolean` | `true` | 可见性 |
| `zIndex` | `number` | — | 层级 |
| `minZoom` | `number` | — | 最小可见缩放 |
| `maxZoom` | `number` | — | 最大可见缩放 |
| `onClick` | `(payload) => void` | — | 点击回调 |
| `onLayerCreated` | `(layer) => void` | — | 图层创建回调 |

> **注意：** ImageLayer 不使用 `color`/`size`/`shape` 视觉通道，所有渲染配置通过 `style` 传递。`style.bounds` 是必填项，定义了图片在地图上的地理范围。

## 相关文档

- [index.md](index.md) — 基础图层概览
- [raster-layer.md](raster-layer.md) — 栅格图层
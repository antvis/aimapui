# RasterLayer

栅格瓦片图层，用于加载和展示栅格瓦片服务（XYZ/TMS/WMTS）。适合叠加卫星影像、地形晕渲、历史地图、气象云图等场景。

> **何时选择：** 需要叠加第三方栅格瓦片服务时用 RasterLayer；如果是叠加单张静态图片到固定区域，用 [ImageLayer](./image-layer)；如果需要加载 GeoTIFF/COG 等科学数据栅格，参考 [TiffRasterLayer](../composite-layers/tiff-raster-layer)。

## 导入

```tsx
import { RasterLayer } from '@antv/aimapui';
```

## Props

RasterLayer 继承 [LayerSchema 公共属性](./point-layer#公共属性)。

### 数据源

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `source` | `string` | **必填** | 瓦片服务 URL 模板，支持 `{x}` `{y}` `{z}` 占位符 |
| `sourceType` | `'raster' \| 'rasterTile'` | `'raster'` | 数据源类型 |
| `sourceConfig` | `object` | - | 瓦片配置，如 `tileSize`、`minZoom`、`maxZoom` |

### 样式

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `style` | `object` | - | 样式配置 |
| `style.opacity` | `number` | `1` | 瓦片不透明度 (0~1) |

### 公共属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | `true` | 图层可见性 |
| `zIndex` | `number` | `0` | 图层堆叠层级，值越大越靠上 |
| `minZoom` | `number` | - | 最小可见缩放级别 |
| `maxZoom` | `number` | - | 最大可见缩放级别 |
| `name` | `string` | `'raster'` | 图层名称，用于 [LayerSwitchControl](../controls/layer-switch-control) 引用 |

### 事件

| 属性 | 类型 | 说明 |
|------|------|------|
| `onClick` | `(payload: LayerEventPayload) => void` | 点击瓦片触发 |

## 示例

### 基础用法 — 加载 XYZ 瓦片

```tsx
import { AiMap, RasterLayer } from '@antv/aimapui';

<AiMap map={{ basemap: 'gaode', center: [116.4, 39.9], zoom: 10 }}>
  <RasterLayer
    source="https://tiles.example.com/{z}/{x}/{y}.png"
    sourceType="raster"
    style={{ opacity: 0.8 }}
  />
</AiMap>
```

### 叠加卫星影像

```tsx
<RasterLayer
  source="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  sourceType="raster"
  zIndex={1}
/>
```

### 配合图层切换控件

```tsx
<AiMap map={{ basemap: 'gaode', center: [108, 34], zoom: 4 }}>
  <RasterLayer
    name="卫星影像"
    source="https://tiles.example.com/satellite/{z}/{x}/{y}.png"
    style={{ opacity: 0.9 }}
  />
  <LayerSwitchControl />
</AiMap>
```

## 注意事项

- 瓦片 URL 需支持 CORS，否则浏览器会拦截跨域请求
- `sourceType` 默认为 `'raster'`，加载标准 XYZ 瓦片时无需修改
- 大范围高缩放级别的瓦片会产生大量网络请求，建议设置合理的 `minZoom`/`maxZoom` 限制
- 叠加多个 RasterLayer 时通过 `zIndex` 控制层级顺序，避免相互遮挡
- `opacity` 常用于半透明叠加效果，如在底图上叠加气象云图

## 相关组件

- [ImageLayer](./image-layer) — 单张图片叠加图层
- [TiffRasterLayer](../composite-layers/tiff-raster-layer) — GeoTIFF 科学数据图层
- [SatelliteLayer](../composite-layers/satellite-layer) — 卫星底图快捷组件
- [LayerSwitchControl](../controls/layer-switch-control) — 图层切换控件

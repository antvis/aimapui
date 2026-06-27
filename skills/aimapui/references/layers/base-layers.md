# 基础图层快速参考

基础图层是直接映射到 L7 底层图层类的原子组件。完整文档见各图层独立页面。

## 图层列表

| 图层 | 文档 | 默认 sourceType | 可用 Shape |
|------|------|----------------|-----------|
| PointLayer | [point-layer.md](point-layer.md) | `json` | circle, square, triangle, diamond, text, cylinder |
| LineLayer | [line-layer.md](line-layer.md) | `json` | line, arc, arc3d, greatcircle |
| PolygonLayer | [polygon-layer.md](polygon-layer.md) | `geojson` | fill, extrusion |
| HeatmapLayer | [heatmap-layer.md](heatmap-layer.md) | `json` | heatmap, hexagonColumn, hexagon, gridColumn, grid |
| RasterLayer | [raster-layer.md](raster-layer.md) | `raster` | — |
| ImageLayer | [image-layer.md](image-layer.md) | `image` | — |

## 快速示例

```tsx
// PointLayer — 散点图
<PointLayer source={data} sourceConfig={{ x: 'lng', y: 'lat' }} color="#5B8FF9" size={12} shape="circle" />

// LineLayer — 路径/弧线
<LineLayer source={flowData} sourceType="geojson" color="#5B8FF9" size={2} shape="arc" />

// PolygonLayer — 区域填充
<PolygonLayer source={geojsonData} sourceType="geojson" colorField="density" colorValues={['#f0f9e8','#bae4bc','#7bccc4','#43a2ca','#0868ac']} />

// HeatmapLayer — 热力图
<HeatmapLayer source={points} sourceConfig={{ x: 'lng', y: 'lat' }} colorField="value" size={30} />

// RasterLayer — 栅格瓦片
<RasterLayer source="https://example.com/{z}/{x}/{y}.png" sourceType="rasterTile" />

// ImageLayer — 图片叠层
<ImageLayer source="https://example.com/overlay.png" sourceType="image" style={{ bounds: [[119,29],[122,32]] }} />
```

## 视觉映射

```tsx
// 固定值
<PointLayer source={data} color="#5B8FF9" size={12} />

// 字段映射
<PointLayer
  source={data}
  colorField="category"
  colorValues={['#5B8FF9', '#F6BD16', '#5AD8A6', '#E86452']}
  sizeField="value"
  sizeValues={[6, 30]}
/>

// 文字标注
<PointLayer source={data} shapeField="name" shapeValues="text" color="#333" size={12}
  style={{ textAnchor: 'top', textOffset: [0, 15] }} />
```

## 数据源配置

```tsx
// JSON 数组
<PointLayer source={[{ lng: 116, lat: 39 }]} sourceConfig={{ x: 'lng', y: 'lat' }} />

// GeoJSON
<PolygonLayer source={geojsonData} sourceType="geojson" />

// OD 弧线
<LineLayer source={odData} sourceConfig={{ x: 'fromLng', y: 'fromLat', x1: 'toLng', y1: 'toLat' }} shape="arc" />
```

## 相关文档

- [index.md](index.md) — 基础图层完整文档索引
- [schema-system.md](../schema/schema-system.md) — LayerSchema 完整属性
- [index.md](../composite/index.md) — 复合图层概览
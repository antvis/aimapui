# Composite Layers

复合图层是基于基础图层组合的高级业务组件，内置设计规范和最佳实践。

> **所有可视化图层必须从 `@antv/aimapui` 引入**，禁止直接使用 `@antv/l7` 原生图层类。基础图层与 L7 同名的重名陷阱详见 [基础图层文档](../layers/index.md) 的 ⚠️ 小节。

## Available Layers

| Layer | File | Description |
|-------|------|-------------|
| BubbleLayer | [bubble-layer.md](bubble-layer.md) | 气泡图 — 用圆的大小编码数值字段 |
| RouteLayer | [route-layer.md](route-layer.md) | 路径地图 — 途经点 + 发光 + 分段着色 + 流动动画 |
| ArcFlowLayer | [arc-flow-layer.md](arc-flow-layer.md) | 弧线流向图 — OD 数据弧线动画 |
| GlyphLayer | [glyph-layer.md](glyph-layer.md) | 图标字体图层 — Material Symbols 图标标注 |
| IconLayer | [icon-layer.md](icon-layer.md) | 图标图片图层 — 自定义图片图标 |
| ChinaDistrict | [china-district.md](china-district.md) | 行政区划下钻 — 省市区三级 + 业务数据色阶 |
| MarkerClusterLayer | [marker-cluster-layer.md](marker-cluster-layer.md) | 聚合标注 |
| HexagonLayer | [hexagon-layer.md](hexagon-layer.md) | 蜂窝热力 |
| FillLayer | [fill-layer.md](fill-layer.md) | 区域填充 |
| SatelliteLayer | [satellite-layer.md](satellite-layer.md) | 卫星影像 |
| TiffRasterLayer | [tiff-raster-layer.md](tiff-raster-layer.md) | GeoTIFF 栅格 |
| H3Layer | [h3-layer.md](h3-layer.md) | H3 六边形网格 |

## Related Docs

- [base-layers.md](../layers/base-layers.md) — Base Layers
- [schema-system.md](../schema/schema-system.md) — Schema System

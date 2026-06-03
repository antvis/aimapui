# 内置字体图标

GlyphLayer 内置 **Material Symbols Outlined** 字体图标库，涵盖 140+ 个常用图标，覆盖天气、交通出行、地点定位、城市生活、活动运动、地图功能、通用 7 大分类。

## 特性

- **零配置**：`iconFontFamily="material-symbols"`（默认），组件自动注册映射表
- **矢量锐利**：基于 SDF 渲染，任意缩放下边缘清晰
- **单色染色**：图标颜色可任意定制，支持数据驱动映射
- **搜索预览**：上方 Demo 支持搜索、分类筛选、尺寸/颜色实时预览

## 图标分类

| 分类 | 数量 | 示例图标 |
|------|------|----------|
| 天气 | 22 | sunny, cloud, rainy, thunderstorm, foggy, water_drop |
| 交通出行 | 21 | flight, train, directions_bus, directions_car, local_taxi |
| 地点定位 | 11 | location_on, place, pin_drop, near_me, my_location |
| 城市生活 | 30 | restaurant, hotel, local_hospital, school, park |
| 活动运动 | 9 | attractions, celebration, sports_soccer, sports_basketball |
| 地图功能 | 15 | layers, terrain, landscape, favorite, star, warning |
| 通用 | 15 | search, settings, info, check, add, edit, delete |

## 快速使用

```tsx
import { GlyphLayer } from '@antv/aimapui';

<GlyphLayer
  source={data}
  sourceType="json"
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="icon"        // 数据中的图标名字段，值为 Material Symbols 图标名
  iconColor="#2563eb"
  labelField="name"
/>
```

数据示例：

```json
[
  { "lng": 116.40, "lat": 39.91, "icon": "sunny", "name": "北京" },
  { "lng": 121.49, "lat": 31.24, "icon": "rainy", "name": "上海" },
  { "lng": 113.27, "lat": 23.13, "icon": "thunderstorm", "name": "广州" }
]
```

## 图标名参考

图标名直接使用 [Material Symbols 官方名称](https://fonts.google.com/icons)，上方 Demo 提供完整列表的可视化预览与搜索。

更多用法详见 [GlyphLayer 文档](./glyph-layer)。

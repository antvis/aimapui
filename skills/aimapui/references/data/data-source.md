# 数据源配置

aimapui 图层数据源通过 `source`、`sourceType`、`sourceConfig` 三个属性配置。

## sourceType 类型

| sourceType   | 说明              | source 值类型            |
| ------------ | ----------------- | ------------------------ |
| `json`       | JSON 数组         | `object[]`              |
| `geojson`    | GeoJSON 对象      | `FeatureCollection`     |
| `csv`        | CSV 字符串        | `string`                |
| `raster`     | 栅格数据          | `Uint8Array` / `ImageData` |
| `rasterTile` | 栅格瓦片          | `string`(URL 模板)      |
| `image`      | 图片叠加          | `string`(URL)           |

不指定 `sourceType` 时，默认根据 source 数据类型自动推断。

## JSON 数据源

最常用，配合 `sourceConfig` 指定经纬度字段：

```typescript
const layer: LayerSchema = {
  type: 'point',
  source: [
    { name: '北京', lng: 116.4, lat: 39.9, value: 100 },
    { name: '上海', lng: 121.5, lat: 31.2, value: 200 },
  ],
  sourceType: 'json',
  sourceConfig: {
    x: 'lng',       // 经度字段名
    y: 'lat',       // 纬度字段名
  },
  colorField: 'value',
  colorValues: ['#f0f9e8', '#0868ac'],
};
```

### 线/面数据

线段数据需指定起止坐标：

```typescript
sourceConfig: {
  x: 'fromLng',
  y: 'fromLat',
  x1: 'toLng',     // 终点经度
  y1: 'toLat',     // 终点纬度
}
```

多边形需指定坐标数组：

```typescript
sourceConfig: {
  coordinates: 'polygonCoords',  // 字段名，值为 [[lng,lat], ...]
  parser: { type: 'json' },
}
```

## GeoJSON 数据源

```typescript
const layer: LayerSchema = {
  type: 'polygon',
  source: geojsonFeatureCollection,
  sourceType: 'geojson',
  color: '#2563eb',
};
```

无需 `sourceConfig`，GeoJSON 自带坐标信息。

## CSV 数据源

```typescript
const layer: LayerSchema = {
  type: 'point',
  source: `name,lng,lat,value
北京,116.4,39.9,100
上海,121.5,31.2,200`,
  sourceType: 'csv',
  sourceConfig: {
    x: 'lng',
    y: 'lat',
  },
};
```

## 栅格瓦片数据源

```typescript
const layer: LayerSchema = {
  type: 'raster',
  source: 'https://tile.example.com/{z}/{x}/{y}.png',
  sourceType: 'rasterTile',
};
```

## 图片叠加数据源

```typescript
const layer: LayerSchema = {
  type: 'image',
  source: 'https://example.com/overlay.png',
  sourceType: 'image',
  sourceConfig: {
    coordinates: [
      [100.0, 30.0],   // 左下
      [110.0, 30.0],   // 右下
      [110.0, 40.0],   // 右上
      [100.0, 40.0],   // 左上
    ],
  },
};
```

## sourceConfig.parser

`parser` 透传至 L7 Source 的 parser 配置，支持高级解析：

```typescript
sourceConfig: {
  parser: {
    type: 'json',
    coordinates: 'geometry.coordinates',  // 嵌套字段路径
  },
}
```

## sourceConfig.transforms

`transforms` 透传至 L7 Source 的数据变换：

```typescript
sourceConfig: {
  transforms: [
    { type: 'map', callback: (item) => ({ ...item, value: item.value * 2 }) },
    { type: 'filter', callback: (item) => item.value > 0 },
  ],
}
```

## 组件模式中的数据源

在组件模式下，数据直接作为 prop 传入：

```tsx
<PointLayer
  source={cityData}
  sourceType="json"
  sourceConfig={{ x: 'lng', y: 'lat' }}
  colorField="value"
  colorValues={['#f0f9e8', '#0868ac']}
/>
```

## 相关文档

- [base-layers.md](../layers/base-layers.md) — 基础图层
- [mapping.md](../visual/mapping.md) — 视觉映射
- [schema-system.md](../schema/schema-system.md) — Schema 完整定义
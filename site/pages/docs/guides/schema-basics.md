# Schema 基础概念

aimapkit 采用 **Schema 驱动**的设计理念,通过 JSON Schema 配置即可生成完整的地图可视化应用。

## 什么是 Schema?

Schema 是一个可序列化的 JSON 对象,描述了地图的所有配置,包括:

- 地图底图 (basemap)
- 图层 (layers)
- 控件 (controls)
- 交互元素 (markers, popups)
- 图例 (legend)
- 响应式配置 (responsive)

## Schema 结构

```typescript
interface AimapSchema {
  map: MapSchema           // 地图底图配置
  layers?: LayerSchema[]   // 图层配置
  controls?: ControlSchema[] // 控件配置
  interactions?: InteractionSchema[] // 交互元素
  legend?: LegendSchema    // 图例配置
  responsive?: ResponsiveSchema // 响应式配置
  events?: EventSchema     // 事件配置
}
```

## 最小示例

一个最小的 Schema 只需要包含 `map` 配置:

```tsx
const schema = {
  map: {
    basemap: 'gaode',
    center: [116.397428, 39.90923],
    zoom: 10
  }
}
```

## 完整示例

```tsx
const schema = {
  map: {
    basemap: 'gaode',
    token: 'YOUR_KEY',
    center: [116.397428, 39.90923],
    zoom: 10,
    pitch: 45,
    rotation: 30
  },
  layers: [{
    type: 'point',
    source: [
      { lng: 116.397, lat: 39.909, value: 100 }
    ],
    sourceType: 'json',
    color: '#1890ff',
    size: 12
  }],
  controls: [
    { type: 'zoom', position: 'topright' },
    { type: 'scale', position: 'bottomleft' }
  ],
  legend: {
    type: 'categories',
    title: '图例',
    labels: ['类别1', '类别2'],
    colors: ['#1890ff', '#722ed1']
  }
}
```

## 为什么使用 Schema?

### 1. AI 友好

Schema 是纯 JSON 格式,AI 可以直接生成配置,无需编写代码:

```json
{
  "map": {
    "basemap": "gaode",
    "center": [116.397428, 39.90923],
    "zoom": 10
  },
  "layers": [{
    "type": "heatmap",
    "source": "data.csv"
  }]
}
```

### 2. 可序列化

Schema 可以保存为文件,存储到数据库,或通过网络传输:

```tsx
// 保存 Schema
const schemaJSON = JSON.stringify(schema)
localStorage.setItem('myMap', schemaJSON)

// 加载 Schema
const loaded = JSON.parse(localStorage.getItem('myMap'))
<Aimap schema={loaded} />
```

### 3. 声明式

只需描述"是什么",而不用关心"怎么做":

```tsx
// 声明式 - 只需描述配置
const schema = {
  layers: [{
    type: 'point',
    color: '#1890ff'
  }]
}

// 命令式 - 需要编写大量代码
const layer = new PointLayer()
  .source(data)
  .color('#1890ff')
  .size(10)
scene.addLayer(layer)
```

## 类型安全

aimapkit 提供完整的 TypeScript 类型定义:

```tsx
import type { AimapSchema } from '@antv/aimapkit'

const schema: AimapSchema = {
  map: {
    basemap: 'gaode', // 类型检查,只能选择支持的底图
    center: [116.397428, 39.90923]
  }
}
```

## 下一步

- [地图配置](/docs/guides/map-config) - 了解地图底图配置
- [图层可视化](/docs/guides/layer-visualization) - 学习各种图层类型
- [交互功能](/docs/guides/interaction) - 添加交互元素

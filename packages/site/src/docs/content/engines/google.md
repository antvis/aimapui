# Google 地图

Google Maps 是全球使用最广泛的地图平台，通过 Google Maps JavaScript API 提供 Web 地图能力。

## 特点

- **全球覆盖最广**：全球范围的卫星影像、街景、路网数据覆盖度最高
- **多种地图类型**：内置 roadmap（道路）、satellite（卫星）、hybrid（混合）、terrain（地形）4 种标准类型
- **街景功能**：独有的 Street View 街景能力
- **Cloud Styling**：支持通过 Google Cloud Console 创建云端地图样式
- **国内访问受限**：需要科学上网，不适合面向国内用户的项目

## 使用方式

```tsx
import { AiMap, PointLayer, ZoomControl } from '@antv/aimapui';

function App() {
  return (
    <AiMap
      autoFit
      map={{
        basemap: 'google',
        token: 'your-google-maps-api-key',
        center: [105, 35],
        zoom: 4,
        style: 'normal',
      }}
    >
      <PointLayer source={data} color="#5B8FF9" size={12} />
      <ZoomControl position="bottomright" />
    </AiMap>
  );
}
```

## 可用地图类型

| 类型值 | 说明 |
|--------|------|
| `roadmap` | 道路地图，默认类型 |
| `satellite` | 卫星影像 |
| `hybrid` | 卫星影像 + 道路标注 |
| `terrain` | 地形渲染图 |

## 适用场景

- 面向海外用户的全球化产品
- 需要 Street View 街景功能的项目
- 海外市场的出行、物流、地产等行业应用

## Token 申请

前往 [Google Cloud Console](https://console.cloud.google.com/google/maps-apis) 启用 Maps JavaScript API 并获取 API Key。

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `basemap` | `'google'` | - | 指定使用 Google 地图引擎 |
| `center` | `[number, number]` | `[105, 35]` | 初始中心点 [经度, 纬度] |
| `zoom` | `number` | `4` | 初始缩放级别 |
| `style` | `string` | `'normal'` | 底图样式 |
| `token` | `string` | - | **必填**，Google Maps API Key |

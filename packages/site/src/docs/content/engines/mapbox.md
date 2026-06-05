# Mapbox

Mapbox GL JS 是业界领先的商业 WebGL 地图引擎，以精美的设计和强大的 3D 能力著称。

## 特点

- **视觉效果顶级**：3D 地形、建筑阴影、天空效果等，是视觉表现最强的地图引擎
- **全球数据覆盖**：全球范围高质量道路、卫星影像、地形数据
- **Style Spec 标准制定者**：Mapbox Style Specification 是矢量瓦片样式的事实标准
- **丰富的 Studio 工具**：通过 Mapbox Studio 可视化编辑自定义地图样式
- **需要 Access Token**：商业产品，需在 [Mapbox](https://www.mapbox.com/) 注册并获取 token

## 使用方式

```tsx
import { AiMap, PointLayer, ZoomControl } from '@antv/aimapui';

function App() {
  return (
    <AiMap
      autoFit
      map={{
        basemap: 'mapbox',
        token: 'your-mapbox-access-token',
        center: [105, 35],
        zoom: 4,
        style: 'light',
      }}
    >
      <PointLayer source={data} color="#5B8FF9" size={12} />
      <ZoomControl position="bottomright" />
    </AiMap>
  );
}
```

## 适用场景

- 面向海外市场的产品，需要精美的地图视觉效果
- 需要 3D 地形、建筑等高级渲染能力
- 有 Mapbox Studio 自定义样式需求的设计驱动型项目

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `basemap` | `'mapbox'` | - | 指定使用 Mapbox 引擎 |
| `center` | `[number, number]` | `[105, 35]` | 初始中心点 [经度, 纬度] |
| `zoom` | `number` | `4` | 初始缩放级别 |
| `style` | `string` | `'light'` | 底图样式 |
| `token` | `string` | - | **必填**，Mapbox Access Token |

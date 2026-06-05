# 高德地图

高德地图（AMap）是国内使用最广泛的商业地图引擎之一，由高德软件提供。AiMapUI 默认使用高德地图作为底图引擎。

## 特点

- **国内覆盖全面**：POI 数据丰富，路网、建筑、行政区划等数据精度高，适合国内业务场景
- **多种底图样式**：内置 light、dark、normal、fresh 等多种官方主题，通过 `style` 属性切换
- **合规性好**：符合国内地图审图要求，坐标系采用 GCJ-02（火星坐标系）
- **无需额外 token**：AiMapUI 内置了开发环境 token，开箱即用；生产环境建议申请自有 key

## 使用方式

```tsx
import { AiMap, PointLayer, ZoomControl } from '@antv/aimapui';

function App() {
  return (
    <AiMap
      autoFit
      map={{
        basemap: 'gaode',
        center: [116.39, 39.9],
        zoom: 10,
        style: 'light',
      }}
    >
      <PointLayer source={data} color="#5B8FF9" size={12} />
      <ZoomControl position="bottomright" />
    </AiMap>
  );
}
```

## 可用主题

通过 `MapThemeControl` 组件配合 `GAODE_THEME_PRESETS` 可快速切换主题：

```tsx
import { MapThemeControl, GAODE_THEME_PRESETS } from '@antv/aimapui';

<MapThemeControl position="topleft" options={GAODE_THEME_PRESETS} />
```

| 主题值 | 说明 |
|--------|------|
| `light` | 浅色标准底图 |
| `dark` | 深色底图 |
| `normal` | 经典底图 |
| `fresh` | 清新风格 |

## 适用场景

- 面向国内用户的 ToB / ToC 业务系统
- 需要精准国内 POI / 路网 / 行政区划数据
- 对地图合规性有要求的政府、金融等行业项目

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `basemap` | `'gaode'` | - | 指定使用高德地图引擎 |
| `center` | `[number, number]` | `[105, 35]` | 初始中心点 [经度, 纬度] |
| `zoom` | `number` | `4` | 初始缩放级别 |
| `style` | `string` | `'light'` | 底图样式 |
| `token` | `string` | 内置 | 高德地图 API Key，生产环境建议使用自有 key |

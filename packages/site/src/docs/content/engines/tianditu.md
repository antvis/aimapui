# 天地图

天地图是国家测绘地理信息局主导建设的国家地理信息公共服务平台，提供权威的地理信息服务。

## 特点

- **国家权威数据源**：由国家测绘地理信息局主导，数据权威性最高
- **审图合规**：天然符合国家地图审图要求，适合政府、军事等对合规性要求极高的场景
- **多种底图类型**：支持矢量底图、卫星影像、混合底图、地形底图、地形混合等 5 种底图
- **免费使用**：注册即可获取 token，个人和企业均可免费使用
- **WMTS 标准服务**：提供标准 WMTS 瓦片服务，兼容性好

## 使用方式

天地图支持两种接入方式：

### 方式一：天地图原生引擎

使用 L7 内置的天地图引擎，直接加载天地图 SDK：

```tsx
import { AiMap, PointLayer, ZoomControl } from '@antv/aimapui';

function App() {
  return (
    <AiMap
      autoFit
      map={{
        basemap: 'tianditu',
        token: 'your-tianditu-token',
        center: [105, 35],
        zoom: 4,
      }}
    >
      <PointLayer source={data} color="#5B8FF9" size={12} />
      <ZoomControl position="bottomright" />
    </AiMap>
  );
}
```

### 方式二：独立引擎 + 瓦片叠加

使用 L7 内置 Map 引擎，通过 `RasterLayer` 加载天地图 WMTS 瓦片，无需引入天地图 SDK：

```tsx
import { AiMap, RasterLayer, ZoomControl } from '@antv/aimapui';

const TDT_TOKEN = 'your-tianditu-token';

function App() {
  return (
    <AiMap autoFit map={{ basemap: 'map', center: [105, 35], zoom: 4, style: 'blank' }}>
      <RasterLayer
        source={`https://t{1-7}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${TDT_TOKEN}`}
        sourceType="rasterTile"
        sourceConfig={{ parser: { type: 'rasterTile', tileSize: 256, zoomOffset: 1 } }}
        zIndex={0}
      />
      <ZoomControl position="bottomright" />
    </AiMap>
  );
}
```

## 可用底图类型

| 类型 | 说明 |
|------|------|
| 矢量底图 | 标准矢量地图，信息清晰 |
| 卫星影像 | 高分辨率卫星影像 |
| 混合底图 | 卫星影像 + 道路标注叠加 |
| 地形底图 | 地形晕渲图 |
| 地形混合 | 地形晕渲 + 道路标注叠加 |

## 适用场景

- 政府、军事等对地图数据权威性和合规性要求极高的项目
- 需要在内网或离线环境使用的场景（可部署天地图离线服务）
- 国产化信创项目

## Token 申请

前往 [天地图开放平台](https://console.tianditu.gov.cn/) 注册并申请应用 key。

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `basemap` | `'tianditu'` | - | 指定使用天地图引擎 |
| `center` | `[number, number]` | `[105, 35]` | 初始中心点 [经度, 纬度] |
| `zoom` | `number` | `4` | 初始缩放级别 |
| `token` | `string` | - | **必填**，天地图应用 key |

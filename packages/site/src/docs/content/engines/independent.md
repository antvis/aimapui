# 独立地图引擎

独立地图引擎（`basemap: 'map'`）是 L7 内置的轻量地图引擎，不依赖任何第三方地图 SDK，通过 `RasterLayer` 叠加瓦片服务实现底图渲染。

## 特点

- **零外部依赖**：不加载任何第三方地图 SDK，包体积最小
- **完全自主可控**：底图瓦片来源完全由开发者控制，适合内网部署
- **灵活的瓦片叠加**：可自由组合任意 WMTS / TMS / XYZ 瓦片服务作为底图
- **适合特殊底图需求**：如天地图 WMTS 瓦片、自建瓦片服务、离线瓦片包等
- **无坐标系限制**：使用 WGS84 坐标系（EPSG:4326），无坐标纠偏问题

## 使用方式

以叠加天地图 WMTS 瓦片为例：

```tsx
import { AiMap, RasterLayer, PointLayer, ZoomControl } from '@antv/aimapui';

const TDT_TOKEN = 'your-tianditu-token';

function App() {
  return (
    <AiMap autoFit map={{ basemap: 'map', center: [105, 35], zoom: 4, style: 'blank' }}>
      {/* 底图瓦片 */}
      <RasterLayer
        source={`https://t{1-7}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${TDT_TOKEN}`}
        sourceType="rasterTile"
        sourceConfig={{ parser: { type: 'rasterTile', tileSize: 256, zoomOffset: 1 } }}
        zIndex={0}
      />
      {/* 文字标注层 */}
      <RasterLayer
        source={`https://t{1-7}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${TDT_TOKEN}`}
        sourceType="rasterTile"
        sourceConfig={{ parser: { type: 'rasterTile', tileSize: 256, zoomOffset: 1 } }}
        zIndex={1}
      />
      {/* 业务图层 */}
      <PointLayer source={data} color="#5B8FF9" size={12} zIndex={2} />
      <ZoomControl position="bottomright" />
    </AiMap>
  );
}
```

## 与其他引擎的区别

| 对比项 | 独立引擎 | 商业引擎（高德/腾讯/百度等） |
|--------|---------|---------------------------|
| 外部 SDK | 不加载 | 需加载第三方 SDK |
| 底图来源 | 自由叠加瓦片 | 引擎内置底图 |
| 包体积 | 最小 | 需额外加载 SDK |
| 适用环境 | 公网 / 内网 / 离线 | 通常需要公网 |
| 主题切换 | 切换瓦片源 | API 调用切换 |

## 适用场景

- 内网部署、离线环境，无法访问第三方地图 SDK
- 需要使用自建瓦片服务（如 GeoServer、MapProxy）
- 对包体积敏感，希望最小化外部依赖
- 需要叠加特殊瓦片源（如历史地图、遥感影像等）

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `basemap` | `'map'` | - | 指定使用独立地图引擎 |
| `center` | `[number, number]` | `[105, 35]` | 初始中心点 [经度, 纬度] |
| `zoom` | `number` | `4` | 初始缩放级别 |
| `style` | `string` | `'blank'` | 建议使用 `'blank'` 空白底图，通过 RasterLayer 叠加瓦片 |

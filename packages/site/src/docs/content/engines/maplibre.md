# MapLibre

MapLibre GL JS 是一个开源的 WebGL 地图渲染引擎，从 Mapbox GL JS v1 分叉而来，采用 BSD-3 许可证，完全免费且无需 token。

## 特点

- **完全开源免费**：无需 API Key，无调用次数限制，适合预算有限或对开源有要求的项目
- **矢量瓦片渲染**：基于 WebGL 的高性能矢量瓦片渲染，支持平滑缩放和旋转
- **样式灵活可控**：兼容 Mapbox Style Spec，可使用任意符合规范的矢量瓦片服务
- **社区活跃**：由 MapLibre 开源社区维护，更新频繁，生态丰富
- **AiMapUI 默认 Schema 引擎**：Schema 模式下默认使用 MapLibre，无需额外配置

## 使用方式

```tsx
import { AiMap, PointLayer, ZoomControl } from '@antv/aimapui';

function App() {
  return (
    <AiMap
      autoFit
      map={{
        basemap: 'maplibre',
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

## 可用主题

内置 OpenFreeMap 主题预设，通过 `OPENFREEMAP_THEME_PRESETS` 使用：

```tsx
import { MapThemeControl, OPENFREEMAP_THEME_PRESETS } from '@antv/aimapui';

<MapThemeControl position="topleft" options={OPENFREEMAP_THEME_PRESETS} />
```

## 适用场景

- 对开源和数据自主可控有要求的项目
- 海外业务或全球化项目
- 需要自建瓦片服务的内网部署场景
- AI 生成地图（Schema 模式默认引擎）

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `basemap` | `'maplibre'` | - | 指定使用 MapLibre 引擎 |
| `center` | `[number, number]` | `[105, 35]` | 初始中心点 [经度, 纬度] |
| `zoom` | `number` | `4` | 初始缩放级别 |
| `style` | `string` | `'light'` | 底图样式，支持自定义 Style JSON URL |
| `token` | `string` | - | 无需 token |

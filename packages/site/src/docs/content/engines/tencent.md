# 腾讯地图

腾讯地图（Tencent Map）由腾讯位置服务提供，是国内主流的商业地图引擎之一。

## 特点

- **微信生态集成**：与微信小程序地图同源，适合微信生态内的业务
- **数据实时性强**：POI 数据更新频率高，城市覆盖好
- **个性化样式**：支持在腾讯位置服务后台创建个性化地图样式
- **国内合规**：采用 GCJ-02 坐标系，符合国内地图使用规范

## 使用方式

```tsx
import { AiMap, PointLayer, ZoomControl } from '@antv/aimapui';

function App() {
  return (
    <AiMap
      autoFit
      map={{
        basemap: 'tencent',
        token: 'your-tencent-key',
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

## 主题切换

腾讯地图的个性化样式需要先在 [腾讯位置服务后台](https://lbs.qq.com/dev/console/personalStyles/) 创建并发布个性化样式，获得 `styleId` 后通过原生 API 切换：

```tsx
const handleThemeChange = (value: string) => {
  nativeMap.setMapStyleId(value);
};
```

## 适用场景

- 微信生态相关业务（小程序、公众号等）
- 需要与腾讯系产品（QQ、腾讯云等）深度集成的项目
- 对城市级 POI 数据有较高要求的本地生活类应用

## Token 申请

前往 [腾讯位置服务](https://lbs.qq.com/) 注册并创建应用获取 key。

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `basemap` | `'tencent'` | - | 指定使用腾讯地图引擎 |
| `center` | `[number, number]` | `[105, 35]` | 初始中心点 [经度, 纬度] |
| `zoom` | `number` | `4` | 初始缩放级别 |
| `style` | `string` | `'light'` | 底图样式 |
| `token` | `string` | - | **必填**，腾讯位置服务 key |

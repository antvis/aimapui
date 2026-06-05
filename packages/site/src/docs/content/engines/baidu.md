# 百度地图

百度地图（Baidu Map）由百度提供，使用 BMapGL 引擎，是国内主流商业地图引擎之一。

## 特点

- **3D 渲染能力**：BMapGL 引擎基于 WebGL，支持 3D 建筑、地球模式等
- **AI 能力集成**：与百度 AI 生态深度集成，支持智能出行、路径规划等
- **丰富的本地数据**：POI 搜索、周边服务等数据覆盖广泛
- **自定义样式灵活**：支持通过 JSON 配置实现精细化的样式控制，无需后台申请 styleId
- **BD-09 坐标系**：采用百度自有的 BD-09 坐标系，使用时需注意坐标转换

## 使用方式

```tsx
import { AiMap, PointLayer, ZoomControl } from '@antv/aimapui';

function App() {
  return (
    <AiMap
      autoFit
      map={{
        basemap: 'baidu',
        token: 'your-baidu-ak',
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

百度地图支持通过本地 JSON 样式配置切换主题，无需在百度后台申请：

```tsx
import { MapThemeControl } from '@antv/aimapui';

// 通过 nativeMap.setMapStyleV2({ styleJson }) 切换主题
const handleThemeChange = (value: string) => {
  nativeMap.setMapStyleV2({ styleJson: BAIDU_STYLE_MAP[value] });
};
```

内置支持标准、灰阶、暗色、蓝调 4 种主题。

## 适用场景

- 与百度生态（百度搜索、百度 AI、Apollo 等）深度集成的项目
- 需要 3D 城市渲染、地球模式等高级视觉效果
- 出行、导航等需要百度路径规划能力的业务

## Token 申请

前往 [百度地图开放平台](https://lbsyun.baidu.com/) 注册并创建应用获取 AK。

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `basemap` | `'baidu'` | - | 指定使用百度地图引擎 |
| `center` | `[number, number]` | `[105, 35]` | 初始中心点 [经度, 纬度] |
| `zoom` | `number` | `4` | 初始缩放级别 |
| `style` | `string` | `'light'` | 底图样式 |
| `token` | `string` | - | **必填**，百度地图 AK |

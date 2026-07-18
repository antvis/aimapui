# SatelliteLayerControl

卫星影像图层控制面板，点击按钮弹出 Popper 面板，支持切换卫星图源、开关显隐和调节透明度。

> **何时选择：** 需要在地图上叠加卫星影像底图并允许用户控制时用 SatelliteLayerControl；只需切换标准/暗色等矢量底图主题时用 [MapThemeControl](./map-theme-control)；只需控制业务图层的显隐时用 [LayerSwitchControl](./layer-switch-control)。

## 导入

```tsx
import { SatelliteLayerControl } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | [ControlPosition](#controlposition) | `'topright'` | 控件在地图上的位置 |
| `activeProvider` | [SatelliteProvider](#satelliteprovider) | `'gaode'` | 当前激活的卫星图源。切换后地图叠加的卫星瓦片来源随之改变 |
| `visible` | `boolean` | `true` | 卫星图层是否可见，控制面板中开关的初始状态 |
| `opacity` | `number` | `1` | 卫星图层透明度，范围 0~1。1 为全不透明，0 为全透明 |
| `onProviderChange` | `(provider: SatelliteProvider) => void` | - | 切换卫星图源后的回调，`provider` 为新选中的图源标识 |
| `onVisibleChange` | `(visible: boolean) => void` | - | 显隐切换回调，`visible` 为切换后的状态 |
| `onOpacityChange` | `(opacity: number) => void` | - | 透明度变化回调，`opacity` 为新值（0~1） |
| `providers` | [SatelliteProvider[]](#satelliteprovider) | `['gaode', 'tianditu', 'google']` | 面板中可选的卫星图源列表，按数组顺序展示。传入子集可隐藏不需要的选项 |
| `className` | `string` | - | 自定义 CSS 类名，用于覆盖控件样式 |
| `style` | `React.CSSProperties` | - | 自定义行内样式 |

### SatelliteProvider

```typescript
type SatelliteProvider = 'gaode' | 'tianditu' | 'google'
```

| 值 | 图源 | 说明 |
|----|------|------|
| `'gaode'` | 高德卫星 | 国内首选，瓦片加载稳定 |
| `'tianditu'` | 天地图卫星 | 国家地理信息公共服务平台，适合政务场景 |
| `'google'` | Google 卫星 | 全球覆盖，海外区域清晰度更高，国内访问可能受限 |

### ControlPosition

```typescript
type ControlPosition =
  | 'topleft' | 'topright'
  | 'bottomleft' | 'bottomright'
  | 'topcenter' | 'bottomcenter'
  | 'lefttop' | 'leftbottom'
  | 'righttop' | 'rightbottom'
  | 'leftcenter' | 'rightcenter'
```

## 示例

### 基础用法 — 默认卫星图控制

点击按钮弹出面板，默认提供高德/天地图/Google 三个图源切换，同时支持显隐和透明度调节：

```tsx
import { AiMap, SatelliteLayerControl } from '@antv/aimapui'

<AiMap autoFit map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 10 }}>
  <SatelliteLayerControl />
</AiMap>
```

### 限定图源 — 仅高德和天地图

内网或政务场景下 Google 图源不可用，只展示国内可选图源：

```tsx
import { AiMap, SatelliteLayerControl } from '@antv/aimapui'

<AiMap autoFit map={{ basemap: 'gaode', center: [121.473, 31.230], zoom: 11 }}>
  <SatelliteLayerControl
    providers={['gaode', 'tianditu']}
    activeProvider="tianditu"
    onProviderChange={(provider) => console.log('切换图源：', provider)}
  />
</AiMap>
```

### 受控模式 — 外部同步状态

将卫星图状态提升到父组件，实现与其他 UI（如侧边栏图层列表）联动：

```tsx
import { useState } from 'react'
import { AiMap, SatelliteLayerControl } from '@antv/aimapui'

function SatelliteDemo() {
  const [provider, setProvider] = useState('gaode')
  const [visible, setVisible] = useState(true)
  const [opacity, setOpacity] = useState(1)

  return (
    <AiMap autoFit map={{ basemap: 'gaode', center: [113.26, 23.13], zoom: 10 }}>
      <SatelliteLayerControl
        activeProvider={provider}
        visible={visible}
        opacity={opacity}
        onProviderChange={setProvider}
        onVisibleChange={setVisible}
        onOpacityChange={setOpacity}
      />
    </AiMap>
  )
}
```

## 注意事项

- 卫星图源切换会重新加载瓦片，有短暂白屏属于正常现象；`onProviderChange` 在图源实际生效后触发
- Google 图源在国内网络环境下可能加载缓慢或失败，建议根据项目部署环境通过 `providers` 过滤可选图源
- `opacity` 设为 0 时卫星图层全透明但仍参与渲染，如不需要卫星图应通过 `visible` 关闭以节省资源
- 控件通常与 SatelliteLayer 组件配合使用：SatelliteLayerControl 负责交互，SatelliteLayer 负责实际的瓦片加载和渲染
- 面板通过点击按钮弹出（Popper），点击面板外区域自动关闭

## 相关组件

- [MapThemeControl](./map-theme-control) — 底图主题切换，切换标准/暗色等矢量底图而非卫星影像
- [LayerSwitchControl](./layer-switch-control) — 业务图层开关，控制业务图层而非卫星底图
- [FullscreenControl](./fullscreen-control) — 全屏控件，全屏查看卫星图效果

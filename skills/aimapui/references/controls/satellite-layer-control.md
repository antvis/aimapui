# SatelliteLayerControl — 卫星影像控件

卫星影像图层切换控件，提供提供商选择、可见性开关和透明度调节功能。通常与 `SatelliteLayer` 组件配合使用。

默认位置：`topright`

## 目录

- [基础用法](#基础用法)
- [完整示例](#完整示例)
- [属性](#属性)
- [支持的提供商](#支持的提供商)
- [与 SatelliteLayer 配合](#与-satellitelayer-配合)
- [相关文档](#相关文档)

## 基础用法

```tsx
import { SatelliteLayerControl, SatelliteLayer } from '@antv/aimapui';
import { useState } from 'react';

const [provider, setProvider] = useState('gaode');
const [visible, setVisible] = useState(true);
const [opacity, setOpacity] = useState(1);

<AiMap map={{ basemap: 'map' }}>
  <SatelliteLayer provider={provider} visible={visible} opacity={opacity} />
  <SatelliteLayerControl
    activeProvider={provider}
    visible={visible}
    opacity={opacity}
    onProviderChange={setProvider}
    onVisibleChange={setVisible}
    onOpacityChange={setOpacity}
  />
</AiMap>
```

## 完整示例

```tsx
import { AiMap, SatelliteLayer, SatelliteLayerControl } from '@antv/aimapui';
import { useState } from 'react';
import type { SatelliteProvider } from '@antv/aimapui';

export default function SatelliteDemo() {
  const [provider, setProvider] = useState<SatelliteProvider>('gaode');
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(0.8);

  return (
    <AiMap map={{ basemap: 'map', center: [116.39, 39.9], zoom: 10 }}>
      <SatelliteLayer
        provider={provider}
        visible={visible}
        opacity={opacity}
      />
      <SatelliteLayerControl
        position="topright"
        activeProvider={provider}
        visible={visible}
        opacity={opacity}
        providers={['gaode', 'tianditu', 'google']}
        onProviderChange={setProvider}
        onVisibleChange={setVisible}
        onOpacityChange={setOpacity}
      />
    </AiMap>
  );
}
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `ControlPosition` | `'topright'` | 控件位置 |
| `activeProvider` | `SatelliteProvider` | `'gaode'` | 当前激活的提供商 |
| `visible` | `boolean` | `true` | 卫星图层是否可见 |
| `opacity` | `number` | `1` | 透明度 0~1 |
| `providers` | `SatelliteProvider[]` | 全部三种 | 可选的提供商列表 |
| `onProviderChange` | `(provider: SatelliteProvider) => void` | — | 提供商切换回调 |
| `onVisibleChange` | `(visible: boolean) => void` | — | 可见性切换回调 |
| `onOpacityChange` | `(opacity: number) => void` | — | 透明度变化回调 |
| `className` | `string` | — | 额外 CSS 类名 |
| `style` | `CSSProperties` | — | 额外内联样式 |

## 支持的提供商

| 提供商 | 显示名称 | Token 要求 |
|--------|---------|-----------|
| `gaode` | 高德卫星 | 无需 |
| `tianditu` | 天地图卫星 | 需要（有内置默认值） |
| `google` | 谷歌卫星 | 无需 |

通过 `providers` 属性可限制可选范围：

```tsx
// 仅显示高德和天地图
<SatelliteLayerControl providers={['gaode', 'tianditu']} />
```

## 与 SatelliteLayer 配合

`SatelliteLayerControl` 是纯 UI 控件，不直接操作地图图层。需要通过状态管理与 `SatelliteLayer` 联动：

```tsx
// ✅ 正确：通过状态联动
const [provider, setProvider] = useState('gaode');
<SatelliteLayer provider={provider} />
<SatelliteLayerControl activeProvider={provider} onProviderChange={setProvider} />

// ❌ 错误：控件不会自动影响图层
<SatelliteLayer provider="gaode" />
<SatelliteLayerControl /> {/* 切换不会生效 */}
```

## 相关文档

- [controls.md](controls.md) — 所有控件概览
- [satellite-layer.md](../composite/satellite-layer.md) — 卫星影像图层规范

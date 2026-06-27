# Maki Icon Utilities — 内置地图图标

内置 200+ Maki 矢量图标（POI 地图常用），可生成 SVG data URL 直接用于 `IconLayer` 或 `Marker`。图标基于 [Mapbox Maki Icons](https://mapbox.com/maki-icons/)（CC0 1.0）。

## Exports

```tsx
import {
  MAKI_ICONS,           // Record<string, string> — 图标名 → SVG path data
  MAKI_ICON_NAMES,      // string[] — 所有可用图标名列表
  makiIconUrl,          // 单个图标 → SVG data URL
  makiPinUrl,           // 单个图标 → 带水滴底座的 Pin SVG data URL
  createMakiIconMap,    // 批量生成 { name: dataUrl } 映射
  createMakiPinMap,     // 批量生成 Pin 版本映射
} from '@antv/aimapui';
```

## API

### makiIconUrl(icon, opts?)

生成指定 Maki 图标的 SVG data URL。

```ts
const url = makiIconUrl('cafe', { size: 32, fill: '#333' });
// → 'data:image/svg+xml,...'
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `icon` | `string` | **必填** | Maki 图标名 |
| `opts.size` | `number` | `32` | SVG 尺寸 |
| `opts.fill` | `string` | `'#333'` | 填充颜色 |

### makiPinUrl(icon, opts?)

生成带水滴形底座的 Pin 图标 SVG data URL。

```ts
const pinUrl = makiPinUrl('restaurant', { size: 40, fill: '#2563eb' });
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `icon` | `string` | **必填** | Maki 图标名 |
| `opts.size` | `number` | `40` | SVG 尺寸 |
| `opts.fill` | `string` | `'#2563eb'` | Pin 底座填充颜色 |

### createMakiIconMap(names, opts?)

批量生成 `{ name: dataUrl }` 映射表，直接传给 `IconLayer.iconMap`。

```tsx
const iconMap = createMakiIconMap(['cafe', 'bus', 'hospital'], { size: 32, fill: '#333' });
// → { cafe: 'data:...', bus: 'data:...', hospital: 'data:...' }

<IconLayer iconField="type" iconMap={iconMap} />
```

### createMakiPinMap(names, opts?)

同上，但生成 Pin 样式版本。

```tsx
const pinMap = createMakiPinMap(['cafe', 'bus'], { fill: '#10b981' });
```

## 常用图标名

`airport`, `bus`, `cafe`, `restaurant`, `hospital`, `hotel`, `parking`, `school`, `shop`, `bank`, `bar`, `bicycle`, `car`, `cinema`, `fire-station`, `fuel`, `garden`, `library`, `museum`, `park`, `pharmacy`, `police`, `post`, `swimming`, `theatre`, `toilet`, `marker`, `circle`, `star`, `building`, `city`, `harbor`, `bridge`, `ferry`, `rail`, `bicycle-share`, `charging-station`, `beer`, `bbq`, `beach`, `camping`, `golf`, `skiing`, `soccer`, `baseball`, `basketball`, `tennis`, `volleyball`, `amusement-park`, `aquarium`, `art-gallery`, `attraction`, `bakery`, `bank`, `cafe`, `castle`, `cemetery`, `college`, `construction`, `dog-park`, `drinking-water`, `embassy`, `fast-food`, `fitness-centre`, `florist`, `furniture`, `grocery`, `hairdresser`, `hardware`, `ice-cream`, `jewelry-store`, `laundry`, `lodging`, `mobile-phone`, `monument`, `music`, `optician`, `pharmacy`, `place-of-worship`, `playground`, `prison`, `ranger-station`, `religious-christian`, `religious-jewish`, `religious-muslim`, `shelter`, `shoe`, `slipway`, `suitcase`, `sushi`, `teahouse`, `telephone`, `toilet`, `veterinary`, `warehouse`, `waste-basket`, `water`, `wetland`, `zoo`.

## 与 IconLayer 配合使用

```tsx
import { IconLayer, createMakiIconMap } from '@antv/aimapui';

const iconMap = createMakiIconMap(['cafe', 'restaurant', 'bus'], {
  size: 32,
  fill: '#2563eb',
});

<IconLayer
  source={poiData}
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="type"
  iconMap={iconMap}
  iconAnchor="bottom"
  labelField="name"
  labelAnchor="top"
/>
```

## 相关文档

- [index.md](index.md) — 交互组件概览
- [marker.md](marker.md) — 标注组件
- [icon-layer.md](../composite/icon-layer.md) — 图片图标图层
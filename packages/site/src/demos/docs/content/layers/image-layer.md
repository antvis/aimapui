# ImageLayer

图片叠加图层，在地图上叠加自定义图片，通过经纬度坐标定位。

## 导入

```tsx
import { ImageLayer } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `source` | `any` | **必填** | 图片数据源 |
| `sourceType` | `string` | `'image'` | 数据源类型 |
| `sourceConfig` | `object` | - | 配置：`coordinates` 指定四角经纬度 |
| `style` | `object` | - | 样式：`opacity` |
| `visible` | `boolean` | `true` | 是否可见 |
| `zIndex` | `number` | `0` | 层级 |

## 事件

| 事件 | 类型 | 说明 |
|------|------|------|
| `onClick` | `(e: LayerEvent) => void` | 点击 |

## 示例

```tsx
<ImageLayer
  source="https://example.com/overlay.png"
  sourceType="image"
  sourceConfig={{
    coordinates: [
      [116.1, 40.1], [116.7, 40.1],
      [116.7, 39.7], [116.1, 39.7],
    ],
  }}
  style={{ opacity: 0.7 }}
/>
```

# RasterLayer

栅格瓦片图层，用于加载和展示栅格瓦片服务。

## 导入

```tsx
import { RasterLayer } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `source` | `any` | **必填** | 栅格瓦片数据源 URL 或配置 |
| `sourceType` | `string` | `'raster'` | 数据源类型 |
| `sourceConfig` | `object` | - | 数据源解析配置 |
| `style` | `object` | - | 样式：`opacity` |
| `visible` | `boolean` | `true` | 是否可见 |
| `zIndex` | `number` | `0` | 层级 |

## 事件

| 事件 | 类型 | 说明 |
|------|------|------|
| `onClick` | `(e: LayerEvent) => void` | 点击 |

## 示例

```tsx
<RasterLayer
  source="https://tiles.example.com/{z}/{x}/{y}.png"
  sourceType="raster"
  style={{ opacity: 0.8 }}
/>
```

# IconLayer

图片图标标注图层，通过 iconMap 注册图片资源，支持缩放适配。

## 导入

```tsx
import { IconLayer } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `source` | `any` | - | 数据源（必填） |
| `iconField` | `string` | - | 图标字段名（必填） |
| `iconMap` | `Record<string, string>` | - | 图标名称到图片 URL 映射（必填） |
| `iconSize` | `number` | - | 图标大小 |
| `showLabel` | `boolean` | - | 是否显示标签 |
| `labelField` | `string` | - | 标签取值字段 |
| `labelColor` | `string` | - | 标签颜色 |
| `labelSize` | `number` | - | 标签字号 |
| `labelAnchor` | `LabelAnchor` | - | 标签锚点位置 |
| `textAllowOverlap` | `boolean` | - | 文字是否允许重叠 |
| `iconAllowOverlap` | `boolean` | - | 图标是否允许重叠 |
| `zoomAdaption` | `boolean` | - | 是否跟随缩放自适应 |
| `style` | `object` | - | 自定义样式 |
| `active` | `object` | - | 激活态样式 |
| `visible` | `boolean` | `true` | 是否可见 |

## 示例

```tsx
<IconLayer source={locations} iconField="type" iconMap={{ hospital: "/icons/hospital.png", school: "/icons/school.png" }} iconSize={24} showLabel labelField="name" />
```

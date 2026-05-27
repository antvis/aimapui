# IconFontLayer

字体图标标注图层，支持 Material Symbols Outlined 图标（158+个）和自定义 iconfont，带三级缩放适配策略。

## 导入

```tsx
import { IconFontLayer } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `source` | `any` | - | 数据源（必填） |
| `iconField` | `string` | - | 图标字段名（必填） |
| `iconFontFamily` | `'material-symbols' \| 'iconfont' \| string` | - | 字体图标族 |
| `iconFontPath` | `string` | - | 自定义字体文件路径 |
| `iconFontMap` | `object` | - | 图标名称到 Unicode 映射 |
| `iconColor` | `string` | - | 图标颜色 |
| `iconSize` | `number` | - | 图标大小 |
| `iconHaloColor` | `string` | - | 图标光晕颜色 |
| `iconHaloWidth` | `number` | - | 图标光晕宽度 |
| `showLabel` | `boolean` | `true` | 是否显示标签 |
| `labelField` | `string` | - | 标签取值字段 |
| `labelColor` | `string` | - | 标签颜色 |
| `labelSize` | `number` | - | 标签字号 |
| `labelAnchor` | `LabelAnchor` | - | 标签锚点位置 |
| `textAllowOverlap` | `boolean` | - | 文字是否允许重叠 |
| `iconAllowOverlap` | `boolean` | - | 图标是否允许重叠 |
| `zoomAdaption` | `boolean` | `true` | 是否跟随缩放自适应 |
| `style` | `object` | - | 自定义样式 |
| `active` | `object` | - | 激活态样式 |
| `visible` | `boolean` | `true` | 是否可见 |

## 示例

```tsx
<IconFontLayer source={pois} iconField="icon" iconFontFamily="material-symbols" iconColor="#3B82F6" iconSize={20} showLabel labelField="name" zoomAdaption />
```

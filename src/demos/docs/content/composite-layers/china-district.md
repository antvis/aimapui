# ChinaDistrict

中国行政区划图层，内置省/市/区三级行政区划 GeoJSON，支持下钻和业务数据关联。

## 导入

```tsx
import { ChinaDistrict } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `level` | `'province' \| 'city' \| 'district'` | - | 行政层级 |
| `drillEnabled` | `boolean` | `true` | 是否开启下钻 |
| `data` | `BusinessDataItem[]` | - | 业务数据 |
| `joinField` | `string` | - | 地理数据关联字段 |
| `dataJoinField` | `string` | - | 业务数据关联字段 |
| `valueField` | `string` | - | 数值字段 |
| `colors` | `string[]` | - | 色板数组 |
| `fillOpacity` | `number` | - | 填充透明度 |
| `strokeColor` | `string` | - | 描边颜色 |
| `strokeWidth` | `number` | - | 描边宽度 |
| `showLabel` | `boolean` | `true` | 是否显示标签 |
| `labelField` | `string` | - | 标签取值字段 |
| `hoverHighlight` | `boolean` | `true` | 是否开启悬停高亮 |
| `clickSelect` | `boolean` | `true` | 是否开启点击选中 |
| `showTooltip` | `boolean` | `true` | 是否显示 Tooltip |
| `onRegionClick` | `function` | - | 区域点击回调 |
| `onDrill` | `function` | - | 下钻回调 |

## 示例

```tsx
<ChinaDistrict level="province" data={businessData} joinField="name" dataJoinField="province" valueField="value" colors={['#DBEAFE', '#3B82F6', '#1E3A8A']} drillEnabled />
```

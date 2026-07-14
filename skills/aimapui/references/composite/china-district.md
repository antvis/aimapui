# ChinaDistrict — 行政区划下钻

省市区三级下钻 + 业务数据关联色阶映射。通过 Join 字段将业务数据与区划形状绑定。

## Examples

```tsx
import { ChinaDistrict, ADMIN_SEQUENTIAL_COLORS } from '@antv/aimapui';

// 按名称匹配业务数据
<ChinaDistrict
  data={[
    { name: '广东省', value: 145847 },
    { name: '江苏省', value: 128222 },
  ]}
  joinField="name"          // GeoJSON feature.properties 中的匹配字段
  dataJoinField="name"      // 业务数据中的匹配字段
  valueField="value"        // 用于色阶映射的数值字段
  colors={['#DBEAFE', '#3B82F6', '#1E3A8A']}
  onRegionClick={(feature, level) => console.log(feature, level)}
/>

// 按行政区划编码匹配
<ChinaDistrict
  data={[{ code: '440000', amount: 8900 }]}
  joinField="adcode"
  dataJoinField="code"
  valueField="amount"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `provinceSource` | `string \| Record<string, unknown>` | 内置全国省级数据 | 省级 GeoJSON 数据 URL 或对象 |
| `citySource` | `string \| Record<string, unknown>` | 内置全国市级数据 | 市级 GeoJSON 数据 URL 或对象 |
| `districtSource` | `string \| Record<string, unknown>` | 内置全国县级数据 | 县级 GeoJSON 数据 URL 或对象 |
| `level` | `'province' \| 'city' \| 'district'` | `'province'` | 当前显示层级（非下钻模式时使用） |
| `drillEnabled` | `boolean` | `true` | 是否启用下钻模式 |
| `drillPath` | `DrillPathNode[]` | — | 下钻路径（受控模式） |
| `onDrill` | `(path: DrillPathNode[]) => void` | — | 下钻回调，点击区域进入下一级时触发 |
| `onDrillUp` | `(path: DrillPathNode[]) => void` | — | 上钻回调，面包屑导航返回上级 |
| `autoFitOnDrill` | `boolean` | `true` | 下钻时是否自动适配视口（fitBounds） |
| `data` | `BusinessDataItem[]` | — | 业务数据，通过 name 或 adcode 与地理数据关联 |
| `joinField` | `string` | `'name'` | 关联字段（地理数据属性名） |
| `dataJoinField` | `string` | `'name'` | 业务数据匹配字段 |
| `valueField` | `string` | `'value'` | 数值字段名（用于色阶映射） |
| `colors` | `string[]` | 内置色阶 | 色阶颜色数组 |
| `fillOpacity` | `number` | — | 填充透明度 |
| `strokeColor` | `string` | — | 描边颜色 |
| `strokeWidth` | `number` | — | 描边宽度 |
| `dimOpacity` | `number` | — | 非焦点区域透明度（下钻时） |
| `showLabel` | `boolean` | — | 是否显示标签 |
| `labelField` | `string` | `'name'` | 标签字段名 |
| `labelSize` | `number` | `12` | 标签字号 |
| `hoverHighlight` | `boolean` | — | hover 高亮 |
| `clickSelect` | `boolean` | — | 点击选中 |
| `showTooltip` | `boolean` | — | Tooltip 显示 |
| `tooltipFields` | `string[]` | `[labelField, valueField]` | Tooltip 自定义字段 |
| `onRegionClick` | `(feature, level) => void` | — | 区域单击事件 |
| `onRegionDblclick` | `(feature, level) => void` | — | 区域双击事件（双击触发上卷时也会回调） |
| `zIndex` | `number` | — | 图层 zIndex |

## 交互模型

| 手势 | 行为 |
|------|------|
| 单击（click） | 下钻进入下一级（省→市→县） |
| 双击（dblclick） | 上卷返回上一级 |
| 面包屑点击 | 跳转到指定层级 |

> L7 中 `click` 和 `dblclick` 是原生支持的事件，两者互斥。

> 使用 L7 的 `undblclick` 事件（确认单击，排除双击的第一下）避免 click/dblclick 歧义；
> `dblclick` 直接上卷，无需额外确认。

## 命令式 API（ref）

| Method | Description |
|--------|-------------|
| `drillUp()` | 上钻一级 |
| `drillUpTo(targetIndex)` | 上钻到指定层级（面包屑索引用） |
| `getDrillPath()` | 获取当前下钻路径 |

## GeoJSON Matchable Fields

| Field | Format | Example |
|-------|--------|---------|
| `name` | 中文全称 | `"广东省"` / `"深圳市"` / `"南山区"` |
| `gb` | 9位国标码 | `"156440000"`（"156" + 6位行政编码） |

> 使用 `adcode` 匹配时，组件自动处理 "156" 前缀，传 6 位码（如 `"440000"`）即可。

## Types

```ts
interface BusinessDataItem {
  name?: string;
  adcode?: string | number;
  value?: number;
  [key: string]: unknown;
}
```

**DrillPathNode:** `{ level: 'province' | 'city' | 'district', name: string, adcode?: string | number }`

## Built-in Data Sources

- `DEFAULT_PROVINCE_SOURCE` — 34 provinces
- `DEFAULT_CITY_SOURCE` — 375 cities
- `DEFAULT_DISTRICT_SOURCE` — 2891 districts

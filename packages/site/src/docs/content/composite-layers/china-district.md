# ChinaDistrict

中国行政区划图层，内置省/市/区三级行政区划 GeoJSON，支持下钻和业务数据关联。

## 导入

```tsx
import { ChinaDistrict } from '@antv/aimapui'
import type { ChinaDistrictHandle, BusinessDataItem } from '@antv/aimapui'
```

## 业务数据绑定

ChinaDistrict 通过 **字段匹配（Join）** 将业务数据与行政区划形状关联，再用数值字段驱动色阶映射。

### 核心数据结构

```typescript
interface BusinessDataItem {
  name?: string;            // 区划名称（如 "广东省"）
  adcode?: string | number; // 行政区划编码（6位，如 "440000"）
  value?: number;           // 数值，用于色阶映射
  [key: string]: unknown;   // 可扩展任意业务字段
}
```

### 匹配字段说明

内置 GeoJSON 中每个 feature 的 `properties` 包含以下可用于匹配的字段：

| 字段 | 格式 | 示例 | 说明 |
|------|------|------|------|
| `name` | 中文全称 | `"广东省"` / `"深圳市"` / `"南山区"` | 含行政后缀的官方名称 |
| `gb` | `"156" + 6位码` | `"156440000"` | 国家前缀(156) + 行政区划编码 |

> 组件内部会自动处理 `gb` 字段的 "156" 前缀，使用 `adcode` 匹配时传 6 位码（如 `"440000"`）或 9 位 gb 码均可。

### 三个关联 Props

| Prop | 默认值 | 作用 |
|------|--------|------|
| `joinField` | `'name'` | 指定 GeoJSON feature.properties 中用于匹配的字段 |
| `dataJoinField` | `'name'` | 指定业务数据中用于匹配的字段 |
| `valueField` | `'value'` | 指定业务数据中用于色阶映射的数值字段 |

### 匹配流程

```
业务数据                           GeoJSON feature.properties
┌──────────────────┐              ┌──────────────────┐
│ { province: "广东省",│   JOIN ON   │ { name: "广东省",   │
│   revenue: 999 } │ ──────────► │   gb: "156440000" }│
└──────────────────┘              └──────────────────┘
   dataJoinField="province"         joinField="name"
   valueField="revenue"
```

### 匹配字段参考数据下载

为方便查询内置 GeoJSON 中的 `name` 和 `adcode`（从 `gb` 提取），提供以下参考文件：

| 层级 | 数量 | JSON | CSV |
|------|------|------|-----|
| 省级 | 34 | [province-list.json](/district-data/province-list.json) | [province-list.csv](/district-data/province-list.csv) |
| 市级 | 375 | [city-list.json](/district-data/city-list.json) | [city-list.csv](/district-data/city-list.csv) |
| 区县级 | 2891 | [district-list.json](/district-data/district-list.json) | [district-list.csv](/district-data/district-list.csv) |

文件格式示例：

```json
[
  { "name": "北京市", "adcode": "110000", "gb": "156110000" },
  { "name": "天津市", "adcode": "120000", "gb": "156120000" },
  ...
]
```

> 使用时可直接将业务数据的关联字段值与上表中的 `name` 或 `adcode` 对齐即可完成数据绑定。

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `level` | `'province' \| 'city' \| 'district'` | `'province'` | 单层模式下显示的行政层级 |
| `drillEnabled` | `boolean` | `true` | 是否启用下钻模式，默认开启 |
| `drillPath` | `DrillPathNode[]` | - | 受控模式下钻路径 |
| `onDrill` | `(path: DrillPathNode[]) => void` | - | 下钻回调（点击区域进入下一级时触发） |
| `onDrillUp` | `(path: DrillPathNode[]) => void` | - | 上钻回调（用于面包屑导航返回上级） |
| `autoFitOnDrill` | `boolean` | `true` | 下钻/上钻时是否自动 fitBounds 适配视口 |
| `data` | `BusinessDataItem[]` | - | 业务数据 |
| `joinField` | `string` | `'name'` | 地理数据关联字段（对应 GeoJSON properties 中的字段） |
| `dataJoinField` | `string` | `'name'` | 业务数据关联字段（对应 data 数组中每项的字段名） |
| `valueField` | `string` | `'value'` | 数值字段（用于色阶映射） |
| `colors` | `string[]` | `ADMIN_SEQUENTIAL_COLORS` | 色板数组 |
| `fillOpacity` | `number` | `0.8` | 填充透明度 |
| `strokeColor` | `string` | `'rgba(255,255,255,0.5)'` | 描边颜色 |
| `strokeWidth` | `number` | `1.5` | 描边宽度 |
| `dimOpacity` | `number` | `0.12` | 下钻时父级背景虚化透明度 |
| `showLabel` | `boolean` | `true` | 是否显示标签 |
| `labelField` | `string` | `'name'` | 标签取值字段 |
| `labelSize` | `number` | `12` | 标签字号 |
| `hoverHighlight` | `boolean` | `true` | 是否开启悬停高亮 |
| `clickSelect` | `boolean` | `true` | 是否开启点击选中 |
| `showTooltip` | `boolean` | `true` | 是否显示 Tooltip |
| `tooltipFields` | `string[]` | - | Tooltip 自定义字段 |
| `onRegionClick` | `(feature, level) => void` | - | 区域点击回调 |
| `zIndex` | `number` | `0` | 图层 zIndex |

## 命令式 API（ref）

通过 `useRef<ChinaDistrictHandle>` 获取：

| 方法 | 说明 |
|------|------|
| `drillUp()` | 返回上一级 |
| `drillUpTo(index)` | 返回到面包屑指定层级 |
| `getDrillPath()` | 获取当前下钻路径 |

## 下钻模式 vs 单层模式

| 行为 | 下钻模式（`drillEnabled=true`） | 单层模式（`drillEnabled=false`） |
|------|---|---|
| 层级决定 | 由 `drillPath` 长度自动推断 | 固定为 `level` prop |
| 点击区域 | 触发 `onRegionClick` + 下钻到下一级 | 仅触发 `onRegionClick` |
| 父级背景 | 渲染虚化的上级区域 | 不渲染 |
| 视口适配 | 自动 fitBounds 到当前区域 | 无 |
| 面包屑 | 通过 `onDrill` / `onDrillUp` 回调 + `drillPath` 实现 | 不适用 |

## 示例

### 按名称匹配（最常用）

```tsx
const GDP_DATA = [
  { name: '广东省', value: 145847 },
  { name: '江苏省', value: 128222 },
  { name: '山东省', value: 92069 },
  // ...其他省份
];

<ChinaDistrict
  data={GDP_DATA}
  joinField="name"
  dataJoinField="name"
  valueField="value"
  colors={['#DBEAFE', '#3B82F6', '#1E3A8A']}
/>
```

### 按行政区划编码匹配

```tsx
const SALES_DATA = [
  { code: '440000', amount: 8900 },
  { code: '320000', amount: 7600 },
  { code: '330000', amount: 6500 },
];

<ChinaDistrict
  data={SALES_DATA}
  joinField="adcode"
  dataJoinField="code"
  valueField="amount"
/>
```

> **注意：** 内置 GeoJSON 中原始字段是 `gb`（9位，含 "156" 前缀），组件内部已做标准化处理，`joinField` 使用 `"adcode"` 即可匹配 6 位行政编码。

### 业务字段名与 GeoJSON 不同

```tsx
const DATA = [
  { province: '广东省', revenue: 999 },
  { province: '浙江省', revenue: 888 },
];

<ChinaDistrict
  data={DATA}
  joinField="name"           // GeoJSON 里的字段
  dataJoinField="province"   // 业务数据里的字段
  valueField="revenue"       // 色阶用 revenue
  colors={['#DBEAFE', '#3B82F6', '#1E3A8A']}
/>
```

### 受控下钻 + 面包屑导航

```tsx
const [drillPath, setDrillPath] = useState<DrillPathNode[]>([
  { level: 'province', name: '中国' },
]);

<>
  {/* 面包屑 */}
  <nav>
    {drillPath.map((node, i) => (
      <span key={i} onClick={() => {
        if (i < drillPath.length - 1) setDrillPath(drillPath.slice(0, i + 1));
      }}>
        {node.name} {i < drillPath.length - 1 && '› '}
      </span>
    ))}
  </nav>

  <ChinaDistrict
    drillPath={drillPath}
    onDrill={setDrillPath}
    data={businessData}
    joinField="name"
    dataJoinField="province"
    valueField="value"
  />
</>
```

### 单层模式（市级）

```tsx
<ChinaDistrict
  drillEnabled={false}
  level="city"
  data={businessData}
  joinField="name"
  dataJoinField="city"
  valueField="value"
/>
```

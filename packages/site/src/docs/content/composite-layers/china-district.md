# ChinaDistrict

中国行政区划图层，内置省/市/区三级行政区划 GeoJSON，支持下钻和业务数据关联。

## 导入

```tsx
import { ChinaDistrict } from '@antv/aimapui'
import type { ChinaDistrictHandle } from '@antv/aimapui'
```

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
| `joinField` | `string` | `'name'` | 地理数据关联字段 |
| `dataJoinField` | `string` | `'name'` | 业务数据关联字段 |
| `valueField` | `string` | `'value'` | 数值字段 |
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

### 基础用法 — 下钻模式（默认）

```tsx
<ChinaDistrict
  level="province"
  data={businessData}
  joinField="name"
  dataJoinField="province"
  valueField="value"
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

### 单层模式

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

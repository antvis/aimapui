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

## Data Binding

| Prop | Default | Description |
|------|---------|-------------|
| `joinField` | `'name'` | GeoJSON feature.properties 中用于匹配的字段 |
| `dataJoinField` | `'name'` | 业务数据中用于匹配的字段 |
| `valueField` | `'value'` | 业务数据中用于色阶映射的数值字段 |

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

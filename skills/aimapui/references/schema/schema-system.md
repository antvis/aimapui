# Schema 系统

## 概述

AiMapUI 的 Schema 系统是面向 AI 生成优化的可序列化配置，用于 Schema 模式下一次声明完整地图应用。

## AiMapSchema 完整结构

```typescript
interface AiMapSchema {
  map: MapSchema;                    // 地图配置（必填）
  layers: LayerSchema[];             // 图层配置（必填）
  controls?: ControlSchema[];        // 控件配置
  interactions?: InteractionSchema[]; // 交互元素
  legends?: LegendSchema[];          // 图例配置
  responsive?: ResponsiveSchema;     // 响应式配置
  events?: EventSchema;              // 全局事件标识
}
```

## LayerSchema 公共属性

所有基础图层和 Schema 模式中的图层共享以下属性：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'point' \| 'line' \| 'polygon' \| 'heatmap' \| 'raster' \| 'image'` | **必填** | 图层类型 |
| `source` | `unknown` | **必填** | 数据源 |
| `sourceType` | `SourceType` | `'json'` | 数据类型 |
| `sourceConfig` | `SourceConfig` | — | `{ x, y, x1, y1, coordinates, parser, transforms }` |
| `id` | `string` | 自动生成 | 唯一 ID |
| `name` | `string` | type 值 | 图层名称 |
| `visible` | `boolean` | `true` | 可见性 |
| `zIndex` | `number` | `0` | 层级 |
| `minZoom` / `maxZoom` | `number` | — | 可见缩放范围 |
| `autoFit` | `boolean` | `false` | 自动适配数据范围 |
| `color` | `string` | — | 固定颜色 |
| `colorField` | `string` | — | 颜色映射字段 |
| `colorValues` | `string[] \| string` | — | 颜色值/色板名 |
| `size` | `number` | — | 固定尺寸 |
| `sizeField` | `string` | — | 大小映射字段 |
| `sizeValues` | `number[]` | — | 大小范围 |
| `shape` | `string` | — | 固定形状 |
| `shapeField` | `string` | — | 形状映射字段 |
| `shapeValues` | `string[] \| string` | — | 形状值 |
| `style` | `Record<string, unknown>` | — | 附加样式 |
| `opacity` | `number` | `1` | 不透明度 0~1 |
| `blend` | `'normal' \| 'additive' \| 'subtractive' \| 'max'` | — | 混合模式 |
| `filterField` | `string` | — | 过滤字段 |
| `filterValues` | `unknown[]` | — | 过滤值 |
| `animate` | `AnimateConfig` | — | `{ enable, speed, duration, trailLength, repeat }` |
| `active` | `boolean \| { color: string }` | — | 高亮 |
| `select` | `boolean \| { color: string }` | — | 选中 |
| `events` | `LayerEventSchema` | — | 图层事件 |

## ControlSchema

```typescript
interface ControlSchema {
  type: 'zoom' | 'scale' | 'fullscreen' | 'geoLocate' | 'mapTheme' | 'mouseLocation' | 'exportImage' | 'layerSwitch';
  position?: ControlPosition;
  options?: Record<string, unknown>;
}
```

默认位置：zoom→topright, scale→bottomleft, fullscreen→topright, geoLocate→topright, mapTheme→topright, mouseLocation→bottomright, exportImage→topright, layerSwitch→topright。

## InteractionSchema

```typescript
type InteractionSchema = MarkerSchema | PopupSchema | TooltipSchema;

interface MarkerSchema {
  type: 'marker';
  longitude: number;
  latitude: number;
  content?: string;
  draggable?: boolean;
}

interface PopupSchema {
  type: 'popup';
  longitude: number;
  latitude: number;
  content: string;
  closeButton?: boolean;
  size?: 'compact' | 'standard' | 'detailed';
  placement?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  singleton?: boolean;
}

interface TooltipSchema {
  type: 'tooltip';
  content: string;
  trigger?: 'hover' | 'click';
  variant?: 'dark' | 'glass' | 'light';
  longitude?: number;
  latitude?: number;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  offset?: number;
}
```

## LegendSchema

支持 8 种图例：`categories` / `ramp` / `diverging` / `threshold` / `size` / `lineWidth` / `proportion` / `icon`。

## ResponsiveSchema

```typescript
interface ResponsiveSchema {
  breakpoint?: number;  // 默认 768
  mobile?: {
    controls?: { position?: string; scale?: number; hide?: string[] };
    layers?: MobileLayerOverrides | { '*': Partial<LayerSchema> };
    legends?: { compact?: boolean; position?: string };
    toolbar?: { items: string[]; position: 'bottom' | 'top' };
  };
}
```

## Schema 工具 API

```tsx
import {
  applySchemaDefaults,    // 填充默认值
  parseSchema,            // 解析 Schema
  validateSchema,         // 验证 Schema
  diffSchema,             // 差异比较
  AiMapJSONSchema,        // JSON Schema (供 AI/LLM)
} from '@antv/aimapui';

// 验证
const result = validateAiMapSchema(userSchema);
if (!result.valid) console.error(result.errors);

// 深度合并
import { deepMerge, applyResponsiveOverrides } from '@antv/aimapui';
const merged = deepMerge(base, overrides);
const mobileConfig = applyResponsiveOverrides(base, mobileOverrides);
```

## 完整示例

```typescript
const schema: AiMapSchema = {
  map: { basemap: 'gaode', token: 'xxx', center: [116, 39], zoom: 10 },
  layers: [
    {
      type: 'polygon', source: geo, sourceType: 'geojson',
      colorField: 'density',
      colorValues: ['#f0f9e8', '#bae4bc', '#7bccc4', '#43a2ca', '#0868ac'],
      active: { color: '#60a5fa' },
      name: 'district-fill',
    },
    {
      type: 'point', source: pois, sourceConfig: { x: 'lng', y: 'lat' },
      color: '#5B8FF9', size: 10, shape: 'circle', name: 'pois',
      events: {
        click: 'poi-click', enablePopup: true,
        popupFields: ['name', 'category'],
      },
    },
  ],
  controls: [
    { type: 'zoom', position: 'topright' },
    { type: 'scale', position: 'bottomleft' },
  ],
  interactions: [
    { type: 'marker', longitude: 116.397, latitude: 39.908, content: '北京' },
  ],
  legends: [
    { type: 'ramp', title: '密度', labels: ['低','中','高'], colors: ['#f0f9e8','#7bccc4','#0868ac'], isContinuous: true },
  ],
  responsive: {
    breakpoint: 768,
    mobile: {
      controls: { hide: ['mouseLocation'] },
      legends: { compact: true },
      toolbar: { items: ['zoomIn','zoomOut','locate'], position: 'bottom' },
    },
  },
  events: { mapMove: 'map-move', mapZoom: 'map-zoom' },
};
```

## 相关文档

- [aimap-container.md](../core/aimap-container.md) — AiMap 主容器
- [event-bus.md](../core/event-bus.md) — EventBus 事件系统
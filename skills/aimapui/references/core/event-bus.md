# EventBus 事件系统

## 快速示例

```tsx
// Schema 模式 — 声明事件标识 + AiMap 级监听
<AiMap
  schema={{
    map: { basemap: 'gaode' },
    layers: [{
      type: 'point',
      source: data,
      events: {
        click: 'poi-click',
        mousemove: 'poi-hover',
        enablePopup: true,
      },
    }],
    events: {
      mapMove: 'map-move',
      mapZoom: 'map-zoom',
    },
  }}
  events={{
    'poi-click': (payload) => console.log('点击:', payload.feature),
    'poi-hover': (payload) => console.log('悬浮:', payload.lng, payload.lat),
    'map-move': (payload) => console.log('中心:', payload.center),
  }}
/>

// 组件化模式 — 直接回调
<PointLayer
  source={data}
  onClick={(payload) => console.log(payload.feature)}
  onMouseEnter={(payload) => console.log(payload.lng, payload.lat)}
/>
```

## EventBus API

```tsx
import { EventBus, createEventBus } from '@antv/aimapui';

const bus = createEventBus();

// 注册监听 — 返回取消函数
const off = bus.on('my-event', (data) => { /* ... */ });

// 一次性监听
bus.once('my-event', (data) => { /* ... */ });

// 触发事件
bus.emit('my-event', payload);

// 移除指定事件所有监听
bus.off('my-event');

// 清除所有监听
bus.clear();
```

## 图层事件配置（Schema 模式）

```typescript
interface LayerEventSchema {
  click?: string;          // 点击事件标识
  mousemove?: string;      // 鼠标移动事件标识
  mouseenter?: string;     // 鼠标进入事件标识
  mouseleave?: string;     // 鼠标离开事件标识
  enablePopup?: boolean;   // 启用内置 Popup
  popupTrigger?: 'click' | 'hover';  // Popup 触发方式，默认 click
  popupFields?: string[];  // Popup 显示字段
  popupTemplate?: string;  // Popup HTML 模板，支持 {{field}} 占位符
}
```

## 全局事件配置

```typescript
interface EventSchema {
  mapMove?: string;         // 地图移动事件标识
  mapZoom?: string;         // 地图缩放事件标识
  markerDragEnd?: string;   // Marker 拖拽结束标识
}
```

## 两种模式对比

| 特性 | 组件化模式 | Schema 模式 |
|------|-----------|------------|
| 事件注册 | `onClick` / `onMouseMove` props | `events.click` 标识符 + `AiMap.events` 监听 |
| Popup | 手动创建 `<Popup>` 组件 | `events.enablePopup: true` 零代码弹出 |
| 类型安全 | TypeScript 完整类型 | 字符串标识符，运行时匹配 |
| 适用场景 | 开发者编码 | AI 生成 / JSON 配置 |

## 相关文档

- [aimap-container.md](./aimap-container.md) — AiMap 主容器
- [schema-system.md](../schema/schema-system.md) — Schema 系统
# 快速开始

AiMapUI 是基于 L7 引擎的 React 地图可视化组件库，提供两种使用模式——组件组合和 JSON Schema，让你从 5 行代码到完整数据大屏都能覆盖。

## 安装

```bash
npm install @antv/aimapui
# 或
pnpm add @antv/aimapui
```

> **注意：** 需要同时安装地图引擎依赖：
> ```bash
> pnpm add @antv/l7 @antv/l7-maps
> ```

> **Node 版本：** 需要 Node.js 18+，项目使用 ESM 模块格式。

## 最简示例

5 行代码渲染一个带底图和高德 token 的地图：

```tsx
import { AiMap } from '@antv/aimapui';

export default function BasicMap() {
  return (
    <AiMap
      map={{
        basemap: 'gaode',
        center: [116.397, 39.908],  // 北京天安门
        zoom: 10,
        token: 'YOUR_GAODE_TOKEN',
      }}
    />
  );
}
```

## 双模式使用

AiMapUI 支持两种模式，区别在于配置的书写方式，底层引擎完全相同：

### 组合模式 — 推荐日常开发

用 React 组件声明式组合地图元素，适合前端开发者手写代码：

```tsx
import { AiMap, PointLayer, ZoomControl } from '@antv/aimapui';

const cities = [
  { lng: 116.397, lat: 39.908, name: '北京' },
  { lng: 121.473, lat: 31.230, name: '上海' },
  { lng: 113.264, lat: 23.129, name: '广州' },
];

<AiMap map={{ basemap: 'gaode', center: [108, 34], zoom: 4, token }}>
  <PointLayer
    source={cities}
    sourceType="json"
    sourceConfig={{ x: 'lng', y: 'lat' }}
    size={10}
    colorField="name"
    colorValues={['#3B82F6', '#10B981', '#F59E0B']}
  />
  <ZoomControl position="topright" />
</AiMap>
```

组合模式特点：
- 子组件自动按类型分发到图层/控件/交互等插槽
- 支持 React 状态驱动的响应式更新
- 与 [Popup](interaction/popup)、[Tooltip](interaction/tooltip) 等交互组件松耦合

### Schema 模式 — 适合 AI 生成和服务端下发

用 JSON Schema 描述完整地图配置，一个对象搞定所有图层、控件和交互：

```tsx
<AiMap
  schema={{
    map: { basemap: 'gaode', center: [108, 34], zoom: 4, token },
    layers: [
      {
        type: 'point',
        source: cities,
        sourceType: 'json',
        sourceConfig: { x: 'lng', y: 'lat' },
        color: { field: 'name', values: ['#3B82F6', '#10B981', '#F59E0B'] },
        size: 10,
      }
    ],
    controls: [
      { type: 'zoom', position: 'topright' }
    ]
  }}
/>
```

Schema 模式特点：
- 配置可序列化，适合后端/AI 下发
- `map` 和 `schema` 两个 prop 互斥，同时传入时 `schema` 优先

> **何时用哪个：** 日常前端开发用组合模式，更直观且有 TypeScript 提示；需要动态生成配置（如 AI 对话、低代码平台、配置中心）时用 Schema 模式。

## 主题

内置亮色/暗色双主题，`system` 跟随系统偏好：

```tsx
<AiMap theme="dark" map={{ ... }}>
  ...
</AiMap>
```

| 值 | 效果 |
|------|------|
| `'light'` | 亮色主题（默认），控件和弹窗使用浅色背景 |
| `'dark'` | 暗色主题，适合数据大屏 |
| `'system'` | 跟随 `prefers-color-scheme` 系统偏好 |

## 常见问题

### Token 配置

不同底图需要不同的 token，在 `map.token` 中传入：

| 底图 | token 获取 |
|------|-----------|
| `'gaode'` | [高德开放平台](https://lbs.amap.com/) |
| `'mapbox'` | [Mapbox](https://account.mapbox.com/) |
| `'maplibre'` | 无需 token（使用开源 style） |

### 底图不显示

- 检查 `token` 是否正确传入
- 高德底图需要申请 JS API 权限（不是 Web 服务 API）
- 如果地图容器高度为 0，确保父容器有明确高度

### 多图层叠加顺序

组合模式中，子组件按声明顺序从下到上叠加（后声明的图层在上层）。如需精确控制，使用 `zIndex` prop。

## 下一步

- [AiMap 容器](container/aimap) — 完整的地图配置 API
- [PointLayer](layers/point-layer) — 最常用的散点图层
- [ArcFlowLayer](composite-layers/arc-flow-layer) — OD 弧线可视化
- [Popup](interaction/popup) — 数据弹窗交互
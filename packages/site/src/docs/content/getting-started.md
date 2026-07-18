# 快速开始

AiMapUI 是基于 L7 引擎的 React 地图可视化组件库，提供两种使用模式——组件组合和 JSON Schema，让你从 5 行代码到完整数据大屏都能覆盖。

## 安装

AiMapUI 提供两种使用方式，按需选择：

- **npm 包方式（推荐）** —— 传统依赖安装，开箱即用，底图按需加载
- **CLI 方式** —— 类 shadcn/ui 体验，组件源码直接拷贝到你的项目，可读可改、零运行时锁版

### 方式一：npm 包安装（推荐）

```bash
npm install @antv/aimapui @antv/l7 material-symbols
# 或
pnpm add @antv/aimapui @antv/l7 material-symbols
```

安装完成后，在入口文件引入样式（图标字体已通过 CDN 内置，无需额外安装）：

```tsx
import '@antv/aimapui/style.css';
```

之后从 `@antv/aimapui` 直接 import：

```tsx
import { AiMap, PointLayer } from '@antv/aimapui';
```

> **底图按需加载：** AiMapUI 内部对各底图引擎（高德、Mapbox、百度等）采用动态 `import()` 子路径加载，只有在 `map.basemap` 指定某底图时才会加载对应的引擎代码，不会将所有底图打包进产物。也可以通过 `map.engine` 直接传入引擎构造函数来跳过动态加载，详见下方"地图加载方式"章节。

> **Node 版本：** 需要 Node.js 18+，项目使用 ESM 模块格式。

### 方式二：shadcn 风格 CLI

像 [shadcn/ui](https://ui.shadcn.com) 那样，按需把组件源码 **拷贝到你的项目**，而不是作为 `node_modules` 黑盒依赖。后续可任意修改源码、按需升级，不再受版本锁定。

#### 1. 初始化项目

在 React 项目根目录运行：

```bash
npx aimapui init
```

该命令会创建 `components.json`，让你自定义组件 / hooks / utils 的存放目录：

```json
{
  "$schema": "https://aimapui.antv.vision/schema/components.json",
  "style": "tailwind",
  "aliases": {
    "components": "src/components/map",
    "utils": "src/lib/map",
    "hooks": "src/hooks/map"
  }
}
```

如需跳过交互直接使用默认目录：

```bash
npx aimapui init -y
```

#### 2. 安装地图引擎依赖

CLI 模式下，**仍需手动安装 L7 引擎和外设依赖**（CLI 只负责拷贝组件源码）：

```bash
pnpm add @antv/l7 react react-dom clsx
```

#### 3. 添加组件

按需添加单个组件，CLI 会自动解析依赖（如 `AiMap` 会自动带上 `scene-context` / `schema-types` 等基础 utils）：

```bash
# 添加容器
npx aimapui add AiMap

# 添加常用图层
npx aimapui add PointLayer LineLayer PolygonLayer

# 添加复合图层
npx aimapui add BubbleLayer IconLayer GlyphLayer

# 添加控件与交互
npx aimapui add ZoomControl ScaleControl Popup Tooltip
```

常用选项：

| 选项 | 说明 |
|------|------|
| `-d, --dir <path>` | 临时覆盖组件存放目录 |
| `-y, --yes` | 跳过所有交互确认 |
| `--overwrite` | 覆盖已存在的文件（默认会跳过） |

#### 4. 查看可用组件

```bash
# 列出所有组件
npx aimapui list

# 按分类筛选
npx aimapui list -c layer
npx aimapui list -c composite
npx aimapui list -c control
```

#### 5. 在代码中使用

CLI 拷贝过去的组件会自动按 `components.json` 中的 alias 写入，直接从你自己的目录引用即可：

```tsx
import { AiMap } from '@/components/map/AiMap';
import { PointLayer } from '@/components/map/PointLayer';

<AiMap autoFit map={{ basemap: 'gaode', center: [116.4, 39.9], zoom: 10 /* token: 'YOUR_GAODE_TOKEN' */ }}>
  <PointLayer source={data} sourceType="json" sourceConfig={{ x: 'lng', y: 'lat' }} />
</AiMap>
```

> **CLI 模式优点：** 组件代码完全在你的仓库里，可随时根据业务调整样式 / 行为，不受 `@antv/aimapui` 包版本约束；适合需要深度定制、对包体积敏感、追求长期可维护性的中大型项目。

## 最简示例

5 行代码渲染一个高德底图地图：

```tsx
import { AiMap } from '@antv/aimapui';

export default function BasicMap() {
  return (
    <AiMap
      autoFit
      map={{
        basemap: 'gaode',
        center: [116.397, 39.908],  // 北京天安门
        zoom: 10,
        // token: 'YOUR_GAODE_TOKEN',  // 高德地图可选，未设置时不传 token
      }}
    />
  );
}
```

## 地图加载方式

AiMapUI 支持两种底图加载方式：

### 方式一：basemap 动态加载（默认）

通过 `basemap` 字段指定底图类型，AiMapUI 内部通过动态 `import()` 按需加载对应引擎，未使用的底图不会进入打包产物：

```tsx
<AiMap map={{ basemap: 'gaode', center: [116, 39], zoom: 10 }} />
```

### 方式二：engine 外部注入（v0.3.1+）

如果你的项目已经安装了 L7 底图引擎，或者需要跳过动态 import（如 SSR、微前端、构建工具兼容性等场景），可以通过 `engine` 直接传入地图引擎构造函数：

```tsx
import { GaodeMap } from '@antv/l7';

<AiMap map={{ engine: GaodeMap, center: [116, 39], zoom: 10 }} />
```

使用 `engine` 时不需要传 `basemap`，两者二选一：

| 方式 | 适用场景 | 特点 |
|------|---------|------|
| `basemap` | 大多数场景，推荐默认使用 | 按需加载，无需手动 import 底图引擎 |
| `engine` | SSR、微前端、已有 L7 引擎实例 | 跳过动态 import，同步创建地图实例 |

> **注意：** `basemap` 和 `engine` 同时传入时，`engine` 优先。

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

<AiMap autoFit map={{ basemap: 'gaode', center: [108, 34], zoom: 4 }}>
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
- 与 [Popup](./interaction/popup)、[Tooltip](./interaction/tooltip) 等交互组件松耦合

### Schema 模式 — 适合 AI 生成和服务端下发

用 JSON Schema 描述完整地图配置，一个对象搞定所有图层、控件和交互：

```tsx
<AiMap
  autoFit
  schema={{
    map: { basemap: 'gaode', center: [108, 34], zoom: 4 },
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
<AiMap autoFit theme="dark" map={{ ... }}>
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

部分底图需要 token 才能正常使用，在 `map.token` 中传入；不需要 token 的底图可以省略此字段：

| 底图 | 是否需要 token | token 获取 |
|------|---------------|-----------|
| `'gaode'` | 可选 | [高德开放平台](https://lbs.amap.com/) |
| `'mapbox'` | 需要 | [Mapbox](https://account.mapbox.com/) |
| `'maplibre'` | 不需要 | — |
| `'baidu'` | 可选 | [百度地图开放平台](https://lbsyun.baidu.com/) |
| `'tencent'` | 可选 | [腾讯位置服务](https://lbs.qq.com/) |
| `'tianditu'` | 可选 | [国家地理信息公共服务平台](https://www.tianditu.gov.cn/) |
| `'google'` | 需要 | [Google Cloud Console](https://console.cloud.google.com/) |
| `'map'` | 不需要 | — |

### 底图不显示

- 如果使用了需要 token 的底图，检查 `token` 是否正确传入
- 高德底图需要申请 JS API 权限（不是 Web 服务 API）
- 如果地图容器高度为 0，确保父容器有明确高度

### 多图层叠加顺序

组合模式中，子组件按声明顺序从下到上叠加（后声明的图层在上层）。如需精确控制，使用 `zIndex` prop。

## 下一步

- [AiMap 容器](./container/aimap) — 完整的地图配置 API
- [PointLayer](./layers/point-layer) — 最常用的散点图层
- [ArcFlowLayer](./composite-layers/arc-flow-layer) — OD 弧线可视化
- [Popup](./interaction/popup) — 数据弹窗交互
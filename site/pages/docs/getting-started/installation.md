# 安装

## 环境要求

- Node.js >= 18.0.0
- React >= 18.0.0
- npm 或 pnpm 或 yarn

## 安装依赖

```bash
npm install @antv/aimapkit @antv/l7 @antv/l7-maps
# 或
pnpm add @antv/aimapkit @antv/l7 @antv/l7-maps
# 或
yarn add @antv/aimapkit @antv/l7 @antv/l7-maps
```

## 引入样式

```tsx
import '@antv/aimapkit/style.css'
```

## 基础示例

```tsx
import { Aimap } from '@antv/aimapkit'
import '@antv/aimapkit/style.css'

const schema = {
  map: {
    basemap: 'gaode',
    center: [116.397428, 39.90923],
    zoom: 10
  },
  layers: [{
    type: 'point',
    source: [
      { lng: 116.397, lat: 39.909, value: 100 },
      { lng: 116.398, lat: 39.910, value: 200 }
    ],
    sourceType: 'json',
    color: '#1890ff',
    size: 10
  }]
}

function App() {
  return <Aimap schema={schema} />
}
```

## TypeScript 支持

aimapkit 使用 TypeScript 编写,提供完整的类型定义。你可以导入类型进行类型检查:

```tsx
import type { AimapSchema, LayerSchema, MapSchema } from '@antv/aimapkit'

const mapSchema: MapSchema = {
  basemap: 'gaode',
  center: [116.397428, 39.90923],
  zoom: 10
}

const layerSchema: LayerSchema = {
  type: 'point',
  source: [],
  sourceType: 'json',
  color: '#1890ff'
}
```

## 下一步

- [快速开始](/docs/getting-started/quick-start) - 5分钟上手 aimapkit
- [Schema 基础](/docs/guides/schema-basics) - 了解 Schema 驱动的核心概念

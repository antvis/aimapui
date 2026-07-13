# LegendControl

图例容器控件，将自定义图例内容放置在地图角落的毛玻璃容器中。本身不渲染任何图例，仅作为布局容器使用。

> **何时选择：** 需要将 LegendCategories、LegendRamp 等图例组件固定在地图某个角落时用 LegendControl；图例已经通过其他 UI 布局（如侧边栏）展示时不需要此控件；只需展示品牌 Logo 时用 [LogoControl](./logo-control)。

## 导入

```tsx
import { LegendControl } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | [ControlPosition](#controlposition) | `'bottomleft'` | 控件在地图上的位置 |
| `className` | `string` | - | 自定义 CSS 类名，用于覆盖容器样式 |
| `style` | `React.CSSProperties` | - | 自定义行内样式 |
| `children` | `React.ReactNode` | - | 图例内容，通常传入 LegendCategories、LegendRamp 等图例组件，也可传入任意自定义 React 节点 |

### ControlPosition

```typescript
type ControlPosition =
  | 'topleft' | 'topright'
  | 'bottomleft' | 'bottomright'
  | 'topcenter' | 'bottomcenter'
  | 'lefttop' | 'leftbottom'
  | 'righttop' | 'rightbottom'
  | 'leftcenter' | 'rightcenter'
```

## 示例

### 基础用法 — 分类图例

将分类图例放在地图左下角，容器自动应用毛玻璃效果：

```tsx
import { AiMap, LegendControl, LegendCategories } from '@antv/aimapui'

const categories = [
  { label: '商业区', color: '#e6553a' },
  { label: '住宅区', color: '#3a8ee6' },
  { label: '工业区', color: '#f5c842' },
  { label: '绿地', color: '#4caf50' },
]

<AiMap autoFit map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 11 }}>
  <LegendControl position="bottomleft">
    <LegendCategories title="用地类型" items={categories} />
  </LegendControl>
</AiMap>
```

### 连续色带图例 — 温度分布

搭配 LegendRamp 展示连续数值型数据的色带图例：

```tsx
import { AiMap, LegendControl, LegendRamp } from '@antv/aimapui'

<AiMap autoFit map={{ basemap: 'gaode', center: [121.473, 31.230], zoom: 8 }}>
  <LegendControl position="bottomleft">
    <LegendRamp
      title="气温 (°C)"
      min={-10}
      max={40}
      colors={['#313695', '#4575b4', '#fee090', '#d73027', '#a50026']}
    />
  </LegendControl>
</AiMap>
```

### 自定义图例内容 — 多块组合

`children` 支持任意 React 节点，可以将多个图例块组合在一起：

```tsx
import { AiMap, LegendControl, LegendCategories, LegendRamp } from '@antv/aimapui'

<AiMap autoFit map={{ basemap: 'gaode', center: [113.26, 23.13], zoom: 10 }}>
  <LegendControl position="bottomleft" style={{ maxWidth: 220 }}>
    <LegendCategories
      title="POI 类型"
      items={[
        { label: '餐饮', color: '#e6553a' },
        { label: '购物', color: '#3a8ee6' },
      ]}
    />
    <div style={{ borderTop: '1px solid #eee', margin: '8px 0' }} />
    <LegendRamp
      title="人口密度"
      min={0}
      max={10000}
      colors={['#f7fbff', '#08306b']}
    />
  </LegendControl>
</AiMap>
```

## 注意事项

- LegendControl 本身不渲染任何图例内容，只是一个带毛玻璃背景的布局容器；需要搭配具体的图例组件（LegendCategories、LegendRamp 等）或自定义内容使用
- `children` 为 `undefined` 或 `null` 时容器仍然渲染，但内容为空，建议条件性挂载：`{showLegend && <LegendControl>...</LegendControl>}`
- 容器默认使用 `l7-control--glass` 毛玻璃样式，在暗色和亮色底图上均有良好表现；如需完全自定义外观可通过 `className` 覆盖
- 多个控件放在同一位置时会依次堆叠，注意与 LogoControl、ScaleControl 等控件的布局冲突

## 相关组件

- [LogoControl](./logo-control) — Logo 展示控件，同样放在地图角落但用于品牌标识
- [LayerSwitchControl](./layer-switch-control) — 图层切换控件，切换图层时图例通常需要同步更新
- [ScaleControl](./scale-control) — 比例尺控件，常与图例放在同一侧

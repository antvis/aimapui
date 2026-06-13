# 控件组件

所有控件支持 `position` 属性（L7 位置类型），放置在 `<AiMap>` 子组件中自动按位置排列。

```tsx
<AiMap map={{ basemap: 'gaode' }}>
  <ZoomControl position="topright" />
  <ScaleControl position="bottomleft" />
</AiMap>
```

## ControlPosition 类型

```
'topleft' | 'topright' | 'bottomleft' | 'bottomright' |
'topcenter' | 'bottomcenter' | 'lefttop' | 'leftbottom' |
'righttop' | 'rightbottom' | 'leftcenter' | 'rightcenter'
```

## ZoomControl — 缩放控件

默认位置：`bottomright`

```tsx
import { ZoomControl } from '@antv/aimapui';

<ZoomControl
  position="topright"
  zoomInText={<span className="icon">+</span>}   // 自定义缩放按钮
  zoomOutText={<span className="icon">-</span>}
  zoomInTitle="放大"
  zoomOutTitle="缩小"
  showZoom={true}   // 显示当前缩放级别数字
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `ControlPosition` | `'bottomright'` | 控件位置 |
| `zoomInText` | `ReactNode` | Material `add` 图标 | 放大按钮内容 |
| `zoomOutText` | `ReactNode` | Material `remove` 图标 | 缩小按钮内容 |
| `zoomInTitle` | `string` | `'Zoom in'` | 放大按钮提示 |
| `zoomOutTitle` | `string` | `'Zoom out'` | 缩小按钮提示 |
| `showZoom` | `boolean` | `false` | 显示缩放级别数字 |

## ScaleControl — 比例尺

默认位置：`bottomleft`

```tsx
<ScaleControl position="bottomleft" />
```

## FullscreenControl — 全屏控件

默认位置：`topright`

```tsx
<FullscreenControl position="topright" />
```

## GeoLocateControl — 定位控件

默认位置：`topright`

```tsx
<GeoLocateControl position="topright" />
```

## MapThemeControl — 主题切换

默认位置：`topright`

```tsx
import { MapThemeControl, GAODE_THEME_PRESETS, OPENFREEMAP_THEME_PRESETS } from '@antv/aimapui';

<MapThemeControl
  position="topright"
  themes={GAODE_THEME_PRESETS}
  currentTheme="normal"
  onThemeChange={(theme) => {}}
/>
```

**内置预设：** `GAODE_THEME_PRESETS`, `OPENFREEMAP_THEME_PRESETS`, `INDEPENDENT_MAP_THEME_PRESETS`

## MouseLocationControl — 鼠标坐标

默认位置：`bottomright`

```tsx
<MouseLocationControl position="bottomright" />
```

## ExportImageControl — 截图控件

默认位置：`topright`

```tsx
<ExportImageControl position="topright" />
```

## LayerSwitchControl — 图层开关

默认位置：`topright`

```tsx
<LayerSwitchControl
  position="topright"
  layers={[
    { id: 'layer-1', name: '区域填充' },
    { id: 'layer-2', name: '点位标注', visible: false },
  ]}
  onLayerToggle={(id, visible) => console.log(id, visible)}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `ControlPosition` | `'topright'` | |
| `layers` | `LayerItem[]` | **必填** | `{ id, name, visible? }` |
| `onLayerToggle` | `(id: string, visible: boolean) => void` | — | 显隐切换回调 |

## LegendControl — 图例控件

将 Legend 组件嵌入地图控件区域，随控件位置系统自动排列。

默认位置：`bottomleft`

```tsx
import { LegendControl, LegendCategories } from '@antv/aimapui';

<LegendControl position="bottomleft" className="my-legend">
  <LegendCategories title="类型" labels={['住宅', '商业']} colors={['#2563eb', '#f59e0b']} />
</LegendControl>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `ControlPosition` | `'bottomleft'` | 控件位置 |
| `className` | `string` | — | 额外 CSS 类名 |
| `style` | `CSSProperties` | — | 额外内联样式 |
| `children` | `ReactNode` | — | Legend 子组件（不传则不渲染） |

## LogoControl — Logo 控件

在地图上展示一个或多个品牌 Logo，支持点击跳转。

默认位置：`bottomleft`

```tsx
import { LogoControl } from '@antv/aimapui';

<LogoControl
  position="bottomleft"
  logos={[
    { src: '/logo.png', alt: 'AntV', href: 'https://antv.antgroup.com', width: 32 },
    { src: '/partner.png', alt: 'Partner' },
  ]}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `ControlPosition` | `'bottomleft'` | 控件位置 |
| `logos` | `LogoItem[]` | **必填** | Logo 列表 |
| `className` | `string` | — | 额外 CSS 类名 |
| `style` | `CSSProperties` | — | 额外内联样式 |

**LogoItem:**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | **必填** | 图片地址 |
| `alt` | `string` | — | 图片 alt 文本 |
| `href` | `string` | — | 点击跳转链接 |
| `width` | `number` | `24` | 图片宽度（px） |

## DrawControl — 绘制控件

默认位置：`topright`，支持交互式绘制和编辑地理要素。

```tsx
import { DrawControl } from '@antv/aimapui';

<DrawControl
  position="topright"
  modes={['point', 'polyline', 'polygon', 'rectangle', 'circle', 'edit']}
  onDrawCreate={(features) => console.log('创建:', features)}
  onDrawUpdate={(feature) => console.log('更新:', feature)}
  onDrawDelete={(feature) => console.log('删除:', feature)}
  onDrawSelect={(feature) => console.log('选中:', feature)}
  onModeChange={(mode) => console.log('模式:', mode)}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `ControlPosition` | `'topright'` | 控件位置 |
| `defaultFeatures` | `DrawFeature[]` | `[]` | 初始要素（非受控） |
| `features` | `DrawFeature[]` | — | 受控要素 |
| `modes` | `DrawToolMode[]` | 全部 | 工具栏显示的模式 |
| `showDelete` | `boolean` | `true` | 显示删除/清除按钮 |
| `styles` | `DrawStyleConfig` | — | 自定义样式 |
| `onDrawCreate` | `(features: DrawFeature[]) => void` | — | 创建要素回调 |
| `onDrawUpdate` | `(feature: DrawFeature) => void` | — | 更新要素回调 |
| `onDrawDelete` | `(feature: DrawFeature) => void` | — | 删除要素回调 |
| `onDrawSelect` | `(feature: DrawFeature \| null) => void` | — | 选中/取消选中回调 |
| `onModeChange` | `(mode: DrawMode) => void` | — | 模式切换回调 |
| `onChange` | `(features: DrawFeature[]) => void` | — | 要素集合变化回调 |

绘制模式：`point`（点）、`polyline`（折线）、`polygon`（多边形）、`rectangle`（矩形）、`circle`（圆形）、`edit`（编辑）。

Schema 模式：`{ type: 'draw', position: 'topright', options: { modes: ['point', 'polygon', 'edit'], showDelete: true } }`

## ControlContainer — 控件容器

组件化模式下自动包裹，也可以手动使用：

```tsx
import { ControlContainer, ControlRegistry } from '@antv/aimapui';

<ControlContainer>
  <ZoomControl position="topright" />
  <ScaleControl position="bottomleft" />
</ControlContainer>
```

## useMapControl Hook

```tsx
import { useMapControl } from '@antv/aimapui';

function MyCustomControl() {
  const { scene, mapsService, getMapContainer, positionClassName } = useMapControl('topright');
  // mapsService: 地图服务实例
  // getMapContainer(): 获取地图 DOM 容器
  // positionClassName: L7 位置 CSS 类名
}
```

## 相关文档

- [aimap-container.md](../core/aimap-container.md) — AiMap 主容器
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
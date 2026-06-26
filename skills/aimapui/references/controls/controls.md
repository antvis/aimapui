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

默认位置：`topright`，支持交互式绘制和编辑地理要素（点/线/面/矩形/圆形），支持编辑模式下的移动、顶点编辑、合并、切分等高级 GIS 操作。

**详细文档：** [draw-control.md](draw-control.md)

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
| `snap` | `DrawSnapConfig \| boolean` | `true` | 吸附配置 |
| `onDrawCreate` | `(features: DrawFeature[]) => void` | — | 创建要素回调 |
| `onDrawUpdate` | `(feature: DrawFeature) => void` | — | 更新要素回调 |
| `onDrawDelete` | `(feature: DrawFeature) => void` | — | 删除要素回调 |
| `onDrawSelect` | `(feature: DrawFeature \| null) => void` | — | 选中/取消选中回调 |
| `onModeChange` | `(mode: DrawMode) => void` | — | 模式切换回调 |
| `onChange` | `(features: DrawFeature[]) => void` | — | 要素集合变化回调 |

绘制模式：`point`（点）、`polyline`（折线）、`polygon`（多边形）、`rectangle`（矩形）、`circle`（圆形）、`edit`（编辑）、`merge`（合并）、`split`（切分）。

Schema 模式：`{ type: 'draw', position: 'topright', options: { modes: ['point', 'polygon', 'edit'], showDelete: true } }`

## ImageCalibrationControl — 图片配准控件

默认位置：`topright`，上传图片并通过拖拽 4 个角点进行地理配准，输出配准坐标和变换后的图片。支持单图导出和网格切片导出。

**详细文档：** [image-calibration-control.md](image-calibration-control.md)

```tsx
import { ImageCalibrationControl } from '@antv/aimapui';

<ImageCalibrationControl
  position="topright"
  onCalibrate={(result) => console.log('配准结果:', result)}
  onExport={(result) => console.log('导出结果:', result)}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `ControlPosition` | `'topright'` | 控件位置 |
| `corners` | `GeoCorners` | — | 受控模式：外部传入角点 |
| `defaultCorners` | `GeoCorners` | — | 非受控模式：初始角点 |
| `imageSource` | `string \| File` | — | 图片来源（URL/base64/File） |
| `opacity` | `number` | `0.7` | 覆盖层透明度 0-1 |
| `accept` | `string` | `'image/*'` | 接受的文件类型 |
| `onCornersChange` | `(corners: GeoCorners) => void` | — | 角点变化回调 |
| `onCalibrate` | `(result: CalibrationResult) => void` | — | 确认配准回调 |
| `onExport` | `(result: ExportResult) => void` | — | 导出完成回调 |
| `onImageLoad` | `(dims: { width, height }) => void` | — | 图片加载完成回调 |
| `onClear` | `() => void` | — | 清除回调 |

## AnnotationControl — 标注控件

默认位置：`topright`，支持 7 种标注工具（标记/荧光笔/文本/便签/链接/图片/视频），遵循 Material Design 3 风格。

**详细文档：** [annotation-control.md](annotation-control.md)

```tsx
import { AnnotationControl } from '@antv/aimapui';

<AnnotationControl
  position="topright"
  tools={['marker', 'highlighter', 'text', 'note', 'link', 'image', 'video']}
  onAnnotationCreate={(feature) => console.log('新建:', feature)}
  onChange={(features) => console.log('标注列表:', features)}
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `ControlPosition` | `'topright'` | 控件位置 |
| `tools` | `AnnotationToolMode[]` | 全部工具 | 需要显示的工具列表 |
| `defaultFeatures` | `AnnotationFeature[]` | — | 初始标注（非受控） |
| `features` | `AnnotationFeature[]` | — | 标注列表（受控模式） |
| `styles` | `AnnotationStyleConfig` | — | 各工具的默认样式 |
| `onUpload` | `(file, type) => Promise<string>` | — | 图片/视频上传回调 |
| `onAnnotationCreate` | `(feature) => void` | — | 创建标注回调 |
| `onAnnotationUpdate` | `(feature) => void` | — | 更新标注回调 |
| `onAnnotationDelete` | `(feature) => void` | — | 删除标注回调 |
| `onAnnotationSelect` | `(feature \| null) => void` | — | 选中标注回调 |
| `onModeChange` | `(mode) => void` | — | 模式切换回调 |
| `onChange` | `(features) => void` | — | 标注列表变化回调 |

标注工具：`marker`（标记）、`highlighter`（荧光笔）、`text`（文本）、`note`（便签）、`link`（链接）、`image`（图片）、`video`（视频）、`select`（选择）。

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
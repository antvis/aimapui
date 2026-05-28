# FullscreenControl

全屏切换控件，点击进入/退出全屏模式，让地图占据整个浏览器视口或指定容器。

> **何时选择：** 需要全屏展示地图时用 FullscreenControl；只需要截图保存而不需要全屏时用 [ExportImageControl](./export-image-control)；需要更多交互控件（缩放、定位等）时配合 [ZoomControl](./zoom-control)、[GeoLocateControl](./geo-locate-control) 一起使用。

## 导入

```tsx
import { FullscreenControl } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | [ControlPosition](#controlposition) | `'topright'` | 控件在地图上的位置 |
| `container` | `HTMLElement \| null` | - | 全屏的目标容器。默认不传时使用地图自身容器；传入自定义元素后，全屏会作用于该元素而非地图容器，适合地图外还有侧边栏、图例等需要一起全屏的场景 |
| `className` | `string` | - | 自定义 CSS 类名，用于覆盖控件样式 |
| `style` | `React.CSSProperties` | - | 自定义行内样式 |

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

### 基础用法 — 大屏监控中心

默认对地图容器自身开启全屏，点击按钮即可切换，适合监控大屏、数据看板等沉浸式场景：

```tsx
import { AiMap, FullscreenControl } from '@antv/aimapui'

<AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 10 }}>
  <FullscreenControl />
</AiMap>
```

### 指定全屏容器 — 地图 + 侧边栏联动全屏

当地图旁边有筛选面板、图例等辅助 UI 需要一同全屏展示时，将父级容器传给 `container`：

```tsx
import { AiMap, FullscreenControl } from '@antv/aimapui'

const dashboardRef = useRef<HTMLDivElement>(null)

<div ref={dashboardRef} style={{ display: 'flex', height: '100vh' }}>
  <aside style={{ width: 300 }}>
    {/* 筛选面板、图例等 */}
  </aside>
  <div style={{ flex: 1 }}>
    <AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 11 }}>
      <FullscreenControl position="topright" container={dashboardRef.current} />
    </AiMap>
  </div>
</div>
```

## 注意事项

- 全屏功能依赖浏览器 [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)，部分嵌入场景（iframe 无 `allowfullscreen`、iOS Safari 不支持）下按钮点击无效，需做兼容降级提示
- `container` 传入 `null` 时等价于不传，仍然对地图容器全屏；这在条件性全屏（如 `container={isReady ? wrapperRef.current : null}`）中很有用
- 按 `Esc` 键可退出全屏，无需额外监听键盘事件

## 相关组件

- [ExportImageControl](./export-image-control) — 截图导出控件，不需要全屏但需要保存图片时使用
- [ZoomControl](./zoom-control) — 缩放控件，全屏后仍可操作缩放
- [MapThemeControl](./map-theme-control) — 主题切换控件，全屏大屏场景下常用
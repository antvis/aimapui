# ExportImageControl

地图导出图片控件，点击截图并将地图当前视图导出为 PNG 或 JPG，可自动下载或通过回调自定义处理。

> **何时选择：** 需要保存地图截图时用 ExportImageControl；需要全屏展示而非下载时用 [FullscreenControl](./fullscreen-control)；需要打印整页（含地图和周边 UI）时直接使用浏览器打印功能。

## 导入

```tsx
import { ExportImageControl } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | [ControlPosition](#controlposition) | `'topright'` | 控件在地图上的位置 |
| `format` | `'png' \| 'jpg'` | `'png'` | 导出图片格式。`'png'` 支持透明背景、无损压缩，适合叠加到其他文档；`'jpg'` 体积更小但不支持透明，适合纯展示场景 |
| `onExport` | `(base64: string) => void` | - | 导出回调，参数为 base64 Data URL。传入此函数后**不会自动下载**，你可以在回调中上传服务器、插入预览弹窗等。不传时点击按钮自动触发浏览器下载 |
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

### 基础用法 — 一键下载 PNG 截图

不传 `onExport`，点击按钮自动下载当前地图视口为 PNG 文件：

```tsx
import { AiMap, ExportImageControl } from '@antv/aimapui'

<AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 11 }}>
  <ExportImageControl />
</AiMap>
```

### 自定义导出处理 — 上传服务器并生成报告

传入 `onExport` 后，截图不再自动下载，你可以在回调中将 base64 数据上传到后端或展示预览：

```tsx
import { AiMap, ExportImageControl } from '@antv/aimapui'

const reportId = 'rpt-20260527-001'

<AiMap map={{ basemap: 'gaode', center: [121.473, 31.230], zoom: 12 }}>
  <ExportImageControl
    position="topright"
    format="jpg"
    onExport={async (base64) => {
      // 上传到报告系统
      await fetch('/api/reports/attach-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, image: base64 }),
      })
      alert('截图已附加到报告')
    }}
  />
</AiMap>
```

## 注意事项

- 截图基于地图 Canvas 的 `toDataURL()`，如果地图包含跨域瓦片且服务端未返回 `Access-Control-Allow-Origin` 头，导出时地图区域会变为空白——这是浏览器安全策略限制，需要瓦片服务端配置 CORS
- `format` 为 `'jpg'` 时，透明区域会被填充为黑色；如需白色背景请在地图配置中设置背景色或使用 `'png'`
- `onExport` 返回的 base64 字符串包含 Data URL 前缀（`data:image/png;base64,...`），直接赋给 `<img src>` 即可显示；上传时如需纯 base64 数据，记得去掉前缀
- 截图瞬间会捕获当前帧的完整渲染内容，包括正在播放的动画帧，但不包含浏览器 DOM 叠加层（如 HTML 弹窗、图例等）

## 相关组件

- [FullscreenControl](./fullscreen-control) — 全屏控件，不需要下载但需要全屏展示时使用
- [MapThemeControl](./map-theme-control) — 主题切换，先切换到合适的底图风格再截图效果更好
- [ScaleControl](./scale-control) — 比例尺，截图中的比例尺能帮助读者判断实际距离
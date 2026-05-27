# MapThemeControl

底图主题切换控件，弹出面板展示可选主题卡片，点击即可切换地图样式（标准、暗色、卫星等）。

> **何时选择：** 需要切换底图视觉风格时用 MapThemeControl；只需切换业务图层的可见性时用 [LayerSwitchControl](./layer-switch-control)；需要截图保存当前视图时用 [ExportImageControl](./export-image-control)。

## 导入

```tsx
import { MapThemeControl } from '@antv/aimapui'
// 内置主题预设可按需导入
import { GAODE_THEME_PRESETS, OPENFREEMAP_THEME_PRESETS, INDEPENDENT_MAP_THEME_PRESETS } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | [ControlPosition](#controlposition) | `'topright'` | 控件在地图上的位置 |
| `options` | [ThemeOption[]](#themeoption) | 自动获取 | 主题选项列表。不传时组件会自动从 `mapsService` 获取可用主题；获取失败时降级到内置预设（高德 6 个 / OpenFreeMap 5 个 / 独立部署 3 个）。传入自定义数组则完全替代自动获取 |
| `defaultValue` | `string` | 当前地图样式 | 默认选中的主题 `value`。不传时自动读取当前地图的 `mapStyle` 作为选中态 |
| `onThemeChange` | `(value: string) => void` | - | 主题切换后的回调，`value` 对应 `ThemeOption.value`，即传给 `mapsService.setMapStyle` 的样式标识。可在此做额外逻辑（如暗色主题下调整图层颜色） |
| `className` | `string` | - | 自定义 CSS 类名，用于覆盖控件样式 |
| `style` | `React.CSSProperties` | - | 自定义行内样式 |

### ThemeOption

| 字段 | 类型 | 说明 |
|------|------|------|
| `text` | `string` | 主题显示名称，如 `"标准"`、`"暗色"`，显示在卡片的文字区域 |
| `value` | `string` | 主题值，传给 `mapsService.setMapStyle()` 的标识字符串，如 `'normal'`、`'dark'` |
| `preview` | `string` | 主题预览色块，支持 CSS 颜色值和渐变。如 `'#f0f0f0'` 或 `'linear-gradient(135deg, #1a1a2e, #16213e)'` |

### 内置主题预设

| 常量名 | 主题数量 | 包含主题 |
|--------|----------|----------|
| `GAODE_THEME_PRESETS` | 6 | 标准 / 浅色 / 暗色 / 深蓝 / 卫星 / 幻影黑 |
| `OPENFREEMAP_THEME_PRESETS` | 5 | 标准 / 浅色 / 暗色等 |
| `INDEPENDENT_MAP_THEME_PRESETS` | 3 | 适用于独立部署地图服务 |

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

### 基础用法 — 暗色模式切换

不传 `options` 时自动适配当前底图类型，点击弹出主题面板选择即可切换：

```tsx
import { AiMap, MapThemeControl } from '@antv/aimapui'

<AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 11 }}>
  <MapThemeControl
    onThemeChange={(value) => console.log('切换到主题：', value)}
  />
</AiMap>
```

### 自定义主题列表 — 物流园区可视化

只展示业务需要的几个主题，并用渐变色模拟底图风格，`defaultValue` 控制初始选中状态：

```tsx
import { AiMap, MapThemeControl } from '@antv/aimapui'

const themes = [
  { text: '标准', value: 'normal', preview: '#e8e0d8' },
  { text: '暗色', value: 'dark', preview: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  { text: '卫星', value: 'satellite', preview: 'linear-gradient(135deg, #2d5016, #8baa5c)' },
]

<AiMap map={{ basemap: 'gaode', center: [121.473, 31.230], zoom: 12 }}>
  <MapThemeControl
    position="topright"
    options={themes}
    defaultValue="dark"
    onThemeChange={(value) => {
      // 暗色主题下调亮图例文字
      if (value === 'dark') {
        document.body.classList.add('dark-legend')
      } else {
        document.body.classList.remove('dark-legend')
      }
    }}
  />
</AiMap>
```

## 注意事项

- `options` 不传时组件会尝试从 `mapsService` 自动获取可用主题列表，如果底图服务不支持该接口则降级到内置预设
- `preview` 只支持 CSS 颜色值和渐变，不支持图片 URL；如果需要更丰富的预览效果，可通过 `className` 自定义卡片样式
- 切换主题会重新加载底图瓦片，有短暂白屏属于正常现象；暗色主题下叠加的图例、标注等业务元素需要自行调整颜色以保证可读性
- `onThemeChange` 回调在样式实际生效后触发，不是点击的瞬间

## 相关组件

- [LayerSwitchControl](./layer-switch-control) — 图层可见性切换，切换业务图层而非底图
- [ExportImageControl](./export-image-control) — 截图导出，切换到满意的主题后截图保存
- [FullscreenControl](./fullscreen-control) — 全屏控件，主题切换后全屏查看效果
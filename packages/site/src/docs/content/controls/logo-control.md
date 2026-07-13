# LogoControl

品牌 Logo 展示控件，在地图角落水平排列一个或多个 Logo 图片，支持点击跳转到指定链接。

> **何时选择：** 需要在地图上展示项目/公司/合作方品牌标识时用 LogoControl；需要放置图例内容时用 [LegendControl](./legend-control)；需要功能性按钮（缩放、全屏等）时用对应专用控件。

## 导入

```tsx
import { LogoControl } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `logos` | [LogoItem[]](#logoitem) | **必填** | Logo 列表，按数组顺序水平排列。至少传入一项 |
| `position` | [ControlPosition](#controlposition) | `'bottomleft'` | 控件在地图上的位置 |
| `className` | `string` | - | 自定义 CSS 类名，用于覆盖控件样式 |
| `style` | `React.CSSProperties` | - | 自定义行内样式 |

### LogoItem

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | **必填** | Logo 图片 URL，支持 PNG / SVG 等浏览器可识别的格式 |
| `alt` | `string` | `''` | 图片的 `alt` 属性，用于无障碍读屏和图片加载失败时的占位文字 |
| `href` | `string` | - | 点击 Logo 跳转的链接地址。不传时 Logo 不可点击，仅作为展示用途 |
| `width` | `number` | `24` | Logo 图片宽度（px），高度按比例自动缩放 |

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

### 基础用法 — 单 Logo 展示

在地图左下角展示一个品牌 Logo，点击可跳转到官网：

```tsx
import { AiMap, LogoControl } from '@antv/aimapui'

<AiMap autoFit map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 10 }}>
  <LogoControl
    logos={[
      { src: '/logo.png', alt: 'AntV', href: 'https://antv.antgroup.com', width: 80 },
    ]}
  />
</AiMap>
```

### 多 Logo 并排 — 合作方联合展示

多个合作方 Logo 水平排列，适合联合项目、多机构背书场景：

```tsx
import { AiMap, LogoControl } from '@antv/aimapui'

<AiMap autoFit map={{ basemap: 'gaode', center: [121.473, 31.230], zoom: 11 }}>
  <LogoControl
    position="bottomleft"
    logos={[
      { src: '/logo-antv.svg', alt: 'AntV', href: 'https://antv.antgroup.com', width: 64 },
      { src: '/logo-university.png', alt: 'XX大学', width: 48 },
      { src: '/logo-institute.svg', alt: 'XX研究院', href: 'https://example.org', width: 56 },
    ]}
  />
</AiMap>
```

### 自定义样式 — 带背景色的 Logo 栏

通过 `style` 为 Logo 区域添加背景色和内边距，使其在卫星图等复杂底图上更醒目：

```tsx
<LogoControl
  position="bottomleft"
  logos={[
    { src: '/logo-white.svg', alt: '品牌名', width: 72 },
  ]}
  style={{ background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: 4 }}
/>
```

## 注意事项

- `logos` 为必填项，传空数组时控件不渲染任何内容
- `href` 不传时 Logo 仅展示不可点击，不会包裹 `<a>` 标签
- `width` 只控制宽度，高度由浏览器按图片原始比例自动计算；建议提供宽高比合理的图片以避免变形
- 多个 Logo 水平排列，间距由控件内部样式控制；如需调整间距可通过 `className` 覆盖

## 相关组件

- [LegendControl](./legend-control) — 图例容器控件，同样放在地图角落但用于承载图例内容
- [ScaleControl](./scale-control) — 比例尺控件，常与 Logo 放在同一行
- [ResetViewControl](./reset-view-control) — 重置视图控件，常放在 Logo 附近的角落

# AnnotationControl 标注控件（v0.3.1+）

地图标注控件，支持 7 种标注工具，遵循 Material Design 3 风格。

## 快速示例

```tsx
import { AiMap, AnnotationControl } from '@antv/aimapui';

<AiMap map={{ basemap: 'gaode', center: [116, 39], zoom: 12 }}>
  <AnnotationControl position="topright" />
</AiMap>
```

## 标注工具

| 工具 | 模式值 | 说明 |
|------|--------|------|
| 标记 | `'marker'` | 在地图上放置图标标记 |
| 荧光笔 | `'highlighter'` | 自由绘制荧光笔涂抹 |
| 文本 | `'text'` | 在地图上添加文本标注 |
| 便签 | `'note'` | 添加带标题和内容的便签 |
| 链接 | `'link'` | 添加带 URL 的链接标注 |
| 图片 | `'image'` | 在地图上嵌入图片 |
| 视频 | `'video'` | 在地图上嵌入视频 |
| 选择 | `'select'` | 选择/移动已有标注 |

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `ControlPosition` | `'topright'` | 工具栏位置 |
| `tools` | `AnnotationToolMode[]` | 全部工具 | 需要显示的工具列表 |
| `defaultFeatures` | `AnnotationFeature[]` | — | 初始标注（非受控） |
| `features` | `AnnotationFeature[]` | — | 标注列表（受控模式） |
| `styles` | `AnnotationStyleConfig` | — | 各工具的默认样式 |
| `onUpload` | `(file, type) => Promise<string>` | — | 图片/视频上传回调，返回 URL |
| `onAnnotationCreate` | `(feature) => void` | — | 创建标注回调 |
| `onAnnotationUpdate` | `(feature) => void` | — | 更新标注回调 |
| `onAnnotationDelete` | `(feature) => void` | — | 删除标注回调 |
| `onAnnotationSelect` | `(feature \| null) => void` | — | 选中标注回调 |
| `onModeChange` | `(mode) => void` | — | 模式切换回调 |
| `onChange` | `(features) => void` | — | 标注列表变化回调 |
| `className` | `string` | — | 容器 CSS 类名 |
| `style` | `CSSProperties` | — | 容器内联样式 |

## Ref 方法

通过 `ref` 可获取组件的命令式 API：

```tsx
const annotationRef = useRef<AnnotationControlHandle>(null);

<AnnotationControl ref={annotationRef} />

// 命令式操作
annotationRef.current?.setMode('marker');
annotationRef.current?.clearAll();
```

| 方法 | 说明 |
|------|------|
| `setMode(mode)` | 切换标注模式 |
| `addAnnotation(feature)` | 添加标注 |
| `updateAnnotation(id, properties)` | 更新标注属性 |
| `deleteAnnotation(id)` | 删除标注 |
| `clearAll()` | 清除所有标注 |
| `getAnnotations()` | 获取所有标注 |
| `selectAnnotation(id)` | 选中指定标注 |

## 样式配置

```tsx
<AnnotationControl
  styles={{
    marker: { color: '#f44336', size: 24 },
    highlighter: { color: '#ff9800', width: 8, opacity: 0.5 },
    text: { color: '#333', fontSize: 14 },
    note: { color: '#4caf50', maxWidth: 200 },
  }}
/>
```

## 受控模式

```tsx
const [features, setFeatures] = useState<AnnotationFeature[]>([]);

<AnnotationControl
  features={features}
  onChange={setFeatures}
/>
```

## 自定义工具集

只显示部分标注工具：

```tsx
<AnnotationControl tools={['marker', 'text', 'highlighter']} />
```

## 相关文档

- [controls.md](controls.md) — 控件概览
- [draw-control.md](draw-control.md) — 绘制控件

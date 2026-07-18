# AnnotationControl

地图标注控件，支持交互式标注地图元素，提供标记、高亮、文本、便签、链接、图片、视频共 7 种标注工具。

> 仅需简单点位展示时考虑 Marker；需要只读展示矢量数据时使用 PointLayer / LineLayer / PolygonLayer；需要在地图上自由标注、添加多媒体备注时使用本控件。

## 导入

```tsx
import { AnnotationControl } from '@antv/aimapui';
import type { AnnotationControlHandle, AnnotationControlProps, AnnotationMode } from '@antv/aimapui';
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| position | `ControlPosition` | `'topright'` | 工具栏在地图中的位置 |
| defaultFeatures | `AnnotationFeature[]` | `[]` | 默认标注数据（非受控模式） |
| features | `AnnotationFeature[]` | - | 标注数据（受控模式，传入后进入受控状态） |
| tools | `AnnotationToolMode[]` | 全部工具 | 工具栏中展示的工具列表 |
| styles | `AnnotationStyleConfig` | - | 标注样式配置 |
| onUpload | `(file: File) => Promise<string>` | - | 图片 / 视频文件上传回调，返回资源 URL |
| className | `string` | - | 控件容器的自定义类名 |
| style | `React.CSSProperties` | - | 控件容器的自定义样式 |
| onAnnotationCreate | `(feature: AnnotationFeature) => void` | - | 标注创建完成时触发 |
| onAnnotationUpdate | `(feature: AnnotationFeature) => void` | - | 标注更新时触发 |
| onAnnotationDelete | `(feature: AnnotationFeature) => void` | - | 标注删除时触发 |
| onAnnotationSelect | `(feature: AnnotationFeature \| null) => void` | - | 选中 / 取消选中标注时触发 |
| onModeChange | `(mode: AnnotationMode) => void` | - | 当前工具模式切换时触发 |
| onChange | `(features: AnnotationFeature[]) => void` | - | 标注数据变化时触发 |

### AnnotationMode

标注模式，决定当前激活的工具。

```ts
type AnnotationMode =
  | 'select'      // 选择模式（默认）
  | 'marker'      // 标记
  | 'highlighter' // 高亮笔
  | 'text'        // 文本
  | 'note'        // 便签
  | 'link'        // 链接
  | 'image'       // 图片
  | 'video'       // 视频
  | 'none';       // 无工具
```

### AnnotationToolMode

工具栏中可选的工具模式，不包含 `select` 和 `none`。

```ts
type AnnotationToolMode = 'marker' | 'highlighter' | 'text' | 'note' | 'link' | 'image' | 'video';
```

### AnnotationFeature

标注要素，基于 GeoJSON Feature 扩展，`properties` 中包含 `annotationType` 字段用于区分标注类型。

```ts
interface AnnotationFeature extends GeoJSON.Feature {
  id: string;
  properties: AnnotationProperties;
}
```

### AnnotationProperties

标注属性联合类型，根据 `annotationType` 区分。

| annotationType | 属性类型 | 说明 |
|----------------|----------|------|
| `marker` | `MarkerAnnotationProperties` | 点位标记，包含坐标与样式 |
| `highlighter` | `HighlighterAnnotationProperties` | 高亮笔，包含自由绘制的坐标串、颜色、线宽、透明度 |
| `text` | `TextAnnotationProperties` | 文本标注，包含内容、字号、颜色 |
| `note` | `NoteAnnotationProperties` | 便签，包含标题、正文、颜色 |
| `link` | `LinkAnnotationProperties` | 链接，包含 URL、描述文本 |
| `image` | `ImageAnnotationProperties` | 图片，包含图片 URL、尺寸 |
| `video` | `VideoAnnotationProperties` | 视频，包含视频 URL、尺寸 |

### AnnotationControlHandle

通过 `ref` 获取的组件实例，提供命令式 API。

| 方法 | 类型 | 说明 |
|------|------|------|
| setMode | `(mode: AnnotationMode) => void` | 切换当前标注模式 |
| addAnnotation | `(feature: AnnotationFeature) => void` | 添加一条标注 |
| updateAnnotation | `(id: string, properties: Partial<AnnotationProperties>) => void` | 更新指定标注的属性 |
| deleteAnnotation | `(id: string) => void` | 删除指定标注 |
| clearAll | `() => void` | 清空所有标注 |
| getAnnotations | `() => AnnotationFeature[]` | 获取当前所有标注数据 |
| selectAnnotation | `(id: string) => void` | 选中指定标注 |

## 示例

### 基础用法

最简单的用法，直接渲染控件即可使用全部 7 种标注工具。

```tsx
import { Map, AnnotationControl } from '@antv/aimapui';

export default () => (
  <Map>
    <AnnotationControl />
  </Map>
);
```

### 指定工具列表

通过 `tools` 属性控制工具栏中展示的工具。

```tsx
import { Map, AnnotationControl } from '@antv/aimapui';

export default () => (
  <Map>
    <AnnotationControl tools={['marker', 'text', 'highlighter']} />
  </Map>
);
```

### 受控模式

传入 `features` 进入受控模式，配合 `onChange` 管理标注数据。

```tsx
import { Map, AnnotationControl } from '@antv/aimapui';
import { useState } from 'react';
import type { AnnotationFeature } from '@antv/aimapui';

export default () => {
  const [features, setFeatures] = useState<AnnotationFeature[]>([]);

  return (
    <Map>
      <AnnotationControl
        features={features}
        onChange={setFeatures}
        onAnnotationCreate={(f) => console.log('created', f)}
        onAnnotationDelete={(f) => console.log('deleted', f)}
      />
    </Map>
  );
};
```

### 使用 ref 命令式操作

通过 `ref` 获取 `AnnotationControlHandle`，在外部触发标注操作。

```tsx
import { Map, AnnotationControl } from '@antv/aimapui';
import { useRef } from 'react';
import type { AnnotationControlHandle } from '@antv/aimapui';

export default () => {
  const ref = useRef<AnnotationControlHandle>(null);

  return (
    <Map>
      <AnnotationControl ref={ref} />
      <button onClick={() => ref.current?.setMode('marker')}>切换为标记模式</button>
      <button onClick={() => ref.current?.clearAll()}>清空标注</button>
    </Map>
  );
};
```

### 图片 / 视频上传

标注类型为 `image` 或 `video` 时需要提供 `onUpload` 回调以处理文件上传。

```tsx
import { Map, AnnotationControl } from '@antv/aimapui';

export default () => {
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const { url } = await res.json();
    return url;
  };

  return (
    <Map>
      <AnnotationControl
        tools={['marker', 'image', 'video']}
        onUpload={handleUpload}
      />
    </Map>
  );
};
```

## 注意事项

1. **受控与非受控**：传入 `features` 时进入受控模式，需通过 `onChange` 同步数据；否则使用内部状态管理，可通过 `defaultFeatures` 设置初始值。
2. **编辑方式差异**：文本（`text`）和链接（`link`）类型直接在地图上内联编辑；其余类型（`marker`、`highlighter`、`note`、`image`、`video`）通过双击弹出编辑器。
3. **高亮笔渲染**：`highlighter` 类型使用 HighlighterLayer 进行自由绘制渲染，性能较好，适合大面积涂抹标注。
4. **上传回调**：使用 `image` 或 `video` 工具时，必须提供 `onUpload` 回调，否则文件无法上传。
5. **工具栏位置**：工具栏默认显示在地图右上角（`topright`），样式面板默认显示在左上角（`topleft`），可通过 `position` 调整工具栏位置。

## 相关组件

- [DrawControl](./draw-control) — 矢量绘制控件，支持点、线、面、矩形、圆形等几何图形绘制
- [Marker](../overlay/marker) — 轻量级点标记组件，适合少量固定点位展示
- [PointLayer](../layer/point-layer) — 海量点图层，适合大规模点位数据的只读渲染
- [Popup](../overlay/popup) — 地图气泡组件，可用于自定义标注内容的展示

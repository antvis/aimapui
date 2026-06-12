# GlyphLayer

字体图标（Glyph）+ 文字标签组合标注图层。基于 SDF 文本渲染矢量图标，支持 Google Material Symbols 及任意自定义字体，**任意缩放下边缘锐利**、可数据驱动着色。

> 完整文档请参阅 [GlyphLayer](./glyph-layer)。

## 导入

```tsx
import { GlyphLayer } from '@antv/aimapui';
```

## 快速示例

```tsx
<GlyphLayer
  source={pois}
  sourceType="json"
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="icon"
  iconFontFamily="material-symbols"
  iconColor="#3B82F6"
  iconSize={20}
  showLabel
  labelField="name"
  zoomAdaption
/>
```

## Props

详细 Props 说明请参阅 [GlyphLayer 完整文档](./glyph-layer#props)。

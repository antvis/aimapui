# IconLayer

图片图标 + 文字标签组合标注图层。基于栅格图片（PNG/SVG/远端 URL）渲染点位标识，常用于 POI 标注、品牌图标、状态徽章等场景。

> 完整文档请参阅 [IconLayer](./icon-layer)。

## 导入

```tsx
import { IconLayer } from '@antv/aimapui';
```

## 快速示例

```tsx
<IconLayer
  source={locations}
  sourceType="json"
  sourceConfig={{ x: 'lng', y: 'lat' }}
  iconField="type"
  iconMap={{
    hospital: '/icons/hospital.png',
    school: '/icons/school.png',
  }}
  iconSize={24}
  showLabel
  labelField="name"
/>
```

## Props

详细 Props 说明请参阅 [IconLayer 完整文档](./icon-layer#props)。

# DrawControl — 地图绘制控件

交互式绘制和编辑地理要素（点/线/面/矩形/圆形），支持编辑模式下的移动、顶点编辑、合并、切分等高级 GIS 操作。

默认位置：`topright`

## 目录

- [基础用法](#基础用法)
- [完整示例](#完整示例)
- [属性](#属性)
- [绘制模式](#绘制模式)
- [编辑模式操作](#编辑模式操作)
- [样式配置](#样式配置)
- [吸附配置](#吸附配置)
- [命令式 API](#命令式-api)
- [Schema 模式](#schema-模式)
- [相关文档](#相关文档)

## 基础用法

```tsx
import { DrawControl } from '@antv/aimapui';

<DrawControl
  position="topright"
  onDrawCreate={(features) => console.log('创建:', features)}
  onDrawUpdate={(feature) => console.log('更新:', feature)}
  onDrawDelete={(feature) => console.log('删除:', feature)}
  onDrawSelect={(feature) => console.log('选中:', feature)}
  onModeChange={(mode) => console.log('模式:', mode)}
/>
```

## 完整示例

```tsx
import { DrawControl } from '@antv/aimapui';

<DrawControl
  position="topright"
  modes={['point', 'polyline', 'polygon', 'rectangle', 'circle', 'edit']}
  showDelete={true}
  snap={{ enabled: true, threshold: 8, vertex: true, edge: true }}
  styles={{
    point: { color: '#2563eb', size: 8, strokeColor: '#fff', strokeWidth: 2 },
    line: { color: '#2563eb', size: 3, opacity: 0.9 },
    polygon: { fill: '#2563eb', fillOpacity: 0.3, stroke: '#2563eb', strokeWidth: 2 },
    drawing: { fill: '#2563eb', fillOpacity: 0.2, stroke: '#2563eb', strokeWidth: 2, dashStroke: '#2563eb', dashWidth: 1, dashArray: [4, 4] },
    selected: { stroke: '#f59e0b', strokeWidth: 3, fill: '#f59e0b', fillOpacity: 0.3, dashArray: [4, 4] },
    vertex: { color: '#fff', size: 6, strokeColor: '#000', strokeWidth: 2, activeColor: '#f59e0b', activeSize: 8 },
  }}
  onDrawCreate={(features) => console.log('创建:', features)}
  onDrawUpdate={(feature) => console.log('更新:', feature)}
  onDrawDelete={(feature) => console.log('删除:', feature)}
  onDrawSelect={(feature) => console.log('选中:', feature)}
  onModeChange={(mode) => console.log('模式:', mode)}
  onChange={(features) => console.log('全部要素:', features)}
/>
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | `ControlPosition` | `'topright'` | 控件位置 |
| `defaultFeatures` | `DrawFeature[]` | `[]` | 初始要素（非受控模式） |
| `features` | `DrawFeature[]` | — | 受控要素 |
| `modes` | `DrawToolMode[]` | 全部 | 工具栏显示的模式子集 |
| `showDelete` | `boolean` | `true` | 显示删除/清除按钮 |
| `styles` | `DrawStyleConfig` | — | 自定义样式配置 |
| `snap` | `DrawSnapConfig \| boolean` | `true` | 吸附配置 |
| `className` | `string` | — | 额外 CSS 类名 |
| `style` | `CSSProperties` | — | 额外内联样式 |
| `onDrawCreate` | `(features: DrawFeature[]) => void` | — | 创建要素回调 |
| `onDrawUpdate` | `(feature: DrawFeature) => void` | — | 更新要素回调（移动/编辑顶点） |
| `onDrawDelete` | `(feature: DrawFeature) => void` | — | 删除要素回调 |
| `onDrawSelect` | `(feature: DrawFeature \| null) => void` | — | 选中/取消选中回调 |
| `onModeChange` | `(mode: DrawMode) => void` | — | 模式切换回调 |
| `onChange` | `(features: DrawFeature[]) => void` | — | 要素集合变化回调 |

## 绘制模式

| 模式 | 图标 | 操作说明 |
|------|------|----------|
| `point` | `location_on` | 单击放置点 |
| `polyline` | `timeline` | 单击添加顶点，双击结束 |
| `polygon` | `pentagon` | 单击添加顶点，双击闭合 |
| `circle` | `radio_button_unchecked` | 单击圆心，再单击确定半径 |
| `rectangle` | `crop_square` | 按住拖拽绘制矩形 |
| `edit` | `edit_square` | 选中要素后拖拽移动或编辑顶点 |
| `merge` | `call_merge` | 选中 2+ 要素合并为一个 |
| `split` | `content_cut` | 绘制切线将要素分割 |

## 编辑模式操作

在 `edit` 模式下：

- **选中要素** — 单击要素选中，单击空白取消选中
- **移动要素** — 拖拽选中的要素体整体移动
- **移动顶点** — 拖拽顶点句柄调整形状
- **添加顶点** — 双击 LineString/Polygon 的边中点插入新顶点
- **删除顶点** — 右键点击顶点删除（LineString 至少留 2 顶点，Polygon 至少留 3 顶点）

## 样式配置

```tsx
styles={{
  point: {
    color: '#2563eb',        // 填充色
    size: 8,                 // 半径
    strokeColor: '#fff',     // 描边色
    strokeWidth: 2,          // 描边宽度
  },
  line: {
    color: '#2563eb',        // 线条色
    size: 3,                 // 线宽
    opacity: 0.9,            // 透明度
  },
  polygon: {
    fill: '#2563eb',         // 填充色
    fillOpacity: 0.3,        // 填充透明度
    stroke: '#2563eb',       // 描边色
    strokeWidth: 2,          // 描边宽度
  },
  drawing: {
    fill: '#2563eb',         // 绘制中填充色
    fillOpacity: 0.2,        // 绘制中填充透明度
    stroke: '#2563eb',       // 绘制中描边色
    strokeWidth: 2,          // 绘制中描边宽度
    dashStroke: '#2563eb',   // 虚线引导线颜色
    dashWidth: 1,            // 虚线宽度
    dashArray: [4, 4],       // 虚线 dash-array
  },
  selected: {
    stroke: '#f59e0b',       // 选中描边色
    strokeWidth: 3,          // 选中描边宽度
    fill: '#f59e0b',         // 选中填充色
    fillOpacity: 0.3,        // 选中填充透明度
    dashArray: [4, 4],       // 选中边框虚线模式
  },
  vertex: {
    color: '#fff',           // 固定点填充色
    size: 6,                 // 固定点半径
    strokeColor: '#000',     // 固定点描边色
    strokeWidth: 2,          // 固定点描边宽度
    activeColor: '#f59e0b',  // 活动点颜色
    activeSize: 8,           // 活动点半径
  },
}}
```

## 吸附配置

```tsx
snap={{
  enabled: true,    // 是否启用吸附
  threshold: 8,     // 吸附像素阈值
  vertex: true,     // 是否启用顶点吸附
  edge: true,       // 是否启用边吸附
}}
```

## 命令式 API

```tsx
import { useRef } from 'react';
import { DrawControl, type DrawControlHandle } from '@antv/aimapui';

const drawRef = useRef<DrawControlHandle>(null);

// 切换模式
drawRef.current?.setMode('polygon');

// 添加要素
drawRef.current?.addFeatures([newFeature]);

// 删除要素
drawRef.current?.deleteFeature(featureId);

// 清除所有
drawRef.current?.clearAll();

// 获取所有要素
const features = drawRef.current?.getFeatures();

// 选中要素
drawRef.current?.selectFeature(featureId);
```

## Schema 模式

```json
{
  "type": "draw",
  "position": "topright",
  "options": {
    "modes": ["point", "polygon", "edit"],
    "showDelete": true
  }
}
```

## 相关文档

- [controls.md](controls.md) — 所有控件概览

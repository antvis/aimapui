# DrawControl

地图绘制控件，支持交互式绘制点、折线、多边形、矩形、圆形，以及编辑已绘制的要素（移动、修改顶点、删除）。

> 仅需标注坐标时考虑 [Marker](../marker/marker)；需要只读展示矢量数据时使用 [PointLayer](../layer/point-layer) / [LineLayer](../layer/line-layer) / [PolygonLayer](../layer/polygon-layer)。DrawControl 用于**用户交互式绘制和编辑**地理要素。

## 导入

```tsx
import { DrawControl, type DrawFeature, type DrawMode } from '@antv/aimapui'
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `position` | [ControlPosition](./zoom-control#controlposition) | `'topright'` | 控件在地图上的位置 |
| `defaultFeatures` | `DrawFeature[]` | `[]` | 初始要素（非受控模式） |
| `features` | `DrawFeature[]` | - | 受控要素，传入后组件不再自行管理要素状态 |
| `modes` | `DrawToolMode[]` | 全部模式 | 工具栏显示的绘制模式，可控制只展示部分工具 |
| `showDelete` | `boolean` | `true` | 是否显示删除和清除按钮 |
| `styles` | `DrawStyleConfig` | - | 自定义各几何类型的样式配置 |
| `className` | `string` | - | 自定义 CSS 类名 |
| `style` | `React.CSSProperties` | - | 自定义行内样式 |
| `onDrawCreate` | `(features: DrawFeature[]) => void` | - | 创建要素回调 |
| `onDrawUpdate` | `(feature: DrawFeature) => void` | - | 更新要素回调（移动/编辑顶点后触发） |
| `onDrawDelete` | `(feature: DrawFeature) => void` | - | 删除要素回调 |
| `onDrawSelect` | `(feature: DrawFeature \| null) => void` | - | 选中/取消选中回调 |
| `onModeChange` | `(mode: DrawMode) => void` | - | 模式切换回调 |
| `onChange` | `(features: DrawFeature[]) => void` | - | 要素集合变化回调 |

### DrawMode

```typescript
type DrawMode = 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle' | 'edit' | 'none'
type DrawToolMode = Exclude<DrawMode, 'none'>  // 工具栏按钮可用的模式
```

### DrawFeature

```typescript
interface DrawFeature extends GeoJSON.Feature {
  id: string
  properties: {
    drawType: 'point' | 'polyline' | 'polygon' | 'rectangle' | 'circle'
    [key: string]: unknown
  }
}
```

### DrawStyleConfig

```typescript
interface DrawStyleConfig {
  point?: { color?: string; size?: number; strokeColor?: string; strokeWidth?: number }
  line?: { color?: string; size?: number; opacity?: number }
  polygon?: { fill?: string; fillOpacity?: number; stroke?: string; strokeWidth?: number }
  drawing?: { fill?: string; fillOpacity?: number; stroke?: string; strokeWidth?: number }
  selected?: { stroke?: string; strokeWidth?: number; fill?: string; fillOpacity?: number }
  vertex?: { color?: string; size?: number; strokeColor?: string; strokeWidth?: number }
}
```

## 示例

### 基础用法

默认展示全部绘制工具，点击工具栏按钮切换绘制模式：

```tsx
import { AiMap, DrawControl } from '@antv/aimapui'

<AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 12 }}>
  <DrawControl />
</AiMap>
```

### 监听绘制事件

通过回调函数获取绘制的要素数据：

```tsx
import { AiMap, DrawControl, type DrawFeature } from '@antv/aimapui'

function MapWithDraw() {
  const [features, setFeatures] = useState<DrawFeature[]>([])

  return (
    <AiMap map={{ basemap: 'gaode', center: [116.397, 39.908], zoom: 12 }}>
      <DrawControl
        onDrawCreate={(newFeatures) => {
          setFeatures(prev => [...prev, ...newFeatures])
          console.log('创建:', newFeatures)
        }}
        onDrawUpdate={(feature) => console.log('更新:', feature)}
        onDrawDelete={(feature) => console.log('删除:', feature)}
        onModeChange={(mode) => console.log('模式:', mode)}
      />
    </AiMap>
  )
}
```

### 限制可用工具

通过 `modes` 属性只显示需要的绘制工具：

```tsx
<DrawControl modes={['point', 'polyline', 'polygon']} />
```

### 自定义样式

配置各几何类型和编辑状态的样式：

```tsx
<DrawControl
  styles={{
    point: { color: '#ef4444', size: 10 },
    line: { color: '#ef4444', size: 2 },
    polygon: { fill: 'rgba(239, 68, 68, 0.2)', stroke: '#ef4444', strokeWidth: 2 },
    selected: { stroke: '#f59e0b', strokeWidth: 3 },
  }}
/>
```

### 命令式 API

通过 `ref` 调用命令式方法：

```tsx
import { useRef } from 'react'
import { DrawControl, type DrawControlHandle } from '@antv/aimapui'

function MapWithDraw() {
  const drawRef = useRef<DrawControlHandle>(null)

  const handleExport = () => {
    const features = drawRef.current?.getFeatures() ?? []
    console.log('导出 GeoJSON:', JSON.stringify(features, null, 2))
  }

  return (
    <>
      <button onClick={handleExport}>导出要素</button>
      <button onClick={() => drawRef.current?.clearAll()}>清除所有</button>
      <AiMap map={{ basemap: 'gaode' }}>
        <DrawControl ref={drawRef} />
      </AiMap>
    </>
  )
}
```

## 绘制交互说明

| 模式 | 操作 | 快捷键 |
|------|------|--------|
| **point** | 单击地图放置点 | - |
| **polyline** | 单击添加顶点，双击完成折线 | Escape 取消当前绘制 |
| **polygon** | 单击添加顶点，双击闭合多边形（≥3 顶点） | Escape 取消 |
| **rectangle** | 按住鼠标拖拽绘制矩形 | - |
| **circle** | 单击设置圆心，移动鼠标预览半径，再次单击完成 | - |
| **edit** | 单击选中要素；拖拽要素体移动；拖拽顶点修改形状 | Delete 删除选中要素 |

### 编辑模式详细操作

| 操作 | 方法 |
|------|------|
| **选中要素** | 单击已绘制的要素 |
| **移动要素** | 拖拽选中的要素体 |
| **移动顶点** | 拖拽要素上的顶点句柄 |
| **删除顶点** | 右键点击顶点句柄（LineString 最少保留 2 顶点，Polygon 最少保留 3 顶点） |
| **添加顶点** | 双击 LineString/Polygon 的边线，在最近位置插入新顶点 |
| **删除要素** | 选中后按 Delete 或 Backspace，或点击工具栏删除按钮 |
| **取消选中** | 点击地图空白区域，或按 Escape |

### 绘制反馈样式

| 元素 | 颜色 | 说明 |
|------|------|------|
| 已确认线段 | 蓝色实线 (#2563eb) | 与已完成要素同色 |
| 鼠标引导线 | 黄色虚线 (#fbbf24) | 从最后一个确认顶点到鼠标位置 |
| 闭合引导线 | 黄色虚线 | 多边形模式下，从鼠标位置到第一个顶点 |
| 绘制中的面 | 黄色半透明填充 | 多边形/矩形/圆形的预览填充 |
| 绘制中的顶点 | 白点 + 黄色描边 | 已确认的顶点标记 |

## 注意事项

- 进入 polyline/polygon 绘制模式时自动禁用双击缩放，退出后恢复
- 进入矩形绘制或编辑拖拽时自动禁用地图拖拽和缩放手势
- 圆形以正 64 边形近似表示（GeoJSON 无原生 Circle 类型）
- 绘制过程中，已确认的线段显示蓝色实线，鼠标引导线显示为黄色虚线，便于区分
- 同一绘制按钮点击两次可退出当前模式（切换回 `none`）

## 相关组件

- [ZoomControl](./zoom-control) — 缩放控件
- [PointLayer](../layer/point-layer) / [LineLayer](../layer/line-layer) / [PolygonLayer](../layer/polygon-layer) — 只读图层展示
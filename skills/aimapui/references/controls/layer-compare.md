# LayerCompare — 图层对比组件

**独立容器**（不放入 `<AiMap>` 内部），在同一区域创建两个同步的 L7 场景，支持 **双屏对比（split）** 与 **卷帘对比（swipe）**，通过可拖动分隔条控制两侧范围。常用于逐像素对比两套图层或底图。

> 与 `MapThemeControl`/`LayerSwitchControl` 区别：后两者切换 `<AiMap>` 内单一主题/图层；`LayerCompare` 同时渲染两个完整场景做对比。

```tsx
import { LayerCompare } from '@antv/aimapui';
```

## 两种模式

| 模式 | 说明 | 分隔条 |
|------|------|--------|
| `'split'` 双屏 | 左右两个地图并排 | 拖动调两侧宽度比例 |
| `'swipe'` 卷帘 | 两地图叠放，上层用 `clip-path` 被卷帘条裁切 | 拖动揭示/遮挡下层 |

## 基础用法

```tsx
<LayerCompare
  mode="swipe"
  map={{ basemap: 'gaode', center: [116.4, 39.91], zoom: 12 }}
  before={<SatelliteLayer provider="gaode" />}
  after={
    <BubbleLayer
      source={pois}
      sourceType="json"
      sourceConfig={{ x: 'lng', y: 'lat' }}
      colorField="category"
      sizeField="value"
      sizeRange={[8, 26]}
    />
  }
/>
```

`before` / `after` 接收任意组件化图层，分别绑定到内部 before/after 场景。

## 对比两套底图

在共享 `map` 之上用 `beforeMap` / `afterMap` 覆盖（例如 light vs dark）：

```tsx
<LayerCompare
  mode="split"
  map={{ center: [116.4, 39.91], zoom: 11 }}
  beforeMap={{ basemap: 'gaode', style: 'light' }}
  afterMap={{ basemap: 'gaode', style: 'dark' }}
  before={<SatelliteLayer provider="gaode" />}
  after={<></>}
/>
```

## 相机同步机制（重点）

两侧相机（平移/缩放/俯仰/旋转）自动双向同步。实现采用 **领航者（leader）机制**，无节流、逐帧同步：

- 某侧开始移动即成为领航者，立即把相机应用到另一侧（跟随者）。
- 跟随者由程序化 `setCenter` 产生的 **回声事件一律忽略**，避免反馈环。
- 仅 **领航者自身的 `moveend`** 释放领航权。

这样保证：① 拖动流畅（逐帧、无防抖延迟）；② **不会**把相机回写到正在被用户拖动的那一侧（即卷帘模式下拖动地图不会被反向调用、打断）。`sync={false}` 可关闭同步。

> 因此卷帘模式既可拖动地图对比，也可缩放；双屏模式联动平滑。

## 编程式控制（ref）

```tsx
const ref = useRef<LayerCompareHandle>(null);

ref.current.getScenes();      // { before, after }
ref.current.syncCameras();    // 强制 after 对齐到 before
ref.current.setMode('swipe');
ref.current.setPosition(60);  // 0-100
```

```typescript
interface LayerCompareHandle {
  getScenes: () => { before: Scene | null; after: Scene | null };
  setMode: (mode: LayerCompareMode) => void;
  setPosition: (pos: number) => void;
  syncCameras: () => void;  // after ← before
}
```

## Props

| 属性 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `mode` | `'split' \| 'swipe'` | `'split'` | 对比模式（受控时可配 `onModeChange`） |
| `map` | `MapSchema` | - | 共享基础地图配置（center/zoom/basemap 等） |
| `beforeMap` | `Partial<MapSchema>` | - | before 侧覆盖配置，合并到 `map` 之上 |
| `afterMap` | `Partial<MapSchema>` | - | after 侧覆盖配置 |
| `before` | `ReactNode` | - | before 侧图层 |
| `after` | `ReactNode` | - | after 侧图层 |
| `defaultPosition` | `number` | `50` | 初始分隔/卷帘位置（0-100） |
| `sync` | `boolean` | `true` | 是否双向同步两侧相机 |
| `showModeSwitch` | `boolean` | `true` | 显示双屏/卷帘切换工具栏 |
| `showLabels` | `boolean` | `true` | 显示 before/after 标签 |
| `beforeLabel` | `string` | `'Before'` | before 侧标签 |
| `afterLabel` | `string` | `'After'` | after 侧标签 |
| `theme` | `'light' \| 'dark' \| 'system'` | `'light'` | 工具栏/控件主题 |
| `onModeChange` | `(mode) => void` | - | 模式切换回调 |
| `onPositionChange` | `(pos: number) => void` | - | 位置变化回调 |
| `onSceneReady` | `(scenes: { before; after }) => void` | - | 两场景就绪回调 |
| `className` / `style` | `string` / `CSSProperties` | - | 容器样式 |

```typescript
type LayerCompareMode = 'split' | 'swipe';
```

## 注意事项

- 内部创建 **两个** L7 `Scene`，开销约为单地图的两倍；移动端/低性能设备按需使用。
- 卷帘模式 `clip-path` 裁掉的区域不接收鼠标事件，两侧可分别与对应地图交互。
- 组件 **独立于 `<AiMap>`**：内部已自带 `EventBusProvider`，可直接在任意容器中渲染。
- 模式切换/分隔条拖动会自动 `resize` 两侧场景画布（rAF 节流），无需手动触发。
- **卷帘模式默认关闭旋转手势**（`dragRotate=false`），避免两层全宽画布叠放时双指跨边界误触旋转；如需旋转传 `map.gestureConfig.dragRotate=true`。双屏默认开启。

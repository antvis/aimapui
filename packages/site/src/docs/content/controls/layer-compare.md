# LayerCompare

图层对比组件，在同一区域内创建两个同步的地图场景，支持 **双屏对比** 与 **卷帘对比** 两种模式，通过可拖动的分隔条控制两侧范围。

> **何时选择：** 需要将两套图层（或两套底图）放在同一视野下逐像素对比时用 `LayerCompare`；只需切换单一底图主题时用 [MapThemeControl](./map-theme-control)；只需控制业务图层的显隐时用 [LayerSwitchControl](./layer-switch-control)。

## 导入

```tsx
import { LayerCompare } from '@antv/aimapui'
```

## 两种模式

| 模式 | 说明 | 分隔条行为 |
|------|------|-----------|
| `'split'` 双屏 | 左右两个地图并排显示 | 拖动调整两侧宽度比例 |
| `'swipe'` 卷帘 | 两个地图完全叠放，上层通过 `clip-path` 被卷帘条裁切 | 拖动揭示/遮挡下层 |

两种模式下两侧地图的相机（平移 / 缩放 / 俯仰 / 旋转）都会自动双向同步，保证视野始终对齐。

## 基础用法

```tsx
import { LayerCompare, PMTilesLayer } from '@antv/aimapui'

const URL_BEFORE =
  'https://pmtiles-data.oss-cn-beijing.aliyuncs.com/sun_jia_xiao_zhuang_8_1_7_r_e_s_u_l_t.pmtiles'
const URL_AFTER =
  'https://pmtiles-data.oss-cn-beijing.aliyuncs.com/tai_an_fei_cheng_9_4_tai_an_fei_cheng_sun_jia_xiao_zhuang_9_4.pmtiles'

;<LayerCompare
  mode="swipe"
  map={{ basemap: 'gaode', style: 'satellite' }}
  beforeLabel="2025-08-17"
  afterLabel="2025-09-04"
  before={<PMTilesLayer url={URL_BEFORE} fitBounds fitBoundsPadding={40} />}
  after={<PMTilesLayer url={URL_AFTER} />}
/>
```

将两个时相的 PMTiles 栅格影像归档分别置于 `before` / `after`，拖动卷帘条即可逐像素对比变化。`before` 负责 `fitBounds` 定位，`after` 通过两侧相机自动同步对齐，无需重复定位。PMTiles 栅格图层在 L7 WebGL 层渲染，**与底图引擎无关**；使用高德底图时无需配置 token（组件内置默认 token 可用）。

`before` / `after` 接收任意组件化图层（`PointLayer`、`SatelliteLayer`、`BubbleLayer` 等），它们会分别绑定到内部的 before / after 场景。

## 对比两套底图

通过 `beforeMap` / `afterMap` 在共享 `map` 配置之上覆盖，即可对比两套底图（例如亮色 vs 暗色、卫星 vs 矢量）：

```tsx
;<LayerCompare
  mode="split"
  map={{ center: [116.4, 39.91], zoom: 11 }}
  beforeMap={{ basemap: 'gaode', style: 'light' }}
  afterMap={{ basemap: 'gaode', style: 'dark' }}
  before={<SatelliteLayer provider="gaode" />}
  after={<></>}
/>
```

## 受控模式

`mode` 受控时配合 `onModeChange`，可在外部切换双屏 / 卷帘；`defaultPosition` 控制初始分隔位置。

```tsx
const [mode, setMode] = useState<'split' | 'swipe'>('split')

;<LayerCompare
  mode={mode}
  onModeChange={setMode}
  map={{ basemap: 'gaode', center: [116.4, 39.91], zoom: 12 }}
  before={<SatelliteLayer />}
  after={<PointLayer source={pois} sourceType="json" sourceConfig={{ x: 'lng', y: 'lat' }} color="#ef4444" size={8} />}
/>
```

## 编程式控制

通过 ref 获取 `LayerCompareHandle`，可读取场景、切换模式或同步相机：

```tsx
const ref = useRef<LayerCompareHandle>(null)

// 获取两个场景
const { before, after } = ref.current.getScenes()

// 强制把 after 对齐到 before
ref.current.syncCameras()

// 切换为卷帘
ref.current.setMode('swipe')
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mode` | `'split' \| 'swipe'` | `'split'` | 对比模式。`split` 双屏并排，`swipe` 卷帘叠放 |
| `map` | [MapSchema](#mapschema) | - | 共享的基础地图配置（center / zoom / basemap 等） |
| `beforeMap` | `Partial<MapSchema>` | - | before（左侧 / 卷帘下层）地图配置覆盖，合并到 `map` 之上 |
| `afterMap` | `Partial<MapSchema>` | - | after（右侧 / 卷帘上层）地图配置覆盖，合并到 `map` 之上 |
| `before` | `React.ReactNode` | - | before 侧图层（组件化 API，如 `<SatelliteLayer />`） |
| `after` | `React.ReactNode` | - | after 侧图层 |
| `defaultPosition` | `number` | `50` | 初始分隔 / 卷帘位置（0-100） |
| `sync` | `boolean` | `true` | 是否双向同步两侧相机 |
| `showModeSwitch` | `boolean` | `true` | 是否显示双屏 / 卷帘切换工具栏 |
| `showLabels` | `boolean` | `true` | 是否显示 before / after 标签 |
| `beforeLabel` | `string` | `'Before'` | before 侧标签文案 |
| `afterLabel` | `string` | `'After'` | after 侧标签文案 |
| `theme` | `'light' \| 'dark' \| 'system'` | `'light'` | 工具栏与控件主题 |
| `onModeChange` | `(mode: LayerCompareMode) => void` | - | 模式切换回调 |
| `onPositionChange` | `(pos: number) => void` | - | 分隔 / 卷帘位置变化回调（0-100） |
| `onSceneReady` | `(scenes: { before: Scene; after: Scene }) => void` | - | 两个场景均就绪后回调 |
| `className` | `string` | - | 容器自定义类名 |
| `style` | `React.CSSProperties` | - | 容器自定义行内样式 |

### LayerCompareMode

```typescript
type LayerCompareMode = 'split' | 'swipe'
```

### LayerCompareHandle

```typescript
interface LayerCompareHandle {
  getScenes: () => { before: Scene | null; after: Scene | null }
  setMode: (mode: LayerCompareMode) => void
  setPosition: (pos: number) => void
  syncCameras: () => void
}
```

## 注意事项

- 组件内部会创建 **两个** L7 `Scene` 实例，资源开销约为单个地图的两倍；在移动端或低性能设备上建议按需使用。
- 卷帘模式通过 CSS `clip-path` 裁切上层地图，裁掉的区域不再接收鼠标事件，因此卷帘左/右两侧可分别与对应地图交互。
- **卷帘模式默认关闭旋转手势**（`dragRotate=false`）：因两层全宽画布叠放，双指手势跨卷帘边界会拆分到两个底图实例而误触旋转。如需旋转，传 `map={{ gestureConfig: { dragRotate: true } }}` 显式开启；双屏模式不受影响（默认开启旋转）。
- 两侧相机同步采用 **领航者（leader）机制**，逐帧同步、无防抖延迟；跟随者由程序化 `setCenter` 产生的回声一律忽略，因此不会把相机回写到正在被拖动的那一侧（卷帘可拖动地图对比、双屏联动平滑）。

# 移动端组件

aimapui 提供移动端专用组件，所有组件使用 Material Design 3 风格 + 毛玻璃效果。

## MobileToolbar — 底部/顶部工具栏

```tsx
import { MobileToolbar } from '@antv/aimapui';

<MobileToolbar
  config={{
    items: ['zoomIn', 'zoomOut', 'locate', 'reset', 'layers'],
    position: 'bottom',  // 'bottom' | 'top'
  }}
/>
```

**内置 Action：**

| Action   | 行为                                   |
| -------- | -------------------------------------- |
| zoomIn   | 调用 `scene.zoomIn()`                  |
| zoomOut  | 调用 `scene.zoomOut()`                 |
| locate   | 获取 GPS 定位 → setCenter + setZoom(14) |
| reset    | setCenter([105,35]) + setZoom(4)       |
| layers   | 由上层业务处理（无内置行为）           |

**Props：**

```typescript
interface MobileToolbarProps {
  config: MobileToolbarConfig;
  className?: string;
}

interface MobileToolbarConfig {
  items: string[];             // 工具按钮列表
  position: 'bottom' | 'top'; // 工具栏位置
}
```

---

## BottomSheet — 三档底部抽屉

```tsx
import { BottomSheet } from '@antv/aimapui';

<BottomSheet
  defaultSnap="half"
  collapsedHeight={80}
  halfRatio={0.45}
  expandedRatio={0.85}
  showHandle={true}
  borderRadius={32}
  onSnapChange={(snap) => console.log(snap)}
>
  <div>抽屉内容</div>
</BottomSheet>
```

**三档吸附：**

| Snap      | 高度                          | 说明     |
| --------- | ----------------------------- | -------- |
| collapsed | `collapsedHeight` (默认 80px) | 收起     |
| half      | 容器高度 × `halfRatio`        | 半展开   |
| expanded  | 容器高度 × `expandedRatio`    | 完全展开 |

**手势支持：** Touch + Mouse（桌面调试），快速滑动自动吸附。

**Props：**

```typescript
type BottomSheetSnap = 'collapsed' | 'half' | 'expanded';

interface BottomSheetProps {
  children?: React.ReactNode;
  defaultSnap?: BottomSheetSnap;     // 默认 'collapsed'
  collapsedHeight?: number;          // 默认 80
  halfRatio?: number;                // 默认 0.45
  expandedRatio?: number;            // 默认 0.85
  onSnapChange?: (snap: BottomSheetSnap) => void;
  className?: string;
  showHandle?: boolean;              // 默认 true
  borderRadius?: number;             // 默认 32
}
```

---

## MobileSheetLegend — 移动端图例抽屉

```tsx
import { MobileSheetLegend } from '@antv/aimapui';

<MobileSheetLegend
  legends={[
    { type: 'categories', title: '用地', labels: ['A','B'], colors: ['#f00','#00f'], swatchShape: 'circle', grid: true },
    { type: 'ramp', title: '密度', labels: ['低','高'], colors: ['#eee','#333'], isContinuous: true },
  ]}
  interaction={{ onHover: (i) => {}, onToggle: (i) => {} }}
/>
```

玻璃拟态面板，点击标题栏展开/收起。展开时 max-h-[65vh]，收起时 max-h-14。支持全部 8 种图例类型。

**Props：**

```typescript
interface MobileSheetLegendProps {
  legends: LegendSchema[];
  className?: string;
  interaction?: LegendInteractionCallbacks;
}
```

---

## SearchBar — 浮动搜索框

```tsx
import { SearchBar } from '@antv/aimapui';

<SearchBar
  placeholder="搜索地点..."
  onSearch={(value) => console.log(value)}
  onFilter={() => console.log('打开筛选')}
  trailing={<button>自定义</button>}
/>
```

Material Design 3 毛玻璃风格，固定在顶部。内置搜索图标 + 清除按钮 + 可选筛选按钮。

**Props：**

```typescript
interface SearchBarProps {
  placeholder?: string;          // 默认 '搜索地点...'
  onSearch?: (value: string) => void;
  onFilter?: () => void;
  className?: string;
  trailing?: React.ReactNode;    // 右侧自定义操作区
}
```

---

## TouchGesturePanel — 触摸手势面板（占位）

当前为占位组件，未来可扩展为手势控制 UI。

---

## Schema 模式使用

在 `responsive.mobile` 中配置移动端行为：

```typescript
const schema: AiMapSchema = {
  map: { basemap: 'gaode' },
  layers: [...],
  responsive: {
    breakpoint: 768,
    mobile: {
      controls: { position: 'bottom', scale: 0.8, hide: ['scale'] },
      layers: { '*': { opacity: 0.7 } },   // 通配符覆盖所有图层
      legends: { compact: true, position: 'bottom-left' },
      toolbar: { items: ['zoomIn', 'zoomOut', 'locate'], position: 'bottom' },
    },
  },
};
```

**MobileConfig 类型：**

```typescript
interface MobileConfig {
  controls?: MobileControlConfig;        // 控件位置/缩放/隐藏
  layers?: MobileLayerOverrides | { '*': Partial<LayerSchema> };  // 图层覆盖
  legends?: MobileLegendConfig;           // 图例精简/位置
  toolbar?: MobileToolbarConfig;          // 工具栏按钮
}

interface MobileControlConfig {
  position?: string;
  scale?: number;
  hide?: string[];
}

interface MobileLegendConfig {
  compact?: boolean;
  position?: string;
}
```

## 相关文档

- [aimap-container.md](../core/aimap-container.md) — AiMap 主容器
- [controls.md](../controls/controls.md) — 地图控件
- [legend-components.md](../legend/legend-components.md) — 图例组件
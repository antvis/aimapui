# MobileToolbar — 底部/顶部工具栏

移动端底部或顶部工具栏，提供缩放、定位、复位等常用地图操作按钮。

## Examples

```tsx
import { MobileToolbar } from '@antv/aimapui';

// 底部工具栏
<MobileToolbar
  config={{
    items: ['zoomIn', 'zoomOut', 'locate', 'reset'],
    position: 'bottom',
  }}
/>

// 顶部工具栏
<MobileToolbar
  config={{
    items: ['zoomIn', 'zoomOut', 'locate', 'reset', 'layers'],
    position: 'top',
  }}
/>
```

## 内置 Action

| Action | 行为 |
|--------|------|
| `zoomIn` | 调用 `scene.zoomIn()` |
| `zoomOut` | 调用 `scene.zoomOut()` |
| `locate` | 获取 GPS 定位 → `setCenter` + `setZoom(14)` |
| `reset` | `setCenter([105, 35])` + `setZoom(4)` |
| `layers` | 由上层业务处理（无内置行为） |

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `config` | `MobileToolbarConfig` | **必填** | 工具栏配置 |
| `className` | `string` | — | 自定义样式类名 |

### MobileToolbarConfig

```ts
interface MobileToolbarConfig {
  items: string[];              // 工具按钮列表
  position: 'bottom' | 'top';  // 工具栏位置
}
```

## 相关文档

- [index.md](index.md) — 移动端组件概览
- [bottom-sheet.md](bottom-sheet.md) — 底部抽屉
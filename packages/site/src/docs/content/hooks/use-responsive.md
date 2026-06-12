# useResponsive

响应式 Hook，提供断点检测和移动端判断，方便根据屏幕宽度切换地图的 PC/移动端布局。

## 导入

```tsx
import { ResponsiveProvider, useResponsive } from '@antv/aimapui';
```

## 用法

首先在根组件包裹 `ResponsiveProvider`，然后在子组件中使用 `useResponsive` Hook。

### ResponsiveProvider

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `responsive` | `ResponsiveSchema` | - | 断点配置，可自定义 `breakpoint` 阈值 |
| `children` | `ReactNode` | **必填** | 子组件 |

### ResponsiveSchema

```typescript
interface ResponsiveSchema {
  breakpoint?: number;  // 移动端断点宽度（px），默认 768
}
```

### useResponsive 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `isMobile` | `boolean` | 是否为移动端（窗口宽度 < breakpoint） |
| `breakpoint` | `number` | 当前断点阈值（默认 768） |
| `width` | `number` | 当前窗口宽度（px） |
| `schema` | `ResponsiveSchema \| undefined` | 当前生效的断点配置 |

## 示例

### 基础用法 — PC/移动端布局切换

```tsx
import { ResponsiveProvider, useResponsive, AiMap } from '@antv/aimapui';

// 根组件包裹 Provider
function App() {
  return (
    <ResponsiveProvider>
      <MapView />
    </ResponsiveProvider>
  );
}

// 子组件中使用 Hook
function MapView() {
  const { isMobile, width } = useResponsive();

  return (
    <AiMap map={{ basemap: 'gaode', center: [116.4, 39.9], zoom: 10 }}>
      {isMobile ? <MobileToolbar /> : <DesktopControls />}
    </AiMap>
  );
}
```

### 自定义断点

```tsx
// 将断点设为 1024px，适合平板横竖屏切换
<ResponsiveProvider responsive={{ breakpoint: 1024 }}>
  <App />
</ResponsiveProvider>
```

### 配合地图组件条件渲染

```tsx
function MapWithControls() {
  const { isMobile } = useResponsive();

  return (
    <AiMap map={{ basemap: 'gaode', center: [108, 34], zoom: 4 }}>
      <PointLayer source={data} />
      {isMobile ? (
        <BottomSheet>{/* 移动端抽屉式图例 */}</BottomSheet>
      ) : (
        <LegendCategories position="bottomleft" />
      )}
    </AiMap>
  );
}
```

## 注意事项

- `ResponsiveProvider` 必须在 `useResponsive` 的使用组件之上，否则 Hook 返回默认值（`isMobile: false`, `width: 1024`）
- 宽度检测使用 `window.innerWidth` + `resize` 事件，在 SSR 环境下首次渲染默认为 1024px
- 断点变化时组件会重渲染，避免在 `useResponsive` 返回值上做频繁计算；如需节流可在外层使用 `useMemo`
- 默认断点 768px 对应 iPad 竖屏宽度，适合大多数场景

## 相关组件

- [BottomSheet](../mobile/bottom-sheet) — 移动端底部抽屉
- [MobileToolbar](../mobile/mobile-toolbar) — 移动端工具栏
- [SearchBar](../mobile/search-bar) — 移动端搜索栏

# useResponsive

响应式 Hook，提供断点检测和移动端判断。

## 导入

```tsx
import { ResponsiveProvider, useResponsive } from '@antv/aimapui'
```

## 用法

首先在根组件包裹 `ResponsiveProvider`，然后在子组件中使用 `useResponsive` Hook。

### ResponsiveProvider

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| `responsive` | `ResponsiveSchema` | - | 断点配置 |
| `children` | `ReactNode` | **必填** | 子组件 |

### useResponsive 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `isMobile` | `boolean` | 是否为移动端 |
| `breakpoint` | `string` | 当前断点名 |
| `width` | `number` | 当前窗口宽度 |
| `schema` | `ResponsiveSchema` | 当前生效的断点配置 |

## 示例

```tsx
// 根组件
<ResponsiveProvider>
  <App />
</ResponsiveProvider>

// 子组件
function MapView() {
  const { isMobile, width } = useResponsive();
  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
```

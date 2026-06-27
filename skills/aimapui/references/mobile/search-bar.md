# SearchBar — 浮动搜索框

移动端浮动搜索框，Material Design 3 毛玻璃风格，固定在顶部。内置搜索图标 + 清除按钮 + 可选筛选按钮。

## Examples

```tsx
import { SearchBar } from '@antv/aimapui';

// 基础搜索
<SearchBar
  placeholder="搜索地点..."
  onSearch={(value) => console.log(value)}
/>

// 带筛选
<SearchBar
  placeholder="搜索..."
  onSearch={(value) => console.log(value)}
  onFilter={() => console.log('打开筛选')}
/>

// 自定义右侧区域
<SearchBar
  placeholder="搜索..."
  onSearch={handleSearch}
  trailing={<button>自定义</button>}
/>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `placeholder` | `string` | `'搜索地点...'` | 占位文本 |
| `onSearch` | `(value: string) => void` | — | 搜索值变化回调 |
| `onFilter` | `() => void` | — | 筛选按钮点击回调 |
| `trailing` | `ReactNode` | — | 右侧自定义操作区域 |
| `className` | `string` | — | 自定义样式类名 |

## 相关文档

- [index.md](index.md) — 移动端组件概览
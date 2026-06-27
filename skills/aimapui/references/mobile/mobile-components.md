# 移动端组件快速参考

移动端专用组件，Material Design 3 风格 + 毛玻璃效果。完整文档见各组件独立页面。

## 组件列表

| 组件 | 文档 | 说明 |
|------|------|------|
| MobileToolbar | [mobile-toolbar.md](mobile-toolbar.md) | 底部/顶部工具栏 — 缩放、定位、复位 |
| BottomSheet | [bottom-sheet.md](bottom-sheet.md) | 三档底部抽屉 — 收起/半展开/完全展开 |
| MobileSheetLegend | [mobile-sheet-legend.md](mobile-sheet-legend.md) | 移动端图例抽屉 — 8 种图例类型 |
| SearchBar | [search-bar.md](search-bar.md) | 浮动搜索框 — 毛玻璃风格 |
| TouchGesturePanel | [touch-gesture-panel.md](touch-gesture-panel.md) | 触摸手势面板（占位） |

## 快速示例

```tsx
// 工具栏
<MobileToolbar config={{ items: ['zoomIn', 'zoomOut', 'locate', 'reset'], position: 'bottom' }} />

// 底部抽屉
<BottomSheet defaultSnap="half"><div>内容</div></BottomSheet>

// 图例
<MobileSheetLegend legends={[{ type: 'categories', title: '分类', labels: ['A','B'], colors: ['#f00','#00f'] }]} />

// 搜索
<SearchBar placeholder="搜索..." onSearch={(v) => console.log(v)} />
```

## Schema 模式

```ts
responsive: {
  breakpoint: 768,
  mobile: {
    controls: { position: 'bottom', scale: 0.8, hide: ['scale'] },
    layers: { '*': { opacity: 0.7 } },
    legends: { compact: true, position: 'bottom-left' },
    toolbar: { items: ['zoomIn', 'zoomOut', 'locate'], position: 'bottom' },
  },
}
```

## 相关文档

- [index.md](index.md) — 移动端组件完整文档索引
- [aimap-container.md](../core/aimap-container.md) — AiMap 主容器
- [controls.md](../controls/controls.md) — 地图控件
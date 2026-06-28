# Mobile 移动端组件

移动端专用组件，所有组件使用 Material Design 3 风格 + 毛玻璃效果。

## 组件列表

| 组件 | 文档 | 说明 |
|------|------|------|
| MobileToolbar | [mobile-toolbar.md](mobile-toolbar.md) | 底部/顶部工具栏 — 缩放、定位、复位 |
| BottomSheet | [bottom-sheet.md](bottom-sheet.md) | 三档底部抽屉 — 收起/半展开/完全展开 |
| MobileSheetLegend | [mobile-sheet-legend.md](mobile-sheet-legend.md) | 移动端图例抽屉 — 8 种图例类型 |
| SearchBar | [search-bar.md](search-bar.md) | 浮动搜索框 — 毛玻璃风格 |
| TouchGesturePanel ⚠️ | [touch-gesture-panel.md](touch-gesture-panel.md) | 触摸手势面板（**尚未实现，不可使用**） |

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

在 `responsive.mobile` 中配置移动端行为：

```ts
const schema: AiMapSchema = {
  map: { basemap: 'gaode' },
  layers: [...],
  responsive: {
    breakpoint: 768,
    mobile: {
      controls: { position: 'bottom', scale: 0.8, hide: ['scale'] },
      layers: { '*': { opacity: 0.7 } },
      legends: { compact: true, position: 'bottom-left' },
      toolbar: { items: ['zoomIn', 'zoomOut', 'locate'], position: 'bottom' },
    },
  },
};
```

### MobileConfig 类型

```ts
interface MobileConfig {
  controls?: MobileControlConfig;
  layers?: MobileLayerOverrides | { '*': Partial<LayerSchema> };
  legends?: MobileLegendConfig;
  toolbar?: MobileToolbarConfig;
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
# Mobile 移动端组件

移动端专用组件，所有组件使用 Material Design 3 风格 + 毛玻璃效果。完整文档见各组件独立页面。

## 组件列表

| 组件 | 文档 | 说明 |
|------|------|------|
| MobileToolbar | [mobile-toolbar.md](mobile-toolbar.md) | 底部/顶部工具栏 |
| BottomSheet | [bottom-sheet.md](bottom-sheet.md) | 三档底部抽屉 |
| MobileSheetLegend | [mobile-sheet-legend.md](mobile-sheet-legend.md) | 移动端图例抽屉 |
| SearchBar | [search-bar.md](search-bar.md) | 浮动搜索框 |
| TouchGesturePanel | [touch-gesture-panel.md](touch-gesture-panel.md) | 触摸手势面板（占位） |

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
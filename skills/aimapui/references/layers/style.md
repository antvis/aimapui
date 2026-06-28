# 样式配置

图层样式通过 LayerSchema 的 `style`、`opacity`、`blend` 等属性配置。

## 不透明度

```typescript
const layer: LayerSchema = {
  type: 'point',
  source: data,
  color: '#2563eb',
  opacity: 0.7,  // 0~1，默认 1
};
```

## 混合模式

对齐 CSS `mix-blend-mode` 语义：

| blend 值      | 效果           | 适用场景               |
| ------------- | -------------- | ---------------------- |
| `normal`      | 默认           | —                      |
| `additive`    | 加法混合       | 发光点、粒子、热力叠加 |
| `subtractive` | 减法混合       | 暗色调叠加             |
| `max`         | 取最大值       | 密度叠加               |

```typescript
const layer: LayerSchema = {
  type: 'point',
  source: data,
  color: '#00ff88',
  blend: 'additive',  // 发光效果
};
```

## style 属性

`style` 是 `Record<string, unknown>` 类型，透传至 L7 Layer 的 `style()` 链式调用。

### PointLayer 常用 style

```typescript
style: {
  stroke: '#ffffff',       // 描边颜色
  strokeWidth: 2,         // 描边宽度
  opacity: 0.8,           // 与顶层 opacity 二选一
}
```

### LineLayer 常用 style

```typescript
style: {
  lineType: 'solid',      // 'solid' | 'dash'
  dashArray: [10, 5],     // 虚线参数 [线段, 间隔]
  lineWidth: 2,           // 线宽（也可通过 size 指定）
  opacity: 0.8,
}
```

### PolygonLayer 常用 style

```typescript
style: {
  stroke: '#333',
  strokeWidth: 1,
  opacity: 0.6,
}
// 3D 挤出
style: {
  extrusionHeight: 5000,  // 挤出高度 (shape='extrude' 时生效)
  extrusionBase: 0,       // 底部偏移
}
```

### HeatmapLayer style

```typescript
style: {
  intensity: 0.8,      // 热力强度
  radius: 20,          // 热力半径
  opacity: 0.6,
}
```

### RasterLayer style

```typescript
style: {
  opacity: 0.8,
  domain: [0, 255],    // 值域范围
  clampLow: false,
  clampHigh: true,
  noDataValue: -9999,
}
```

## 图层可见性与层级

```typescript
const layer: LayerSchema = {
  type: 'point',
  source: data,
  visible: true,      // 初始是否可见，默认 true
  zIndex: 10,          // 图层层级，数值越大越靠上
  minZoom: 3,          // 最小缩放级别
  maxZoom: 18,         // 最大缩放级别
  autoFit: true,       // 加载后自动适配视图到数据范围
};
```

## 响应式样式覆盖

在 `responsive.mobile.layers` 中可覆盖任意图层属性：

```typescript
responsive: {
  breakpoint: 768,
  mobile: {
    layers: {
      'city-points': { opacity: 0.5, size: 8 },  // 指定图层ID覆盖
      '*': { opacity: 0.7 },                       // 通配符覆盖所有
    },
  },
}
```

## 相关文档

- [mapping.md](mapping.md) — 视觉映射
- [index.md](index.md) — 基础图层概览
- [index.md](index.md) — 基础图层概览
- [../schema/schema-system.md](../schema/schema-system.md) — Schema 完整定义
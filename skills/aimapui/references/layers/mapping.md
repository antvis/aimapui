# 视觉映射

aimapui 的图层视觉映射采用 **Field + Values** 配对模式，对应 L7 的 Scale API。

## 目录

- [映射模式总览](#映射模式总览)
- [颜色映射](#颜色映射) — 固定颜色 / 分类映射 / 连续渐变 / 自定义映射字符串
- [大小映射](#大小映射) — 固定大小 / 字段映射
- [形状映射](#形状映射) — 各图层可用 Shape / 字段映射示例
- [过滤](#过滤)
- [交互高亮](#交互高亮)
- [动画配置](#动画配置)
- [Schema 中的完整示例](#在-schema-中的完整示例)
- [相关文档](#相关文档)

## 映射模式总览

| 映射通道    | 固定值           | 字段映射                       | 分段映射                           |
| ----------- | ---------------- | ------------------------------ | ---------------------------------- |
| `color`     | `color: '#00f'`  | `colorField` + `colorValues`   | colorField + colorValues(数组)     |
| `size`      | `size: 12`       | `sizeField` + `sizeValues`     | sizeField + sizeValues(数组)       |
| `shape`     | `shape: 'circle'`| `shapeField` + `shapeValues`   | shapeField + shapeValues(数组)     |

**规则：** 当只设置 `color`/`size`/`shape` 时为固定值；当同时设置 `xxxField` 时启用字段映射，`xxxValues` 为映射值域。

## 颜色映射

### 固定颜色

```typescript
const layer: LayerSchema = {
  type: 'polygon',
  source: geojsonData,
  color: '#2563eb',  // 所有要素统一颜色
};
```

### 分类映射

```typescript
const layer: LayerSchema = {
  type: 'point',
  source: cityData,
  colorField: 'category',
  colorValues: ['#2563eb', '#f59e0b', '#10b981', '#ef4444'],
};
// category='A' → #2563eb, 'B' → #f59e0b, ...
```

### 连续渐变

```typescript
const layer: LayerSchema = {
  type: 'point',
  source: cityData,
  colorField: 'population',
  colorValues: ['#f0f9e8', '#7bccc4', '#0868ac'],  // 低→高
};
```

### 分类 + 自定义映射字符串

`colorValues` 也支持 L7 的映射表达式字符串：

```typescript
colorValues: 'sequential(blue)',   // L7 内置色带
// 或
colorValues: 'diverging(red, white, green)',
```

## 大小映射

### 固定大小

```typescript
const layer: LayerSchema = {
  type: 'point',
  source: cityData,
  size: 12,  // 统一 12px
};
```

### 字段映射

```typescript
const layer: LayerSchema = {
  type: 'point',
  source: cityData,
  sizeField: 'population',
  sizeValues: [6, 30],  // 最小 6px, 最大 30px
};
```

## 形状映射

### PointLayer 可用 Shape

| 类别   | Shape 值                                                            |
| ------ | ------------------------------------------------------------------- |
| 基础   | `circle`, `square`, `triangle`, `diamond`                           |
| 3D     | `cylinder` (需开启地图 pitch)                                        |
| 文字   | `text` (需配合 shapeField 指定文本字段)                               |

### LineLayer 可用 Shape

| Shape          | 说明       |
| -------------- | ---------- |
| `line`         | 实线       |
| `arc`          | 弧线       |
| `arc3d`        | 3D 弧线    |
| `greatcircle`  | 大圆航线   |

### PolygonLayer 可用 Shape

| Shape      | 说明   |
| ---------- | ------ |
| `fill`     | 填充   |
| `extrusion`| 3D 拉起|

### HeatmapLayer 可用 Shape

| Shape          | 说明       |
| -------------- | ---------- |
| `heatmap`      | 热力图     |

### 字段映射示例

```typescript
const layer: LayerSchema = {
  type: 'point',
  source: poiData,
  shapeField: 'type',
  shapeValues: ['circle', 'square', 'diamond'],  // 根据类型映射
};
```

## 过滤

```typescript
const layer: LayerSchema = {
  type: 'point',
  source: cityData,
  filterField: 'status',
  filterValues: ['active', 'pending'],  // 只显示 status 为 active/pending 的要素
};
```

## 交互高亮

```typescript
const layer: LayerSchema = {
  type: 'polygon',
  source: geojsonData,
  active: true,                         // 启用 hover 高亮
  // 或
  active: { color: '#ff0000' },         // 自定义高亮颜色
  select: true,                         // 启用点击选中
  // 或
  select: { color: '#00ff00' },         // 自定义选中颜色
};
```

## 动画配置

```typescript
const layer: LayerSchema = {
  type: 'line',
  source: routeData,
  shape: 'flow',
  animate: {
    enable: true,
    speed: 2,          // 速度倍率，默认 1
    duration: 2000,     // 周期(ms)
    trailLength: 1,     // 拖尾长度
    repeat: Infinity,   // 重复次数
  },
};
```

## 在 Schema 中的完整示例

```typescript
const schema: AiMapSchema = {
  map: { basemap: 'gaode', center: [116.4, 39.9], zoom: 10 },
  layers: [
    {
      type: 'point',
      source: cityData,
      sourceType: 'json',
      sourceConfig: { x: 'lng', y: 'lat' },
      colorField: 'category',
      colorValues: ['#2563eb', '#f59e0b', '#10b981'],
      sizeField: 'population',
      sizeValues: [6, 30],
      shapeField: 'category',
      shapeValues: ['circle', 'square', 'diamond'],
      opacity: 0.8,
      blend: 'additive',
      active: true,
      select: { color: '#ff6b6b' },
      events: {
        click: 'city-click',
        enablePopup: true,
        popupFields: ['name', 'population', 'category'],
      },
    },
  ],
};
```

## 相关文档

- [index.md](index.md) — 基础图层概览
- [base-layers.md](base-layers.md) — 基础图层快速参考
- [style.md](style.md) — 样式配置
- [../composite/index.md](../composite/index.md) — 复合图层
- [../schema/schema-system.md](../schema/schema-system.md) — Schema 完整定义
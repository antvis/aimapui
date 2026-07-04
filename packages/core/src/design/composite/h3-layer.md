# H3 六边形网格图层 (H3Layer) 设计规范

本规范定义了基于 Uber H3 空间索引系统的六边形网格可视化方案，适用于空间聚合分析、密度热力、地理围栏等场景。

---

## 1. H3 基础概念 (H3 Fundamentals)

### 1.1 H3 索引
- **格式**: 15 字符十六进制字符串（如 `85440637fffffff`）
- **层级**: 0~15 级，数值越大六边形越小
- **唯一性**: 每个 H3 索引对应地球表面唯一的六边形区域

### 1.2 六边形几何
- **形状**: 正六边形（球面投影下略有变形）
- **边界**: 由 `h3-js.cellToBoundary()` 生成
- **中心**: 由 `h3-js.cellToLatLng()` 获取

---

## 2. 视觉规范 (Visual Specifications)

### 2.1 填充色阶
- **默认色板**: 5 级蓝色渐变 `['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb']`
- **数据驱动**: 通过 `colorField` + `colorValues` 映射
- **透明度**: 默认 0.8，可通过 `opacity` 调整

### 2.2 边界线 (Stroke)
- **默认开启**: `showStroke={true}`
- **颜色**: `rgba(255,255,255,0.3)`（半透明白色）
- **线宽**: 0.5px，极细描边区分相邻网格
- **可选关闭**: `showStroke={false}` 获得无缝拼接效果

### 2.3 文字标注 (Labels)
- **默认关闭**: `showLabel={false}`
- **定位**: 六边形几何中心
- **字体**: 默认样式，2px 白色光晕
- **碰撞检测**: 开启 `textAllowOverlap: false`
- **适用**: 低分辨率层级（大六边形）显示区域标识

---

## 3. 交互行为 (Interaction)

### 3.1 Hover 高亮
- **默认开启**: `hoverEffect={true}`
- **高亮色**: `#2563eb`（Primary Blue）
- **可选关闭**: `hoverEffect={false}`

### 3.2 Click 选中
- **默认关闭**: `clickEffect={false}`
- **选中色**: `#1d4ed8`（深蓝）
- **可选开启**: `clickEffect={true}`

### 3.3 事件回调
- `onClick`: 点击事件
- `onMouseMove`: 鼠标移动
- `onMouseEnter`: 鼠标进入
- `onMouseLeave`: 鼠标离开

---

## 4. 数据格式 (Data Format)

### 4.1 输入数据结构
```ts
interface H3DataItem {
  h3: string;        // H3 索引（默认字段名）
  value?: number;    // 数值字段（用于色阶映射）
  name?: string;     // 名称字段（用于标注）
  [key: string]: unknown;
}
```

### 4.2 字段配置
- **H3 字段**: 默认 `h3`，可通过 `h3Field` 自定义
- **无效过滤**: 自动跳过非字符串或无效的 H3 索引

### 4.3 GeoJSON 转换
- 组件内部将 H3 索引数组转换为 GeoJSON FeatureCollection
- 每个 H3 单元转为 Polygon Feature
- properties 保留原始数据字段（排除 h3Field）

---

## 5. 与 HexagonLayer 的区别

| 特性 | H3Layer | HexagonLayer |
|------|---------|----------------|
| 网格系统 | Uber H3（全球统一索引） | L7 内置 hexagon 聚合 |
| 数据来源 | 预计算的 H3 索引 | 原始点数据实时聚合 |
| 几何精度 | 球面正六边形 | 平面近似六边形 |
| 适用场景 | 空间分析、跨平台数据交换 | 快速点密度可视化 |
| 性能 | 中等（需边界计算） | 高（GPU 聚合） |

---

## 6. aimapui 默认实现

`H3Layer` 组件默认封装中已实现：

- H3 索引 → GeoJSON 自动转换
- 无效索引过滤（`isValidCell` 校验）
- 5 级蓝色渐变色板
- 0.5px 半透明白色描边
- Hover 高亮 + Click 选中（可选）
- 文字标注（质心定位 + 2px Halo）
- 完整事件回调支持

```tsx
<H3Layer
  source={h3Data}
  h3Field="h3"
  colorField="value"
  showStroke
  hoverEffect
/>
```

---

*Derived from: Cartographic Precision System v1.2.0 | H3 Spatial Index Module*

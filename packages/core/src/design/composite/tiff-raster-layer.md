# GeoTIFF 栅格图层 (TiffRasterLayer) 设计规范

本规范定义了 GeoTIFF 栅格数据的可视化方案，支持单波段伪彩色、多波段 RGB 合成与归一化差异指数渲染，适用于遥感、气象、地形等专业 GIS 场景。

---

## 1. 渲染模式 (Render Modes)

### 1.1 单波段伪彩色 (raster)
- **用途**: NDVI、DEM、夜光遥感、温度场等单波段数据
- **色带映射**: 数据值 → 颜色渐变
- **默认色带**: 夜光色阶 `['rgba(92,58,16,0)', '#fabd08', '#f1e93f', '#f1ff8f', '#fcfff7']`
- **值域**: `domain=[min, max]`，超出范围可截断 (`clampLow/clampHigh`)
- **NoData**: 指定无数据值（默认 0），渲染为透明

### 1.2 多波段 RGB 合成 (rgb)
- **用途**: 真彩色/假彩色卫星影像
- **波段选择**: `bands=[R, G, B]`，默认 `[0, 1, 2]`
- **百分位裁剪**: `countCut=[low, high]`，默认 `[2, 98]`，增强对比度
- **手动值域**: 传入 `rMinMax/gMinMax/bMinMax` 跳过 percentile 计算（避免大数据栈溢出）

### 1.3 归一化差异指数 (ndi)
- **用途**: NDVI、NDBI、NDWI 等双波段指数
- **波段选择**: `bands=[band1, band2]`
- **计算公式**: `(band1 - band2) / (band1 + band2)`
- **色带**: 同 raster 模式，支持自定义

---

## 2. 地理范围 (Extent)

### 2.1 自动检测
- 优先从 TIFF 元数据读取 bbox
- 支持墨卡托投影坐标自动转换为经纬度

### 2.2 手动指定
- `extent=[minLng, minLat, maxLng, maxLat]`
- 默认中国区域: `[73.48, 3.82, 135.11, 57.63]`

---

## 3. 遮罩 (Mask)

### 3.1 地理裁切
- **启用**: `mask={true}` + `maskData`
- **数据源**: GeoJSON URL 或对象
- **用途**: 将栅格限制在行政边界、研究区域内
- **实现**: L7 maskfence 机制

---

## 4. 视觉规范 (Visual Specifications)

### 4.1 透明度
- **默认 opacity**: 0.8
- **调整**: 适应底图叠加需求

### 4.2 色带配置
```ts
interface RampColors {
  type?: 'linear' | 'quantize' | 'custom';
  colors: string[];
  positions?: number[]; // 与 domain 对齐
}
```

### 4.3 WebGL 加速
- 基于 L7 RasterLayer 的 GPU 渲染
- 支持大规模栅格数据实时显示

---

## 5. 数据加载 (Data Loading)

### 5.1 异步解析
- 使用 `geotiff` 库解析 TIFF 文件
- 支持 ArrayBuffer 直接加载
- 错误处理: 加载失败时 console.error，不阻塞渲染

### 5.2 性能优化
- RGB 模式传入MinMax 避免 percentile 计算
- 遮罩数据独立加载，就绪后再创建图层
- 组件卸载时自动销毁 L7 图层

---

## 6. aimapui 默认实现

`TiffRasterLayer` 组件默认封装中已实现：

- 三种渲染模式（raster/rgb/ndi）
- 自动 TIFF 解析 + 地理范围检测
- 墨卡托坐标自动转换
- 自定义色带 + NoData 透明化
- 地理遮罩裁切
- WebGL 加速渲染
- 完整的错误处理与资源清理

```tsx
// 单波段伪彩色
<TiffRasterLayer
  url="https://example.com/ndvi.tif"
  renderMode="raster"
  domain={[0, 0.8]}
  rampColors={{ colors: ['#78350f', '#059669'], positions: [0, 0.8] }}
/>

// 多波段 RGB 合成
<TiffRasterLayer
  url="https://example.com/china.tif"
  renderMode="rgb"
  bands={[0, 1, 2]}
  mask
  maskData="https://example.com/china-boundary.json"
/>
```

---

*Derived from: Cartographic Precision System v1.2.0 | Raster & Remote Sensing Module*

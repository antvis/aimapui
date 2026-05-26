# 地图栅格数据可视化 (TIFF/Raster) 设计规范

本规范定义了地图上栅格图层（如 GeoTIFF, Cloud Optimized GeoTIFF）的视觉表现、波段映射与数据交互标准，旨在为科学遥感、气象分析及环境监测提供精确的地理影像表达。

---

## 1. 栅格渲染模式 (Rendering Modes)

栅格数据通过 WebGL 片元着色器进行实时重采样与像素级映射。

### 1.1 灰度图 (Single Band - Grayscale)
*   **适用场景**: 单一连续变量展示（如 DEM 数字高程、红外热感）。
*   **视觉表现**: 使用 `surface-container` 到 `on-surface` 的明度变化。
*   **插值算法**: 默认使用 `Bilinear` (双线性插值) 确保平滑度，分析模式可切换至 `Nearest` (最近邻) 以查看原始像素。

### 1.2 伪彩色映射 (Single Band - Pseudo Color)
*   **映射逻辑**: 将单波段数值通过 Scale 映射至预设色带。
*   **色带选择**: 
    *   **Terrain**: 用于地形（蓝-绿-黄-棕-白）。
    *   **Thermal**: 用于温度（蓝-紫-红-黄）。
    *   **NDVI**: 用于植被分析（棕-黄-绿-深绿）。

### 1.3 真彩色/多波段合成 (Multi-band - RGB/False Color)
*   **RGB 合成**: 分别指定 R/G/B 通道对应的波段索引。
*   **假彩色**: 使用红外或短波红外波段替换可见光通道，突出特定地物（如火灾监测、植被分类）。

---

## 2. 视觉增强与调整 (Visual Enhancements)

### 2.1 拉伸策略 (Stretch)
*   **Min-Max 拉伸**: 线性映射当前视口或全局数据的最小值与最大值。
*   **标准差拉伸 (Std Dev)**: 排除极端值干扰，增强图像对比度。

### 2.2 混合与透明度 (Blending)
*   **图层不透明度**: 默认 `opacity-80`，确保底图纹理可见。
*   **混合模式**: 默认 `normal`。地形晕渲建议使用 `multiply` 或 `overlay`。

---

## 3. 交互分析工具 (Analysis Tools)

### 3.1 像素拾取 (Pixel Inspector)
*   **悬停 (Hover)**: 鼠标处弹出 Tooltip，显示实时经纬度及各波段的原始像素值。
*   **测距与剖面**: 支持划定路径，实时生成该路径下的数值剖面图（Profile Chart）。

### 3.2 动态阈值过滤 (Threshold Filter)
*   **交互方式**: 双向滑块选择数值区间（如：仅展示海拔 2000m 以上的区域）。
*   **反馈**: 被过滤区域变为透明或置为特定颜色。

---

## 4. 性能与 LOD 策略

*   **瓦片化加载 (Tiled Raster)**: 大规模 TIFF 必须转换为栅格瓦片或 COG 格式。
*   **WebGL 加速**: 所有的拉伸、重分类、色带映射均在 GPU 端完成，确保毫秒级响应。

---

*Derived from: Cartographic Precision System v1.2.0 | CPS Raster Module v1.0.0*

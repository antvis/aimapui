# 卫星影像图层 (SatelliteLayer) 设计规范

本规范定义了卫星影像底图图层的视觉表现、数据源切换与叠加逻辑，适用于需要真实地表纹理的地图场景。

---

## 1. 数据源 (Providers)

### 1.1 支持的影像提供商
| 提供商 | 说明 | Token 要求 |
|--------|------|-----------|
| `gaode` | 高德卫星（默认） | 无需 |
| `tianditu` | 天地图卫星 | 需要（有内置默认值） |
| `google` | 谷歌卫星（代理） | 无需 |

### 1.2 瓦片规格
- **尺寸**: 256×256 px
- **缩放偏移**: zoomOffset=1（适配 L7 坐标系）
- **格式**: Raster Tile

---

## 2. 视觉规范 (Visual Specifications)

### 2.1 层级定位
- **默认 zIndex**: 0（最底层）
- **用途**: 作为矢量图层的底图纹理背景
- **叠加顺序**: 卫星影像 → 矢量图层 → 控件/标注

### 2.2 透明度控制
- **默认 opacity**: 1（完全不透明）
- **混合模式**: 可通过上层矢量图层的 blend 模式实现叠加效果
- **半透明用途**: 降低影像饱和度，突出矢量要素

### 2.3 可见性
- **默认 visible**: true
- **动态切换**: 支持运行时显隐，适合图层开关控件联动

---

## 3. 使用场景 (Use Cases)

### 3.1 纯卫星底图
```tsx
<AiMap map={{ basemap: 'map' }}>
  <SatelliteLayer provider="gaode" />
</AiMap>
```

### 3.2 卫星 + 矢量叠加
```tsx
<AiMap map={{ basemap: 'map' }}>
  <SatelliteLayer provider="gaode" opacity={0.7} />
  <PolygonLayer source={boundaries} color="#2563eb" style={{ opacity: 0.5 }} />
</AiMap>
```

### 3.3 多源切换
通过 LayerSwitchControl 或状态管理切换 provider。

---

## 4. aimapui 默认实现

`SatelliteLayer` 组件默认封装中已实现：

- 三种影像提供商切换（gaode/tianditu/google）
- 自动构建瓦片 URL 模板
- 天地图 token 内置默认值
- zIndex/opacity/visible 完整控制
- 基于 RasterLayer 的轻量封装

```tsx
<SatelliteLayer provider="gaode" opacity={0.8} />
```

---

*Derived from: Cartographic Precision System v1.2.0 | Satellite Imagery Module*

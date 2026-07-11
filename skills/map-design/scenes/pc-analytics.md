# PC 分析地图

适用于桌面端数据分析、决策支持、监控大屏等场景。强调信息密度、多图层叠加、精细交互。

## 布局模式

### 全屏分析台

```tsx
<div style={{ display: 'flex', height: '100vh' }}>
  {/* 左侧面板：数据筛选/列表 */}
  <aside style={{ width: 320, zIndex: 1000, background: 'var(--color-surface)' }}>
    {/* 搜索、过滤器、数据表格 */}
  </aside>

  {/* 主地图区 */}
  <main style={{ flex: 1, position: 'relative' }}>
    <AiMap map={{ basemap: 'gaode', style: 'dark' }} autoFit>
      {/* 图层 */}
    </AiMap>

    {/* 浮动统计卡片 */}
    <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
      {/* KPI 卡片 */}
    </div>
  </main>

  {/* 右侧详情面板（可选） */}
  <aside style={{ width: 360, zIndex: 1000 }}>
    {/* 选中要素详情、图表 */}
  </aside>
</div>
```

### 仪表盘嵌入

地图作为仪表盘的一个 widget，固定高度：

```tsx
<div style={{ height: 480, borderRadius: 12, overflow: 'hidden' }}>
  <AiMap map={{ ... }} style={{ height: '100%' }}>
    {/* 精简图层，减少控件 */}
    <ZoomControl position="bottomright" />
  </AiMap>
</div>
```

## 推荐图层组合

| 分析场景 | 推荐组件 | 说明 |
|---------|---------|------|
| 区域指标对比 | `FillLayer` + `LegendRamp` | colorScheme='sequential'，hoverEffect=true 查看数值 |
| 多点分布密度 | `HexagonLayer` / `H3Layer` | mode='3d' 增强视觉对比 |
| OD 流向分析 | `ArcFlowLayer` | animate=true，showNodes=true |
| 路径/轨迹回放 | `RouteLayer` | animate=true，stops 显示途经点 |
| 行政区划下钻 | `ChinaDistrict` | drillEnabled=true，绑定业务数据 |
| 大量 POI 探索 | `MarkerClusterLayer` | 自动聚合，点击展开 |
| 气象/环境叠加 | `FillLayer`(zIndex=-1) + `ImageLayer` | 底图覆盖层，不遮挡矢量数据 |

## 交互规范

### Hover 查看详情

分析地图中 hover 是主要探索方式：

```tsx
<FillLayer
  hoverEffect={true}
  onMouseMove={(payload) => {
    setTooltip({ visible: true, lng: payload.lng, lat: payload.lat, items: [...] });
  }}
  onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
/>
<Tooltip {...tooltip} />
```

### Click 选中 + 侧边联动

```tsx
<FillLayer
  clickEffect={true}
  onRegionClick={(payload) => {
    setSelectedRegion(payload.feature);
    // 同步更新侧边面板内容
  }}
/>
```

### Popup 结构化展示

```tsx
<Popup
  layout="card"
  header={{ title: feature.name }}
  attributes={[
    { label: 'GDP', value: `${feature.gdp}亿` },
    { label: '人口', value: `${feature.population}万` },
  ]}
  actions={[{ label: '查看详情', variant: 'primary', onClick: () => navigateToDetail(feature.id) }]}
/>
```

## 控件配置

| 控件 | 位置 | 分析地图建议 |
|------|------|-------------|
| `ZoomControl` | bottomright | ✅ 必选 |
| `ResetViewControl` | bottomright | ✅ 必选，方便重置到全局视图 |
| `MapThemeControl` | bottomleft | ✅ 推荐，暗色/亮色切换 |
| `ScaleControl` | bottomleft | ✅ 推荐 |
| `LayerSwitchControl` | bottomleft | ✅ 多图层时必选 |
| `LegendControl` | bottomleft | ✅ 有色阶/分类时必选 |
| `ExportImageControl` | topright | 可选，报告导出 |
| `FullscreenControl` | topright | 可选 |
| `DrawControl` | topleft | 仅编辑/标注场景 |

## 性能优化

- **大数据量点位**（>5000）：使用 `MarkerClusterLayer` 或 `HexagonLayer` 聚合
- **复杂 GeoJSON**：预处理简化几何体（mapshaper.org），减少顶点数
- **多图层叠加**：合理分配 zIndex，避免不必要的重绘
- **动态数据**：使用 `useMemo` 缓存 source 对象，避免每次渲染重建

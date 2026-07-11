# 旅游地图

适用于景区导览、城市探索、旅行规划等垂直场景。强调 POI 丰富度、路线串联、图文混排、沉浸式体验。

## 布局模式

### 景区导览地图

```tsx
<div style={{ position: 'relative', height: '100vh' }}>
  <AiMap map={{ basemap: 'gaode', center: [120.15, 30.28], zoom: 16, style: 'normal' }} autoFit>
    {/* 景区边界 */}
    <FillLayer source={parkBoundary} color="#e8f5e9" strokeColor="#4caf50" zIndex={0} />

    {/* 景点标注 */}
    <IconLayer
      source={attractions}
      iconField="category"
      iconMap={createMakiIconMap(['museum', 'park', 'restaurant', 'toilet', 'information'])}
      accuracy="precise"
      zIndex={7}
      onClick={(payload) => openAttractionDetail(payload.feature)}
    />

    {/* 游览路线 */}
    <RouteLayer
      path={tourRoute}
      routeType="walking"
      animate={true}
      showStops={true}
      stopLabelField="name"
      zIndex={3}
    />
  </AiMap>

  {/* 顶部搜索 */}
  <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 1000 }}>
    <SearchBar placeholder="搜索景点、餐厅、卫生间..." onSearch={handleSearch} />
  </div>

  {/* 底部景点详情面板 */}
  <BottomSheet snapPoints={['collapsed', 'half', 'expanded']} defaultSnap="collapsed">
    <div data-snap="collapsed">{selectedAttraction?.name}</div>
    <div data-snap="half">
      <img src={selectedAttraction?.coverUrl} style={{ width: '100%', borderRadius: 8 }} />
      <h3>{selectedAttraction?.name}</h3>
      <p>{selectedAttraction?.description}</p>
    </div>
    <div data-snap="expanded">
      {/* 完整介绍、开放时间、门票、评论 */}
    </div>
  </BottomSheet>
</div>
```

### 城市探索地图

多日行程规划，强调路线串联和分类筛选：

```tsx
<AiMap map={{ basemap: 'gaode', style: 'light' }} autoFit>
  {/* Day 1 路线 */}
  <RouteLayer path={day1Route} color="#2563eb" routeType="walking" showStops zIndex={3} />
  {/* Day 2 路线 */}
  <RouteLayer path={day2Route} color="#f59e0b" routeType="transit" showStops zIndex={3} />

  {/* 分类 POI */}
  <IconLayer source={allPOIs} iconField="type" iconMap={poiIconMap} accuracy="precise" zIndex={7} />
</AiMap>

{/* 图层切换：按天 / 按类型筛选 */}
<LayerSwitchControl
  position="bottomleft"
  layers={[
    { id: 'day1', label: 'Day 1', visible: true },
    { id: 'day2', label: 'Day 2', visible: false },
    { id: 'food', label: '美食', visible: true },
    { id: 'sight', label: '景点', visible: true },
  ]}
/>
```

## 推荐组件选型

| 旅游数据 | 推荐组件 | 关键配置 |
|---------|---------|---------|
| 景点/商户/设施 | `IconLayer` | `accuracy='precise'`，Maki 图标映射类别 |
| 游览路线 | `RouteLayer` | `routeType='walking'`，`showStops=true`，`animate=true` |
| 景区范围 | `FillLayer` | 浅色填充 + 绿色描边，zIndex=0 |
| 热力区域（人气） | `HexagonLayer` | `weightField='visitCount'`，colorScheme='sequential' |
| 大量同类 POI | `MarkerClusterLayer` | 避免图标重叠 |
| 卫星实景 | `SatelliteLayer` | `opacity=0.5`，辅助辨认地形 |
| 图例（景点分类） | `LegendCategories` / `LegendIcon` | 配合 MobileSheetLegend 移动端展示 |

## Maki 图标常用映射

旅游场景高频使用的 Maki 图标：

| 类别 | Maki 名称 | 用途 |
|------|----------|------|
| 景点 | `monument`, `museum`, `castle`, `temple` | 历史/文化地标 |
| 自然 | `park`, `mountain`, `water`, `campsite` | 自然景观 |
| 餐饮 | `restaurant`, `cafe`, `bar`, `fast-food` | 吃喝场所 |
| 住宿 | `lodging`, `hostel`, `camping` | 住宿设施 |
| 交通 | `bus`, `rail`, `ferry`, `airport` | 交通枢纽 |
| 服务 | `toilet`, `information`, `hospital`, `police` | 公共服务 |
| 购物 | `shop`, `marketplace`, `convenience` | 商业设施 |

```tsx
import { createMakiIconMap } from '@antv/aimapui';

const tourismIconMap = createMakiIconMap([
  'monument', 'museum', 'park', 'restaurant', 'cafe',
  'lodging', 'toilet', 'information', 'bus', 'shop',
]);
```

## 交互规范

### 景点点击 → BottomSheet 详情

旅游地图的核心交互是"点击景点看详情"：

```tsx
<IconLayer
  onClick={(payload) => {
    const feature = payload.feature;
    setSelectedAttraction(feature);
    setBottomSheetSnap('half'); // 自动拉起半屏面板
  }}
/>
```

### 路线站点联动

点击 RouteLayer 的站点，同步高亮对应景点并打开详情：

```tsx
<RouteLayer
  showStops={true}
  onNodeClick={(payload) => {
    const stopName = payload.feature.properties.name;
    const attraction = attractions.find(a => a.name === stopName);
    if (attraction) {
      setSelectedAttraction(attraction);
      setBottomSheetSnap('half');
      scene.flyTo({ center: [attraction.lng, attraction.lat], zoom: 17 });
    }
  }}
/>
```

### 分类筛选

通过 LayerSwitchControl 或自定义 Tab 切换 POI 类别，避免信息过载：

```tsx
// 桌面端
<LayerSwitchControl position="bottomleft" layers={layerItems} />

// 移动端：放入 MobileToolbar 或 BottomSheet 内
<MobileToolbar config={{ items: [
  { id: 'filter', icon: 'filter_list', label: '筛选', onClick: openFilterSheet },
] }} />
```

## 主题建议

| 场景 | 推荐底图风格 | 原因 |
|------|------------|------|
| 户外景区 | `normal` 或 `satellite` | 辨识地形地貌 |
| 城市漫步 | `light` | 干净背景突出 POI |
| 夜游/酒吧街 | `dark` | 氛围感，减少屏幕刺眼 |
| 历史文化 | `normal` | 标准配色，庄重感 |

## 性能优化

- **POI 数量 > 200**：必须使用 `MarkerClusterLayer` 或按需加载（视口内才渲染）
- **路线动画**：`animate=true` 会增加 GPU 负载，仅在用户主动触发时开启
- **封面图片**：BottomSheet 内的图片使用懒加载 + 缩略图（≤ 200px 宽）
- **图标缓存**：`createMakiIconMap` 在组件外调用一次，避免每次渲染重建

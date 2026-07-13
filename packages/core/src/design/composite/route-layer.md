# 路径地图图层 (RouteLayer) 设计规范

本规范定义了路径地图（路线规划/轨迹展示）的视觉表现、途经点序列化与交互逻辑，适用于导航、物流、旅行轨迹等场景。

---

## 1. 路径视觉 (Path Visuals)

### 1.1 线型基础
- **默认颜色**: `#2563eb` (Primary Blue)
- **线宽**: 4px（主路径），可通过 `lineWidth` 调整
- **透明度**: 0.9，确保底图可见但不干扰路径识别
- **线型**: 直线 (`line`) 或弧线 (`arc`)，通过 `routeType` 切换

### 1.2 分段着色 (Segment Coloring)
- **用途**: 路况（拥堵/畅通）、属性分类、时间分段
- **实现**: 每段独立颜色 + 独立线宽
- **优先级**: `segments` > `path`，分段数据覆盖单一路径

---

## 2. 途经点 (Stops / Waypoints)

### 2.1 序列化编号 (Numbered Stops)
- **自动编号**: 从起点开始递增，起点为 1
- **自动补全**: 若 stops 未覆盖 path 首尾，自动添加起点/终点
- **类型标识**: `start` / `waypoint` / `end`

### 2.2 视觉分级
| 类型 | 颜色 | 说明 |
|------|------|------|
| 起点 (start) | 跟随路径色或 `stopColor` | 旅程开始 |
| 途经点 (waypoint) | 跟随路径色或 `stopColor` | 中间站点 |
| 终点 (end) | `#10b981` (Success Green) | 旅程结束，语义区分 |

### 2.3 渲染模式 (Renderer)
支持三种途经点渲染方式：

#### Point 模式（默认）
- **圆形标记**: 直径 14px，2px 白色描边
- **序号标签**: 白色文字居中，字号为 stopSize × 0.75（最小 10px），深色描边 1.5px
- **名称标签**: 位于标记下方，偏移 `stopSize/2 + 4` px，2px 白色光晕

#### Marker 模式
- **组件**: 使用内置 `Marker` 组件
- **变体**: `circle` / `dot` / 其他 MarkerVariant
- **颜色映射**: start→success, end→error, waypoint→primary
- **自定义内容**: 支持传入 ReactNode

#### Icon 模式
- **图标资源**: 通过 `stopIconMap` 映射，或使用 Maki Pin 自动生成
- **尺寸**: 默认 16px，锚点 `bottom`
- **序号**: 作为 label 显示在图标上方
- **名称**: 位于图标下方，偏移量根据锚点动态计算

### 2.4 途经点交互
- **点击 Popup**: 显示名称 + 序号，紧凑尺寸，带关闭按钮
- **Hover 高亮**: 颜色切换为 `activeColor`（默认 `#fbbf24`）
- **可选关闭**: `showStopPopup={false}` 禁用弹窗

---

## 3. 交通路线查询 (Transport Route Query)

### 3.1 支持的出行方式
- `walking`: 步行
- `cycling`: 骑行
- `driving`: 驾车
- `transit`: 公交/地铁

### 3.2 查询接口
- **回调**: `onRouteQuery(params)` → 返回 `Promise<RouteQueryResult>`
- **参数**: `{ origin, destination, waypoints?, routeType }`
- **结果**: `{ path, segments?, stops? }`
- **版本控制**: 内部维护 queryVersion，防止过期请求覆盖新结果

### 3.3 直线路径 (Straight)
- **默认模式**: `routeType='straight'`
- **无需查询**: 直接使用传入的 `path` 或 `segments`
- **适用**: 已规划好的轨迹、自定义路线

---

## 4. 交互行为 (Interaction)

### 4.1 路径交互
- **Hover**: 颜色切换为 `activeColor`
- **Click**: 触发 `onPathClick` 回调

### 4.2 途经点交互
- **Click**: 触发 `onStopClick` + 内置 Popup
- **Hover**: 同路径高亮色

---

## 5. aimapui 默认实现

`RouteLayer` 组件默认封装中已实现：

- 三种途经点渲染模式（point/marker/icon）
- 自动编号 + 起终点自动补全
- 分段着色支持
- 交通路线查询回调接口
- 内置 Popup（点击途经点）
- Hover 高亮反馈

```tsx
<RouteLayer
  path={[[120.15, 30.28], [120.17, 30.25]]}
  stops={[
    { lng: 120.15, lat: 30.28, name: '西湖' },
    { lng: 120.17, lat: 30.25, name: '灵隐寺' },
  ]}
  stopRenderer="point"
/>
```

---

*Derived from: Cartographic Precision System v1.2.0 | Route & Navigation Module*

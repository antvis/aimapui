# 台风路径地图（TyphoonMap）— 技术文档

> 本文档供 AI Agent 阅读，目标：根据本文档可完全还原 TyphoonMap 组件的全部功能，无需查看源码。

---

## 一、项目概览

### 1.1 功能列表

| 编号 | 功能 | 描述 |
|------|------|------|
| F01 | 台风列表加载 | 拉取当年所有台风列表，标注活跃台风 |
| F02 | 台风详情加载 | 选中台风后加载其完整路径点数据 |
| F03 | 历史轨迹 | 按台风等级分段着色显示历史路径（实线） |
| F04 | 路径节点 | 路径上的每个观测点以小圆点标注，hover 显示 Tooltip，click 弹出 Popup |
| F05 | 台风眼动画 | 当前台风中心显示旋转 GIF 动画 |
| F06 | 风圈 | 显示 7/10/12 级四象限风圈（填充 + 描边 + 文字标注）|
| F07 | 预报路径 | 多家机构（中国/日本/美国/中国台湾/中国香港）预报路径同图显示 |
| F08 | 机构切换 | 选中某机构高亮其预报路径，其余机构半透明虚线 |
| F09 | 预报日期标注 | 中国机构预报路径上每天标一个日期（MM/DD）|
| F10 | 警戒线 | 显示 24/48 小时台风警戒线（固定坐标虚线 + 文字标注）|
| F11 | 登陆点标注 | 显示台风登陆点图标 |
| F12 | 气象图层 | 支持云图/雷达/降雨/卫星底图四种叠加层切换 |
| F13 | 图层透明度 | 气象图层透明度滑块调节 |
| F14 | 云图时段 | 云图支持 30min/1h/3h/6h 四档切换 |
| F15 | 降雨时段 | 降雨支持 24h/48h/72h 三档切换 |
| F16 | 台风信息卡 | PC 端显示当前台风基本信息卡片 |
| F17 | 台风列表选择器 | 可展开/收起的台风列表，点击切换台风 |
| F18 | 点位详情表 | 选中台风后可展开所有路径点的时间/强度/风速/气压表格 |
| F19 | 图例面板 | 可折叠图例：风圈开关、登陆点、预报台、台风等级、风圈等级、警戒线、降雨等级、雷达反射率 |
| F20 | 历史点选择 | 点击路径节点可选中历史点，风圈会随之变化，底部显示历史点提示条 |
| F21 | 地图自适应 | 切换台风时自动 fitBounds 到台风路径范围 |
| F22 | 移动端适配 | 支持 mobilePreview prop + useResponsive() 响应式断点 |
| F23 | 错误兜底 | API 失败时使用内置样本数据，顶部显示"使用内置样本"标签 |

### 1.2 数据源

- **台风数据**: 浙江水利台风实时发布系统 `https://typhoon.slt.zj.gov.cn/Api/`
  - `API_ACTIVITY`: 获取活跃台风列表
  - `API_LIST(year)`: 获取某年全部台风列表
  - `API_INFO(tfid)`: 获取单个台风详细路径数据（含预报）
- **气象数据**: 同域 API
  - `API_LEASTCLOUD(type)`: 云图（0.5h/1h/3h/6h）
  - `API_LASTRADAR`: 雷达拼图
  - `API_LEASTRAIN(hours)`: 降雨等值线（24h/48h/72h）
  - `API_LASTWIND`: GRIB2 风场数据

### 1.3 技术栈

- React 18+ (functional components + hooks)
- `@antv/aimapui`: AiMap, LineLayer, PointLayer, FillLayer, ImageLayer, Marker, Tooltip, Popup, SatelliteLayer, ZoomControl, MapThemeControl, LegendCategories, useResponsive
- `@antv/l7`: 底层地图引擎 Scene 类型
- 高德底图 (basemap: 'gaode')

---

## 二、文件结构

```
packages/site/src/app/typhoon/
├── index.ts                  # 统一导出入口
├── constants.ts              # 所有常量、配色、API URL、兜底数据
├── types.ts                  # 所有 TS 接口定义
├── api.ts                    # 气象 API 获取函数
├── transform.ts              # 数据转换工具函数
├── TyphoonEye.tsx            # 台风眼动画组件（未使用，保留备用）
├── Info.tsx                  # 信息行列组件
├── TyphoonMap.tsx            # 主组件（组装 hooks + 子组件）
├── TyphoonMapLayers.tsx      # 地图内所有图层的子组件
├── TyphoonInfoCard.tsx       # 台风信息卡 + 列表选择器
├── WeatherToolbar.tsx        # 气象图层工具条
├── LegendPanel.tsx           # 图例面板
└── hooks/
    ├── useTyphoonData.ts     # 台风数据获取 + 派生计算
    ├── useWeatherData.ts     # 气象图层状态管理
    └── useTyphoonPopup.ts    # Popup/Tooltip 交互处理
```

---

## 三、常量 (`constants.ts`)

### 3.1 API 端点

```typescript
const API_BASE = 'https://typhoon.slt.zj.gov.cn/Api'
function API_LIST(year: number): string       // → /TyphoonList/{year}
function API_INFO(tfid: string): string       // → /TyphoonInfo/{tfid}
API_ACTIVITY: string                          // → /TyhoonActivity
function API_LEASTCLOUD(type: number): string // → /LeastCloud?type={type}
API_LASTRADAR: string                         // → /LastRadar
function API_LEASTRAIN(hours: number): string // → /LeastRain/{hours}
API_LASTWIND: string                          // → /LastWind
```

### 3.2 台风等级系统

```typescript
// 等级 Key（由弱到强排序）
type GradeKey = 'TD' | 'TS' | 'STS' | 'TY' | 'STY' | 'SuperTY'

// 中文名称 → Key 映射
STRENGTH_TO_KEY = {
  '热带低压': 'TD',
  '热带风暴': 'TS',
  '强热带风暴': 'STS',
  '台风': 'TY',
  '强台风': 'STY',
  '超强台风': 'SuperTY',
}

// Key → 颜色（渐进：蓝 → 紫 → 橙 → 红）
GRADE_COLOR = { TD:'#7dd3fc', TS:'#38bdf8', STS:'#3b82f6', TY:'#8b5cf6', STY:'#f59e0b', SuperTY:'#ef4444' }

// 用于 LineLayer/PointLayer 的数组形式
GRADE_ORDER = ['TD','TS','STS','TY','STY','SuperTY']
GRADE_LABELS = ['热带低压','热带风暴','强热带风暴','台风','强台风','超强台风']
GRADE_COLORS = ['#7dd3fc','#38bdf8','#3b82f6','#8b5cf6','#f59e0b','#ef4444']
```

### 3.3 风圈配色

```typescript
WIND_LEVEL_KEY = ['7', '10', '12']                        // 3个等级
WIND_LEVEL_COLOR = { '7':'#3b82f6', '10':'#f59e0b', '12':'#ef4444' }
```

### 3.4 预报机构配色

```typescript
AGENCIES = ['中国', '中国台湾', '日本', '中国香港', '美国']
AGENCY_COLOR = {
  中国:'#22d3ee', 中国台湾:'#34d399', 日本:'#f472b6', 中国香港:'#fbbf24', 美国:'#a78bfa'
}
```

### 3.5 警戒线

```typescript
// 格式 [lng, lat]，GeoJSON 标准（经度在前）
WARNING_LINE_24H = [[127,34],[127,22],[119,18],[119,11],[113,4.5],[105,0]]
WARNING_LINE_48H = [[132,34],[132,15],[120,0],[105,0]]
WARNING_LINE_COLORS = { '24h':'#f59e0b', '48h':'#ef4444' }
```

### 3.6 降雨等级

```typescript
RAIN_LEVEL_LABEL = { '0':'小雨','2.5':'小雨','5':'小雨','10':'中雨','25':'大雨','50':'暴雨','100':'大暴雨','250':'特大暴雨' }

function getRainLevelLabel(symbol: string): string
// num >= 250 → '特大暴雨', >= 100 → '大暴雨', >= 50 → '暴雨', >= 25 → '大雨', >= 10 → '中雨' else '小雨'
```

### 3.7 UI 颜色常量

```typescript
const C = {
  bg: '#0f172a',                    // 背景色
  panel: 'rgba(15,23,42,0.82)',     // 面板背景（半透明）
  border: 'rgba(56,189,248,0.15)',  // 面板边框
  fg: '#e2e8f0',                    // 前景文字
  muted: 'rgba(148,163,184,0.7)',   // 次要文字
  accent: '#22d3ee',                // 强调色（青色）
}
```

### 3.8 雷达瓦片常量

```typescript
// 单张大图模式边界 [westLng, southLat, eastLng, northLat]
RADAR_FULL_EXTENT = [69.85, 12.17, 140.09, 54.33]

// 四象限 tile→extent 映射 (NW, SW, NE, SE)
RADAR_TILES = [
  { key:'radar0_0', extent:[67.5, 36.58, 104.07, 55.77] },
  { key:'radar0_1', extent:[67.5, 11.17, 104.07, 36.58] },
  { key:'radar1_0', extent:[104.07, 36.58, 140.62, 55.77] },
  { key:'radar1_1', extent:[104.07, 11.17, 140.62, 36.58] },
]
```

### 3.9 兜底数据

```typescript
CURRENT_YEAR = new Date().getFullYear()
FALLBACK_INFO   // TyphoonInfo — 台风"巴威"的完整模拟数据（6个路径点+3家机构预报）
FALLBACK_LIST   // TyphoonListItem[] — 只含"巴威"一项
```

---

## 四、类型定义 (`types.ts`)

```typescript
// ── API 原始数据 ──
interface TyphoonPoint {
  time: string          // "2026-07-10 08:00:00"
  lng: string           // 经度，字符串格式
  lat: string           // 纬度，字符串格式
  strong: string        // 强度中文名："台风"/"超强台风"等
  power: string         // 风力等级："14"
  speed: string         // 风速 m/s："42"
  pressure: string      // 中心气压 hPa："955"
  movespeed?: string    // 移速 km/h
  movedirection?: string // 移向："西北"
  radius7?: string      // 7级风圈四象限半径："500|500|450|480"
  radius10?: string     // 10级风圈
  radius12?: string     // 12级风圈
  forecast?: ForecastAgency[]  // 内嵌预报（仅在最新点存在）
}

interface ForecastAgency {
  tm: string            // 机构名："中国"/"日本"/"美国"等
  forecastpoints: TyphoonPoint[]  // 预报路径点
}

interface LandPoint {
  landaddress: string
  landtime: string
  lng: string; lat: string
  info: string
  strong: string | null
}

interface TyphoonInfo {
  tfid: string          // 台风编号 "202609"
  name: string          // 中文名 "巴威"
  enname: string        // 英文名 "BAVI"
  isactive?: string     // "1"=活跃
  starttime?: string
  endtime?: string
  warnlevel?: string
  centerlng?: string
  centerlat?: string
  points: TyphoonPoint[] // 完整路径点数组
  land?: LandPoint[]
}

interface TyphoonListItem {
  tfid: string
  name: string; enname: string
  starttime: string; endtime: string
  isactive: string      // "1"=活跃
  warnlevel?: string
}

// ── 派生数据形状 ──
interface TrackSegment {
  path: [number, number][]  // 单个线段（通常只有2点）
  grade: GradeKey           // 用于 LineLayer colorField 映射
}
// 注意：LineLayer 使用 sourceConfig.coordinates='path'，故字段名必须为 path

interface TrackNode {
  lng: number; lat: number; grade: GradeKey
  time: string; strong: string; power: string; speed: string; pressure: string
  index: number  // 在原始 points 数组中的索引
}

interface WindPolygon {
  coordinates: [number, number][][]  // GeoJSON Polygon 坐标（单环）
  level: string                      // '7'/'10'/'12'
}

// ── 气象数据 ──
interface CloudData {
  img: string        // data:image/png;base64,...
  time: string       // "2026-07-11 08:00:00"
  extent: [number, number, number, number]  // [minLng, minLat, maxLng, maxLat]
}

interface RadarTileData {
  img: string
  extent: [number, number, number, number]
}

interface RadarData {
  tiles: RadarTileData[]
  time: string
}

interface RainFeature {
  type: 'Feature'
  properties: { color: string; symbol: string }  // color=hex色值, symbol=降水量阈值
  geometry: { type: 'Polygon'; coordinates: [number, number][][] }
}

interface RainData {
  features: RainFeature[]
  colors: string[]    // 去重后的色值列表（用于 FillLayer colorValues）
  time: string
  colorToSymbol: Record<string, string>
}

interface WindData {
  imageUrl: string    // RGBA PNG，R=U分量, G=V分量
  time: string
  extent: [number, number, number, number]
  uMin: number; uMax: number
  vMin: number; vMax: number
}

// ── UI 状态 ──
interface PopupData {
  lng: number; lat: number
  title: string; statusLabel: string; statusColor: string
  attrs: PopupAttribute[]  // 来自 @antv/aimapui
}

interface TooltipState {
  visible: boolean
  lng: number; lat: number
  time: string; strong: string; power: string; speed: string; pressure: string
}

interface RainTooltipState {
  visible: boolean
  lng: number; lat: number
  symbol: string  // 降水量阈值
  color: string   // hex色值
}
```

---

## 五、数据转换 (`transform.ts`)

### 5.1 `parseRadii(s: string | undefined | null): [number, number, number, number]`

解析四象限半径字符串 `"NE|SE|SW|NW"` → `[ne, se, sw, nw]`（单位 km）。
空串或无效值 → 0。

### 5.2 `pointGrade(p: TyphoonPoint): GradeKey`

`STRENGTH_TO_KEY[p.strong] ?? 'TS'` — 将台风强度映射到等级 Key。

### 5.3 `toTrackSegments(points: TyphoonPoint[]): TrackSegment[]`

遍历 points 相邻两点，生成 TrackSegment 数组。跳过 NaN 坐标。
每个 segment 的 grade 取终点（b）的等级。

### 5.4 `toNodes(points: TyphoonPoint[]): TrackNode[]`

将每个 TyphoonPoint 转为 TrackNode，保留原始索引。跳过 NaN 坐标。

### 5.5 `destinationPoint(lng, lat, distanceKm, bearingDeg): [lng, lat]`

球面几何计算：从起点沿指定方位角走 distanceKm 到达目标点。
使用地球半径 6371km，Haversine 公式的逆运算。

### 5.6 `toWindPolygons(p: TyphoonPoint | undefined): WindPolygon[]`

为指定点生成 3 个风圈多边形（7/10/12 级）。
每个风圈：分别取对应 level 的四个象限半径，用 `destinationPoint` 生成弧线段（12 步/象限），拼接成完整外环并闭合。

### 5.7 `toForecastSegments(agency: ForecastAgency | undefined): TrackSegment[]`

同 `toTrackSegments`，但处理 ForecastAgency 的 `forecastpoints`。

---

## 六、数据获取 API (`api.ts`)

### 6.1 `fetchCloud(type: 0.5|1|3|6): Promise<CloudData | null>`

- GET `API_LEASTCLOUD(type)`
- 从响应中取 `cloud{typeKey}h` 作为 base64 图片，`timeStr{typeKey}h` 为时间
- 取 `minLng/minLat/maxLng/maxLat` 作为 extent
- 异常/缺数据 → null

### 6.2 `fetchRadar(): Promise<RadarData | null>`

- GET `API_LASTRADAR`
- `radarType === '2'` → 单张大图，extent 用 `RADAR_FULL_EXTENT`
- 否则遍历 `RADAR_TILES` 四个象限分别取图
- 异常/缺数据 → null

### 6.3 `fetchRain(hours: 24|48|72): Promise<RainData | null>`

- GET `API_LEASTRAIN(hours)`
- 解析 `contours`（双重 JSON 编码）
- 每个等高线 { color, latAndLong, symbol } → 转换 latAndLong 中 `[lat,lng]` 为 `[lng,lat]`
- 过滤 NaN 坐标，闭合多边形环
- 将 RGBA 颜色转换为 hex
- 返回 `{ features, colors, time, colorToSymbol }`

### 6.4 `fetchWind(): Promise<WindData | null>`

- GET `API_LASTWIND`
- 解析 `windData`（GRIB2 JSON 数组：[U分量, V分量]）
- 用 `windDataToImage()` 将 U/V 数值编码为 RGBA PNG（R=U, G=V, B=0, A=255 — 归一化到 0-255）
- 返回 `{ imageUrl, time, extent }` + 固定 uMin/uMax/vMin/vMax

---

## 七、Hook 详解

### 7.1 `useTyphoonData()` → `TyphoonDataState`

**核心状态管理**：

| 状态 | 类型 | 说明 |
|------|------|------|
| list | TyphoonListItem[] | 台风列表 |
| activeIds | string[] | 活跃台风 tfid 数组 |
| tfid | string | 当前选中的台风编号 |
| info | TyphoonInfo \| null | 当前台风详情 |
| loading | boolean | 列表加载中 |
| error | boolean | API 失败标记 |
| selectedAgency | string | 选中的预报机构 |
| selectedPointIdx | number | 选中的路径点索引（-1=最新点） |
| pointsDetailExpanded | boolean | 点位详情表格是否展开 |
| sceneRef | RefObject&lt;Scene&gt; | L7 Scene 引用 |

**数据获取流程**：

1. **mount 时**：fetch `API_ACTIVITY` → 获取活跃台风 IDs；fetch `API_LIST(CURRENT_YEAR)` → 获取当年全部台风。选台风逻辑：优先选中活跃台风，否则按 `starttime` 最新排序。API 失败 → 使用 `FALLBACK_LIST` / `FALLBACK_INFO`，`error=true`。

2. **tfid 变化时**：fetch `API_INFO(tfid)` → 解析 TyphoonInfo。失败 → 使用 `FALLBACK_INFO`。

3. **trackSegments 变化时**：调用 `scene.fitBounds()` 将地图缩放至台风路径范围（padding=80，经纬度 padding=4）。

**派生数据（useMemo）**：

| 字段 | 派生逻辑 |
|------|----------|
| points | `info?.points ?? []` |
| trackSegments | `toTrackSegments(points)` |
| nodes | `toNodes(points)` |
| currentIdx | `points.length - 1` |
| selectedIdx | `selectedPointIdx >= 0 && < points.length ? selectedPointIdx : currentIdx` |
| selectedPoint | `points[selectedIdx]` |
| currentPoint | `points[currentIdx]` |
| windPolygons | `toWindPolygons(selectedPoint)` |
| forecastSrc | `selectedPoint?.forecast ?? currentPoint?.forecast ?? []` |
| presentAgencies | `Set(forecastSrc.map(f => f.tm))` |
| activeForecastSegs | selectedAgency 对应的机构预报段 |
| otherForecastSegs | 非 selectedAgency 的机构预报段 |
| forecastPoints | 所有预报路径点（lng/lat 已转 number） |
| landMarks | `info?.land` 中有效坐标的登陆点 |

### 7.2 `useWeatherData()` → `WeatherDataState`

**状态**：

| 状态 | 类型 | 默认值 |
|------|------|--------|
| weatherLayer | 'none'\|'cloud'\|'radar'\|'rain'\|'satellite' | 'none' |
| weatherOpacity | number | 0.7 |
| cloudType | 0.5\|1\|3\|6 | 1 |
| rainHours | 24\|48\|72 | 24 |
| cloud | CloudData\|null | null |
| radar | RadarData\|null | null |
| rain | RainData\|null | null |
| satellite | boolean | false |
| satProvider | 'gaode'\|'tianditu'\|'google' | 'gaode' |
| satOpacity | number | 0.8 |
| rainTooltip | RainTooltipState | {visible:false,...} |

**行为**：

- `weatherLayer` 切换且对应数据为 null 时 → 自动 fetch
- `cloudType` 变化且当前在 cloud 模式 → 清空 cloud 数据（触发重新 fetch）
- `rainHours` 变化同理
- `handleRainTooltipMove`: 从 LayerEventPayload.feature 提取 symbol/color
- `handleRainTooltipLeave`: 设置 visible=false

### 7.3 `useTyphoonPopup(deps)` → `TyphoonPopupState`

**参数**: `{ info: TyphoonInfo | null, selectedAgency: string }`

**状态**:

| 状态 | 说明 |
|------|------|
| popup | PopupData \| null（点击节点/预报线时设置） |
| tooltip | TooltipState（hover 节点时更新） |

**事件处理器**：

1. **handleNodeHover**: 从 LayerEventPayload.feature 提取 time/strong/power/speed/pressure → 更新 tooltip

2. **handleNodeLeave**: tooltip.visible = false

3. **handleNodeClick**: 从 feature 提取完整路径点信息 → 构建 PopupData（含时间、位置、风速风力、气压、移速移向、7/10/12级风圈半径）

4. **handleForecastClick**: 弹出该机构预报路径 Popup（机构名、路径类型、坐标）

5. **handleForecastPointHover/Leave**: 类似 node hover

6. **handleForecastPointClick**: 弹出预报点 Popup（机构、时间、位置、风速、强度、气压）

---

## 八、主组件 (`TyphoonMap.tsx`)

### 8.1 Props

```typescript
interface TyphoonMapProps {
  mobilePreview?: boolean  // 强制移动端模式（BlockPage 中使用）
}
// 默认值: {}
```

### 8.2 状态架构

```
TyphoonMap
├── useTyphoonData()        → 台风数据 + 派生计算
├── useWeatherData()        → 气象图层 + 降雨 tooltip
├── useTyphoonPopup(deps)   → 节点/预报交互
├── [listExpanded]          → 本地状态: 列表展开
├── [legendExpanded]        → 本地状态: 图例展开
└── [showWindCircles]       → 本地状态: 风圈开关
```

### 8.3 派生计算

```typescript
eyeColor = GRADE_COLOR[pointGrade(currentPoint)] ?? C.accent
eyeLng = Number(currentPoint.lng)
eyeLat = Number(currentPoint.lat)
selectedWind = { strong, power, lng, lat, time } | null
```

### 8.4 事件粘合

```typescript
handleNodeClick = (payload) => {
  // 更新 selectedPointIdx (影响风圈、预报数据)
  typhoon.setSelectedPointIdx(payload.feature.index)
  // 同时弹出 Popup
  popup.handleNodeClick(payload)
}

handleSelectTfid = (id) => {
  typhoon.setTfid(id)
  typhoon.setPointsDetailExpanded(false)
}
```

### 8.5 JSX 结构

```
<div data-theme="dark">  ← 根容器，暗色主题
  <style> keyframes typhoon-eye-rot </style>

  <AiMap basemap="gaode" center=[127.6,20.8] zoom=4 pitch=12 style={satellite?'light':'dark'}>
    <TyphoonMapLayers />  ← 全部图层
    <ZoomControl position="bottomleft" showZoom />
    <MapThemeControl position="bottomleft" defaultValue="dark" />
  </AiMap>

  // ── 顶部导航条（绝对定位）
  <div poison:absolute top=0 left=0> cyclone 图标 + "台风路径图" + 年份 + 错误标记 </div>

  // ── 台风信息卡（绝对定位）
  <TyphoonInfoCard />

  // ── 气象工具条（绝对定位）
  <WeatherToolbar />

  // ── 图例面板 + 历史点提示 + 数据来源（绝对定位）
  <LegendPanel />
  <历史点提示条 />  ← 内联渲染
  <数据来源文字 />
</div>
```

---

## 九、UI 子组件详解

### 9.1 `TyphoonInfoCard`

**Props**:

| Prop | 类型 | 说明 |
|------|------|------|
| info | TyphoonInfo\|null | |
| currentPoint | TyphoonPoint\|undefined | |
| list | TyphoonListItem[] | |
| activeIds | string[] | |
| tfid | string | 当前选中 |
| points | TyphoonPoint[] | |
| loading | boolean | |
| listExpanded | boolean | |
| pointsDetailExpanded | boolean | |
| isMobile | boolean | |
| onToggleListExpanded | () => void | |
| onTogglePointsDetail | () => void | |
| onSelectTfid | (tfid) => void | |

**渲染逻辑**：

1. **PC 端（!isMobile）且 currentPoint 存在**：显示台风信息卡片
   - 台风眼图标 + 名称/编号 + 活跃标签
   - 强度徽章（等级色背景）+ 风力风速
   - 6 列网格：经度、纬度、中心气压、移速、移向、时间

2. **台风列表选择器**：
   - **移动端 + 未展开**：显示圆形列表按钮（36×36）
   - **其他情况**：显示完整列表面板
     - 标题行：可折叠的"台风列表（N）"
     - 列表项：绿点（活跃）/灰点 + 名称 + 编号后三位
     - 选中项高亮（青色背景），点击选中项 → 切换点位详情展开
     - 未展开时只显示 3 项，底部有"展开全部（N）"
   - 选中台风 + pointsDetailExpanded 时：显示点位详情表格
     - 4 列：时间、强度（着色）、风速、气压
     - 表格按时间倒序排列

### 9.2 `LegendPanel`

**Props**:

| Prop | 说明 |
|------|------|
| showWindCircles | 风圈开关状态 |
| legendExpanded | 图例展开状态 |
| landMarks | 登陆点数组 |
| isMobile | |
| onToggleLegend | 切换展开 |
| onToggleWindCircles | 切换风圈 |

**渲染内容**（仅展开时显示）：

1. 风圈开关 checkbox
2. 登陆点图标 + 文字（仅当 landMarks.length > 0）
3. 预报台：5 个机构 × 颜色虚线
4. 台风等级：`<LegendCategories />` 组件
5. 风圈等级：3 个圆形图标 × 文字
6. 警戒线：24h 橙色虚线 / 48h 红色虚线
7. 降雨等级：6 种颜色块 2×3 网格
8. 雷达反射率：12 色渐变色条 + 10/70 标注

**移动端**：图例从右侧滑出（transform: translateX），切换 chevron 方向。

### 9.3 `WeatherToolbar`

**Props**：

| Prop | 说明 |
|------|------|
| weatherLayer, weatherOpacity, cloudType, rainHours | 当前值 |
| cloudTime?, radarTime?, rainTime? | 数据时间 |
| isMobile | |
| onSetWeatherLayer, onSetWeatherOpacity, ... | setter 回调 |

**渲染**：

1. 图层切换按钮组：无/云图/雷达/降雨/卫星，5 个按钮并排
2. 选中 `satellite` → 同时 `onSetSatellite(true)`；选其他 → `onSetSatellite(false)`
3. 下方子面板（仅当 weatherLayer !== 'none'）：
   - cloud 模式：30m/1h/3h/6h 四档按钮
   - rain 模式：24h/48h/72h 三档按钮
   - 非 satellite 模式：透明度滑块（range input 0-1）
   - 显示数据时间

### 9.4 `TyphoonMapLayers`

这是最复杂的子组件，接收所有数据并通过 props 控制（无内部状态）。

**图层顺序（zIndex 从低到高）**：

| zIndex | 图层 | 组件 |
|--------|------|------|
| -2 | 卫星底图 | `<SatelliteLayer>` |
| -1 | 云图/雷达/降雨覆盖 | `<ImageLayer>` / `<FillLayer>` |
| 0 | 风圈填充（opacity=0.25） | `<FillLayer>` |
| 1 | 历史轨迹段 + 其他机构预报 | `<LineLayer>` |
| 2 | 风圈描边（opacity=0.8）+ 选中机构预报 | `<LineLayer>` |
| 3 | 警戒线 | `<LineLayer>` |
| 4 | 警戒线文字标注 | `<PointLayer shapeValues="text">` |
| 5 | 风圈文字标注 | `<PointLayer shapeValues="text">` |
| 6 | 路径节点 | `<PointLayer shape="circle">` |
| 7 | 预报路径点位 | `<PointLayer shape="circle">` |
| 8 | 预报日期标注（MM/DD） | `<PointLayer shapeValues="text">` |
| — | 台风眼 Marker | `<Marker>` |
| — | 登陆点 Marker | `<Marker>` |
| — | 节点 Tooltip | `<Tooltip variant="dark">` |
| — | 降雨 Tooltip | `<Tooltip variant="dark">` |
| — | 点击 Popup | `<Popup size="standard" singleton>` |

**交互**：

- 路径节点 (zIndex=6)：`onMouseMove → onNodeHover`, `onMouseLeave → onNodeLeave`, `onClick → onNodeClick`
- 预报路径点 (zIndex=7)：`onMouseMove → onForecastPointHover`, `onMouseLeave → onForecastPointLeave`, `onClick → onForecastPointClick`
- 其他机构预报线 (zIndex=1)：`onClick → onForecastClick`
- 选中机构预报线 (zIndex=2)：`onClick → onForecastClick`
- 降雨 FillLayer (zIndex=-1)：`onMouseMove → onRainTooltipMove`, `onMouseLeave → onRainTooltipLeave`
- 历史轨迹段：无交互
- Popup：`onClose → onPopupClose`

**预报日期标注（内联 IIFE）**：

- 取 `forecastSrc` 中机构名为"中国"的预报点
- 按日期去重（每天只取第一个点）
- 格式化为 MM/DD 作为文字标注

**Lookup 注意**：

- LineLayer 使用 `sourceConfig={{ coordinates: 'path' }}`（字段名为 `path` 不是 `coordinates`）
- PointLayer 使用 `sourceConfig={{ x: 'lng', y: 'lat' }}`
- GeoJSON 坐标格式为 `[lng, lat]`（经度在前）

---

## 十、完整数据流图

```
┌─────────────────┐
│   TyphoonMap    │ 主组件
├─────────────────┤
│ isMobile (prop  │← useResponsive()
│  + responsive)  │
│                 │
│ listExpanded ───┤ local state
│ legendExpanded──┤ local state
│ showWindCircles─┤ local state
│                 │
│ ┌─────────────┐ │
│ │useTyphoonData│ │→ fetch API_ACTIVITY + API_LIST → list, activeIds, tfid
│ │             │ │→ fetch API_INFO(tfid) → info
│ │             │ │→ useMemo: trackSegments, nodes, windPolygons, forecast*
│ │             │ │→ fitBounds on tfid change
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │useWeatherData│ │→ fetchCloud/Radar/Rain on layer change
│ │             │ │→ rainTooltip state + handlers
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │usePopup      │ │→ popup, tooltip state
│ │             │ │→ nodeHover/Click, forecastHover/Click handlers
│ └─────────────┘ │
└────────┬────────┘
         │ props
         ▼
┌─────────────────────────────────────────────────┐
│               子组件                             │
├──────────────┬──────────────┬───────────────────┤
│TyphoonMap    │TyphoonInfo   │WeatherToolbar     │
│Layers        │Card          │+ LegendPanel      │
│(AiMap children)(台风卡片+列表)│(气象控制+图例)    │
└──────────────┴──────────────┴───────────────────┘
```

---

## 十一、入口与注册 (`main.tsx`)

```typescript
// import
import TyphoonMap from './app/typhoon';

// 注册（devices 配置）
{
  name: 'TyphoonMap',
  icon: 'cyclone',
  component: TyphoonMap,
  group: 'App Templates',
  file: 'app/typhoon/TyphoonMap',
  device: 'both',  // 支持桌面端和移动端
}

// 源码展示 glob 需包含
'./{engine,control,marker,layer,composite,app,app/typhoon,app/typhoon/hooks}/*.tsx'

// 渲染时：
// device='mobile' → 390×844 手机框内渲染
// device='desktop'/'both' → 全屏渲染
// BlockPage 中 mobile preview 传入 mobilePreview prop
```

---

## 十二、移动端适配规则

| 场景 | 桌面端 | 移动端 |
|------|--------|--------|
| 顶部导航条 | width=264, padding=12×16 | width=100%, padding=8×12 |
| 图标字号 | 22 | 18 |
| 标题字号 | 17 | 14 |
| 显示年份 | 是 | 否 |
| 台风信息卡 | 显示（width=240, top=82） | 隐藏 |
| 列表选择器 | 始终展开 | 初始为圆形按钮（36×36），点击展开 |
| 图例面板 | 右上角，垂直折叠 | 右侧滑入，水平折叠 |
| 气象工具条 | 右上角 | 居中横排 |
| 历史点提示 | 右下角 | 右下角 |

---

## 十三、CSS 动画

1. **台风眼旋转**: `@keyframes typhoon-eye-rot { to { transform: rotate(360deg) } }`，4s linear infinite
2. **台风眼双环动画** (TyphoonEye.tsx): `@keyframes typhoon-rot` — 外环 6s 顺时针，内环 4s 逆时针
3. **图例折叠过渡**: `transition: max-height 0.3s`（桌面） / `transition: transform 0.3s ease`（移动）

---

## 十四、关键边界情况处理

1. **API 全部失败**: 使用 `FALLBACK_LIST` + `FALLBACK_INFO`（台风"巴威"），`error=true`，顶部显示"使用内置样本"标签
2. **坐标 NaN**: `toTrackSegments`/`toNodes`/`fetchRain` 中均有 `Number.isFinite` 过滤
3. **风圈半径为 0**: `toWindPolygons` 中 `radii[qi] > 0` 检查，`hasAny` 标记
4. **预报为空**: forecastSrc 默认 `[]`，activeForecastSegs/otherForecastSegs 为空时不渲染
5. **雷达单张模式**: `radarType === '2'` 时用 `RADAR_FULL_EXTENT` 单片渲染
6. **无需风圈数据**: `showWindCircles` 开关控制，`windPolygons.length > 0` 时才渲染
7. **selectedPointIdx 越界**: `selectedIdx` 计算时做了 bounds check
8. **Polygon 闭合**: `toWindPolygons` 和 `fetchRain` 中都会检查并闭合环
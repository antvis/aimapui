# Changelog

## 0.4.3 (2026-07-14)

### Bug Fixes

- **SchemaLayer:** 修复 `sortValue` 递归遍历对象时遇到循环引用导致 `Maximum call stack size exceeded` 的问题，通过 `WeakSet` 检测已访问对象

### Features

- **ChinaDistrict:** 下钻模式支持双击上卷（dblclick 触发 drillUp）
- **SchemaLayer/PolygonLayer:** 新增 `onDblclick`/`onUndblclick` 事件，与 click 互斥

## 0.4.2 (2026-07-13)

### Documentation

- 走查修复文档与 skill 同步：补充 H3Layer、RouteLayer、AnnotationControl、ResetViewControl、LogoControl、LegendControl、SatelliteLayerControl 站点文档
- 删除 RouteLayer 已废弃属性文档（glow/animate/animateSpeed）
- controls.md skill reference 补齐所有控件
- CHANGELOG.md 补录 0.3.2~0.4.1 变更记录
- SKILL.md 补充 @antv/aimapui-plot 包说明
- CLI 版本对齐至 0.4.2

## 0.4.1 (2026-07-13)

### Features

- **台风地图:** 新增台风路径地图 Demo，支持降雨/云图/雷达/风场/卫星图层切换（浙江水利气象 API）
- **台风预报:** 台风预报路径改用实线渲染，修复虚线像素级退化成点串问题；历史轨迹使用实线
- **台风地图移动端:** 台风地图移动端适配 + BlockPage 设备切换
- **map-app-builder skill:** 新增 map-app-builder skill，覆盖布局架构、图层层级、DOM z-index、主题系统等
- **Canvas 风场图层:** 添加 Canvas 风场图层及 PC 端 UI 布局优化
- **Apple/Google Maps 演示:** 优化 AppleMaps/GoogleMaps 演示与台风默认图层

### Breaking Changes

- **RouteLayer:** 移除 `glow`、`animate`、`animateSpeed` 属性，发光与流动动画能力不再支持

### Bug Fixes

- **RouteLayer:** 修复文字与图标/圆点重叠问题，优化默认参数（`lineWidth` 3→4，`stopSize` 14→8）
- **RouteLayer:** 修复 `rest` 未定义错误、NaN 坐标校验及优化标注布局
- **GoogleMaps:** 修复 GoogleMapsMobileDemo 地图无法交互的问题

## 0.3.5 (2026-06-20)

### Bug Fixes

- **ImageCalibrationControl:** 清理冗余判断逻辑
- 添加 `@types/geojson` 依赖
- 更新依赖锁文件及 plot 包配置

## 0.3.4 (2026-06-19)

### Features

- **SatelliteLayerControl:** 新增卫星影像图层控件，支持提供商切换（高德/天地图/Google）、可见性开关、透明度调节
- 补齐复合图层设计规范

### Bug Fixes

- **ImageCalibrationControl:** 修复多图切换时图层消失的问题

## 0.3.3 (2026-06-19)

### Refactoring

- 地图引擎从动态 `import` 改为静态 `import`，避免 chunk 加载失败

## 0.3.2 (2026-06-19)

### Bug Fixes

- **ChinaDistrict:** 修复中国行政区划直辖市下钻时 adcode 前缀匹配不生效的问题
- 标注 L7 版本要求 ≥ 2.28.14

## 0.3.1 (2026-06-18)

### Features

- **AiMap:** 新增 `engine` 属性，支持外部注入地图引擎构造函数，跳过动态 import，适用于 SSR、微前端等场景
- **AnnotationControl:** 新增地图标注控件，支持 marker/highlighter/text/note/link/image/video 七种标注工具
- **H3Layer:** 新增 H3 六边形网格复合图层，支持 H3 索引自动转多边形渲染、颜色映射、悬停高亮、标签显示
- **plot:** 新增 `@aimapui/plot` 态势标绘控件包（PlotControl / PlotToolbar）

### Breaking Changes

- **BubbleLayer:** 移除 `labelTrigger` 配置项，气泡标签现在始终显示
- **MapSchema:** `basemap` 字段从必填改为可选（传入 `engine` 时可省略）

### Bug Fixes

- **DrawToolbar:** 修复 TypeScript 编译错误
- **ZoomControl:** 修复 TypeScript 编译错误
- **Google Maps:** 调整原生控件抑制轮询策略（间隔 50ms、最多 100 次），解决手势配置后原生 zoomControl 重新出现的问题

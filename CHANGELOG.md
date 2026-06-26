# Changelog

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

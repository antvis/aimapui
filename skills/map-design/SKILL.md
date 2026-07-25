---
name: 地图应用设计规范
description: >-
  基于 @antv/aimapui 构建生产级地图应用。覆盖布局架构、图层 z-index 层级、UI 叠加层堆叠、主题系统、交互模式以及数据类型到组件的映射。当用户需要创建地图应用、构建地理可视化、设计地图仪表盘，或需要 aimapui 组件选型、图层排序、地图 UI 架构指导时使用本 skill。触发词：“创建地图应用”、“构建地图”、“地图可视化”、“地理仪表盘”、“地图布局”、“图层层级”、“地图主题”、“为某类数据选择 aimapui 组件”。
---

# 地图应用构建器

遵循既定的布局、分层、主题与交互约定，使用 @antv/aimapui 构建完整的地图应用。

## Specification System

本 Skill 采用 **规范 + 场景** 双层结构：

- **specs/** — 可复用的通用规范（技术规范 + 设计规范），适用于所有场景
- **scenes/** — 具体业务场景指南，引用 specs 中的规范并补充场景专属的布局、组件选型和交互模式

### Specifications (specs/)

| 规范 | File | Description |
|------|------|-------------|
| 技术规范 | [technical.md](specs/technical.md) | 布局、图层层级、DOM z-index、主题系统、交互模式、数据类型→组件映射、控件放置、图例选择、常见陷阱 |
| Google Maps Mobile 设计语言 | [google-maps-mobile.md](specs/google-maps-mobile.md) | Design Tokens（颜色/字体/圆角/阴影/间距）、核心组件级 CSS 规范（14 个组件：Search Bar 3 态、Bottom Nav、Pill、Button、FAB、Tab Bar、Transportation Chip、List Item、User Location 等）、Z-Index 层级规范、交互状态规范（7 类）、页面级布局模式（Explore/Search/Navigate/Business）、aimapui 映射表 |
| Apple Maps 设计语言 | [apple-maps.md](specs/apple-maps.md) | Design Tokens、Liquid Glass 效果、颜色/字体/圆角/阴影系统、页面布局模式（Browse/PlaceCard/Search）、核心组件规范、aimapui 映射建议 |

### Scenes (scenes/)

根据应用场景加载对应的详细指南：

| 场景 | File | When to load |
|------|------|-------------|
| PC 分析地图 / 数据仪表盘 / 监控大屏 | [pc-analytics.md](scenes/pc-analytics.md) | 桌面端数据分析、多图层叠加、侧边面板联动、精细 hover/click 交互 |
| 移动端地图应用 | [mobile-map.md](scenes/mobile-map.md) | 手机/平板端、BottomSheet 面板、MobileToolbar、触屏 tap 交互、手势友好设计 |
| 旅游地图 / 景区导览 / 城市探索 | [vertical-tourism.md](scenes/vertical-tourism.md) | POI 标注、游览路线串联、Maki 图标映射、图文混排详情面板、分类筛选 |

## Quick Start

```bash
pnpm add @antv/aimapui @antv/l7
```

```tsx
import '@antv/aimapui/style.css'; // Required — controls, popups, legends won't render without it
```

L7 version must be ≥ 2.29.1.

## How to Use This Skill

1. **始终先读 specs/technical.md** — 包含所有场景必须遵守的技术约束（层级、z-index、主题等）
2. **按需加载 specs/google-maps-mobile.md** — 当需要对标 Google Maps 视觉规范时
3. **按场景加载 scenes/*.md** — 获取该场景专属的布局模式、推荐组件组合和交互规范
4. **场景文件会引用规范** — 例如移动端场景会引用 technical.md 的 z-index 规则和 google-maps-mobile.md 的设计 token

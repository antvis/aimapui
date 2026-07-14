# Google Maps Mobile 设计语言

基于 Google Maps Mobile UI Kit (2024) 提取的设计规范，可作为移动端地图应用的视觉基准。aimapui 组件已覆盖核心能力，部分组件需自定义实现。

源设计文件：`.codefuse/google.md`（组件级 CSS 3361 行）、`.codefuse/google_page.md`（页面级 CSS 8108 行）。

---

## 一、Design Tokens

### 1.1 颜色系统 (Color Palette)

#### 主色调

| Token | 色值 | 用途 |
|-------|------|------|
| Primary | `#1A73E8` | 主按钮背景、选中态图标、用户定位点、Primary FAB |
| Secondary | `#0B57D0` | Bottom Nav 选中态文字/图标、Tab 选中态 |
| Highlight Bg | `#D3E3FD` | Bottom Nav 选中 pill 背景、Icon Highlight 水平态 |
| Highlight Bg Alt | `#E8F0FE` | 圆形图标容器背景、Saved Location 图标 |
| Selected Pill (Explore) | `#E3EDFF` | Explore 页 Bottom Nav 选中 pill 背景 |
| Primary Surface | `#ECF3FE` | Secondary Button 背景 |

#### 功能色 / 状态色

| Token | 色值 | 用途 |
|-------|------|------|
| Route Path | `#2985FF` dashed 5px | 导航路线虚线 |
| Direction Cone | `linear-gradient(233deg, rgba(11,103,225,0) 42%, rgba(99,166,255,0.58) 99%)` | 用户定位方向锥体 |
| Tab Selected | `#1761D7` | 详情页 Tab 选中文字 + 底部指示条 |
| Tab Inactive | `#7F7F7F` | Tab 未选中文字 |
| Chip Selected Bg | `#E9F4FF` | Transportation Chip 选中背景 |
| Chip Selected Border | `#86BAFF` | Transportation Chip 选中边框 |
| Transit Teal | `#007B83` | 公交/地铁图标背景色 |
| List Icon Blue | `#1B6EF3` | 搜索结果列表项 POI 图标 |

#### 中性色 / 表面色

| Token | 色值 | 用途 |
|-------|------|------|
| Surface | `#FFFFFF` | 卡片/面板/搜索栏/Bottom Nav 背景 |
| Icon History Bg | `#F0F0F0` | 历史记录图标背景 |
| Icon Inactive | `#3F3F3F` | FAB 未选中态图标 |
| Icon Inactive Nav | `#5E5E5E` | Bottom Nav 未选中态图标/文字 |
| List History Icon | `#373737` | 历史列表项图标 |
| Separator Label | `#B1C2FF` | 搜索栏 Selected 态分隔符 |

#### 文本色

| Token | 色值 | 用途 |
|-------|------|------|
| Text Primary | `#1C1B1F` | 标题、正文、图标默认色 |
| Text Title | `rgba(0,0,0,0.9)` | Pill 标签文字 |
| Text Search Placeholder | `#707070` | 搜索栏 placeholder |
| Text Search Result | `#040404` | 搜索结果文字 |
| Text Subtitle | `#404040` | 列表项副文本 |
| Text Meta | `#867F7F` | 元信息、报告人数、Saved Location 地址 |
| Text Saved Label | `#000000` | Saved Location 标签 |

#### 边框色

| Token | 色值 | 用途 |
|-------|------|------|
| Border Light | `#F3F2F2` | 列表分隔线 |
| Border Medium | `#D9D9D9` | 搜索栏 Selected 态边框 |
| Input Border | `#D3D3D3` | From/To 导航输入框边框 |

### 1.2 字体系统 (Typography)

字体族：**Roboto**

| 层级 | 尺寸 | 字重 | 行高 | Letter Spacing | 用途 |
|------|------|------|------|----------------|------|
| Search Placeholder | 20px | 400 | 23px | 0.01em | Search Bar 占位文字 |
| Search Result | 20px | 400 | 23px | 0.01em | Search Bar 搜索结果 |
| Button Label | 16px | 500 | 19px | — | Primary/Secondary 按钮文字 |
| Pill Label | 15px | 500 | 18px | 0.02em | Pill 筛选标签 |
| Tab Selected | 15px | 600 | 22px | 0.2px | 详情页 Tab 选中 |
| Tab Active | 15px | 500 | 22px | — | 详情页 Tab 未选中 |
| Chip Label | 15px | 400-500 | 18px | — | Transportation Chip 文字 |
| List Title | 17px | 400 | 20px | — | Saved Location 标签 |
| List Item Title | 16px | 400 | 19px | 0.02em | 列表项标题 (无地址) |
| List Subtitle | 14px | 400 | 16px | 0.02em | 列表项副标题、地址 |
| List Meta | 12px | 400 | 14px | — | 元信息 (报告人数) |
| Nav Tab Label | 11px | 500 | 13px | 0.01em | Bottom Nav Tab 标签 |

### 1.3 圆角系统 (Border Radius)

| 尺寸 | 用途 |
|------|------|
| 4px | Tab 指示条 (仅顶部) |
| 8px | From/To 输入框 |
| 20px | 圆形图标背景 (34px)、Icon Highlight pill (64×32)、User Location 蓝点 |
| 24px | Pill 标签、FAB Small |
| 28px | Transportation Chip (选中态) |
| 40px | Search Bar |
| 44px | Primary/Secondary Button、FAB Large |

### 1.4 阴影系统 (Box Shadow)

| 场景 | 参数 |
|------|------|
| Shadow Light | `0px 1px 2px rgba(0,0,0,0.25)` — Pill 标签、FAB Secondary、FAB Small、User Location 蓝点 |
| Shadow Medium | `0px 4px 4px rgba(0,0,0,0.25)` — Search Bar、Bottom Nav (反向 `0px -2px 4px`) |
| Shadow Heavy | `0px 4px 12px rgba(0,0,0,0.25)` — FAB Large Primary |

### 1.5 间距系统 (Spacing)

| 场景 | 值 |
|------|------|
| 图标与文字间距 (Pill/Chip) | 4px - 6px |
| 列表项图标与文字 | 20px |
| 列表项内边距 | 12px (左) |
| 搜索栏内图标间距 | 8px - 16px |
| Bottom Nav tab 间距 | 4px |
| FAB 按钮组间距 | 12px |
| 按钮内图标与文字 | 6px |

---

## 二、布局系统 (Layout)

### 2.1 画布基准

- 基准设计宽度：**390px**（iPhone 12 / 13 / 14）
- 基准设计高度：**844px**
- Map View 高度：759px（减去 Bottom Nav 89px + 系统状态栏区域）

### 2.2 页面级布局模式

#### Explore（探索首页）

```
┌─────────────────────┐
│ Status Bar (48px)   │
│ Search Bar (48px)   │ ← shadow medium, radius 40px
│ Pill Filters (40px) │ ← 横向滚动, gap 4px
│                     │
│                     │
│      MAP            │ ← User Location Mark + Direction Cone
│                     │
│                     │         ┌──┐ ← FAB Small (40px, layers)
│                     │         ├──┤ ← FAB Large (58px, directions)
│                     │         └──┘
├─────────────────────┤
│ Bottom Nav (89px)   │ ← 5 tabs, selected pill #E3EDFF
└─────────────────────┘
```

- **Pill 筛选条**：位于搜索栏下方，横向滚动，每个 Pill 32px 高、圆角 24px、shadow light
- **FAB 按钮组**：右侧垂直排列，Large(58px) 在下、Small(40px) 在上，间距 12px
- **Bottom Nav**：选中态 pill 背景 `#E3EDFF`，图标/文字 `#0B57D0`；未选中灰色 `#5E5E5E`

#### Search（搜索结果页）

```
┌─────────────────────┐
│ Status Bar          │
│ Search Bar (Selected)│ ← border #D9D9D9, chevron back icon
│ Saved Locations     │ ← 横向滚动, 圆形图标(#E8F0FE/#007B83) + label + address
├─────────────────────┤
│ Section Title       │ ← "Recent", 15px/500, right icon
│ List Item           │ ← icon(#F0F0F0 or #1B6EF3) + title + subtitle
│ List Item           │ ← divider #F3F2F2
│ List Item           │
│ ...                 │ ← overflow-y scroll
├─────────────────────┤
│ Keyboard (327px)    │ ← 仅搜索聚焦时显示
└─────────────────────┘
```

- **Saved Locations 横滑**：每个 item 123×37px，圆形图标 34px（家/公司用 `#E8F0FE`，其他用 `#007B83`），gap 5px
- **列表项两态**：有地址(72px, 双行) / 无地址(59px, 单行)，左侧图标 34px 圆形
- **图标颜色语义**：`#F0F0F0` 背景 = 历史记录，`#1B6EF3` = 地点/POI，`#007B83` = 公交/transit

#### Navigate to（导航规划页）

```
┌─────────────────────┐
│ Status Bar          │
│ From Input (43px)   │ ← 蓝色定位点 + input(border #D3D3D3) + swap icon
│ To Input (43px)     │ ← 红色终点图标 + input + close icon
│ Transport Chips     │ ← Car(selected #E9F4FF border #86BAFF) / Transit / Walk / Fly / Bike
├─────────────────────┤
│                     │
│    ROUTE MAP        │ ← dashed #2985FF path + User Location + Direction Cone
│                     │
│              ┌──┐   │ ← FAB Small (zoom)
│              ├──┤   │ ← FAB Small (locate)
│              └──┘   │
├─────────────────────┤
│ Bottom Sheet        │ ← handle + destination name + address
│ [Directions] [Save] │ ← Primary(#1A73E8) + Secondary(#ECF3FE)
└─────────────────────┘
```

- **From/To 输入框**：43px 高，border `#D3D3D3` radius 8px，左侧图标区分起点(蓝点)/终点(红pin)
- **交通方式切换**：横向排列 chip，选中态 `#E9F4FF` 背景 + `#86BAFF` 边框 + `#1A73E8` 文字/图标
- **路线**：虚线 `#2985FF` 5px，配合 `RouteLayer` 的 `routeType` 属性
- **底部卡片**：BottomSheet collapsed 态显示目的地名称+地址，展开后显示完整详情

#### Business（商户详情页）

```
┌─────────────────────┐
│ Status Bar          │
│ Map (with route)    │ ← 带路线预览的地图
│ Search Bar (Result) │ ← 绝对定位在地图上, shadow medium
│ FAB Small ×2       │ ← 右侧垂直排列
├─────────────────────┤
│ Bottom Sheet        │
│  Handle (73×4px)    │
│  Business Name      │ ← 20px/400
│  Action Buttons     │ ← [Directions] [Call] [Save] [Share] 横向滚动
│  Photo Gallery      │ ← 横向滚动, 主图240×317 + 副图193×152.5, radius 20px
│  Tab Bar (36px)     │ ← Overview(selected #1761D7) / Menu / Reviews / Photos
│  Info List          │ ← icon + text rows, divider #F3F2F2
└─────────────────────┘
```

- **图片画廊**：横向滚动，主图 240×317px，副图网格 193×152.5px × 2，圆角 20px，gap 12px
- **Tab Bar**：36px 高，底部 1px `#BBBBBB` 分隔线，选中态文字 `#1761D7` + 底部 3px 指示条(radius 4px top)
- **操作按钮行**：Primary(`#1A73E8`) + 多个 Secondary(`#ECF3FE`)，横向滚动，gap 4px
- **信息列表**：与搜索结果列表相同样式，icon 颜色区分类型（`#1B6EF3` 地点 / `#151515` 通用）

---

## 三、核心组件规范

### 3.1 Search Bar（搜索栏 — 3 态）

#### State=Primary（默认态）

```css
.search-bar-primary {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 12px;
  gap: 16px;
  width: 366px;
  height: 48px;
  background: #FFFFFF;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 40px;
}

/* Google Logo 30×30px + placeholder text */
.search-bar-primary .placeholder {
  font-family: 'Roboto';
  font-weight: 400;
  font-size: 20px;
  line-height: 23px;
  letter-spacing: 0.01em;
  color: #707070;
}

/* 右侧语音图标 26×26px (#4F4F4F) + 头像 32×32px (radius 24px) */
```

#### State=Result（搜索结果态）

```css
.search-bar-result {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 16px 10px 20px;
  gap: 16px;
  width: 366px;
  height: 44px;
  background: #FFFFFF;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 40px;
}

/* 结果文字 */
.search-bar-result .text {
  font-size: 20px;
  line-height: 23px;
  letter-spacing: 0.01em;
  color: #040404;
}

/* 右侧关闭图标 24×24px (rgba(28,27,31,0.9)) */
```

#### State=Selected（聚焦态）

```css
.search-bar-selected {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 12px;
  gap: 10px;
  width: 366px;
  height: 49px;
  background: #FFFFFF;
  border: 1px solid #D9D9D9;
  border-radius: 40px;
}

/* 左侧返回图标 26×26px (#4F4F4F) + 分隔符 "|" (28px, #B1C2FF) + placeholder */
.search-bar-selected .separator {
  font-weight: 300;
  font-size: 28px;
  line-height: 33px;
  color: #B1C2FF;
  margin: 0 -2px;
}

/* 右侧语音图标 26×26px (#4F4F4F) */
```

**三态对比表：**

| 属性 | Primary | Result | Selected |
|------|---------|--------|----------|
| 高度 | 48px | 44px | 49px |
| 背景 | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |
| 边框 | — | — | `1px solid #D9D9D9` |
| 阴影 | shadow medium | shadow medium | — |
| 圆角 | 40px | 40px | 40px |
| 左侧元素 | Logo + placeholder | 文字结果 | ‹ + \| + placeholder |
| 右侧元素 | 语音 + 头像 | 关闭图标 | 语音图标 |

### 3.2 Bottom Nav（底部导航栏）

```css
.bottom-nav {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 4px 8px 36px;
  gap: 4px;
  position: absolute;
  height: 89px;
  left: 0;
  right: 0;
  bottom: 0;
  background: #FFFFFF;
  box-shadow: 0px -2px 4px rgba(0, 0, 0, 0.25);
}
```

#### Bottom Nav Tab — Selected

```css
.bottom-nav-tab-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  gap: 4px;
  width: 64px;
  height: 49px;
}

/* 选中 pill 背景 */
.tab-icon-highlight-selected {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 4px 20px;
  gap: 4px;
  width: 64px;
  height: 32px;
  background: #D3E3FD; /* Explore页为 #E3EDFF */
  border-radius: 20px;
}

/* 图标 24×24px, 颜色 #0B57D0 */
/* 标签 */
.tab-label-selected {
  font-family: 'Roboto';
  font-weight: 500;
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 0.01em;
  color: #0B57D0;
}
```

#### Bottom Nav Tab — Unselected

```css
.bottom-nav-tab-unselected {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  gap: 4px;
  width: 64px;
  height: 49px;
}

/* 未选中 pill — 无背景 */
.tab-icon-highlight-unselected {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 4px 20px;
  gap: 4px;
  width: 64px;
  height: 32px;
  border-radius: 20px;
  /* 无 background */
}

/* 图标 24×24px, 颜色 #5E5E5E */
/* 标签 */
.tab-label-unselected {
  font-family: 'Roboto';
  font-weight: 500;
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 0.01em;
  color: #5E5E5E;
}
```

**典型 5 Tab 配置：** Explore / Go / Saved / Contribute / Updates

**选中态 pill 颜色差异：**
- Explore 页（初始）：`#E3EDFF`
- 其他页面切换后：`#D3E3FD`

### 3.3 Pill Filter Tag（筛选标签）

```css
.pill-tag {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 12px 6px 8px;
  gap: 4px;
  width: auto;
  height: 32px;
  background: #FFFFFF;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.25);
  border-radius: 24px;
}

/* 左侧图标 20×20px (#000000) */
.pill-tag .icon {
  width: 20px;
  height: 20px;
}

/* 标签文字 */
.pill-tag .label {
  font-family: 'Roboto';
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
  letter-spacing: 0.02em;
  color: rgba(0, 0, 0, 0.9);
}
```

- 横向滚动排列，gap 4px
- 位于 Search Bar 下方

### 3.4 Button — Primary / Secondary

#### Primary Button

```css
.button-primary {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 18px 12px 16px;
  gap: 6px;
  height: 43px;
  background: #1A73E8;
  border-radius: 44px;
}

/* 图标 18×18px (#FFFFFF) */
.button-primary .icon {
  width: 18px;
  height: 18px;
  /* vector fill: #FFFFFF */
}

/* 标签 */
.button-primary .label {
  font-family: 'Roboto';
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  color: #FFFFFF;
}
```

#### Secondary Button

```css
.button-secondary {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  gap: 6px;
  height: 46px;
  background: #ECF3FE;
  border-radius: 44px;
}

/* 图标 22×22px (#0B57D0) */
.button-secondary .icon {
  width: 22px;
  height: 22px;
  /* vector fill: #0B57D0 */
}

/* 标签 */
.button-secondary .label {
  font-family: 'Roboto';
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  color: #0B57D0;
}
```

**对比表：**

| 属性 | Primary | Secondary |
|------|---------|-----------|
| 背景 | `#1A73E8` | `#ECF3FE` |
| 圆角 | 44px | 44px |
| 内边距 | 12px 18px 12px 16px | 12px 16px |
| 图标尺寸 | 18×18px | 22×22px |
| 图标色 | `#FFFFFF` | `#0B57D0` |
| 文字色 | `#FFFFFF` | `#0B57D0` |
| 高度 | 43px | 46px |

### 3.5 Round FAB Button（圆形浮动按钮）

#### Large FAB (58px) — Primary

```css
.fab-large-primary {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 16px;
  gap: 4px;
  width: 58px;
  height: 58px;
  background: #1A73E8;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.25);
  border-radius: 44px;
}

/* 图标 26×26px (#FFFFFF) */
```

#### Large FAB (58px) — Secondary

```css
.fab-large-secondary {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 16px;
  gap: 4px;
  width: 58px;
  height: 58px;
  background: #FFFFFF;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.25);
  border-radius: 44px;
}

/* 图标 26×26px (#3F3F3F) */
```

#### Small FAB (40px) — Primary

```css
.fab-small-primary {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 8px;
  gap: 4px;
  width: 40px;
  height: 40px;
  background: #1A73E8;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.25);
  border-radius: 44px;
}

/* 图标 24×24px (#FFFFFF), radius 24px */
```

#### Small FAB (40px) — Secondary

```css
.fab-small-secondary {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 8px;
  gap: 4px;
  width: 40px;
  height: 40px;
  background: #FFFFFF;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.25);
  border-radius: 44px;
}

/* 图标 24×24px (#3F3F3F), radius 24px */
```

**四态对比表：**

| 属性 | Large Primary | Large Secondary | Small Primary | Small Secondary |
|------|---------------|-----------------|---------------|-----------------|
| 尺寸 | 58×58px | 58×58px | 40×40px | 40×40px |
| 背景 | `#1A73E8` | `#FFFFFF` | `#1A73E8` | `#FFFFFF` |
| 阴影 | heavy (`0 4 12`) | light (`0 1 2`) | light (`0 1 2`) | light (`0 1 2`) |
| 图标 | 26×26 `#FFF` | 26×26 `#3F3F3F` | 24×24 `#FFF` | 24×24 `#3F3F3F` |
| 内边距 | 16px | 16px | 8px | 8px |

### 3.6 Tab Bar（详情页标签栏）

#### Tab — Selected

```css
.tab-selected {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4px 4px 0;
  gap: 4px;
  height: 36px;
}

/* Tab 文字 */
.tab-selected .label {
  font-family: 'Roboto';
  font-weight: 600;
  font-size: 15px;
  line-height: 22px;
  text-align: center;
  letter-spacing: 0.2px;
  color: #1761D7;
}

/* 底部指示条 */
.tab-selected .indicator {
  width: 100%; /* 与文字等宽 */
  height: 3px;
  background: #1761D7;
  border-radius: 4px 4px 0 0;
}
```

#### Tab — Active (未选中)

```css
.tab-active {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 4px;
  gap: 4px;
  height: 36px;
}

.tab-active .label {
  font-family: 'Roboto';
  font-weight: 500;
  font-size: 15px;
  line-height: 22px;
  text-align: center;
  color: #7F7F7F;
}
/* 无底部指示条 */
```

- Tab Bar 整体高度 36px
- 底部 1px 分隔线（`#BBBBBB`，见 Business 页）
- 典型 tabs：Overview / Menu / Reviews / Photos

### 3.7 Transportation Chip（交通方式切换）

#### Chip — Unselected

```css
.chip-unselected {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  padding: 4px 12px;
  gap: 6px;
  height: 28px;
  /* 无边框、无背景 */
}

/* 图标 20×20px (#151515) */
.chip-unselected .icon {
  width: 20px;
  height: 20px;
  /* vector fill: #151515 */
}

/* 标签 */
.chip-unselected .label {
  font-family: 'Roboto';
  font-weight: 400;
  font-size: 15px;
  line-height: 18px;
  color: #000000;
}
```

#### Chip — Selected

```css
.chip-selected {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  padding: 4px 16px;
  gap: 6px;
  height: 28px;
  background: #E9F4FF;
  border: 1px solid #86BAFF;
  border-radius: 28px;
}

/* 图标 20×20px (#1A73E8) */
.chip-selected .icon {
  width: 20px;
  height: 20px;
  /* vector fill: #1A73E8 */
}

/* 标签 */
.chip-selected .label {
  font-family: 'Roboto';
  font-weight: 500;
  font-size: 15px;
  line-height: 18px;
  color: #1A73E8;
}
```

- 横向排列，gap 16px
- 选中态额外增加左右 padding（12px → 16px）

### 3.8 Saved Location Row（收藏地点条目）

```css
.saved-location {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  gap: 5px;
  width: 123px;
  height: 37px;
}

/* 圆形图标容器 */
.saved-location .icon-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  background: #E8F0FE; /* 家/公司; 其他用 #007B83 */
  border-radius: 20px;
}

/* 图标 20×20px (#1A73E8) */

/* 文本区 */
.saved-location .info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  gap: 5px;
  flex: 1;
}

/* 标签 */
.saved-location .label {
  font-family: 'Roboto';
  font-weight: 400;
  font-size: 17px;
  line-height: 20px;
  color: #000000;
}

/* 地址 */
.saved-location .address {
  font-family: 'Roboto';
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  color: #867F7F;
}
```

- 横向滚动排列，gap 5px
- 家/公司图标背景 `#E8F0FE`，其他收藏点用 `#007B83`

### 3.9 List Item（搜索结果列表项）

#### 有地址（72px 高 — 双行）

```css
.list-item-with-address {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 0 0 12px;
  gap: 20px;
  width: 390px;
  height: 72px;
  background: #FFFFFF;
}

/* 圆形图标 34×34px */
.list-item-with-address .icon-container {
  width: 34px;
  height: 34px;
  border-radius: 20px;
  /* POI 类型: 无背景色, 图标 #1B6EF3 */
  /* 历史类型: background #F0F0F0, 图标 #373737 */
}

/* 文本区 */
.list-item-with-address .text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 20px 20px 20px 0;
  gap: 2px;
  flex: 1;
  border-bottom: 1px solid #F3F2F2;
}

/* 主文本 */
.list-item-with-address .title {
  font-family: 'Roboto';
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  letter-spacing: 0.02em;
  color: #404040;
}

/* 副文本 (元信息) */
.list-item-with-address .subtitle {
  font-family: 'Roboto';
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: #867F7F;
}
```

#### 无地址（59px 高 — 单行）

```css
.list-item-no-address {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 0 0 12px;
  gap: 20px;
  width: 390px;
  height: 59px;
}

/* 圆形图标 34×34px, background #F0F0F0 */
.list-item-no-address .icon-container {
  width: 34px;
  height: 34px;
  background: #F0F0F0;
  border-radius: 20px;
}

/* 图标 20×20px (#373737) */

/* 文本区 */
.list-item-no-address .text {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20px 20px 20px 0;
  gap: 4px;
  flex: 1;
  border-bottom: 1px solid #F3F2F2;
}

.list-item-no-address .title {
  font-family: 'Roboto';
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
  letter-spacing: 0.02em;
  color: #404040;
}
```

**图标颜色语义表：**

| 背景色 | 图标色 | 含义 |
|--------|--------|------|
| 透明 | `#1B6EF3` | POI / 地点 |
| `#F0F0F0` | `#373737` | 历史记录 |
| `#E8F0FE` | `#1A73E8` | 家/公司收藏 |
| `#007B83` | `#FFFFFF` | 公交 / Transit |

### 3.10 User Location Mark（用户定位点）

#### 无方向锥体

```css
.user-location {
  position: absolute;
  width: 30.26px;
  height: 30.29px;
}

.user-location .dot {
  position: absolute;
  inset: 0;
  background: #1A73E8;
  border: 3px solid #FFFFFF;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.25);
  border-radius: 20px;
}
```

#### 有方向锥体（导航态）

```css
.user-location-direction {
  position: absolute;
  width: 62px;
  height: 62px;
}

/* 方向锥体 */
.user-location-direction .cone {
  position: absolute;
  width: 73.5px;
  height: 63px;
  left: 3.5px;
  top: -2px;
  background: linear-gradient(
    233.03deg,
    rgba(11, 103, 225, 0) 42.51%,
    rgba(99, 166, 255, 0.58) 98.87%
  );
}

/* 蓝点 */
.user-location-direction .dot {
  position: absolute;
  width: 22px;
  height: 22px;
  left: 0;
  top: 40.5px;
  background: #1A73E8;
  border: 4px solid #FFFFFF;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.25);
  border-radius: 20px;
}
```

### 3.11 Icon Highlight（图标高亮容器）

两种形态，用于不同场景。

#### Horizontal Pill（水平胶囊态 — Bottom Nav）

```css
.icon-highlight-horizontal {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 4px 20px;
  gap: 4px;
  width: 64px;
  height: 32px;
  background: #D3E3FD;
  border-radius: 20px;
}

/* 图标 24×24px (#0B57D0) */
```

#### Round（圆形 — 列表项图标、Saved Location）

```css
.icon-highlight-round {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  background: #E8F0FE;
  border-radius: 20px;
}

/* 图标 20×20px (#1A73E8) */
```

### 3.12 Bottom Sheet Handle（底部面板拖拽把手）

```css
.bottom-sheet-handle {
  width: 73px;
  height: 4px;
  background: #C5C6CD;
  border-radius: 12px;
  margin: 0 auto;
}
```

- 位于 Bottom Sheet 面板顶部居中
- 支持拖拽展开/收起

### 3.13 Navigation Input（导航输入框 From/To）

```css
.nav-input {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 8px;
  gap: 4px;
  height: 43px;
}

/* From 输入框左侧: 蓝色定位点图标 */
/* To 输入框左侧: 红色终点图标 */

.nav-input .input {
  flex: 1;
  border: 1px solid #D3D3D3;
  border-radius: 8px;
  padding: 8px 12px;
  font-family: 'Roboto';
  font-size: 16px;
}

/* 右侧: From 为 swap 图标, To 为 close 图标 */
```

- From/To 输入框垂直排列，整体容器带白色背景
- 右侧 swap 图标仅 From 显示，close 图标仅 To 显示

### 3.14 Route Path（路线路径）

```css
.route-path {
  border: 5px dashed #2985FF;
}
```

- 虚线样式：`dashed`
- 线宽：5px
- 颜色：`#2985FF`
- 配合 `RouteLayer` 的 `routeType` 属性使用

---

## 四、Z-Index 层级规范

Google Maps Mobile 的视觉叠加顺序（从底到顶）：

| 层级 | 组件 | CSS 特征 |
|------|------|----------|
| 0 (Base) | Map View | 地图底图，390×759px |
| 1 | Route Path | dashed 路线 |
| 2 | User Location Mark | 蓝点 + 方向锥体 |
| 3 | Map Markers / POI Pins | 地图标注 |
| 4 | Pill Filters | 搜索栏下方横滑筛选 |
| 5 | Search Bar | top 定位，shadow medium |
| 6 | FAB Buttons | right 定位，垂直排列 |
| 7 | Bottom Nav | bottom 定位，shadow (反向) |
| 8 | Bottom Sheet | 从底部上滑面板 |
| 9 | Bottom Sheet Handle | 面板顶部拖拽把手 |
| 10 | Navigation Input | 导航规划页顶部 |
| 11 | Keyboard | 系统键盘（搜索聚焦时） |

**aimapui 映射建议：**
- 地图层使用 L7 地图默认 z-index
- DOM 覆盖控件 (Pill/SearchBar/FAB) ≥ 1000（遵循 `technical.md` 规范）
- Bottom Sheet 面板使用最高 z-index
- Bottom Nav 使用 z-index: 1005（控件层上限）

---

## 五、交互状态规范

### 5.1 Button 交互态

| 状态 | Primary Button | Secondary Button |
|------|---------------|-----------------|
| Default | bg `#1A73E8`, text `#FFF` | bg `#ECF3FE`, text `#0B57D0` |
| Pressed | bg 加深（约 `#1565C0`） | bg 加深（约 `#D2E3FC`） |
| Disabled | opacity 0.5 | opacity 0.5 |

### 5.2 FAB 交互态

| 状态 | Primary FAB | Secondary FAB |
|------|------------|---------------|
| Default | bg `#1A73E8`, shadow heavy/light | bg `#FFFFFF`, shadow light |
| Pressed | bg 加深 | bg `#F5F5F5` |
| 图标 | `#FFFFFF` | `#3F3F3F` |

### 5.3 Bottom Nav Tab 交互态

| 状态 | Pill 背景 | 图标色 | 文字色 |
|------|-----------|--------|--------|
| Selected | `#D3E3FD` 或 `#E3EDFF` | `#0B57D0` | `#0B57D0` |
| Unselected | 透明 | `#5E5E5E` | `#5E5E5E` |

### 5.4 Tab Bar 交互态

| 状态 | 文字色 | 字重 | 底部指示条 |
|------|--------|------|-----------|
| Selected | `#1761D7` | 600 | 3px `#1761D7`, radius 4px top |
| Active | `#7F7F7F` | 500 | 无 |

### 5.5 Transportation Chip 交互态

| 状态 | 背景 | 边框 | 图标色 | 文字色 | Padding |
|------|------|------|--------|--------|---------|
| Unselected | 透明 | 无 | `#151515` | `#000000` | 4px 12px |
| Selected | `#E9F4FF` | `1px solid #86BAFF` | `#1A73E8` | `#1A73E8` | 4px 16px |

### 5.6 Search Bar 交互态

| 状态 | 边框 | 阴影 | 行为 |
|------|------|------|------|
| Primary | 无 | shadow medium | 点击后进入 Selected |
| Selected | `1px solid #D9D9D9` | 无 | 显示键盘，左侧返回图标 |
| Result | 无 | shadow medium | 显示搜索结果文字 + 关闭图标 |

### 5.7 List Item 交互态

| 状态 | 背景 | 行为 |
|------|------|------|
| Default | `#FFFFFF` | 正常显示 |
| Pressed | `#F5F5F5` | 反馈触摸 |
| Ripple | Material Ripple | 从触摸点扩散 |

---

## 六、图标体系

Google Maps 使用的 36 个图标均可通过 Maki Icons 映射：

| 类别 | Maki 名称 | 用途 |
|------|----------|------|
| 导航 | `directions`, `navigation`, `turn-right` | 路线指引 |
| 交通 | `car`, `rail`, `bicycle`, `pedestrian`, `airport` | 出行方式切换 |
| POI | `restaurant`, `lodging`, `fuel`, `grocery`, `monument` | 地点分类 |
| 操作 | `search`, `close`, `share`, `edit`, `plus` | 交互动作 |
| 位置 | `marker`, `my-location`, `compass` | 定位/方向 |
| 信息 | `information`, `telephone`, `money`, `star` | 详情展示 |
| 其他 | `bookmark`, `home`, `office`, `clock`, `list` | 收藏/常用 |

图标基准尺寸：**24×24px**（通用），20×20px（小图标），26×26px（FAB Large 图标）。

图标默认填充色：`#1C1B1F`（深色），`#FFFFFF`（反白），`#5E5E5E`（未选中态）。

```tsx
import { createMakiIconMap } from '@antv/aimapui';

const googleMapsIcons = createMakiIconMap([
  'search', 'close', 'directions', 'navigation',
  'car', 'rail', 'bicycle', 'pedestrian', 'airport',
  'restaurant', 'lodging', 'fuel', 'grocery',
  'marker', 'my-location', 'compass', 'information',
  'share', 'edit', 'plus', 'bookmark', 'home',
]);
```

---

## 七、布局参考尺寸

| 元素 | 高度 | 内边距 | 间距 |
|------|------|--------|------|
| Search Bar (Primary) | 48px | 8px 12px | gap 16px |
| Search Bar (Result) | 44px | 10px 16px 10px 20px | gap 16px |
| Search Bar (Selected) | 49px | 8px 12px | gap 10px |
| Bottom Nav | 89px (含安全区36px) | 4px 8px | tab 等分 |
| Bottom Nav Tab | 49px | — | icon-label gap 4px |
| Pill Tag | 32px | 6px 12px 6px 8px | gap 4px |
| Primary Button | 43px | 12px 18px 12px 16px | gap 6px |
| Secondary Button | 46px | 12px 16px | gap 6px |
| Round FAB Large | 58px | 16px | — |
| Round FAB Small | 40px | 8px | — |
| List Item (有地址) | 72px | 0 0 0 12px | gap 20px |
| List Item (无地址) | 59px | 0 0 0 12px | gap 20px |
| Tab Bar | 36px | 4px | gap (flex) |
| Bottom Sheet Handle | 4px | — | width 73px, radius 12px |
| Navigation Input | 43px | 12px 8px | gap 4px |
| Transportation Chip | 28px | 4px 12px~16px | gap 6px |
| Saved Location Row | 37px | — | gap 5px |
| Icon Highlight (H) | 32px | 4px 20px | gap 4px |
| Icon Highlight (Round) | 34px | — | — |
| User Location (simple) | 30px | — | — |
| User Location (direction) | 62px | — | cone 73.5×63px |

---

## 八、与 aimapui 组件映射

| Google Maps 组件 | aimapui 对应 | 实现方式 |
|-----------------|-------------|---------|
| Search Bar (3 states) | `SearchBar` | 直接使用，三态通过 props 控制 |
| Bottom Nav (5 tabs) | `MobileToolbar` | config.items 配置 5 个 tab |
| Pill Filter Tag | — | 自定义 flex 组件，圆角24px + shadow light |
| Primary Button | Popup `actions` | variant='primary'，圆角44px |
| Secondary Button | Popup `actions` | variant='secondary'，#ECF3FE 背景 |
| Round FAB (58px/40px) | — | 自定义绝对定位按钮，shadow heavy |
| Tab Indicator | — | 自定义组件，底部 3px #1761D7 指示条 |
| Transportation Mode | `RouteLayer` routeType | UI 切换器需自定义 |
| User Location Mark | `GeoLocateControl` / `Marker` | 蓝色圆点 + 白边 + shadow |
| Direction Cone | `Marker` | 自定义 SVG 锥体 + gradient |
| List Item | BottomSheet 内容 | icon + title + subtitle + divider |
| Saved Location Row | BottomSheet 内容 | 圆形图标(#E8F0FE) + label + address |
| Bottom Sheet Handle | — | 自定义 div，73×4px, radius 12px |
| Navigation Input | — | 自定义输入框组件 |
| Route Path | `RouteLayer` | dashed #2985FF 5px |

---

## 九、文件引用

- 源设计规范文件：`.codefuse/google.md`（组件级 CSS 规范，3361 行）
- 页面级规范文件：`.codefuse/google_page.md`（4 页面 CSS 规范，8108 行）
- 技术实现规范：`skills/map-design/specs/technical.md`
- Apple Maps 对比规范：`skills/map-design/specs/apple-maps.md`

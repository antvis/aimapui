# Google Maps Mobile 设计语言

基于 Google Maps Mobile UI Kit (2024) 提取的设计规范，可作为移动端地图应用的视觉基准。aimapui 组件已覆盖核心能力，部分组件需自定义实现。

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#1A73E8` | 主按钮、选中态图标、用户定位点 |
| Secondary | `#0B57D0` | 次按钮文字、Tab 选中态 |
| Highlight Bg | `#D3E3FD` | Bottom Nav 选中 pill 背景 |
| Highlight Bg Alt | `#E8F0FE` | 圆形图标容器背景、Saved Location |
| Surface | `#FFFFFF` | 卡片/面板/搜索栏背景 |
| Text Primary | `#1C1B1F` | 标题、正文 |
| Text Secondary | `#5E5E5E` | 未选中 Tab、辅助文字 |
| Text Tertiary | `#707070` | 搜索栏 placeholder、地址 |
| Text Quaternary | `#867F7F` | 元信息、报告人数 |
| Border Light | `#F3F2F2` | 列表分隔线 |
| Border Medium | `#D9D9D9` | 搜索栏选中态边框 |
| Shadow Light | `0px 1px 2px rgba(0,0,0,0.25)` | 小按钮、Pill |
| Shadow Medium | `0px 4px 4px rgba(0,0,0,0.25)` | 搜索栏 |
| Shadow Heavy | `0px 4px 12px rgba(0,0,0,0.25)` | 大 FAB 按钮 |
| Radius Pill | `44px` | 主/次按钮 |
| Radius Search | `40px` | 搜索栏 |
| Radius Small | `24px` | Pill 标签、图标容器 |
| Radius Icon | `20px` | 圆形图标背景 |
| Font Family | `Roboto` | 全局字体 |
| Font Title | `15-20px / 500-600` | 按钮标签、搜索结果 |
| Font Body | `14-16px / 400` | 列表项、地址 |
| Font Caption | `11-12px / 400-500` | Tab 标签、元信息 |
| Route Path | `#2985FF` dashed 5px | 导航路线虚线 |
| Direction Cone | `linear-gradient(233deg, rgba(11,103,225,0) 42%, rgba(99,166,255,0.58) 99%)` | 用户定位方向锥体 |
| Tab Selected | `#1761D7` | Tab 选中文字 + 底部 3px 指示条 |
| Tab Inactive | `#7F7F7F` | Tab 未选中文字 |
| Sheet Handle | `#C5C6CD`, 73×4px, radius 12px | BottomSheet 拖拽把手 |
| Input Border | `#D3D3D3` | From/To 输入框边框 |
| List Icon Blue | `#1B6EF3` | 列表项蓝色图标 |
| Transit Teal | `#007B83` | 公交/地铁图标背景色 |

## 组件映射表

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

## 图标体系

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

## 布局参考尺寸

| 元素 | 高度 | 内边距 | 间距 |
|------|------|--------|------|
| Search Bar | 48px (primary) / 44px (result) | 8px 12px | gap 16px |
| Bottom Nav | 89px (含安全区36px) | 4px 8px | tab 等分 |
| Pill Tag | 32px | 6px 12px 6px 8px | gap 4px |
| Primary Button | 43px | 12px 18px 12px 16px | gap 6px |
| Round FAB Large | 58px | 16px | — |
| Round FAB Small | 40px | 8px | — |
| List Item (address) | 72px | 0 0 0 12px | gap 20px |
| List Item (no address) | 59px | 0 0 0 12px | gap 20px |
| Tab Bar | 36px | 0 12px | gap 24px |
| Bottom Sheet Handle | 4px | — | width 73px, radius 12px |
| Navigation Input | 43px | 12px 8px | gap 4px |
| Transportation Chip | 28px | 4px 12px~16px | gap 6px |

## 页面级布局模式

### Explore（探索首页）

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

### Search（搜索结果页）

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

### Navigate to（导航规划页）

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

### Business（商户详情页）

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

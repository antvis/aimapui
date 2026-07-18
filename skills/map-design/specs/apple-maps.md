# Apple Maps 设计语言规范

基于 Apple Maps iOS 原生应用的设计语言提炼，作为 aimapui 地图应用的设计参考。

## 一、Design Tokens

### 1.1 颜色系统 (Color Palette)

#### 主色调

| Token | 色值 | 用途 |
|-------|------|------|
| Blue Primary | `#0088FF` | 主交互色：按钮、链接、选中态 |
| Blue Primary (Dark) | `#0C79FE` | 地图 Pin 标记 |
| Blue Pressed | `rgba(0, 136, 255, 0.08)` | 次级按钮背景（Bezeled 态） |
| Blue Tinted | `rgba(0, 136, 255, 0.12)` | 大按钮背景（Share/Report/Mark） |

#### 功能色

| Token | 色值 | 用途 |
|-------|------|------|
| Red Status | `#FF383C` | 营业状态：已关闭 (Closed)、错误 |
| Red Text | `#AC480C` | 位置标注标签文字 |
| Location Gradient Start | `#FFA62B` | 定位标记渐变起始 |
| Location Gradient End | `#FF5D00` | 定位标记渐变结束 |
| Location Pin Base | `#F19B3F` | 地点标记底色 |
| Location Pin Dot | `#FF5C00` | 地点标记中心点 |

#### 中性色 / 表面色

| Token | 色值 | 用途 |
|-------|------|------|
| Surface White | `#FFFFFF` | 卡片、面板表面色 |
| Surface Light | `#F5F6F3` | 详情面板底部底色 |
| Surface Gray | `#E6E5E5` | 次要操作按钮背景（Add/More Photo） |
| Separator | `#BDBDBD` | 分割线 (0.5px or 1px) |

#### 文本色

| Token | 色值 | 用途 |
|-------|------|------|
| Text Primary | `#000000` | 标题、正文 |
| Text Secondary | `#868782` | 副标题、标签、说明文字 |
| Text Tertiary | `#7A7B78` | 箭头图标、辅助文字 |
| Text Link | `#0088FF` | 可点击电话号码 |
| Text On Dark | `#FFFFFF` | 深色背景上的文字（按钮内） |

#### Liquid Glass 专用色

| Token | 色值 | 用途 |
|-------|------|------|
| Glass Fill Light | `linear-gradient(0deg, rgba(245,245,245,0.4), rgba(245,245,245,0.4)), #0F0F0F` | 亮色模式玻璃态填充 |
| Glass Fill Panel | `linear-gradient(0deg, rgba(245,245,245,0.2), rgba(245,245,245,0.2)), rgba(15,15,15,0.2)` | 面板玻璃态填充 |
| Glass Blend | `normal, color-dodge` | 玻璃态混合模式 |
| Base Fill Overlay | `rgba(245, 245, 245, 0.1)` | 工具栏底部叠加层 |

#### 渐变

| Token | 色值 | 用途 |
|-------|------|------|
| Avatar Gradient | `linear-gradient(180deg, #A0C2E4 0%, #717FBE 100%)` | 头像背景 |
| Car Icon Gradient | `linear-gradient(180deg, #38AEFF 0%, #0C79FE 100%)` | 导航图标背景 |
| Orange Gradient | `linear-gradient(180deg, #FFA000 0%, #F64900 100%)` | 橙色调图标背景 |
| Guide Card Gradient | `linear-gradient(180deg, #E9E9E9 0%, #FDFDFC 100%)` | 指南卡片淡色背景 |
| Guide Card Yellow | `linear-gradient(180deg, #FFF6C8 0%, #FDFDFC 100%)` | 指南卡片暖色背景 |
| Pin Radial Glow | `radial-gradient(50% 50% at 50% 50%, #579DFF 0%, rgba(87,196,255,0) 100%)` | 地图 Pin 光晕 |
| Scroll Fade Top | `linear-gradient(180deg, rgba(246,245,243,0.98) 0%, rgba(235,236,234,0.04) 100%)` | 顶部滚动渐变遮罩 |
| Scroll Fade Bottom | `linear-gradient(180deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.38) 100%)` | 底部滚动渐变遮罩 |
| StatusBar Fade | `linear-gradient(180deg, rgba(217,217,217,0.26) 0%, rgba(217,217,217,0) 100%)` | 状态栏背景渐变 |

### 1.2 字体系统 (Typography)

字体族：**SF Pro**（系统字体），按场景选用变体：

| 变体 | 用途 |
|------|------|
| SF Pro | 通用 UI 文字 |
| SF Pro Text | 状态栏时间 |
| SF Pro Display | 电话、地址等详情信息 |
| SF Pro Rounded | 温度等仪表盘数字 |

#### 字号层级

| 层级 | 尺寸 | 字重 | 行高 | 用途 |
|------|------|------|------|------|
| Large Title | 28px | 700 | 33px | POI 详情页大标题 |
| Title | 20px | 590 | 24px | Section 标题 (Ratings, Hours, Good to Know) |
| Title 2 | 19px | 700 | 23px | 导航栏/检索列表标题 |
| Body | 17px | 400/510 | 20px | 正文、列表项标题 |
| Body Link | 17px | 500 | 20px | 可点击电话号码（SF Pro Display） |
| Caption | 16px | 590 | 19px | 状态值、百分比数据 |
| Caption 2 | 15px | 400/510 | 18px | 副文本、标签 (Phone, Address) |
| Small Caption | 13px | 590/700 | 16px | 按钮标签 (Directions, Call, Website) |
| Micro | 12px | 700 | 14px | 图标辅助文字 |
| Tiny | 11px | 700 | 13px | 极小按钮文字 (Add photo) |

#### 字间距 (Letter Spacing)

| 场景 | 值 |
|------|------|
| 标题/正文 | `-0.8px` |
| 按钮/标签 | `-0.5px` or `-0.4px` |
| 状态栏时间 | `-0.3px` |

### 1.3 圆角系统 (Border Radius)

| 尺寸 | 用途 |
|------|------|
| 2px | 小图标内边框（如 Apple Pay icon border） |
| 4px | Grabber 拖拽手柄 |
| 12px | 温度小组件 |
| 14px | Actions 按钮 (Directions/Call/Website) |
| 16px | 图标圆形背景 |
| 18px | 头像 (小型) |
| 22px | 照片添加按钮、搜索框 |
| 24px | 工具栏、导航按钮、卡片容器、圆形图标背景 |
| 26px | 大号圆角按钮 (Rate, Share, Report) |
| 28px | 头像 (大型) |
| 36px | 底部面板 (Bottom Sheet Panel) 顶部圆角 |
| 41px | 超大图标背景 |

### 1.4 阴影系统 (Box Shadow)

| 场景 | 参数 |
|------|------|
| Glass 面板 | `0px 4px 32px rgba(0, 0, 0, 0.16)` |
| Glass 按钮 (浅) | `0px 4px 32px rgba(0, 0, 0, 0.08)` |
| 定位标记 | `drop-shadow(0px 4px 16px rgba(0, 0, 0, 0.24))` |

### 1.5 间距系统 (Spacing)

| Token | 值 | 用途 |
|-------|------|------|
| xs | 2px | 图标与文字间距 |
| sm | 4px | 标签间距 |
| md | 8px | 元素间距、按钮间距 |
| lg | 12px | 卡片内边距、图标间距 |
| xl | 16px | 模块间距、面板内边距 |
| 2xl | 24px | Section 之间间距 |
| 3xl | 28px | 工具栏图标间距 |

---

## 二、布局系统 (Layout)

### 2.1 画布基准

- 基准设计宽度：**375px**（iPhone X / 11 Pro）
- 基准设计高度：**812px**
- 内容安全区左右边距：**16px**（内容宽度 343px）

### 2.2 页面级布局模式

#### 模式 A：地图浏览 (Map Browse)

```
┌─────────────────────────────┐
│  Status Bar (transparent)   │  ← 系统状态栏
├─────────────────────────────┤
│  ┌──┐                 ┌──┐  │  ← 导航按钮 (44×44 glass)
│  │ T│                 │ ⋮│  │     + 温度小组件 (60×32)
│  └──┘                 └──┘  │
│                             │
│           ┌──┐              │  ← Pin 标记 (16×16)
│      ┌────┤  ├────┐         │     带径向渐变光晕 (86×86)
│      │    └──┘    │         │
│      │  光晕区域  │         │
│      └───────────┘         │
│                   ┌──────┐  │  ← 垂直工具栏 (48×95)
│                   │  🔭   │  │     探索/定位 竖向排列
│                   │  📍   │  │
│                   └──────┘  │
│                             │
│ ┌─────────────────────────┐ │  ← 底部搜索栏 (332×66)
│ │  🔍 Search Places   🎤 👤│ │     liquid glass bar
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**组件列表：**
- Status Bar：透明 + 渐变遮罩
- Temperature Widget：左上角，60×32px，glass pill
- Navigation Buttons：左右上角各一个 44×44 glass 按钮（关闭/信息）
- Pin Marker：中央，蓝点 + 光晕
- Vertical Container：右侧，48×95px，glass，探索/定位
- Bottom Search Bar：底部，332×66px，glass，含搜索/麦克风/头像

#### 模式 B：地点详情卡片 (Place Card / Half Sheet)

```
┌─────────────────────────────┐
│  Status Bar (transparent)   │
├─────────────────────────────┤
│  ┌──┐ ───── ─── ───── ┌──┐  │  ← 导航栏
│  │ <│  Place Name  Bar │ ⋮│ │     标题居中，关闭/更多按钮
│  └──┘                 └──┘  │
│                             │
│ ┌─────────────────────────┐ │
│ │  ━━━━━━ (Grabber)      │ │  ← 拖拽手柄 48×4px
│ ├─────────────────────────┤ │
│ │  [Directions][Call][Web]│ │  ← Actions (109×53 ×3)
│ ├─────────────────────────┤ │
│ │  Status  Distance  $$$  │ │  ← Info Stats Row
│ ├─────────────────────────┤ │
│ │  [Photo1] [Photo2] [+] │ │  ← Photo Gallery (176×176)
│ ├─────────────────────────┤ │
│ │  ----- Ratings -----    │ │  ← 评分细分列表
│ │  ⭐ Overall    100%     │ │
│ │  ⭐ Food       98%      │ │
│ │  ⭐ Service    99%      │ │
│ │  ⭐ Atmosphere 100%     │ │
│ ├─────────────────────────┤ │
│ │  [  Rate This Place  ]  │ │  ← CTA 按钮
│ ├─────────────────────────┤ │
│ │  ----- Good to Know --- │ │
│ │   Accepts Apple Pay    │ │
│ │  📱 Contactless         │ │
│ ├─────────────────────────┤ │
│ │  ----- Hours ---------  │ │  ← 营业时间（可展开）
│ │  Today  Closed           │ │
│ │  Tue-Sat 17:00-02:00    │ │
│ │  Sun     17:00-04:00    │ │
│ ├─────────────────────────┤ │
│ │  ----- Details -------- │ │
│ │  Phone  +375 (17)...    │ │  ← 电话/地址
│ │  Address  Октябрьская.. │ │
│ ├─────────────────────────┤ │
│ │  [  Report an Issue  ]  │ │  ← 系统操作
│ │  [  Pin / Favorite   ]  │ │
│ │  [  Claim This Place ]  │ │
│ └─────────────────────────┘ │
│                             │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐   │  ← 底部工具栏 (Tab Bar)
│  │   │ │   │ │   │ │   │   │     liquid glass
│  └───┘ └───┘ └───┘ └───┘   │
└─────────────────────────────┘
```

**组件列表（从上到下）：**
1. **Contetn Header**：地点名称 (19px/700) + 类别标签 (13px/590 gray)
2. **Grabber**：拖拽手柄 48×4px，半透明黑色
3. **Actions Row**：3 个并排按钮 (Directions 高亮 / Call / Website)
4. **Info Stats**：Status + 步行距离百分比 + 价格等级 + 驾车距离
5. **Photo Gallery**：2 张照片 (176×176, radius 26px) + Add/More 按钮
6. **Ratings**：Section 标题 + 分类评分列表 + Rate 按钮
7. **Good to Know**：Section 标题 + 图标文字对
8. **Hours**：Section 标题 + 每日营业时间列表（Today 状态红标）
9. **Details**：Section 标题 + Phone/Address 行
10. **System Actions**：Report / Mark / Claim 按钮
11. **Bottom Toolbar**：4 图标 tab bar，liquid glass

#### 模式 C：搜索/收藏页 (Search & Favorites)

```
┌─────────────────────────────┐
│  Status Bar + Search Bar    │  ← TopBar (含 avatar)
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │  ━━━━━━ (Grabber)      │ │
│ ├─────────────────────────┤ │
│ │  Favorites              │ │
│ │  ┌───────────────────┐  │ │
│ │  │ 🚗 Home    31 min  > │ │  ← 收藏条目卡片
│ │  ├───────────────────┤  │ │
│ │  │ 🚗 Work    45 min  > │ │
│ │  ├───────────────────┤  │ │
│ │  │ 🚗 Gym     22 min  > │ │
│ │  └───────────────────┘  │ │
│ ├─────────────────────────┤ │
│ │  Recents →              │ │
│ │  ┌───────────────────┐  │ │
│ │  │ 🚗 Cafe     12 min > │ │
│ │  ├───────────────────┤  │ │
│ │  │ 🚗 Park     18 min > │ │
│ │  ├───────────────────┤  │ │
│ │  │ 🚗 Airport  40 min > │ │
│ │  └───────────────────┘  │ │
│ ├─────────────────────────┤ │
│ │  Guides →               │ │
│ │  ┌────────┐ ┌────────┐  │ │  ← 指南卡片 (168×223)
│ │  │ 📖     │ │ 📸     │  │ │
│ │  │ Guide 1│ │ Guide 2│  │ │
│ │  └────────┘ └────────┘  │ │
│ └─────────────────────────┘ │
│                             │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐   │  ← Tab Bar
│  └───┘ └───┘ └───┘ └───┘   │
└─────────────────────────────┘
```

---

## 三、核心组件规范

### 3.1 Liquid Glass 效果

Apple Maps 最显著的视觉特征，所有浮层控件采用此效果。

```css
/* 标准 Glass 按钮 */
.glass-button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 14px;
  isolation: isolate;
  background: rgba(0, 0, 0, 0.004);
  box-shadow: 0px 4px 32px rgba(0, 0, 0, 0.16);
  border-radius: 24px;
}

/* Glass 按钮 - Fill 层 */
.glass-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    0deg,
    rgba(245, 245, 245, 0.4),
    rgba(245, 245, 245, 0.4)
  ), #0F0F0F;
  background-blend-mode: normal, color-dodge;
  z-index: 0;
}

/* Glass 面板 */
.glass-panel {
  background: rgba(0, 0, 0, 0.004);
  box-shadow: 0px 4px 32px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(16.25px);
  border-radius: 36px;
}

/* Glass 面板 - Fill 层 */
.glass-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    0deg,
    rgba(245, 245, 245, 0.2),
    rgba(245, 245, 245, 0.2)
  ), rgba(15, 15, 15, 0.2);
  background-blend-mode: normal, color-dodge;
  backdrop-filter: blur(21.65px);
}
```

**关键参数：**
- 背景基准透明度：`rgba(0, 0, 0, 0.004)`（几乎透明，但提供 box-shadow 的基准）
- 填充层：白色半透明 + 深色底，`color-dodge` 混合
- 模糊量：按钮 `blur(4.05px)`，面板 `blur(16.25px)` ~ `blur(21.65px)`
- 面板底部叠加层：`rgba(245, 245, 245, 0.1)`

### 3.2 Pin 标记 (Map Pin)

#### 搜索 Pin（蓝点）

```css
.pin-marker {
  position: relative;
  width: 86px;
  height: 88px;
}

/* 径向渐变光晕 */
.pin-glow {
  position: absolute;
  width: 86px;
  height: 86px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    50% 50% at 50% 50%,
    #579DFF 0%,
    rgba(87, 196, 255, 0) 100%
  );
}

/* 蓝点核心 */
.pin-dot {
  position: absolute;
  width: 16px;
  height: 16px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: #0C79FE;
  border: 4px solid #FFFFFF;
  border-radius: 50%;
}
```

**尺寸规格：**
- 光晕容器：86×86px
- 蓝点：16×16px
- 白色边框：4px
- 光晕颜色：`#579DFF` → 透明

#### 地点标注 Pin（橙色）

- 图标容器：67.2×84px
- 橙色渐变背景：`linear-gradient(180deg, #FFA62B 0%, #FF5D00 100%)`
- 圆形：63.84px，带白色边框 2.24px
- 内部白色图标：29.72×31.36px
- 底部阴影：`drop-shadow(0px 4px 16px rgba(0, 0, 0, 0.24))`
- 文字标签：12px/700，颜色 `#AC480C`，白色边框

### 3.3 搜索栏 (Search Bar)

三种尺寸规格，适应不同布局场景。

| 属性 | Size 1 (小) | Size 2 (中) | Size 3 (大) |
|------|------------|------------|------------|
| 高度 | 38px | 44px | 44px |
| 背景 | `rgba(120,120,128,0.08)` + blur | `rgba(0,0,0,0.04)` | `#FAFCF9` + border + shadow |
| 圆角 | 22px | 22px | 22px |
| 内边距 | 10px 12px | 12px | 12px |
| placeholder 颜色 | `#6C6C6C` | `#88898B` | `#88898B` |
| placeholder 字号 | 15px/510 | 17px/510 | 17px/510 |
| 使用场景 | 地图浏览（底部 bar 内） | 搜索/收藏页顶部 | 搜索结果页顶部（带阴影） |

**左附件 (Left Accessory)：**
- 搜索图标：20×20px（中/大），18×18px（小）
- 图标颜色：`#6C6C6C` / `#88898B`

**右附件 (Right Accessory)：**
- Size 1：麦克风图标 + 头像 (38×38px, gradient avatar)
- Size 2/3：语音输入图标 + 头像 (44×44px)

### 3.4 头像 (Avatar)

```css
.avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, #A0C2E4 0%, #717FBE 100%);
  border-radius: 18px; /* 小号 */ /* or 28px for 大号 */
}

/* 小号: 38×38, 圆角 18px, 文字 18px/700 */
/* 大号: 44×44, 圆角 28px, 文字 19px/700 */
.avatar-initials {
  color: #FFFFFF;
  font-family: 'SF Pro';
  font-weight: 700;
}
```

### 3.5 底部工具栏 (Bottom Tools / Tab Bar)

```css
.tools-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 14px 16px;
  gap: 28px;
  isolation: isolate;
  background: rgba(245, 245, 245, 0.4);
  box-shadow: 0px 4px 32px rgba(0, 0, 0, 0.16);
  border-radius: 24px;
}

.tools-bar-fill {
  position: absolute;
  inset: 0;
  background: rgba(245, 245, 245, 0.1);
}
```

**三种尺寸变体：**

| 变体 | 宽度 | 图标数 | 图标尺寸 |
|------|------|--------|----------|
| tools 4 | 212px | 4 个 | 24×20px |
| tools 3 | 160px | 3 个 | 24×20px |
| tools 2 | 108px | 2 个 | 24×20px |

- 图标颜色：`#211906`（深色）
- 图标字体：SF Pro 22px/400, letter-spacing: -0.5px
- 间距：28px
- 距底部：26px（有底部安全区时）

### 3.6 垂直工具栏 (Vertical Container)

```css
.vertical-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  gap: 16px;
  isolation: isolate;
  width: 48px;
  height: 95px;
  background: rgba(0, 0, 0, 0.004);
  box-shadow: 0px 4px 32px rgba(0, 0, 0, 0.16);
  border-radius: 24px;
}
```

- 包含 2 个图标：探索（望远镜）、定位（蓝标高亮 `#0088FF`）
- 图标尺寸：28×20px，SF Pro 18px/590
- 位置：右侧，距底约 378px

### 3.7 温度小组件 (Temperature Widget)

```css
.temperature-widget {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 14px 0;
  gap: 2px;
  isolation: isolate;
  width: 60px;
  height: 32px;
  background: rgba(0, 0, 0, 0.001);
  box-shadow: 0px 4px 32px rgba(0, 0, 0, 0.16);
  border-radius: 12px;
}
```

- 位置：左上角 left: 16px, top: 50px
- 天气图标：22×19px，颜色 `#D1D1D5`，SF Pro 16px/400
- 温度文字：SF Pro Rounded 18px/500，颜色 `#000000`

### 3.8 底部面板 / Favorites 面板 (MadalFavorites)

```css
.madal-favorites {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  background: #F5F6F3;
  box-shadow: 0px 4px 32px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(16.25px);
  border-radius: 36px;
}
```

**两种尺寸：**

| 变体 | 宽度 | 高度 | 使用场景 |
|------|------|------|----------|
| Compact | 363px | 355px | 地图浏览页，底部分面板 |
| Full | 375px | 756px | POI 详情页，全高面板 |

- 顶部 Grabber：48×4px, `rgba(0,0,0,0.2)`, 圆角 4px, top: 6px
- 填充层：Glass panel fill（半透明白 + color-dodge）

### 3.9 Actions 按钮组

```css
.action-primary {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  gap: 2px;
  width: 109px;
  height: 53px;
  background: #0088FF;
  border-radius: 14px;
}

.action-secondary {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  gap: 2px;
  width: 109px;
  height: 53px;
  background: rgba(0, 136, 255, 0.08);
  border-radius: 14px;
}
```

- 图标：16px SF Pro, 590 weight
- 标签：13px SF Pro, 590/700 weight
- 三个按钮等宽（109px），间距 8px
- Primary 为蓝色实心，Secondary 为蓝色淡底 + 蓝字

### 3.10 Info Stats Row (状态信息行)

水平排列 4 个信息模块，间距 28px。

| 模块 | 宽度 | 内容 |
|------|------|------|
| Status | 102px | "Closed"/"Open" 标签 + 实际状态值（红/绿色） |
| Distance (walk) | 65px | 步行图标 + 百分比 |
| Price | 50px | $ 符号包裹 + 价格等级 |
| Distance (drive) | 79px | 驾车图标 + 公里数 |

- 标签：13px/590, 颜色 `#868782`
- 数值：16px/590 或 16px/700
- 状态红色：`#FF383C`（Closed Today）

### 3.11 照片画廊 (Photo Gallery)

```css
.photo-card {
  width: 176px;
  height: 176px;
  border-radius: 26px;
  background: linear-gradient(0deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(...);
}

.photo-label {
  font-family: 'SF Pro';
  font-weight: 590;
  font-size: 17px;
  line-height: 20px;
  color: #FFFFFF;
  letter-spacing: -0.8px;
  padding: 12px 14px;
}

.add-photo-button {
  width: 104px;
  height: 82px;
  background: #E6E5E5;
  border-radius: 22px;
  /* 垂直排列：图标 + 文字 */
}
```

- 2 张照片并排 (176×176px) + 2 个操作按钮竖排 (104×82px ×2)
- 照片间距：12px
- Add/More 按钮背景：`#E6E5E5`，蓝色图标 + 蓝色文字

### 3.12 评分区域 (Ratings)

```css
.rating-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  gap: 12px;
  height: 41px;
}

.rating-name {
  font-weight: 510;
  font-size: 17px;
  color: #000000;
}

.rating-count {
  font-weight: 400;
  font-size: 15px;
  color: #868782;
}

.rating-score {
  font-weight: 700;
  font-size: 27px;
  color: #000000;
}
```

- Section 标题：20px/590, "Ratings"
- 每行：图标(32×32) + 内容(标题+副标题) + 评分(星+百分比)
- Rate This Place 按钮：全宽，蓝色淡底，圆角 26px

### 3.13 Good to Know

- Section 标题：20px/590, "Good to Know"
- 图标+文字行：18px 图标 + 17px/400 文字
- 支持场景：Accepts Apple Pay、Contactless Payments 等

### 3.14 营业时间 (Hours)

```css
.hours-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 8px;
  border-bottom: 1px solid #BDBDBD;
}

.hours-title { font-size: 20px; font-weight: 590; }
.hours-edit { font-size: 15px; color: #008BFF; }
.hours-today-status { font-size: 17px; color: #FF383C; } /* Closed */
.hours-day-label { font-size: 17px; color: #000000; }
.hours-time { font-size: 17px; color: #000000; }
```

- Today 显式状态（红色表示 Closed）
- 按日展开：标签 (Mon, Tue-Sat, Sun) + 时间
- 支持编辑（Edit 链接）

### 3.15 详情 (Details)

- Phone 行：标签 "Phone" (15px/400, gray) + 号码 (17px/500, blue link)
- Address 行：标签 "Address" + 地址 (17px/400, right-aligned)
- 分割线：0.5px solid `#BDBDBD`

### 3.16 系统操作按钮 (System Actions)

```css
.system-action-button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 10px;
  gap: 10px;
  width: 343px;
  height: 52px;
  background: rgba(0, 136, 255, 0.12);
  border-radius: 26px;
}
```

- 3 个全宽按钮，垂直排列，间距 8px
- 按钮顺序：Report an Issue → Mark/Favorite → Claim This Place
- 文字：17px/590, 颜色 `#0088FF`
- 左侧图标：18px, SF Pro

### 3.17 导航按钮 (Navigation Buttons)

```css
.nav-button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px;
  isolation: isolate;
  width: 44px;
  height: 44px;
  background: rgba(0, 0, 0, 0.004);
  box-shadow: 0px 4px 32px rgba(0, 0, 0, 0.08);
  border-radius: 24px;
}
```

- 关闭按钮（×）：右侧 top: 16px, right: 16px
- 返回按钮（‹）：左侧 top: 16px, left: 16px
- 图标：SF Pro 19px/590, 颜色 `#211906`

### 3.18 指南卡片 (Guide Cards)

```css
.guide-card {
  display: flex;
  flex-direction: column;
  width: 168px;
  height: 223px;
  border-radius: 24px;
}

.guide-card-image {
  width: 168px;
  height: 152px;
  background: linear-gradient(180deg, #E9E9E9 0%, #FDFDFC 100%);
  /* 或 #FFF6C8 → #FDFDFC for warm tone */
}

.guide-card-content {
  padding: 14px 16px 16px;
  gap: 3px;
  background: #FDFDFC;
}
```

- 标题：17px/590
- 副标题：15px/400, 颜色 `#868782`
- 右上角更多按钮：28×28px, `#828283` 背景, 白色图标

---

## 四、Z-Index 层级规范

Apple Maps 的视觉叠加顺序（从底到顶）：

| 层级 | 组件 | CSS 特征 |
|------|------|----------|
| 0 (Base) | Map Image | 地图底图 |
| 1 | Pin 标记 + 光晕 | 居中定位 |
| 2 | 温度小组件 | top-left 浮动 |
| 3 | 导航按钮 (关闭/返回) | 左右上角浮动 |
| 4 | 垂直工具栏 (探索/定位) | right 浮动 |
| 5 | 底部搜索/Tab Bar | bottom 固定 |
| 6 | 底部面板 (MadalFavorites) | bottom sheet，圆角 36px |
| 7 | Grabber (拖拽手柄) | 面板顶部 |
| 8 | 滚动渐变遮罩 (Scroll Fade) | 面板内顶部/底部渐变 |
| 9 | Status Bar | top: 0 固定，渐变背景 |

**aimapui 映射建议：**
- 地图层使用 L7 地图默认 z-index
- Glass 组件使用 `z-index` 逐级递增
- Bottom Sheet 面板使用最高 z-index

---

## 五、交互状态规范

### 5.1 按钮交互态

| 状态 | Primary Button | Secondary Button | System Button |
|------|---------------|-----------------|---------------|
| Default | `#0088FF` 实心 | `rgba(0,136,255,0.08)` | `rgba(0,136,255,0.12)` |
| Pressed | 加深蓝色 | 背景加深 | 背景加深 |
| 文字色 | `#FFFFFF` | `#0088FF` | `#0088FF` |

### 5.2 面板交互

- **拖拽手柄**：48×4px，半透明黑 `rgba(0,0,0,0.2)`
- **上滑展开**：从 Compact (355px) → Full (756px)
- **滚动渐变**：顶部和底部各 84px 渐变遮罩
- **关闭**：点击关闭按钮或下滑面板

### 5.3 链接/可操作文字

- 电话号码：`#0088FF`, 17px/500 (SF Pro Display)
- "Edit" 链接：`#008BFF`, 15px/510
- "Add" 标签：`#0088FF`, 13px/400

---

## 六、与 aimapui 组件映射

| Apple Maps 组件 | aimapui 推荐组件 | 说明 |
|----------------|-----------------|------|
| Pin 标记 | `Marker` (L7) | 自定义 Marker 实现蓝点+光晕 |
| 底部面板 (Favorites/Details) | `Popup` / `Panel` | 需自定义实现 BottomSheet 拖拽 |
| Search Bar | 自定义组件 / `SearchBox` | 需实现 Glass 效果 |
| Tab Bar | `MapToolbar` | 按钮数按场景调整 |
| Actions 按钮组 | 自定义 Button Group | 3 个等宽按钮 |
| Photo Gallery | 自定义 Image Grid | - |
| Ratings | 自定义 List | Star + 百分比 |
| Hours | `CollapsibleList` | 展开/折叠日程 |
| Liquid Glass 效果 | CSS 自定义 | 使用 backdrop-filter + color-dodge |
| 温度小组件 | 自定义 Widget | 天气数据 + Glass pill |
| 垂直工具栏 | `MapControls` 自定义 | 竖向排列 |

---

## 七、文件引用

- 源设计规范文件：`.codefuse/apple.md`（Apple Maps 完整界面 CSS 规范）
- 元素级规范文件：`.codefuse/apple_element.md`（Pin、Tools、TopBar 组件的 CSS 规范）
- 技术实现规范：`skills/map-design/specs/technical.md`
- Google Maps 对比规范：`skills/map-design/specs/google-maps-mobile.md`
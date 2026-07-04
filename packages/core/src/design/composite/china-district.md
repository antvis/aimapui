# 行政区划下钻图层 (ChinaDistrict) 设计规范

本规范定义了中国行政区划下钻图层的视觉表现、交互逻辑与数据绑定机制，旨在提供从省级到区县级的多级地理数据可视化方案。

---

## 1. 层级体系 (Administrative Hierarchy)

### 1.1 三级行政架构
- **省级 (Province)**: 34 个省级行政区（含直辖市、自治区、特别行政区）
- **市级 (City)**: 地级市、地区、自治州、盟
- **区县级 (District)**: 市辖区、县级市、县、自治县、旗、自治旗

### 1.2 下钻路径
- 默认路径: 省 → 市 → 区县
- 支持受控模式 (`drillPath`) 与内部状态模式
- 下钻时自动 fitBounds 到当前区域范围

---

## 2. 视觉规范 (Visual Specifications)

### 2.1 填充色阶 (Choropleth)
- **业务数据绑定**: 通过 `valueField` 关联数值字段，自动映射色阶
- **默认色板**: 5 级蓝色渐变 `['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb']`
- **无数据区域**: 使用色板中间值 `#3b82f6` 或自定义 `noDataColor`
- **填充透明度**: 默认 `0.8`，可通过 `fillOpacity` 调整

### 2.2 边界线 (Borders)
- **省级**: 默认 `1px` 实线，颜色 `rgba(255,255,255,0.3)`
- **市/区级**: 线宽自动缩减为省级的 `0.6` 倍，避免视觉拥挤
- **九段线**: 省级视图下单独绘制，颜色 `#94a3b8`，线宽 `1px`

### 2.3 下钻背景 (Drill Background)
- **父级虚化**: 下钻时，上级行政区以半透明灰色 (`#94a3b8`, opacity `0.3`) 作为背景
- **父级边界**: 极淡描边 `rgba(148,163,184,0.2)`，线宽 `0.5px`
- **作用**: 提供空间上下文，避免用户迷失位置

### 2.4 文字标注 (Labels)
- **字体**: `PingFang SC, Microsoft YaHei, sans-serif`
- **字号**: 默认 `12px`，可通过 `labelSize` 调整
- **光晕**: 2px 白色描边 (`strokeWidth: 2`)，确保深色填充区可读
- **碰撞检测**: 开启 `textAllowOverlap: false`，重叠时隐藏低优先级标签
- **质心定位**: 标签置于多边形几何中心，MultiPolygon 取面积最大子面的质心

---

## 3. 交互行为 (Interaction)

### 3.1 悬停高亮 (Hover)
- **视觉反馈**: 填充色切换为白色 (`#ffffff`)，增强对比
- **可选关闭**: 通过 `hoverHighlight={false}` 禁用

### 3.2 点击选中 (Click Select)
- **视觉反馈**: 填充色切换为深色 (`#0f172a`)
- **切换逻辑**: 再次点击同一区域取消选中
- **可选关闭**: 通过 `clickSelect={false}` 禁用

### 3.3 下钻 (Drill Down)
- **触发条件**: 点击非最深层级（省/市）的行政区
- **动画**: 自动 fitBounds 到新区域，padding `[40,40,40,40]`
- **回调**: `onDrill(path)` 返回完整下钻路径数组
- **受控模式**: 传入 `drillPath` + `onDrill` 实现外部状态管理

### 3.4 Tooltip
- **默认字段**: `[labelField, valueField]`
- **模板**: HTML 表格格式，支持自定义 `tooltipTemplate`
- **样式**: 最小宽度 140px，字号 12px，行高 1.6

---

## 4. 数据绑定 (Data Binding)

### 4.1 GeoJSON 数据源
- **省级**: 内置 CDN 地址（阿里 DataV GeoAtlas）
- **市级/区级**: 根据 adcode 动态加载下级数据
- **自定义**: 支持传入本地 GeoJSON 对象或 URL

### 4.2 业务数据关联
- **joinField**: GeoJSON properties 中的关联字段（默认 `name`）
- **dataJoinField**: 业务数据中的关联字段（默认 `name`）
- **valueField**: 业务数据中的数值字段（默认 `value`）
- **未匹配处理**: 自动赋值为 0，避免色阶映射异常

### 4.3 行政区划码匹配
- **adcode 前缀匹配**: 省级用 2 位前缀，市级用 4 位前缀
- **直辖市特殊处理**: 市级 adcode 与省级相同时，下钻到区县使用 2 位前缀
- **名称模糊匹配**: 去除"省/市/自治区"等后缀后比对
- **parent 字段优先**: 若 GeoJSON 包含 `parent` / `parentName` 字段，优先使用

---

## 5. aimapui 默认实现

`ChinaDistrict` 组件默认封装中已实现：

- 三级行政数据自动加载（CDN + 动态 fetch）
- 业务数据色阶绑定（5 级蓝色渐变）
- 下钻/上钻交互 + 自动 fitBounds
- 父级虚化背景
- 九段线单独绘制
- 文字标注（质心定位 + 2px Halo + 碰撞检测）
- Hover 白色高亮 + Click 深色选中
- 受控/非受控两种下钻模式

```tsx
<ChinaDistrict
  level="province"
  data={businessData}
  joinField="name"
  valueField="gdp"
  colors={['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb']}
  showLabel
  drillEnabled
  onDrill={(path) => console.log(path)}
/>
```

---

*Derived from: Cartographic Precision System v1.2.0 | China Administrative Division Module*

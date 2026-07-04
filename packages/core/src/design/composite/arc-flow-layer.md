# OD 弧线流向图层 (ArcFlowLayer) 设计规范

本规范定义了 Origin-Destination（起终点）弧线流向图的视觉表现、动画逻辑与节点可视化，适用于人口迁徙、物流网络、航班航线等场景。

---

## 1. 弧线形态 (Arc Shapes)

### 1.1 三种弧线类型
| 类型 | 说明 | 适用场景 |
|------|------|---------|
| `arc` | 2D 贝塞尔曲线（默认） | 城市间短中距离流向 |
| `arc3d` | 3D 弧线 | 倾斜视角、增强立体感 |
| `greatcircle` | 大圆航线 | 跨洲长距离（如国际航班） |

### 1.2 弧线基础样式
- **默认颜色**: `#2563EB` (Primary Blue)
- **线宽**: 1.5px，可通过 `lineWidth` 调整
- **透明度**: 0.8
- **模糊度**: 0.6，增加柔和感与视觉层次

---

## 2. 色彩模式 (Color Modes)

### 2.1 单色模式 (single)
- 所有弧线使用同一颜色
- 适合单一类型流向展示

### 2.2 渐变模式 (gradient)
- 起点色 → 终点色线性渐变
- 强化流向方向感
- 配置: `gradientColors={['#93c5fd', '#2563eb']}`

### 2.3 字段映射模式 (field)
- 按数据字段映射色板
- 适合多类别流向区分
- 配置: `colorField="type"` + `colorValues={[...]}`

---

## 3. 线宽映射 (Width Mapping)

### 3.1 权重驱动
- **权重字段**: 默认 `weight`，可通过 `weightField` 自定义
- **映射范围**: `lineWidthRange={[min, max]}`，例如 `[1, 5]`
- **语义**: 线宽越粗表示流量越大，直观反映 OD 强度

### 3.2 固定线宽
- 不传 `lineWidthRange` 时使用固定 `lineWidth`
- 适合均匀流向或强调路径而非流量

---

## 4. 流动动画 (Flow Animation)

### 4.1 粒子/轨迹动画
- **启用**: `animate={true}`
- **速度**: `animateSpeed`，数值越大越快，默认 1
- **尾迹长度**: `animateTrailLength` 0~1，默认 0.3
- **持续时间**: `animateDuration` ms，默认 2000
- **方向**: 从起点流向终点，强化动态感知

### 4.2 动画用途
- 实时流量监控
- 历史流向回放
- 演示/汇报场景增强视觉效果

---

## 5. 节点可视化 (Node Visualization)

### 5.1 节点提取
- 自动从 OD 数据中提取唯一节点（去重）
- 计算每个节点的连接度 (`degree`)

### 5.2 节点样式
- **颜色**: 默认跟随弧线色，可通过 `nodeColor` 自定义
- **大小**: 默认 4px，可通过 `nodeSize` 调整
- **大小映射**: `nodeSizeRange={[min, max]}` 按连接度映射
- **描边**: 1px 白色，增强辨识度
- **透明度**: 0.9

### 5.3 节点脉冲动画 (Pulse)
- **启用**: `nodePulse={true}`
- **效果**: 呼吸式缩放动画，强调枢纽节点
- **速度**: 0.6（较慢，避免视觉干扰）

---

## 6. 交互行为 (Interaction)

### 6.1 弧线 Hover
- **Tooltip**: 显示起点、终点、流量值
- **样式**: 暗色主题 (`variant="dark"`)
- **高亮色**: `activeColor`（默认 `#FFD93D`），hover 时弧线变色
- **可选关闭**: `showTooltip={false}`

### 6.2 节点 Click
- **Popup**: 显示节点名称 + 连接数
- **样式**: 紧凑尺寸，带关闭按钮
- **可选关闭**: `showNodePopup={false}`

### 6.3 事件回调
- `onArcHover`: 弧线 hover 事件
- `onArcClick`: 弧线点击事件
- `onNodeClick`: 节点点击事件

---

## 7. 数据格式 (Data Format)

### 7.1 JSON 数组
```ts
interface ArcFlowDataItem {
  fromLng: number;   // 起点经度
  fromLat: number;   // 起点纬度
  toLng: number;     // 终点经度
  toLat: number;     // 终点纬度
  weight?: number;   // 权重/流量
  fromName?: string; // 起点名称
  toName?: string;   // 终点名称
}
```

### 7.2 字段映射
- 默认字段: `fromLng/fromLat/toLng/toLat`
- 自定义: 通过 `sourceConfig` 覆盖

---

## 8. aimapui 默认实现

`ArcFlowLayer` 组件默认封装中已实现：

- 三种弧线形态（arc/arc3d/greatcircle）
- 三种色彩模式（single/gradient/field）
- 权重驱动线宽映射
- 粒子流动动画（速度/尾迹/时长可配）
- 节点自动提取 + 连接度计算
- 节点大小映射 + 脉冲动画
- 内置 Tooltip（hover 弧线）+ Popup（click 节点）
- Hover 高亮反馈

```tsx
<ArcFlowLayer
  source={odData}
  shape="arc3d"
  colorMode="gradient"
  gradientColors={['#93c5fd', '#2563eb']}
  lineWidthRange={[1, 4]}
  animate
  showNodes
  nodePulse
/>
```

---

*Derived from: Cartographic Precision System v1.2.0 | OD Flow & Network Module*

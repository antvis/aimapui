/**
 * DrawControl 默认样式配置
 *
 * 遵循 GeoEditor Pro 地图绘制与编辑交互规范 (v1.2.0)：
 * - Primary (#24389c) — Canvas UI 主色
 * - Primary-Container (#3f51b5) — 线/面描边色
 * - Tertiary-Fixed-Dim (#ffb95f) — 活动状态/拖拽/吸附指示色（琥珀色）
 *
 * 点: 3px 白色填充 + 1px Primary-Container 描边
 * 点(活动): 5px 琥珀色 + glow 效果
 * 线: 2px Primary-Container 实线; 橡皮筋 1.5px dashed 4-4
 * 面: 20% opacity Primary-Container 填充 + 2px Primary-Container 描边
 * 选中: Primary-Container 描边加粗 + 12% 琥珀色填充
 * 顶点: 3px 白色 + 1px Primary-Container 描边; 拖拽中 5px 琥珀色
 * 中点: 50% 透明度 ghost 点
 */
import type { DrawStyleConfig } from './draw-types';

/** 绘制控件默认样式 — GeoEditor Pro v1.2.0 规范 */
export const DEFAULT_DRAW_STYLES: Required<DrawStyleConfig> = {
  point: {
    color: '#ffffff',
    size: 3,
    strokeColor: '#3f51b5',
    strokeWidth: 1,
  },
  line: {
    color: '#3f51b5',
    size: 2,
    opacity: 1,
  },
  polygon: {
    fill: '#3f51b5',
    fillOpacity: 0.20,
    stroke: '#3f51b5',
    strokeWidth: 2,
  },
  drawing: {
    fill: '#3f51b5',
    fillOpacity: 0.20,
    stroke: '#3f51b5',
    strokeWidth: 2,
    dashStroke: '#3f51b5',
    dashWidth: 1.5,
    dashArray: [4, 4],
  },
  selected: {
    stroke: '#3f51b5',
    strokeWidth: 3,
    fill: '#ffb95f',
    fillOpacity: 0.12,
    dashArray: [6, 3],
  },
  vertex: {
    color: '#ffffff',
    size: 3,
    strokeColor: '#3f51b5',
    strokeWidth: 1,
    activeColor: '#ffb95f',
    activeSize: 5,
  },
};

/** 合并用户自定义样式与默认样式 */
export function mergeDrawStyles(userStyles?: DrawStyleConfig): Required<DrawStyleConfig> {
  if (!userStyles) return { ...DEFAULT_DRAW_STYLES };

  return {
    point: { ...DEFAULT_DRAW_STYLES.point, ...userStyles.point },
    line: { ...DEFAULT_DRAW_STYLES.line, ...userStyles.line },
    polygon: { ...DEFAULT_DRAW_STYLES.polygon, ...userStyles.polygon },
    drawing: { ...DEFAULT_DRAW_STYLES.drawing, ...userStyles.drawing },
    selected: { ...DEFAULT_DRAW_STYLES.selected, ...userStyles.selected },
    vertex: { ...DEFAULT_DRAW_STYLES.vertex, ...userStyles.vertex },
  };
}

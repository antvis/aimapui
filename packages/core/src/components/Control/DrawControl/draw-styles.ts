/**
 * DrawControl 默认样式配置
 *
 * 遵循 GeoEditor Pro 地图绘制与编辑交互规范：
 * - 品牌色 (Primary): #3f51b5 — 用于已完成要素和绘制中的实线/虚线
 * - 强调色 (Warning): #ffc107 — 用于活动顶点、选中高亮、编辑句柄
 * - 固定点: 3px 白色圆点 + 1px 蓝色描边
 * - 活动点: 5px 琥珀色圆点 + 外发光
 */
import type { DrawStyleConfig } from './draw-types';

/** 绘制控件默认样式 — GeoEditor Pro 规范 */
export const DEFAULT_DRAW_STYLES: Required<DrawStyleConfig> = {
  point: {
    color: '#3f51b5',
    size: 6,
    strokeColor: '#ffffff',
    strokeWidth: 2,
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
    stroke: '#ffc107',
    strokeWidth: 2.5,
    fill: '#ffc107',
    fillOpacity: 0.12,
    dashArray: [6, 3],
  },
  vertex: {
    color: '#ffffff',
    size: 3,
    strokeColor: '#3f51b5',
    strokeWidth: 1,
    activeColor: '#ffc107',
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

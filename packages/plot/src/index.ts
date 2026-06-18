/**
 * @antv/aimapui-plot
 * 态势标绘组件库 — 矩形/圆形/扇形/箭头等标绘图形
 */
import './styles/plot.css';

// 控件组件
export { PlotControl } from './bindtype/PlotControl';
export { PlotToolbar } from './bindtype/PlotToolbar';
export { usePlotInteraction } from './bindtype/usePlotInteraction';

// 类型
export type {
  PlotMode,
  PlotToolMode,
  PlotFeature,
  PlotStyleConfig,
  PlotControlProps,
  PlotControlHandle,
} from './bindtype/plot-types';

// 纯算法（可被其他技术栈复用）
export {
  bindtype,
  MIN_CONTROL_POINTS,
  MAX_CONTROL_POINTS,
} from './algorithms/bindtype';

export type { PlotAlgorithmType, PlotAlgorithmResult, Point } from './algorithms/bindtype';

export { rectangleFromCorners, circleFromTwoPoints, circleFromRadius, sectorFromThreePoints, sectorEdgePreview, ellipseFromThreePoints } from './algorithms/bindtype-bindtype';
export { straightArrow } from './algorithms/bindtype-arrow';
export { curveAttackArrow } from './algorithms/bindtype-curve-arrow';
export { getBSplinePoints, midPoint, distance, angle } from './algorithms/bindtype-curve';

/**
 * 标绘算法统一入口
 *
 * 输入：控制点数组 + 图形类型 → 输出：GeoJSON Polygon/LineString 坐标
 */
import type { Point } from './bindtype-curve';
import { rectangleFromCorners, circleFromTwoPoints, sectorFromThreePoints, sectorEdgePreview, ellipseFromThreePoints } from './bindtype-bindtype';
import { straightArrow } from './bindtype-arrow';
import { curveAttackArrow } from './bindtype-curve-arrow';

export type PlotAlgorithmType =
  | 'rectangle' | 'circle' | 'ellipse' | 'sector'
  | 'straight-arrow' | 'curve-arrow';

export interface PlotAlgorithmResult {
  type: 'Polygon' | 'LineString';
  coordinates: Point[] | Point[][];
}

/**
 * 根据控制点和类型生成 GeoJSON 几何坐标
 */
export function bindtype(
  plotType: PlotAlgorithmType,
  controlPoints: Point[],
): PlotAlgorithmResult | null {
  if (controlPoints.length < 2) return null;

  switch (plotType) {
    case 'rectangle': {
      if (controlPoints.length < 2) return null;
      const coords = rectangleFromCorners(controlPoints[0], controlPoints[1]);
      return { type: 'Polygon', coordinates: [coords] };
    }

    case 'circle': {
      if (controlPoints.length < 2) return null;
      const coords = circleFromTwoPoints(controlPoints[0], controlPoints[1]);
      return { type: 'Polygon', coordinates: [coords] };
    }

    case 'ellipse': {
      if (controlPoints.length < 3) return null;
      const coords = ellipseFromThreePoints(controlPoints[0], controlPoints[1], controlPoints[2]);
      return { type: 'Polygon', coordinates: [coords] };
    }

    case 'sector': {
      if (controlPoints.length < 2) return null;
      if (controlPoints.length === 2) {
        // 只有圆心+第一条边 → 渲染射线预览
        const coords = sectorEdgePreview(controlPoints[0], controlPoints[1]);
        return { type: 'Polygon', coordinates: [coords] };
      }
      const coords = sectorFromThreePoints(controlPoints[0], controlPoints[1], controlPoints[2]);
      return { type: 'Polygon', coordinates: [coords] };
    }

    case 'straight-arrow': {
      if (controlPoints.length < 2) return null;
      const coords = straightArrow(controlPoints[0], controlPoints[1]);
      return { type: 'Polygon', coordinates: [coords] };
    }

    case 'curve-arrow': {
      if (controlPoints.length < 3) return null;
      const coords = curveAttackArrow(controlPoints);
      if (coords.length === 0) return null;
      return { type: 'Polygon', coordinates: [coords] };
    }

    default:
      return null;
  }
}

/** 各图形类型所需的最少控制点数 */
export const MIN_CONTROL_POINTS: Record<PlotAlgorithmType, number> = {
  'rectangle': 2,
  'circle': 2,
  'ellipse': 3,
  'sector': 3,
  'straight-arrow': 2,
  'curve-arrow': 3,
};

/** 各图形类型的最大控制点数（undefined = 无上限） */
export const MAX_CONTROL_POINTS: Record<PlotAlgorithmType, number | undefined> = {
  'rectangle': 2,
  'circle': 2,
  'ellipse': 3,
  'sector': 3,
  'straight-arrow': 2,
  'curve-arrow': undefined,
};

// 导出子模块
export type { Point } from './bindtype-curve';
export { getBSplinePoints, midPoint, distance, angle } from './bindtype-curve';
export { rectangleFromCorners, circleFromTwoPoints, circleFromRadius, sectorFromThreePoints, sectorEdgePreview, ellipseFromThreePoints } from './bindtype-bindtype';
export { straightArrow } from './bindtype-arrow';
export { curveAttackArrow } from './bindtype-curve-arrow';

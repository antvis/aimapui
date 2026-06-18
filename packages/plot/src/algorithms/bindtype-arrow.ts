/**
 * 直线箭头算法：两个控制点 → 矩形体 + 三角箭头
 */
import type { Point } from './bindtype-curve';
import { distance, angle, offsetPoint } from './bindtype-curve';

/** 直线箭头：起点 → 终点，bodyWidthRatio=箭身宽度/总长比，headWidthRatio=箭头宽度/箭身宽度比 */
export function straightArrow(
  start: Point,
  end: Point,
  bodyWidthRatio = 0.05,
  headWidthRatio = 2.5,
  headLengthRatio = 0.15,
): Point[] {
  const len = distance(start, end);
  const bodyWidth = len * bodyWidthRatio;
  const headWidth = bodyWidth * headWidthRatio;
  const headLength = len * headLengthRatio;
  const dir = angle(start, end);
  const normal = dir + Math.PI / 2;

  // 箭身四角
  const bodyEnd: Point = [
    end[0] - Math.cos(dir) * headLength,
    end[1] - Math.sin(dir) * headLength,
  ];

  const bl = offsetPoint(start, normal, bodyWidth);
  const br = offsetPoint(start, normal, -bodyWidth);
  const el = offsetPoint(bodyEnd, normal, bodyWidth);
  const er = offsetPoint(bodyEnd, normal, -bodyWidth);

  // 箭头三角
  const hl = offsetPoint(bodyEnd, normal, headWidth);
  const hr = offsetPoint(bodyEnd, normal, -headWidth);

  return [bl, el, hl, end, hr, er, br, bl];
}

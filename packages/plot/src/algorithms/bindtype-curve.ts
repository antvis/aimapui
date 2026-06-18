/**
 * 贝塞尔曲线工具函数
 */

export type Point = [number, number];

/** 二阶贝塞尔插值 */
export function quadraticBezier(p0: Point, p1: Point, p2: Point, t: number): Point {
  const u = 1 - t;
  return [
    u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
    u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
  ];
}

/** 三阶贝塞尔插值 */
export function cubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

/** 对控制点序列做 B-spline 拟合，返回平滑曲线点 */
export function getBSplinePoints(points: Point[], segments = 50): Point[] {
  if (points.length < 2) return [...points];
  if (points.length === 2) return interpolateLine(points[0], points[1], segments);

  const result: Point[] = [];
  const n = points.length - 1;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const idx = Math.min(Math.floor(t * n), n - 1);
    const localT = t * n - idx;

    if (idx === 0) {
      result.push(quadraticBezier(points[0], points[0], points[1], localT));
    } else if (idx >= n - 1) {
      result.push(quadraticBezier(points[n - 1], points[n], points[n], localT));
    } else {
      const p0 = midPoint(points[idx - 1], points[idx]);
      const p1 = points[idx];
      const p2 = midPoint(points[idx], points[idx + 1]);
      result.push(quadraticBezier(p0, p1, p2, localT));
    }
  }
  return result;
}

/** 两点之间线性插值 */
function interpolateLine(p0: Point, p1: Point, segments: number): Point[] {
  const result: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    result.push([p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t]);
  }
  return result;
}

/** 两点中点 */
export function midPoint(p1: Point, p2: Point): Point {
  return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
}

/** 两点距离 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/** 两点角度（弧度） */
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}

/** 沿法线方向偏移点 */
export function offsetPoint(p: Point, ang: number, dist: number): Point {
  return [p[0] + Math.cos(ang) * dist, p[1] + Math.sin(ang) * dist];
}

/** 沿曲线生成左右偏移轮廓 */
export function offsetCurve(
  spine: Point[],
  widthFn: (t: number) => number,
): { left: Point[]; right: Point[] } {
  const left: Point[] = [];
  const right: Point[] = [];
  const n = spine.length;

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const w = widthFn(t) / 2;

    let normal: number;
    if (i === 0) {
      normal = angle(spine[0], spine[1]) + Math.PI / 2;
    } else if (i === n - 1) {
      normal = angle(spine[n - 2], spine[n - 1]) + Math.PI / 2;
    } else {
      const a1 = angle(spine[i - 1], spine[i]);
      const a2 = angle(spine[i], spine[i + 1]);
      normal = (a1 + a2) / 2 + Math.PI / 2;
    }

    left.push(offsetPoint(spine[i], normal, w));
    right.push(offsetPoint(spine[i], normal, -w));
  }

  return { left, right };
}

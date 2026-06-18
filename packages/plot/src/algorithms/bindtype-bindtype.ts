/**
 * 面状图形算法：矩形、圆形、椭圆、扇形
 */
import type { Point } from './bindtype-curve';
import { distance, angle } from './bindtype-curve';

/** 矩形：两个对角点 → 四边形坐标 */
export function rectangleFromCorners(p1: Point, p2: Point): Point[] {
  return [
    [p1[0], p1[1]],
    [p2[0], p1[1]],
    [p2[0], p2[1]],
    [p1[0], p2[1]],
    [p1[0], p1[1]],
  ];
}

/** 圆形：圆心 + 边界点 → 正多边形 */
export function circleFromTwoPoints(center: Point, edge: Point, segments = 64): Point[] {
  const latRad = (center[1] * Math.PI) / 180;
  const cosLat = Math.cos(latRad);
  const dx = (edge[0] - center[0]) * cosLat;
  const dy = edge[1] - center[1];
  const r = Math.sqrt(dx * dx + dy * dy);
  return circleFromRadius(center, r, segments);
}

/** 圆形：圆心 + 半径（经度单位） */
export function circleFromRadius(center: Point, radius: number, segments = 64): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (2 * Math.PI * i) / segments;
    // 经度方向用 cos(lat) 修正
    const latRad = (center[1] * Math.PI) / 180;
    points.push([
      center[0] + (radius * Math.cos(a)) / Math.cos(latRad),
      center[1] + radius * Math.sin(a),
    ]);
  }
  return points;
}

/** 扇形：圆心 + 两个边界点 → 扇形弧线 */
export function sectorFromThreePoints(
  center: Point,
  p1: Point,
  p2: Point,
  segments = 64,
): Point[] {
  // 在 cosLat 修正的投影空间中计算，确保弧线端点精确经过 p1/p2
  const latRad = (center[1] * Math.PI) / 180;
  const cosLat = Math.cos(latRad);

  // 将经纬度转为局部投影坐标（以 center 为原点，经度乘 cosLat）
  const dx1 = (p1[0] - center[0]) * cosLat;
  const dy1 = p1[1] - center[1];
  const dx2 = (p2[0] - center[0]) * cosLat;
  const dy2 = p2[1] - center[1];

  const r = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  const startAngle = Math.atan2(dy1, dx1);
  const endAngle = Math.atan2(dy2, dx2);

  let diff = endAngle - startAngle;
  if (diff > Math.PI) diff -= 2 * Math.PI;
  if (diff < -Math.PI) diff += 2 * Math.PI;

  const points: Point[] = [center];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = startAngle + diff * t;
    // 从投影空间转回经纬度
    points.push([
      center[0] + (r * Math.cos(a)) / cosLat,
      center[1] + r * Math.sin(a),
    ]);
  }
  points.push(center);
  return points;
}

/**
 * 扇形第一条边预览：圆心 + 边界点 → 从圆心到边界点的射线
 */
export function sectorEdgePreview(center: Point, edge: Point): Point[] {
  const latRad = (center[1] * Math.PI) / 180;
  const cosLat = Math.cos(latRad);

  const dx = (edge[0] - center[0]) * cosLat;
  const dy = edge[1] - center[1];
  const r = Math.sqrt(dx * dx + dy * dy);
  const a = Math.atan2(dy, dx);

  const offset = 0.005;
  const endA: Point = [
    center[0] + (r * Math.cos(a + offset)) / cosLat,
    center[1] + r * Math.sin(a + offset),
  ];
  const endB: Point = [
    center[0] + (r * Math.cos(a - offset)) / cosLat,
    center[1] + r * Math.sin(a - offset),
  ];
  return [center, endA, endB, center];
}

/** 椭圆：圆心 + 长轴端点 + 短轴端点 → 椭圆坐标 */
export function ellipseFromThreePoints(
  center: Point,
  majorEnd: Point,
  minorEnd: Point,
  segments = 64,
): Point[] {
  const a = distance(center, majorEnd);
  const b = distance(center, minorEnd);
  const rotation = angle(center, majorEnd);
  const latRad = (center[1] * Math.PI) / 180;
  const cosLat = Math.cos(latRad);

  const points: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (2 * Math.PI * i) / segments;
    const x = a * Math.cos(t);
    const y = b * Math.sin(t);
    const rx = x * Math.cos(rotation) - y * Math.sin(rotation);
    const ry = x * Math.sin(rotation) + y * Math.cos(rotation);
    points.push([center[0] + rx / cosLat, center[1] + ry]);
  }
  return points;
}

/**
 * DrawSnap — 绘制吸附引擎
 *
 * 遵循 GeoEditor Pro 规范 §3.1 吸附状态：
 * - 光标靠近现有要素顶点或边缘 8px 范围内触发吸附
 * - 顶点吸附：琥珀色 8px 正方形指示框
 * - 边吸附：投影到最近边上
 */
import type { DrawFeature, DrawSnapConfig } from './draw-types';
import { getVertices } from './draw-geometry';

export interface SnapResult {
  snapped: boolean;
  lng: number;
  lat: number;
  type: 'vertex' | 'edge' | 'none';
  featureId?: string;
  vertexIndex?: number;
  edgeIndex?: number;
}

const DEFAULT_SNAP_CONFIG: Required<DrawSnapConfig> = {
  enabled: true,
  threshold: 8,
  vertex: true,
  edge: true,
};

export function resolveSnapConfig(snap?: DrawSnapConfig | boolean): Required<DrawSnapConfig> {
  if (snap === false) return { ...DEFAULT_SNAP_CONFIG, enabled: false };
  if (snap === true || snap === undefined) return { ...DEFAULT_SNAP_CONFIG };
  return { ...DEFAULT_SNAP_CONFIG, ...snap };
}

export function findSnapTarget(
  lngLat: [number, number],
  features: DrawFeature[],
  config: Required<DrawSnapConfig>,
  lngLatToPixel: (lngLat: [number, number]) => { x: number; y: number } | null,
  currentDrawingId?: string,
): SnapResult {
  if (!config.enabled || features.length === 0) {
    return { snapped: false, lng: lngLat[0], lat: lngLat[1], type: 'none' };
  }

  const cursorPixel = lngLatToPixel(lngLat);
  if (!cursorPixel) {
    return { snapped: false, lng: lngLat[0], lat: lngLat[1], type: 'none' };
  }

  const threshold = config.threshold;
  let bestDist = Infinity;
  let bestResult: SnapResult = { snapped: false, lng: lngLat[0], lat: lngLat[1], type: 'none' };

  for (const feature of features) {
    if (feature.id === currentDrawingId) continue;

    const vertices = getVertices(feature);
    if (vertices.length === 0) continue;

    // 顶点吸附（优先级最高）
    if (config.vertex) {
      for (let i = 0; i < vertices.length; i++) {
        const vPixel = lngLatToPixel(vertices[i]);
        if (!vPixel) continue;
        const dx = cursorPixel.x - vPixel.x;
        const dy = cursorPixel.y - vPixel.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < threshold && dist < bestDist) {
          bestDist = dist;
          bestResult = {
            snapped: true,
            lng: vertices[i][0],
            lat: vertices[i][1],
            type: 'vertex',
            featureId: feature.id,
            vertexIndex: i,
          };
        }
      }
    }

    // 边吸附
    if (config.edge && bestResult.type !== 'vertex') {
      const edgeCount = feature.geometry.type === 'Polygon' ? vertices.length : Math.max(0, vertices.length - 1);
      for (let i = 0; i < edgeCount; i++) {
        const next = (i + 1) % vertices.length;
        const aPixel = lngLatToPixel(vertices[i]);
        const bPixel = lngLatToPixel(vertices[next]);
        if (!aPixel || !bPixel) continue;

        const proj = projectPointOnSegmentPixel(cursorPixel, aPixel, bPixel);
        if (proj.t >= 0 && proj.t <= 1 && proj.dist < threshold && proj.dist < bestDist) {
          // 将像素投影点转回经纬度
          const t = proj.t;
          const snapLng = vertices[i][0] + t * (vertices[next][0] - vertices[i][0]);
          const snapLat = vertices[i][1] + t * (vertices[next][1] - vertices[i][1]);
          bestDist = proj.dist;
          bestResult = {
            snapped: true,
            lng: snapLng,
            lat: snapLat,
            type: 'edge',
            featureId: feature.id,
            edgeIndex: i,
          };
        }
      }
    }
  }

  return bestResult;
}

function projectPointOnSegmentPixel(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
): { t: number; dist: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const d = Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
    return { t: 0, dist: d };
  }
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  const dist = Math.sqrt((p.x - projX) ** 2 + (p.y - projY) ** 2);
  return { t, dist };
}

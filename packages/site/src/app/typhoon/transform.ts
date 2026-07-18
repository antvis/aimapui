/* ================================================================
   台风路径地图 — 数据转换工具
   ================================================================ */

import type { TyphoonPoint, ForecastAgency, TrackSegment, TrackNode, WindPolygon } from './types';
import { STRENGTH_TO_KEY, type GradeKey } from './constants';

// ── 四象限半径解析 ───────────────────────────────────────────
export function parseRadii(s: string | undefined | null): [number, number, number, number] {
  if (!s) return [0, 0, 0, 0];
  const parts = s.split('|');
  const n = (v?: string) => {
    const num = Number(v);
    return Number.isFinite(num) && num > 0 ? num : 0;
  };
  return [n(parts[0]), n(parts[1]), n(parts[2]), n(parts[3])];
}

// ── 等级 ─────────────────────────────────────────────────────
export function pointGrade(p: TyphoonPoint): GradeKey {
  return STRENGTH_TO_KEY[p.strong] ?? 'TS';
}

// ── 轨迹段 ───────────────────────────────────────────────────
export function toTrackSegments(points: TyphoonPoint[]): TrackSegment[] {
  const segs: TrackSegment[] = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const aLng = Number(a.lng), aLat = Number(a.lat), bLng = Number(b.lng), bLat = Number(b.lat);
    if (![aLng, aLat, bLng, bLat].every(Number.isFinite)) continue;
    segs.push({ path: [[aLng, aLat], [bLng, bLat]], grade: pointGrade(b) });
  }
  return segs;
}

// ── 路径节点 ─────────────────────────────────────────────────
export function toNodes(points: TyphoonPoint[]): TrackNode[] {
  return points
    .map((p, i) => {
      const lng = Number(p.lng), lat = Number(p.lat);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
      return { lng, lat, grade: pointGrade(p), time: p.time, strong: p.strong, power: p.power, speed: p.speed, pressure: p.pressure, index: i };
    })
    .filter(Boolean) as TrackNode[];
}

// ── 球面几何：从起点沿方位角走指定距离 ──────────────────────
export function destinationPoint(
  startLng: number, startLat: number, distanceKm: number, bearingDeg: number,
): [number, number] {
  const R = 6371;
  const dR = distanceKm / R;
  const lat1 = (startLat * Math.PI) / 180;
  const lng1 = (startLng * Math.PI) / 180;
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(dR) +
    Math.cos(lat1) * Math.sin(dR) * Math.cos(bearing),
  );
  const lng2 = lng1 + Math.atan2(
    Math.sin(bearing) * Math.sin(dR) * Math.cos(lat1),
    Math.cos(dR) - Math.sin(lat1) * Math.sin(lat2),
  );
  return [(lng2 * 180) / Math.PI, (lat2 * 180) / Math.PI];
}

// ── 四象限风圈 → GeoJSON Polygon ────────────────────────────
export function toWindPolygons(p: TyphoonPoint | undefined): WindPolygon[] {
  if (!p) return [];
  const lng = Number(p.lng), lat = Number(p.lat);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return [];
  const out: WindPolygon[] = [];
  const QUADRANT_ANGLES: [number, number][] = [[0, 90], [90, 180], [180, 270], [270, 360]];
  const buildArc = (radiusKm: number, startDeg: number, endDeg: number): [number, number][] => {
    const points: [number, number][] = [];
    const steps = Math.max(12, Math.round((endDeg - startDeg) / 3));
    for (let i = 0; i <= steps; i++) {
      const bearing = startDeg + (endDeg - startDeg) * (i / steps);
      points.push(destinationPoint(lng, lat, radiusKm, bearing));
    }
    return points;
  };
  const pushLevel = (level: string, radii: [number, number, number, number]) => {
    const ring: [number, number][] = [];
    let hasAny = false;
    for (let qi = 0; qi < 4; qi++) {
      if (radii[qi] > 0) {
        hasAny = true;
        const [startDeg, endDeg] = QUADRANT_ANGLES[qi];
        ring.push(...buildArc(radii[qi], startDeg, endDeg));
      }
    }
    if (!hasAny || ring.length < 3) return;
    if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
      ring.push(ring[0]);
    }
    out.push({ coordinates: [ring], level });
  };
  pushLevel('7', parseRadii(p.radius7));
  pushLevel('10', parseRadii(p.radius10));
  pushLevel('12', parseRadii(p.radius12));
  return out;
}

// ── 预报路径段 ───────────────────────────────────────────────
export function toForecastSegments(agency: ForecastAgency | undefined): TrackSegment[] {
  if (!agency) return [];
  const pts = agency.forecastpoints;
  const segs: TrackSegment[] = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const aLng = Number(a.lng), aLat = Number(a.lat), bLng = Number(b.lng), bLat = Number(b.lat);
    if (![aLng, aLat, bLng, bLat].every(Number.isFinite)) continue;
    segs.push({ path: [[aLng, aLat], [bLng, bLat]], grade: pointGrade(b) });
  }
  return segs;
}
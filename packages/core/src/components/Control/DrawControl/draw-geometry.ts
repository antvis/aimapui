/**
 * DrawControl 几何计算工具函数
 *
 * 提供坐标转换、GeoJSON 几何体构建、圆/矩形近似、顶点操作等工具方法
 */
import type { Point, LineString, Polygon, Position } from 'geojson';
import type { DrawFeature, DrawGeometryMode } from './draw-types';

// ============================================================
// ID 生成
// ============================================================

let featureIdCounter = 0;

/** 生成唯一的要素 ID */
export function generateFeatureId(): string {
  return `draw-${++featureIdCounter}`;
}

/** 重置 ID 计数器（仅用于测试） */
export function resetFeatureIdCounter(): void {
  featureIdCounter = 0;
}

// ============================================================
// 几何体构建
// ============================================================

/** 顶点列表 → GeoJSON LineString */
export function verticesToLineString(vertices: [number, number][]): LineString {
  return {
    type: 'LineString',
    coordinates: vertices.map(([lng, lat]) => [lng, lat] as [number, number]),
  };
}

/** 顶点列表 → GeoJSON Polygon（自动闭合） */
export function verticesToPolygon(vertices: [number, number][]): Polygon {
  const coords = vertices.map(([lng, lat]) => [lng, lat] as [number, number]);
  // 闭合：首尾坐标相同
  if (coords.length > 0) {
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      coords.push([first[0], first[1]]);
    }
  }
  return {
    type: 'Polygon',
    coordinates: [coords],
  };
}

/** 两对角点 → 矩形 Polygon */
export function rectangleToPolygon(
  start: [number, number],
  end: [number, number],
): Polygon {
  const [lng1, lat1] = start;
  const [lng2, lat2] = end;
  return {
    type: 'Polygon',
    coordinates: [
      [
        [lng1, lat1],
        [lng2, lat1],
        [lng2, lat2],
        [lng1, lat2],
        [lng1, lat1], // 闭合
      ],
    ],
  };
}

/**
 * 圆心 + 半径(米) → 正多边形近似 Polygon
 * @param center 圆心 [lng, lat]
 * @param radiusMeters 半径（米）
 * @param segments 多边形边数，默认 64
 */
export function circleToPolygon(
  center: [number, number],
  radiusMeters: number,
  segments: number = 64,
): Polygon {
  const [lng, lat] = center;
  const coords: [number, number][] = [];

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    // 经度偏移：修正纬度余弦
    const dLng = (radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180))) * Math.cos(angle);
    const dLat = (radiusMeters / 110540) * Math.sin(angle);
    coords.push([lng + dLng, lat + dLat]);
  }

  // 闭合
  coords.push(coords[0]);

  return {
    type: 'Polygon',
    coordinates: [coords],
  };
}

/** 单个坐标 → GeoJSON Point */
export function coordinatesToPoint(coord: [number, number]): Point {
  return {
    type: 'Point',
    coordinates: [coord[0], coord[1]],
  };
}

// ============================================================
// 距离计算
// ============================================================

/**
 * Haversine 公式计算两点之间的球面距离（米）
 */
export function haversineDistance(
  coord1: [number, number],
  coord2: [number, number],
): number {
  const R = 6371000; // 地球平均半径（米）
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(coord2[1] - coord1[1]);
  const dLng = toRad(coord2[0] - coord1[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1[1])) *
      Math.cos(toRad(coord2[1])) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 计算两个像素坐标之间的距离（像素单位）
 */
export function pixelDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// ============================================================
// 要素操作
// ============================================================

/** 创建完整的 DrawFeature */
export function createDrawFeature(
  geometry: Point | LineString | Polygon,
  drawType: DrawGeometryMode,
  id?: string,
): DrawFeature {
  return {
    type: 'Feature',
    id: id ?? generateFeatureId(),
    geometry,
    properties: {
      drawType,
    },
  };
}

/**
 * 平移要素（移动所有坐标）
 * @param feature 原始要素
 * @param dLng 经度偏移
 * @param dLat 纬度偏移
 * @returns 新要素（不修改原始）
 */
export function translateFeature(
  feature: DrawFeature,
  dLng: number,
  dLat: number,
): DrawFeature {
  const geom = feature.geometry as Point | LineString | Polygon;
  const geometry = translateGeometry(geom, dLng, dLat);
  return {
    ...feature,
    geometry,
    properties: { ...feature.properties },
  };
}

/** 平移 GeoJSON 几何体 */
function translateGeometry(
  geometry: Point | LineString | Polygon,
  dLng: number,
  dLat: number,
): Point | LineString | Polygon {
  switch (geometry.type) {
    case 'Point':
      return {
        type: 'Point',
        coordinates: [
          geometry.coordinates[0] + dLng,
          geometry.coordinates[1] + dLat,
        ],
      };
    case 'LineString':
      return {
        type: 'LineString',
        coordinates: geometry.coordinates.map(
          ([lng, lat]) => [lng + dLng, lat + dLat] as [number, number],
        ),
      };
    case 'Polygon':
      return {
        type: 'Polygon',
        coordinates: geometry.coordinates.map((ring) =>
          ring.map(([lng, lat]) => [lng + dLng, lat + dLat] as [number, number]),
        ),
      };
    default:
      return geometry;
  }
}

/**
 * 移动要素中指定索引的顶点
 * @param feature 原始要素
 * @param vertexIndex 顶点索引（扁平化后）
 * @param newLng 新经度
 * @param newLat 新纬度
 * @returns 新要素（不修改原始）
 */
export function moveVertex(
  feature: DrawFeature,
  vertexIndex: number,
  newLng: number,
  newLat: number,
): DrawFeature {
  const geometry = feature.geometry;
  let newGeometry: Point | LineString | Polygon;

  if (geometry.type === 'Point') {
    // Point 只有一个顶点，vertexIndex 应为 0
    newGeometry = {
      type: 'Point',
      coordinates: [newLng, newLat],
    };
  } else if (geometry.type === 'LineString') {
    const coords = geometry.coordinates.map((c) => [...c] as [number, number]);
    if (vertexIndex >= 0 && vertexIndex < coords.length) {
      coords[vertexIndex] = [newLng, newLat];
    }
    newGeometry = {
      type: 'LineString',
      coordinates: coords,
    };
  } else if (geometry.type === 'Polygon') {
    // 外环（ring[0]），忽略闭合顶点
    const rings = geometry.coordinates.map(
      (ring) => ring.map((c) => [...c] as [number, number]),
    );
    const outerRing = rings[0];
    // 闭合多边形的顶点索引：只操作不重复的顶点
    // vertexIndex 对应 outerRing 中不含闭合尾顶点的索引
    const uniqueCount = outerRing.length > 1 &&
      outerRing[0][0] === outerRing[outerRing.length - 1][0] &&
      outerRing[0][1] === outerRing[outerRing.length - 1][1]
      ? outerRing.length - 1
      : outerRing.length;

    if (vertexIndex >= 0 && vertexIndex < uniqueCount) {
      outerRing[vertexIndex] = [newLng, newLat];
      // 同步闭合顶点
      if (vertexIndex === 0) {
        outerRing[outerRing.length - 1] = [newLng, newLat];
      }
    }
    newGeometry = {
      type: 'Polygon',
      coordinates: rings,
    };
  } else {
    // For non-Point/LineString/Polygon geometries, return as-is (shouldn't happen in practice)
    newGeometry = geometry as unknown as Point | LineString | Polygon;
  }

  return {
    ...feature,
    geometry: newGeometry,
    properties: { ...feature.properties },
  };
}

/**
 * 获取要素所有顶点坐标（扁平化）
 * 对于 Polygon 只返回外环不含闭合尾顶点
 */
export function getVertices(feature: DrawFeature): [number, number][] {
  const geometry = feature.geometry;
  const vertices: [number, number][] = [];

  if (geometry.type === 'Point') {
    vertices.push([geometry.coordinates[0], geometry.coordinates[1]]);
  } else if (geometry.type === 'LineString') {
    geometry.coordinates.forEach(([lng, lat]) => {
      vertices.push([lng, lat]);
    });
  } else if (geometry.type === 'Polygon') {
    const outerRing = geometry.coordinates[0];
    if (outerRing && outerRing.length > 1) {
      // 排除闭合尾顶点
      const uniqueCount =
        outerRing[0][0] === outerRing[outerRing.length - 1][0] &&
        outerRing[0][1] === outerRing[outerRing.length - 1][1]
          ? outerRing.length - 1
          : outerRing.length;
      for (let i = 0; i < uniqueCount; i++) {
        vertices.push([outerRing[i][0], outerRing[i][1]]);
      }
    }
  }

  return vertices;
}

/** 获取要素的顶点数量 */
export function getVertexCount(feature: DrawFeature): number {
  return getVertices(feature).length;
}

// ============================================================
// 坐标提取
// ============================================================

/** 从 L7 地图事件中提取经纬度 */
export function extractLngLatFromEvent(e: Record<string, unknown>): [number, number] | null {
  // L7 的 map click 事件可能在不同属性中携带坐标
  const lnglat = e.lnglat as Record<string, number> | undefined;
  const lngLat = e.lngLat as Record<string, number> | undefined;

  if (lnglat && typeof lnglat.lng === 'number' && typeof lnglat.lat === 'number') {
    return [lnglat.lng, lnglat.lat];
  }
  if (lngLat && typeof lngLat.lng === 'number' && typeof lngLat.lat === 'number') {
    return [lngLat.lng, lngLat.lat];
  }

  // 尝试从 coordinate 属性提取
  const coordinate = e.coordinate as [number, number] | undefined;
  if (coordinate && typeof coordinate[0] === 'number' && typeof coordinate[1] === 'number') {
    return [coordinate[0], coordinate[1]];
  }

  return null;
}

// ============================================================
// GeoJSON 数据转换（用于 L7 图层渲染）
// ============================================================

/** 将 DrawFeature 数组转为 GeoJSON FeatureCollection（统一格式） */
export function featuresToGeoJSON(features: DrawFeature[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: features as GeoJSON.Feature[],
  };
}

/** 按 geometry 类型筛选并转为 GeoJSON FeatureCollection */
export function featuresToPointGeoJSON(features: DrawFeature[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: features.filter((f) => f.geometry.type === 'Point') as GeoJSON.Feature[],
  };
}

export function featuresToLineGeoJSON(features: DrawFeature[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: features.filter((f) => f.geometry.type === 'LineString') as GeoJSON.Feature[],
  };
}

export function featuresToPolygonGeoJSON(features: DrawFeature[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: features.filter((f) => f.geometry.type === 'Polygon') as GeoJSON.Feature[],
  };
}

// ============================================================
// Merge / Split 几何运算
// ============================================================

/**
 * 判断两个多边形是否相邻或重叠
 *
 * 相邻：至少有一条共享边（两个顶点相同）
 * 重叠：一个面的任意顶点在另一个面内部，或边相交
 */
function arePolygonsAdjacentOrOverlapping(polyA: Polygon, polyB: Polygon): boolean {
  const ringA = getUniqueRingCoords(polyA.coordinates[0]);
  const ringB = getUniqueRingCoords(polyB.coordinates[0]);

  // 检查共享顶点数量（≥2 说明有共享边 → 相邻）
  let sharedVertexCount = 0;
  const setA = new Set(ringA.map((c) => `${c[0].toFixed(7)},${c[1].toFixed(7)}`));
  for (const c of ringB) {
    if (setA.has(`${c[0].toFixed(7)},${c[1].toFixed(7)}`)) sharedVertexCount++;
  }
  if (sharedVertexCount >= 2) return true;

  // 检查边相交（线段交叉检测）
  for (let i = 0; i < ringA.length; i++) {
    const aNext = (i + 1) % ringA.length;
    for (let j = 0; j < ringB.length; j++) {
      const bNext = (j + 1) % ringB.length;
      if (lineSegmentIntersection(ringA[i], ringA[aNext], ringB[j], ringB[bNext], true)) {
        return true;
      }
    }
  }

  // 检查重叠：A 的顶点是否在 B 内，或 B 的顶点是否在 A 内
  for (const v of ringA) {
    if (isPointInPolygon(v, ringB)) return true;
  }
  for (const v of ringB) {
    if (isPointInPolygon(v, ringA)) return true;
  }

  return false;
}

/** 从闭合环中提取唯一顶点（去除末尾闭合点） */
function getUniqueRingCoords(ring: Position[]): [number, number][] {
  const coords: [number, number][] = [];
  const uniqueCount =
    ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1]
      ? ring.length - 1
      : ring.length;
  for (let i = 0; i < uniqueCount; i++) {
    coords.push([ring[i][0], ring[i][1]]);
  }
  return coords;
}

/** 射线法判断点是否在多边形内 */
function isPointInPolygon(point: [number, number], ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (((yi > point[1]) !== (yj > point[1])) &&
        (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * 合并相邻/重叠的多个 Polygon 为一个 Polygon
 *
 * 只有相邻（共享边）或重叠（边相交/顶点在面内）的多边形才能合并。
 * 不相邻的多边形将被拒绝合并，返回 null。
 *
 * 合并算法：收集所有外环顶点，使用 Graham Scan 计算凸包作为合并结果，
 * 保证结果不自相交。由于凸包会丢失凹陷部分，对于需要保留凹陷的
 * 真正 union 运算需要引入 turf 等几何库。
 *
 * @param features 要合并的面要素列表（至少2个）
 * @returns 合并后的新 DrawFeature，或 null 如果多边形不相邻或无法合并
 */
export function mergePolygons(features: DrawFeature[]): DrawFeature | null {
  if (features.length < 2) return null;

  const polygons = features.filter((f) => f.geometry.type === 'Polygon');
  if (polygons.length < 2) return null;

  // 验证所有多边形互相相邻或重叠（形成连通图）
  for (let i = 0; i < polygons.length; i++) {
    const polyI = polygons[i].geometry as Polygon;
    let hasNeighbor = false;
    for (let j = 0; j < polygons.length; j++) {
      if (i === j) continue;
      if (arePolygonsAdjacentOrOverlapping(polyI, polygons[j].geometry as Polygon)) {
        hasNeighbor = true;
        break;
      }
    }
    if (!hasNeighbor) return null; // 有孤立多边形，拒绝合并
  }

  // 收集所有外环坐标（去除闭合尾顶点）
  const allCoords: [number, number][] = [];
  for (const poly of polygons) {
    const outerRing = (poly.geometry as Polygon).coordinates[0];
    if (!outerRing) continue;
    const uniqueCount =
      outerRing.length > 1 &&
      outerRing[0][0] === outerRing[outerRing.length - 1][0] &&
      outerRing[0][1] === outerRing[outerRing.length - 1][1]
        ? outerRing.length - 1
        : outerRing.length;
    for (let i = 0; i < uniqueCount; i++) {
      allCoords.push([outerRing[i][0], outerRing[i][1]]);
    }
  }

  if (allCoords.length < 3) return null;

  // 去重
  const uniqueCoords: [number, number][] = [];
  const coordSet = new Set<string>();
  for (const c of allCoords) {
    const key = `${c[0].toFixed(6)},${c[1].toFixed(6)}`;
    if (!coordSet.has(key)) {
      coordSet.add(key);
      uniqueCoords.push(c);
    }
  }

  if (uniqueCoords.length < 3) return null;

  // 使用 Graham Scan 计算凸包（保证不自相交）
  const hull = grahamScan(uniqueCoords);
  if (hull.length < 3) return null;

  // 闭合
  hull.push(hull[0]);

  const mergedGeometry: Polygon = {
    type: 'Polygon',
    coordinates: [hull],
  };

  return createDrawFeature(mergedGeometry, 'polygon');
}

/**
 * Graham Scan 凸包算法
 * 从一组点中计算最小凸包，返回逆时针排列的顶点序列（不含闭合尾点）
 */
function grahamScan(points: [number, number][]): [number, number][] {
  if (points.length < 3) return [...points];

  // 找到 y 最小（y 相同则 x 最小）的点作为起点
  let lowest = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i][1] < points[lowest][1] ||
        (points[i][1] === points[lowest][1] && points[i][0] < points[lowest][0])) {
      lowest = i;
    }
  }
  const start = points[lowest];

  // 按极角排序（以起点为参考）
  const sorted = points
    .filter((p) => p[0] !== start[0] || p[1] !== start[1])
    .sort((a, b) => {
      const angleA = Math.atan2(a[1] - start[1], a[0] - start[0]);
      const angleB = Math.atan2(b[1] - start[1], b[0] - start[0]);
      if (angleA !== angleB) return angleA - angleB;
      const distA = (a[0] - start[0]) ** 2 + (a[1] - start[1]) ** 2;
      const distB = (b[0] - start[0]) ** 2 + (b[1] - start[1]) ** 2;
      return distA - distB;
    });

  // 构建凸包栈
  const hull: [number, number][] = [start];
  for (const point of sorted) {
    while (hull.length > 1) {
      const a = hull[hull.length - 2];
      const b = hull[hull.length - 1];
      const cross = (b[0] - a[0]) * (point[1] - a[1]) - (b[1] - a[1]) * (point[0] - a[0]);
      if (cross <= 0) {
        hull.pop();
      } else {
        break;
      }
    }
    hull.push(point);
  }

  return hull;
}

/**
 * 用切线分割 Polygon 要素
 *
 * 切线是一条 LineString，与目标 Polygon 的边相交产生分割点，
 * 按分割点将 Polygon 切成两个子 Polygon。
 *
 * 实现原理：找到切线与 Polygon 外环的交点，
 * 沿交点将外环分成两段，各自闭合形成两个子 Polygon。
 *
 * @param targetFeature 目标面要素
 * @param cutLine 切线的顶点坐标列表（至少2个点）
 * @returns 分割后的两个 DrawFeature，或 null 如果切线不相交
 */
export function splitPolygonWithLine(
  targetFeature: DrawFeature,
  cutLine: [number, number][],
): DrawFeature[] | null {
  if (targetFeature.geometry.type !== 'Polygon') return null;
  if (cutLine.length < 2) return null;

  const outerRing = (targetFeature.geometry as Polygon).coordinates[0];
  if (!outerRing || outerRing.length < 4) return null;

  // 去除闭合尾顶点，得到唯一顶点序列
  const vertices: [number, number][] = [];
  const uniqueCount =
    outerRing.length > 1 &&
    outerRing[0][0] === outerRing[outerRing.length - 1][0] &&
    outerRing[0][1] === outerRing[outerRing.length - 1][1]
      ? outerRing.length - 1
      : outerRing.length;
  for (let i = 0; i < uniqueCount; i++) {
    vertices.push([outerRing[i][0], outerRing[i][1]]);
  }

  // 找切线与外环边的交点
  const intersections: { edgeIndex: number; point: [number, number]; t: number }[] = [];

  for (let segIdx = 0; segIdx < cutLine.length - 1; segIdx++) {
    const segA = cutLine[segIdx];
    const segB = cutLine[segIdx + 1];

    for (let edgeIdx = 0; edgeIdx < vertices.length; edgeIdx++) {
      const nextIdx = (edgeIdx + 1) % vertices.length;
      const edgeA = vertices[edgeIdx];
      const edgeB = vertices[nextIdx];

      const intersection = lineSegmentIntersection(segA, segB, edgeA, edgeB);
      if (intersection) {
        intersections.push({
          edgeIndex: edgeIdx,
          point: intersection,
          t: segIdx, // 切线段索引（用于排序）
        });
      }
    }
  }

  // 需要恰好2个交点才能分割
  if (intersections.length < 2) return null;

  // 按外环边索引排序
  intersections.sort((a, b) => a.edgeIndex - b.edgeIndex);

  const interA = intersections[0];
  const interB = intersections[intersections.length - 1];

  // 分割外环为两段
  const ring1: [number, number][] = [];
  const ring2: [number, number][] = [];

  // ring1: interA → (edges between) → interB → cutLine segment back → interA
  ring1.push(interA.point);
  for (let i = interA.edgeIndex + 1; i <= interB.edgeIndex; i++) {
    ring1.push(vertices[i % vertices.length]);
  }
  ring1.push(interB.point);
  ring1.push(interA.point); // 闭合

  // ring2: interB → (edges between) → interA → cutLine segment back → interB
  ring2.push(interB.point);
  for (let i = interB.edgeIndex + 1; i < vertices.length; i++) {
    ring2.push(vertices[i]);
  }
  for (let i = 0; i <= interA.edgeIndex; i++) {
    ring2.push(vertices[i]);
  }
  ring2.push(interA.point);
  ring2.push(interB.point); // 闭合

  // 验证：两环至少3个唯一顶点（不含闭合）
  if (ring1.length < 4 || ring2.length < 4) return null;

  const geometry1: Polygon = { type: 'Polygon', coordinates: [ring1] };
  const geometry2: Polygon = { type: 'Polygon', coordinates: [ring2] };

  return [
    createDrawFeature(geometry1, 'polygon'),
    createDrawFeature(geometry2, 'polygon'),
  ];
}

/**
 * 两线段交点计算
 * 返回交点坐标，或 null（不相交/平行）
 *
 * @param excludeEndpoints 是否排除端点交点（t/s 在 0 或 1 处的交点）。
 *   合并相邻性检测时需排除端点（避免共享顶点被误判为边相交）；
 *   分割运算时需包含端点（端点交点也需要作为分割点）。
 */
function lineSegmentIntersection(
  a1: [number, number],
  a2: [number, number],
  b1: [number, number],
  b2: [number, number],
  excludeEndpoints = false,
): [number, number] | null {
  const dx1 = a2[0] - a1[0];
  const dy1 = a2[1] - a1[1];
  const dx2 = b2[0] - b1[0];
  const dy2 = b2[1] - b1[1];

  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < 1e-12) return null; // 平行

  const t = ((b1[0] - a1[0]) * dy2 - (b1[1] - a1[1]) * dx2) / denom;
  const s = ((b1[0] - a1[0]) * dy1 - (b1[1] - a1[1]) * dx1) / denom;

  if (excludeEndpoints) {
    // 排除端点：t 和 s 必须严格在线段内部（不包含 0 和 1）
    if (t <= 1e-6 || t >= 1 - 1e-6 || s <= 1e-6 || s >= 1 - 1e-6) return null;
  } else {
    // 包含端点：t 和 s 在 [0, 1] 范围内即可
    if (t < 0 || t > 1 || s < 0 || s > 1) return null;
  }

  return [a1[0] + t * dx1, a1[1] + t * dy1];
}
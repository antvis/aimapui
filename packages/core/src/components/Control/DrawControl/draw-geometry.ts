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
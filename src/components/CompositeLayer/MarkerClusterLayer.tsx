import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Supercluster from 'supercluster';
import { useScene } from '../../context/SceneContext';
import type { LayerSchema } from '../../schema/types';
import { Marker } from '../Interaction/Marker';

interface ClusterPoint {
  id: string;
  lng: number;
  lat: number;
  properties: Record<string, unknown>;
}

interface ClusterItem {
  id: string;
  /** supercluster 分配的 cluster ID（仅聚合点有，单点为 -1） */
  clusterId: number;
  lng: number;
  lat: number;
  /** 聚合包含的点数，单点为 1 */
  pointCount: number;
  isCluster: boolean;
  properties: Record<string, unknown>;
}

export interface MarkerClusterLayerProps {
  source: LayerSchema['source'];
  sourceType?: LayerSchema['sourceType'];
  sourceConfig?: LayerSchema['sourceConfig'];

  /** 聚合半径（像素），对应 supercluster 的 radius 参数 */
  gridSize?: number;
  /** 形成聚合的最小点数 */
  minClusterSize?: number;
  animationDuration?: number;
  easing?: string;

  onPointClick?: (point: ClusterPoint) => void;
  onClusterClick?: (cluster: ClusterItem) => void;
}

/**
 * Marker 聚合图层（基于 supercluster）
 *
 * 性能优化策略：
 * 1. 使用 supercluster R-tree 空间索引，O(log n) 查询
 * 2. 仅在 zoom 变化时重新聚合（平移时 Marker 组件通过 camerachange 自行更新 DOM 位置）
 * 3. 点击聚合使用 getClusterExpansionZoom 精确缩放
 * 4. SpiderLine 使用 ref + 直接 DOM 操作，避免 setState 重渲染
 *
 * 设计规范：Cartographic Precision System v1.2.0
 * - 视觉分级：小规模(2-99)、中规模(100-999)、大规模(1000+)
 * - 交互：悬停放大(scale-110)、点击缩放、最大级别蜘蛛布局展开
 */
export function MarkerClusterLayer({
  source,
  sourceType = 'geojson',
  sourceConfig,
  gridSize = 60,
  minClusterSize = 2,
  animationDuration = 300,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  onPointClick,
  onClusterClick,
}: MarkerClusterLayerProps) {
  const scene = useScene();
  const [clusters, setClusters] = useState<ClusterItem[]>([]);
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);

  const indexRef = useRef<Supercluster | null>(null);
  const lastZoomRef = useRef<number>(-1);

  const points = useMemo(
    () => normalizePoints(source, sourceType, sourceConfig),
    [source, sourceType, sourceConfig],
  );

  // ─── 构建 supercluster 索引 ───
  useEffect(() => {
    if (points.length === 0) {
      indexRef.current = null;
      setClusters([]);
      lastZoomRef.current = -1;
      return;
    }

    const index = new Supercluster({
      radius: gridSize,
      minPoints: minClusterSize,
      maxZoom: 20,
      minZoom: 0,
    });

    const features = points.map((p) => ({
      type: 'Feature' as const,
      properties: { id: p.id, ...p.properties },
      geometry: {
        type: 'Point' as const,
        coordinates: [p.lng, p.lat] as [number, number],
      },
    }));

    index.load(features);
    indexRef.current = index;
    lastZoomRef.current = -1; // 强制下次查询重新聚合
  }, [points, gridSize, minClusterSize]);

  // ─── 查询聚合结果（仅在 zoom 变化时调用） ───
  const queryClusters = useCallback(
    (index: Supercluster, sceneObj: any) => {
      try {
        const zoom = Math.floor(sceneObj.getZoom());
        if (zoom === lastZoomRef.current) return;
        lastZoomRef.current = zoom;

        // 获取地图视口边界，用于空间查询
        let bbox: [number, number, number, number] = [-180, -90, 180, 90];
        try {
          const bounds = sceneObj.getBounds();
          if (bounds) {
            bbox = [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]];
          }
        } catch {
          // 降级：使用全球范围
        }

        const results = index.getClusters(bbox, zoom);
        const items: ClusterItem[] = results.map((f) => {
          const coords = f.geometry.coordinates;
          const lng = coords[0];
          const lat = coords[1];
          if (f.properties.cluster) {
            return {
              id: `cluster-${f.properties.cluster_id}`,
              clusterId: f.properties.cluster_id,
              lng,
              lat,
              pointCount: f.properties.point_count,
              isCluster: true,
              properties: {},
            };
          }
          return {
            id: `point-${f.properties.id}`,
            clusterId: -1,
            lng,
            lat,
            pointCount: 1,
            isCluster: false,
            properties: f.properties,
          };
        });

        setClusters(items);
        setExpandedClusterId(null);
      } catch {
        // ignore
      }
    },
    [],
  );

  // ─── 监听地图事件：仅 zoom 变化时重新聚合 ───
  useEffect(() => {
    if (!scene) return;
    const mapsService = (scene as any).mapService;

    const doInit = () => {
      requestAnimationFrame(() => {
        const index = indexRef.current;
        if (index && (scene as any).loaded) {
          queryClusters(index, scene);
        }
      });
    };

    if ((scene as any).loaded) {
      doInit();
    } else {
      scene.once('loaded', doInit);
    }

    // 地图相机变化时检查 zoom 是否改变
    const onCameraChange = () => {
      const index = indexRef.current;
      if (index) queryClusters(index, scene);
    };

    // camerachange / viewchange 是 L7 核心地图变化事件
    // queryClusters 内部会比较 zoom，只在 zoom 变化时才重新聚合
    // 平移时 zoom 不变 → 不触发 setClusters → 不重渲染 Marker
    mapsService?.on?.('camerachange', onCameraChange);
    mapsService?.on?.('viewchange', onCameraChange);

    return () => {
      scene.off('loaded', doInit);
      mapsService?.off?.('camerachange', onCameraChange);
      mapsService?.off?.('viewchange', onCameraChange);
    };
  }, [scene, queryClusters]);

  // ─── 点击聚合 → 缩放展开 ───
  const handleClusterClick = useCallback(
    (item: ClusterItem) => {
      if (!scene || !item.isCluster) return;
      onClusterClick?.(item);

      try {
        const index = indexRef.current;
        const maxZoom = 20;
        const currentZoom = scene.getZoom();

        // 最大级别：展开为 spiderfier
        if (currentZoom >= maxZoom - 0.5) {
          setExpandedClusterId((prev) => (prev === item.id ? null : item.id));
          return;
        }

        if (index) {
          // 使用 supercluster 获取子叶点边界，fitBounds 展开聚合
          const leaves = index.getLeaves(item.clusterId, Infinity);
          if (leaves.length > 0) {
            const coords = leaves.map((l) => l.geometry.coordinates);
            const lngs = coords.map((c) => c[0]);
            const lats = coords.map((c) => c[1]);
            const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)];
            const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)];
            scene.fitBounds([sw, ne], {
              padding: [40, 40, 40, 40] as [number, number, number, number],
              duration: animationDuration,
            });
          }
        }
      } catch {
        // ignore
      }
    },
    [scene, onClusterClick, animationDuration],
  );

  // ─── Spiderfier 展开计算 ───
  const spiderItems = useMemo(() => {
    if (!scene || !expandedClusterId || !indexRef.current) return [];
    const cluster = clusters.find((c) => c.id === expandedClusterId && c.isCluster);
    if (!cluster) return [];

    try {
      const leaves = indexRef.current!.getLeaves(cluster.clusterId, Infinity);
      const mapsService = (scene as any).mapService;
      if (!mapsService) return [];

      const centerPixel = mapsService.lngLatToContainer([cluster.lng, cluster.lat]);
      if (!centerPixel) return [];

      const n = leaves.length;
      const radius = Math.max(24, Math.min(72, 18 + n * 2));

      return leaves.map((leaf: any, i: number) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const px = centerPixel.x + Math.cos(angle) * radius;
        const py = centerPixel.y + Math.sin(angle) * radius;
        const ll = mapsService.containerToLngLat([px, py]);
        return {
          id: `spider-${cluster.id}-${leaf.properties?.id ?? i}`,
          lng: ll.lng,
          lat: ll.lat,
          point: {
            id: String(leaf.properties?.id ?? i),
            lng: leaf.geometry.coordinates[0],
            lat: leaf.geometry.coordinates[1],
            properties: leaf.properties ?? {},
          },
        };
      });
    } catch {
      return [];
    }
  }, [scene, expandedClusterId, clusters]);

  const spiderCenter = useMemo(() => {
    if (!expandedClusterId) return null;
    return clusters.find((c) => c.id === expandedClusterId && c.isCluster) ?? null;
  }, [expandedClusterId, clusters]);

  return (
    <>
      {/* Spiderfier 连接线 */}
      {expandedClusterId &&
        spiderCenter &&
        spiderItems.map((s) => (
          <Marker
            key={`line-${s.id}`}
            longitude={s.lng}
            latitude={s.lat}
            anchor="center"
            content={
              <SpiderLine
                centerLng={spiderCenter.lng}
                centerLat={spiderCenter.lat}
                lineLng={s.lng}
                lineLat={s.lat}
              />
            }
          />
        ))}

      {/* 聚合点和单点 */}
      {clusters.map((item) => {
        if (!item.isCluster) {
          // ── 单点 ──
          return (
            <Marker
              key={item.id}
              longitude={item.lng}
              latitude={item.lat}
              anchor="center"
              content={
                <div
                  title={String(item.properties?.name ?? '单点')}
                  onClick={() =>
                    onPointClick?.({
                      id: String(item.properties?.id ?? ''),
                      lng: item.lng,
                      lat: item.lat,
                      properties: item.properties,
                    })
                  }
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 9999,
                    background: '#2563eb',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 10px rgba(37,99,235,.5), 0 0 0 3px rgba(37,99,235,.15)',
                    // 只对视觉交互属性加 transition，不包含定位 transform
                    transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                  }}
                />
              }
            />
          );
        }

        // ── 聚合点 ──
        const count = item.pointCount;
        const visual = getClusterVisual(count);
        const isHovered = hoveredClusterId === item.id;

        return (
          <Marker
            key={item.id}
            longitude={item.lng}
            latitude={item.lat}
            anchor="center"
            content={
              <div
                title={`包含 ${count} 个要素`}
                onClick={() => handleClusterClick(item)}
                onMouseEnter={() => setHoveredClusterId(item.id)}
                onMouseLeave={() =>
                  setHoveredClusterId((prev) => (prev === item.id ? null : prev))
                }
                style={{
                  width: visual.size,
                  height: visual.size,
                  borderRadius: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: visual.fontWeight,
                  fontSize: visual.fontSize,
                  background: visual.background,
                  border: visual.border,
                  boxShadow: visual.shadow,
                  position: 'relative',
                  cursor: 'pointer',
                  // 只对视觉交互属性加 transition，不包含定位 transform
                  // 定位 transform 由 Marker 组件通过 translate3d 控制，不需要动画
                  transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {visual.pulse && (
                  <span
                    style={{
                      position: 'absolute',
                      inset: -6,
                      borderRadius: 9999,
                      background: 'rgba(37,99,235,0.25)',
                      animation: 'aimapkit-cluster-pulse 1.6s ease-out infinite',
                    }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>{count}</span>
              </div>
            }
          />
        );
      })}

      {/* Spiderfier 子点 */}
      {spiderItems.map((s) => (
        <Marker
          key={s.id}
          longitude={s.lng}
          latitude={s.lat}
          anchor="center"
          content={
            <div
              title={String(s.point.properties?.name ?? s.point.id)}
              onClick={() => onPointClick?.(s.point)}
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                background: '#fff',
                border: '2px solid #2563eb',
                boxShadow: '0 2px 8px rgba(0,0,0,.2)',
                cursor: 'pointer',
              }}
            />
          }
        />
      ))}
    </>
  );
}

/**
 * Spiderfier 连接线 — 使用 ref + 直接 DOM 操作更新位置
 * 避免 setState 重渲染，平移时直接操作 style
 */
function SpiderLine({
  centerLng,
  centerLat,
  lineLng,
  lineLat,
}: {
  centerLng: number;
  centerLat: number;
  lineLng: number;
  lineLat: number;
}) {
  const scene = useScene();
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scene) return;
    const mapsService = (scene as any).mapService;
    if (!mapsService) return;

    const update = () => {
      const el = lineRef.current;
      if (!el) return;
      try {
        const start = mapsService.lngLatToContainer([centerLng, centerLat]);
        const end = mapsService.lngLatToContainer([lineLng, lineLat]);
        if (!start || !end) return;

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        // 直接操作 DOM，避免 setState → React 重渲染
        el.style.width = `${length}px`;
        el.style.transform = `rotate(${angle}deg)`;
      } catch {
        // ignore
      }
    };

    update();

    // 监听地图事件，直接更新 DOM
    const registerEvent = (target: any, event: string, handler: () => void) => {
      try { target?.on?.(event, handler); } catch { /* ignore */ }
    };
    const unregisterEvent = (target: any, event: string, handler: () => void) => {
      try { target?.off?.(event, handler); } catch { /* ignore */ }
    };

    registerEvent(mapsService, 'camerachange', update);
    registerEvent(mapsService, 'viewchange', update);

    return () => {
      unregisterEvent(mapsService, 'camerachange', update);
      unregisterEvent(mapsService, 'viewchange', update);
    };
  }, [scene, centerLng, centerLat, lineLng, lineLat]);

  return (
    <div
      ref={lineRef}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        height: 1,
        background: 'rgba(195, 198, 215, 0.5)',
        transformOrigin: '0 50%',
        pointerEvents: 'none',
      }}
    />
  );
}

/**
 * 获取聚合点视觉样式
 */
function getClusterVisual(count: number) {
  if (count >= 1000) {
    return {
      size: 48,
      fontSize: 14,
      fontWeight: 700,
      background: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
      border: '2px solid rgba(255,255,255,0.55)',
      shadow: '0 10px 24px rgba(37,99,235,.45)',
      pulse: true,
    };
  }
  if (count >= 100) {
    return {
      size: 40,
      fontSize: 13,
      fontWeight: 700,
      background: 'rgba(37,99,235,0.30)',
      border: '2px solid rgba(255,255,255,0.5)',
      shadow: '0 6px 16px rgba(37,99,235,.25)',
      pulse: false,
    };
  }
  return {
    size: 32,
    fontSize: 12,
    fontWeight: 600,
    background: 'radial-gradient(circle, #2563eb 60%, rgba(37,99,235,0.20) 61%)',
    border: '1px solid rgba(255,255,255,0.55)',
    shadow: '0 4px 12px rgba(37,99,235,.2)',
    pulse: false,
  };
}

function normalizePoints(
  source: unknown,
  sourceType?: string,
  sourceConfig?: LayerSchema['sourceConfig'],
): ClusterPoint[] {
  if (!source) return [];

  if (sourceType === 'geojson' && typeof source === 'object' && source !== null) {
    const geo = source as Record<string, unknown>;
    const features = Array.isArray(geo.features) ? geo.features : [];
    return features
      .map((f, idx) => {
        const ff = f as any;
        const coords = ff?.geometry?.coordinates;
        if (!Array.isArray(coords) || coords.length < 2) return null;
        return {
          id: String(ff?.properties?.id ?? ff?.properties?.Id ?? idx),
          lng: Number(coords[0]),
          lat: Number(coords[1]),
          properties: (ff?.properties ?? {}) as Record<string, unknown>,
        } as ClusterPoint;
      })
      .filter(Boolean) as ClusterPoint[];
  }

  if (Array.isArray(source)) {
    const xKey = sourceConfig?.x ?? 'lng';
    const yKey = sourceConfig?.y ?? 'lat';

    return source
      .map((item, idx) => {
        const obj = item as Record<string, unknown>;
        const lng = Number(obj[xKey]);
        const lat = Number(obj[yKey]);
        if (Number.isNaN(lng) || Number.isNaN(lat)) return null;
        return {
          id: String(obj.id ?? idx),
          lng,
          lat,
          properties: obj,
        } as ClusterPoint;
      })
      .filter(Boolean) as ClusterPoint[];
  }

  return [];
}

export default MarkerClusterLayer;